'use strict';
// Intro rendering is driven by site.js's existing animation scheduler.
window.createAxonIntro = ({ hero, artwork, invalidate, isPaused, lowPower }) => {
  const root = document.documentElement;
  if (!root.classList.contains('intro-pending')) { document.getElementById('intro-skip')?.remove(); return null; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = innerWidth <= 760;
  const duration = mobile ? 2000 : 2800;
  const clamp = n => Math.max(0, Math.min(1, n));
  const progress = (t, a, b) => clamp((t - a) / (b - a));
  const ease = n => 1 - (1 - n) ** 3;
  const trunk = 'M12 790 C200 900 470 700 690 655 S930 550 1060 530';
  const branches = [
    'M1060 530 C1190 470 1110 190 1380 180',
    'M1060 530 C1240 475 1420 605 1570 470',
    'M1060 530 C1200 590 1220 820 1430 780'
  ];
  let active = false, finished = false, startTime = null, overlay, skip, paths, tip, finalMask, traces;
  let deadline;
  const listeners = [];
  const variables = [];
  function listen(target, event, callback, options) {
    target.addEventListener(event, callback, options);
    listeners.push(() => target.removeEventListener(event, callback, options));
  }
  function finish() {
    if (finished) return;
    finished = true; active = false;
    clearTimeout(deadline); clearTimeout(window.axonIntroDeadline);
    root.classList.remove('intro-pending', 'intro-active');
    variables.forEach(name => root.style.removeProperty(name));
    overlay?.remove(); skip?.remove();
    listeners.forEach(remove => remove());
    hero.dataset.introState = 'complete';
    invalidate();
  }
  function property(name, value) {
    const key = `--intro-${name}`;
    if (!variables.includes(key)) variables.push(key);
    root.style.setProperty(key, value);
  }
  function reveal(name, t, a, b, distance = 0) {
    const p = ease(progress(t, a, b));
    property(name, p.toFixed(3));
    if (distance) property(`${name}-y`, `${(distance * (1 - p)).toFixed(2)}px`);
  }
  function update(now) {
    if (!active) return;
    if (isPaused() || reduced.matches) { finish(); return; }
    if (startTime === null) startTime = now;
    const elapsed = now - startTime;
    if (elapsed >= duration) { finish(); return; }
    const t = elapsed / duration * 2800;
    const starts = [150, 750, 830, 910], ends = [900, 1370, 1450, 1550];
    paths.forEach(({ trace, mask, traceLength, maskLength }, i) => {
      trace.style.strokeDashoffset = traceLength * (1 - ease(progress(t, starts[i], ends[i])));
      mask.style.strokeDashoffset = maskLength * (1 - ease(progress(t, starts[i] + 140, ends[i] + 340)));
    });
    finalMask.style.opacity = ease(progress(t, 1450, 2250));
    traces.style.opacity = 1 - progress(t, 1400, 2150);
    const point = paths[0].trace.getPointAtLength(paths[0].traceLength * ease(progress(t, 150, 900)));
    tip.setAttribute('transform', `translate(${point.x} ${point.y})`);
    tip.style.opacity = progress(t, 0, 150) * (1 - progress(t, 900, 1250));
    reveal('header', t, 1300, 1850);
    reveal('nav', t, 1750, 2300, -5);
    reveal('label', t, 1350, 1800);
    reveal('people', t, 1300, 1800, 8);
    reveal('connected', t, 1400, 1950, 8);
    reveal('copy', t, 1800, 2250, 6);
    reveal('actions', t, 1900, 2400, 6);
    reveal('footer', t, 2150, 2650);
  }
  function start() {
    if (active) return;
    if (finished || !root.classList.contains('intro-pending') || isPaused() || reduced.matches || scrollY > 20 || document.hidden) { finish(); return; }
    if (!artwork.complete || !artwork.naturalWidth) return;
    // Sample the actual image's cover crop so the mobile mask resolves in place.
    let viewBox = '0 0 1672 941';
    if (mobile) {
      const rect = artwork.getBoundingClientRect();
      const scale = Math.max(rect.width / 1672, rect.height / 941);
      const width = rect.width / scale, height = rect.height / scale;
      viewBox = `${(1672 - width) * .7} ${(941 - height) * .5} ${width} ${height}`;
    }
    overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.classList.add('hero-intro-art');
    overlay.setAttribute('viewBox', viewBox);
    overlay.setAttribute('preserveAspectRatio', 'none');
    overlay.setAttribute('aria-hidden', 'true');
    const maskPaths = [trunk,
      `${branches[0]} C1540 110 1560 270 1390 335`, branches[1], branches[2]];
    overlay.innerHTML = `<defs>
      <filter id="intro-feather" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${mobile || lowPower ? 14 : 26}"/></filter>
      <filter id="intro-glow" x="-400%" y="-400%" width="900%" height="900%"><feGaussianBlur stdDeviation="6"/></filter>
      <mask id="intro-network-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941">
        <rect width="1672" height="941" fill="black"/>
        <g fill="none" stroke="white" stroke-linecap="round" filter="url(#intro-feather)">
          ${maskPaths.map((d, i) => `<path data-mask="${i}" d="${d}" stroke-width="${[230, 320, 260, 340][i]}"/>`).join('')}
        </g><rect class="intro-mask-finish" width="1672" height="941" fill="white" opacity="0"/>
      </mask></defs>
      <image href="${artwork.getAttribute('src')}" width="1672" height="941" mask="url(#intro-network-mask)"/>
      <g class="intro-traces" fill="none" stroke="#59c7ff" stroke-width="2" stroke-linecap="round">
        ${[trunk, ...branches].map((d, i) => `<path data-trace="${i}" d="${d}"/>`).join('')}
      </g><g class="intro-tip" opacity="0"><circle r="11" fill="#52baff" filter="url(#intro-glow)"/><circle r="3.5" fill="#e9faff"/></g>`;
    paths = [0, 1, 2, 3].map(i => {
      const trace = overlay.querySelector(`[data-trace="${i}"]`), mask = overlay.querySelector(`[data-mask="${i}"]`);
      const traceLength = trace.getTotalLength(), maskLength = mask.getTotalLength();
      trace.style.strokeDasharray = trace.style.strokeDashoffset = traceLength;
      mask.style.strokeDasharray = mask.style.strokeDashoffset = maskLength;
      return { trace, mask, traceLength, maskLength };
    });
    tip = overlay.querySelector('.intro-tip');
    finalMask = overlay.querySelector('.intro-mask-finish');
    traces = overlay.querySelector('.intro-traces');
    hero.insertBefore(overlay, artwork);
    root.classList.add('intro-active');
    hero.dataset.introState = 'playing';
    active = true;
    try { sessionStorage.setItem('axon-intro-seen', '1'); } catch { /* Optional. */ }
    clearTimeout(window.axonIntroDeadline);
    clearTimeout(deadline);
    deadline = setTimeout(finish, duration + 1000);
    update(performance.now());
    invalidate();
  }
  // Pending artwork must be skippable too, before the first animated frame.
  skip = document.getElementById('intro-skip');
  listen(skip, 'click', finish);
  listen(window, 'wheel', finish, { passive: true });
  listen(window, 'touchmove', finish, { passive: true });
  listen(window, 'scroll', () => { if (scrollY > 20) finish(); }, { passive: true });
  listen(window, 'resize', finish, { passive: true });
  listen(document, 'keydown', event => {
    if (['Escape', 'Tab', ' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) finish();
  });
  listen(document, 'pointerdown', event => { if (event.target.closest('a,button,input,select,textarea')) finish(); });
  listen(document, 'focusin', finish);
  listen(document, 'visibilitychange', () => { if (document.hidden) finish(); });
  listen(reduced, 'change', () => { if (reduced.matches) finish(); });
  listen(artwork, 'load', start);
  listen(artwork, 'error', finish);
  deadline = setTimeout(finish, 1400);
  if (artwork.complete) Promise.resolve().then(start).catch(finish);
  return { get active() { return active; }, update, finish };
};
