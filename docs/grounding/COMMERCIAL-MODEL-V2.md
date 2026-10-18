---
title: Commercial Model V2
type: strategy
status: active
authority: level-2
owner: Jerico
created: 2026-08-08
updated: 2026-08-15
review_cycle: 90-days
source_of_truth: 01_STRATEGY/COMMERCIAL-MODEL-V2.md
supersedes: Old GTM packaging (5-rung ladder, archetype hub, Starter/Growth/Enterprise for public use and quotations; D-2026-005)
superseded_by:
---
# Axon Enjin — Commercial Model v2

**Status:** Canonical for go-to-market, the website, and public offers (8 August 2026; F-03 closed 11 August 2026). This file has no prices.  
**Team:** Carlos Jerico Dela Torre (CEO) · Aidan Tiu (CTO) · Gerald Berongoy (Deputy Engineer) · Rhandie Sales Jr. (Deputy Engineer)

> **Precedence.** The six working docs at the company-docs root win over this file. This file wins over archived material for public offers and how the site talks. The archived company document is history. It is not binding. Old offer ladder (5-rung audit path), archetype pack hub, and Starter / Growth / Enterprise rate card are retired (D-2026-005 / F-03). Regulatory lines the site must keep are written in §8 below.
>
> **Plain language.** Customer-facing copy should be clear to a **5th–7th grader**. Short words. Short sentences. Teach hard words only once, if at all.

---

## 1. What we are

Axon Enjin is a **hybrid**:

1. **Operating company** — we build and run software for businesses (primary).
2. **Venture studio** — we sometimes co-build startups (secondary).

We work like **in-house developers**: close to the business, not a distant agency handoff.

---

## 2. Public product name

**Axlefield** (D-2026-009) — *An Axon Enjin product.* An operating **ecosystem**: Core (central database / empty shell), catalog modules, third-party integrations, and the people who run it. You start empty. You add the tools you need.

- **Who it’s for:** people who run more than one branch (multi-branch). Franchise networks are a strong fit — not the only word in the title.
- **Do not** put “Franchise Operating Layer,” “FOL,” “ERP,” or “business operating system” as the homepage title. Franchise is a use case. Axlefield is the product name.
- SKUs: **Axlefield Core**, **Axlefield modules**, **Axlefield custom**.
- Operating Layer / FOL = internal/historical only.

**Plain one-liner:** *One system for every branch. Add the tools you need.*

**Relationship one-liner:** *We work like your in-house developers.*

**Website company tagline (D-2026-008):** *The one who connects.* — homepage H1. About teaches axon (axis / cable / signal) and enjin (engine / connector). Do **not** put “Agentic AI Systems,” Greek script, or neuron art on the H1. Product name: **Axlefield** (D-2026-009). Product sub: *Add the tools you need.*

**Upwork / international channel tagline (D-2026-007):** *In-house developers. Without the hire.* — profile headline and first overview line only. Does **not** replace the product one-liner. Does **not** go on the website hero. Not an ICP rewrite.

---

## 3. The three offers

| # | Offer | Who | What they get |
| ----- | ----- | ----- | ----- |
| **1** | Modular Axlefield (pre-made, add to cart) | Multi-branch (preferred) | Empty **Axlefield Core** + catalog modules they buy. Standard setup. |
| **2** | Axlefield + customization | Multi-branch who need a fit | Offer 1, plus paid changes (fields, workflows, extra tabs, non-catalog integrations). |
| **3** | Custom-build AI software | Any entity, including single-location | New software built for them — not sold as catalog modules. |

### Offer 1 — Modular (add to cart)

- Client gets an **empty Axlefield Core** (shell).
- They **purchase modules**. Each purchase unlocks a **tab** in the same system.
- Axon builds and owns the shell and the modules as product.
- Recurring subscription. The unit and the amount stay off the website (F-34). Do not use old Growth / Starter / Enterprise numbers (D-2026-005).

### Offer 2 — + Customization

