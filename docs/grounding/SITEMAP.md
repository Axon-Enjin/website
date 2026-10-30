---
title: Website Sitemap
type: strategy
status: active
authority: level-2
owner: Rhandie
created: 2026-08-08
updated: 2026-08-15
review_cycle: 90-days
source_of_truth: 11_MARKETING/SITEMAP.md
supersedes:
superseded_by:
---
# Axon Enjin — Website Site Map & Information Architecture

**Version:** 2.0 · 8 August 2026 · **Status:** ready to build  
**Owner:** Rhandie (website contents)  
**Governed by:** Commercial Model V2 (GTM), including §8 (compliance voice). The archived company document is not binding.

> **Read Commercial Model V2 §8 before writing copy.** Never claim BIR/BSP accreditation. Never say we accept payments. Accounting module = management books + sync, not a CAS replacement.
>
> **Plain language:** write so a **5th–7th grader** can follow. Short words. Short sentences.

---

## 1. The one decision that shapes everything

**The site's job is to sell Axlefield**, one system for every branch, via a **module catalog** and **three offers**. It is **not** built to sell a Readiness Audit.

| Old site (v1) | This site (v2) |
| ----- | ----- |
| Hero → Book a Readiness Audit | Hero → Axlefield + talk to us / see modules |
| Archetype hub as main event | Module catalog as main product surface |
| 5-rung service ladder | Three offers only |
| Platform rate card hidden; audit priced | Modules listed; **no currency amounts on the site** (F-34) |
| Ventures Phase 2 | Ventures live but **secondary** (About + footer only) |

**Secondary job:** make the hybrid clear without scaring buyers — ventures improve the tools; they are not the homepage product.

---

## 2. Site map

```
/                                   Home — Axlefield, three offers, primary CTA
│
├── /platform                       What Axlefield is (shell + modules)
├── /modules                        Add-to-cart catalog (Core + 6 modules)
│
├── /services/
│   ├── /services/customization     Offer 2
│   └── /services/custom-ai         Offer 3 (build, with optional ongoing care; you own the app)
│
├── /how-we-work                    8 stages + typical times
├── /pricing                        How buying works. No currency amounts.
│
├── /about/
│   ├── /about                      Team of four + hybrid one-liner
│   └── /about/ventures             Secondary collab + how we select
│
├── /contact                        Sales + Collaboration topic
│
└── legal/
    ├── /legal/privacy
    ├── /legal/terms
    └── /legal/data-processing
```

```mermaid
flowchart TD
  H["/ Home"] --> PLAT["/platform"]
  H --> MOD["/modules ★ PRIMARY"]
  H --> CONTACT["/contact"]
  MOD --> O2["/services/customization"]
  MOD --> O3["/services/custom-ai"]
  H --> HOW["/how-we-work"]
  H --> PRICE["/pricing"]
  ABOUT["/about"] --> VENT["/about/ventures"]
  Footer --> VENT
```

**Not in Phase 1:** `/for/store|appointment|…` archetype hub · readiness-audit · automation-sprint · compliance pack as a product page · an old service ladder as a product page.

---

## 3. Navigation

**Primary nav:** Axlefield (`/platform`) · Modules · Services · How we work · Pricing · Contact  

**Footer only / About:** Ventures · Team · Legal  

**Do not** put Ventures in primary nav or give it a homepage CTA equal to Modules / Contact.

---

## 4. Page briefs

### `/` — Home

| | |
| ----- | ----- |
| **Job** | State Axlefield in one breath; show three offers; CTA to modules or contact |
| **Hero** | *The one who connects.* Sub: *Add the tools you need.* Then: *We work like your in-house developers.* |
| **Must include** | Three offers teaser; who it’s for (multi-branch, including franchise); CTA **See modules** / **Talk to us** |
| **Must not** | Venture collaboration CTA; Readiness Audit; Growth plan table; pure-equity language; “Agentic AI Systems” as H1; Greek script or neuron art in the hero |
| **H1 (DOM)** | *The one who connects.* — company tagline, not only the wordmark |

### `/platform`

| | |
| ----- | ----- |
| **Job** | Explain empty shell → buy modules → tabs unlock |
| **Must include** | Centre ↔ branch in plain words; Core; link to `/modules` |

### `/modules`

