import { categoryForSlug, productForSlug, SiteLocale } from "./catalog";

export type SitePageKind =
  | "home"
  | "catalog"
  | "manufacturers"
  | "contact"
  | "iraq"
  | "category"
  | "product"
  | "privacy"
  | "terms"
  | "guide"
  | "not-found";

export type ParsedSiteRoute = {
  locale: SiteLocale;
  page: SitePageKind;
  canonicalPath: string;
  categorySlug?: string;
  productSlug?: string;
};

export function parseSiteRoute(inputSegments: string[]): ParsedSiteRoute {
  const segments = [...inputSegments];
  let locale: SiteLocale = "EN";
  if (segments[0] === "tr" || segments[0] === "ar") {
    locale = segments.shift()!.toUpperCase() as SiteLocale;
  }

  const path = `/${segments.join("/")}`.replace(/\/$/, "") || "/";
  const prefix = locale === "EN" ? "" : `/${locale.toLowerCase()}`;
  const canonicalPath = `${prefix}${path === "/" ? "" : path}` || "/";

  if (path === "/") return { locale, page: "home", canonicalPath };
  if (path === "/catalog") return { locale, page: "catalog", canonicalPath };
  if (path === "/verified-manufacturers") return { locale, page: "manufacturers", canonicalPath };
  if (path === "/contact") return { locale, page: "contact", canonicalPath };
  if (path === "/iraq/dental-supplies") return { locale, page: "iraq", canonicalPath };
  if (path === "/privacy") return { locale, page: "privacy", canonicalPath };
  if (path === "/terms") return { locale, page: "terms", canonicalPath };
  if (path === "/procurement-guide") return { locale, page: "guide", canonicalPath };

  if (segments[0] === "catalog" && segments[1] === "category" && categoryForSlug(segments[2])) {
    return { locale, page: "category", canonicalPath, categorySlug: segments[2] };
  }
  if (segments[0] === "catalog" && segments[1] === "product" && productForSlug(segments[2])) {
    return { locale, page: "product", canonicalPath, productSlug: segments[2] };
  }

  return { locale, page: "not-found", canonicalPath };
}