- Same catalog as Offer 1.
- Plus scoped custom work.
- Not a fourth product line — it is Offer 1 tailored.

### Offer 3 — Custom AI / custom software

- Greenfield or one-off systems.
- **Package:** a build, with optional ongoing care. Care is a separate agreement. It is not included in the build price.
- The client may add or decline care when they accept the proposal.
- If they take care and later stop, care stops. The system stays theirs.

#### Offer 3 — IP (locked)

| Who | Owns what |
| ----- | ----- |
| **Client** | The custom app they paid for (after handoff) |
| **Axon** | Reusable libraries, frameworks, starter kits, and general patterns — may reuse in Axlefield and other work |
| **Venture path** | IP sits in the **venture company**; Axon holds equity + a service agreement — different from Offer 3 |

Every Offer 3 contract must state this split in writing.

#### Offer 3 — Maintenance covers / does not cover

**Covers:** defect fixes in agreed scope; dependency/security patches Axon controls; reasonable support (async + scheduled check-ins).

**Does not cover** (unless re-quoted): new features, scope changes, third-party API breaks outside Axon’s control, new modules/integrations.

Ownership copy for Offer 3: *You own your app. We keep our shared building blocks.* Never "full source code ownership." "No vendor lock-in" applies to Offer 3 only. Do not promise when ownership transfers.

---

## 4. Module catalog v1

Modules are **products**. Buying one adds a tab. Axon builds all of them.

| SKU | Role | Public scope (plain words) |
| ----- | ----- | ----- |
| **Core** | Required | Login, branches, roles, home, billing for modules, activity log. The empty system. |
| **HR** | Catalog | People, roles at branches, basic attendance / records as defined in the module brief. |
| **Inventory** | Catalog | Stock levels, transfers between branches, simple counts. |
| **CRM** | Catalog | Customers, contacts, basic pipeline / history. |
| **Reporting** | Catalog | Branch and network numbers on one dashboard. |
| **Accounting** | Catalog — **safe scope** | Management books, reports, and **export / sync to the client’s own registered CAS**. **Not** “we replace BIR invoicing.” Do not claim accreditation or full CAS replacement. |
| **Scheduling** | Catalog | Bookings / shifts / appointments as defined in the module brief. |

**Retired from public packaging and quotations:** Royalty, LMS, Field audit, Territory packs; archetype packs A–E as the site structure; Starter / Growth / Enterprise plan math (**D-2026-005**).

**Pricing:** **No currency amounts on the website (F-34).** Catalog shows scope only, plus "talk to us" or book a call. Amounts stay off the site. A quotation that converts currency stamps a live rate, the source, and the date.

**Integrations:** Optional later (connectors) or Offer 2 work. v1 story: *buy modules inside our system.*

---

## 5. Discovery → Delivery (all offers)

One **8-stage** path to delivery. Stage **9** is after go-live.

```mermaid
flowchart TD
  S1[1_Inquiry] --> S2[2_Discovery]
  S2 --> S3[3_Proposal]
  S3 --> S4[4_Agreement]
  S4 --> S5[5_Kickoff]
  S5 --> S6[6_BuildOrConfigure]
  S6 --> S7[7_UAT_Train]
  S7 --> S8[8_GoLive_Handoff]
  S8 --> S9[9_Maintain]
```

### Stages

| # | Stage | Purpose | Exit gate |
| ----- | ----- | ----- | ----- |
| 1 | **Inquiry** | Offer interest, branch count, contact | Qualified or declined |
| 2 | **Discovery** | Needs, tools they use, modules, success criteria | Written scope brief |
| 3 | **Proposal** | Price, time, in/out, maintenance, IP | Accept or one revision |
| 4 | **Agreement** | Contract + deposit / first invoice | Signed + paid trigger |
| 5 | **Kickoff** | Access, assets, admins, branches, environments | Checklist done |
| 6 | **Build / Configure** | Offer 1: turn on modules. Offer 2: + custom. Offer 3: full build | Ready for UAT |
| 7 | **UAT + Training** | Client tests; Axon trains; fix blockers | Written acceptance |
| 8 | **Go-live + Handoff** | Live cutover, credentials, runbook, support channel | Delivery accepted |
| 9 | **Maintain** | Fixes and care per offer | Offer-specific |

