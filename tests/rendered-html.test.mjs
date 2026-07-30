import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
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

async function request(path, init = {}) {
  return worker.fetch(new Request(`http://localhost${path}`, init), env, ctx);
}

const routes = [
  ["/index.html", "index.html"],
  ["/catalog.html", "catalog.html"],
  ["/verified-manufacturers.html", "verified-manufacturers.html"],
  ["/contact.html", "contact.html"],
];

test("server-renders every required public route with its canonical URL", async () => {
  for (const [route, canonical] of routes) {
    const response = await request(route, { headers: { accept: "text/html" } });
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(
      html,
      /<title>Tammuz Medical — Premium Medical &amp; Dental Supplies \| Turkey &amp; Iraq<\/title>/i,
      route,
    );
    assert.match(
      html,
      new RegExp(`<link[^>]+rel="canonical"[^>]+href="https://tammuzmedical\\.com/${canonical}"`, "i"),
      route,
    );
    assert.match(html, /info@tammuzmedical\.com/);
    assert.match(html, /\+90 533 887 77 40/);
    assert.match(html, /Demozi Kozmetik ve Makina Dış Ticaret Ltd\. Şti\./);
    assert.doesNotMatch(html, /upload\.wikimedia\.org/);
  }
});

test("preserves the required homepage SEO and compliance content", async () => {
  const response = await request("/index.html", { headers: { accept: "text/html" } });
  const html = await response.text();

  assert.match(html, /<h1>Premium Dental Supplies for Turkish Clinics &amp; Distributors<\/h1>/);
  assert.match(html, /ISO 13485/);
  assert.match(html, /CE Mark/);
  assert.match(html, /Pre-Shipment/);
  assert.match(html, /\/assets\/brand\/whatsapp\.png/);
});

test("renders the complete searchable catalog foundation", async () => {
  const response = await request("/catalog.html", { headers: { accept: "text/html" } });
  const html = await response.text();

  assert.match(html, /Search by item code or product name/);
  assert.match(html, /2,959 product references/);
  assert.match(html, /AsaDental product categories/);
});

test("serves branded 404 responses and a direct 404.html route", async () => {
  const missing = await request("/this-page-does-not-exist", {
    headers: { accept: "text/html" },
  });
  assert.equal(missing.status, 404);
  const missingHtml = await missing.text();
  assert.match(missingHtml, /This page is not in our catalog\./);
  assert.match(missingHtml, /<meta(?=[^>]*name="robots")(?=[^>]*content="noindex")[^>]*>/i);

  const static404 = await request("/404.html", { headers: { accept: "text/html" } });
  assert.equal(static404.status, 200);
  assert.match(await static404.text(), /This page is not in our catalog\./);
});

test("validates quote requests before attempting direct email delivery", async () => {
  const getResponse = await request("/api/quote");
  assert.equal(getResponse.status, 405);

  const invalidResponse = await request("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test" }),
  });
  assert.equal(invalidResponse.status, 400);

  const unconfiguredResponse = await request("/api/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
    },
    body: JSON.stringify({
      name: "Test Buyer",
      company: "Test Clinic",
      email: "buyer@example.com",
      country: "Turkey",
      requirement: "Please quote product 0100-1.",
      requestId: "test-quote-request",
    }),
  });
  assert.equal(unconfiguredResponse.status, 503);
  assert.deepEqual(await unconfiguredResponse.json(), {
    ok: false,
    error: "Quote delivery is temporarily unavailable",
  });
});

test("includes crawl files, mobile controls, and the local WhatsApp asset", async () => {
  const [robots, sitemap, css, sitePage, iconStats] = await Promise.all([
    readFile(new URL("public/robots.txt", projectRoot), "utf8"),
    readFile(new URL("public/sitemap.xml", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
    readFile(new URL("app/_components/SitePage.tsx", projectRoot), "utf8"),
    stat(new URL("public/assets/brand/whatsapp.png", projectRoot)),
  ]);

  assert.match(robots, /Sitemap: https:\/\/tammuzmedical\.com\/sitemap\.xml/);
  for (const [, canonical] of routes) {
    assert.match(sitemap, new RegExp(`https://tammuzmedical\\.com/${canonical}`));
  }
  assert.match(css, /@media\(max-width:650px\).*?\.tools\{display:flex;grid-column:1\/-1/s);
  assert.match(sitePage, /fetch\("\/api\/quote"/);
  assert.match(sitePage, /\/assets\/brand\/whatsapp\.png/);
  assert.ok(iconStats.size > 0 && iconStats.size < 50_000);
  await access(new URL("app/not-found.tsx", projectRoot));
});
