# Axon Enjin — Living network

The static homepage implements the selected black/blue Living network direction, the geometric cobalt logo with bold AXON ENJIN lettering, and the discreet company section. Open the actual homepage at `/`; `/preview/` is the earlier motion concept.

## Run locally

From the repository root:

```powershell
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. The site uses React, TypeScript and Vite with local CSS, fonts and artwork. Tailwind's runtime CDN is no longer needed.

`npm run build` typechecks, bundles and pre-renders the full homepage into `dist/`. `npm run preview` serves that production output at **http://127.0.0.1:4174/**. The pre-rendered page remains readable without JavaScript. Existing article, preview and design-reference URLs are copied into the static output.

For Cloudflare Pages, use build command **`npm run build`**, output directory **`dist`**, and Node **22.12+** (Node 24 is used locally). Update the existing project's build settings when merging the migration; the previous static-root settings will not build the React source.

## Interactions

- A first-visit intro traces the hero's nerve artwork, then reveals the live heading and controls. It plays once per session; `?intro=1` replays it while respecting Motion off and reduced motion. Skip, scroll and keyboard input finish it immediately.
- The next section morphs the signal into the product window in place, within normal vertical page flow. Its nerve artwork spans the viewport outside the app's clipping area. The bottom label and chapter timeline have been removed.
- One shared animation scheduler sleeps when the artwork is offscreen or the document is hidden.
- Inventory, People and Reports switch within the shared app frame. The branch filter changes the illustrative table.
- All seven modules have details. The stock-transfer example validates branches and quantities and only previews the move. Accounting explains its limited scope.
- The manifesto reveals word by word. Technical illustration layers spread subtly with scrolling. The global Motion on/off control persists its preference, and reduced motion is respected by default.
- Product and module tabs support arrow keys, Home and End. Cmd/Ctrl+K opens quick navigation. Escape closes dialogs and mobile navigation.
- Buying information and secondary venture collaboration have accessible dialogs.

## Inquiry delivery

No verified inbox or submission endpoint was supplied. The form validates fields and prepares a copyable/downloadable inquiry locally. It explicitly says nothing was sent; it makes no network request and does not store form contents. A real delivery endpoint is the remaining integration. Native forms use dialog submission mode so a script failure cannot send personal details into the static server's query string.

Product interfaces and data are illustrative. The working-session image was generated with the built-in image generation tool; it is not a photograph of the actual team. No personal names or job titles are published.

## Files and verification

- `src/components/`: React sections, header, footer, icons and dialogs. Authored DOM-controller regions have explicit boundaries so animation/tab updates do not conflict with React-owned children.
- `src/runtime/site.js`, `src/runtime/hero-intro.js`: shared motion and interaction controllers, initialized through a layout effect with cleanup for listeners, observers, timers and animation frames. React Strict Mode is enabled in development.
- `assets/site.css`, `assets/fidelity.css`, `assets/hero.css`, `assets/assembly.css`: preserved visual styling, bundled by Vite.
- `tools/prerender.mjs`: emits the static homepage after the Vite client and server-render builds.
- `assets/axon-mark.svg`: geometric reconstruction of the selected identity concept. DM Sans 800 approximates the selected bold wordmark; it is not a claim of an exact custom font master.
- `assets/fonts/`: self-hosted DM Sans variable and Instrument Serif italic, with their OFL licenses.
- `docs/design-concepts/living-network/implementation/`: desktop/mobile captures and browser-check report.
- `docs/design-concepts/living-network/iteration-02/`: latest section-by-section fidelity audit, mock/before/current comparison viewer, reference-size captures, and the expanded 34-check browser report. The earlier captures are retained for comparison.
- `tools/website-check.mjs`: dependency-free CDP integration checks. Start `npm run preview` and an isolated Chromium with `--headless=new --remote-debugging-port=9449 --user-data-dir=<temporary-profile>`, set `AXON_QA_URL=http://127.0.0.1:4174/`, then run `node tools/website-check.mjs`. It closes that isolated browser when done. Do not point it at your personal browsing profile.
- `tools/perf-smoke.mjs`: dependency-free checks of the shared scheduler, cached canvas paths, pause state, visibility and offscreen behavior.
- `tools/intro-check.mjs` and `tools/assembly-check.mjs`: focused browser checks using the same isolated Chromium setup. Latest results: 21 intro checks, 13 assembly checks and 34 page checks passed. `implementation/current-validation.json` under the Living network design directory records the reports.

For reference-size comparison captures, set `AXON_QA_WIDTH=1672`, `AXON_QA_HEIGHT=941` and `AXON_QA_OUTPUT=../docs/design-concepts/living-network/iteration-02/after/` before running the browser check. Output paths are relative to the check script's directory.

The design detector's Instrument Serif, italic-display and chapter-label exceptions are scoped to the font/entry file because they reproduce the user's expressly selected Forma-derived mockups. Small text and wide body tracking were corrected. A file-scoped cramped-padding false positive is documented with measured browser evidence: both flagged sections have over 100px of top padding. The final detector reports no remaining findings. See `PRODUCT.md` and `DESIGN.md` for the retained product and visual decisions.
