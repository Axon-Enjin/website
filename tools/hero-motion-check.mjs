// Check actual image deformation, not just the travelling particle overlay.
import { mkdir, writeFile } from 'node:fs/promises';
const out=new URL('../docs/design-concepts/living-network/hero-motion/',import.meta.url);
await mkdir(out,{recursive:true});
const tabs=await(await fetch('http://127.0.0.1:9457/json')).json();
const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id)}});
const call=(method,params={})=>new Promise(resolve=>{pending.set(++id,resolve);socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[];function check(name,pass){checks.push({name,pass:!!pass});console.log(`${pass?'PASS':'FAIL'} ${name}`)}
async function shot(name){const r=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL(name,out),Buffer.from(r.data,'base64'))}
try{
  await call('Page.enable');await call('Runtime.enable');
  await call('Page.addScriptToEvaluateOnNewDocument',{source:'window.__heroGPUFrames=0;if(window.WebGLRenderingContext){const draw=WebGLRenderingContext.prototype.drawArrays;WebGLRenderingContext.prototype.drawArrays=function(...args){window.__heroGPUFrames++;return draw.apply(this,args)}}'});
  await call('Emulation.setDeviceMetricsOverride',{width:1672,height:941,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:'http://127.0.0.1:4174/#home'});await sleep(1800);await evaluate('document.fonts.ready');
  await evaluate('document.querySelector("#intro-skip")?.click()');await sleep(1500);
  check('GPU deformation renders the hero artwork',await evaluate('window.__heroGPUFrames>3'));
  check('Animated surface covers the image, not just light dots',await evaluate('(()=>{const c=document.querySelector("#sculpture"),d=c.getContext("2d").getImageData(c.width*.72,c.height*.12,80,80).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>250)n++;return n>6000})()'));
  await evaluate('window.__heroBefore=document.querySelector("#sculpture").getContext("2d").getImageData(1100,110,350,220).data;window.__headingRect=JSON.stringify(document.querySelector("#hero-title").getBoundingClientRect().toJSON())');
  await shot('desktop-start.png');await sleep(800);
  check('Branch pixels move independently of the light overlay',await evaluate('(()=>{const d=document.querySelector("#sculpture").getContext("2d").getImageData(1100,110,350,220).data;let n=0;for(let i=0;i<d.length;i+=4)if(Math.abs(d[i+2]-window.__heroBefore[i+2])>15)n++;return n>1000})()'));
  check('Hero text stays fixed while branches move',await evaluate('JSON.stringify(document.querySelector("#hero-title").getBoundingClientRect().toJSON())===window.__headingRect'));
  await shot('desktop-moving.png');
  await evaluate('document.querySelector("#motion-toggle").click()');await sleep(180);const still=await evaluate('document.querySelector("#sculpture").toDataURL()'),frames=await evaluate('window.__heroGPUFrames');await sleep(300);
  check('Motion off freezes the hero and stops GPU work',still===await evaluate('document.querySelector("#sculpture").toDataURL()')&&frames===await evaluate('window.__heroGPUFrames'));
  await evaluate('document.querySelector("#motion-toggle").click();document.querySelector("#modules").scrollIntoView({behavior:"instant"})');await sleep(250);const off=await evaluate('window.__heroGPUFrames');await sleep(300);
  check('Offscreen hero stops GPU work',off===await evaluate('window.__heroGPUFrames'));
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('scrollTo({top:0,behavior:"instant"})');await sleep(650);
  const mobile=await evaluate('window.__heroGPUFrames');await sleep(250);check('Mobile artwork animates with the correct crop',await evaluate(`window.__heroGPUFrames>${mobile}&&document.querySelector('.hero-art').getBoundingClientRect().top===400`));await shot('mobile.png');
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await evaluate('localStorage.removeItem("axon-motion")');await call('Page.reload');await sleep(1200);
  check('Reduced motion uses the original static artwork',await evaluate('document.body.classList.contains("motion-paused")&&window.__heroGPUFrames===0'));
  await call('Page.addScriptToEvaluateOnNewDocument',{source:'const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==="webgl"?null:get.call(this,type,...args)}'});
  await call('Emulation.setEmulatedMedia',{features:[]});await evaluate('localStorage.removeItem("axon-motion")');await call('Page.reload');await sleep(1200);
  check('Unavailable GPU keeps the static image visible',await evaluate('document.querySelector(".hero-art").naturalWidth>0&&window.__heroGPUFrames===0'));
  check('No uncaught runtime errors',errors.length===0);
  await writeFile(new URL('checks.json',out),JSON.stringify(checks,null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
}finally{socket.send(JSON.stringify({id:++id,method:'Browser.close'}));socket.close()}