### Typical calendar (responsive client; 4-person team — not a public SLA until published)

| Stage | Offer 1 | Offer 2 | Offer 3 |
| ----- | ----- | ----- | ----- |
| Inquiry | 1–3 days | 1–3 days | 1–3 days |
| Discovery | 1 session · 2–5 days | 2 sessions · 1–2 weeks | 2–3 sessions · 1–3 weeks |
| Proposal | Same day–3 days | 3–7 days | 5–10 days |
| Agreement | 3–10 days | 1–2 weeks | 1–3 weeks |
| Kickoff | 1–3 days | 3–5 days | 3–5 days |
| Build / Configure | 3–10 days | 3–8 weeks | 8–16 weeks typical MVP |
| UAT + Train | 3–7 days | 1–2 weeks | 2–3 weeks |
| Go-live | 1–3 days | 3–5 days | 3–7 days |
| **Inquiry → Go-live** | **~2–5 weeks** | **~2–4 months** | **~3–6 months** |
| Maintain | Module subscription while they pay | Subscription, plus a short bug-fix window on custom work, then optional support | Optional ongoing care, contracted separately |

**Round numbers for public "how long" copy:** Offer 1 ~4 weeks · Offer 2 ~3 months · Offer 3 ~4 months to live, with optional ongoing care.

### Change control

- Offer 1: new modules = new purchase, not a change order.
- Offer 2–3: out-of-scope work needs a written change order first.
- Client delay (assets or UAT feedback >5 business days) pauses the calendar; Axon records the pause.

---

## 6. Ventures arm (secondary on the website)

**On the site:** `/about/ventures` + footer only. **No** homepage CTA equal to Axlefield. **No** primary-nav “Ventures.”

**Plain pitch:** *We can be the builders inside your startup.*

**Who may inquire:** Founders **and** operators / partners with ideas — both welcome.

**How we select (show on the page):**

1. The problem is clear.
2. Someone will run the business (not idea-only).
3. They bring something real (domain, customers, or cash).
4. It fits a **4-person** team without starving paying Axlefield work.

**On the site:** do not offer to build for equity alone. Do not put venture commercial rules on the page.

**Client fear framing (keep):** Unlike an agency, we own products and build ventures, so the tools get better whether or not you are paying this month. Ventures are why Axlefield improves, not a competing product on the homepage.

**Naming:** Ventures get their **own names** (not "Axon Something"). Early line: *An Axon Enjin venture.*

---

## 7. What we stop selling as the front door

- A Readiness Audit as the hero conversion
- Automation Sprint, Compliance Pack, or an old service ladder as the public front door
- Archetype hub (`/for/store`, etc.) as Phase-1 IA
- Starter / Growth / Enterprise as published **or quoted** plans (D-2026-005)
- "ERP" or "business OS" as the headline. We sell **Axlefield**, an operating ecosystem (Core + modules + integrations + people). Do not lead with "not an ERP" either.

---

## 8. Regulatory copy

These rules apply to public copy. They are stated here so the site does not depend on an archived document.

- Never claim BIR / BSP accreditation we do not hold.
- Never say buying our software makes the client “fully compliant.”
- Never represent payment acceptance as an Axon Enjin capability.
- Accounting module = management books + sync/export — not a marketed CAS replacement.

---

## 9. Success check

Someone on the homepage should get this in one breath:

> *The one who connects.* Then the product: **Axlefield** — *One system for every branch. Add tools. Or we build custom AI. We work like your in-house developers.*

Ventures are findable, never first. Offer 3: you own the app; we keep our shared tools; a build, with optional ongoing care.

---

## 10. Open on the site

| Ask | What is missing |
| ----- | ----- |
| **Booking link** on the contact button | No public booking URL is in this repo yet. Wire the contact button when the founders share one. |



