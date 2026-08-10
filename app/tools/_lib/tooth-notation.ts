/**
 * Conversion between the three dental numbering systems, for permanent and
 * primary dentition. FDI (ISO 3950) is used as the internal key because it
 * encodes quadrant and position directly, so the other two derive from it.
 *
 * Pure functions, no UI or locale concerns — labels live in the strings file.
 */

export type Dentition = "permanent" | "primary";
export type Quadrant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type NotationSystem = "fdi" | "universal" | "palmer";

export type Tooth = {
  fdi: number;
  dentition: Dentition;
  quadrant: Quadrant;
  /** 1–8 for permanent, 1–5 for primary, counting outward from the midline. */
  position: number;
  arch: "upper" | "lower";
  side: "right" | "left";
  universal: string;
  palmer: string;
  /** Palmer split into its parts, so the bracket can be styled separately. */
  palmerSymbol: string;
  palmerValue: string;
};

/** Rows read left-to-right as the clinician faces the patient. */
export const PERMANENT_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const PERMANENT_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const PRIMARY_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const PRIMARY_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

export function rowsFor(dentition: Dentition) {
  return dentition === "permanent"
    ? { upper: PERMANENT_UPPER, lower: PERMANENT_LOWER }
    : { upper: PRIMARY_UPPER, lower: PRIMARY_LOWER };
}

export function allTeeth(dentition: Dentition) {
  const { upper, lower } = rowsFor(dentition);
  return [...upper, ...lower];
}

/**
 * Palmer brackets are box-drawing corners placed on the midline-and-occlusal
 * side of the number, as the examiner sees the chart. Upper-right teeth take a
 * corner opening up-and-left, and so on around the quadrants.
 */
const PALMER_BRACKET: Record<"upperRight" | "upperLeft" | "lowerRight" | "lowerLeft", string> = {
  upperRight: "┘", // ┘
  upperLeft: "└",  // └
  lowerRight: "┐", // ┐
  lowerLeft: "┌",  // ┌
};

const UNIVERSAL_PRIMARY_LETTERS = "ABCDEFGHIJKLMNOPQRST";

function quadrantOf(fdi: number) {
  return Math.floor(fdi / 10) as Quadrant;
}

export function isValidFdi(fdi: number): boolean {
  const q = quadrantOf(fdi);
  const p = fdi % 10;
  if (q >= 1 && q <= 4) return p >= 1 && p <= 8;
  if (q >= 5 && q <= 8) return p >= 1 && p <= 5;
  return false;
}

/**
 * Universal numbering runs continuously: 1 at the upper-right last molar, across
 * the upper arch to 16, then down and back across the lower arch to 32. Primary
 * teeth follow the same path lettered A–T.
 */
function universalFor(fdi: number): string {
  const q = quadrantOf(fdi);
  const p = fdi % 10;

  if (q === 1) return String(9 - p);            // 18→1 … 11→8
  if (q === 2) return String(8 + p);            // 21→9 … 28→16
  if (q === 3) return String(25 - p);           // 38→17 … 31→24
  if (q === 4) return String(24 + p);           // 41→25 … 48→32

  const index =
    q === 5 ? 5 - p          // 55→A(0) … 51→E(4)
      : q === 6 ? 4 + p      // 61→F(5) … 65→J(9)
        : q === 7 ? 15 - p   // 75→K(10) … 71→O(14)
          : 14 + p;          // 81→P(15) … 85→T(19)
  return UNIVERSAL_PRIMARY_LETTERS[index];
}

function palmerFor(fdi: number) {
  const q = quadrantOf(fdi);
  const p = fdi % 10;
  const upper = q === 1 || q === 2 || q === 5 || q === 6;
  const right = q === 1 || q === 4 || q === 5 || q === 8;

  const symbol = PALMER_BRACKET[
    upper ? (right ? "upperRight" : "upperLeft") : (right ? "lowerRight" : "lowerLeft")
  ];
  // Primary teeth use letters A–E outward from the midline; permanent use 1–8.
  const value = q >= 5 ? "ABCDE"[p - 1] : String(p);

  // The bracket sits on the midline side, so right-quadrant teeth read value-first.
  return { symbol, value, text: right ? `${value}${symbol}` : `${symbol}${value}` };
}

export function toothFromFdi(fdi: number): Tooth | null {
  if (!isValidFdi(fdi)) return null;
  const q = quadrantOf(fdi);
  const palmer = palmerFor(fdi);

  return {
    fdi,
    dentition: q <= 4 ? "permanent" : "primary",
    quadrant: q,
    position: fdi % 10,
    arch: q === 1 || q === 2 || q === 5 || q === 6 ? "upper" : "lower",
    side: q === 1 || q === 4 || q === 5 || q === 8 ? "right" : "left",
    universal: universalFor(fdi),
    palmer: palmer.text,
    palmerSymbol: palmer.symbol,
    palmerValue: palmer.value,
  };
}

const FDI_BY_UNIVERSAL = new Map<string, number>();
for (const fdi of [...allTeeth("permanent"), ...allTeeth("primary")]) {
  FDI_BY_UNIVERSAL.set(universalFor(fdi).toUpperCase(), fdi);
}

/**
 * Parses user input in a chosen system. The system must be given explicitly:
 * "16" is a valid tooth in both FDI (upper right first molar) and Universal
 * (upper left second premolar), so guessing would silently return wrong answers.
 */
export function parseTooth(raw: string, system: NotationSystem): Tooth | null {
  const input = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!input) return null;

  if (system === "fdi") {
    if (!/^\d{2}$/.test(input)) return null;
    return toothFromFdi(Number(input));
  }

  if (system === "universal") {
    if (/^\d{1,2}$/.test(input)) {
      const n = Number(input);
      if (n < 1 || n > 32) return null;
      return toothFromFdi(FDI_BY_UNIVERSAL.get(String(n))!);
    }
    if (/^[A-T]$/.test(input)) return toothFromFdi(FDI_BY_UNIVERSAL.get(input)!);
    return null;
  }

  // Palmer: accept the bracket characters, or a plain quadrant prefix like "UR6".
  const bracket = input.match(/^([└┘┌┐])?([1-8A-E])([└┘┌┐])?$/);
  if (bracket) {
    const [, before, value, after] = bracket;
    const symbol = before ?? after;
    if (!symbol) return null;
    const right = symbol === PALMER_BRACKET.upperRight || symbol === PALMER_BRACKET.lowerRight;
    const upper = symbol === PALMER_BRACKET.upperRight || symbol === PALMER_BRACKET.upperLeft;
    const isLetter = /[A-E]/.test(value);
    const position = isLetter ? "ABCDE".indexOf(value) + 1 : Number(value);
    const quadrant = isLetter
      ? (upper ? (right ? 5 : 6) : (right ? 8 : 7))
      : (upper ? (right ? 1 : 2) : (right ? 4 : 3));
    return toothFromFdi(quadrant * 10 + position);
  }

  const named = input.match(/^(UR|UL|LR|LL)([1-8A-E])$/);
  if (named) {
    const [, code, value] = named;
    const isLetter = /[A-E]/.test(value);
    const position = isLetter ? "ABCDE".indexOf(value) + 1 : Number(value);
    const map: Record<string, [number, number]> = {
      UR: [1, 5], UL: [2, 6], LL: [3, 7], LR: [4, 8],
    };
    const [permanentQ, primaryQ] = map[code];
    return toothFromFdi((isLetter ? primaryQ : permanentQ) * 10 + position);
  }

  return null;
}
