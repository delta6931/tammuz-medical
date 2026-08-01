import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(process.argv[2] || "dist/pages");
const workerUrl = pathToFileURL(resolve(projectRoot, "dist/server/index.js"));
workerUrl.searchParams.set("static-export", `${process.pid}-${Date.now()}`);

const { default: worker } = await import(workerUrl.href);
const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};
const ctx = {
  waitUntil() {},
  passThroughOnException() {},
};

const routes = [
  ["/index.html", "index.html"],
  ["/catalog.html", "catalog.html"],
  ["/verified-manufacturers.html", "verified-manufacturers.html"],
  ["/contact.html", "contact.html"],
  ["/404.html", "404.html"],
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(resolve(projectRoot, "dist/client"), outputRoot, { recursive: true });

for (const [route, filename] of routes) {
  const response = await worker.fetch(
    new Request(`https://tammuzmedical.com${route}`, {
      headers: { accept: "text/html" },
    }),
    env,
    ctx,
  );

  if (!response.ok) {
    throw new Error(`Could not render ${route}: HTTP ${response.status}`);
  }

  await writeFile(resolve(outputRoot, filename), await response.text(), "utf8");
}

await mkdir(resolve(outputRoot, "functions/api"), { recursive: true });
await cp(
  resolve(projectRoot, "deploy/pages/functions/api/quote.js"),
  resolve(outputRoot, "functions/api/quote.js"),
);
await writeFile(
  resolve(outputRoot, "_routes.json"),
  `${JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }, null, 2)}\n`,
  "utf8",
);

console.log(`Cloudflare Pages export created at ${outputRoot}`);
