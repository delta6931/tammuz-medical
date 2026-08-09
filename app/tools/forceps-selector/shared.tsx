import type { Metadata } from "next";
import { ForcepsSelector } from "../../_components/ForcepsSelector";
import { ToolShell } from "../../_components/ToolShell";
import { localizedPath, type SiteLocale } from "../../_lib/catalog";
import { forcepsStrings } from "../_strings/forceps-selector";
import "./selector.css";

const TOOL_PATH = "/tools/forceps-selector";

/** Every locale of this tool shares one canonical set, so hreflang stays symmetric. */
const LANGUAGES = {
  en: localizedPath(TOOL_PATH, "EN"),
  tr: localizedPath(TOOL_PATH, "TR"),
  ar: localizedPath(TOOL_PATH, "AR"),
  "x-default": localizedPath(TOOL_PATH, "EN"),
};

const OG_LOCALE: Record<SiteLocale, string> = { EN: "en_US", TR: "tr_TR", AR: "ar_IQ" };

export function buildMetadata(locale: SiteLocale): Metadata {
  const { title, description } = forcepsStrings[locale].meta;
  const canonical = localizedPath(TOOL_PATH, locale);

  return {
    title,
    description,
    alternates: { canonical, languages: LANGUAGES },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Tammuz Medical",
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: "/assets/social/tammuz-medical-og.webp", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/assets/social/tammuz-medical-og.webp"] },
  };
}

export function ForcepsSelectorPage({ locale }: { locale: SiteLocale }) {
  const s = forcepsStrings[locale];

  return (
    <ToolShell locale={locale} labels={s.shell}>
      <section className="section">
        <ForcepsSelector locale={locale} />
      </section>

      <section className="section faq-section">
        <p className="eyebrow"><span />{s.faqEyebrow}</p>
        <h2>{s.faqHeading}</h2>
        <div>
          {s.faq.map(entry => (
            <details key={entry.q}>
              <summary>{entry.q}</summary>
              <p>{entry.a}</p>
            </details>
          ))}
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
            "@type": "FAQPage",
            mainEntity: s.faq.map(entry => ({
              "@type": "Question",
              name: entry.q,
              acceptedAnswer: { "@type": "Answer", text: entry.a },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </ToolShell>
  );
}
