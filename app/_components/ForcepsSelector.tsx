"use client";

import { useMemo, useState } from "react";
import forcepsData from "../_data/forcepsApplications.json";
import { catalogItems, productPath, type SiteLocale } from "../_lib/catalog";
import { forcepsStrings } from "../tools/_strings/forceps-selector";

type Arch = "upper" | "lower";
type Side = "left" | "right";
type ToothGroup = "incisors_canines" | "premolars" | "molars" | "wisdom_teeth";

/**
 * Declared rather than inferred from the JSON: empty arrays in the generated file
 * would otherwise widen to `never[]`. This mirrors the contract documented in
 * CLAUDE.md and produced by scripts/build-forceps-tool-data.mjs.
 */
type ForcepsRecord = {
  sku: string;
  name: string;
  subcategory: string | null;
  arches: Arch[];
  toothGroups: (ToothGroup | "roots")[];
  sides: Side[];
  children: boolean;
  serration: "serrated" | "non_serrated" | null;
  beaksAtRest: "open" | "closed" | null;
  handleVariant: "standard" | "asalady" | null;
  lengthMm: number | null;
};

const FORCEPS = forcepsData.records as ForcepsRecord[];

/**
 * FDI two-digit notation. First digit is the quadrant (1 upper-right, 2 upper-left,
 * 3 lower-left, 4 lower-right, from the patient's perspective); second digit counts
 * outward from the midline. Rows read left-to-right as the clinician sees them.
 */
const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

type ToothMeta = { fdi: number; arch: Arch; side: Side; group: ToothGroup };

function toothMeta(fdi: number): ToothMeta {
  const quadrant = Math.floor(fdi / 10);
  const position = fdi % 10;
  return {
    fdi,
    arch: quadrant === 1 || quadrant === 2 ? "upper" : "lower",
    side: quadrant === 1 || quadrant === 4 ? "right" : "left",
    group:
      position <= 3 ? "incisors_canines"
        : position <= 5 ? "premolars"
          : position <= 7 ? "molars"
            : "wisdom_teeth",
  };
}

type Filters = { roots: boolean; children: boolean; asalady: boolean };

function matchesTooth(record: ForcepsRecord, tooth: ToothMeta, filters: Filters) {
  if (!record.arches.includes(tooth.arch)) return false;

  // A retained-root instrument is chosen by arch and side, not by crown position.
  const requiredGroup = filters.roots ? "roots" : tooth.group;
  if (!record.toothGroups.includes(requiredGroup)) return false;

  // An empty sides array means the pattern is not side-specific, so it applies to both.
  if (record.sides.length > 0 && !record.sides.includes(tooth.side)) return false;

  if (filters.children && !record.children) return false;
  if (filters.asalady && record.handleVariant !== "asalady") return false;
  return true;
}

const catalogByCode = new Map(catalogItems.map(item => [item.code, item]));

function detailPath(record: ForcepsRecord, locale: SiteLocale) {
  const item = catalogByCode.get(record.sku);
  return item ? productPath(item, locale) : null;
}

export function ForcepsSelector({ locale = "EN" }: { locale?: SiteLocale }) {
  const s = forcepsStrings[locale];
  const [selected, setSelected] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>({ roots: false, children: false, asalady: false });

  const tooth = selected === null ? null : toothMeta(selected);

  const results = useMemo(() => {
    if (!tooth) return [];
    return FORCEPS
      .filter(record => matchesTooth(record, tooth, filters))
      .sort((a, b) => a.sku.localeCompare(b.sku, "en", { numeric: true }));
  }, [tooth, filters]);

  function toggle(key: keyof Filters) {
    setFilters(current => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="fs">
      <div className="fs-chart" role="group" aria-label={s.chart.groupLabel}>
        {([[s.chart.upperArch, UPPER_ROW], [s.chart.lowerArch, LOWER_ROW]] as const).map(([label, row]) => (
          <div className="fs-arch" key={label}>
            <span className="fs-arch-label">{label}</span>
            <div className="fs-row">
              {row.map(fdi => (
                <button
                  key={fdi}
                  type="button"
                  className={selected === fdi ? "fs-tooth selected" : "fs-tooth"}
                  aria-pressed={selected === fdi}
                  aria-label={s.toothLabel(fdi)}
                  onClick={() => setSelected(current => (current === fdi ? null : fdi))}
                >
                  {fdi}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="fs-hint">{s.chart.hint}</p>
      </div>

      <div className="fs-filters">
        {(["roots", "children", "asalady"] as const).map(key => (
          <button
            key={key}
            type="button"
            className={filters[key] ? "fs-chip on" : "fs-chip"}
            aria-pressed={filters[key]}
            onClick={() => toggle(key)}
          >
            {s.filters[key]}
          </button>
        ))}
      </div>

      <div className="fs-results" aria-live="polite">
        {!tooth ? (
          <p className="fs-empty">{s.results.prompt}</p>
        ) : (
          <>
            <div className="fs-results-head">
              <h3>
                {s.toothLabel(tooth.fdi)}
                {filters.roots ? s.results.rootSuffix : ""}
              </h3>
              <span>
                {results.length} {results.length === 1 ? s.results.countOne : s.results.countMany}
              </span>
            </div>

            {results.length === 0 ? (
              <p className="fs-empty">
                {s.results.noMatch(filters.roots ? s.groupLabels.roots : s.groupLabels[tooth.group])}
              </p>
            ) : (
              <ul className="fs-list">
                {results.map(record => {
                  const href = detailPath(record, locale);
                  return (
                    <li key={record.sku} className="fs-card">
                      <div className="fs-card-head">
                        <b dir="ltr">{record.sku}</b>
                        {record.handleVariant === "asalady" ? <em className="fs-tag">{s.asaladyTag}</em> : null}
                      </div>
                      <p className="fs-card-name">{record.name}</p>
                      <dl className="fs-spec">
                        {record.lengthMm != null ? (
                          <div><dt>{s.spec.length}</dt><dd dir="ltr">{record.lengthMm} mm</dd></div>
                        ) : null}
                        {record.serration ? (
                          <div><dt>{s.spec.tips}</dt><dd>{record.serration === "serrated" ? s.spec.serrated : s.spec.nonSerrated}</dd></div>
                        ) : null}
                        {record.beaksAtRest ? (
                          <div><dt>{s.spec.beaks}</dt><dd>{record.beaksAtRest === "open" ? s.spec.open : s.spec.closed}</dd></div>
                        ) : null}
                      </dl>
                      {href ? <a className="fs-link" href={href}>{s.link}</a> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      <p className="fs-disclaimer">{s.disclaimer(forcepsData.recordCount)}</p>
    </div>
  );
}
