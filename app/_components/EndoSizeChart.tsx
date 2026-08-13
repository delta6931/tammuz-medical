"use client";
import { useState } from "react";
import type { SiteLocale } from "../_lib/catalog";
import { diameterAt, ENDO_SIZES } from "../tools/_lib/endo-sizing";
import { endoChartStrings } from "../tools/_strings/endo-chart";

const TAPERS = [0.02, 0.04, 0.06];
export function EndoSizeChart({ locale = "EN" }: { locale?: SiteLocale }) {
  const s = endoChartStrings[locale]; const [size, setSize] = useState(25); const [taper, setTaper] = useState(.04); const [distance, setDistance] = useState(10);
  const diameter = diameterAt(size, taper, distance)!;
  return <div className="endo">
    <section className="endo-reference"><h2>{s.chartHeading}</h2><p>{s.chartLede}</p><div className="endo-grid" role="list">
      {ENDO_SIZES.map(item => <article key={item.size} role="listitem" className={`endo-size endo-${item.colour}`}><span className="endo-dot" aria-hidden="true" /><b dir="ltr">{String(item.size).padStart(2, "0")}</b><p>{s.colours[item.colour]}</p><small dir="ltr">Ø {item.tipDiameterMm.toFixed(2)} mm</small></article>)}
    </div></section>
    <section className="endo-calculator"><h2>{s.calculator.heading}</h2><div className="endo-controls">
      <label><span>{s.calculator.size}</span><select value={size} onChange={e => setSize(Number(e.target.value))}>{ENDO_SIZES.map(item => <option value={item.size} key={item.size}>{String(item.size).padStart(2, "0")}</option>)}</select></label>
      <label><span>{s.calculator.taper}</span><select value={taper} onChange={e => setTaper(Number(e.target.value))}>{TAPERS.map(value => <option value={value} key={value}>.{String(value * 100).padStart(2, "0")}</option>)}</select></label>
      <label><span>{s.calculator.distance}</span><input type="number" min="0" max="16" step="1" value={distance} onChange={e => setDistance(Math.min(16, Math.max(0, Number(e.target.value))))} /></label>
    </div><div className="endo-answer" aria-live="polite"><span>{s.calculator.diameter}</span><b dir="ltr">{diameter.toFixed(2)} mm</b><small>{s.calculator.formula}</small></div></section>
    <aside className="endo-caution"><p>{s.caution}</p><small>{s.source}</small></aside>
  </div>;
}
