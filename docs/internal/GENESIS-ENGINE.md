# Genesis engine — craft notes

Internal. Not website doctrine. Copy and IA live in `docs/grounding/` (`COMMERCIAL-MODEL-V2.md`, `WEBSITE-CONTRACT.md`, `SITEMAP.md`) and root `NARRATIVE.md`.

Recreate the **Axon Enjin** company homepage genesis with high visual fidelity as Tailwind CSS and vanilla JavaScript: **one node sparks, multiplies, connects, orbits, and resolves into a living network.** The network *is* the hero asset — there is no hero video.

This host does **not** sell. Scene copy is company presence (*The one who connects.*), not a product catalog.

---

## SOURCE QUIRKS TO PRESERVE

- **There are two clocks, and only one timeline.** The sequence boots on a real-time clock, stops dead at `p = 0.30`, and hands the *same* timeline to scroll. One master value drives everything:
  ```js
  const HOLD = 0.30;
  target = Math.max(bootValue, HOLD + (1 - HOLD) * scrollRatio);
  p += (target - p) * 0.075;
  ```
  Because it is a `max`, the boot can never replay and scroll can never rewind below `HOLD`. Scrolling during the boot simply skips ahead.
- The entire genesis sequence plays out over a single **`h-[700vh]`** container with one `sticky top-0 h-screen` stage. Every scene is a layer inside that one stage, never a separate scroll section.
- Nothing is physically simulated. Every node's **final** position is generated once at load; the node animates from the singularity to that final position along an eased path with a per-node delay. Scroll progress is the only clock, so the scene is perfectly scrubbable backwards.
- The edge list is computed **once**, from final positions, because rotation is rigid and never changes the distance between two nodes. Recomputing pairs per frame is the mistake to avoid.
- Chapter labels change at hard scroll thresholds: **0.14, 0.34, 0.56, 0.78**.
- Scroll progress is smoothed with a `lerp` factor of **0.075**. All scene math reads the smoothed value, never the raw one.

---

## CRITICAL FIDELITY CONSTRAINTS

- Palette is **blue and black only**. No warm tones anywhere except the white impact flash.
  - `--void: #04060d` (page black / cinematic bg)
  - `--deep: #0a1424` (elevated surfaces, cards)
  - `--blue: #2e6fff` (primary accent, CTAs, active states)
  - `--cyan: #56c8ff` (signal pulses, node cores, glows)
  - `--ice:  #cfe3ff` (body text on dark)
  - `--white:#ffffff` (headings, impact flash only)
- Layer stacking is critical: `isolation: isolate` on the stage and `will-change: transform` on the camera rig, or the scene flickers while scrubbing.
- Atmospheric layers (glow, fog, rays, depth echo) **must** use `mix-blend-mode: screen`, otherwise they render as solid blocks instead of light.
- The stage must always sit on `#04060d`, never on a gradient, so the screen-blended layers read correctly.

---

## TYPOGRAPHY

- **Title / display: `JamjanNP`** — used only for the wordmark and the single largest hero line.
- **Headings: `Anton`** — all `h2`/`h3`, uppercase, tight tracking (`-0.02em`), line-height `0.92`.
- **Body / UI: `Garet`** — all paragraphs, nav, labels, buttons. Weights 300/400/500.

Loading (in this order, and keep the fallbacks — two of these three are not on Google Fonts):

```html
<!-- Anton: Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
<!-- Garet: CDNFonts -->
<link href="https://fonts.cdnfonts.com/css/garet" rel="stylesheet">
<!-- JamjanNP: self-host, place the file at ./fonts/JamjanNP.woff2 -->
<style>
  @font-face{ font-family:'JamjanNP'; src:url('./fonts/JamjanNP.woff2') format('woff2');
              font-weight:400; font-display:swap; }
</style>
```

Tailwind config:

```js
fontFamily: {
  display: ['JamjanNP','Anton','serif'],
  heading: ['Anton','Impact','sans-serif'],
  sans:    ['Garet','Inter','system-ui','sans-serif']
}
```

Anton has one weight (400) — never apply `font-bold` to it. Garet is the only font allowed to carry small text.

---

## TECH STACK

- Tailwind CSS (CDN: `https://cdn.tailwindcss.com`)
- Iconify (CDN: `https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js`)
- Vanilla JS only. No GSAP, no Three.js, no scroll library. One `<canvas>` per visual layer, one `requestAnimationFrame` loop for the whole page.

---

## THE GENESIS ENGINE (Section 1)

### Geometry, generated once at load

```
N        = 260 nodes
For each node i:
  final position = point on a sphere shell, radius 0.55 to 1.0, distributed by
                   the golden-angle spiral (NOT Math.random on all three axes —
                   uniform random clumps at the poles and looks like noise)
  birth   = eased along i, so growth accelerates:  birth_i = (i / N) ** 1.15 * 0.46
            node 0 has birth 0 and is THE singularity
            The exponent decides how much mass the blast throws. At 0.62 the
            first crack births only 23 of 260 and the blast reads as empty;
            1.15 gives ~52 in the first 150ms and ~180 by the hold.
  seed    = a stable per-node random, used for drift phase and pulse offset
```

Edges: for every pair with final distance `< 0.30`, store `{i, j, w: 1 - d/0.30}`. Expect roughly 900 to 1400 edges at N=260 — if you get more than ~2500, lower the threshold, do not lower the frame budget.

### Node life, per frame

```
age_i   = (i === 0) ? 1 : clamp((p - birth_i) / 0.10)
pos_i   = lerp(ORIGIN, final_i, easeOutCubic(age_i))
scale_i = age_i < 0.25 ? age_i * 4 : 1          // flash-pop at the instant of birth
```

