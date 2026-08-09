# AsaDental enrichment review gate - corrected sample

Date: 2026-08-09
Scope: normalized schema, corrected 20-forceps sample, official-site re-verification, serration-heading audit, and chapter-level field discovery. No product pages were generated and the full catalogue was not enriched.

## Source authority and safety rule

The local source directory contains 19 PDFs: 12 AsaDental 2025 catalogue chapters, 3 commercial/price-list PDFs, and 4 ISO/MDR documents. Two price workbooks are also present. The price files are not opened by the enrichment build, have no schema field, and are never copied into derived JSON.

The local catalogue remains the primary editorial source, but source priority does not override contradictory technical evidence. The corrected policy is:

1. Use page geometry to establish which nominal catalogue fact belongs to which code.
2. Compare the catalogue nominal length with the official site's precise length.
3. If the values agree within 2.5 mm, store the official precise value and retain the catalogue nominal value in provenance.
4. If the difference exceeds 2.5 mm, store a null length and list the field in `unknownFields`.
5. For any other unresolved technical conflict, publish neither value until the manufacturer confirms it.

## Corrected length extraction

Catalogue text reading order is not used. Each product code is paired with the length immediately above it by matching x-centres and checking vertical adjacency.

- The Chapter 4 application matrix contains 186 distinct forceps codes.
- The detail pages contain 186 independently x-aligned code/length pairs.
- The two code sets match exactly: no matrix-only and no detail-only forceps code.
- Across the 20-record sample, the maximum code/length x-centre difference is 0.006318 PDF points.
- The vertical gap between every sampled length and code is approximately 0.864 PDF points.
- PDF pages 3, 4, 5, 7, 9, 11, 16 and 20 were rendered and visually inspected. All 20 captions agree with the coordinate-derived pairs.

This proves that the large catalogue/website differences are real source conflicts, not row-order misalignment.

## Corrected length decisions for the same 20 SKUs

All values are millimetres. Website values are stored only for exact matches or differences within the 2.5 mm nominal-rounding threshold.

| SKU | Catalogue nominal | Official precise | Difference | Stored value/status |
|---|---:|---:|---:|---|
| 0100-1 | 175 | 173 | 2 | 173 - precise value accepted |
| 0100-2 | 170 | 176 | 6 | Unknown |
| 0100-4 | 155 | 140 | 15 | Unknown |
| 0100-8 | 160 | 165 | 5 | Unknown |
| 0100-17 | 160 | 172 | 12 | Unknown |
| 0100-18 | 165 | 172 | 7 | Unknown |
| 0100-20 | 160 | 140 | 20 | Unknown |
| 0100-22L | 175 | 180 | 5 | Unknown |
| 0100-22R | 175 | 180 | 5 | Unknown |
| 0100-29 | 175 | 173 | 2 | 173 - precise value accepted |
| 0100-43A | 165 | 172 | 7 | Unknown |
| 0100-65L | 170 | 169 | 1 | 169 - precise value accepted |
| 0100-65R | 170 | 169 | 1 | 169 - precise value accepted |
| 0100-86/L | 175 | 175 | 0 | 175 - exact match |
| 0100-86/R | 175 | 175 | 0 | 175 - exact match |
| 0100-166 | 170 | 171 | 1 | 171 - precise value accepted |
| W0160-1 | 160 | 155 | 5 | Unknown |
| W0121-18L | 160 | 164 | 4 | Unknown |
| 0110-39R | 160 | 150 | 10 | Unknown |
| 0112-3 | 130 | 128 | 2 | 128 - precise value accepted |

Summary: 2 exact matches, 6 values within nominal rounding, and 12 unresolved conflicts stored as unknown.

## Serration-heading audit and 0100-166

The full local forceps set was checked only for heading locality; no additional enrichment records were generated.

- 178 of 186 forceps records have one unambiguous serration heading on the same PDF page and same physical half.
- 8 records sit in pages with more than one intra-page serration subsection: `0100-167`, `0100-169`, `0100-349`, `0100-359`, `W0160-79`, `W0160-86C`, `W0160-145`, and `W0160-151/`.
- Those 8 are quarantined from automatic heading inheritance until subpanel boundaries are encoded.
- Zero forceps records require a serration heading to be inherited across a physical page or column break.

`0100-166` is not one of the ambiguous eight. On PDF page 9 it appears in the right physical half beneath an explicit same-half “without serrated tips” heading. The current official product page states serrated. The heading association is reliable, but the sources still conflict; therefore `design.tipSerration` is now null for `0100-166` and the field is listed in `unknownFields` pending manufacturer confirmation.

## Side verification for 0100-17 and 0100-18

The range matrix does not encode left/right side. Both codes correctly map to the upper-molar column there.

Side comes from the individual captions on PDF page 3:

- `0100-17`: upper right molars;
- `0100-18`: upper left molars.

