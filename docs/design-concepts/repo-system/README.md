# Axon Enjin: mockups within the existing design system

Six exploratory desktop section mockups created with Impeccable's simplification and visual-reference guidance and the built-in image generation tool. This set supersedes the earlier light-direction concepts for the current discussion. It does not replace the website or amend company doctrine.

A separate [interactive motion preview](../../../preview/index.html) now implements this direction. Serve the repository locally and open `/preview/`; see [preview instructions](../../../preview/README.md). The original homepage remains separate.

## Review the images

| Section | Proposed change | Mockup |
| --- | --- | --- |
| Opening | Put the product explanation and CTAs in the first view. Connect head office and branches to the product preview. | [Hero](01-hero.png) |
| Product | Show one readable workflow with a stable interface frame and inventory/people/report selectors. | [Product walkthrough](02-product.png) |
| Modules | Replace the equal-card catalog with a selector and one expanded detail. Preserve Core and all six catalog modules. | [Module explorer](03-modules.png) |
| Offers | Explain the three existing offers in an ordered sequence with Operating Layer first. | [Offers](04-offers.png) |
| Team | Give the four named people and their responsibilities a clearer presence. | [Team](05-team.png) |
| Contact | Give the inquiry a clear form and keep Ventures in the footer. | [Contact](06-contact.png) |

## Source authority

- [PROMPT.md](../../../PROMPT.md): brand palette, typography, node/connection motif and technical constraints.
- [index.html](../../../index.html): current implementation, wordmark treatment, pill controls, rounded navy surfaces, cyan line icons and actual spacing/typographic character.
- [Current-site capture](current-site.png): rendered module section used as the reference image for every initial generation. The capture hides the loading overlays and reveals existing section content at runtime; it does not change the source site.
- [Website contract](../../grounding/WEBSITE-CONTRACT.md), [commercial model](../../grounding/COMMERCIAL-MODEL-V2.md), [module catalog](../../grounding/MODULE-CATALOG.md), [sitemap](../../grounding/SITEMAP.md) and [brand voice](../../grounding/BRAND-VOICE.md): product name, primary buyer, offer hierarchy, scope, team and public-copy constraints. Retired documents are not source authority.

## Inherited system

| Token or role | Existing value |
| --- | --- |
| Background | `#04060d` |
| Elevated surfaces | `#0a1424` |
| Primary action | `#2e6fff` |
| Signal accents | `#56c8ff` |
| Body text | `#cfe3ff` |
| Headings | White, Anton, condensed uppercase |
| Body and interface text | Garet |
| Display/wordmark stack | JamjanNP, Anton, serif; JamjanNP is referenced but its font file is absent from the repository |
| Components | Rounded panels, subtle borders, blue pill CTAs, cyan line icons |
| Recognizable motif | Nodes and connections carrying a signal between head office and branches |

The illustrations approximate these fonts and components; implementation must use the actual project font stacks and tokens. Brighten secondary text where needed to meet measured contrast rather than copying every generated pixel.

## Proposed motion sequence

1. **Opening to product:** a few meaningful nodes gather into the branch diagram. Nodes then align with interface tabs; connections straighten into the product frame. Copy and CTAs remain visible. Replace the long introductory journey with a brief transition across roughly one viewport of scrolling, subject to prototype testing.
2. **Workflow changes:** preserve the interface shell while the active indicator slides and content crossfades. Animate compatible panel bounds, not each table cell or paragraph. Support clicking independently of scroll.
3. **Module details:** animate the selected indicator and detail-panel bounds, then transition content. Keep the module selector in place. Collapse to a readable accordion on mobile.
4. **Offers and team:** use quiet entrances and a small connection-line reveal; do not make every section compete with the opening morph.
5. **Contact:** carry a cyan line into the form's top edge, then reveal the stable panel. Never move controls while the visitor types.
6. **Reduced motion:** show final states directly, with optional short fades. All information and controls remain available without animation. Keep native scrolling and avoid a mandatory loading sequence.

These are proposed motions, not effects implemented by the still images. A browser prototype is required to judge timing, performance, continuity and touch behavior. The repo's vanilla JavaScript/canvas approach is sufficient to investigate them; no new animation framework is implied.

## Content and implementation boundaries

- Product interfaces, stock quantities and branch illustrations are illustrative; they do not prove shipped capabilities or actual customer data.
- The team names and roles come from the grounding pack. No invented team photographs are used.
- The contact form is proposed UI. A real inbox or booking destination and delivery behavior still need implementation.
- Preserve the three real offers, quotation-only pricing, safe Accounting scope and secondary Ventures placement. When Accounting is selected, include its management-books/export scope and clarify that it is not a BIR invoicing replacement.
- The six mockups show a simplified homepage narrative. Detailed process, buying information and legal content still need accessible destinations in an implementation; they are not silently deleted by this concept.
- Existing HTML mentions POS connectivity, while the commercial model treats integrations as later or scoped customization. The mockups follow the commercial model and do not promote universal POS connectivity.

Exact prompts, the hero's monetary-data correction, reference image and generation metadata are recorded in [prompts.json](prompts.json). Generation prompts are also embedded in the final PNGs. The images remain exploratory and unapproved.
