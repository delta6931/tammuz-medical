"use client";

import { useMemo, useState } from "react";
import type { SiteLocale } from "../_lib/catalog";
import { decodeIso6360, normalizeIso6360 } from "../tools/_lib/iso-6360";
import { iso6360Strings } from "../tools/_strings/iso-6360";

export function Iso6360Decoder({ locale = "EN" }: { locale?: SiteLocale }) {
  const s = iso6360Strings[locale];
  const [entry, setEntry] = useState("");
  const digits = normalizeIso6360(entry);
  const result = useMemo(() => decodeIso6360(entry), [entry]);
  const invalid = Boolean(entry.trim()) && !result;
  const groups = result ? [
    [s.groups.material, result.material], [s.groups.shank, result.shank],
    [s.groups.shape, result.shape], [s.groups.characteristics, result.characteristics],
  ] as const : [];

  return <div className="iso6360">
    <div className="iso6360-input">
      <label><span>{s.input.label}</span><input dir="ltr" inputMode="numeric" value={entry} placeholder={s.input.placeholder} aria-invalid={invalid} onChange={event => setEntry(event.target.value)} /></label>
      <p>{s.input.hint}</p>
      <div className="iso6360-actions">
        <button type="button" onClick={() => setEntry("806 314 001 524 016")}>{s.input.example}</button>
        {entry ? <button type="button" onClick={() => setEntry("")}>{s.input.clear}</button> : null}
      </div>
      {invalid ? <p className="iso6360-error" role="alert">{s.input.invalid} ({digits.length}/15)</p> : null}
    </div>
    {result ? <section className="iso6360-result" aria-live="polite">
      <h2>{s.result}</h2>
      <p className="iso6360-number" dir="ltr">{result.normalized.match(/.{1,3}/g)?.join(" ")}</p>
      <div className="iso6360-grid">
        {groups.map(([label, group]) => <div key={label}><span>{label}</span><b dir="ltr">{group.code}</b><p>{s.known[group.code] ?? s.unknown}</p></div>)}
        <div><span>{s.groups.diameter}</span><b dir="ltr">{result.diameter.code}</b><p dir="ltr">{result.diameter.millimetres.toFixed(1)} {s.diameterUnit}</p></div>
        {result.optionalDiamondCode ? <div><span>{s.groups.optional}</span><b dir="ltr">{result.optionalDiamondCode}</b><p>{s.unknown}</p></div> : null}
      </div>
    </section> : null}
    <aside className="iso6360-note"><p>{s.note}</p><small>{s.source}</small></aside>
  </div>;
}
