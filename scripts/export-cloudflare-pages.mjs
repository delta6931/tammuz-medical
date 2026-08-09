import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cleanRoutes, legacyRoutes, localizeDocumentHtml } from "./site-routes.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(process.argv[2] || "dist/pages");
const workerUrl = pathToFileURL(resolve(projectRoot, "dist/server/index.js"));
workerUrl.searchParams.set("static-export", `${process.pid}-${Date.now()}`);

const { default: worker } = await import(workerUrl.href);
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

function outputFileForRoute(route) {
  if (route.endsWith(".html")) return resolve(outputRoot, route.slice(1));
  if (route === "/") return resolve(outputRoot, "index.html");
  return resolve(outputRoot, route.slice(1), "index.html");
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(resolve(projectRoot, "dist/client"), outputRoot, { recursive: true });

async function renderRoutes(routes, concurrency) {
  let cursor = 0;
  let completed = 0;
  async function renderNext() {
    while (cursor < routes.length) {
      const index = cursor;
      cursor += 1;
      const route = routes[index];
      const response = await worker.fetch(new Request(`https://tammuzmedical.com${route}`, { headers: { accept: "text/html" } }), env, ctx);
      if (!response.ok) throw new Error(`Could not render ${route}: HTTP ${response.status}`);
      const outputFile = outputFileForRoute(route);
      await mkdir(dirname(outputFile), { recursive: true });
      await writeFile(outputFile, localizeDocumentHtml(route, await response.text()), "utf8");
      completed += 1;
      if (completed % 1_000 === 0) console.log(`Rendered ${completed.toLocaleString()} of ${routes.length.toLocaleString()} routes.`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, routes.length) }, () => renderNext()));
}

// Canonical URLs have unique output files and can be rendered concurrently.
// Legacy .html routes are rendered afterward because / and /index.html share a file.
await renderRoutes(cleanRoutes, 32);
await renderRoutes(legacyRoutes, 1);

await mkdir(resolve(outputRoot, "functions/api"), { recursive: true });
await cp(resolve(projectRoot, "deploy/pages/functions/api/quote.js"), resolve(outputRoot, "functions/api/quote.js"));
await writeFile(resolve(outputRoot, "_routes.json"), `${JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }, null, 2)}\n`, "utf8");
await writeFile(resolve(outputRoot, "_redirects"), [
  "/en / 301",
  "/en/ / 301",
  "/en/catalog /catalog 301",
  "/en/contact /contact 301",
  "/en/verified-manufacturers /verified-manufacturers 301",
  "/iraq /ar/iraq/dental-supplies 302",
  "",
].join("\n"), "utf8");
await writeFile(resolve(outputRoot, "_headers"), [
  "/*",
  "  X-Content-Type-Options: nosniff",
  "  Referrer-Policy: strict-origin-when-cross-origin",
  "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
  "",
  "/assets/*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "",
].join("\n"), "utf8");

console.log(`Cloudflare Pages export created at ${outputRoot} with ${cleanRoutes.length} canonical routes.`);
