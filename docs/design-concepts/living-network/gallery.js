const sections = [
  ['01-hero.png', '01 · The first signal', 'A branching nerve-fibre sculpture introduces the brand, with the product statement and CTAs visible immediately.', 'Axon Enjin hero with People, connected headline and branching blue nerve fibres.'],
  ['02-assembly.png', '02 · Signal to structure', 'Organic fibres straighten into a shared branch interface. The middle chapter of Spark → Connect → Operate.', 'Blue fibres merging into an illustrative Operating Layer stock table, with three scroll chapter markers.'],
  ['03-manifesto.png', '03 · The human connection', 'A quiet word-by-word reveal explains the purpose behind the network. This image shows a mid-reveal state.', 'Typography-led manifesto about technology bringing people together, above a blue signal strand.'],
  ['04-modules.png', '04 · One connected system', 'A readable stock-transfer example sits beside the complete seven-module selector.', 'Inventory transfer form with Core, HR, Inventory, CRM, Reporting, Accounting and Scheduling module choices.'],
  ['05-offers.png', '05 · Ways to work together', 'Operating Layer, modules plus customization, and custom AI software in a clear indexed hierarchy.', 'Three offers with Operating Layer expanded above customization and custom AI software.'],
  ['06-delivery.png', '06 · How we work', 'Layered technical figures group the eight delivery stages. Maintenance follows go-live as agreed.', 'Three technical illustrations for understanding, building and handoff, with all eight delivery stages.'],
  ['07-team.png', '07 · The builders', 'A discreet introduction to working directly with the builders, without individual names or titles. The working-session detail is illustrative.', 'Anonymous hands sketching a workflow beside a short description of direct collaboration, with no personal roster.'],
  ['08-contact.png', '08 · Make the connection', 'Many fibres resolve into one signal beside an inquiry form. Ventures stays in the footer.', 'Dark contact section with blue fibres converging above a form and the headline Let’s make the connection.']
];
let currentIndex = 0;
const sectionButtons = [...document.querySelectorAll('[data-index]')];
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
function showSection(index, updateHash = true) {
  currentIndex = Math.max(0, Math.min(sections.length - 1, index));
  const [file, title, description, alt] = sections[currentIndex];
  document.querySelector('#mockup').src = file;
  document.querySelector('#mockup').alt = alt;
  document.querySelector('#full-image').href = file;
  document.querySelector('#section-title').textContent = title;
  document.querySelector('#section-description').textContent = description;
  document.querySelector('#position').textContent = `${currentIndex + 1} / ${sections.length}`;
  sectionButtons.forEach((button, i) => {
    if (i === currentIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  previous.disabled = currentIndex === 0;
  next.disabled = currentIndex === sections.length - 1;
  if (updateHash) location.hash = String(currentIndex + 1).padStart(2, '0');
}
sectionButtons.forEach(button => button.addEventListener('click', () => showSection(Number(button.dataset.index))));
previous.addEventListener('click', () => showSection(currentIndex - 1));
next.addEventListener('click', () => showSection(currentIndex + 1));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showSection(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
function readHash() {
  const value = Number(location.hash.slice(1));
  showSection(Number.isInteger(value) && value >= 1 && value <= sections.length ? value - 1 : 0, false);
}
window.addEventListener('hashchange', readHash);
readHash();
