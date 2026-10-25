import { writeFile } from 'node:fs/promises';

const tabs = await (await fetch('http://127.0.0.1:9337/json')).json();
const tab = tabs.find(t => t.type === 'page');
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let serial = 0;
const waiting = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (waiting.has(message.id)) {
    const { resolve, reject } = waiting.get(message.id);
    waiting.delete(message.id);
    message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
  }
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++serial;
  waiting.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: new URL('../../../index.html', import.meta.url).href });
await new Promise(resolve => setTimeout(resolve, 10000));
const result = await call('Runtime.evaluate', {
  expression: `(() => {
    document.querySelectorAll('#boot, #loader').forEach(el => el.style.display = 'none');
    window.__unpin?.();
    document.documentElement.classList.remove('locked');
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
    document.querySelector('#modules').scrollIntoView();
    return {title: document.title, fonts: document.fonts.status, moduleColor: getComputedStyle(document.querySelector('#modules')).backgroundColor};
  })()`,
  returnByValue: true
});
console.log(JSON.stringify(result.result.value));
await new Promise(resolve => setTimeout(resolve, 1500));
const capture = await call('Page.captureScreenshot', { format: 'png' });
await writeFile(new URL('current-site.png', import.meta.url), Buffer.from(capture.data, 'base64'));
await call('Browser.close');
socket.close();
