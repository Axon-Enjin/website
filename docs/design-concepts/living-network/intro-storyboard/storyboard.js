'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const clamp = n => Math.min(1, Math.max(0, n));
  const progress = (t, start, end) => clamp((t - start) / (end - start));
  const ease = p => 1 - (1 - p) ** 3;
  const scrub = $('#scrub'), replay = $('#replay'), pause = $('#pause'), skip = $('#skip');
  const mobile = $('#mobile-pace');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = $('#stage');
  const beats = [
    [0, '01 — Spark. A point wakes on the incoming trunk.'],
    [200, '02 — Trace. The light travels toward the central junction.'],
    [750, '03 — Branch. One signal splits; fibre detail follows the light.'],
    [1300, '04 — Connect. The headline arrives as the branches resolve.'],
    [1850, '05 — Arrive. Copy and controls settle into the final hero.'],
    [2400, '06 — Continue. The completed hero holds; ambient motion takes over.']
  ];
  const paths = ['trunk', 'upper', 'middle', 'lower'].map(name => ({
    trace: $(`.trace-${name}`), mask: $(`.mask-${name}`)
  }));
  paths.forEach(({trace, mask}) => [trace, mask].forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.dataset.length = length;
  }));
  let frame = 0, playing = false, time = 2800, started = 0;
  function drawPath(path, p) { path.style.strokeDashoffset = path.dataset.length * (1 - p); }
  function show(selector, p, y = 0) {
    const el = $(selector);
    el.style.opacity = p;
    el.style.translate = `0 ${y * (1 - p)}px`;
  }
  function render(t) {
    time = Math.min(2800, Math.max(0, t));
    const starts = [150, 750, 830, 910], ends = [900, 1370, 1450, 1550];
    paths.forEach(({trace, mask}, i) => {
      const p = ease(progress(time, starts[i], ends[i]));
      drawPath(trace, p);
      drawPath(mask, ease(progress(time, starts[i] + 140, ends[i] + 340)));
    });
    $('.mask-finish').style.opacity = ease(progress(time, 1450, 2250));
    $('.trace-lines').style.opacity = 1 - progress(time, 1400, 2150);
    const trunk = paths[0].trace;
    const point = trunk.getPointAtLength(trunk.getTotalLength() * ease(progress(time, 150, 900)));
    $('.signal-tip').setAttribute('transform', `translate(${point.x} ${point.y})`);
    $('.signal-tip').style.opacity = progress(time, 0, 150) * (1 - progress(time, 900, 1250));
    show('.scene-header', ease(progress(time, 1300, 1850)));
    show('.scene-nav', ease(progress(time, 1750, 2300)), -5);
    show('.scene-label', ease(progress(time, 1350, 1800)));
    show('.people', ease(progress(time, 1300, 1800)), 8);
    show('.scene-title em', ease(progress(time, 1400, 1950)), 8);
    $('.scene-title em').style.transform = 'scaleX(1.08)';
    show('.scene-subcopy', ease(progress(time, 1800, 2250)), 6);
    show('.scene-actions', ease(progress(time, 1900, 2400)), 6);
    show('.scene-footer', ease(progress(time, 2150, 2650)));
    scrub.value = Math.round(time);
    const duration = mobile.checked ? 2000 : 2800;
    $('#time').textContent = `${(time / 2800 * duration / 1000).toFixed(2)} / ${(duration / 1000).toFixed(2)}s`;
    const index = beats.findLastIndex(([start]) => time >= start);
    if ($('#beat-description').textContent !== beats[index][1]) $('#beat-description').textContent = beats[index][1];
    document.querySelectorAll('[data-time]').forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    skip.hidden = !playing || time >= 2800;
  }
  function stop() { playing = false; cancelAnimationFrame(frame); frame = 0; pause.disabled = true; pause.textContent = 'Pause'; skip.hidden = true; }
  function finish() { stop(); render(2800); }
  function tick(now) {
    render((now - started) * (mobile.checked ? 1.4 : 1));
    if (time < 2800) frame = requestAnimationFrame(tick); else stop();
  }
  function play(from = 0) {
    stop();
    if (reduced.matches) {
      render(2800);
      $('#beat-description').textContent = 'Reduced motion is enabled. Use the timeline or six frames to inspect the sequence without playback.';
      return;
    }
    playing = true; pause.disabled = false;
    started = performance.now() - from / (mobile.checked ? 1.4 : 1);
    render(from); frame = requestAnimationFrame(tick);
  }
  replay.addEventListener('click', () => play());
  pause.addEventListener('click', () => {
    if (playing) { stop(); pause.disabled = false; pause.textContent = 'Resume'; }
    else play(time);
  });
  scrub.addEventListener('input', () => { stop(); render(Number(scrub.value)); });
  document.querySelectorAll('[data-time]').forEach(button => button.addEventListener('click', () => { stop(); render(Number(button.dataset.time)); }));
  skip.addEventListener('click', finish);
  mobile.addEventListener('change', () => { stop(); render(time); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && playing) finish(); });
  scene.addEventListener('wheel', () => { if (playing) finish(); }, {passive: true});
  scene.addEventListener('touchmove', () => { if (playing) finish(); }, {passive: true});
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) finish(); });
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  render(2800);
})();
