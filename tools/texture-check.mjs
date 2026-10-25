// Capture the same sections before/after the static texture treatment.
import { mkdir, writeFile } from 'node:fs/promises';
const phase=process.env.AXON_TEXTURE_PHASE||'after';
const out=new URL(`../docs/design-concepts/living-network/texture-study/${phase}/`,import.meta.url);
await mkdir(out,{recursive:true});
const tabs=await(await fetch(`http://127.0.0.1:${process.env.AXON_QA_CDP_PORT||9456}/json`)).json();
const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map();
socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id)}});
const call=(method,params={})=>new Promise(resolve=>{pending.set(++serial,resolve);socket.send(JSON.stringify({id:serial,method,params}))});
const evaluate=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
  await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:'http://127.0.0.1:4174/'});await sleep(1300);await evaluate('document.fonts.ready');
  await evaluate('if(!document.body.classList.contains("motion-paused"))document.querySelector("#motion-toggle").click()');
  for(const id of ['modules','offers','how-we-work','company']){
    await evaluate(`document.querySelector('#${id}').scrollIntoView({block:'start',behavior:'instant'})`);await sleep(200);
    const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL(`${id}.png`,out),Buffer.from(shot.data,'base64'));
  }
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate('document.querySelector("#company").scrollIntoView({block:"start",behavior:"instant"})');await sleep(250);
  const mobile=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL('mobile-company.png',out),Buffer.from(mobile.data,'base64'));
  for(const width of [320,390,768,1440,2560]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<761});await sleep(100);
    const overflow=await evaluate('document.documentElement.scrollWidth>document.documentElement.clientWidth');
    if(overflow)throw new Error(`Horizontal overflow at ${width}`);
  }
  console.log(`PASS ${phase}: captured four desktop sections and mobile; no horizontal overflow at five widths.`);
}finally{socket.send(JSON.stringify({id:++serial,method:'Browser.close'}));socket.close()}
