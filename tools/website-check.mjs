// Browser integration and layout checks. Start a local Chromium with
// --headless=new --remote-debugging-port=9449 and serve the repo on port 4173.
// No packages are needed. Run: node tools/website-check.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.AXON_QA_URL || 'http://127.0.0.1:4173/';
const out = new URL(process.env.AXON_QA_OUTPUT || '../docs/design-concepts/living-network/implementation/', import.meta.url);
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
  await call('Page.enable'); await call('Runtime.enable');
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `window.__axonQA={frames:0};const originalRAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>originalRAF(t=>{window.__axonQA.frames++;fn(t)});` });
  await viewport(Number(process.env.AXON_QA_WIDTH || 1440), Number(process.env.AXON_QA_HEIGHT || 900));
  await load();
  await evaluate('localStorage.removeItem("axon-motion")');
  await load();
  check('Desktop page, local fonts and selected identity load', await evaluate('document.fonts.status === "loaded" && document.querySelector(".brand img").naturalWidth > 0 && getComputedStyle(document.querySelector(".brand span")).fontWeight === "800"'));
  check('Desktop hero artwork and animation canvas load', await evaluate('(() => {const image=document.querySelector(".hero-art"),c=document.querySelector("#sculpture");return image.complete && image.naturalWidth>0 && c.width>0 && c.height>0})()'));
  const activeFrames = await evaluate('window.__axonQA.frames'); await sleep(450);
  check('Animation scheduler runs when visible', (await evaluate('window.__axonQA.frames')) > activeFrames + 3);
  await evaluate('document.querySelector("#motion-toggle").click()'); await sleep(100);
  const pausedFrames = await evaluate('window.__axonQA.frames'); await sleep(400);
  check('Motion toggle stops the animation scheduler', await evaluate(`document.body.classList.contains('motion-paused') && window.__axonQA.frames <= ${pausedFrames + 1}`));
  await screenshot('desktop-hero.png', '#home');
  check('All in-page links point to real targets', await evaluate('[...document.links].filter(a=>a.hash && a.origin===location.origin).every(a=>document.getElementById(a.hash.slice(1)))'));
  await evaluate('document.querySelector("#motion-toggle").click();document.querySelector(".assembly").scrollIntoView({behavior:"instant",block:"start"})');
  await sleep(250);
  check('Assembly uses native vertical flow with no chapter timeline', await evaluate('getComputedStyle(document.querySelector(".assembly-sticky")).position==="relative"&&!document.querySelector(".assembly-footer")&&!document.querySelector("[data-chapter]")'));
  await screenshot('desktop-assembly.png');
  await screenshot('desktop-manifesto.png', '#purpose');
  check('Manifesto preserves all five authored lines', await evaluate('document.querySelectorAll(".manifesto-line").length === 5 && document.querySelector(".manifesto-line").textContent === "Technology should bring"'));
  check('Manifesto chapter remains clear of fixed navigation', await evaluate('document.querySelector("#purpose .section-meta").getBoundingClientRect().top > document.querySelector("#site-header").getBoundingClientRect().bottom'));
  check('Assembly has readable labelled navigation', await evaluate('[...document.querySelectorAll("[data-workflow]")].every(b=>b.querySelector("span")?.textContent.trim()) && document.querySelector(".assembly-browser .app-rail").getBoundingClientRect().width > 100'));
  check('All four signal scenes use sized canvases', await evaluate('document.querySelectorAll("main canvas").length === 4 && [...document.querySelectorAll("main canvas")].every(c=>c.width>0&&c.height>0)'));
  await evaluate('document.querySelector("#motion-toggle").click()');
  check('Team remains discreet', await evaluate('!/(Jerico|Aidan|Gerald|Rhandie|Deputy Engineer|\bCEO\b|\bCTO\b)/i.test(document.querySelector("#company").textContent)'));
  check('People workflow and branch filter update the real table', await evaluate('document.querySelector("#workflow-people").click();document.querySelector("#branch-filter").value="b";document.querySelector("#branch-filter").dispatchEvent(new Event("change"));document.querySelector("#workflow-panel h3").textContent.includes("People") && document.querySelectorAll("#workflow-panel thead th").length===2 && document.querySelector("#workflow-panel").textContent.includes("Branch B")'));
  check('Workflow keyboard navigation switches to reports', await evaluate('document.querySelector("#workflow-people").dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowDown",bubbles:true}));document.querySelector("#workflow-reports").getAttribute("aria-selected")==="true"'));
  check('All seven modules switch with exactly one active tab', await evaluate('(() => {for(const button of document.querySelectorAll("[data-module]")){button.click();if(document.querySelectorAll("[data-module][aria-selected=true]").length!==1||document.querySelector("#module-panel").getAttribute("aria-labelledby")!==button.id)return false}return true})()'));
  check('Accounting safe scope is visible', await evaluate('document.querySelector("#module-accounting").click();/does not replace BIR invoicing/.test(document.querySelector("#module-panel").textContent)'));
  check('Module keyboard navigation wraps to Core', await evaluate('document.querySelector("#module-scheduling").dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowDown",bubbles:true}));document.querySelector("#module-core").getAttribute("aria-selected")==="true"'));
  check('Inventory example survives switching away and back', await evaluate('document.querySelector("#module-inventory").click();document.querySelector("#transfer-form").requestSubmit();document.querySelector("#transfer-result").textContent.includes("20 units")'));
  check('Transfer review rejects the same origin and destination', await evaluate('document.querySelector("#transfer-to").value="Branch A";document.querySelector("#transfer-form").requestSubmit();document.querySelector("#transfer-result").textContent.includes("two different branches")'));
  await evaluate('document.querySelector("#module-inventory").click()');
  check('Module window shortcuts switch real module details', await evaluate('document.querySelectorAll("[data-module-shortcut]").length===3 && (()=>{document.querySelectorAll("[data-module-shortcut]")[1].click();const switched=document.querySelector("#module-hr").getAttribute("aria-selected")==="true";document.querySelector("#module-inventory").click();return switched})()'));
  await screenshot('desktop-modules.png', '#modules');
  await evaluate('document.querySelector("#motion-toggle").click()');
  await sleep(250);
  const offscreenFrames = await evaluate('window.__axonQA.frames'); await sleep(300);
  check('Canvas scheduler sleeps outside the visual sections', (await evaluate('window.__axonQA.frames')) <= offscreenFrames + 1);
  await evaluate('document.querySelector("#motion-toggle").click()');
  await screenshot('desktop-offers.png', '#offers');
  check('All three offer titles share a column', await evaluate('(()=>{const left=[...document.querySelectorAll(".offer-copy h3")].map(e=>e.getBoundingClientRect().left);return Math.max(...left)-Math.min(...left)<2})()'));
  await screenshot('desktop-delivery.png', '#how-we-work');
  await screenshot('desktop-company.png', '#company');
  check('Command menu opens with Ctrl+K', await evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"k",ctrlKey:true,bubbles:true}));document.querySelector("#command-dialog").open'));
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  check('Native Escape closes the command menu', await evaluate('!document.querySelector("#command-dialog").open'));
  check('Contact requires valid fields', await evaluate('!document.querySelector("#contact-form").checkValidity()'));
  check('Prepared inquiry is literal text and never claims delivery', await evaluate('(() => {const f=document.querySelector("#contact-form");f.elements.name.value="Website QA";f.elements.email.value="qa@example.com";f.elements.company.value="Sample company";f.elements.message.value="Need Inventory for three branches. <script>literal text</script>";f.requestSubmit();return document.querySelector("#inquiry-dialog").open && document.querySelector("#inquiry-preview").value.includes("<script>literal text</script>") && document.querySelector("#inquiry-dialog").textContent.includes("has not been sent")})()'));
  await evaluate('document.querySelector("#inquiry-dialog").close();document.querySelector("#contact-form").reset()');
  await screenshot('desktop-contact.png', '#contact');
  check('Desktop closing headline retains its three-line composition', await evaluate('Boolean(document.querySelector("#contact-title em br")) && getComputedStyle(document.querySelector("#contact-title em br")).display!=="none"'));
  const widths = [];
  for (const width of [320, 390, 768, 1366]) {
    await viewport(width, width < 768 ? 844 : 900, width < 768);
    await sleep(180);
    const overflow = await evaluate('document.documentElement.scrollWidth > innerWidth');
    widths.push({ width, overflow });
    check(`No horizontal overflow at ${width}px`, !overflow);
  }
  await viewport(390, 844, true);
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await evaluate('localStorage.removeItem("axon-motion")');
  await load();
  check('Reduced motion starts with static, readable content', await evaluate('document.body.classList.contains("motion-paused") && [...document.querySelectorAll(".word")].every(w=>w.classList.contains("is-lit"))'));
  check('Mobile navigation opens and closes after selection', await evaluate('document.querySelector(".menu-toggle").click();const opened=!document.querySelector("#mobile-nav").hidden;document.querySelector("#mobile-nav a").click();opened && document.querySelector("#mobile-nav").hidden'));
  await screenshot('mobile-hero.png', '#home');
  await screenshot('mobile-modules.png', '#modules');
  await screenshot('mobile-contact.png', '#contact');
  check('No broken local images', await evaluate('[...document.images].every(img=>!img.complete||img.naturalWidth>0)'));
  check('No uncaught application errors', runtimeErrors.length === 0);
  const report = { origin, checks, widths, runtimeErrors, screenshots: ['desktop-hero.png','desktop-assembly.png','desktop-manifesto.png','desktop-modules.png','desktop-offers.png','desktop-delivery.png','desktop-company.png','desktop-contact.png','mobile-hero.png','mobile-modules.png','mobile-contact.png'] };
  await writeFile(new URL('checks.json', out), JSON.stringify(report, null, 2) + '\n');
  console.log(`${checks.filter(c=>c.pass).length}/${checks.length} checks passed. Screenshots saved to ${out.pathname}`);
  process.exitCode = checks.every(c => c.pass) ? 0 : 1;
} finally {
  await call('Browser.close').catch(() => {});
  socket.close();
}
