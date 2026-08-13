# Medical data status

Updated: 2026-08-13

## Forceps matrix

- Matrix forceps: 186.
- Official product pages checked and cached: 186.
- Lengths published after the ±2.5 mm comparison rule: 78.
- Catalogue/website length conflicts left unknown: 102.
- Official pages with no published length: 6.
- Tip serration still unknown: 11.
- Beaks-at-rest still unknown: 5.

The unresolved dimensions require AsaDental confirmation. They are not safe to backfill from either conflicting source.

## Non-matrix forceps reconciliation

The apparent 57-record gap was a name-search artefact, not 57 extraction patterns missing from the selector. The 58 outside-matrix records consist of other forceps families, sets and accessories; see `NON_MATRIX_FORCEPS_AUDIT.md`. They must not inherit extraction anatomy.

## Catalogue/workbook reconciliation

The non-price SKU column contains 2,969 unique codes. The earlier site catalogue contained 2,959. The ten workbook-only codes were verified in the 2025 catalogue PDFs and on live official AsaDental product pages, so they have been added to the catalogue index:

- `2771-1L`
- `LV1807-02SF`, `LV1807-04SF`, `LV1807-08SF`
- `LV1807-12SF`, `LV1807-14SF`, `LV1807-16SF`, `LV1807-18SF`
- `ML1222-1`
- `SML2021FP`

No price or commercial field was copied. The catalogue now contains all 2,969 workbook SKUs and no catalogue-only codes.

## Set compositions

`asadental-sets.json` remains research-only. It has 144 candidate set labels, only 37 resolved membership lists, and its extracted member count disagrees with the stated count too often for publication. The clinic setup tool intentionally shows verified set codes and names without claiming contents.

Chapter 7 explicitly provides composition lists for `SML2021FP` and `SML2021CF`, but isolated confirmed examples do not make the broad extractor safe. Exact contents should be added only through a separate official-composition dataset with per-set provenance and count validation.

## General catalogue enrichment

- Total catalogue SKUs: 2,969.
- Matrix forceps in the dedicated enrichment: 186.
- Other catalogue records in the general enrichment: 2,783.
- General records matched to a source PDF page: 2,641.
- General records still using safe catalogue-index fallback: 142.

Fallback records publish only verified code/name/category data; unknown specifications remain omitted.
