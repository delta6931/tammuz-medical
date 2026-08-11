import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1)));
const catalogItems = JSON.parse(await readFile(resolve(projectRoot, "app/_data/asaCatalog.json"), "utf8"));

export const categories = [
  ["AsaOne disposables", "asaone-disposables"],
  ["Diagnostic", "diagnostic"],
  ["Oral Surgery", "oral-surgery"],
  ["Extractive Surgery", "extractive-surgery"],
  ["Implant Surgery", "implant-surgery"],
  ["Restorative", "restorative"],
  ["Periodontal", "periodontal"],
  ["Orthodontic", "orthodontic"],
  ["Instrument cassettes and trays", "instrument-cassettes-trays"],
  ["Ideal Periotomi", "ideal-periotomi"],
  ["Impression Trays", "impression-trays"],
  ["Laboratory instruments", "laboratory-instruments"],
  ["Other ASA Dental instruments", "other-asadental-instruments"],
];

const slugify = value => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const stableHash = value => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).slice(0, 5);
};

export const productSlug = item => `${slugify(item.code)}-${stableHash(`${item.code}|${item.name}`)}`;
export const indexableProducts = catalogItems;

export function localizeDocumentHtml(route, html) {
  const locale = route === "/ar" || route.startsWith("/ar/") ? "ar"
    : route === "/tr" || route.startsWith("/tr/") ? "tr"
      : "en";
  const attributes = locale === "ar" ? 'lang="ar" dir="rtl"' : `lang="${locale}"`;
  return html.replace(/<html\b[^>]*>/i, `<html ${attributes}>`);
}

const localePrefixes = ["", "/tr", "/ar"];
const basePaths = ["", "/catalog", "/verified-manufacturers", "/contact", "/iraq/dental-supplies", "/privacy", "/terms", "/procurement-guide"];
const categoryPaths = categories.map(([, slug]) => `/catalog/category/${slug}`);
const productPaths = indexableProducts.map(item => `/catalog/product/${productSlug(item)}`);

/** Standalone tool pages, one route per locale. */
const toolPaths = ["/tools", "/tools/forceps-selector", "/tools/tooth-numbering", "/tools/gracey-selector"];
export const toolRoutes = localePrefixes.flatMap(prefix => toolPaths.map(path => `${prefix}${path}`));

export const cleanRoutes = [
  ...localePrefixes.flatMap(prefix =>
    [...basePaths, ...categoryPaths, ...productPaths].map(path => `${prefix}${path}` || "/"),
  ),
  ...toolRoutes,
];

export const legacyRoutes = ["/index.html", "/catalog.html", "/verified-manufacturers.html", "/contact.html", "/404.html"];
