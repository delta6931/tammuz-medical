/**
 * Project the full provenance-rich catalogue enrichment into the compact
 * product-page data used by the static renderer. The approved forceps slice
 * remains in its separate, selector-stable data contract.
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1)));
const sourcePath = "data/asadental/derived/catalog-enriched.json";
const outputPath = "app/_data/catalogProductFacts.json";

const source = JSON.parse(await readFile(resolve(projectRoot, sourcePath), "utf8"));
if (source.recordCount !== 2773 || source.records?.length !== 2773) {
  throw new Error(`Expected 2,773 non-forceps records, received ${source.records?.length ?? 0}`);
}

// Short projection keys keep the visitor-facing JavaScript substantially
// smaller; the descriptive field names remain in the canonical derived JSON.
const records = source.records.map(record => ({
  s: record.sku,
  f: record.taxonomy.family,
  l: record.dimensions.overallLengthMm,
  w: record.dimensions.tipWidthMm,
  d: record.dimensions.diameterMm,
  z: record.dimensions.sizeMm,
  a: record.dimensions.anglesDegrees,
  o: record.design.forms,
  v: record.design.sizeDesignations,
  c: record.design.colors,
  h: record.clinical.arches,
  t: record.clinical.toothGroups,
  e: record.clinical.sides,
  p: record.clinical.patientGroups,
  u: record.clinical.documentedUses,
  m: record.material,
  n: record.finish,
  q: record.packaging.quantity,
  r: [record.reprocessing.singleUse, record.reprocessing.sterilizable, record.reprocessing.maxTemperatureC],
  x: record.provenance.sources.length > 0,
}));

const serialized = JSON.stringify({
  generatedFrom: sourcePath,
  contractVersion: 1,
  recordCount: records.length,
  priorityCounts: source.priorityCounts,
  fieldCoverage: source.fieldCoverage,
  records,
}, null, 2);

if (/"(?:price|currency|unitPrice|listPrice)"\s*:/i.test(serialized)) {
  throw new Error("Commercial field detected in product-page projection");
}

await writeFile(resolve(projectRoot, outputPath), `${serialized}\n`, "utf8");
console.log(`Wrote ${outputPath} (${records.length} records)`);
