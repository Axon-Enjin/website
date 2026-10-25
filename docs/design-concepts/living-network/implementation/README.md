# Homepage implementation verification

## React + Vite migration

The homepage is now split into React/TypeScript section components under `src/components/`. The existing interaction and canvas engine lives in `src/runtime/`, initialized through an effect with cleanup for listeners, observers, timers, object URLs and animation frames. Narrow `RuntimeRegion` boundaries keep controller-owned markup separate from React-owned descendants. React Strict Mode is enabled in development.

`npm run build` typechecks, bundles and pre-renders the full homepage into `dist/`; the build also copies existing article, preview and design-reference routes. The production page remains readable without JavaScript. CSS, fonts and artwork are preserved locally; the Tailwind runtime CDN was removed.

Migration validation: 21/21 intro checks, 13/13 assembly checks and 34/34 production page checks passed. Development also passed 34/34 page checks with Strict Mode. The scheduler smoke test now verifies effect cleanup and prevents delayed callbacks from restarting a disposed runtime. `current-validation.json` records the browser reports. Desktop/mobile screenshot comparisons against the pre-migration page show zero or near-zero pixel differences in the checked sections.

Cloudflare Pages must use build command `npm run build`, output directory `dist`, and Node 22.12+ (Node 24 is pinned in `.nvmrc`). The migration PR requires this project-settings change before deployment; `wrangler.jsonc` records the intended output directory.

The actual homepage is [the repository root](../../../../index.html), served at http://127.0.0.1:4173/ during local development. These are browser captures of that implementation, not additional image-generated mockups.

`checks.json` records the browser integration pass: 27 checks for the selected identity, real canvas artwork, active and paused scheduling, offscreen sleep, scroll chapters, all seven modules, branch filters, keyboard tabs, Accounting scope, transfer validation, dialogs, discreet team copy, literal inquiry preparation, reduced motion and overflow at 320/390/768/1366px. No uncaught application errors were observed.

Desktop was captured at 1440×900; mobile at 390×844 with reduced motion. All eight desktop sections and mobile hero/modules/contact were visually inspected. The isolated Chromium browser used for QA is closed after the checks. Orca's embedded browser was used to load the page and inspect actual layout, but its screenshot operation failed, so captures were made in the isolated local browser. These checks do not constitute device frame-rate benchmarks or an accessibility certification.

`node tools/perf-smoke.mjs` independently verifies 400 simulated frames, one shared scheduler, cached geometry, pause/resume, hidden-document behavior, offscreen sleep and scroll-event coalescing without browser dependencies.

Contact remains a local inquiry preparation flow, as the user requested when asked about a delivery destination. The final mechanical design scan returned no findings after actual legibility fixes, user-approved visual exceptions, and one measured padding false-positive exception. The approved mockups remain in the parent directory for comparison.

## Hero reference fidelity update

The hero now uses `assets/hero-network.png`, a text-free background extracted from `docs/design-concepts/living-network/01-hero.png`. The incumbent geometric mark and DM Sans wordmark remain; the heading, navigation and controls are live HTML. `assets/hero.css` aligns the type scale, spacing and header rule with the source composition and adapts the artwork below the mobile copy. The existing shared canvas scheduler adds travelling light pulses on desktop; the background remains visible when motion is paused.

The newer `.impeccable/review/checks.json` records 34 passing integration checks, including artwork loading, motion controls, responsive overflow and existing page interactions. Captures in `.impeccable/review/` include `reference-size.png` at the source composition's 1672×941 size, `desktop-hero.png` at 1440×900, and `mobile-hero.png` at 390×844. These supplement the earlier captures and 27-check record described above; they do not establish pixel-perfect identity or device performance benchmarks.

## Implemented hero intro

`assets/hero-intro.js` implements the approved storyboard as a first-visit reveal lasting 2.8 seconds on desktop and 2 seconds on mobile. Temporary SVG traces reveal the existing raster in place while the live header and copy enter in sequence. Completion removes the temporary SVG and restores the final hero composition without camera movement or changes to the selected identity. The intro shares the existing animation scheduler; it adds no requestAnimationFrame loop.

The intro plays once per session; `?intro=1` requests replay. Reduced motion and saved Motion off bypass it. Skip is in the initial HTML and works even before the external intro script or artwork loads. Skip, scrolling, Tab, Escape and focus interrupt it while preserving native input behavior; deep links bypass it, and script/artwork failures or timeouts restore the normal hero. `node tools/intro-check.mjs` recorded 21/21 passing checks in `.impeccable/review/intro-live/checks.json`, covering timing, cleanup, session behavior, interruptions, motion preferences, mobile layout, deep links, a paused image request and failure recovery, with no uncaught application errors. The broader page regression pass separately passed 34/34 checks in `.impeccable/review/intro-regression/checks.json`.

## Assembly reference and morph update

The assembly follows `docs/design-concepts/living-network/02-assembly.png`, with `assets/assembly-network.png` supplying the extracted background independently of the live product window. Its provenance and exact extraction prompt are recorded in `assets/ASSETS.md` and embedded in the PNG. The full-width atmosphere and particle canvas are siblings of `.assembly-scene`, keeping the nerve strands outside the product and content-container clipping.

The section now uses normal vertical document flow, with no sticky or pinned scene and no horizontal travel. On first entry, the interface morphs in place from a thin band through a rounded panel into the readable live table over 1.6 seconds on desktop or .9 seconds on mobile. Focus or pointer interaction completes the morph; reduced motion and Motion off show the completed interface immediately. Animation uses the existing shared scheduler without an additional requestAnimationFrame loop. The bottom “Signal → structure” label and Spark / Connect / Operate timeline controls, including their JavaScript handlers, have been removed; the transition is automatic.

The latest `node tools/assembly-check.mjs` result in `.impeccable/review/assembly/assembly-checks.json` records 13/13 passing checks and no uncaught errors. It verifies the timed morph without scroll movement, normal vertical flow, independent full-width nerves, removed controls, live product interactions, mobile layout and motion preferences. This supersedes the earlier assembly check count that included replay controls. The final broader page regression also passed 34/34 checks in `.impeccable/review/assembly/regression/checks.json`. The independent reviewer scored the documentation correction and requested footer removal resolved, with no visible regressions from that fix batch.
