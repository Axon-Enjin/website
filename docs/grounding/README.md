---
title: Website Grounding Pack
type: policy
status: active
authority: level-2
owner: Jerico
created: 2026-08-11
updated: 2026-08-11
review_cycle: 90-days
source_of_truth: 11_MARKETING/website-grounding/README.md
supersedes:
superseded_by:
---

# Website Grounding Pack

This folder is the **only** surface of `company-docs` that may be mirrored to the public website repository (`Axon-Enjin/website`).

## Why this exists

- The company OS holds client records, finance, founder bottlenecks, and strategy — **not** for the marketing site.
- The website must stay **true** to GTM doctrine without becoming a second source of truth for the whole company.
- Sync is **curated + reviewable** (PR), not a blind clone of the private OS.

## Pack contents

| File | Role |
| ----- | ----- |
| `WEBSITE-CONTRACT.md` | Allowed / forbidden claims; CTAs; F-34 |
| `COMMERCIAL-MODEL-V2.md` | Public GTM source of truth (copy) |
| `SITEMAP.md` | Website IA |
| `BRAND-VOICE.md` | Plain-language + regulatory voice summary |
| `MODULE-CATALOG.md` | Module SKUs and public scope (no prices) |
| `GROUNDING-MANIFEST.yml` | Version + authority checksum metadata |

## Consumer path

`Axon-Enjin/website` → `docs/grounding/` (committed mirror)

## Change rule

When V2, sitemap, or this pack changes → open a PR on `Axon-Enjin/website` updating `docs/grounding/`. Humans review before merge.
