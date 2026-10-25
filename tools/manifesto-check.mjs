// Focused visual/interaction check; use an isolated Chromium on port 9449.
import { mkdir, writeFile } from 'node:fs/promises';
const out = new URL('../docs/design-concepts/living-network/manifesto-rework/', import.meta.url);
await mkdir(out, { recursive: true });
const tabs = await (await fetch(`http://127.0.0.1:${process.env.AXON_QA_CDP_PORT || 9449}/json`)).json();
const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let serial = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (!pending.has(message.id)) return;
  const { resolve, reject, timer } = pending.get(message.id);
  clearTimeout(timer); pending.delete(message.id);
  if (message.error) reject(new Error(JSON.stringify(message.error)));
  else resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++serial;
  const timer = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 15000);
  pending.set(id, { resolve, reject, timer });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const checks = [];
function check(name, pass) { checks.push({ name, pass: Boolean(pass) }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); }
async function capture(name) {
  const rect = await evaluate(`(()=>{const r=document.querySelector('.manifesto-stage').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth-7,height:r.height,scale:1}})()`);
  const result = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: rect });
  await writeFile(new URL(name, out), Buffer.from(result.data, 'base64'));
}
try {
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1672, height: 1020, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: process.env.AXON_QA_URL || 'http://127.0.0.1:4174/' });
  await sleep(1300);
  await evaluate('document.fonts.ready');
  await evaluate('scrollTo({top:document.querySelector("#purpose").offsetTop-72,behavior:"instant"})');
  await sleep(500);
  check('Five authored lines remain live text', await evaluate(`document.querySelectorAll('.manifesto-line').length===5 && document.querySelector('#manifesto-title').textContent.includes('Technology should bring')`));
  check('Artwork loads and contains no baked-in copy', await evaluate(`document.querySelector('.manifesto-signal img').complete && document.querySelector('.manifesto-signal img').naturalWidth===1672`));
  const start = await evaluate(`document.querySelectorAll('.manifesto-copy .is-lit').length`);
  check('Opening stage shows only Technology', await evaluate(`[...document.querySelectorAll('.manifesto-copy .word')].filter(w=>Number(getComputedStyle(w).opacity)>.01).map(w=>w.textContent).join(' ')==='Technology'`));
  const stageScroll = await evaluate(`document.querySelector('#purpose').offsetHeight-(innerHeight-72)`);
  const traceStart = await evaluate(`Number(getComputedStyle(document.querySelector('#purpose')).getPropertyValue('--trace-progress'))`);
  check('Nerve artwork uses the scroll reveal mask', await evaluate(`getComputedStyle(document.querySelector('.manifesto-signal img')).maskImage.includes('linear-gradient')`));
  await capture('desktop.png');
  await evaluate(`scrollBy({top:${stageScroll*.5},behavior:"instant"})`); await sleep(250);
  check('Scene stays pinned during the reveal',await evaluate(`Math.abs(document.querySelector('.manifesto-stage').getBoundingClientRect().top-72)<1`));
  check('Scroll advances word reveal', await evaluate(`document.querySelectorAll('.manifesto-copy .is-lit').length>${start}`));
  const traceEnd = await evaluate(`Number(getComputedStyle(document.querySelector('#purpose')).getPropertyValue('--trace-progress'))`);
  check('Nerve trace advances with the text', traceEnd > traceStart);
  await capture('desktop-middle.png');
  check('Scroll draws the together underline', await evaluate(`Number(getComputedStyle(document.querySelector('#purpose')).getPropertyValue('--underline-progress'))>.9`));
  await evaluate(`scrollBy({top:${stageScroll*.45},behavior:"instant"})`); await sleep(250);
  check('All words appear before the scene releases', await evaluate(`[...document.querySelectorAll('.manifesto-copy .word')].every(w=>Number(getComputedStyle(w).opacity)===1) && Math.abs(document.querySelector('.manifesto-stage').getBoundingClientRect().top-72)<1`));
  await capture('desktop-complete.png');
  await evaluate(`scrollBy({top:${stageScroll*.05+150},behavior:"instant"})`); await sleep(250);
  check('Page continues after the staged sequence', await evaluate(`document.querySelector('.manifesto-stage').getBoundingClientRect().top<0`));
  await evaluate('scrollTo({top:document.querySelector("#purpose").offsetTop-72,behavior:"instant"})'); await sleep(250);
  check('Scrolling backward reverses nerves and words', await evaluate(`Number(getComputedStyle(document.querySelector('#purpose')).getPropertyValue('--trace-progress')) < ${traceEnd} && document.querySelectorAll('.manifesto-copy .is-lit').length===${start}`));
  const still = await evaluate(`document.querySelector('#manifesto-signal').toDataURL()`);
  await sleep(350);
  check('Trace holds still without scroll input', (await evaluate(`document.querySelector('#manifesto-signal').toDataURL()`))===still);
  await evaluate('document.querySelector("#motion-toggle").click()'); await sleep(100);
  check('Motion off reveals every word and stops parallax', await evaluate(`document.querySelectorAll('.manifesto-copy .is-lit').length===document.querySelectorAll('.manifesto-copy .word').length && getComputedStyle(document.querySelector('.manifesto-signal')).transform==='matrix(1, 0, 0, 1, 0, 0)'`));
  check('Motion off shows the full nerve trace', await evaluate(`getComputedStyle(document.querySelector('#purpose')).getPropertyValue('--trace-progress').trim()==='1.0000'`));
  for (const width of [320,390,768,1366,2560]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width<761 });
    await sleep(160);
    check(`No horizontal overflow at ${width}px`, await evaluate('document.documentElement.scrollWidth<=innerWidth'));
    if(width===390) {
      await evaluate('document.querySelector("#motion-toggle").click()');
      await evaluate('document.querySelector("#purpose").scrollIntoView({block:"start",behavior:"instant"})');
      await sleep(150);
      check('Mobile starts with only Technology',await evaluate(`[...document.querySelectorAll('.manifesto-copy .word')].filter(w=>Number(getComputedStyle(w).opacity)>.01).map(w=>w.textContent).join(' ')==='Technology'`));
      await evaluate('scrollBy({top:1000,behavior:"instant"})'); await sleep(150);
      check('Mobile scene pins while words appear',await evaluate(`Math.abs(document.querySelector('.manifesto-stage').getBoundingClientRect().top-68)<1 && document.querySelectorAll('.manifesto-copy .is-lit').length>1`));
      const result=await call('Page.captureScreenshot',{format:'png'});
      await writeFile(new URL('mobile.png',out),Buffer.from(result.data,'base64'));
    }
  }
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await evaluate('localStorage.removeItem("axon-motion")');
  await call('Page.reload'); await sleep(1000);
  check('Reduced motion renders the readable final state', await evaluate(`document.body.classList.contains('motion-paused') && document.querySelectorAll('.manifesto-copy .is-lit').length===document.querySelectorAll('.manifesto-copy .word').length`));
  check('Reduced motion removes the sticky scroll runway',await evaluate(`getComputedStyle(document.querySelector('.manifesto-stage')).position!=='sticky' && document.querySelector('#purpose').offsetHeight<innerHeight*2`));
  await writeFile(new URL('checks.json', out), JSON.stringify(checks,null,2));
  if(checks.some(check=>!check.pass))process.exitCode=1;
} finally { socket.send(JSON.stringify({ id: ++serial, method: 'Browser.close' })); socket.close(); }
