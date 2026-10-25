const sections = [
  ['01-hero.png','hero','The fibre geometry now has distributed junctions, curling terminal branches and stronger endpoint lights.'],
  ['02-assembly.png','assembly','A smaller right-aligned app window, labelled navigation and fibres meeting the frame restore the Connect composition.'],
  ['03-manifesto.png','manifesto','The five authored lines, together emphasis and organic fibre band are restored. This capture shows a live mid-reveal state.'],
  ['04-modules.png','modules','The Inventory panel has its internal shortcuts, incoming signal, wide headline and balanced two-column layout.'],
  ['05-offers.png','offers','All three offer titles share one column. The indexed node rail and layered interface figure match the original structure.'],
  ['06-delivery.png','delivery','Dotted surfaces, internal detail and layered technical figures replace the empty outlines.'],
  ['07-team.png','company','The discreet, revised team mock remains the authority. The heading scale and image treatment are aligned without introducing names.'],
  ['08-contact.png','contact','The closing headline uses the intended three-line desktop composition, converging fibre art and horizontal offer labels. The form stays local.']
];
const select=document.querySelector('#section');let index=0;
function show(value){index=Math.max(0,Math.min(7,value));const [mock,name,note]=sections[index];select.value=String(index);for(const [prefix,path] of [['mock','../'+mock],['current','after/desktop-'+name+'.png'],['before','before/desktop-'+name+'.png']]){document.querySelector('#'+prefix+'-image').src=path;document.querySelector('#'+prefix+'-image').alt=(prefix==='mock'?'Approved mockup: ':prefix==='current'?'Website iteration 02: ':'Previous implementation: ')+name;document.querySelector('#'+prefix+'-link').href=path}document.querySelector('#section-note').textContent=note;document.querySelector('#position').textContent=(index+1)+' / 8';document.querySelector('#previous').disabled=index===0;document.querySelector('#next').disabled=index===7;history.replaceState(null,'','#'+String(index+1).padStart(2,'0'))}
select.addEventListener('change',()=>show(Number(select.value)));document.querySelector('#previous').addEventListener('click',()=>show(index-1));document.querySelector('#next').addEventListener('click',()=>show(index+1));
document.querySelector('#overlay-toggle').addEventListener('click',event=>{const on=event.currentTarget.getAttribute('aria-pressed')!=='true';event.currentTarget.setAttribute('aria-pressed',String(on));document.querySelector('#comparison').classList.toggle('overlay',on);document.querySelector('#blend-control').hidden=!on});
document.querySelector('#blend').addEventListener('input',event=>document.querySelector('#comparison').style.setProperty('--blend',Number(event.target.value)/100));
document.addEventListener('keydown',event=>{if(event.target.matches('input,select')||event.ctrlKey||event.metaKey||event.altKey)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1))}});
const initial=Number(location.hash.slice(1));show(Number.isInteger(initial)&&initial>=1&&initial<=8?initial-1:0);