The official pages omit side; they do not explicitly assert that the instruments are non-sided. The verification report now treats this as a secondary-source omission, not a contradiction. Field-level provenance now attributes side to the primary detail page rather than to the matrix.

## Remaining re-verification mismatches

After correcting length handling and reclassifying source omissions, 13 records have unresolved mismatches and 14 field conflicts remain:

- 12 unresolved overall lengths, all stored as unknown;
- 1 unresolved serration value for `0100-166`, stored as unknown;
- 1 tooth-group scope difference for `0100-166`: the matrix selects upper premolars and molars, while the official page describes universal upper use. The record retains the discrete matrix groups and preserves the universal wording only as a primary-source qualifier.

The previous side and paediatric “mismatches” were official-page omissions, not contrary assertions, and are no longer counted as conflicts.

## Differentiating content policy

The enrichment schema continues to store material and reprocessing facts with provenance, but they must not drive descriptions because they are near-constant across the sampled category.

Future native English, Turkish and Arabic copy must be weighted in this order:

1. anatomical application: arch, tooth group, side and patient group;
2. resolved length, when available;
3. pattern code and genuinely named pattern;
4. explicit design distinctions such as beaks-at-rest, tip serration and AsaLady handle variant.

Material, sterilization, reprocessing temperature and reusable/single-use status belong in specifications, not repeated SEO boilerplate.

## Normalized schema and unknown fields

The provenance model, relationship split, price exclusion and field taxonomy remain unchanged. The measurement value now permits null so unresolved medical-device dimensions can be represented honestly while retaining both source values in provenance.

Current unsourced or unresolved counts in the 20-record sample:

| Field | Unknown SKUs | Reason |
|---|---:|---|
| Overall length | 12 | Catalogue and official values differ by more than 2.5 mm. |
| Working length | 20 | Not present in the sampled sources. |
| Material/handle finish | 20 | Material is sourced, but finish is not. |
| Procedure companions | 20 | No official kit, brochure or procedure grouping was established. |
| Tip serration | 1 | `0100-166` has contradictory official sources. |
| Primary-source material | 20 | Chapter 4 does not provide item-level material; official pages do. |
| Primary-source sterilizable/single-use fields | 20 | Chapter 4 does not provide them; official pages do. |

No unknown value is inferred or replaced with a convenient source preference.

## Remaining 11 chapter PDFs: field discovery

Figures are text-term occurrences followed by pages containing the signal, formatted `occurrences/pages`. These are discovery signals, not verified per-SKU coverage.

| Chapter | Pages | Length | Material | Pattern | Sterilization | Single-use | Scope finding |
|---|---:|---:|---:|---:|---:|---:|---|
| 1 - AsaOne | 10 | 52/5 | 8/6 | 0/0 | 5/3 | 3/2 | Dimensions are frequent; other facts occur only for selected families. |
| 2 - Diagnostics | 13 | 57/5 | 14/3 | 1/1 | 2/1 | 0/0 | Dimensions are table-based; material is partial. |
| 3 - Oral Surgery | 24 | 249/21 | 9/3 | 2/1 | 1/1 | 2/1 | Length is broad; other fields are section-specific. |
| 5 - Implant Surgery | 21 | 216/19 | 17/3 | 0/0 | 6/3 | 2/2 | Length is broad; material and reuse facts are limited. |
| 6 - Restorative | 27 | 275/17 | 35/9 | 0/0 | 2/2 | 0/0 | Length is common; material partial; sterilization sparse. |
| 7 - Endodontics | 10 | 15/6 | 0/0 | 0/0 | 0/0 | 0/0 | Some dimensions only; other requested fields absent from extracted text. |
| 8 - Periodontal | 19 | 120/10 | 14/2 | 4/2 | 2/2 | 0/0 | Length is common; other fields are section-specific. |
| 9 - Orthodontics | 19 | 111/15 | 14/7 | 0/0 | 1/1 | 0/0 | The lone sterilization signal is contextual and cannot be assigned to SKUs. |
| 10 - Instrument Cassettes and Trays | 11 | 14/5 | 55/11 | 0/0 | 16/4 | 1/1 | Material is chapter-wide; sterilization applies to several systems. |
| 11 - Impression Trays | 25 | 3/3 | 57/25 | 0/0 | 2/1 | 0/0 | Material is chapter-wide; dimensions and sterilization wording are rare. |
| 12 - Laboratory Instruments | 18 | 97/11 | 16/7 | 0/0 | 0/0 | 0/0 | Length and material are available for subsets. |

## Reproducibility and review gate

- `scripts/build_asadental_forceps_sample.py` rebuilds only the 20-record sample, verification artifacts and chapter audit.
- `scripts/fetch_asadental_audit_sources.py` identifies Tammuz Medical, checks official robots rules and uses the existing local response cache.
- No official descriptive sentence is emitted in derived data.
- No page generation, sitemap, canonical, hreflang, schema markup, route, deploy output or price-bearing file was changed by this correction.
