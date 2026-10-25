import { createAxonIntro } from "./hero-intro.js";
import { createHeroMotion } from "./hero-motion.js";

export function initializeSite() {
  let disposed = false;
  const events = new AbortController();
  const observers = [],
    timers = new Set(),
    objectURLs = new Set();
  const introWasPending =
    document.documentElement.classList.contains("intro-pending");
  const originalSkip = document.getElementById("intro-skip");
  const snapshots = new Map(
    [
      ".manifesto-copy",
      "#module-panel",
      "#workflow-panel",
      "#module-inquiry",
      "#transfer-summary",
    ].map((selector) => {
      const element = document.querySelector(selector);
      return [element, element?.innerHTML];
    }),
  );
  function listen(target, type, handler, options = {}) {
    target?.addEventListener(type, handler, {
      ...options,
      signal: events.signal,
    });
  }
  function later(fn, delay) {
    const timer = window.setTimeout(() => {
      if (!disposed) fn();
    }, delay);
    timers.add(timer);
    return timer;
  }
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const icon = (name) =>
    `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
  const reducedPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let savedMotion = null;
  try {
    savedMotion = localStorage.getItem("axon-motion");
  } catch {
    /* Storage is optional. */
  }
  let paused =
    savedMotion === "paused" ||
    (savedMotion !== "on" && reducedPreference.matches);
  let frameId = 0,
    dirty = true,
    clock = 0,
    lastTime = 0,
    lastPaint = 0;
  let assemblyProgress = 1,
    assemblyStarted = false,
    assemblyPlaying = false,
    assemblyStartClock = 0;
  let manifestoProgress = 1;
  const hero = $("#home");
  const heroArtwork = $(".hero-art");
  const heroMotion =
    typeof createHeroMotion === "function"
      ? createHeroMotion({
          artwork: heroArtwork,
          lowPower: (navigator.hardwareConcurrency || 4) <= 4,
        })
      : null;
  const contactArtwork = $(".contact-art");
  listen(contactArtwork, "load", () => invalidate());
  listen(heroArtwork, "load", () => invalidate());
  const assembly = $(".assembly");
  const assemblyArt = $(".assembly-art");
  const branchApp = $("#branch-app");
  listen(assemblyArt, "load", () => invalidate());
  const header = $("#site-header");
  const motionButton = $("#motion-toggle");
  const manifesto = $(".manifesto-copy");
  const manifestoSection = $("#purpose");
  manifestoSection.classList.add("is-scroll-staged");
  const technicalFigures = $$(".technical-figure");
  const progressBar = $(".page-progress");
  if (!paused && !reducedPreference.matches) setAssemblyProgress(0);

  // Deterministic geometry is constructed once. Scrolling and one clock drive it.
  let randomState = 48271;
  function random() {
    randomState = (randomState * 16807) % 2147483647;
    return (randomState - 1) / 2147483646;
  }
  const cubic = (a, b, c, d, t) =>
    (1 - t) ** 3 * a +
    3 * (1 - t) ** 2 * t * b +
    3 * (1 - t) * t * t * c +
    t ** 3 * d;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4;
  const heroIntro = createAxonIntro?.({
    hero,
    artwork: heroArtwork,
    invalidate,
    isPaused: () => paused,
    lowPower,
  });
  const fibreCount = lowPower ? 90 : 180;
  const fibres = Array.from({ length: fibreCount }, (_, index) => {
    const branch = index % 3,
      spread = random() - 0.5,
      phase = random() * Math.PI * 2;
    const angle = random() * Math.PI * 2;
    const radius = 0.028 + random() * 0.065;
    const centers = [
      [0.84, 0.22],
      [0.91, 0.51],
      [0.85, 0.84],
    ];
    const center = centers[branch];
    const end = [
      center[0] + Math.cos(angle) * radius,
      center[1] + Math.sin(angle) * radius * 1.25,
    ];
    const junction = [0.59 + spread * 0.075, 0.65 + Math.sin(phase) * 0.025];
    const curl = 0.008 + random() * 0.025;
    const points = Array.from({ length: 91 }, (_, n) => {
      const t = n / 90;
      let x, y;
      if (t <= 0.53) {
        const u = t / 0.53;
        x = cubic(-0.1, 0.12, 0.4, junction[0], u);
        y =
          cubic(0.86, 0.94, 0.72, junction[1], u) +
          spread * 0.13 * (1 - u) +
          Math.sin(u * 11 + phase) * 0.014 * Math.sin(Math.PI * u);
      } else {
        const u = (t - 0.53) / 0.47;
        const controls = [
          [
            [0.72, 0.6],
            [0.69, 0.27],
          ],
          [
            [0.75, 0.59],
            [0.82, 0.52],
          ],
          [
            [0.72, 0.64],
            [0.71, 0.91],
          ],
        ][branch];
        const terminal = smooth(clamp((u - 0.45) / 0.55));
        x = cubic(
          junction[0],
          controls[0][0],
          center[0] + Math.cos(angle + 0.9) * radius * 1.7,
          end[0],
          u,
        );
        y = cubic(
          junction[1],
          controls[0][1],
          controls[1][1] + Math.sin(angle + 0.9) * radius * 1.5,
          end[1],
          u,
        );
        x += Math.sin(u * 11 + phase) * curl * terminal * (1 - u);
        y += Math.sin(u * 13 + phase) * curl * Math.sin(Math.PI * u);
      }
      return { x, y };
    });
    return {
      points,
      phase,
      spread,
      opacity: 0.22 + random() * 0.6,
      bright: index % 9 === 0,
    };
  });
  const ambient = Array.from({ length: 32 }, () => ({
    x: 0.42 + random() * 0.58,
    y: 0.08 + random() * 0.84,
    r: 0.4 + random() * 1.1,
    a: 0.12 + random() * 0.35,
  }));
  const assemblyDots = Array.from({ length: lowPower ? 250 : 420 }, (_, i) => {
    const path = fibres[i % fibres.length].points;
    const source = path[Math.floor(random() * (path.length - 1))];
    return {
      x: source.x,
      y: source.y,
      tx: 0.423 + ((i % 28) / 27) * 0.447,
      ty: 0.49 + (Math.floor(i / 28) / 14) * 0.19,
      phase: random() * Math.PI * 2,
    };
  });
  const glow = document.createElement("canvas");
  glow.width = glow.height = 64;
  const glowContext = glow.getContext("2d");
  if (glowContext) {
    const gradient = glowContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(215,245,255,1)");
    gradient.addColorStop(0.1, "rgba(86,200,255,.9)");
    gradient.addColorStop(0.3, "rgba(46,111,255,.26)");
    gradient.addColorStop(1, "rgba(46,111,255,0)");
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 64, 64);
  }
  const scenes = [
    { element: $("#sculpture"), visible: true, type: "hero" },
    { element: $("#assembly-particles"), visible: false, type: "assembly" },
    { element: $("#manifesto-signal"), visible: false, type: "manifesto" },
    { element: $("#contact-particles"), visible: false, type: "contact" },
  ].map((scene) => ({
    ...scene,
    ctx: scene.element.getContext("2d", { alpha: true }),
    width: 0,
    height: 0,
    paths: [],
  }));
  function mobilePoint(point) {
    return innerWidth <= 760
      ? { x: (point.x - 0.18) * 1.25, y: 0.6 + point.y * 0.38 }
      : point;
  }
  function resizeScene(scene) {
    const rect = scene.element.getBoundingClientRect();
    const dpr = Math.min(
      devicePixelRatio || 1,
      lowPower || innerWidth <= 760 ? 1.5 : 2,
    );
    scene.width = rect.width;
    scene.height = rect.height;
    scene.element.width = Math.round(rect.width * dpr);
    scene.element.height = Math.round(rect.height * dpr);
    if (!scene.ctx || !rect.width || !rect.height) return;
    scene.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (scene.type === "hero") heroMotion?.resize(rect);
    scene.renderPoints = fibres.map((fibre) => {
      if (scene.type === "hero") return fibre.points.map(mobilePoint);
      return fibre.points.map((point, i) => {
        const u = i / (fibre.points.length - 1);
        if (scene.type === "assembly")
          return {
            x: cubic(-0.08, 0.06, 0.18, 0.275, u),
            y:
              cubic(
                0.5 + fibre.spread * 1.05,
                0.68 - fibre.spread * 0.3,
                0.49 + fibre.spread * 0.2,
                0.52 + fibre.spread * 0.55,
                u,
              ) +
              Math.sin(u * 12 + fibre.phase) * 0.018 * Math.sin(Math.PI * u),
          };
        if (scene.type === "contact") {
          const t = clamp(u / 0.63);
          const convergence = (1 - t) ** 0.85;
          return {
            x: u,
            y:
              cubic(0.08, 0.05, 0.6, 0.56, t) +
              (fibre.spread * 1.35 + Math.sin(u * 15 + fibre.phase) * 0.12) *
                convergence,
          };
        }
        if (scene.type === "manifesto") {
          return {
            x: u,
            y:
              cubic(0.69, 0.85, 0.94, 0.55, u) +
              fibre.spread * (0.07 + Math.max(0, u - 0.54) * 0.6) +
              Math.sin(u * 12 + fibre.phase) * 0.018,
          };
        }
        const peripheral = fibre.bright
          ? Math.sin(u * 9 + fibre.phase) * 0.14
          : 0;
        return {
          x: u,
          y:
            0.5 +
            Math.sin(u * 6.5 + 0.4) * 0.2 +
            fibre.spread * 0.13 +
            Math.sin(u * 10 + fibre.phase * 0.4) * 0.04 +
            peripheral,
        };
      });
    });
    scene.paths = scene.renderPoints.map((points) => {
      const path = new Path2D();
      const visiblePoints =
        scene.type === "contact" ? points.slice(0, 58) : points;
      visiblePoints.forEach((p, i) => {
        if (i === 0) path.moveTo(p.x * scene.width, p.y * scene.height);
        else if (i === visiblePoints.length - 1)
          path.lineTo(p.x * scene.width, p.y * scene.height);
        else {
          const next = visiblePoints[i + 1];
          path.quadraticCurveTo(
            p.x * scene.width,
            p.y * scene.height,
            (p.x + next.x) * 0.5 * scene.width,
            (p.y + next.y) * 0.5 * scene.height,
          );
        }
      });
      return path;
    });
    if (scene.type === "hero") {
      scene.haze = scene.ctx.createRadialGradient(
        scene.width * 0.75,
        scene.height * 0.65,
        0,
        scene.width * 0.75,
        scene.height * 0.65,
        scene.width * 0.6,
      );
      scene.haze.addColorStop(0, "#0a244132");
      scene.haze.addColorStop(1, "#04060d00");
    }
  }
  function drawNode(ctx, x, y, radius, strength = 1) {
    ctx.globalAlpha = strength;
    ctx.drawImage(
      glow,
      x - radius * 5,
      y - radius * 5,
      radius * 10,
      radius * 10,
    );
    ctx.fillStyle = "#d9f5ff";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  function drawHero(scene) {
    const { ctx, width: w, height: h } = scene;
    if (!ctx || !w || !h) return;
    if (heroIntro?.active) {
      ctx.clearRect(0, 0, w, h);
      return;
    }
    // Flex the selected artwork's branches while keeping copy and controls live.
    if (heroArtwork?.complete && heroArtwork.naturalWidth > 0) {
      ctx.clearRect(0, 0, w, h);
      heroMotion?.draw(ctx, clock, paused);
      if (innerWidth > 760) {
        const spine = [
          [-0.03, 0.84],
          [0.14, 0.86],
          [0.28, 0.78],
          [0.4, 0.7],
          [0.53, 0.62],
          [0.64, 0.56],
        ];
        for (let i = 0; i < 4; i++) {
          const at = ((clock * 0.07 + i * 0.24) % 1) * (spine.length - 1);
          const a = spine[Math.floor(at)],
            b = spine[Math.min(spine.length - 1, Math.floor(at) + 1)];
          drawNode(
            ctx,
            mix(a[0], b[0], at % 1) * w,
            mix(a[1], b[1], at % 1) * h,
            i === 0 ? 2.2 : 1,
            0.45,
          );
        }
      }
      ctx.globalAlpha = 1;
      return;
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#04060d";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = scene.haze;
    ctx.fillRect(0, 0, w, h);
    if (innerWidth > 760) {
      ctx.strokeStyle = "#1b416025";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      const step = Math.max(140, w / 9);
      for (let x = w * 0.08; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 94; y < h; y += h / 5) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "screen";
    fibres.forEach((fibre, i) => {
      ctx.strokeStyle = fibre.bright ? "#8bd7ff" : "#2b8eff";
      ctx.globalAlpha = fibre.opacity;
      ctx.lineWidth = fibre.bright ? 1.25 : 0.75;
      ctx.stroke(scene.paths[i]);
      if (i % 2 === 0) {
        const p = mobilePoint(fibre.points.at(-1));
        drawNode(
          ctx,
          p.x * w,
          p.y * h,
          fibre.bright ? 2.7 : 1.6,
          0.82 + 0.14 * Math.sin(clock * 0.6 + fibre.phase),
        );
      }
      if (i % 17 === 0) {
        const t = (clock * 0.045 + 0.39 + i * 0.019) % 1;
        const last = fibre.points.length - 1;
        const f = t * last,
          start = Math.floor(f),
          end = Math.min(last, start + 1);
        const a = mobilePoint(fibre.points[start]),
          b = mobilePoint(fibre.points[end]);
        drawNode(
          ctx,
          mix(a.x, b.x, f - start) * w,
          mix(a.y, b.y, f - start) * h,
          i === 0 ? 4 : 1.7,
          0.95,
        );
      }
    });
    if (innerWidth > 760)
      ambient.forEach((dot) => {
        ctx.globalAlpha = dot.a;
        ctx.fillStyle = "#428cdc";
        ctx.beginPath();
        ctx.arc(dot.x * w, dot.y * h, dot.r, 0, Math.PI * 2);
        ctx.fill();
      });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  function drawAssembly(scene) {
    const { ctx, width: w, height: h } = scene;
    if (!ctx || !w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const p = smooth(assemblyProgress);
    const hasArtwork = assemblyArt?.complete && assemblyArt.naturalWidth > 0;
    ctx.globalCompositeOperation = "screen";
    if (p < 0.5) {
      ctx.globalAlpha = (1 - p * 2) * 0.8;
      ctx.strokeStyle = "#56c8ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0.274 * w, 0.52 * h);
      ctx.lineTo(0.905 * w, 0.52 * h);
      ctx.stroke();
    }
    scene.paths.forEach((path, i) => {
      ctx.strokeStyle = i % 9 === 0 ? "#8ddcff" : "#2e8eff";
      ctx.lineWidth = i % 9 === 0 ? 1 : 0.65;
      ctx.globalAlpha = fibres[i].opacity * 0.65;
      if (!hasArtwork) ctx.stroke(path);
      if (i % 16 === 0) {
        const point =
          scene.renderPoints[i][
            Math.floor(((clock * 0.08 + i * 0.07) % 1) * 90)
          ];
        drawNode(ctx, point.x * w, point.y * h, 1.7, 0.7);
      }
    });
    for (let i = 0; i < 6; i++)
      drawNode(ctx, 0.274 * w, (0.4 + i * 0.055) * h, 1.7, 0.65);
    if (p < 1)
      assemblyDots.forEach((dot, i) => {
        const source = scene.renderPoints[i % fibres.length][(i * 7) % 91];
        const x = mix(source.x, dot.tx, p) * w;
        const y =
          mix(source.y, dot.ty, p) * h +
          Math.sin(clock * 0.5 + dot.phase) * 3 * (1 - p);
        ctx.globalAlpha = 0.65 * (1 - p);
        ctx.fillStyle = i % 8 === 0 ? "#b8efff" : "#348ee6";
        ctx.beginPath();
        ctx.arc(x, y, i % 8 === 0 ? 1.3 : 0.65, 0, Math.PI * 2);
        ctx.fill();
      });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  function drawStream(scene) {
    const { ctx, width: w, height: h } = scene;
    if (!ctx || !w || !h) return;
    ctx.clearRect(0, 0, w, h);
    if (
      scene.type === "contact" &&
      contactArtwork?.complete &&
      contactArtwork.naturalWidth > 0
    ) {
      // Cache the artwork at display resolution once; flex a few strips per frame.
      if (
        !scene.texture ||
        scene.texture.width !== Math.ceil(w) ||
        scene.texture.height !== Math.ceil(h)
      ) {
        const texture = document.createElement("canvas");
        texture.width = Math.ceil(w);
        texture.height = Math.ceil(h);
        texture
          .getContext("2d")
          .drawImage(
            contactArtwork,
            0,
            0,
            contactArtwork.naturalWidth,
            contactArtwork.naturalHeight * 0.25,
            0,
            0,
            texture.width,
            texture.height,
          );
        scene.texture = texture;
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      const compactContact = lowPower || innerWidth <= 760;
      const strips = compactContact ? 24 : 48;
      const flexAt = (u) =>
        paused
          ? 0
          : (Math.sin(clock * 0.78 - u * 11) +
              Math.sin(clock * 0.39 + u * 17) * 0.32) *
            h *
            0.024 *
            (1 - Math.min(1, u / 0.62)) ** 1.2;
      for (let i = 0; i < strips; i++) {
        const u = i / strips;
        const width = Math.min(w - u * w, w / strips + 1);
        const flex = flexAt(u);
        const shear = (flexAt(u + width / w) - flex) / width;
        // Interpolate between strip edges so the fibres have no stepped seams.
        ctx.save();
        ctx.transform(1, shear, 0, 1, 0, flex - shear * u * w);
        ctx.drawImage(scene.texture, u * w, 0, width, h, u * w, 0, width, h);
        ctx.restore();
      }
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < (compactContact ? 6 : 12); i++) {
        // Signals follow cached fibre coordinates, with staggered speeds and tails.
        const u = (clock * (0.038 + (i % 3) * 0.008) + i * 0.047) % 0.62;
        const points = scene.renderPoints[i * 7];
        const head = Math.floor(u * 90);
        const point = points[head];
        const strength =
          smooth(clamp(u / 0.07)) * smooth(clamp((0.64 - u) / 0.04));
        ctx.beginPath();
        for (let j = Math.max(0, head - 5); j <= head; j++) {
          const p = points[j];
          if (j === Math.max(0, head - 5)) ctx.moveTo(p.x * w, p.y * h);
          else ctx.lineTo(p.x * w, p.y * h);
        }
        ctx.strokeStyle = "#258bff";
        ctx.lineWidth = compactContact ? 2 : 3;
        ctx.globalAlpha = strength * 0.18;
        ctx.stroke();
        ctx.strokeStyle = "#b6eaff";
        ctx.lineWidth = 0.75;
        ctx.globalAlpha = strength * 0.65;
        ctx.stroke();
        drawNode(
          ctx,
          point.x * w,
          point.y * h,
          i % 3 === 0 ? 1.8 : 1.2,
          strength * 0.85,
        );
      }
      const breath = paused ? 0 : (Math.sin(clock * 1.65) + 1) * 0.5;
      drawNode(
        ctx,
        w * 0.62,
        h * 0.56,
        3 + breath * 0.65,
        0.85 + breath * 0.15,
      );
      if (!paused) {
        // The converged impulse continues down the single outgoing axon.
        const outbound = (clock * 0.19) % 1;
        const x = (0.62 + outbound * 0.34) * w;
        const strength = Math.sin(outbound * Math.PI) * 0.75;
        ctx.strokeStyle = "#b9ecff";
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = strength;
        ctx.beginPath();
        ctx.moveTo(Math.max(w * 0.62, x - w * 0.022), h * 0.56);
        ctx.lineTo(x, h * 0.56);
        ctx.stroke();
        drawNode(ctx, x, h * 0.56, 1.6, strength);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      return;
    }
    if (scene.type === "manifesto") {
      // This signal is scrubbed by scroll only: no clock-driven particles.
      const p = manifestoProgress;
      if (p <= 0 || p >= 1 || paused) return;
      ctx.globalCompositeOperation = "screen";
      const y = cubic(0.69, 0.85, 0.94, 0.55, p) * h;
      ctx.strokeStyle = "#a9edff";
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (let step = 0; step <= 28; step++) {
        const u = Math.max(0, p - 0.065) + (step / 28) * Math.min(p, 0.065);
        const px = u * w,
          py = cubic(0.69, 0.85, 0.94, 0.55, u) * h;
        if (step === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      drawNode(ctx, p * w, y, 5, 1);
      [0.173, 0.538, 0.837].forEach((u) => {
        if (p >= u)
          drawNode(ctx, u * w, cubic(0.69, 0.85, 0.94, 0.55, u) * h, 3, 1);
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      return;
    }
    ctx.globalCompositeOperation = "screen";
    const contact = scene.type === "contact";
    scene.paths.forEach((path, i) => {
      if (contact && (lowPower || innerWidth <= 760) && i >= 90) return;
      if (contact) {
        // Deform cached curves around their fixed convergence point.
        const flex = paused
          ? 1
          : 1 + Math.sin(clock * 0.62 + fibres[i].phase) * 0.085;
        ctx.save();
        ctx.translate(0, h * 0.56);
        ctx.scale(1, flex);
        ctx.translate(0, -h * 0.56);
      }
      ctx.strokeStyle = fibres[i].bright ? "#8fdcff" : "#2e82e4";
      ctx.lineWidth = fibres[i].bright ? 0.9 : 0.55;
      ctx.globalAlpha = fibres[i].opacity * (contact ? 0.7 : 0.8);
      if (scene.type !== "manifesto") ctx.stroke(path);
      if (i % (contact ? 9 : 19) === 0) {
        const at = (clock * 0.035 + 0.18 + i * 0.017) % (contact ? 0.63 : 1);
        const point = scene.renderPoints[i][Math.floor(at * 90)];
        drawNode(ctx, point.x * w, point.y * h, 1.4, 0.75);
      }
      if (contact) ctx.restore();
    });
    if (contact) {
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = "#459fdf";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(w * 0.63, h * 0.56);
      ctx.lineTo(w, h * 0.56);
      ctx.stroke();
      drawNode(ctx, w * 0.63, h * 0.56, 3, 1);
    } else
      [0.18, 0.53, 0.84].forEach((u, i) => {
        const point = scene.renderPoints[i * 19][Math.floor(u * 90)];
        drawNode(ctx, point.x * w, point.y * h, 3, 1);
      });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  const manifestoLines = [
    "Technology should bring",
    "people together.",
    "Across teams. Across branches.",
    "So everyone can work",
    "from the same page.",
  ];
  const words = manifestoLines.join(" ").split(/\s+/);
  manifesto.textContent = "";
  manifestoLines.forEach((line, index) => {
    const lineElement = document.createElement("span");
    lineElement.className = "manifesto-line";
    line.split(" ").forEach((word, at) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      if (word === "together.") span.classList.add("together");
      lineElement.append(span);
      if (at < line.split(" ").length - 1)
        lineElement.append(document.createTextNode(" "));
    });
    manifesto.append(lineElement);
    if (index < manifestoLines.length - 1)
      manifesto.append(document.createTextNode(" "));
  });
  const wordElements = $$(".word", manifesto);
  function setAssemblyProgress(value) {
    assemblyProgress = clamp(value);
    const shell = smooth(clamp((assemblyProgress - 0.08) / 0.6));
    const content = smooth(clamp((assemblyProgress - 0.36) / 0.32));
    branchApp.style.setProperty("--assembly-inset", `${(1 - shell) * 48}%`);
    branchApp.style.setProperty("--assembly-radius", `${mix(70, 12, shell)}px`);
    branchApp.style.setProperty("--assembly-scale", mix(0.96, 1, shell));
    branchApp.style.setProperty("--assembly-content", content);
    branchApp.style.setProperty("--assembly-surface", shell * 0.96);
    const chapter =
      assemblyProgress < 0.25 ? 0 : assemblyProgress < 0.9 ? 1 : 2;
    assembly.setAttribute(
      "data-assembly-state",
      ["spark", "connect", "operate"][chapter],
    );
  }
  function finishAssembly() {
    assemblyStarted = true;
    assemblyPlaying = false;
    setAssemblyProgress(1);
  }
  function startAssembly() {
    if (assemblyStarted || paused || reducedPreference.matches) return;
    assemblyStarted = true;
    assemblyPlaying = true;
    assemblyStartClock = clock;
    setAssemblyProgress(0);
  }
  function updateScrollState() {
    const vh = innerHeight;
    const top = window.scrollY;
    header.classList.toggle("scrolled", top > 50);
    progressBar.style.transform = `scaleX(${clamp(top / Math.max(1, document.documentElement.scrollHeight - vh))})`;
    const rect = assembly.getBoundingClientRect();
    if (rect.top < vh * 0.45 && rect.bottom > vh * 0.15) startAssembly();
    if (assemblyPlaying && (rect.bottom < 0 || rect.top > vh)) finishAssembly();
    const m = manifestoSection.getBoundingClientRect();
    const stageTop = innerWidth <= 760 ? 68 : 72;
    const stageHeight = vh - stageTop;
    const sceneProgress = paused
      ? 1
      : clamp((stageTop - m.top) / Math.max(1, (m.height - stageHeight) * 0.9));
    const reveal = (1 + sceneProgress * (words.length - 1)) / words.length;
    manifestoProgress = sceneProgress;
    manifestoSection.style.setProperty(
      "--trace-stop",
      `${sceneProgress * 100}%`,
    );
    manifestoSection.style.setProperty(
      "--trace-feather",
      `${Math.min(100, sceneProgress * 100 + (sceneProgress === 0 ? 0 : 2.5))}%`,
    );
    manifestoSection.style.setProperty(
      "--trace-progress",
      sceneProgress.toFixed(4),
    );
    manifestoSection.style.setProperty(
      "--manifesto-travel",
      `${paused ? 0 : (clamp((vh - m.top) / (vh + m.height)) - 0.5) * -24}px`,
    );
    manifestoSection.style.setProperty(
      "--underline-progress",
      paused ? 1 : smooth(clamp((reveal - 0.17) / 0.16)),
    );
    wordElements.forEach((word, i) => {
      word.classList.toggle("is-lit", i / words.length < reveal);
      word.style.setProperty(
        "--word-reveal",
        `${smooth(clamp(reveal * words.length - i)) * 100}%`,
      );
      word.style.setProperty(
        "--word-visibility",
        smooth(clamp(reveal * words.length - i)).toFixed(4),
      );
    });
    technicalFigures.forEach((figure) => {
      const r = figure.getBoundingClientRect();
      const progress = clamp((vh - r.top) / (vh + r.height));
      figure.style.setProperty(
        "--spread",
        paused ? 0 : Math.sin(progress * Math.PI).toFixed(3),
      );
    });
  }
  function schedule() {
    if (!disposed && !frameId && !document.hidden)
      frameId = requestAnimationFrame(tick);
  }
  function tick(now) {
    frameId = 0;
    if (document.hidden) return;
    const moving =
      !paused &&
      (heroIntro?.active ||
        assemblyPlaying ||
        scenes.some(
          (scene) => scene.visible && scene.ctx && scene.type !== "manifesto",
        ));
    if (!dirty && now - lastPaint < (lowPower ? 34 : 24)) {
      if (moving) schedule();
      return;
    }
    if (!paused) clock += lastTime ? Math.min(now - lastTime, 50) / 1000 : 0;
    lastTime = now;
    if (dirty) updateScrollState();
    heroIntro?.update(now);
    if (assemblyPlaying) {
      setAssemblyProgress(
        (clock - assemblyStartClock) / (innerWidth <= 760 ? 0.9 : 1.6),
      );
      if (assemblyProgress >= 1) assemblyPlaying = false;
    }
    scenes.forEach((scene) => {
      if (!scene.visible && !dirty) return;
      if (scene.type === "hero") drawHero(scene);
      else if (scene.type === "assembly") drawAssembly(scene);
      else drawStream(scene);
    });
    dirty = false;
    lastPaint = now;
    if (moving) schedule();
  }
  function invalidate() {
    dirty = true;
    schedule();
  }
  function setPaused(value, persist = true) {
    if (value) heroIntro?.finish();
    if (value) finishAssembly();
    paused = value;
    document.body.classList.toggle("motion-paused", value);
    motionButton.setAttribute("aria-pressed", String(value));
    motionButton.setAttribute(
      "aria-label",
      value ? "Enable animation" : "Pause all animation",
    );
    $("span", motionButton).textContent = value ? "Motion off" : "Motion on";
    $("use", motionButton).setAttribute("href", value ? "#play" : "#pause");
    if (persist) {
      savedMotion = value ? "paused" : "on";
      try {
        localStorage.setItem("axon-motion", savedMotion);
      } catch {
        /* Optional preference. */
      }
    }
    if (value)
      $$(".is-pending").forEach((el) => {
        el.classList.remove("is-pending");
        el.classList.add("is-visible");
      });
    invalidate();
  }
  listen(motionButton, "click", () => setPaused(!paused));
  listen(reducedPreference, "change", (event) => {
    if (event.matches) finishAssembly();
    if (!savedMotion) setPaused(event.matches, false);
  });
  listen(window, "scroll", invalidate, { passive: true });
  let resizeTimer;
  listen(
    window,
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = later(() => {
        scenes.forEach(resizeScene);
        invalidate();
      }, 120);
    },
    { passive: true },
  );
  listen(document, "visibilitychange", () => {
    if (document.hidden) {
      finishAssembly();
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastTime = 0;
    } else invalidate();
  });
  if ("IntersectionObserver" in window) {
    const sceneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scene = scenes.find((item) => item.element === entry.target);
          if (scene) scene.visible = entry.isIntersecting;
        });
        invalidate();
      },
      { rootMargin: "80px" },
    );
    observers.push(sceneObserver);
    scenes.forEach((scene) => sceneObserver.observe(scene.element));
    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("is-pending");
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }),
      { threshold: 0.1 },
    );
    observers.push(revealObserver);
    $$(".offer-copy, .company-statement, .delivery-grid article").forEach(
      (el) => {
        el.classList.add("js-reveal");
        if (!paused) el.classList.add("is-pending");
        revealObserver.observe(el);
      },
    );
  }
  listen(branchApp, "focusin", () => {
    finishAssembly();
    invalidate();
  });
  listen(branchApp, "pointerdown", () => {
    finishAssembly();
    invalidate();
  });

  // The product examples and modules share accessible, keyboard-operable tabs.
  function wireTabs(buttons, select, vertical = false) {
    buttons.forEach((button, index) => {
      listen(button, "click", () => select(button));
      listen(button, "keydown", (event) => {
        let next = index;
        if (event.key === (vertical ? "ArrowDown" : "ArrowRight"))
          next = (index + 1) % buttons.length;
        else if (event.key === (vertical ? "ArrowUp" : "ArrowLeft"))
          next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        select(buttons[next]);
        buttons[next].focus();
      });
    });
  }
  function updateTabSelection(buttons, active) {
    buttons.forEach((button) => {
      button.setAttribute("aria-selected", String(button === active));
      button.tabIndex = button === active ? 0 : -1;
    });
  }
  const workflowButtons = $$("[data-workflow]");
  let workflow = "inventory";
  const products = {
    inventory: {
      title: "Stock by branch",
      label: "Inventory",
      columns: ["Item", "Branch A", "Branch B", "Branch C"],
      rows: [
        ["Coffee beans", 120, 85, 64],
        ["Cups", 430, 220, 310],
        ["Milk", 180, 120, 95],
      ],
    },
    people: {
      title: "People by branch",
      label: "People",
      columns: ["Team", "Branch A", "Branch B", "Branch C"],
      rows: [
        ["Branch leads", 1, 1, 1],
        ["Team members", 11, 7, 5],
        ["Total people", 12, 8, 6],
      ],
    },
    reports: {
      title: "A shared branch report",
      label: "Reports",
      columns: ["Stock summary", "Branch A", "Branch B", "Branch C"],
      rows: [
        ["Items tracked", 3, 3, 3],
        ["Units on hand", 730, 425, 469],
        ["Coffee beans", 120, 85, 64],
      ],
    },
  };
  function renderWorkflow() {
    const item = products[workflow],
      branch = $("#branch-filter").value;
    const columnIndices =
      branch === "all" ? [0, 1, 2, 3] : [0, { a: 1, b: 2, c: 3 }[branch]];
    const table = `<div class="table-scroll"><table><thead><tr>${columnIndices.map((i) => `<th scope="col">${item.columns[i]}</th>`).join("")}</tr></thead><tbody>${item.rows.map((row) => `<tr>${columnIndices.map((i, n) => (n === 0 ? `<th scope="row">${row[i]}</th>` : `<td>${row[i]}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
    $("#workflow-panel").innerHTML =
      `<h3>${item.title}</h3><p class="app-subtitle">${item.label} · ${branch === "all" ? "All branches" : `Branch ${branch.toUpperCase()}`}</p>${table}`;
    $("#workflow-panel").setAttribute(
      "aria-labelledby",
      `workflow-${workflow}`,
    );
  }
  wireTabs(
    workflowButtons,
    (button) => {
      workflow = button.dataset.workflow;
      updateTabSelection(workflowButtons, button);
      renderWorkflow();
    },
    true,
  );
  listen($("#branch-filter"), "change", renderWorkflow);
  const modulePanel = $("#module-panel");
  const inventoryMarkup = modulePanel.innerHTML;
  const moduleButtons = $$("[data-module]");
  let activeModule = "inventory";
  const modules = {
    core: {
      name: "Core",
      icon: "grid",
      title: "Your branches.<br>Your starting point.",
      description:
        "The required foundation. Add your tools when you need them.",
      items: [
        "Login and branch access",
        "People, roles and permissions",
        "Home, module billing and an activity log",
      ],
    },
    hr: {
      name: "HR",
      icon: "people",
      title: "Your people.<br>In the right places.",
      description: "Keep your team and branch records together.",
      items: [
        "People and branch roles",
        "Basic attendance records",
        "A shared view of your team",
      ],
    },
    crm: {
      name: "CRM",
      icon: "people",
      title: "Keep the<br>conversation connected.",
      description: "Customers and contacts, with a shared history.",
      items: [
        "Customer and contact records",
        "A basic pipeline",
        "A history of work with each customer",
      ],
    },
    reporting: {
      name: "Reporting",
      icon: "report",
      title: "See the branch.<br>See the whole picture.",
      description: "Branch and network numbers in one place.",
      items: [
        "Branch-level reports",
        "A view across your network",
        "The numbers your team works from",
      ],
    },
    accounting: {
      name: "Accounting",
      icon: "report",
      title: "Clear books.<br>A connected record.",
      description: "Management books, reports and exports.",
      items: [
        "Management books",
        "Internal financial reports",
        "Export or sync to your own registered CAS",
      ],
      note: "This module does not replace BIR invoicing or your registered accounting system. We do not claim BIR accreditation.",
    },
    scheduling: {
      name: "Scheduling",
      icon: "grid",
      title: "Make room<br>for the work ahead.",
      description: "Plan the time your branches need.",
      items: [
        "Bookings, shifts or appointments",
        "A shared branch schedule",
        "Scope agreed for your workflow",
      ],
    },
  };
  function selectModule(button) {
    activeModule = button.dataset.module;
    updateTabSelection(moduleButtons, button);
    modulePanel.setAttribute("aria-labelledby", button.id);
    const name =
      activeModule === "inventory" ? "Inventory" : modules[activeModule].name;
    $("#module-app-label").textContent = name;
    $$("[data-module-shortcut]").forEach((shortcut) =>
      shortcut.setAttribute(
        "aria-pressed",
        String(shortcut.dataset.moduleShortcut === activeModule),
      ),
    );
    $("#module-inquiry").innerHTML = `Ask about ${name} ${icon("diagonal")}`;
    if (activeModule === "inventory") {
      modulePanel.innerHTML = inventoryMarkup;
      return;
    }
    const item = modules[activeModule];
    modulePanel.innerHTML = `<div class="module-panel-content"><div class="panel-icon">${icon(item.icon)}</div><h3>${item.title}</h3><p>${item.description}</p><ul class="module-detail-list">${item.items.map((text) => `<li>${icon("check")}<span>${text}</span></li>`).join("")}</ul>${item.note ? `<p class="module-scope">${item.note}</p>` : '<div class="module-detail-visual" aria-hidden="true"><span></span></div>'}</div>`;
  }
  wireTabs(moduleButtons, selectModule, true);
  $$("[data-module-shortcut]").forEach((shortcut) =>
    listen(shortcut, "click", () =>
      $(`[data-module="${shortcut.dataset.moduleShortcut}"]`).click(),
    ),
  );
  function updateTransfer() {
    const form = $("#transfer-form");
    if (!form) return;
    const data = new FormData(form);
    const summary = `${data.get("from")} → ${data.get("to")} · ${data.get("quantity") || "0"} units`;
    $("#transfer-summary").innerHTML = `${icon("swap")}<span></span>`;
    $("#transfer-summary span").textContent = summary;
    $("#transfer-result").textContent = "";
  }
  listen(modulePanel, "input", updateTransfer);
  listen(modulePanel, "change", updateTransfer);
  listen(modulePanel, "submit", (event) => {
    if (event.target.id !== "transfer-form") return;
    event.preventDefault();
    const data = new FormData(event.target),
      quantity = Number(data.get("quantity"));
    const result = $("#transfer-result");
    if (data.get("from") === data.get("to")) {
      result.textContent = "Choose two different branches to review a move.";
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      result.textContent = "Use a whole quantity from 1 to 10,000.";
      return;
    }
    result.textContent = `Review: ${quantity} units of ${String(data.get("item")).toLowerCase()} from ${data.get("from")} to ${data.get("to")}. This is an example; no stock has moved.`;
  });

  // Native dialogs supply focus containment and Escape handling.
  let dialogOpener = null;
  function openDialog(dialog) {
    if (dialog.open) return;
    dialogOpener = document.activeElement;
    dialog.showModal();
  }
  $$("[data-dialog]").forEach((button) =>
    listen(button, "click", () =>
      openDialog(document.getElementById(button.dataset.dialog)),
    ),
  );
  $$(".site-dialog").forEach((dialog) => {
    listen($(".dialog-close", dialog), "click", () => dialog.close());
    listen(dialog, "click", (event) => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    });
    $$('a[href^="#"]', dialog).forEach((link) =>
      listen(link, "click", () => dialog.close()),
    );
    listen(dialog, "close", () => {
      if (dialogOpener?.isConnected)
        dialogOpener.focus({ preventScroll: true });
    });
  });
  listen(document, "keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const command = $("#command-dialog");
      if (command.open) command.close();
      else {
        $$(".site-dialog[open]").forEach((dialog) => dialog.close());
        openDialog(command);
      }
    }
    if (event.key === "Escape") {
      setMenu(false);
      const open = $("dialog[open]");
      if (open) open.close();
    }
  });
  const menu = $(".menu-toggle");
  function setMenu(open) {
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    $("#mobile-nav").hidden = !open;
  }
  listen(menu, "click", () =>
    setMenu(menu.getAttribute("aria-expanded") !== "true"),
  );
  $$("#mobile-nav a").forEach((link) =>
    listen(link, "click", () => setMenu(false)),
  );
  function setInquiryTopic(topic) {
    const textarea = $("#inquiry-message");
    if (!textarea.value.trim())
      textarea.value = `I’m interested in ${topic}.\n\n`;
  }
  $$("[data-inquiry]").forEach((link) =>
    listen(link, "click", () => setInquiryTopic(link.dataset.inquiry)),
  );
  listen($("#module-inquiry"), "click", () =>
    setInquiryTopic(
      activeModule === "inventory" ? "Inventory" : modules[activeModule].name,
    ),
  );
  listen($("#contact-form"), "submit", (event) => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    $("#inquiry-preview").value = [
      "Axon Enjin inquiry",
      "",
      `Name: ${data.get("name")}`,
      `Work email: ${data.get("email")}`,
      `Company: ${data.get("company") || "Not provided"}`,
      `Branches: ${data.get("branches") || "Not provided"}`,
      "",
      String(data.get("message")).trim(),
    ].join("\n");
    $("#copy-status").textContent = "";
    openDialog($("#inquiry-dialog"));
  });
  listen($("#copy-inquiry"), "click", async () => {
    try {
      await navigator.clipboard.writeText($("#inquiry-preview").value);
      $("#copy-status").textContent = "Copied. Your inquiry has not been sent.";
    } catch {
      $("#inquiry-preview").focus();
      $("#inquiry-preview").select();
      $("#copy-status").textContent =
        "Text selected. Press Ctrl+C or Cmd+C to copy it.";
    }
  });
  listen($("#download-inquiry"), "click", () => {
    const url = URL.createObjectURL(
      new Blob([$("#inquiry-preview").value], {
        type: "text/plain;charset=utf-8",
      }),
    );
    objectURLs.add(url);
    const link = document.createElement("a");
    link.href = url;
    link.download = "axon-enjin-inquiry.txt";
    link.click();
    later(() => {
      URL.revokeObjectURL(url);
      objectURLs.delete(url);
    }, 1000);
    $("#copy-status").textContent =
      "Download prepared. Your inquiry has not been sent.";
  });
  $("#year").textContent = String(new Date().getFullYear());
  scenes.forEach(resizeScene);
  setPaused(paused, false);
  document.fonts.ready.then(() => {
    if (!disposed) {
      scenes.forEach(resizeScene);
      invalidate();
    }
  });
  return () => {
    const restorePending =
      introWasPending &&
      !heroIntro?.active &&
      document.documentElement.classList.contains("intro-pending");
    disposed = true;
    events.abort();
    observers.forEach((observer) => observer.disconnect());
    timers.forEach((timer) => clearTimeout(timer));
    cancelAnimationFrame(frameId);
    frameId = 0;
    heroIntro?.finish();
    heroMotion?.dispose();
    objectURLs.forEach((url) => URL.revokeObjectURL(url));
    snapshots.forEach((html, element) => {
      if (element) element.innerHTML = html;
    });
    document.body.classList.remove("motion-paused");
    manifestoSection.classList.remove("is-scroll-staged");
    document
      .querySelectorAll("dialog[open]")
      .forEach((dialog) => dialog.close());
    // Strict Mode's immediate setup/cleanup cycle must preserve an unstarted intro.
    if (restorePending && originalSkip) {
      document.body.append(originalSkip);
      document.documentElement.classList.add("intro-pending");
      window.axonIntroDeadline = window.setTimeout(() => {
        if (!document.documentElement.classList.contains("intro-active")) {
          document.documentElement.classList.remove("intro-pending");
          originalSkip.remove();
        }
      }, 8000);
    }
  };
}
