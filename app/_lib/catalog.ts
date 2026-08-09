import catalogItemsJson from "../_data/asaCatalog.json";
import productImagesJson from "../_data/productImages.json";

export type CatalogItem = {
  code: string;
  name: string;
  category: string;
};

export type SiteLocale = "EN" | "TR" | "AR";

export const catalogItems = catalogItemsJson as CatalogItem[];
export const productImages = productImagesJson as Record<string, string>;

/**
 * Category configuration is kept in one module so the catalog UI, localized
 * landing pages, static export and sitemap all agree on URLs and imagery.
 */
export const catalogCategories = [
  { name: "AsaOne disposables", slug: "asaone-disposables", labelKey: "cat.asaone", image: "/assets/categories/asaone.webp" },
  { name: "Diagnostic", slug: "diagnostic", labelKey: "cat.diagnostic", image: "/assets/categories/diagnostic.webp" },
  { name: "Oral Surgery", slug: "oral-surgery", labelKey: "cat.oral_surgery", image: "/assets/categories/oral-surgery.webp" },
  { name: "Extractive Surgery", slug: "extractive-surgery", labelKey: "cat.extractive_surgery", image: "/assets/categories/extractive-surgery.webp" },
  { name: "Implant Surgery", slug: "implant-surgery", labelKey: "cat.implant_surgery", image: "/assets/categories/implant-surgery.webp" },
  { name: "Restorative", slug: "restorative", labelKey: "cat.restorative", image: "/assets/categories/restorative.webp" },
  { name: "Periodontal", slug: "periodontal", labelKey: "cat.periodontal", image: "/assets/categories/periodontal.webp" },
  { name: "Orthodontic", slug: "orthodontic", labelKey: "cat.orthodontic", image: "/assets/categories/orthodontic.webp" },
  { name: "Instrument cassettes and trays", slug: "instrument-cassettes-trays", labelKey: "cat.cassettes", image: "/assets/categories/cassettes.webp" },
  { name: "Ideal Periotomi", slug: "ideal-periotomi", labelKey: "cat.periotomi", image: "/assets/categories/periotomi.webp" },
  { name: "Impression Trays", slug: "impression-trays", labelKey: "cat.impression", image: "/assets/categories/impression-trays.webp" },
  { name: "Laboratory instruments", slug: "laboratory-instruments", labelKey: "cat.laboratory", image: "/assets/categories/laboratory.webp" },
  { name: "Other ASA Dental instruments", slug: "other-asadental-instruments", labelKey: "cat.other", image: "/assets/product-thumbs/0100-151-1-2-1985931611.webp" },
] as const;

export function normalizeCategory(category: string) {
  return category.toLowerCase().replace(/asa dental/g, "asadental");
}

export function categoryForName(name: string) {
  const normalized = normalizeCategory(name);
  return catalogCategories.find(category => normalizeCategory(category.name) === normalized);
}

export function categoryForSlug(slug: string) {
  return catalogCategories.find(category => category.slug === slug);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A small deterministic suffix prevents duplicate product-code slugs. */
function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).slice(0, 5);
}

export function productSlug(item: CatalogItem) {
  return `${slugify(item.code)}-${stableHash(`${item.code}|${item.name}`)}`;
}

export function productForSlug(slug: string) {
  return indexableProducts.find(item => productSlug(item) === slug);
}

/**
 * Every manufacturer reference receives a crawlable product page. Product
 * codes are unique in the supplied catalog, so this list is also the canonical
 * source for detail routes, sitemap entries and internal product links.
 */
export const indexableProducts = catalogItems;

export function localePrefix(locale: SiteLocale) {
  return locale === "EN" ? "" : `/${locale.toLowerCase()}`;
}

export function localizedPath(path: string, locale: SiteLocale) {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${localePrefix(locale)}${normalized}` || "/";
}

export function categoryPath(slug: string, locale: SiteLocale) {
  return localizedPath(`/catalog/category/${slug}`, locale);
}

export function productPath(item: CatalogItem, locale: SiteLocale) {
  return localizedPath(`/catalog/product/${productSlug(item)}`, locale);
}
