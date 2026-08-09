/**
 * Projects Codex's AsaDental enrichment records into the slim dataset the
 * extraction instrument selector reads at build time.
 *
 * Source of truth is whichever enrichment file exists, newest schema first. The
 * selector never reads the enrichment records directly, so the field mapping
 * below is the single contract between the catalog data layer and the tool.
 * See CLAUDE.md, "The data contract".
 *
 *   node scripts/build-forceps-tool-data.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1)));

/** Full enrichment output wins; the review sample keeps the tool buildable before it lands. */
const candidateSources = [
  "data/asadental/derived/forceps-enriched.json",
  "data/asadental/derived/forceps-sample-20.json",
];

const OUTPUT = "app/_data/forcepsApplications.json";

const source = candidateSources.find(path => existsSync(resolve(projectRoot, path)));
if (!source) {
  console.error(`No enrichment source found. Looked for:\n  ${candidateSources.join("\n  ")}`);
  process.exit(1);
}

const raw = JSON.parse(await readFile(resolve(projectRoot, source), "utf8"));
const records = Array.isArray(raw) ? raw : (raw.records ?? raw.sample ?? []);
if (!records.length) {
  console.error(`${source} contained no records.`);
  process.exit(1);
}

const catalog = JSON.parse(await readFile(resolve(projectRoot, "app/_data/asaCatalog.json"), "utf8"));
const nameByCode = new Map(catalog.map(item => [item.code, item.name]));

const TOOTH_GROUPS = new Set(["incisors_canines", "premolars", "molars", "roots", "wisdom_teeth"]);

const warnings = [];

const projected = records.map(record => {
  const clinical = record.clinical ?? {};
  const design = record.design ?? {};

  const toothGroups = (clinical.toothGroups ?? []).filter(group => {
    if (TOOTH_GROUPS.has(group)) return true;
    warnings.push(`${record.sku}: unknown toothGroup "${group}" dropped`);
    return false;
  });

  if (!nameByCode.has(record.sku)) warnings.push(`${record.sku}: not present in asaCatalog.json`);

  return {
    sku: record.sku,
    name: nameByCode.get(record.sku) ?? record.sku,
    subcategory: record.taxonomy?.officialSubcategory ?? null,
    arches: clinical.arches ?? [],
    toothGroups,
    // An empty sides array means the instrument is not side-specific.
    sides: clinical.sides ?? [],
    children: (clinical.patientGroups ?? []).includes("children"),
    serration: design.tipSerration ?? null,
    beaksAtRest: design.beaksAtRest ?? null,
    handleVariant: design.handleVariant ?? null,
    lengthMm: record.dimensions?.overallLengthMm?.value ?? null,
  };
}).sort((a, b) => a.sku.localeCompare(b.sku, "en", { numeric: true }));

const payload = {
  generatedFrom: source,
  recordCount: projected.length,
  // Bumped whenever the field mapping above changes, so a stale file is obvious.
  contractVersion: 1,
  records: projected,
};

await writeFile(resolve(projectRoot, OUTPUT), `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const withLength = projected.filter(record => record.lengthMm != null).length;
console.log(`Wrote ${OUTPUT}`);
console.log(`  source        ${source}`);
console.log(`  records       ${projected.length}`);
console.log(`  with length   ${withLength}/${projected.length}`);
console.log(`  side-specific ${projected.filter(record => record.sides.length).length}`);
console.log(`  children      ${projected.filter(record => record.children).length}`);
if (warnings.length) console.log(`\nWarnings:\n  ${warnings.join("\n  ")}`);
