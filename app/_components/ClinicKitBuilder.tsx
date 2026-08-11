"use client";

import { useMemo, useState } from "react";
import clinicKits from "../_data/clinicKits.json";
import { catalogItems, localizedPath, productPath, type SiteLocale } from "../_lib/catalog";
import { clinicKitStrings } from "../tools/_strings/clinic-kit";

type Kit = { code: string; name: string; category: string };
type Area = { area: string; kits: Kit[] };

const AREAS = clinicKits.areas as Area[];
const WHATSAPP = "905338877740";

const catalogByCode = new Map(catalogItems.map(item => [item.code, item]));

function detailPath(code: string, locale: SiteLocale) {
  const item = catalogByCode.get(code);
  return item ? productPath(item, locale) : null;
}

export function ClinicKitBuilder({ locale = "EN" }: { locale?: SiteLocale }) {
  const s = clinicKitStrings[locale];
  const [rooms, setRooms] = useState(1);
  const [areas, setAreas] = useState<string[]>([]);
  const [lines, setLines] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  const visibleKits = useMemo(
    () => AREAS.filter(entry => areas.includes(entry.area)).flatMap(entry => entry.kits),
    [areas],
  );

  const kitByCode = useMemo(
    () => new Map(AREAS.flatMap(entry => entry.kits).map(kit => [kit.code, kit])),
    [],
  );

  const selected = Object.entries(lines).filter(([, quantity]) => quantity > 0);
  const totalUnits = selected.reduce((total, [, quantity]) => total + quantity, 0);

  function toggleArea(area: string) {
    setAreas(current => (current.includes(area) ? current.filter(item => item !== area) : [...current, area]));
  }

  function setQuantity(code: string, quantity: number) {
    setCopied(false);
    setLines(current => {
      const next = { ...current };
      if (quantity <= 0) delete next[code];
      else next[code] = Math.min(999, quantity);
      return next;
    });
  }

  const listText = useMemo(() => {
    const body = selected.map(([code, quantity]) => `${quantity} x ${code} — ${kitByCode.get(code)?.name ?? code}`);
    return [
      s.summary.subject,
      `${s.step1.label}: ${rooms}`,
      "",
      ...body,
      "",
      `${selected.length} ${s.summary.lines} · ${totalUnits} ${s.summary.totalUnits}`,
    ].join("\n");
  }, [selected, rooms, kitByCode, s, totalUnits]);

  async function copyList() {
    try {
      await navigator.clipboard.writeText(listText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="ck">
      <fieldset className="ck-step">
        <legend>{s.step1.legend}</legend>
        <label className="ck-rooms">
          <span>{s.step1.label}</span>
          <input
            type="number"
            min={1}
            max={99}
            inputMode="numeric"
            dir="ltr"
            value={rooms}
            onChange={event => setRooms(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
          />
        </label>
        <p className="ck-hint">{s.step1.hint}</p>
      </fieldset>

      <fieldset className="ck-step">
        <legend>{s.step2.legend}</legend>
        <div className="ck-areas">
          {AREAS.map(entry => (
            <button
              key={entry.area}
              type="button"
              className={areas.includes(entry.area) ? "ck-chip on" : "ck-chip"}
              aria-pressed={areas.includes(entry.area)}
              onClick={() => toggleArea(entry.area)}
            >
              {s.areas[entry.area] ?? entry.area}
              <em>{entry.kits.length}</em>
            </button>
          ))}
        </div>
        <div className="ck-area-actions">
          <button type="button" onClick={() => setAreas(AREAS.map(entry => entry.area))}>{s.step2.selectAll}</button>
          <button type="button" onClick={() => setAreas([])}>{s.step2.clear}</button>
        </div>
        <p className="ck-hint">{s.step2.hint}</p>
      </fieldset>

      <fieldset className="ck-step">
        <legend>{s.step3.legend}</legend>
        {visibleKits.length === 0 ? (
          <p className="ck-empty">{s.step3.empty}</p>
        ) : (
          <ul className="ck-kits">
            {visibleKits.map(kit => {
              const quantity = lines[kit.code] ?? 0;
              const href = detailPath(kit.code, locale);
              return (
                <li key={kit.code} className={quantity > 0 ? "ck-kit added" : "ck-kit"}>
                  <div>
                    <b dir="ltr">{kit.code}</b>
                    <span>{kit.name}</span>
                  </div>
                  {quantity > 0 ? (
                    <span className="ck-added">{s.step3.added} · {quantity}</span>
                  ) : (
                    <button type="button" className="ck-add" onClick={() => setQuantity(kit.code, rooms)}>
                      {s.step3.add} · {rooms} {s.step3.perRoom}
                    </button>
                  )}
                  {href ? <a className="ck-kit-link" href={href} aria-label={kit.code}>↗</a> : null}
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <div className="ck-summary" aria-live="polite">
        <div className="ck-summary-head">
          <h3>{s.summary.heading}</h3>
          {selected.length > 0 ? (
            <span>{selected.length} {s.summary.lines} · {totalUnits} {s.summary.totalUnits}</span>
          ) : null}
        </div>

        {selected.length === 0 ? (
          <p className="ck-empty">{s.summary.empty}</p>
        ) : (
          <>
            <ul className="ck-lines">
              {selected.map(([code, quantity]) => (
                <li key={code}>
                  <b dir="ltr">{code}</b>
                  <span>{kitByCode.get(code)?.name ?? code}</span>
                  <span className="ck-qty">
                    <button type="button" onClick={() => setQuantity(code, quantity - 1)} aria-label="-">−</button>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      dir="ltr"
                      value={quantity}
                      onChange={event => setQuantity(code, Number(event.target.value) || 0)}
                    />
                    <button type="button" onClick={() => setQuantity(code, quantity + 1)} aria-label="+">+</button>
                  </span>
                  <button type="button" className="ck-remove" onClick={() => setQuantity(code, 0)}>{s.summary.remove}</button>
                </li>
              ))}
            </ul>

            <div className="ck-actions">
              <button type="button" className="button primary" onClick={copyList}>
                {copied ? s.summary.copied : s.summary.copy}
              </button>
              <a
                className="button"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(listText)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.summary.whatsapp}
              </a>
              <a className="button" href={localizedPath("/contact", locale)}>{s.summary.quote}</a>
            </div>
          </>
        )}
      </div>

      <p className="ck-disclaimer">{s.disclaimer}</p>
    </div>
  );
}
