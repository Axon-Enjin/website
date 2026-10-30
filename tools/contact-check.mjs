// Isolated Chromium on :9449; production preview on :4174.
import { mkdir, writeFile } from 'node:fs/promises';
const out=new URL('../docs/design-concepts/living-network/contact-rework/',import.meta.url);
await mkdir(out,{recursive:true});
const tabs=await(await fetch(`http://127.0.0.1:${process.env.AXON_QA_CDP_PORT||9449}/json`)).json();
const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(!pending.has(m.id))return;const p=pending.get(m.id);clearTimeout(p.timer);pending.delete(m.id);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result)});
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>reject(new Error(method+' timed out')),15000);pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}))});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[];const check=(name,pass)=>{checks.push({name,pass:!!pass});console.log(`${pass?'PASS':'FAIL'} ${name}`)};
const canvas=()=>evaluate('document.querySelector("#contact-particles").toDataURL()');
async function capture(name){const clip=await evaluate(`(()=>{const r=document.querySelector('#contact').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:document.documentElement.clientWidth,height:r.height,scale:1}})()`);const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});await writeFile(new URL(name,out),Buffer.from(r.data,'base64'))}
try {
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1672,height:1020,deviceScaleFactor:1,mobile:false});
  await call('Page.navigate',{url:'http://127.0.0.1:4174/'});await sleep(1300);await evaluate('document.fonts.ready');
  await evaluate('document.querySelector("#contact").scrollIntoView({block:"start",behavior:"instant"})');await sleep(500);
  const active=await canvas();await sleep(300);check('Contact fibres and pulses animate',active!==await canvas());
  await capture('desktop-motion.png');
  await sleep(180);
  await evaluate('window.__contactCanvasAllocations=0;window.__contactCreateElement=document.createElement;document.createElement=function(tag,...args){if(tag==="canvas")window.__contactCanvasAllocations++;return window.__contactCreateElement.call(this,tag,...args)}');
  await sleep(350);
  check('Animation reuses its cached canvas artwork',await evaluate('document.createElement=window.__contactCreateElement;window.__contactCanvasAllocations===0'));
  check('Reference artwork has loaded',await evaluate('document.querySelector(".contact-art").naturalWidth>0'));
  check('Canopy spans the page content without overflow',await evaluate('(()=>{const r=document.querySelector(".contact-signal").getBoundingClientRect();return Math.abs(r.left)<1&&Math.abs(r.width-document.body.getBoundingClientRect().width)<2&&r.right<=document.documentElement.clientWidth})()'));
  check('Canopy crosses into the previous section',await evaluate('document.querySelector(".contact-signal").getBoundingClientRect().top<document.querySelector("#contact").getBoundingClientRect().top-50 && getComputedStyle(document.querySelector("#contact")).overflowY==="visible"'));
  check('Company content has breathing room above the canopy',await evaluate('document.querySelector(".contact-signal").getBoundingClientRect().top-document.querySelector(".company-layout").getBoundingClientRect().bottom>=80'));
  check('Overlap artwork cannot block form controls',await evaluate('getComputedStyle(document.querySelector(".contact-signal")).pointerEvents==="none" && Number(getComputedStyle(document.querySelector(".contact-inner")).zIndex)>0'));
  {
    await evaluate('scrollTo({top:document.querySelector("#contact").offsetTop-380,behavior:"instant"})');await sleep(180);
    check('Previous section content stays above the nerves',await evaluate('getComputedStyle(document.querySelector(".company-layout")).zIndex==="1"'));
    const r=await call('Page.captureScreenshot',{format:'png'});await writeFile(new URL('section-overlap.png',out),Buffer.from(r.data,'base64'));
    await evaluate('document.querySelector("#contact").scrollIntoView({block:"start",behavior:"instant"})');await sleep(180);
  }
  check('No numbered brand marker remains',await evaluate('!document.querySelector(".breadcrumb")'));
  await evaluate('document.querySelector("#motion-toggle").click()');await sleep(100);const paused=await canvas();await sleep(300);
  check('Motion off freezes the nerve artwork',paused===await canvas());
  await capture('desktop.png');
  check('Desktop contact link and headline share the same row',await evaluate('Math.abs(document.querySelector("#contact-title").getBoundingClientRect().top-document.querySelector("#contact .contact-action").getBoundingClientRect().top)<10'));
  for(const width of [320,390,768,1366,2560]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<761});await sleep(180);
    check(`No horizontal overflow at ${width}px`,await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'));
    if(width===390){
      check('Mobile keeps clear space above the nerves',await evaluate('document.querySelector(".contact-signal").getBoundingClientRect().top-document.querySelector(".company-layout").getBoundingClientRect().bottom>=80'));
      await capture('mobile.png');
    }
  }
  await call('Emulation.setDeviceMetricsOverride',{width:1672,height:1020,deviceScaleFactor:1,mobile:false});
  await evaluate('document.querySelector("#motion-toggle").click();document.querySelector("#contact").scrollIntoView({block:"start",behavior:"instant"})');await sleep(300);
  await evaluate('scrollTo({top:document.querySelector("#modules").offsetTop+200,behavior:"instant"})');await sleep(300);
  const off=await canvas();await sleep(300);check('Offscreen contact canvas sleeps',off===await canvas());
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await evaluate('localStorage.removeItem("axon-motion")');await call('Page.reload');await sleep(1000);
  await evaluate('document.querySelector("#contact").scrollIntoView({block:"start",behavior:"instant"})');await sleep(200);
  const reduced=await canvas();await sleep(300);check('Reduced motion keeps a static canopy',await evaluate('document.body.classList.contains("motion-paused")')&&reduced===await canvas());
  await writeFile(new URL('checks.json',out),JSON.stringify(checks,null,2));
  if(checks.some(c=>!c.pass))process.exitCode=1;
}finally{socket.send(JSON.stringify({id:++id,method:'Browser.close'}));socket.close()}
