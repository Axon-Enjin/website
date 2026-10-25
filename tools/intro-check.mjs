// Intro lifecycle and layout checks. Start a local Chromium with
// --headless=new --remote-debugging-port=9449 and serve the repo on port 4173.
// No packages are needed. Run: node tools/intro-check.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.AXON_QA_URL || 'http://127.0.0.1:4173/';
const out = new URL(process.env.AXON_QA_OUTPUT || '../.impeccable/review/intro-live/', import.meta.url);
await mkdir(out, { recursive: true });
let tabs;
for (let i = 0; i < 30; i++) {
  try { tabs = await (await fetch('http://127.0.0.1:9449/json')).json(); break; }
  catch (error) { if (i === 29) throw error; await new Promise(resolve => setTimeout(resolve, 100)); }
}
const tab = tabs.find(t => t.type === 'page');
if (!tab) throw new Error('The isolated QA browser has no page.');
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let serial = 0;
const pending = new Map();
const runtimeErrors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description || ''));
  if (!pending.has(message.id)) return;
  const { resolve, reject, timeout } = pending.get(message.id);
  clearTimeout(timeout); pending.delete(message.id);
  if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
});
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve, reject, timeout }); socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const checks = [];
function check(name, result) { checks.push({ name, pass: Boolean(result) }); console.log(`${result ? 'PASS' : 'FAIL'} ${name}`); }
async function viewport(width, height, mobile = false) { await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }); }
async function load() {
  await call('Page.navigate', { url: origin + '?intro=1' });
  for (let i = 0; i < 70; i++) {
    if (await evaluate('Boolean(document.querySelector(".word"))')) break;
    await sleep(100);
  }
  await evaluate('document.fonts.ready.then(() => true)');
}
async function screenshot(name, selector) {
  if (selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`); await sleep(200); }
  const capture = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(new URL(name, out), Buffer.from(capture.data, 'base64'));
}
const complete = `!document.documentElement.classList.contains('intro-pending') && !document.querySelector('.hero-intro-art') && !document.querySelector('.intro-skip')`;
async function fresh() { await evaluate('localStorage.removeItem("axon-motion");sessionStorage.removeItem("axon-intro-seen")'); await load(); }
try {
 await call('Page.enable'); await call('Runtime.enable');
 await call('Page.addScriptToEvaluateOnNewDocument', {source:`window.__introFrames=0;const original=requestAnimationFrame;window.requestAnimationFrame=fn=>original(t=>{window.__introFrames++;fn(t)});window.__introStarted=0;window.__introEnded=0;new MutationObserver(()=>{const r=document.documentElement;if(r?.classList.contains('intro-active')&&!window.__introStarted)window.__introStarted=performance.now();if(window.__introStarted&&!r.classList.contains('intro-pending')&&!window.__introEnded)window.__introEnded=performance.now()}).observe(document,{subtree:true,attributes:true,attributeFilter:['class']});`});
 await viewport(1672,941); await load(); await fresh();
 check('First visit starts intro', await evaluate('document.querySelector("#home").dataset.introState==="playing"&&document.documentElement.classList.contains("intro-active")'));
 await screenshot('desktop-trace.png'); await sleep(600);
 await screenshot('desktop-branch.png'); await sleep(650);
 await screenshot('desktop-handoff.png'); await sleep(1500);
 check('Intro completes and removes temporary DOM', await evaluate(complete));
 check('Desktop timeline runs for the authored duration', await evaluate('window.__introEnded-window.__introStarted>=2600&&window.__introEnded-window.__introStarted<4000'));
 check('Intro leaves no persistent inline styles',await evaluate('![...document.documentElement.style].some(k=>k.startsWith("--intro-"))'));
 await screenshot('desktop.png');
 check('Selected identity preserved',await evaluate('getComputedStyle(document.querySelector(".brand span")).fontWeight==="800"&&document.querySelector(".brand img").getAttribute("src")==="assets/axon-mark.svg"'));
 await call('Page.navigate',{url:origin}); await sleep(500);
 check('Same-session reload skips intro',await evaluate(complete+' && !document.querySelector("#home").dataset.introState'));
 await fresh(); await evaluate('document.querySelector(".intro-skip").click()'); check('Skip completes immediately',await evaluate(complete));
 await fresh(); await evaluate('dispatchEvent(new WheelEvent("wheel",{deltaY:100}))'); check('Wheel completes without a scroll lock',await evaluate(complete+' && getComputedStyle(document.documentElement).overflow!=="hidden"'));
 await fresh(); await evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Tab"}))'); check('Keyboard navigation completes intro',await evaluate(complete));
 await fresh(); await evaluate('document.querySelector("#motion-toggle").click()'); check('Motion off completes intro',await evaluate(complete+' && document.body.classList.contains("motion-paused")'));
 await load();check('Saved Motion off bypasses forced replay',await evaluate(complete));
 await evaluate('localStorage.removeItem("axon-motion")');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load();
 check('Reduced motion bypasses forced replay',await evaluate(complete+' && document.body.classList.contains("motion-paused")'));
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await viewport(390,844,true);await fresh();
 check('Mobile intro uses the image crop',await evaluate('(()=>{const a=document.querySelector(".hero-art").getBoundingClientRect(),b=document.querySelector(".hero-intro-art").getBoundingClientRect();return Math.abs(a.top-b.top)<1&&Math.abs(a.height-b.height)<1&&b.top>document.querySelector("#hero-title").getBoundingClientRect().bottom})()'));
 await screenshot('mobile-branch.png');await sleep(2100);await screenshot('mobile.png');
 check('Mobile completes without horizontal overflow',await evaluate(complete+' && document.documentElement.scrollWidth<=innerWidth'));
 await viewport(1440,900);await fresh();await evaluate('scrollTo(0,innerHeight)');await sleep(100);check('Scroll preserves destination',await evaluate(complete+' && scrollY>0'));
 await call('Page.navigate',{url:origin+'#modules'});await sleep(500);check('Deep links skip intro',await evaluate(complete));
 await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Fetch.enable',{patterns:[{urlPattern:'*hero-network.png*',requestStage:'Request'}]});
 const oldOrigin=await evaluate('performance.timeOrigin');
 const slowNavigation=call('Page.navigate',{url:origin+'?intro=1'});
 for(let i=0;i<40;i++){if(await evaluate(`performance.timeOrigin!==${oldOrigin}&&!!document.querySelector('.intro-skip')`))break;await sleep(20);}
 check('Slow artwork has immediate skip',await evaluate('document.documentElement.classList.contains("intro-pending")&&!!document.querySelector(".intro-skip")&&!document.querySelector(".hero-art").complete'));
 await writeFile(new URL('loading-skip.json',out),JSON.stringify(await evaluate('({pending:document.documentElement.classList.contains("intro-pending"),skipVisible:!!document.querySelector(".intro-skip")&&getComputedStyle(document.querySelector(".intro-skip")).display!=="none",imageComplete:document.querySelector(".hero-art").complete})'),null,2));
 await evaluate('document.querySelector(".intro-skip")?.click()');
 check('Skip during image loading fails open',await evaluate(complete));
 await call('Fetch.disable');await slowNavigation;await call('Network.setCacheDisabled',{cacheDisabled:false});
 await call('Network.enable');await call('Network.setBlockedURLs',{urls:['*hero-intro.js*']});
 await call('Page.navigate',{url:origin+'?intro=1'});await sleep(1900);check('Failed intro script fails open',await evaluate(complete+' && getComputedStyle(document.querySelector(".hero-title-line")).opacity==="1"'));
 await call('Network.setBlockedURLs',{urls:[]});
 await call('Network.setBlockedURLs',{urls:['*hero-network.png*']});await call('Network.clearBrowserCache');
 await load();await sleep(1700);check('Failed artwork fails open',await evaluate(complete));
 await call('Network.setBlockedURLs',{urls:[]});
 check('No uncaught application errors',runtimeErrors.length===0);
 await writeFile(new URL('checks.json',out),JSON.stringify({checks,runtimeErrors},null,2));
 console.log(`${checks.filter(c=>c.pass).length}/${checks.length} checks passed`);process.exitCode=checks.every(c=>c.pass)?0:1;
} finally {await call('Browser.close').catch(()=>{});socket.close();}
