/**
 * Projects AsaDental's published set/kit products into the dataset the clinic
 * setup builder reads.
 *
 * Only products that AsaDental actually sells as a set are included, taken from
 * app/_data/asaCatalog.json. Set *contents* are deliberately not included: the
 * catalogue prints them, but extraction is only ~50% reliable (see
 * scripts/extract_asadental_sets.py), and publishing an unverified instrument
 * list for a medical device is not acceptable. The product name states what the
 * set contains, and exact contents are confirmed on quotation.
 *
 *   node scripts/build-clinic-kits-data.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1)));
const OUTPUT = "app/_data/clinicKits.json";

/** Catalogue category → the clinical area a buyer thinks in. */
const AREA_BY_CATEGORY = {
  "Extractive Surgery": "extraction",
  "Ideal Periotomi": "extraction",
  "Periodontal": "periodontal",
  "Diagnostic": "diagnostic",
  "Restorative": "restorative",
  "Impression Trays": "impression",
  "Implant Surgery": "implant",
  "Oral Surgery": "oral_surgery",
  "Laboratory instruments": "laboratory",
  "Orthodontic": "orthodontic",
  "Other ASA Dental instruments": "other",
  "AsaOne disposables": "other",
  "Instrument cassettes and trays": "cassettes",
};

const AREA_ORDER = [
  "diagnostic", "extraction", "periodontal", "restorative", "impression",
  "oral_surgery", "implant", "orthodontic", "cassettes", "laboratory", "other",
];

const catalog = JSON.parse(await readFile(resolve(projectRoot, "app/_data/asaCatalog.json"), "utf8"));

/** AsaDental prefixes set products with S; the name always says "set" or "kit". */
const isSet = item => /^S/.test(item.code) && /\bset\b|\bkit\b|assortment/i.test(item.name);

const byArea = new Map(AREA_ORDER.map(area => [area, []]));
const unmapped = [];

for (const item of catalog.filter(isSet)) {
  const area = AREA_BY_CATEGORY[item.category];
  if (!area) {
    unmapped.push(item);
    continue;
  }
  byArea.get(area).push({ code: item.code, name: item.name.replace(/:\s*$/, ""), category: item.category });
}

const areas = AREA_ORDER
  .map(area => ({ area, kits: byArea.get(area).sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true })) }))
  .filter(entry => entry.kits.length > 0);

const payload = {
  generatedFrom: "app/_data/asaCatalog.json",
  contractVersion: 1,
  areaCount: areas.length,
  kitCount: areas.reduce((total, entry) => total + entry.kits.length, 0),
  areas,
};

await writeFile(resolve(projectRoot, OUTPUT), `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Wrote ${OUTPUT}`);
console.log(`  areas ${payload.areaCount}  kits ${payload.kitCount}`);
for (const entry of areas) console.log(`    ${entry.area.padEnd(13)} ${String(entry.kits.length).padStart(3)}`);
if (unmapped.length) console.log(`  UNMAPPED categories: ${[...new Set(unmapped.map(i => i.category))].join(", ")}`);
