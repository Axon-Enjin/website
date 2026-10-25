// Fast deterministic checks for the canvas engine's work budget and lifecycle.
// No packages or browser required: node tools/perf-smoke.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/runtime/site.js', import.meta.url), 'utf8');
const queue = new Map(), events = new Map(), elements = new Map(), observers = [];
let nextFrame = 0, pathCount = 0, strokeCount = 0;
const noop = () => {};
function classList() {
  const values = new Set();
  return { add: (...names) => names.forEach(n => values.add(n)), remove: (...names) => names.forEach(n => values.delete(n)), contains: n => values.has(n), toggle(n, force) { const on = force ?? !values.has(n); if (on) values.add(n); else values.delete(n); return on; } };
}
const context = new Proxy({ createRadialGradient: () => ({ addColorStop: noop }), stroke() { strokeCount++; } }, { get: (target, key) => key in target ? target[key] : noop, set: (target, key, value) => (target[key] = value, true) });
function element(name) {
  if (elements.has(name)) return elements.get(name);
  const listeners = new Map(), children = [], attrs = new Map();
  const el = {
    name, textContent: name === '.manifesto-copy' ? 'Technology should bring people together.' : '',
    style: { setProperty: noop }, classList: classList(), offsetHeight: name === '.assembly' ? 1800 : 500,
    width: 0, height: 0, children,
    getBoundingClientRect: () => ({ top: name === '.assembly' ? 900 : 0, left: 0, width: 1440, height: 900 }),
    getContext: () => context, append: (...nodes) => children.push(...nodes),
    setAttribute: (key, value) => attrs.set(key, value), getAttribute: key => attrs.get(key),
    addEventListener: (event, fn) => listeners.set(event, fn),
    click: () => listeners.get('click')?.({ target: el }),
    querySelector: selector => element(`${name} ${selector}`),
    querySelectorAll: selector => selector === '.word' ? children.filter(child => child.className === 'word') : [],
    scrollIntoView: noop
  };
  elements.set(name, el); return el;
}
const body = element('body');
const document = {
  body, hidden: false, documentElement: Object.assign(element('html'), { scrollHeight: 9000 }),
  fonts: { ready: Promise.resolve() },
  getElementById: id => element('#' + id),
  querySelector: element, querySelectorAll: () => [],
  createElement: tag => element(`${tag}-${elements.size}`), createTextNode: text => ({ textContent: text }),
  addEventListener: (event, fn) => events.set(`document:${event}`, fn)
};
const sandbox = {
  console, document, Math, Map, Set, Number, String, Array, Object, AbortController,
  createAxonIntro: () => null,
  innerWidth: 1440, innerHeight: 900, devicePixelRatio: 2,
  navigator: { hardwareConcurrency: 8 }, localStorage: { getItem: () => null, setItem: noop },
  matchMedia: () => ({ matches: false, addEventListener: noop }),
  Path2D: class { constructor() { pathCount++; } moveTo() {} lineTo() {} quadraticCurveTo() {} },
  IntersectionObserver: class { constructor(fn) { this.fn = fn; this.targets = []; observers.push(this); } observe(target) { this.targets.push(target); } unobserve() {} disconnect() { this.disconnected = true; } },
  requestAnimationFrame: fn => { const id = ++nextFrame; queue.set(id, fn); return id; },
  cancelAnimationFrame: id => queue.delete(id),
  addEventListener: (event, fn) => events.set(event, fn),
  setTimeout: fn => { fn(); return 0; }, clearTimeout: noop, scrollTo: noop, scrollY: 0
};
sandbox.window = sandbox;
const engine = source.replace(/^import .+$/m, '').replace('export function initializeSite()', 'function initializeSite()') + '\nwindow.__cleanup = initializeSite();';
vm.runInNewContext(engine, sandbox, { timeout: 4000 });
function pump(time) {
  assert.ok(queue.size <= 1, 'More than one animation frame is pending');
  const entry = queue.entries().next().value;
  if (!entry) return false;
  queue.delete(entry[0]); entry[1](time); return true;
}
const initialPaths = pathCount;
assert.equal(initialPaths, 720, 'Four scenes should precompute 180 fibre paths each');
for (let i = 1; i <= 400; i++) pump(i * 17);
assert.equal(pathCount, initialPaths, 'Animation regenerated cached paths');
assert.ok(strokeCount > 1000, 'Visible canvas did not render');
assert.equal(queue.size, 1, 'Visible motion stopped unexpectedly');

element('#motion-toggle').click(); pump(7000);
assert.ok(body.classList.contains('motion-paused'));
assert.equal(queue.size, 0, 'Pause left an animation loop running');
element('#motion-toggle').click(); pump(7100);
assert.equal(queue.size, 1, 'Unpausing did not restart the loop');

document.hidden = true; events.get('document:visibilitychange')();
assert.equal(queue.size, 0, 'Hidden document left an animation frame pending');
document.hidden = false; events.get('document:visibilitychange')(); pump(7200);
assert.equal(queue.size, 1, 'Visible document did not restart');

const canvasObserver = observers[0];
canvasObserver.fn(canvasObserver.targets.map(target => ({ target, isIntersecting: false })));
pump(7300);
assert.equal(queue.size, 0, 'Offscreen canvases kept rendering');
canvasObserver.fn([{ target: element('#sculpture'), isIntersecting: true }]); pump(7400);
assert.equal(queue.size, 1, 'Returning to artwork did not restart');

for (let i = 0; i < 20; i++) events.get('scroll')();
assert.equal(queue.size, 1, 'Scroll events scheduled duplicate frame loops');
assert.equal(pathCount, initialPaths, 'Scroll rebuilt canvas paths');
sandbox.__cleanup();
assert.equal(queue.size, 0, 'React cleanup left an animation frame pending');
assert.ok(observers.every(observer => observer.disconnected), 'React cleanup left an observer attached');
events.get('scroll')();
await Promise.resolve();
assert.equal(queue.size, 0, 'A delayed callback restarted a disposed runtime');
console.log('PASS: 400 frames, cached geometry, one scheduler, pause/resume, visibility, offscreen sleep, scroll coalescing and React cleanup.');
