# Iteration 02: mock-to-implementation audit

The eight images in the parent directory are the visual authority. This is a fidelity audit and correction pass, not another visual direction. The initial implementation's functional checks passed, but that did not establish visual fidelity.

## Decisions that remain intentional

- The user selected the geometric identity in `identity-v2/01-geometric-exploration.png` after the section mocks were generated. Its bold wordmark replaces the older condensed wordmark in the images.
- The current `07-team.png` is the revised, discreet team mock: no individual names, titles or roster.
- The user declined to provide an inquiry endpoint for now. The live form prepares a local inquiry; a 'sent' state and invented contact destination would be incorrect.
- Product screens remain interactive HTML, heavy signal work remains canvas, and mobile layouts must remain usable. A generated screenshot is not a production asset to flatten into a webpage.

## Verified mismatches in the first build

| Priority | Section | Evidence in the mock and prior implementation | Correction |
| --- | --- | --- | --- |
| P1 | Hero | The mock has distributed, curling fibre bundles with many terminal lights and a large travelling impulse. The implementation converges every strand into one tidy fork, with similar endpoints. | Build distributed junctions, organic terminal branches, depth and curved peripheral fibres. Preserve canvas and one scheduler. |
| P1 | Assembly | The mock places a smaller tilted application to the right, with a labelled navigation rail and visible fibres meeting its left edge. The implementation uses a wide centered frame, icon-only rail, and mostly obscured particles. | Match right-hand application proportions, restore rail labels and route a dense signal into the application boundary. |
| P1 | Manifesto | The mock has five deliberate lines and a substantial organic fibre band. The implementation balances the text into four different lines and substitutes a straight rule. | Restore the five-line reading order, word-level reveal, underline emphasis and canvas fibre band. |
| P1 | Modules | The mock's selected Inventory view has an internal tab row, wide headline and a continuous incoming signal. The implementation drops the tab row, adds a floating icon and forces a different headline break. | Restore the tab row and signal path, remove the extra icon, size the panel/title to its mock. Keep all module controls working. |
| P1 | Offers | All three offer titles share a column in the mock. In the first build, the second and third titles move far left. Its exploded interface planes are empty rectangles, and the connecting rail is absent. | Align the three titles, restore the node rail and detailed layered interface figure. |
| P2 | Delivery | The mock depicts dotted surfaces, internal interface detail, layered geometry and connecting nodes. The implementation retains only a few outline shapes. | Restore dotted/ruled surfaces, visible layer hierarchy and useful connecting paths, keeping lightweight SVG geometry. |
| P2 | Team | Discretion is correct. The left heading is smaller and the anonymous image is more sharply bounded than the revised mock. | Match the heading scale, image proportion and quiet edge treatment; retain the anonymous working-session detail and short collaboration paragraph. |
| P1 | Contact | The mock's huge three-line closing headline and converging fibre bundle are replaced by a modest two-line headline and four straight SVG curves. Offer labels also change from horizontal to vertical. | Restore the large closing typography, horizontal offer labels and organic convergence artwork. Preserve the honest local form behavior. |
| P2 | Across sections | Display tracking is tighter, typography lighter, and secondary illustration density lower than the image references. The original captures also crop section content at varying positions. | Relax display tracking, restore weight/scale, and provide named mock/before/after views rather than relying on interaction tests. |

## Correction results

All eight sections have been compared and updated in the homepage. The right-aligned labelled app, five manifesto lines and emphasis, module shortcuts and incoming path, shared offer column and node rail, layered figures, discreet company typography and three-line contact heading are implemented. Hero, manifesto and contact fibres now use curved, deterministic canvas geometry; the assembly still morphs on scroll.

The browser suite now includes seven explicit fidelity checks in addition to the previous 27 functional checks. **34/34 passed**, including preserved line structure, visible chapter position below fixed navigation, sidebar labels, four sized signal canvases, module shortcuts, aligned offer-title coordinates and a three-line desktop contact heading. Overflow checks at 320, 390, 768 and 1366px also pass. The 400-frame scheduler smoke check passes with four cached canvas scenes, and the mechanical design scan reports no findings under the existing documented design exceptions. No new detector suppression was added in this iteration.

Open [the comparison viewer](index.html) for mock/current side-by-side and an opacity overlay. The previous implementation is available for each section. Current captures are in `after/`, with [the browser report](after/checks.json).

## Remaining visual limits

The live typography uses actual self-hosted fonts; the generated reference lettering is not an exact font master. Fibre positions and subtle lighting are procedurally recreated rather than pixel-identical to the generated artwork. The approved anonymous working-session asset is a separate generated image, so its hands/paper composition differs from the original section illustration. These are visible approximations, not undisclosed claims of exact reproduction. The chosen geometric identity and local inquiry behavior remain intentional departures.

## Verification boundary

The prior viewport captures are preserved in `before/`. All eight desktop sections were captured at the mock's 1672 × 941 size; mobile hero, modules and contact were captured at 390 × 844. Both desktop and mobile captures were visually inspected. Still images cannot verify scroll timing or prove animation smoothness; browser checks verify state transitions and scheduler lifecycle, not device frame-rate benchmarks. Typeface matching is approximate because the generated mockups do not contain a recoverable font master.