**Node 0 must be hardcoded to `age = 1`.** Derive it from progress and it gets `age = 0` at `p = 0`; the draw loop skips anything at `age <= .001`, so there is no atom on the canvas at all through the twitch and the blast detonates over an empty screen. What looks like an atom in that state is only the CSS core bloom.

`ORIGIN` is dead center, `(0,0,0)`. Every node is born from the same point. That is the whole idea — do not scatter their start positions.

An edge only draws when **both** endpoints have `age > 0.85`, and its alpha ramps `0 -> 1` over the next `0.04` of progress. Connections must visibly lag behind the births, never appear at the same instant.

### How a node is drawn — "Plasma"

Chosen from six rendered candidates (halo, pin-and-rim, wireframe, terminal glyph, facet, plasma). Two things per node, in **two separate passes over the same projection**:

1. **Bloom** — a pre-rendered radial-gradient sprite (`white -> #c8e6ff -> #56c8ff -> transparent`) blitted at `size = min(r*9, 520)` with `globalCompositeOperation = 'lighter'` and `globalAlpha = min(1, a*1.15)`. Additive is the point: dense regions self-brighten, so the finale's "the connections are the subject" beat comes from the renderer instead of a hand-keyed alpha curve.
2. **Core pin** — a plain filled arc at `r * 0.62`, `rgba(240,250,255,a)`, `source-over`. **Bloom without the pin reads as fog, not as points in space.** That is what sank the wireframe candidate.

Rules that are not optional:

- **Two sprite sizes, 32px and 128px, picked by target size** (`>48px` takes the big one). Almost every node blits at ~11px, and resampling a single 128px source down that far measured **15.7ms/frame at the finale against 8.0ms for the arcs it replaced**. With the pair it is **7.9ms** — parity. A one-size sprite is the difference between a free win and a 2x regression.
- **Skip the bloom entirely below 2.5px**; the pin already covers it.
- **The bloom pass needs no depth sort.** Additive blending is commutative. Only the pin-and-label pass walks `order` far-to-near.
- **Compute `a` and `r` once, in pass 1, into shared buffers.** `a` reads `ptr.active` and `fadeOf`; recomputing it in pass 2 lets the core and its bloom drift apart.
- **Restore `globalCompositeOperation` and `globalAlpha` before the pass ends.** Everything after it — labels, shockwaves, dust — inherits whatever is left set, and additive text blows out to white.

Edges are additionally gated on absolute progress by `clamp((p - 0.22) / 0.12)`, so the first connections form late in the main wave and roughly 257 of them exist by `HOLD`. **Do not set that gate at or above `HOLD` (0.30).** It was `clamp((p - 0.30) / 0.06)`, exactly the boot's ceiling, which meant all 491 edges were suppressed for the entire 5s splash — the blast produced scattered dots that never became a network, and the intro read as disconnected from the scroll phase that follows.

### Camera, per frame

| Progress | camera Z | behaviour |
|---|---|---|
| 0.00 | 0.75 | inside the singularity, the one node fills the screen |
| 0.14 | 2.20 | violent pull-back as the burst begins |
| 0.40 | 3.10 | wide, watching the cloud fill out |
| 0.70 | 2.40 | pushing back in as connections dominate |
| 1.00 | 2.05 | settled, slow orbit |

Interpolate with `easeInOutCubic` between the keys. Rotation: `rotY = p * 3.6`, `rotX = sin(p * 2.4) * 0.30`.

---

## THE CAMERA GOES INSIDE

Scroll does not orbit the cloud — it **flies you into it and down a corridor**. That demands a real pinhole camera with a near plane, which the exterior-only version never needed.

```js
const FOCAL_IN = 1.60, NEAR = .12, FOG_NEAR = 2.4, FOG_FAR = 7.0;

// world -> camera: TRANSLATE first, then aim. Rotate first and the look
// direction pivots around the world origin instead of the camera.
const dx = wx-cam.x, dy = wy-cam.y, dz = wz-cam.z;
const X = dx*cosYaw + dz*sinYaw;
let   Z = dz*cosYaw - dx*sinYaw;
const Y = dy*cosPitch - Z*sinPitch;  Z = Z*cosPitch + dy*sinPitch;
const depth = -Z;                                   // camera looks toward -z
if (depth < NEAR || depth > FOG_FAR) { vis[k] = 0; continue; }   // REAL cull
const f = FOCAL / depth;
```

- **The old `f = camZ / max(camZ - z, .25)` cannot go inside.** That clamp exists only because the camera was always outside; cross into the cloud and every node behind the lens gets `f = 4*camZ` and lands as a giant mirrored dot. Replace it, do not patch it.
- **Cull edges when either endpoint is culled.** A line to a node with no valid screen position streaks across the entire frame. This is *the* artifact of going inside — assert the count is exactly 0.
- Trails and pointer springs must skip culled nodes too, or they smear from stale coordinates.
- **Painter's order**: sort visible indices by depth descending each frame and draw nodes far-to-near. Cheap (~290 visible) and required once near and far overlap.
- **Focal equals camera distance while outside.** That is algebraically identical to the old projection, so the boot frames unchanged — verified at **0px difference** across the whole boot. It widens to `FOCAL_IN` across the dive for a dramatic tunnel lens.
- **Handheld float is interior-only.** Left running during the boot it adds a ~32px sway on top of the rig's CSS pan that the verified sequence never had.

### Geometry: ball plus corridor

The ball (nodes `0..259`) is untouched — the whole boot is tuned against it. A corridor of 800 more extends along `-z`:

```
u = (i-260)/M
z      = -0.6 - u*19
radius = (.35 + .5*hash(i)) * (.70 + .5*sin(u*6*PI))   // chambers and necks
birth  = .32 + clamp(u*.60 - .08)                      // after the pause, ahead of the camera
```

