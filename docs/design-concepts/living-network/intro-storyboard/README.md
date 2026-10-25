# Intro storyboard: Follow the signal

This sequence is now implemented on [the homepage](../../../../index.html?intro=1). The [replayable storyboard](index.html) remains the timing and composition study.

## Reference and interpretation

Inspected [GetcKo](https://getcko.vercel.app/?intro) and its publicly served intro sequence on 25 October 2026. Its pixels assemble into the logo, the wordmark appears, and the same large logo scales and moves into the header. The background clears while navigation and hero content enter. Its authored sequence runs to about 3.7 seconds. It plays once per session, respects reduced motion, and can be interrupted. Source evidence: the page's pre-paint `intro-pending` script, the `Gf({onWatch…})` timeline in its served JavaScript, and `.intro` rules in its stylesheet. Browser navigation and accessibility inspection succeeded; the embedded screenshot command timed out, so timing is verified from the served timeline rather than an eyeballed recording.

Borrow its continuous handoff: the thing formed during the introduction remains part of the actual page. For Axon, that thing is the signal entering the existing hero. Keep the selected geometric logo and wordmark intact. Keep the final approved hero composition intact.

## Sequence — 2.8 seconds total

| Beat | Time | Picture and movement | Transition |
| --- | --- | --- | --- |
| 01 · Spark | 0.00–0.20s | Near-black field. One small icy-blue point wakes near the lower-left edge, on the incoming trunk. | A small local glow; no full-screen flash. |
| 02 · Trace | 0.20–0.90s | The point follows the trunk's existing curve toward the central junction. A fine cobalt filament remains behind it. | Speed builds across the long curve and eases into the junction. Camera stays fixed. |
| 03 · Branch | 0.75–1.55s | The signal splits along the upper, middle, then lower branch. Starts offset by about 80ms. Original fibre detail emerges behind those paths. | The thin line becomes a bundle through a feathered, path-following reveal. No scene cut. |
| 04 · Connect | 1.30–2.05s | The branch clusters illuminate. “People,” appears, followed 100ms later by “connected.” The existing header identity appears in its final position. | Short opacity and 8px settling movements; no letter-by-letter typing. |
| 05 · Arrive | 1.85–2.40s | Supporting copy, navigation and both actions become readable and usable. The artwork reaches its original brightness. | Trace overlay fades into the exact underlying artwork; construction grid and footer become clear. |
| 06 · Continue | 2.40–2.80s | The final hero holds. A small signal continues into the existing ambient motion. | Same canvas scheduler takes over; no loop or second reveal. |

The storyboard's masks and spines are a timing study. They do not animate every filament. Production should feather the original raster along three measured branch paths and dissolve the temporary trace into that raster; drawing unrelated curves would reintroduce the fidelity problem.

## Transition rules

- Fixed camera and fixed artwork coordinates throughout. The intro resolves into the existing hero instead of handing off to another scene.
- No logo morph, redesign, zoom burst, fake loading percentage, or audio. The existing identity remains crisp.
- One coordinated timeline. The headline starts while the branches are completing, so the page becomes useful before the visual ending.
- Text finishes in its current layout, with no persistent translation, clipping, or scale change.

## Behavior when implemented

- First arrival only, once per tab session. Reloads and return visits within that session show the completed hero. A development-only replay parameter can force the intro.
- Show “Skip intro” immediately. Scroll, touch-scroll, Escape or navigation focus should complete the intro immediately, without swallowing the user's intended action. Do not trap focus or force a scroll lock.
- Respect the existing saved Motion off setting and `prefers-reduced-motion`: show the final hero directly, with at most a brief opacity transition. If motion is disabled during the intro, finish it immediately.
- Mobile: same sequence in about 2.0 seconds, with the trace in the artwork area below the copy and simplified glow. Never sweep a bright point across text or crop the headline to fit a landscape intro.
- If the artwork is not ready promptly, show the normal hero/fallback rather than a loading sequence. Default HTML stays visible if JavaScript fails. A background tab must not resume into a stale half-finished intro.
- Pause offscreen/hidden work, reuse the shared scheduler, and release temporary masks after completion. Keep contact links and native scrolling available.

## Preview controls

The page provides Replay/Pause, a scrubber, six selectable storyboard frames, and a 2-second mobile pacing option. It starts at the completed hero so it can be inspected before pressing Replay. This is a motion study with live HTML and the existing artwork; the homepage is untouched.

Verification: 12 browser checks pass for artwork loading, spark placement, frame selection, playback, pause/resume, Escape, mobile pacing, reduced motion, overflow and runtime errors. Desktop and mobile captures are in `.impeccable/review/intro-storyboard/`. The mechanical scan's inherited footer tracking finding was corrected in the storyboard stylesheet.
