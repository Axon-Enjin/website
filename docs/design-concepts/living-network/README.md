# Axon Enjin: Living network

Eight separate horizontal desktop mockups, created with the built-in image generation tool. Open [the review gallery](index.html) and use its section buttons or arrow keys. Each image also opens at full size.

This direction follows the user's clarified brand concept: **Axon carries the signal, like nerves; Enjin is where people connect through technology.** It restores Axon's black and blue palette and adapts the sculpture-to-interface narrative in [Forma](https://forma-ai.aura.build/). It supersedes Clear signal's white direction. The actual [homepage](../../../index.html) now implements it; [iteration 02](iteration-02/index.html) compares each mock with the previous and current builds. Company doctrine is unchanged.

## The eight images

| Section | Image | Role |
| --- | --- | --- |
| 01 — The first signal | [Hero](01-hero.png) | A branching blue nerve-fibre sculpture, clear product statement and immediate CTAs. |
| 02 — Signal to structure | [Assembly](02-assembly.png) | Organic fibres straighten into the Operating Layer's interface. This frame shows Connect, the middle chapter of Spark / Connect / Operate. |
| 03 — The human connection | [Manifesto](03-manifesto.png) | A quiet word-by-word reveal: technology brings people together across teams and branches. |
| 04 — One connected system | [Modules](04-modules.png) | A readable stock transfer example and all seven modules, with Inventory selected. |
| 05 — Ways to work together | [Offers](05-offers.png) | Three offers in an indexed layout; Operating Layer leads. |
| 06 — How we work | [Delivery](06-delivery.png) | Three layered technical figures group all eight delivery stages, with maintenance after go-live. |
| 07 — The builders | [Team](07-team.png) | A discreet description of direct collaboration, with no individual names, titles or roster; an explicitly illustrative working-session detail. |
| 08 — Make the connection | [Contact](08-contact.png) | Many fibres converge into one signal beside an inquiry form. Ventures remains secondary in the footer. |

## Visual system

- Void `#04060d`, elevated navy `#0a1424`, primary cobalt `#2e6fff`, signal cyan `#56c8ff`, body ice `#cfe3ff`, white headings. Use actual CSS tokens when implementing; generated pixels approximate them.
- The images contain the earlier condensed wordmark. The user subsequently selected [the geometric identity](../identity-v2/01-geometric-exploration.png), which supersedes that lettering in the actual website. Keep that selected bold wordmark and angular cobalt symbol; do not restore the old condensed logo when matching the section images. Blue pill controls remain.
- Evolve the display typography toward Forma's calmer, fluid DM Sans treatment, with Instrument Serif italic used deliberately at the opening and closing. Keep Garet for interface/body text. This is a proposed typography change, not an edit to `PROMPT.md`.
- Use a single continuous signal motif: organic fibres in the opening, precise interface lines in the product, a quiet line in the team introduction, and a converging endpoint at contact. Avoid adding a large sculpture to every section.
- Technical breadcrumbs become `AXON / 01` through `AXON / 08`, with small star markers and fine blue-gray rules. Forma's logo, copper palette and unrelated showcase projects are not reused.

## Proposed interaction contract for a later build

These images are resting states and motion references. They do **not** implement animation, prove smooth morphing, or reproduce exact source timing.

1. Hero: preserve `isolation: isolate`. Layer black base and subtle depth, grid, canvas sculpture, shading masks, then readable copy at a stable higher stacking level. Product statement and CTAs appear immediately; do not gate them behind an intro.
2. Assembly: a native-scroll sticky stage with header, canvas/browser scene and chapter controls. The same particle set changes from branching fibres to a structured interface. Sample targets are generated once; keep heavy particles in canvas. Browser tilt reduces as it settles. Prototype the duration on a small laptop before choosing scroll distance.
3. Manifesto: scroll progress changes words from muted to fully readable. The shown image is mid-reveal. Reduced motion must expose the complete text directly.
4. Modules: clicking changes the selected module and preserves the app shell. Keyboard operation remains available. Show Accounting's safe scope when selected. Do not imply that People and Reports tabs are purchased by default merely because the illustrative shell displays them.
5. Offers: expand/select an offer with restrained bounds/content transitions, without hiding its essential scope. No prices or payment acceptance claims.
6. Delivery: thin illustration groups spread on a short, controlled scroll progress curve and return to aligned planes. All stage labels remain stable and readable.
7. Team/contact: quiet reveals; never move form fields while a person types. Use approved real imagery if available, rather than presenting the generated working-session detail as documentary evidence.
8. Global: Tailwind CDN plus vanilla JavaScript; native `IntersectionObserver`; canvas and a shared `requestAnimationFrame` scheduler; no external animation framework. Use fluid `clamp()` typography, e.g. `clamp(62px, 7.7vw, 110px)` for the desktop hero with a separately checked mobile range. Absolute initial navigation gains a scrolled state. A 2px page-progress bar tracks scroll. A bottom-right motion toggle applies `.motion-paused` and pauses all animation clocks and CSS animations; content and controls remain usable. Respect reduced motion on first load. A later command dialog can open with Cmd/Ctrl+K, using proper focus management.

## Content and review notes

Content authority remains [Website Contract](../../grounding/WEBSITE-CONTRACT.md), [Commercial Model v2](../../grounding/COMMERCIAL-MODEL-V2.md), and [Sitemap](../../grounding/SITEMAP.md). The Operating Layer is the product; custom software is a separate offer. Public pricing is quotation-only. Custom software defaults to build plus 12 months maintenance, with client ownership of the app and Axon retaining reusable libraries. Accounting means management books and export/sync to the customer's registered CAS, not a replacement for BIR invoicing.

Product screens, unit quantities, technical figures and working-session imagery are illustrative. No customer evidence or production capability is established by the images. Contact delivery and its destination remain unimplemented. Detailed module descriptions, buying guidance and legal destinations must remain accessible in a real implementation.

Review the individual frames at full size. The generator varies title weight and sometimes adds header rules or a wordmark on sections that did not request one. Implementation should unify those details, refine the contact headline's three-line wrap, verify text contrast, and adapt mobile layouts before reproducing the composition. The gallery is an image reviewer, not the proposed landing-page implementation.

## Reference and provenance

The Forma URL was requested through the web tool, which could not open it. Direct HTTPS access returned its public HTML and social preview; the preview was visually inspected. The user's detailed source brief supplies the interaction requirements. This was not a frame-by-frame live interaction audit, and exact transition timings were not independently verified.

Forma preview: `https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/forma-ai.png`. The first generation used it as art-direction reference and `../repo-system/current-site.png` for Axon's palette and wordmark. Each subsequent section used the newly generated hero as a consistency reference. No Forma asset URL, logo SVG or showcase image was substituted into the Axon site.

Exact prompts, reference roles and original generated-image paths are preserved in [prompts.json](prompts.json). All eight final images are copied into this directory. Existing concept folders are retained.