| | |
| ----- | ----- |
| **Job** | Catalog: Core, HR, Inventory, CRM, Reporting, Accounting (safe scope), Scheduling |
| **Must include** | Short plain scope per module; Accounting disclaimer (not BIR CAS replacement) |
| **Pricing** | Scope + "talk to us" / book a call only. **No currency amounts** (F-34). |

### `/services/customization` — Offer 2

| | |
| ----- | ----- |
| **Job** | Same system, tailored to their needs |
| **CTA** | Contact / discovery |

### `/services/custom-ai` — Offer 3

| | |
| ----- | ----- |
| **Job** | Custom AI / custom software; a build, with optional ongoing care |
| **Must include** | You own the app; we keep shared libraries; typical ~4 months to live |
| **CTA** | Contact |

### `/how-we-work`

| | |
| ----- | ----- |
| **Job** | 8 stages Inquiry→Go-live (+ Maintain); typical times per offer |
| **Tone** | Plain; not a public SLA until published as such |

### `/pricing`

| | |
| ----- | ----- |
| **Job** | How buying works: Core + modules; Offer 2 scoped; Offer 3 a build, with optional ongoing care. No currency amounts. |
| **Must not** | Any currency amount (F-34). Old Growth or audit numbers. "Full source code ownership." "No vendor lock-in" next to Axlefield. |

### `/about`

| | |
| ----- | ----- |
| **Job** | Four named people; hybrid one-liner; name origin once; link to ventures |
| **Team** | Jerico (CEO), Aidan (CTO), Gerald (Deputy Eng), Rhandie (Deputy Eng) |
| **Must include** | Axon = axis / cable that carries signal. Enjin = engine / the one who connects. We connect people through systems. Custom AI only as Offer 3 / mechanism — not a second slogan. |

### `/about/ventures`

| | |
| ----- | ----- |
| **Job** | Secondary path for startup collaboration |
| **Must include** | How we select; no offer to build for equity alone; tooling-gets-better framing; ventures stay secondary |
| **CTA** | Collaboration inquiry (form topic or dedicated) |

### `/contact`

| | |
| ----- | ----- |
| **Job** | Axlefield sales + optional topic **Collaboration** |
| **Contact** | No form. Use a Gmail compose link addressed to **axonenjin@gmail.com** with a prefilled subject and message. |

### Legal

Privacy, terms, and data-processing. Do not claim an accreditation we do not hold. Do not say we accept payments.

---

## 5. Conversion architecture

**Primary conversion:** Contact or module interest (Axlefield Offers 1–2).  
**Secondary:** Custom AI inquiry (Offer 3).  
**Tertiary:** Collaboration inquiry from `/about/ventures` only.

Forms may still qualify (branch count, offer type). Do **not** hard-block single-location Offer 3 or collaboration topics.

---

## 6. Copy rules (site-wide)

1. Grade **5–7** reading level where possible.  
2. Homepage H1: **The one who connects.** Product copy may still say “one system for every branch.”  
3. Product name: **Axlefield** — not “Franchise Operating Layer” as the title. FOL is internal/historical only.  
4. Franchise = strong fit, not the only buyer word.  
5. §2.4 compliance and payment rules are legal constraints.  
6. No pure-equity or “build for free” language anywhere public.  
7. No “Agentic AI Systems,” Greek script, or neuron art in the hero.

---

## 7. Publication blockers

| Blocker | Action |
| ----- | ----- |
| No public prices (F-34) | The site never shows a currency amount. Amounts stay off the site. |
| Live FX on quotes (F-35) | Dynamic converter; stamp rate + date on every quote |
| No Google Calendar URL yet | Wire when founders share the booking link (Commercial Model V2 §10) |
| Accounting scope | Safe wording only (V2 §4) |
| Case studies | Not required for Phase 1; team + plain process are the proof |
| Single-page today | `index.html` may stay one page until multi-route build; **content must match V2** even on one scroll |

---

## 8. Single-page interim map

Until routes exist, map sections on `index.html` to:

| Section | Maps to |
| ----- | ----- |
| Hero | `/` |
| How it works | `/platform` + `/how-we-work` |
| Modules / offers | `/modules` + three offers |
| Custom AI | `/services/custom-ai` |
| Team / about | `/about` |
| Ventures (short, low) | `/about/ventures` — footer-adjacent, not hero |
| Contact | `/contact` |

---

*Supersedes SITEMAP v1.0 (3 Aug 2026) audit-first IA.*


