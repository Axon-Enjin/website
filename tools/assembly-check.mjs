// Assembly morph and full-bleed layout checks. Start a local Chromium with
// --headless=new --remote-debugging-port=9449 and serve the repo on port 4173.
// No packages are needed. Run: node tools/assembly-check.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.AXON_QA_URL || 'http://127.0.0.1:4173/#product';
const out = new URL(process.env.AXON_QA_OUTPUT || '../.impeccable/review/assembly/', import.meta.url);
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
  await call('Page.navigate', { url: origin });
  for (let i = 0; i < 70; i++) {
    if (await evaluate('document.readyState === "complete" && Boolean(document.querySelector(".word"))')) break;
    await sleep(100);
  }
  await evaluate('document.fonts.ready.then(() => true)');
  await sleep(350);
}
async function screenshot(name, selector) {
  if (selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`); await sleep(200); }
  const capture = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(new URL(name, out), Buffer.from(capture.data, 'base64'));
}
try {
 await call('Page.enable');await call('Runtime.enable');
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`window.__assemblyInsets=[];new MutationObserver(records=>{for(const record of records){if(record.target.id==='branch-app'){const p=record.target.style.getPropertyValue('--assembly-inset');if(p&&window.__assemblyInsets.at(-1)!==p)window.__assemblyInsets.push(p)}}}).observe(document,{subtree:true,attributes:true,attributeFilter:['style']});`});
 await viewport(1672,941);await load();await evaluate('localStorage.removeItem("axon-motion")');await load();const y=await evaluate('scrollY');await sleep(1700);
 check('Automatic morph completes on section entry',await evaluate('document.querySelector(".assembly").getAttribute("data-assembly-state")==="operate"'));
 check('Actual shape morph runs without scrolling the page',await evaluate(`window.__assemblyInsets.length>4&&Math.abs(scrollY-${y})<1`));
 check('Normal vertical section replaces sticky scroll',await evaluate('getComputedStyle(document.querySelector(".assembly-sticky")).position==="relative"&&document.querySelector(".assembly").offsetHeight<innerHeight+2'));
 check('Canvas floats outside product and content containers',await evaluate('document.querySelector("#assembly-particles").parentElement.classList.contains("assembly-sticky")&&!document.querySelector(".assembly-scene canvas")'));
 check('Nerve background spans viewport edges',await evaluate('(()=>{const r=document.querySelector(".assembly-art").getBoundingClientRect();return r.left<1&&r.right>=document.documentElement.clientWidth-1&&document.querySelector(".assembly-art").naturalWidth>0})()'));
 check('Signal label and chapter controls are removed',await evaluate('!document.querySelector(".assembly-footer")&&!document.querySelector("[data-chapter]")'));
 await screenshot('desktop.png');
 check('Section composition fits viewport',await evaluate('(()=>{const h=document.querySelector(".assembly-heading").getBoundingClientRect(),b=document.querySelector("#branch-app").getBoundingClientRect();return h.top>=72&&b.bottom<innerHeight-30})()'));
 await load();await screenshot('desktop-morph.png');await sleep(1700);
 await evaluate('document.querySelector("#workflow-people").click();document.querySelector("#branch-filter").value="b";document.querySelector("#branch-filter").dispatchEvent(new Event("change"))');
 check('Live tabs and branch filter work',await evaluate('document.querySelector("#workflow-panel h3").textContent.includes("People")&&document.querySelectorAll("#workflow-panel thead th").length===2'));
 await evaluate('document.querySelector("#workflow-inventory").click();document.querySelector("#branch-filter").value="all";document.querySelector("#branch-filter").dispatchEvent(new Event("change"))');
 await viewport(1440,900);await evaluate('document.querySelector(".assembly").scrollIntoView({behavior:"instant",block:"start"})');await sleep(180);await screenshot('desktop-1440.png');
 await viewport(390,844,true);await evaluate('document.querySelector(".assembly").scrollIntoView({behavior:"instant",block:"start"})');await sleep(200);await screenshot('mobile.png');
 check('Mobile table fits without horizontal scroll',await evaluate('(()=>{const t=document.querySelector(".assembly .table-scroll");return t.scrollWidth<=t.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth})()'));
 await viewport(320,844,true);await sleep(180);check('Small mobile has no horizontal overflow',await evaluate('document.documentElement.scrollWidth<=innerWidth&&document.querySelector(".assembly .table-scroll").scrollWidth<=document.querySelector(".assembly .table-scroll").clientWidth+1'));
 await load();await evaluate('document.querySelector("#motion-toggle").click()');
 check('Motion off resolves morph into readable interface',await evaluate('document.body.classList.contains("motion-paused")&&getComputedStyle(document.querySelector(".assembly-browser .app-body")).opacity==="1"'));
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await evaluate('localStorage.removeItem("axon-motion")');await load();
 check('Reduced motion directly shows final assembly',await evaluate('document.querySelector(".assembly").getAttribute("data-assembly-state")==="operate"&&getComputedStyle(document.querySelector(".assembly-browser .app-body")).opacity==="1"'));
 check('No uncaught errors',runtimeErrors.length===0);
 await writeFile(new URL('assembly-checks.json',out),JSON.stringify({checks,runtimeErrors},null,2));console.log(`${checks.filter(c=>c.pass).length}/${checks.length} passed`);process.exitCode=checks.every(c=>c.pass)?0:1;
}finally{await call('Browser.close').catch(()=>{});socket.close();}