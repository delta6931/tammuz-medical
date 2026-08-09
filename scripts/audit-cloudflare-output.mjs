import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const outputRoot = resolve(process.argv[2] || "dist/pages");
const freePlanFileLimit = 20_000;
const maximumFileSize = 25 * 1024 * 1024;
let fileCount = 0;
let totalBytes = 0;
let largest = { path: "", size: 0 };

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    const details = await stat(path);
    fileCount += 1;
    totalBytes += details.size;
    if (details.size > largest.size) largest = { path: path.slice(outputRoot.length + 1), size: details.size };
  }
}

await walk(outputRoot);

if (fileCount > freePlanFileLimit) throw new Error(`Cloudflare Pages free-plan file limit exceeded: ${fileCount.toLocaleString()} > ${freePlanFileLimit.toLocaleString()}`);
if (largest.size > maximumFileSize) throw new Error(`Cloudflare Pages 25 MiB per-file limit exceeded by ${largest.path}`);

console.log(JSON.stringify({
  files: fileCount,
  totalMiB: Number((totalBytes / 1024 / 1024).toFixed(2)),
  largestFile: largest.path.replaceAll("\\", "/"),
  largestFileMiB: Number((largest.size / 1024 / 1024).toFixed(2)),
  cloudflareFreePlanFileLimit: freePlanFileLimit,
  cloudflarePerFileLimitMiB: 25,
}, null, 2));
