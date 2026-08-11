/**
 * Gracey curette indications, derived from the published area-specific
 * instrumentation standard. Each Gracey instrument is double-ended and named
 * for its two working ends, e.g. "11/12". Indications are defined per single
 * working end; an instrument covers the union of its two ends.
 *
 * That decomposition is what makes combination instruments work: 11/14 pairs a
 * mesial end with a distal end, so it covers both, while 11/12 is two mirrored
 * mesial ends and covers only mesial surfaces.
 *
 * This is a clinical reference, not a manufacturer specification — the SKUs it
 * is matched against come from the AsaDental catalogue.
 */

export type Region = "anterior" | "premolar" | "molar";
export type Surface = "facial" | "lingual" | "mesial" | "distal";

export const ALL_SURFACES: Surface[] = ["facial", "lingual", "mesial", "distal"];
const POSTERIOR: Region[] = ["premolar", "molar"];
const ANTERIOR_ONLY: Region[] = ["anterior"];

type EndIndication = { regions: Region[]; surfaces: Surface[] };

/**
 * Working-end number → what it is designed to reach.
 *   1–6   anterior (5/6 extends to premolars)
 *   7–10  posterior facial and lingual
 *   11,12 posterior mesial · 13,14 posterior distal
 *   15,16 posterior mesial · 17,18 posterior distal (extended-shank designs)
 */
const END_INDICATION: Record<number, EndIndication> = {
  1: { regions: ANTERIOR_ONLY, surfaces: ALL_SURFACES },
  2: { regions: ANTERIOR_ONLY, surfaces: ALL_SURFACES },
  3: { regions: ANTERIOR_ONLY, surfaces: ALL_SURFACES },
  4: { regions: ANTERIOR_ONLY, surfaces: ALL_SURFACES },
  5: { regions: ["anterior", "premolar"], surfaces: ALL_SURFACES },
  6: { regions: ["anterior", "premolar"], surfaces: ALL_SURFACES },
  7: { regions: POSTERIOR, surfaces: ["facial", "lingual"] },
  8: { regions: POSTERIOR, surfaces: ["facial", "lingual"] },
  9: { regions: POSTERIOR, surfaces: ["facial", "lingual"] },
  10: { regions: POSTERIOR, surfaces: ["facial", "lingual"] },
  11: { regions: POSTERIOR, surfaces: ["mesial"] },
  12: { regions: POSTERIOR, surfaces: ["mesial"] },
  13: { regions: POSTERIOR, surfaces: ["distal"] },
  14: { regions: POSTERIOR, surfaces: ["distal"] },
  15: { regions: POSTERIOR, surfaces: ["mesial"] },
  16: { regions: POSTERIOR, surfaces: ["mesial"] },
  17: { regions: POSTERIOR, surfaces: ["distal"] },
  18: { regions: POSTERIOR, surfaces: ["distal"] },
};

export function isKnownEnd(end: number) {
  return end in END_INDICATION;
}

/** Parses "11/12" into its two working-end numbers. */
export function parseGraceyNumber(label: string): number[] | null {
  const match = label.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const ends = [Number(match[1]), Number(match[2])];
  return ends.every(isKnownEnd) ? ends : null;
}

/** An instrument reaches everything either of its ends reaches. */
export function indicationFor(ends: number[]): EndIndication | null {
  const known = ends.filter(isKnownEnd);
  if (!known.length) return null;

  const regions = new Set<Region>();
  const surfaces = new Set<Surface>();
  for (const end of known) {
    for (const region of END_INDICATION[end].regions) regions.add(region);
    for (const surface of END_INDICATION[end].surfaces) surfaces.add(surface);
  }

  return {
    regions: (["anterior", "premolar", "molar"] as Region[]).filter(r => regions.has(r)),
    surfaces: ALL_SURFACES.filter(s => surfaces.has(s)),
  };
}

/** FDI position digit → tooth region. 1–3 anterior, 4–5 premolar, 6–8 molar. */
export function regionForPosition(position: number): Region {
  return position <= 3 ? "anterior" : position <= 5 ? "premolar" : "molar";
}

export function matches(
  indication: { regions: Region[]; surfaces: Surface[] },
  region: Region,
  surface: Surface,
) {
  return indication.regions.includes(region) && indication.surfaces.includes(surface);
}
