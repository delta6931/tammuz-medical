/**
 * Build deployment-friendly catalog thumbnails from AsaDental's source folders.
 *
 * The supplied image set is several gigabytes, so the storefront uses compact
 * WebP derivatives plus a generated code-to-image index. Product codes are
 * matched as complete filename tokens; this prevents 0100-1 from accidentally
 * matching 0100-107. A few half-size codes use "/" in the spreadsheet and
 * "1-2" in the supplied filename, so explicit filename variants cover them.
 *
 * Usage:
 *   node scripts/build-product-thumbnails.mjs <source-folder> [source-folder...]
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CATALOG_PATH = path.join(PROJECT_ROOT, "app", "_data", "asaCatalog.json");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "assets", "product-thumbs");
const INDEX_PATH = path.join(PROJECT_ROOT, "app", "_data", "productImages.json");
const IMAGE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png", ".webp"]);

const sourceRoots = process.argv.slice(2).map(source => path.resolve(source));
if (sourceRoots.length === 0) {
  throw new Error("Pass at least one source image folder.");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(entry => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(entryPath) : [entryPath];
    }),
  );
  return nested.flat();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function filenameVariants(code) {
  const variants = new Set([code]);
  const cleaned = code.replace(/\.+$/, "");
  variants.add(cleaned);

  // The workbook abbreviates "one half" as a slash while filenames spell it 1-2.
  if (cleaned.endsWith("/")) {
    variants.add(`${cleaned.slice(0, -1)} 1-2`);
  }
  if (/\/[LR]$/i.test(cleaned)) {
    variants.add(cleaned.replace(/\/([LR])$/i, " 1-2$1"));
  }

  // Workbook and media naming conventions differ for a handful of families.
  variants.add(cleaned.replace(/TH(?=-)/i, ""));
  variants.add(cleaned.replace(/\//g, "-"));

  // Some sub-brands reuse the core instrument photograph without the prefix.
  const withoutSeriesPrefix = cleaned
    .replace(/^S(?=(?:RC|WLV|ML))/i, "")
    .replace(/^W(?=(?:ML|LV|\d))/i, "")
    .replace(/^(?:RC|ML|MV|LV)(?=\d)/i, "");
  variants.add(withoutSeriesPrefix);
  variants.add(withoutSeriesPrefix.replace(/(?:SSF|SF)$/i, ""));

  // Use a manufacturer-supplied family image when a color/finish variant has
  // no separate file. Exact code matches always remain preferred.
  variants.add(cleaned.replace(/-(?:CR)?[A-Z]?\d*$/i, ""));

  // Known equivalent naming for the Versatile rubber-dam line.
  if (/^VE/i.test(cleaned)) variants.add(cleaned.replace(/^VE/i, "VS"));

  return [...variants];
}

function tokenPattern(value) {
  return new RegExp(`(?:^|[^A-Z0-9])${escapeRegExp(value)}(?=$|[^A-Z0-9])`, "i");
}

function chooseSource(code, sourceFiles) {
  const variants = filenameVariants(code);
  const candidates = sourceFiles
    .filter(file => variants.some(variant => tokenPattern(variant).test(file.baseName)))
    .sort((left, right) => {
      const exactLeft = variants.some(variant => left.baseName.toLowerCase() === variant.toLowerCase());
      const exactRight = variants.some(variant => right.baseName.toLowerCase() === variant.toLowerCase());
      if (exactLeft !== exactRight) return exactLeft ? -1 : 1;
      return left.baseName.length - right.baseName.length || left.fullPath.localeCompare(right.fullPath);
    });

  return candidates[0]?.fullPath;
}

async function runPool(items, worker, concurrency = 10) {
  let cursor = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf8"));
const discovered = (
  await Promise.all(sourceRoots.map(root => walk(root)))
).flat();
const sourceFiles = discovered
  .filter(file => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
  .map(fullPath => ({ fullPath, baseName: path.basename(fullPath, path.extname(fullPath)) }));

const sourceByCode = {};
for (const item of catalog) {
  const source = chooseSource(item.code, sourceFiles);
  if (source) sourceByCode[item.code] = source;
}

const uniqueSources = [...new Set(Object.values(sourceByCode))];
const publicPathBySource = {};
for (const source of uniqueSources) {
  const sourceStem = path.basename(source, path.extname(source))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const digest = createHash("sha1").update(source).digest("hex").slice(0, 10);
  publicPathBySource[source] = `/assets/product-thumbs/${sourceStem || "product"}-${digest}.webp`;
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });

let built = 0;
await runPool(uniqueSources, async source => {
  const publicPath = publicPathBySource[source];
  const outputPath = path.join(PROJECT_ROOT, "public", ...publicPath.split("/").filter(Boolean));
  await sharp(source)
    .rotate()
    .resize(260, 260, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      withoutEnlargement: true,
    })
    .webp({ quality: 68, smartSubsample: true })
    .toFile(outputPath);
  built += 1;
  if (built % 250 === 0) process.stdout.write(`Built ${built}/${uniqueSources.length}\n`);
});

const imageIndex = Object.fromEntries(
  Object.entries(sourceByCode)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([code, source]) => [code, publicPathBySource[source]]),
);
await writeFile(INDEX_PATH, `${JSON.stringify(imageIndex)}\n`, "utf8");

const missing = catalog.filter(item => !imageIndex[item.code]);
const outputFiles = await readdir(OUTPUT_DIR);
process.stdout.write(
  [
    `Catalog entries: ${catalog.length}`,
    `Source images: ${sourceFiles.length}`,
    `Matched products: ${Object.keys(imageIndex).length}`,
    `Missing products: ${missing.length}`,
    `Generated thumbnails: ${outputFiles.length}`,
    missing.length ? `First missing codes: ${missing.slice(0, 30).map(item => item.code).join(", ")}` : "",
  ].filter(Boolean).join("\n") + "\n",
);
