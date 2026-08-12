import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { cleanRoutes, indexableProducts, localizeDocumentHtml, productSlug, toolRoutes } from "../scripts/site-routes.mjs";

const projectRoot = new URL("../", import.meta.url);
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
async function request(path, init = {}) { return worker.fetch(new Request(`http://localhost${path}`, init), env, ctx); }
const forcepsPageFacts = JSON.parse(await readFile(new URL("../app/_data/forcepsProductFacts.json", import.meta.url), "utf8"));
const catalogPageFacts = JSON.parse(await readFile(new URL("../app/_data/catalogProductFacts.json", import.meta.url), "utf8"));
const catalogEnrichment = JSON.parse(await readFile(new URL("../data/asadental/derived/catalog-enriched.json", import.meta.url), "utf8"));

const legacyRoutes = [
  ["/index.html", ""],
  ["/catalog.html", "catalog"],
  ["/verified-manufacturers.html", "verified-manufacturers"],
  ["/contact.html", "contact"],
];

test("server-renders every required legacy route with its clean canonical URL", async () => {
  for (const [route, canonical] of legacyRoutes) {
    const response = await request(route, { headers: { accept: "text/html" } });
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, /<title>[^<]*Tammuz Medical[^<]*<\/title>/i, route);
    assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="https://tammuzmedical\\.com/${canonical}"`, "i"), route);
    assert.match(html, /info@tammuzmedical\.com/);
    assert.match(html, /mailto:info@tammuzmedical\.com/);
    assert.match(html, /\+90 533 887 77 40/);
    assert.match(html, /Demozi Kozmetik ve Makina Dış Ticaret Ltd\. Şti\./);
    assert.doesNotMatch(html, /upload\.wikimedia\.org/);
  }
});

test("preserves the required homepage SEO and compliance content", async () => {
  const html = await (await request("/index.html", { headers: { accept: "text/html" } })).text();
  assert.match(html, /<title>Tammuz Medical — Premium Medical &amp; Dental Supplies \| Turkey &amp; Iraq<\/title>/);
  assert.match(html, /<h1>Premium Dental Supplies for Turkish Clinics &amp; Distributors<\/h1>/);
  assert.match(html, /ISO 13485/);
  assert.match(html, /CE Mark/);
  assert.match(html, /Pre-Shipment/);
  assert.match(html, /\/assets\/brand\/whatsapp\.png/);
});

test("renders the complete searchable catalog foundation", async () => {
  const html = await (await request("/catalog.html", { headers: { accept: "text/html" } })).text();
  assert.match(html, /Search by item code or product name/);
  assert.match(html, /2,959 product references/);
  assert.match(html, /AsaDental product categories/);
  assert.match(html, /Add to quote/);
});

test("renders localized Iraq, category, product and policy routes", async () => {
  for (const path of ["/ar/iraq/dental-supplies", "/tr/catalog/category/diagnostic", "/catalog/product/0102-1-5aksu", "/privacy", "/procurement-guide"]) {
    const response = await request(path, { headers: { accept: "text/html" } });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<link[^>]+rel="canonical"/i, path);
    assert.match(html, /tammuz-medical-og\.webp/i, path);
  }
});

test("keeps the full forceps enrichment and selector projections synchronized", async () => {
  const [enrichment, selector] = await Promise.all([
    readFile(new URL("../data/asadental/derived/forceps-enriched.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../app/_data/forcepsApplications.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  assert.equal(enrichment.recordCount, 186);
  assert.equal(selector.recordCount, 186);
  assert.equal(forcepsPageFacts.recordCount, 186);
  const expected = enrichment.records.map(record => record.sku).sort();
  assert.deepEqual(selector.records.map(record => record.sku).sort(), expected);
  assert.deepEqual(forcepsPageFacts.records.map(record => record.sku).sort(), expected);
  assert.doesNotMatch(JSON.stringify(enrichment), /"(?:price|currency)"\s*:/i);
});

test("covers every non-forceps SKU with price-free catalogue enrichment", () => {
  assert.equal(catalogEnrichment.recordCount, 2_773);
  assert.equal(catalogPageFacts.recordCount, 2_773);
  assert.deepEqual(catalogEnrichment.priorityCounts, { "1b": 237, "2": 2_536 });
  assert.equal(catalogEnrichment.fieldCoverage.sourcePageMatched, 2_631);
  assert.equal(catalogEnrichment.fieldCoverage.sourcePageUnmatched, 142);

  const forcepsCodes = new Set(forcepsPageFacts.records.map(record => record.sku));
  const nonForcepsCodes = new Set(catalogEnrichment.records.map(record => record.sku));
  assert.equal(nonForcepsCodes.size, 2_773);
  assert.equal([...forcepsCodes].filter(code => nonForcepsCodes.has(code)).length, 0);
  assert.deepEqual(
    [...forcepsCodes, ...nonForcepsCodes].sort(),
    indexableProducts.map(product => product.code).sort(),
  );

  const serialized = JSON.stringify(catalogEnrichment);
  assert.doesNotMatch(serialized, /"(?:price|currency|unitPrice|listPrice)"\s*:/i);
  for (const record of catalogEnrichment.records.filter(record => !record.provenance.sources.length)) {
    assert.equal(record.dimensions.overallLengthMm, null, record.sku);
    assert.equal(record.dimensions.tipWidthMm, null, record.sku);
    assert.equal(record.dimensions.diameterMm, null, record.sku);
    assert.equal(record.dimensions.sizeMm, null, record.sku);
    assert.deepEqual(record.material, [], record.sku);
    assert.deepEqual(record.clinical.documentedUses, [], record.sku);
  }
});

test("renders native EN, TR and AR catalogue facts outside the forceps slice", async () => {
  const cases = [
    ["0103-10", "", /Extractive Surgery catalogue record/, /Bone rongeur Luer/, /Overall length/],
    ["2800-L4", "/tr", /Belgelenmiş katalog bilgileri/, /ölçü kaşığı/, /Alüminyum/i],
    ["2804S-L1", "/ar", /حقائق الكتالوج الموثقة/, /ملعقة طبعة/, /فولاذ مقاوم للصدأ/],
  ];
  for (const [code, prefix, heading, family, fact] of cases) {
    const item = indexableProducts.find(product => product.code === code);
    assert.ok(item, code);
    const path = `${prefix}/catalog/product/${productSlug(item)}`;
    const response = await request(path, { headers: { accept: "text/html" } });
    assert.equal(response.status, 200, code);
    const html = localizeDocumentHtml(path, await response.text());
    assert.match(html, /class="section product-enrichment"/, code);
    assert.match(html, heading, code);
    assert.match(html, family, code);
    assert.match(html, fact, code);
    if (prefix === "/ar") assert.match(html, /<html lang="ar" dir="rtl">/i);
  }

  const unmatched = indexableProducts.find(product => product.code === "W0240-1");
  assert.ok(unmatched);
  const unmatchedHtml = await (await request(`/catalog/product/${productSlug(unmatched)}`, { headers: { accept: "text/html" } })).text();
  assert.match(unmatchedHtml, /product-enrichment/);
  assert.doesNotMatch(unmatchedHtml, /Overall length/);
  assert.doesNotMatch(unmatchedHtml, /Material and reprocessing/);
});

test("renders all 186 enriched forceps pages in every supported locale", async () => {
  const labels = { "": "Overall length", "/tr": "Toplam uzunluk", "/ar": "الطول الكلي" };
  for (const record of forcepsPageFacts.records) {
    const item = indexableProducts.find(product => product.code === record.sku);
    assert.ok(item, record.sku);
    for (const prefix of ["", "/tr", "/ar"]) {
      const path = `${prefix}/catalog/product/${productSlug(item)}`;
      const response = await request(path, { headers: { accept: "text/html" } });
      assert.equal(response.status, 200, `${prefix || "/en"}/${record.sku}`);
      const html = localizeDocumentHtml(path, await response.text());
      assert.match(html, /class="section product-enrichment"/, `${prefix || "/en"}/${record.sku}`);
      assert.match(html, new RegExp(record.sku.replace("/", "\\/")), `${prefix || "/en"}/${record.sku}`);
      if (record.lengthMm == null) assert.doesNotMatch(html, new RegExp(labels[prefix]), `${prefix || "/en"}/${record.sku}`);
      else assert.match(html, new RegExp(labels[prefix]), `${prefix || "/en"}/${record.sku}`);
    }
  }
});

test("renders non-sample forceps enrichment natively in English, Turkish and Arabic", async () => {
  const cases = [
    ["0100-107", "", /Verified forceps application/, /upper incisors and canines/],
    ["0130-89", "/tr", /Doğrulanmış forseps uygulaması/, /üst çenedeki sağ molarlar/],
    ["W0121-101", "/ar", /استخدام موثق لملقط الخلع/, /الفك العلوي/],
  ];
  for (const [code, prefix, eyebrow, clinical] of cases) {
    const item = indexableProducts.find(product => product.code === code);
    assert.ok(item, code);
    const response = await request(`${prefix}/catalog/product/${productSlug(item)}`, { headers: { accept: "text/html" } });
    assert.equal(response.status, 200, code);
    const html = localizeDocumentHtml(`${prefix}/catalog/product/${productSlug(item)}`, await response.text());
    assert.match(html, eyebrow, code);
    assert.match(html, clinical, code);
    assert.match(html, /product-enrichment/, code);
    if (prefix === "/ar") assert.match(html, /<html lang="ar" dir="rtl">/i);
  }

  const resolved = indexableProducts.find(product => product.code === "0130-89");
  const resolvedHtml = await (await request(`/tr/catalog/product/${productSlug(resolved)}`, { headers: { accept: "text/html" } })).text();
  assert.match(resolvedHtml, /Toplam uzunluk/);
  assert.match(resolvedHtml, /175 mm/);
  assert.match(resolvedHtml, /Malzeme ve yeniden işleme/);

  const conflicting = indexableProducts.find(product => product.code === "0100-13");
  const conflictingHtml = await (await request(`/catalog/product/${productSlug(conflicting)}`, { headers: { accept: "text/html" } })).text();
  assert.doesNotMatch(conflictingHtml, /Overall length/);
});

test("creates a localized, crawlable product page for every catalog reference", async () => {
  assert.equal(indexableProducts.length, 2_959);
  // Base pages + categories + products, in three locales, plus the standalone
  // /tools pages. Derived from toolRoutes so adding a tool does not fail this.
  assert.equal(cleanRoutes.length, (8 + 13 + indexableProducts.length) * 3 + toolRoutes.length);

  const productRoutes = cleanRoutes.filter(route => route.includes("/catalog/product/"));
  assert.equal(productRoutes.length, 2_959 * 3);

  for (const code of ["0103-10", "0280-2R", "2800-L4"]) {
    const item = indexableProducts.find(product => product.code === code);
    assert.ok(item, code);
    const slug = productSlug(item);
    for (const prefix of ["", "/tr", "/ar"]) {
      assert.ok(productRoutes.includes(`${prefix}/catalog/product/${slug}`), `${prefix}/${code}`);
    }
  }

  const sample = indexableProducts.find(product => product.code === "0103-10");
  const response = await request(`/ar/catalog/product/${productSlug(sample)}`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(localizeDocumentHtml("/ar/catalog/product/example", html), /<html lang="ar" dir="rtl">/);
  assert.match(html, /0103-10/);
  assert.match(html, /[؀-ۿ]/);
  assert.match(html, /<script type="application\/ld\+json">.*?"@type":"Product"/s);
  assert.match(html, /hrefLang="ar"/i);
});

test("serves branded 404 responses and a direct 404.html route", async () => {
  const missing = await request("/this-page-does-not-exist", { headers: { accept: "text/html" } });
  assert.equal(missing.status, 404);
  const missingHtml = await missing.text();
  assert.match(missingHtml, /This page is not in our catalog\./);
  assert.match(missingHtml, /<meta(?=[^>]*name="robots")(?=[^>]*content="noindex")[^>]*>/i);
  const static404 = await request("/404.html", { headers: { accept: "text/html" } });
  assert.equal(static404.status, 200);
  assert.match(await static404.text(), /This page is not in our catalog\./);
});

test("validates quote requests before attempting direct email delivery", async () => {
  assert.equal((await request("/api/quote")).status, 405);
  assert.equal((await request("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Test" }) })).status, 400);
  const unconfiguredResponse = await request("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost" },
    body: JSON.stringify({
      name: "Test Buyer",
      company: "Test Clinic",
      email: "buyer@example.com",
      country: "Turkey",
      requirement: "Please quote product 0100-1.",
      consent: true,
      products: [{ code: "0100-1", name: "Extracting forcep with non slip jaws #1", quantity: 2 }],
      requestId: "test-quote-request",
    }),
  });
  assert.equal(unconfiguredResponse.status, 503);
  assert.deepEqual(await unconfiguredResponse.json(), { ok: false, error: "Quote delivery is temporarily unavailable" });
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
  for (const canonical of ["", "catalog", "verified-manufacturers", "contact", "ar/iraq/dental-supplies", "privacy"]) assert.match(sitemap, new RegExp(`https://tammuzmedical\\.com/${canonical}`));
  assert.equal((sitemap.match(/<url>/g) ?? []).length, cleanRoutes.length);
  assert.match(sitemap, /hreflang="ar"/);
  assert.match(sitemap, /hreflang="x-default"/);
  assert.match(css, /@media\(max-width:650px\).*?\.tools\{display:flex;grid-column:1\/-1/s);
  assert.match(css, /\.form-honeypot\{[^}]*clip-path:inset\(50%\)/);
  assert.doesNotMatch(css, /\.form-honeypot\{[^}]*left:-10000px/);
  assert.match(sitePage, /fetch\("\/api\/quote"/);
  assert.match(sitePage, /className="category-index section"/);
  assert.match(sitePage, /className="section product-related"/);
  assert.match(sitePage, /\/assets\/brand\/whatsapp\.png/);
  assert.ok(iconStats.size > 0 && iconStats.size < 50_000);
  await access(new URL("app/not-found.tsx", projectRoot));
});

test("uses optimized local marketing media", async () => {
  const [hero, video, social, sitePage] = await Promise.all([
    stat(new URL("public/assets/hero-instrument-collage.webp", projectRoot)),
    stat(new URL("public/assets/videos/asadental-showcase-preview.mp4", projectRoot)),
    stat(new URL("public/assets/social/tammuz-medical-og.webp", projectRoot)),
    readFile(new URL("app/_components/SitePage.tsx", projectRoot), "utf8"),
  ]);
  assert.ok(hero.size < 150_000);
  assert.ok(video.size < 2_000_000);
  assert.ok(social.size < 500_000);
  assert.doesNotMatch(sitePage, /src="\/assets\/videos\/asadental-showcase\.mp4"/);
});
