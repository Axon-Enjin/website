const $ = selector => document.querySelector(selector);
const hero = $('.hero');
const visual = $('.visual');
const reducedPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reducedPreference.matches;
let progress = reduced ? 1 : 0;
let autoplayStart = null;
let heldProgress = null;
let frame = 0;
const clamp = n => Math.max(0, Math.min(1, n));
const mix = (a, b, t) => a + (b - a) * t;
const ease = t => 1 - Math.pow(1 - t, 3);
const path = $('#network-path');
const nodes = ['#node-a', '#node-b', '#node-c'].map($);

function paint(p) {
  hero.style.setProperty('--p', p.toFixed(4));
  const t = ease(p);
  const rootX = mix(320, 47, t), rootY = mix(100, 105, t);
  const barY = mix(185, 142, t);
  const xs = [mix(90, 108, t), mix(320, 321, t), mix(550, 560, t)];
  const ys = [mix(260, 265, t), mix(260, 310, t), mix(260, 355, t)];
  path.setAttribute('d', xs.map((x, i) => `M${rootX} ${rootY} L${rootX} ${barY} Q${rootX} ${barY + 12} ${rootX + 12} ${barY + 12} L${x - 12} ${barY + 12} Q${x} ${barY + 12} ${x} ${barY + 24} L${x} ${ys[i]}`).join(' '));
  path.style.opacity = String(mix(.65, .06, t));
  nodes.forEach((node, i) => { node.setAttribute('cx', xs[i]); node.setAttribute('cy', ys[i]); node.style.opacity = String(1 - t); });
}
function targetProgress() {
  if (reduced) return 1;
  if (innerWidth <= 760) {
    const rect = visual.getBoundingClientRect();
    return clamp((innerHeight * .65 - rect.top) / (innerHeight * .55));
  }
  const rect = hero.getBoundingClientRect();
  return clamp(-rect.top / Math.max(1, hero.offsetHeight - innerHeight));
}
function tick(now) {
  frame = 0;
  if (document.hidden) return;
  let target = heldProgress ?? targetProgress();
  if (autoplayStart !== null) {
    target = clamp((now - autoplayStart) / 2200);
    if (target === 1) { autoplayStart = null; heldProgress = 1; $('#play').innerHTML = '<iconify-icon icon="solar:restart-linear"></iconify-icon> Replay transition'; }
  }
  progress = reduced ? 1 : mix(progress, target, .13);
  if (Math.abs(progress - target) < .001) progress = target;
  paint(progress);
  if (autoplayStart !== null || Math.abs(progress - target) > .001) schedule();
}
function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
addEventListener('scroll', () => { heldProgress = null; if (autoplayStart === null) schedule(); }, { passive: true });
addEventListener('resize', schedule, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; autoplayStart = null; } else schedule(); });
for (const event of ['wheel', 'touchstart', 'pointerdown']) addEventListener(event, e => { if (e.target.closest?.('#play')) return; autoplayStart = null; schedule(); }, { passive: true });
$('#play').addEventListener('click', () => {
  if (reduced) { paint(1); return; }
  heldProgress = null; progress = 0; paint(0); autoplayStart = performance.now();
  $('#play').innerHTML = '<iconify-icon icon="solar:play-circle-linear"></iconify-icon> Playing transition';
  schedule();
});
function setReduced(value) {
  reduced = value; autoplayStart = null; heldProgress = null;
  document.body.classList.toggle('reduced-motion', value);
  $('#motion-toggle').setAttribute('aria-pressed', String(value));
  $('#motion-toggle').textContent = value ? 'Motion reduced' : 'Reduce motion';
  $('#play').disabled = value;
  progress = value ? 1 : targetProgress(); paint(progress); schedule();
}
$('#motion-toggle').addEventListener('click', () => setReduced(!reduced));
reducedPreference.addEventListener('change', event => setReduced(event.matches));
setReduced(reduced);

