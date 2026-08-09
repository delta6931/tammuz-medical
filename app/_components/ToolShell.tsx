import type { ReactNode } from "react";
import { localizedPath, type SiteLocale } from "../_lib/catalog";

/**
 * Minimal page chrome shared by every /tools/* page.
 *
 * Tool pages deliberately do not render through `SitePage`, which is a single
 * client component switching on page kind and owned by the catalog work. This
 * keeps tools additive: a new tool cannot break catalog or product rendering.
 * It reuses the design-system classes from globals.css so the chrome matches.
 *
 * Labels are passed in rather than read from a shared dictionary so each tool
 * owns its own copy and can be translated independently.
 */
export type ToolShellLabels = {
  eyebrow: string; title: string; lede: string;
  home: string; tools: string; catalog: string; contact: string; manufacturers: string;
  navLabel: string; footerBlurb: string;
  footerCatalogHead: string; footerAllReferences: string; footerExtractive: string;
  footerCompanyHead: string; legalLine: string; legalPrices: string;
};

export function ToolShell({
  locale = "EN",
  labels,
  children,
}: {
  locale?: SiteLocale;
  labels: ToolShellLabels;
  children: ReactNode;
}) {
  const home = localizedPath("/", locale);
  const catalog = localizedPath("/catalog", locale);
  const contact = localizedPath("/contact", locale);

  return (
    <>
      <header className="site-header">
        {/* Static export to Cloudflare Pages has no image optimizer, so plain <img> is intentional. */}
        <a className="brand brand-logo" href={home} aria-label="Tammuz Global Medical">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical" width={220} height={50} />
        </a>
        <nav className="nav" aria-label={labels.navLabel}>
          <a href={catalog}>{labels.catalog}</a>
          <a href={contact}>{labels.contact}</a>
        </nav>
      </header>

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href={home}>{labels.home}</a>
        <span>/</span>
        <span>{labels.tools}</span>
      </nav>

      <section className="page-hero">
        <p className="eyebrow"><span />{labels.eyebrow}</p>
        <h1>{labels.title}</h1>
        <p>{labels.lede}</p>
      </section>

      <main>{children}</main>

      <footer>
        <div className="footer-top">
          <div>
            <a className="brand-logo footer-logo" href={home} aria-label="Tammuz Global Medical">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical" width={245} height={56} />
            </a>
            <p>{labels.footerBlurb}</p>
          </div>
          <div className="footer-nav">
            <div>
              <b>{labels.footerCatalogHead}</b>
              <a href={catalog}>{labels.footerAllReferences}</a>
              <a href={localizedPath("/catalog/category/extractive-surgery", locale)}>{labels.footerExtractive}</a>
            </div>
            <div>
              <b>{labels.footerCompanyHead}</b>
              <a href={localizedPath("/verified-manufacturers", locale)}>{labels.manufacturers}</a>
              <a href={contact}>{labels.contact}</a>
            </div>
          </div>
        </div>
        <div className="legal">
          <p>{labels.legalLine}</p>
          <p>{labels.legalPrices}</p>
        </div>
      </footer>
    </>
  );
}
