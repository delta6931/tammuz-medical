import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cleanRoutes } from "./site-routes.mjs";

const projectRoot = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1)));
const origin = "https://tammuzmedical.com";
const lastmod = new Date().toISOString().slice(0, 10);
const escapeXml = value => value.replace(/[<>&'\"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]);
const neutralRoute = route => route.replace(/^\/(tr|ar)(?=\/|$)/, "") || "/";
const localizedRoute = (route, locale) => {
  const neutral = neutralRoute(route);
  if (locale === "en") return neutral;
  return `/${locale}${neutral === "/" ? "" : neutral}`;
};
const absoluteUrl = route => `${origin}${route === "/" ? "" : route}`;

function sitemapEntry(route) {
  const alternates = [
    ["en", localizedRoute(route, "en")],
    ["tr", localizedRoute(route, "tr")],
    ["ar", localizedRoute(route, "ar")],
    ["x-default", localizedRoute(route, "en")],
  ].map(([language, path]) => `<xhtml:link rel="alternate" hreflang="${language}" href="${escapeXml(absoluteUrl(path))}"/>`).join("");
  return `  <url><loc>${escapeXml(absoluteUrl(route))}</loc><lastmod>${lastmod}</lastmod>${alternates}</url>`;
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...cleanRoutes.map(sitemapEntry),
  "</urlset>",
  "",
].join("\n");

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /api/",
  "",
  `Sitemap: ${origin}/sitemap.xml`,
  "",
].join("\n");

await writeFile(resolve(projectRoot, "public/sitemap.xml"), sitemap, "utf8");
await writeFile(resolve(projectRoot, "public/robots.txt"), robots, "utf8");
console.log(`Generated sitemap with ${cleanRoutes.length} canonical URLs.`);
