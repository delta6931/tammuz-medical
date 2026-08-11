/**
 * Projects the AsaDental catalogue into the dataset the Gracey curette selector
 * reads at build time.
 *
 * SKUs and product names come from app/_data/asaCatalog.json (the manufacturer
 * catalogue). The clinical indication per Gracey number is derived from the
 * working-end table in app/tools/_lib/gracey.ts, so the mapping lives in exactly
 * one place and is covered by tests/gracey.test.mts.
 *
 *   node scripts/build-gracey-tool-data.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1)));
const OUTPUT = "app/_data/graceyCurettes.json";

const { parseGraceyNumber, indicationFor } = await import(
  new URL("../app/tools/_lib/gracey.ts", import.meta.url).href
);

const catalog = JSON.parse(await readFile(resolve(projectRoot, "app/_data/asaCatalog.json"), "utf8"));

const graceyItems = catalog.filter(item => /gracey/i.test(item.name));

/** Product names carry the figure as "# 11/12", "#11/12" or "Fig. 5/6". */
const NUMBER_PATTERN = /(?:#\s*|Fig\.\s*)(\d{1,2}\s*\/\s*\d{1,2})/i;

const groups = new Map();
const unnumbered = [];
const unmapped = [];

for (const item of graceyItems) {
  const found = item.name.match(NUMBER_PATTERN);
  if (!found) {
    // Sets and kits list no figure; they are offered separately, not per surface.
    unnumbered.push({ code: item.code, name: item.name, category: item.category });
    continue;
  }

  const label = found[1].replace(/\s+/g, "");
  const ends = parseGraceyNumber(label);
  if (!ends) {
    unmapped.push({ code: item.code, name: item.name, label });
    continue;
  }

  if (!groups.has(label)) {
    const indication = indicationFor(ends);
    groups.set(label, { number: label, ends, regions: indication.regions, surfaces: indication.surfaces, skus: [] });
  }
  groups.get(label).skus.push({ code: item.code, name: item.name, category: item.category });
}

const ordered = [...groups.values()].sort((a, b) => a.ends[0] - b.ends[0] || a.ends[1] - b.ends[1]);
for (const group of ordered) {
  group.skus.sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
}

const payload = {
  generatedFrom: "app/_data/asaCatalog.json",
  contractVersion: 1,
  groupCount: ordered.length,
  skuCount: ordered.reduce((total, group) => total + group.skus.length, 0),
  groups: ordered,
  unnumbered: unnumbered.sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true })),
};

await writeFile(resolve(projectRoot, OUTPUT), `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Wrote ${OUTPUT}`);
console.log(`  Gracey SKUs found  ${graceyItems.length}`);
console.log(`  numbered groups    ${ordered.length} (${payload.skuCount} SKUs)`);
console.log(`  sets without a figure ${unnumbered.length}`);
for (const group of ordered) {
  console.log(`    ${group.number.padEnd(6)} ${String(group.skus.length).padStart(3)} SKUs  ${group.regions.join("+")} · ${group.surfaces.join("/")}`);
}
if (unmapped.length) {
  console.log(`\n  UNMAPPED figures (not in the working-end table):`);
  for (const item of unmapped) console.log(`    ${item.code} "${item.label}" — ${item.name}`);
}
