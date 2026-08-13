/** Pure ISO 6360 parsing. Only codes verified in ISO/manufacturer sources are named. */

export type Iso6360Group = {
  code: string;
  meaning: string | null;
};

export type Iso6360Result = {
  normalized: string;
  material: Iso6360Group;
  shank: Iso6360Group;
  shape: Iso6360Group;
  characteristics: Iso6360Group;
  diameter: Iso6360Group & { millimetres: number };
  optionalDiamondCode: string | null;
};

const MATERIAL: Record<string, string> = {
  "806": "Diamond abrasive instrument",
};

const SHANK: Record<string, string> = {
  "204": "Right-angle (RA) shank, 22 mm",
  "205": "Long right-angle (RA) shank, 26 mm",
  "206": "Extra-long right-angle (RA) shank, 34 mm",
  "313": "Short friction-grip (FG) shank, 16 mm",
  "314": "Friction-grip (FG) shank, 19 mm",
  "315": "Long friction-grip (FG) shank, 21 mm",
  "316": "Extra-long friction-grip (FG) shank, 25 mm",
};

const SHAPE: Record<string, string> = {
  "001": "Round",
};

const DIAMOND_GRIT: Record<string, string> = {
  "494": "Ultra-fine diamond grit",
  "504": "Extra-fine diamond grit",
  "514": "Fine diamond grit",
  "524": "Medium diamond grit",
  "534": "Coarse diamond grit",
  "544": "Super-coarse diamond grit",
};

export function normalizeIso6360(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

export function decodeIso6360(raw: string): Iso6360Result | null {
  const normalized = normalizeIso6360(raw);
  if (normalized.length !== 15 && normalized.length !== 18) return null;

  const materialCode = normalized.slice(0, 3);
  const shankCode = normalized.slice(3, 6);
  const shapeCode = normalized.slice(6, 9);
  const characteristicCode = normalized.slice(9, 12);
  const diameterCode = normalized.slice(12, 15);
  const diameter = Number(diameterCode) / 10;

  if (!Number.isFinite(diameter) || diameter <= 0) return null;

  return {
    normalized,
    material: { code: materialCode, meaning: MATERIAL[materialCode] ?? null },
    shank: { code: shankCode, meaning: SHANK[shankCode] ?? null },
    shape: { code: shapeCode, meaning: SHAPE[shapeCode] ?? null },
    characteristics: {
      code: characteristicCode,
      meaning: materialCode === "806" ? DIAMOND_GRIT[characteristicCode] ?? null : null,
    },
    diameter: { code: diameterCode, millimetres: diameter, meaning: `${diameter.toFixed(1)} mm` },
    optionalDiamondCode: normalized.length === 18 ? normalized.slice(15, 18) : null,
  };
}
