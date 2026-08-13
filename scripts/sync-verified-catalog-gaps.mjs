/**
 * Adds catalogue codes verified in all three allowed sources: the internal
 * non-price SKU column, the AsaDental 2025 catalogue PDFs, and live official
 * AsaDental product pages. Commercial fields are never read or written.
 */
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../app/_data/asaCatalog.json", import.meta.url);
const catalog = JSON.parse(await readFile(path, "utf8"));
const verified = [
  { code: "2771-1L", name: "Locking tray for 10 instruments (lilac)", category: "Instrument cassettes and trays" },
  { code: "LV1807-02SF", name: "Gracey curette Fig. 1/2, Sharpen Free", category: "Other ASA Dental instruments" },
  { code: "LV1807-04SF", name: "Gracey curette Fig. 3/4, Sharpen Free", category: "Other ASA Dental instruments" },
  { code: "LV1807-08SF", name: "Gracey curette Fig. 7/8, Sharpen Free", category: "Other ASA Dental instruments" },
  { code: "LV1807-12SF", name: "Gracey curette Fig. 11/12, Sharpen Free", category: "Other ASA Dental instruments" },
  { code: "LV1807-14SF", name: "Gracey curette Fig. 13/14, Sharpen Free", category: "Other ASA Dental instruments" },
  { code: "LV1807-16SF", name: "Gracey curette Fig. 15/16, Sharpen Free", category: "Other ASA Dental instruments" },
  { code: "LV1807-18SF", name: "Gracey curette Fig. 17/18, Sharpen Free", category: "Other ASA Dental instruments" },
  { code: "ML1222-1", name: "Plugger PIR2", category: "Other ASA Dental instruments" },
  { code: "SML2021FP", name: "Apical Micro Endo Kit - Essential", category: "Other ASA Dental instruments" },
];

const byCode = new Map(catalog.map(item => [item.code, item]));
for (const item of verified) byCode.set(item.code, item);
const updated = [...byCode.values()].sort((left, right) => left.code.localeCompare(right.code, "en"));
await writeFile(path, `${JSON.stringify(updated)}\n`, "utf8");
console.log(JSON.stringify({ before: catalog.length, after: updated.length, added: updated.length - catalog.length }));
