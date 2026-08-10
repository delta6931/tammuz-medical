"use client";

import { useMemo, useState } from "react";
import type { SiteLocale } from "../_lib/catalog";
import {
  parseTooth, rowsFor, toothFromFdi,
  type Dentition, type NotationSystem, type Tooth,
} from "../tools/_lib/tooth-notation";
import { toothNotationStrings } from "../tools/_strings/tooth-notation";

const SYSTEMS: NotationSystem[] = ["fdi", "universal", "palmer"];

export function ToothNotationConverter({ locale = "EN" }: { locale?: SiteLocale }) {
  const s = toothNotationStrings[locale];
  const [dentition, setDentition] = useState<Dentition>("permanent");
  const [system, setSystem] = useState<NotationSystem>("fdi");
  const [entry, setEntry] = useState("");
  const [clicked, setClicked] = useState<number | null>(null);

  /** Typed input wins while it is non-empty; otherwise the chart selection shows. */
  const typed = useMemo(() => (entry.trim() ? parseTooth(entry, system) : null), [entry, system]);
  const tooth: Tooth | null = entry.trim() ? typed : clicked === null ? null : toothFromFdi(clicked);
  const invalid = Boolean(entry.trim()) && !typed;

  const rows = rowsFor(dentition);

  function selectFromChart(fdi: number) {
    setEntry("");
    setClicked(current => (current === fdi ? null : fdi));
  }

  function switchDentition(next: Dentition) {
    setDentition(next);
    setClicked(null);
    setEntry("");
  }

  return (
    <div className="tn">
      <div className="tn-toggle" role="group" aria-label={s.result.heading}>
        {(["permanent", "primary"] as const).map(kind => (
          <button
            key={kind}
            type="button"
            className={dentition === kind ? "tn-chip on" : "tn-chip"}
            aria-pressed={dentition === kind}
            onClick={() => switchDentition(kind)}
          >
            {s.dentition[kind]}
          </button>
        ))}
      </div>

      <fieldset className="tn-input">
        <legend>{s.input.legend}</legend>
        <label className="tn-field">
          <span>{s.input.label}</span>
          <select value={system} onChange={event => setSystem(event.target.value as NotationSystem)}>
            {SYSTEMS.map(key => <option key={key} value={key}>{s.systems[key]}</option>)}
          </select>
        </label>
        <label className="tn-field">
          <span>{s.systemNotes[system]}</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            dir="ltr"
            value={entry}
            placeholder={s.input.placeholder}
            aria-invalid={invalid}
            onChange={event => setEntry(event.target.value)}
          />
        </label>
        {entry.trim() ? (
          <button type="button" className="tn-clear" onClick={() => setEntry("")}>{s.input.clear}</button>
        ) : null}
      </fieldset>

      {invalid ? <p className="tn-invalid" role="alert">{s.input.invalid}</p> : null}

      <div className="tn-result" aria-live="polite">
        {!tooth ? (
          <p className="tn-empty">{s.result.prompt}</p>
        ) : (
          <>
            <p className="tn-tooth-name">{s.toothName(tooth)}</p>
            <div className="tn-systems">
              <div className={system === "fdi" && entry.trim() ? "tn-system source" : "tn-system"}>
                <span>{s.systems.fdi}</span>
                <b dir="ltr">{tooth.fdi}</b>
              </div>
              <div className={system === "universal" && entry.trim() ? "tn-system source" : "tn-system"}>
                <span>{s.systems.universal}</span>
                <b dir="ltr">{tooth.universal}</b>
              </div>
              <div className={system === "palmer" && entry.trim() ? "tn-system source" : "tn-system"}>
                <span>{s.systems.palmer}</span>
                <b dir="ltr">{tooth.palmer}</b>
              </div>
            </div>
            <dl className="tn-meta">
              <div><dt>{s.result.arch}</dt><dd>{s.values[tooth.arch]}</dd></div>
              <div><dt>{s.result.side}</dt><dd>{s.values[tooth.side]}</dd></div>
              <div><dt>{s.result.quadrant}</dt><dd dir="ltr">{tooth.quadrant}</dd></div>
            </dl>
          </>
        )}
      </div>

      <div className="tn-chart" role="group" aria-label={s.chart.groupLabel}>
        {([[s.chart.upper, rows.upper], [s.chart.lower, rows.lower]] as const).map(([label, row]) => (
          <div className="tn-arch" key={label}>
            <span className="tn-arch-label">{label}</span>
            <div className="tn-row" data-count={row.length}>
              {row.map((fdi, index) => {
                const item = toothFromFdi(fdi)!;
                return (
                  <button
                    key={fdi}
                    type="button"
                    className={tooth?.fdi === fdi ? "tn-tooth selected" : "tn-tooth"}
                    aria-pressed={tooth?.fdi === fdi}
                    aria-label={s.toothName(item)}
                    data-midline={index === row.length / 2 - 1 ? "true" : undefined}
                    onClick={() => selectFromChart(fdi)}
                  >
                    <b>{fdi}</b>
                    <small>{item.universal}</small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <p className="tn-hint">{s.chart.hint}</p>
      </div>
    </div>
  );
}
