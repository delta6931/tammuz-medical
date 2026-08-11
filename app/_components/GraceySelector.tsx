"use client";

import { useMemo, useState } from "react";
import graceyData from "../_data/graceyCurettes.json";
import { catalogItems, productPath, type SiteLocale } from "../_lib/catalog";
import { ALL_SURFACES, regionForPosition, type Region, type Surface } from "../tools/_lib/gracey";
import { graceyStrings } from "../tools/_strings/gracey-selector";

type Sku = { code: string; name: string; category: string };
type Group = { number: string; ends: number[]; regions: Region[]; surfaces: Surface[]; skus: Sku[] };

const GROUPS = graceyData.groups as Group[];
const SETS = graceyData.unnumbered as Sku[];

/** Rows read left-to-right as the clinician faces the patient. */
const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const catalogByCode = new Map(catalogItems.map(item => [item.code, item]));

function detailPath(code: string, locale: SiteLocale) {
  const item = catalogByCode.get(code);
  return item ? productPath(item, locale) : null;
}

export function GraceySelector({ locale = "EN" }: { locale?: SiteLocale }) {
  const s = graceyStrings[locale];
  const [tooth, setTooth] = useState<number | null>(null);
  const [surface, setSurface] = useState<Surface | null>(null);

  const region: Region | null = tooth === null ? null : regionForPosition(tooth % 10);

  const results = useMemo(() => {
    if (!region || !surface) return [];
    return GROUPS.filter(group => group.regions.includes(region) && group.surfaces.includes(surface));
  }, [region, surface]);

  return (
    <div className="gc">
      <div className="gc-chart" role="group" aria-label={s.chart.groupLabel}>
        {([[s.chart.upper, UPPER_ROW], [s.chart.lower, LOWER_ROW]] as const).map(([label, row]) => (
          <div className="gc-arch" key={label}>
            <span className="gc-arch-label">{label}</span>
            <div className="gc-row">
              {row.map((fdi, index) => (
                <button
                  key={fdi}
                  type="button"
                  className={tooth === fdi ? "gc-tooth selected" : "gc-tooth"}
                  aria-pressed={tooth === fdi}
                  aria-label={s.toothLabel(fdi)}
                  data-midline={index === 7 ? "true" : undefined}
                  onClick={() => setTooth(current => (current === fdi ? null : fdi))}
                >
                  {fdi}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="gc-hint">{s.chart.hint}</p>
      </div>

      <fieldset className="gc-surfaces">
        <legend>{s.surfaceLegend}</legend>
        <div className="gc-surface-row">
          {ALL_SURFACES.map(item => (
            <button
              key={item}
              type="button"
              className={surface === item ? "gc-chip on" : "gc-chip"}
              aria-pressed={surface === item}
              onClick={() => setSurface(current => (current === item ? null : item))}
            >
              {s.surfaces[item]}
            </button>
          ))}
        </div>
        <p className="gc-hint">{s.surfaceHint}</p>
      </fieldset>

      <div className="gc-results" aria-live="polite">
        {!tooth ? (
          <p className="gc-empty">{s.result.prompt}</p>
        ) : !surface ? (
          <p className="gc-empty">{s.result.pickSurface}</p>
        ) : (
          <>
            <div className="gc-results-head">
              <h3>{s.result.heading(s.toothLabel(tooth), s.surfaces[surface])}</h3>
              <span>{results.length} {results.length === 1 ? s.result.countOne : s.result.countMany}</span>
            </div>

            {results.length === 0 ? (
              <p className="gc-empty">{s.result.noMatch}</p>
            ) : (
              <ul className="gc-list">
                {results.map(group => (
                  <li key={group.number} className="gc-card">
                    <div className="gc-figure">
                      <span>{s.result.figure}</span>
                      <b dir="ltr">{group.number}</b>
                    </div>
                    <p className="gc-covers">
                      <em>{s.result.covers}</em>{" "}
                      {group.regions.map(r => s.regions[r]).join(", ")} · {group.surfaces.map(x => s.surfaces[x]).join(", ")}
                    </p>
                    <p className="gc-variants">{s.result.variants} ({group.skus.length})</p>
                    <ul className="gc-skus">
                      {group.skus.map(sku => {
                        const href = detailPath(sku.code, locale);
                        return (
                          <li key={sku.code}>
                            <b dir="ltr">{sku.code}</b>
                            <span>{sku.name}</span>
                            {href ? <a href={href}>{s.link}</a> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {SETS.length > 0 ? (
        <details className="gc-sets">
          <summary>{s.sets.heading} ({SETS.length})</summary>
          <p>{s.sets.note}</p>
          <ul>
            {SETS.map(sku => {
              const href = detailPath(sku.code, locale);
              return (
                <li key={sku.code}>
                  <b dir="ltr">{sku.code}</b>
                  <span>{sku.name}</span>
                  {href ? <a href={href}>{s.link}</a> : null}
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}

      <p className="gc-disclaimer">{s.disclaimer}</p>
    </div>
  );
}
