import type { Metadata } from "next";
import { ToolShell } from "../_components/ToolShell";
import { localizedPath, type SiteLocale } from "../_lib/catalog";
import { toolsIndexStrings } from "./_strings/tools-index";
import "./index.css";

const TOOL_PATH = "/tools";

const LANGUAGES = {
  en: localizedPath(TOOL_PATH, "EN"),
  tr: localizedPath(TOOL_PATH, "TR"),
  ar: localizedPath(TOOL_PATH, "AR"),
  "x-default": localizedPath(TOOL_PATH, "EN"),
};

const OG_LOCALE: Record<SiteLocale, string> = { EN: "en_US", TR: "tr_TR", AR: "ar_IQ" };

export function buildMetadata(locale: SiteLocale): Metadata {
  const { title, description } = toolsIndexStrings[locale].meta;
  const canonical = localizedPath(TOOL_PATH, locale);

  return {
    title,
    description,
    alternates: { canonical, languages: LANGUAGES },
    openGraph: {
      title, description, url: canonical, siteName: "Tammuz Medical",
      locale: OG_LOCALE[locale], type: "website",
      images: [{ url: "/assets/social/tammuz-medical-og.webp", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/assets/social/tammuz-medical-og.webp"] },
  };
}

export function ToolsIndexPage({ locale }: { locale: SiteLocale }) {
  const s = toolsIndexStrings[locale];

  return (
    <ToolShell locale={locale} labels={s.shell}>
      <section className="section">
        <div className="ti">
          <ul className="ti-grid">
            {s.cards.map(card => {
              const href = localizedPath(card.path, locale);
              return (
                <li key={card.path} className="ti-card">
                  <span className="ti-tag">{card.tag}</span>
                  <h2>{card.name}</h2>
                  <p>{card.blurb}</p>
                  <a href={href}>{card.name} &rarr;</a>
                </li>
              );
            })}
          </ul>
          <p className="ti-note">{s.note}</p>
        </div>
      </section>

      <section className="section note">
        <p>{s.cta.question}</p>
        <a className="button primary" href={localizedPath("/contact", locale)}>{s.cta.button}</a>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: s.shell.title,
            itemListElement: s.cards.map((card, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: card.name,
              url: `https://tammuzmedical.com${localizedPath(card.path, locale)}`,
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </ToolShell>
  );
}