- **The corridor must be longer than flight distance + fog depth.** At length 11 with the camera stopping at `-10.2`, the tunnel emptied to 69 visible nodes at the end. Length 19 against a `-12` stop keeps ~290 nodes and ~1400 edges in view at every depth.
- **The corridor needs its own link threshold** (`0.36` vs the ball's `0.26`). It is sparser, so at the ball's threshold mean spacing exceeds reach and the tube reads as loose drifting dots instead of a structure.
- **Never link ball to corridor.** The ball spins and the corridor does not, so a cross-group edge stretches and swings every frame.
- **The ball keeps its world spin; the corridor is fixed in world space.** Rotating the corridor about Y would swing the flight path out from under the camera.

### The destination — where the tunnel arrives

The flight ends at **the network from the opening, now wired up and named**. Same generator as the ball (offset hash so it is not a literal clone), `D = 300`, centred at `Z_DEST = -14.8`, `birth .72` so it materialises out of the fog as you approach.

- The camera parks at `-12.0`, which puts the destination `2.8` ahead — **the same distance as the opening pause**, and the lens narrows back to `2.40` across `.86 → 1.0` so it fills the frame exactly as the ball did. That framing rhyme is the whole point: you end where you began, connected.
- **Connections form on arrival.** Nodes are already there; a per-group edge gate `clamp((p-.84)/.10)` wires them up between `.84` and `.94` while a `win(p,.84,.87,.93,.99)` window runs the fresh links hot white before they settle to cyan. The edge gate **must be per group** — a single global gate cannot give the destination its own beat.
- **Labels live here, on the outer shell.** Six labels on high-index (large radius) nodes; inner-shell nodes sit too close to the core to read. Gate them on real depth (`pdep < camDist + .40`), not on `pf > .85` — `pf` is `focal/depth` and lands right on `.85` at this distance, so it flickers. Four are visible at rest and **all six are reachable by orbiting**, which is what makes turning it worth doing.
- Corridor shortened to `12.9` so it opens into the chamber instead of running through it. It no longer has to outlast flight+fog alone, because the destination fills the far field from `p ≈ .70`.

### Drag: one pivot, three behaviours

The subject must never be lost off-screen. It is solved structurally, not with a clamp:

```js
orbitAmt = max(1 - seg(p,.30,.42), seg(p,.78,.88));   // 1 outside, 0 in tunnel, 1 at the end
pivotZ   = keyed(p, [[0,0],[.35,0],[.80,Z_DEST],[1,Z_DEST]]);
// world rotates about the pivot by orbit.* * orbitAmt; camera aims by orbit.* * (1-orbitAmt)
```

- **Outside and at the destination, drag orbits a subject at screen centre** — it cannot leave the frame. Verified: a full 6-radian yaw sweep moves the destination's centroid by at most 44px.
- **The rotation applies to the SUBJECT GROUP ONLY, never the whole world.** Rotate everything about the destination's centre and the corridor swings with it, sweeping tunnel fragments across the object you are inspecting. Assert a drag at the finale moves destination nodes and **zero** corridor nodes.
- **Fade the corridor out on arrival** (`1 - seg(p,.84,.95)`). Its last stretch lies between the camera and the destination, so leaving it lit clutters the final shot even when it is holding still.
- **In the tunnel there is no subject**, so drag aims the camera, clamped to `±0.45` yaw / `±0.40` pitch and decaying `*= .94` back to centre on release (~1.5s).
- **Hitting a bound must zero the velocity into it.** Otherwise a hard fling re-slams the clamp every frame and the view sits pinned at the limit instead of easing back. An 18.9-radian fling — three full revolutions — must clamp and then recentre.
- The orbit integration has to run **after** `p` is computed, or the phase test reads a stale progress value.

### Camera path and fog

`CAM_Z` keys: `.30 → 2.84` (the pause) `→ .42 → 0` (crossing in) `→ -12.0` at `p=1`. **Space the corridor keys evenly** — `keyed()` eases in-out on every leg, so widely spaced keys make the flight lurch (slow, then a rush).

```js
alpha *= clamp((depth-NEAR)/.5)                                   // fade in at the lens
       * (1 - fogAmt*clamp((depth-FOG_NEAR)/(FOG_FAR-FOG_NEAR))); // fog out
```
Fog ramps in with the dive so the exterior keeps its original look. It is also the performance mechanism: culling at `FOG_FAR` bounds per-frame work to ~290 nodes regardless of how long the corridor is. Measured **7.1ms per frame** at the deepest point against a 16.7ms budget, with the blurred depth-echo pass faded out across the dive.

**Drag becomes look** once inside: `orbit.x` is yaw, `orbit.y` is pitch, applied as camera rotation instead of world spin. Inertia, the `±1.15 rad` pitch clamp and the touch `pan-y` rule all carry over unchanged.

---

## BOOTING — WHAT COMES BEFORE THE LOADER

The collision is an animation, not a progress bar, so it must not start until the page can actually run it at frame rate. A three-dot boot screen covers the gap.

- **The dots are painted by critical CSS inlined in `<head>`, with no dependency on Tailwind, the fonts, or the app script.** They are the first element in `<body>`. This is the whole point: they render on the first frame, whatever else is still in flight.
- **Nothing render-blocking may sit in `<head>`.** Move `cdn.tailwindcss.com` and Iconify to the **end of `<body>`** (Tailwind first, then its config assignment — the Play CDN needs that order), and load the font stylesheets with `media="print" onload="this.media='all'"`. As blocking head resources these held first paint at ~440ms with nothing on screen.
- **Gate the reveal on three things**: the `load` event and `document.fonts.ready` (capped at 3.5s so a slow CDN cannot strand anyone), a **Tailwind probe** (append a `bg-void` element and check the computed colour is `rgb(4,6,13)` — Tailwind is a runtime compiler down there, and revealing before it finishes flashes unstyled markup), and **3–4 warm frames**, so the collision's first frame is not the one paying for layout.
- Once booted, set `gateReady = true`. Readiness is already proven, so the approach runs as a clean constant-speed animation and the stalled-hover path never triggers.
- **Skip the canvas entirely while the overlay is opaque.** During the approach the loader covers everything, so rendering 1120 nodes and 4427 edges underneath buys nothing and steals frames from the one thing being watched. Start rendering at the closing rush — well before the overlay fades, so the atom is there for the handoff.
- Build edges with **squared distance**, taking `Math.sqrt` only on the ~4400 hits rather than all 627k pair tests. `Math.hypot` is overflow-safe and slow; this is a free 2x (24ms → 13ms).

Remaining lever, not taken: the Tailwind Play CDN is a build tool doing its work in the browser on every visit. Compiling the CSS ahead of time is the real cold-load fix, but it needs a build step, which this project deliberately does not have.

---

## THE LOADER

Axon has no binary assets, so there is nothing heavy to preload — but the site must still perform an introduction on its own clock before it asks the user for anything. The loader is what buys that, and the wait it shows is real: **fonts genuinely block text render**, so it gates on `document.fonts.ready`.

```js
const MIN_DWELL = 1.2, CAP = 3.0;                     // seconds
Promise.race([ document.fonts.ready, timeout(CAP) ]).then(() => gateReady = true);
const shown = Math.min(elapsed / MIN_DWELL, gateReady ? 1 : .92);
```
`MIN_DWELL` gives the charge time to read; the `CAP` race means a slow font CDN can never strand anyone. `shown` never claims 100% before the gate clears and never stalls at 0.

Composition — **two points converging on the horizontal centre line**, nothing else. No wordmark, no percentage. The singularity is not a given; it is *caused*, by two things meeting. For an agency named Axon that origin is the thesis.

**The gap is the progress bar**, and the two points move at **one constant speed the whole way in**. No easing on approach, no acceleration at the end, no velocity change as they meet — the motion must read as two objects travelling, not as an animation with a curve on it:

```js
const FLOOR = 110;                               // hover distance if the gate stalls
const travelPx = () => innerWidth*.55 + 60;
// derive the closing duration from the SAME speed the approach uses
const closeDur = () => FLOOR / ((travelPx() - FLOOR) / MIN_DWELL);

// 1. APPROACH — gate-driven, LINEAR
const trem = gateReady ? 0 : Math.sin(t*9)*2.5;  // trembles only while stalled
gap = FLOOR + trem + (1 - shown) * (travelPx() - FLOOR);
if (shown >= 1) tClose = t;

// 2. CLOSE — time-driven, LINEAR, same px/sec
gap = FLOOR * (1 - clamp((t - tClose)/closeDur()));
```

At a 939px viewport both phases run at **389px/s** and the close takes 283ms. Assert that equality after any change to `MIN_DWELL` or `FLOOR` — it is the whole point of deriving `closeDur` rather than hardcoding it.

- **The close must still be its own timed phase.** Driving the final gap off progress closes it in one frame and the points read as *vanishing* rather than colliding.
- `FLOOR` is now only the stalled-hover distance. It no longer tunes an acceleration, because there is no acceleration. If the gate stalls the points hover with a small tremble; if it never stalls, they simply arrive.
- Each point trails a **wake**: a `1px` horizontal gradient extending *away* from its direction of travel, length `min(speed*7, 220)px`. Anchor it on the trailing side (`flex` for the left traveller, `flex-row-reverse` for the right) or it renders ahead of the dot. With constant speed the wake is a constant length, which is correct — it is a speed readout.
- The dots are `9px`, identical to the atom the canvas draws for node 0, because one of them effectively becomes it.
- Progress also shows as a dim **hairline rail at `bottom-8`, `w-56`** — same geometry as the scroller's rail, so the loading bar becomes the progress rail. Redundant with the gap by design: the gap is atmospheric, the rail is unambiguous.

Contact, no cut: a short white radial pops, the two travellers are hidden, and the atom left behind flares (`scale(1 → 2.6)`, opacity `1 - c²`) over 300ms while the overlay fades over 220ms starting 80ms in. **The boot clock starts at contact**, so the stage atom is already twitching behind the overlay as it dissolves.

**The splash carries no copy whatsoever** — no wordmark, no scroll prompt, no HUD, no rail. Two points meet, the thing detonates, the cloud multiplies into a network, and it waits. Not one word appears until the user scrolls.

---

## THE BOOT SEQUENCE (real clock, autoplays after the loader)

Nothing here is scroll-driven. `bt` is seconds since **contact** — not since the first frame.

Contact → blast → the cloud multiplying is **one unbroken move**. There is no twitch, no charge, no blackout, no stutter beat. Every one of those was a frame that held still between the collision and the expansion, and each one reads as lag:

| Window | Beat | Behaviour |
|---|---|---|
| `0.00 – 0.10s` | **CORE** | The merged point sits at centre, steady, `p` pinned at 0. Dust takes a quick inhale toward centre. The core bloom is scaled to `0.26` — at full size it is a ~250px blob and a lone point reads as fog. 100ms, no more: this is a breath, not a beat. |
| `0.10s` | **BLAST** | Flash (peaks ~0.13), shockwave, camera shake, lens punch, chroma split, dust shoved outward, bloom blows open to full. |
| `0.10 – 4.60s` | **MULTIPLY** | One continuous `outQuart` expansion. ~12 nodes by 0.15s, 65 by 0.5s, 114 by 1.0s, 180 by the hold. Motion-blur trails live, second shockwave, afterglow decaying. |
| `> 4.60s` | **HOLD** | `p` parks at exactly `0.30`. ~180 nodes, ~257 edges — **a visible network, not scattered dots**. It drifts, auto-rotates and stays interactive, but goes nowhere. Only the `SCROLL TO CONNECT` cue is on screen. |

Progress curve — **one continuous curve, not a multi-leg one**:

```js
p = HOLD * outQuart(seg(bt, BOOT.blast, BOOT.hold));
```
Every join between legs is a velocity discontinuity. The earlier crack/beat/wave split hitched twice, visibly. A single `outQuart` gives fast-out-of-the-blast and a long settle with nothing in between. Verify it lands on `.300` exactly and is monotonic — a non-monotonic curve makes nodes retreat into the singularity mid-burst.

**The centre point must be perfectly steady** — constant radius, no sine breathing, no jitter. A pulsing or trembling point at the middle of the frame reads as flicker, not as life. Assert zero drift on it across frames.

During the boot, assign `p = bootProgress(bt)` directly. Do **not** run it through the `0.075` lerp: the smoothing blurs a choreography that is already frame-exact, and softens the stutter beat into nothing.

The hold is the whole point: the site finishes its own introduction, then visibly waits. Reaching `HOLD` must feel like a held breath, not a stall — keep the auto-rotation (`rotY += t * 0.045`), the dust drift, and the pointer interaction all live while paused.

`prefers-reduced-motion: reduce`: skip loader and boot entirely, start at `HOLD`, no jitter, no shake, no flashes.

---

## THE IMPACT CLOCK

Impact effects must **not** be keyed to progress. Progress is the only clock in the scroll phase, but during a 2.9s burst a progress-keyed flash stretches with the burst — a 340ms blast becomes 1.5s of fog, and a 117ms blackout becomes unusable. One normalized envelope, fed by whichever clock owns the timeline:

```js
const ic = booting ? clamp((bt - BOOT.blast) / 1.40)  // absolute seconds: 100ms stays 100ms
                   : seg(p, .06, .16);                // progress fallback
```

| Effect | From `ic` | Wall-clock |
|---|---|---|
| white flash | `win(ic, 0, .02, .07, .25) * 0.9` | 343ms |
| camera shake | `ic < .36 ? sin(t*62) * 9 * (1 - ic/.36) : 0` | ~500ms |
| shockwave 1 | radius `ic * 3000`, alpha `1 - ic` | 1.40s |
| shockwave 2 | spawns at `ic > .55`, radius `i2 * 2400` | ~630ms |
| chroma split | `shake * 0.75` px on the depth canvas x | with the shake |
| lens punch | `win(ic, 0, .02, .06, .34) * .05` added to zoom | ~450ms |

**Every window must be derived from `BOOT`, never written as literal seconds.** `win(v,a,b,c,d)` has no guard against `c > d`: invert that pair and `seg` returns negatives, the fade-out clamps to 0, and the effect latches **on forever**. This actually happened — a retiming left a full-screen blackout window on literals, its fade-out pair inverted, and the curtain dropped mid-sequence and never lifted, blacking out the rest of the intro while the canvas underneath rendered perfectly (36k lit pixels). After any retiming, sweep every envelope across `0 → BOOT.hold` and assert nothing is still opaque after the blast.

One exception, deliberate:

- The `ic` **progress branch is unreachable by scrolling**. Scroll-driven `p` is `HOLD + 0.70 * scrollRatio`, so it spans `[0.30, 1.00]` and can never enter the `0.06–0.16` impact window. The branch exists because it degrades correctly — at any `p ≥ 0.16` it returns 1, meaning "blast finished" — which is exactly what reduce-motion mode needs when it starts at `HOLD`. Do not delete it, and do not expect scrubbing to replay the blast.

---

## ORBIT — THE USER STEERS THE NETWORK

Drag anywhere on the stage to turn the cloud, with inertia on release. This is the signature interaction: the network is not a video of a network, it is an object you can handle.

```js
const orbit = { x:0, y:0, vx:0, vy:0, dragging:false, idle:99 };
const ORBIT_MAX_X = 1.15;                  // radians of tilt, short of the poles

// on drag:  orbit.x += dx * .006;  orbit.y = clamp(orbit.y + dy * .004, ±MAX)
// per frame, released:  orbit.x += orbit.vx;  orbit.vx *= .94;  orbit.idle += dt
// applied:  ry = p*3.6 + spin + orbit.x        rx = sin(p*2.4)*.30 + orbit.y
```

- **Bind `pointerdown` to the stage, not the window.** That excludes the nav and every section below it for free, with no hit-testing. Keep an `a,button` guard for the CTA inside the stage — and test `e.target instanceof Element` first, or a synthetic event whose target is `window` throws on `.closest`.
- **Clamp the vertical tilt** to `±1.15 rad`. Unclamped, a long upward drag rolls the cloud over its pole and the scene turns inside out.
- **Inertia**: `vx *= .94` coasts for ~78 frames (1.3s) then rests. Momentum is what makes it feel like mass rather than a slider.
- **Touch must not steal vertical.** Set `touch-action: pan-y` on the stage and ignore `dy` when `pointerType !== 'mouse'`. Horizontal drags orbit, vertical drags scroll the page. Taking both axes on a phone traps the user in the hero.
- **Suppress node repulsion while dragging** (`K = 0`). The cloud is being turned, not poked; both at once reads as mush.
- **Auto-spin must be integrated, never `t * rate`.** It ramps down while the user steers and back in ~1.6s after release, and scaling a large `t` by a changing factor jumps the angle by whole radians the instant the factor moves. Accumulate instead: `spin += dt * rate * ramp` — max step measured at 0.043°/frame.
- `cursor: grab` / `grabbing` on the stage, or the affordance is invisible.

---

## POINTER INTERACTION (hover)

Hovering pushes the nodes around; dragging orbits the whole cloud (above). The nodes are touchable at every stage, including during the hold. Do this in **screen space** with springs — do not add a 3D physics engine.

```
per node: ox, oy (offset px), vx, vy (velocity)   // Float32Array(N)

repel radius R = 170px
force      K  = 2.0     (0 while orbiting — the drag owns the pointer)

each frame, ONCE (main canvas pass only):
  d = distance(projected node, pointer)
  if d < R:  f = (1 - d/R) * K   applied along (node - pointer)
  vx = (vx + fx - ox * 0.055) * 0.88      // spring home + damping
  ox += vx

then, EVERY pass:  px += ox;  py += oy
```

- Apply the offsets **after** projection and **before** drawing, so edges stretch with the nodes they connect. Edges reading un-offset coordinates is the tell that this was done wrong.
- Integrate once per frame, not once per canvas. The depth-echo pass must reuse the offsets, never re-integrate them (pass an `integrate` flag).
- Nodes within `190px` of the pointer brighten (`+0.45` alpha) and grow (`+1.1px` radius) — the cloud reacts *before* contact.
- A `256px` blue radial `mix-blend-mode: screen` div follows the pointer, `opacity 0.5`, `0.9` and `scale(1.35)` while down.
- Equilibrium displacement is `K / 0.055` ≈ 36px while hovering. Nodes must always return home; a permanent dent means the spring term is missing.
- Use `pointer*` events only (never `mouse*`), all `{passive:true}`, so touch drag works without blocking scroll.

---

## SCROLL SEGMENTS

Segments `0.000 – 0.300` are played by the boot. Everything from `0.300` on is scroll.

**The intro shows the network and nothing else. All copy belongs to scroll.** Every scene is keyed *above* `HOLD` and multiplied by an actual-scroll gate, so no text can appear during the boot or at the pause:

```js
const scrolled = clamp(raw * 12);          // 0 while parked, 1 once the user moves
setScene(scene, win(p, ...) * scrolled, ...);
hud.style.opacity = railWrap.style.opacity = scrolled;
```

Scene windows, all above `0.30`: `[.315 .375 .46 .52]`, `[.52 .58 .65 .70]`, `[.70 .75 .82 .86]`, `[.88 .93 1.01 1.02]`. Verify no two are ever above 0.5 simultaneously; the small copy-free crossovers between them are intended breathing room.

Keying a scene *at* `0.30` is the trap — scroll-driven `p` starts at exactly `HOLD`, so a window that opens at `.17` is already fully open before the user has scrolled a pixel, and the "network only" intro ends with a wall of text sitting on it. The chapter HUD and progress rail are chrome, not network: they arrive with the first scroll too. The only thing permitted at the pause is the `SCROLL TO CONNECT` cue, which fades out as `scrolled` rises.

**0.000 to 0.060 — SINGULARITY.**
Pure black. One node, centered, radius pulsing `2px to 5px` at ~0.8Hz, with a `blur(18px)` cyan bloom behind it — what the loader's collision left behind. `AXON` resolves in below it in JamjanNP at `clamp(56px, 12vw, 160px)`, letter-spacing `0.32em`, over `bt 0.30 → 1.05s`. Nothing else exists on screen yet.

**0.060 to 0.140 — IGNITION.**
White `impact-flash` fires (peak opacity 0.85 at p=0.075, gone by 0.11). The single node splits: nodes 1 to 24 launch outward. A shockwave ring expands from center — a stroked circle, radius `(p-0.06)*4200px`, alpha fading to 0. Camera rig shakes: `sin(t*62) * 9px`, damped by distance from p=0.085. Chapter label switches to **IGNITION** at 0.14.

**0.140 to 0.400 — MULTIPLICATION.** *(the boot ends inside this segment, at 0.300)*
Nodes stream outward continuously. Still almost no edges — this segment must feel like scattering dust, not a network. Left-aligned copy, x from `-120px` to `0`, at **full opacity across 0.24 to 0.34** so it is the frame the hold rests on, out by 0.40:
> `01 — MULTIPLICATION` (Garet, uppercase, tracking .34em, `--blue`)
> **ONE SPARK BECOMES A THOUSAND** (Anton)
> body: "Every product starts as a single idea in one person's head. Then it has to survive contact with everyone else." (Garet)

**0.340 to 0.560 — FIRST CONTACT.**
The first thing the user's own scroll does is *make connections happen* — edges ignite here and nowhere earlier. Draw order: edges under nodes, always. Edge alpha `w * 0.42 * depthFactor`, stroke `rgba(86,200,255,a)`. The first travelling pulse appears here — a `1.6px` dot moving along each edge at `(t*0.22 + w*3.7) % 1`, colour `--blue`, alpha `(1-q) * a * 4`. Right-aligned copy, visible 0.45 to 0.51:
> `02 — FIRST CONTACT`
> **CONNECTION IS THE PRODUCT**
> body: "Strategy, design, engineering, growth. Four disciplines only matter at the points where they touch."

**0.560 to 0.780 — ORBIT.**
The cloud is complete and now behaves as one body: rotation continues, camera orbits, a slow `rotate(p*2.4 - 1)deg` on the rig. Six named nodes fade in labels (`Founders, Strategy, Design, Engineering, Growth, Users`) in Garet 11px, drawn on canvas next to the node, only when that node's projected depth `f > 0.85` so labels never render behind the sphere. Centered copy, visible 0.59 to 0.75:
> `03 — ORBIT`
> **THE NETWORK HOLDS ITS SHAPE**

**0.780 to 1.000 — ASCENSION.**
Second impact flash (weaker, 0.55 peak) at 0.795, this one tinted `--blue` not white. All edges flash to white for ~0.03 of progress, then settle. Final centered scene:
> `04 — ASCENSION`
> **AXON** (JamjanNP, `clamp(64px,14vw,220px)`)
> subline in Anton: **EVERY CONNECTION IS A DECISION**
> CTA pill: `bg-[#2e6fff] text-white`, Garet 500, label "Let's collaborate", icon `solar:arrow-right-linear`.

A thin progress rail sits at `bottom-8`, width `224px`, filled in `--cyan` with `box-shadow: 0 0 12px #56c8ff`.

---

## LAYER STACK (bottom to top)

```
SECTION       relative h-[700vh] bg-[#04060d]
  STAGE       sticky top-0 h-screen overflow-hidden, isolation:isolate
    #sky      THE SKY, behind everything. Static, composited once. See below.
      i x2         star sprites at fixed opacity .8 / .55
    RIG       absolute inset-0, will-change:transform
      canvas#net     base network, filter: saturate(1.05) contrast(1.06)
      canvas#depth   same scene at scale 1.045, mix-blend-mode:screen, blur(1.5rem), opacity .55
    RAYS      conic-gradient, screen, opacity oscillating .06 to .20
    CORE GLOW radial at center, screen, intensity tied to (1 - p) so the singularity blooms hardest
    canvas#dust  70 drifting particles, shadowBlur 12, opacity .7
    GRAIN     inline SVG feTurbulence, opacity .16, mix-blend-mode:overlay
    VIGNETTE  radial, rgba(4,6,13,0) 46% to rgba(0,0,0,.55)
    z-20      scene copy blocks
    z-30      final scene + CTA + chapter HUD + progress rail
    z-40      impact-flash
```

### THE SKY ("Abyss")

Four background layers on one `#sky` div plus two star sprites. Genshin-style
constellation field: near black, violet band rising from the bottom left, a cold
blue counterweight high right, `feTurbulence` nebula, sparse stars with four-point
glints.

Two rules are the entire fix for "no colour blending":

- **Every falloff ends at `rgba(4,6,13,0)`, never the `transparent` keyword.** CSS
  interpolates toward transparent *black*, so a glow ending at `transparent` gets
  darker as it fades and leaves a visible termination ring. Matching the void's RGB
  at alpha 0 dissolves instead. This one substitution killed the hard navy blob.
- **The base ramp carries four stops.** Two glows on flat `#04060d` have no
  mid-tones to meet in. The ramp is what they blend into.

Plus: `feTurbulence` at `baseFrequency .007` breaks up the ramps, because smooth
gradients band at 8 bits and smooth clouds do not. The `feColorMatrix` flattens RGB
to a fixed violet and drives **alpha** from the noise, so it is a tinted cloud with
holes, not grey static. The `-.40` alpha bias is the contrast knob.

Stars: one seeded SVG sprite per layer, built once at load, percentage coordinates
plus `background-size:cover` so a resize needs no regeneration. Seed off a
constant, never `Math.random()` — a field that reshuffles between visits reads as a
glitch. The four-point glints are the constellation tell; without them it is noise.

**Do not animate anything inside the stage.** See COMMON MISTAKES.

---

## SECTIONS AFTER THE SCROLLER (company presence)

Do not rebuild a product catalog here. Flat sections: **About**, **Core Projects** (one Axlefield card), **Team**, **Collaborate**, **Contact**. Reveal with a single `IntersectionObserver` at `threshold: 0.15`. Respect `prefers-reduced-motion: reduce`.

---

## GLOBAL ANIMATION RULES

- ONE `requestAnimationFrame` loop drives everything. No per-element `setInterval`, no CSS scroll-timeline.
- **Camera pan runs off wall-clock time, never progress**, so the frame is never locked — even parked at `HOLD` the camera keeps breathing. Two summed sines per axis so the drift never looks periodic, plus a slow roll:
  ```js
  panX = sin(t*.11)*22 + sin(t*.047)*12;   // ±34px
  panY = cos(t*.083)*14;
  roll = sin(t*.062)*.5;                   // degrees, added to the progress rotation
  ```
  Keep the amplitude small. This is a handheld-camera suggestion, not a movement — if the viewer notices the pan as motion, it is too big.
- Read scroll with `getBoundingClientRect()` on the scroller, never a cached `offsetTop`.
- `p += (raw - p) * 0.075` every frame, and clamp `raw` to `[0,1]`.
- Canvas sizing: `dpr = Math.min(devicePixelRatio || 1, 2)`, set `canvas.width = w * dpr`, then `ctx.setTransform(dpr,0,0,dpr,0,0)`. Re-run on `resize`.
- Scene visibility uses a windowing helper, so every scene fades in and out on its own segment:
  `win(p,a,b,c,d) = min(clamp((p-a)/(b-a)), 1 - clamp((p-c)/(d-c)))`
- `prefers-reduced-motion`: skip the shake, the flashes and the smoothing; keep the scrub.

---

## COMMON MISTAKES TO AVOID

- **Do not scatter the nodes' start positions.** Every single node begins at exact center. If node 40 starts anywhere else, the big-bang read is gone.
- **Do not draw edges before their nodes finish being born.** Connections must trail the births by a visible margin.
- **Do not recompute pair distances per frame.** Rotation is rigid, distances are constant, the edge list is built once.
- **Do not use `Math.random()` for all three coordinates** — use the golden-angle spiral or the cloud clumps at the poles.
- **Do not use CSS `filter: blur()` on the main network canvas** — blur the *depth echo* canvas instead, or the frame rate collapses.
- **Do not omit `mix-blend-mode: screen`** on fog, rays and glow; they will render as opaque grey slabs.
- **Do not make the boot scroll-driven, and do not let it replay.** The twitch, charge and burst autoplay on a real clock; scroll only owns `p > HOLD`. Combine the two with `Math.max`, never by switching modes with a boolean, or scrolling up will rewind you into the big bang.
- **Do not let the sequence actually freeze at HOLD.** `p` stops; the scene must not. Rotation, dust and pointer interaction keep running, otherwise the pause reads as a crash.
- **Do not key impact effects to progress.** A progress-keyed flash stretches with the burst — slow the burst to 2.9s and a 340ms blast becomes 1.5s of fog. Route every impact effect through the single `ic` envelope, and never let both clocks feed it at once.
- **Do not lerp `p` during the boot.** The smoothing flattens the stutter beat, which is the one thing carrying the sense of scale.
- **Do not let the loader's two points close all the way on progress alone.** Without the 54px hover floor, a capped or stalled gate parks them ~2px apart and the wait reads as contact. They must visibly *not* have touched yet.
- **Do not put any copy on the splash.** No wordmark, no scroll prompt, no HUD, no rail until the wave is underway. Text next to the blast splits the attention the blast needs.
- **Do not close the final gap on progress.** It closes in one frame and the points read as vanishing rather than colliding. The close is its own timed phase — at the same constant speed as the approach.
- **Do not ease the points' travel.** No acceleration into contact, no deceleration near it. One constant px/sec the whole way, with `closeDur` derived from that speed.
- **Do not put a held beat between contact and the expansion.** No blackout, no charge, no stutter — each one reads as the sequence stalling. Contact, blast, multiply: one move.
- **Do not animate the centre point.** No radius sine, no jitter. At the middle of the frame that reads as flicker.
- **Do not clamp the perspective divide.** `max(camZ - z, .25)` is a stand-in for a near plane and it fails the moment the camera goes inside. Cull instead.
- **Do not draw an edge whose endpoint was culled.** It streaks across the whole frame.
- **Do not let the corridor end within fog range of where the camera stops** unless something else fills the far field. You fly out the back and the tunnel empties.
- **Do not stroke edges one at a time.** With ~1900 in view that is 32ms/frame on its own. Batch into ~10 quantised-alpha `Path2D` buckets and stroke each once: identical on 1px lines, and it took the finale from **38.8ms to 5.4ms**. Same for the travelling-signal dots.
- **Do not leave a subject unpinned when drag is active.** Free camera-look loses the network off-frame with no way back. Orbit a pivot wherever there is a subject; clamp and recentre only where there is not.
- **Do not gate labels on `pf`.** It is `focal/depth` and sits near the threshold at the destination, so labels flicker. Use real depth.
- **Do not CSS-animate anything inside `.stage`, not even pure opacity.** The stage is `isolation:isolate` and holds several `mix-blend-mode:screen` children, and a blended group must re-rasterise whenever anything beneath it changes. A two-layer star twinkle on nothing but `opacity` measured **32.05ms/frame against 12.28ms with it off, and 12.06ms with the sky deleted entirely** — the sky is free, animating it cost 20ms. Live motion belongs on a canvas layer that is already redrawing.
- **Do not end a gradient stop at the `transparent` keyword.** It interpolates toward transparent black, so the glow darkens as it fades and leaves a termination ring. Use the backdrop colour at alpha 0.
- **Do not blit one big sprite at every scale.** Scaling a 128px bloom down to the ~11px almost every node needs doubled the finale frame time. Keep a small source and a large one and pick by target size.
- **Do not leave the core bloom at full scale before the blast.** At full size it is a ~250px soft blob; with nothing else on screen the single atom reads as fog. Scale it to `0.26` and let the blast blow it open.
- **Do not write effect windows as literal seconds.** Derive them from `BOOT`. `win()` latches on permanently if a retiming inverts its fade-out pair, and the failure looks like a dead sequence rather than a bad number.
- **Do not gate the edges at or above `HOLD`.** The splash then never becomes a network, which is the single biggest reason the intro can feel disconnected from the scroll phase.
- **Do not trust a beat you verified before a retiming.** The envelope maths were all correct here and still produced a black screen, because one stale window was covering a perfectly rendered canvas. After changing any `BOOT` value, sweep every envelope over `0 → BOOT.hold` again.
- **Do not integrate the pointer springs in both canvas passes.** The depth echo would double every force. Same hazard for the motion-blur trail buffer: exactly one writer, in the main pass.
- **Do not let trails or the dust shockwave survive the hold.** Both envelopes must reach 0 at `bt = 5.0`, or the pause is full of smears and displaced dust.
- **Do not apply `font-bold` to Anton** (single weight) and **do not set body copy in Anton or JamjanNP** — Garet carries all text under 20px.
- **Do not introduce a third hue.** Blue and black, white only for the impact flash.

---

## APPENDIX — REFERENCE BEHAVIOUR (igloo.inc)

Inspected 2026-08-02. What that site actually runs, and the call on each for Axon:

| Their approach | Evidence | Axon |
|---|---|---|
| Three.js `r165` + GSAP `3.12.5` | `window.__THREE__ === "165"`, `window.gsapVersions` | **Rejected.** 260 points and ~1000 lines don't need WebGL. Canvas 2D + one rAF loop stays under 30KB with no dependency. |
| No native scroll at all — `html` and `body` are both `overflow:hidden`, `scrollHeight === innerHeight`; wheel/touch is captured and fed to a virtual scroll value | computed styles + document metrics | **Rejected.** Keeps real scroll (`700vh` + `getBoundingClientRect`), so the page stays keyboard, trackpad, screen-reader and deep-link friendly. The `0.075` lerp already buys the same inertial feel. |
| Loader gate before anything renders: KTX2/Basis textures, Draco geometry, EXR + MSDF workers, ZSTD wasm | ~40 asset requests, `basis_transcoder.wasm`, `*.ktx2`, `*.drc` | **Adopted in spirit, not in form.** Axon has zero binary assets, so there is nothing to preload — but it keeps the *idea* the loader buys: the site performs an introduction on its own clock before it asks the user for anything. That is what the TWITCH → CHARGE → BURST → HOLD boot is for. |
| Scene stays in constant motion even when the user is idle | continuous rAF, GSAP tickers | **Adopted.** Auto-rotation, dust drift and pointer springs never stop, including at `HOLD`. |

Not verified: their exact easing curves and scene timings. The site is a full WebGL canvas whose renderer never initialised in the inspection environment, so the timings above are Axon's own, not measured from theirs.
