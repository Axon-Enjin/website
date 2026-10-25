// Native vector artwork for the approved Living Network delivery composition.
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const n = v => Number(v.toFixed(2));
const point = p => p.map(n).join(',');
const line = (points, cls = '', close = false) => `<path class="${cls}" d="M${points.map(point).join('L')}${close ? 'Z' : ''}"/>`;
const node = (x,y,r=2) => `<path class="anchor-halo" d="M${n(x-r*2)},${n(y)}a${r*2},${r*2} 0 1,0 ${r*4},0a${r*2},${r*2} 0 1,0 -${r*4},0"/><path class="anchor-core" d="M${n(x-r)},${n(y)}a${r},${r} 0 1,0 ${r*2},0a${r},${r} 0 1,0 -${r*2},0"/>`;
const svg = content => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" fill="none" stroke="#3785ad" stroke-width=".7">${content}</svg>`;
const layer = (i,content) => `<g class="figure-layer layer-${['one','two','three'][i]}">${content}</g>`;
const dots = points => `<path class="surface-dot-field" d="${points.map(([x,y])=>`M${n(x)},${n(y)}h.65`).join('')}"/>`;
const wave = (u,v,y) => [210+u*163+v*13,y+v*31+Math.sin(u*3+v)*9+Math.sin(v*3)*6];
let understand = '';
for (let i=2;i>=0;i--) {
  const y=70+i*83;
  const edge=Array.from({length:121},(_,k)=>{const a=k/120*Math.PI*2;return wave(Math.cos(a),Math.sin(a),y)});
  let content = line(edge,'nerve-surface',true);
  for(let v=-.8;v<.9;v+=.2) {
    const bound=Math.sqrt(1-v*v);
    content+=line(Array.from({length:45},(_,k)=>wave(-bound+k/44*bound*2,v,y)),'surface-contour');
  }
  const field=[];
  for(let v=-.96;v<=.96;v+=.12)for(let u=-.98;u<=.98;u+=.045)if(u*u+v*v<.96)field.push(wave(u,v,y));
  content+=dots(field);
  content+=`<ellipse class="construction-line" cx="210" cy="${y}" rx="183" ry="44" stroke-dasharray="1 5"/>`;
  content+=node(...wave(-.85,-.22,y),1.4)+node(...wave(.85,.22,y),1.4);
  understand+=layer(i,content);
}
understand+=`<path class="construction-line" stroke-dasharray="2 5" d="M210 20V292"/><path class="signal-path" d="M183 21C183 43 194 52 210 70S286 104 279 153S298 214 319 236C328 249 318 271 297 286"/>`;
[[210,70],[279,153],[319,236]].forEach(p=>understand+=node(...p,2.8));
const project=(a,b,y)=>[210+(a-b)*85,y+(a+b)*27];
const plane=(y,cls='interface-surface')=>line([[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>project(a,b,y)),cls,true);
const rect=(a,b,w,h,y,cls='interface-detail')=>line([[a,b],[a+w,b],[a+w,b+h],[a,b+h]].map(([u,v])=>project(u,v,y)),cls,true);
const segment=(a,b,c,d,y,cls='interface-detail')=>line([project(a,b,y),project(c,d,y)],cls);
function panel(y,i) {
  let s=plane(y)+segment(-1,-.76,1,-.76,y);
  for(let j=0;j<3;j++)s+=node(...project(-.86+j*.11,-.88,y),.65);
  s+=segment(-.86,-.6,-.35,-.6,y,'interface-highlight');
  if(i===0) {
    for(const radius of [.38,.29])s+=line(Array.from({length:65},(_,j)=>{const a=j/64*Math.PI*2;return project(-.36+Math.cos(a)*radius,.02+Math.sin(a)*radius,y)}),'interface-detail',true);
    for(let j=0;j<4;j++)s+=rect(.25,-.45+j*.27,.5,.12,y,j===1?'interface-highlight':'interface-detail');
    s+=rect(-.82,.6,1.61,.17,y);
  } else if(i===1) {
    s+=rect(-.82,-.43,.62,1.17,y)+rect(-.05,-.43,.85,.44,y);
    for(let j=0;j<5;j++)s+=segment(-.7,-.25+j*.18,-.32,-.25+j*.18,y);
    for(let j=0;j<5;j++)s+=rect(.02+j*.15,.65-(j%3)*.11,.08,.15+(j%3)*.11,y,'interface-highlight');
  } else {
    for(let a=-.8;a<=.85;a+=.2)s+=segment(a,-.46,a,.8,y,'surface-contour');
    for(let b=-.46;b<=.85;b+=.21)s+=segment(-.8,b,.8,b,y,'surface-contour');
    s+=rect(-.78,-.43,.56,.18,y,'interface-highlight');
    s+=dots(Array.from({length:90},(_,k)=>project(-.8+(k%15)*.11,-.4+Math.floor(k/15)*.2,y)));
  }
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]])s+=node(...project(a,b,y),1.5);
  return s;
}
let build=`<path class="construction-line" stroke-dasharray="2 5" d="M40 77V221M380 77V221M210 21V281"/>`;
for(let i=2;i>=0;i--)build+=layer(i,panel(77+i*72,i));
build+=`<path class="signal-path" d="M210 25C210 50 201 60 210 77S272 107 269 149S227 192 248 221S278 258 258 281"/>`;
[[210,77],[269,149],[248,221]].forEach(p=>build+=node(...p,2.8));
let handoff=`<path class="construction-line" stroke-dasharray="2 5" d="M210 83V294M40 135V228M380 135V228"/>`;
for(let i=2;i>=0;i--) {
  const y=135+i*43;
  let s=plane(y);
  for(let a=-.9;a<1;a+=.17)s+=segment(a,-1,a,1,y,'surface-contour');
  for(let b=-.9;b<1;b+=.17)s+=segment(-1,b,1,b,y,'surface-contour');
  s+=rect(-.77,-.55,.55,.25,y,'interface-highlight')+rect(.04,.13,.67,.27,y,'interface-highlight');
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1],[.35,-1],[-1,.35]])s+=node(...project(a,b,y),1.5);
  handoff+=layer(i,s);
}
handoff+=`<path class="signal-path" d="M210 85V135C210 163 244 160 264 178S294 215 333 204L397 178"/><circle class="delivery-check-ring" cx="210" cy="59" r="21"/><path class="delivery-check" d="m200 59 7 7 14-16"/>`+node(397,178,3)+node(210,135,2.7);
const art=[understand,build,handoff].map(svg);
for(let i=0;i<art.length;i++)await writeFile(new URL(`assets/delivery-${['understand','build','handoff'][i]}.svg`,root),art[i]);
const page=new URL('index.html',root);
let html=await readFile(page,'utf8');
let count=0;
html=html.replace(/<div class="technical-figure"[^>]*>[\s\S]*?<\/div>/g,()=>`<div class="technical-figure" data-delivery-revision="3" aria-hidden="true">${art[count++]}</div>`);
if(count!==3)throw new Error(`Expected 3 figures, found ${count}`);
html=html.replace(/assets\/(site\.css|fidelity\.css|site\.js)(?:\?[^" ]*)?/g,'assets/$1?v=20261025-03');
await writeFile(page,html);
console.log('Built and embedded all three detailed delivery illustrations.');
