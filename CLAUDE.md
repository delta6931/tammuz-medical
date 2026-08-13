# Tammuz Medical — project context

> Current operational rules, deployment safeguards and medical-data status are in `AGENTS.md` and `data/asadental/derived/MEDICAL_DATA_STATUS.md`. Where this older handover differs, those files control.

## The business

Tammuz Global Medical distributes European dental instruments (primarily **AsaDental**, Italy)
to clinics, distributors and procurement teams in **Turkey and Iraq**. B2B, quote-only —
prices are never published on the site.

Contact: +90 533 887 77 40 (also WhatsApp).

## The goal

Get dentists, clinic buyers and distributors in Iraq and Turkey to find the site on Google,
and convert them into quote requests. **Not an ad-supported site** — one recurring customer is
worth more than any amount of traffic, so low-volume high-intent searches are the target.

Arabic is a priority: the Iraqi market is Arabic-speaking and Arabic dental search has very
little competition.

## Stack

- Next.js 16 + React 19 via `vinext`, Tailwind 4 available but **the site is styled with
  semantic CSS classes and custom properties in `app/globals.css`**, not utility classes.
- Static export to **Cloudflare Pages** (`npm run export:pages`).
- Locales: EN (no prefix), TR (`/tr/`), AR (`/ar/`, RTL). 3 languages × every page.
- Design tokens: `--navy #0e2737`, `--teal #287873`, `--cream #f7f5ef`, `--paper #fffefa`,
  `--mint #e4ebe6`, `--line #d7ddd7`, `--muted #65767b`. Font: Manrope Variable
  (Noto Sans Arabic Variable for RTL).

## Current state

- 2,959 SKUs × 3 languages = 8,877 product pages, live, with correct sitemap, hreflang,
  canonicals and Product schema.
- **Known problem being fixed:** those pages are thin — the description is one template
  sentence with the code swapped in. Google will crawl a few hundred and ignore the rest as
  scaled content.

## Division of labour — important

Two agents work on this repo. Do not cross these lines.

| Owner | Scope |
|---|---|
| **Codex** | The catalog data layer and product page generation: `app/_data/asaCatalog.json`, product/category rendering in `app/_components/SitePage.tsx`, `data/asadental/derived/*`, enrichment scripts. |
| **Claude** | Standalone tool pages under `app/tools/*`, their components and their own CSS files. |

Claude must avoid editing `app/_components/SitePage.tsx` while Codex has uncommitted work
there. Tool pages are new routes with their own CSS — they cannot break the catalog.

## The data contract (both agents depend on this)

Codex produces enrichment records validated against
`data/asadental/derived/product-enrichment.schema.json`.

`scripts/build-forceps-tool-data.mjs` projects those records into
`app/_data/forcepsApplications.json`, which is the **only** file the selector tool reads.

Field names that must not drift:

```
clinical.arches         ["upper" | "lower"]
clinical.toothGroups    ["incisors_canines" | "premolars" | "molars" | "roots" | "wisdom_teeth"]
clinical.sides          ["left" | "right"]        // empty array = applies to both
clinical.patientGroups  ["children" | "unspecified"]
design.tipSerration     "serrated" | "non_serrated" | null
design.beaksAtRest      "open" | "closed" | null
design.handleVariant    "standard" | "asalady" | null   // asalady = W/SW prefix
dimensions.overallLengthMm.value   number | null
```

If Codex changes any of these, the build script and the selector must be updated in the same
change. When new enrichment output lands, re-run the build script — the tool needs no edits.

## Data rules — these are medical devices

1. **Never invent or infer a specification.** Every dimension, material and clinical
   indication comes from the AsaDental 2025 catalogue PDFs in `data/asadental/`.
   Unknown fields are omitted, never filled with placeholder text.
2. **Local catalogue PDFs are the primary source.** asadental.com is verification and
   gap-fill only. Where the two disagree beyond ±2.5 mm rounding tolerance, the field is
   marked unknown rather than picking a side.
3. **Never publish prices.** The price PDFs and workbooks in `data/asadental/` are internal
   reference only and must not enter any generated output or client-side JSON.
4. **Never copy AsaDental's descriptive prose.** Extract structured facts and write original
   copy from them. Facts are free to state; their sentences are copyrighted and are already
   duplicated across every distributor site.
5. Descriptions are written **natively** in EN/TR/AR, not machine-translated from one
   English template — that would reproduce the duplication problem three times.

## Open items

- ~57 forceps appear in the catalogue but not in the range-of-application matrix
  (186 in matrix vs 243 forceps records). They need a data plan.
- 12 SKUs have unresolved catalogue-vs-website length conflicts, sent to AsaDental for
  confirmation. Lengths backfill via an override file; nothing blocks on them.
- Ten SKUs in the price workbook are missing from the website catalog, likely discontinued.

## Planned tools (`/tools/*`)

Priority order — each is a standalone page with its own CSS, reusing the site design tokens:

1. **Extraction instrument selector** — click a tooth, get the right forceps. *(in progress)*
2. Clinic setup kit builder — procedures in, full instrument list out, one-click quote.
3. Tooth numbering converter — FDI ↔ Universal ↔ Palmer.
4. ISO 6360 bur code decoder.
5. Endodontic file size and colour chart.
6. Trilingual (AR/TR/EN) dental instrument terminology dictionary.

## Conventions

- Every tool page ends with a quote CTA linked to the relevant catalog category.
- Mobile-first — tested on a Samsung A20, so it must work on a small, slow Android device.
- RTL must be handled with logical properties or `[dir="rtl"]` rules, not mirrored hacks.
- Commit before and after each unit of work. Never leave large work uncommitted while the
  other agent is active.
