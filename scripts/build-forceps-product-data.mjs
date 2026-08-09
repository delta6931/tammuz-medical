/**
 * Build the compact product-page projection from the full provenance records.
 * The full medical-device source data remains in data/asadental/derived; only
 * facts needed to render the 186 forceps pages enter the browser bundle.
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1)));
const SOURCE = "data/asadental/derived/forceps-enriched.json";
const OUTPUT = "app/_data/forcepsProductFacts.json";

const raw = JSON.parse(await readFile(resolve(projectRoot, SOURCE), "utf8"));
const records = raw.records ?? [];
if (records.length !== 186) {
  throw new Error(`Expected 186 forceps enrichment records, received ${records.length}`);
}

const projected = records.map(record => ({
  sku: record.sku,
  subcategory: record.taxonomy.officialSubcategory,
  patternCode: record.design.patternCode,
  patternName: record.design.patternName,
  handleVariant: record.design.handleVariant,
  handleFeatures: record.design.handleFeatures,
  serration: record.design.tipSerration,
  beaksAtRest: record.design.beaksAtRest,
  arches: record.clinical.arches,
  toothGroups: record.clinical.toothGroups,
  sides: record.clinical.sides,
  patientGroups: record.clinical.patientGroups,
  qualifiers: [...new Set(record.clinical.applications.map(application => application.qualifier).filter(Boolean))],
  lengthMm: record.dimensions.overallLengthMm.value,
  materialName: record.material?.name ?? null,
  singleUse: record.reprocessing.singleUse,
  sterilizable: record.reprocessing.sterilizable,
  maxTemperatureC: record.reprocessing.maxTemperatureC,
  relatedSkus: record.relationships.relatedVariants.map(relationship => relationship.sku),
}));

await writeFile(
  resolve(projectRoot, OUTPUT),
  `${JSON.stringify({ generatedFrom: SOURCE, contractVersion: 1, recordCount: projected.length, records: projected }, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${OUTPUT} (${projected.length} records)`);
