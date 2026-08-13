export type EndoColour = "pink" | "grey" | "purple" | "white" | "yellow" | "red" | "blue" | "green" | "black";

export type EndoSize = {
  size: number;
  colour: EndoColour;
  tipDiameterMm: number;
};

const COLOUR_BY_SIZE: Record<number, EndoColour> = {
  6: "pink", 8: "grey", 10: "purple",
  15: "white", 20: "yellow", 25: "red", 30: "blue", 35: "green", 40: "black",
  45: "white", 50: "yellow", 55: "red", 60: "blue", 70: "green", 80: "black",
  90: "white", 100: "yellow", 110: "red", 120: "blue", 130: "green", 140: "black",
};

export const ENDO_SIZES: EndoSize[] = Object.entries(COLOUR_BY_SIZE).map(([size, colour]) => ({
  size: Number(size), colour, tipDiameterMm: Number(size) / 100,
}));

export function endoSize(size: number): EndoSize | null {
  return ENDO_SIZES.find(entry => entry.size === size) ?? null;
}

/** Constant-taper geometry only: D(x) = D0 + taper x distance. */
export function diameterAt(size: number, taper: number, distanceMm: number): number | null {
  const entry = endoSize(size);
  if (!entry || !Number.isFinite(taper) || !Number.isFinite(distanceMm) || taper < 0 || distanceMm < 0 || distanceMm > 16) return null;
  return entry.tipDiameterMm + taper * distanceMm;
}