const workflows = {
  inventory: { title: 'Stock by branch', description: 'See stock levels and plan moves between branches.', columns: ['Item', 'Branch A', 'Branch B', 'Branch C'], rows: [['Coffee beans', '120', '85', '64'], ['Cups', '430', '220', '310'], ['Milk', '180', '120', '95']] },
  people: { title: 'People across your branches', description: 'Keep people, branch roles, and attendance records together.', columns: ['Team member', 'Branch', 'Role', 'Attendance'], rows: [['Alex Reyes', 'Branch A', 'Manager', 'Present'], ['Sam Cruz', 'Branch B', 'Staff', 'Present'], ['Jamie Santos', 'Branch C', 'Manager', 'Present']] },
  reports: { title: 'Branch stock report', description: 'Read branch and network numbers from one dashboard.', columns: ['Branch', 'Stock items', 'Transfers', 'People'], rows: [['Branch A', '1,284', '12', '12'], ['Branch B', '964', '8', '8'], ['Branch C', '1,738', '15', '15']] }
};
function animateSwap(element, update) {
  const old = element.getBoundingClientRect();
  element.getAnimations().forEach(animation => animation.cancel());
  update();
  if (reduced) return;
  const next = element.getBoundingClientRect();
  element.animate([{ opacity: .25, transform: `translateY(9px) scaleY(${old.height / Math.max(next.height, 1)})`, clipPath: 'inset(0 0 12% 0 round 8px)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0 round 8px)' }], { duration: 440, easing: 'cubic-bezier(.16,1,.3,1)' });
}
function setTab(tabs, active) { tabs.forEach(tab => { const selected = tab === active; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; }); }
const workflowTabs = [...document.querySelectorAll('[data-workflow]')];
function positionMarker() {
  const active = workflowTabs.find(tab => tab.getAttribute('aria-selected') === 'true');
  $('.tab-marker').style.width = `${active.offsetWidth}px`;
  $('.tab-marker').style.transform = `translateX(${active.offsetLeft}px)`;
}
function selectWorkflow(tab) {
  const data = workflows[tab.dataset.workflow];
  setTab(workflowTabs, tab); positionMarker();
  $('#workflow-panel').setAttribute('aria-labelledby', tab.id);
  $('#workflow-description').textContent = data.description;
  animateSwap($('#workflow-content'), () => {
    $('#workflow-content').innerHTML = `<h3>${data.title}</h3><div class="table-scroll"><table><thead><tr>${data.columns.map(text => `<th>${text}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row => `<tr>${row.map(text => `<td>${text}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  });
}
workflowTabs.forEach(tab => tab.addEventListener('click', () => selectWorkflow(tab)));
addEventListener('resize', positionMarker, { passive: true });
document.fonts.ready.then(positionMarker);
positionMarker();
const modules = {
  core: ['Core', 'widget-2', 'Your foundation: login, branches, roles, home screen, module billing, and an activity log.', ['One account for your team', 'Branches and access roles', 'Add modules as you need them']],
  hr: ['HR', 'users-group-rounded', 'People, roles at branches, and basic attendance records.', ['People records', 'Branch roles', 'Basic attendance']],
  inventory: ['Inventory', 'box', 'Stock levels, moves between branches, and simple counts.', []],
  crm: ['CRM', 'user-speak', 'Customers, contacts, and a simple history of your work with them.', ['Customer and contact records', 'Basic pipeline', 'Customer history']],
  reporting: ['Reporting', 'chart-square', 'Branch and network numbers on one dashboard.', ['Branch reports', 'Network overview', 'One shared view']],
  accounting: ['Accounting', 'calculator', 'Management books, reports, and export or sync to your own registered accounting system.', ['Management books and reports', 'Export or sync to your registered CAS', 'Not a BIR invoicing or CAS replacement']],
  scheduling: ['Scheduling', 'calendar', 'Bookings, shifts, and appointments in one place.', ['Bookings', 'Team shifts', 'Appointments']]
};
const moduleTabs = [...document.querySelectorAll('[data-module]')];
const transfer = $('.branch-transfer').outerHTML;
function selectModule(tab) {
  const [name, icon, description, details] = modules[tab.dataset.module];
  setTab(moduleTabs, tab);
  $('#module-panel').setAttribute('aria-labelledby', tab.id);
  animateSwap($('#module-content'), () => {
    $('#module-content').innerHTML = `<iconify-icon class="detail-icon" icon="solar:${icon}-linear"></iconify-icon><h3>${name}</h3><p>${description}</p>${details.length ? `<div class="module-summary">${details.map(text => `<div>${text}</div>`).join('')}</div>` : transfer}`;
  });
  $('#module-cta').innerHTML = `Ask about ${name} <span aria-hidden="true">↗</span>`;
}
moduleTabs.forEach(tab => tab.addEventListener('click', () => selectModule(tab)));
function keyboardTabs(tabs, select, vertical) {
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    let next;
    if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % tabs.length;
    if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); tabs[next].focus(); select(tabs[next]); }
  }));
}
keyboardTabs(workflowTabs, selectWorkflow, false);
keyboardTabs(moduleTabs, selectModule, true);
const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }); }, { threshold: .2 });
observer.observe($('.contact-surface'));
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  $('#form-result').textContent = `Inquiry preview — not sent\n${data.get('name')} · ${data.get('email')}\n${data.get('company') || 'Company not specified'}${data.get('branches') ? ` · ${data.get('branches')} branches` : ''}\n\n${data.get('message')}`;
});
$('#ventures-toggle').addEventListener('click', () => { const expanded = $('#ventures-toggle').getAttribute('aria-expanded') === 'true'; $('#ventures-toggle').setAttribute('aria-expanded', String(!expanded)); $('#ventures-note').hidden = expanded; });
