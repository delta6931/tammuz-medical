import type { Metadata } from "next";
import { Iso6360Decoder } from "../../_components/Iso6360Decoder";
import { ToolShell } from "../../_components/ToolShell";
import { localizedPath, type SiteLocale } from "../../_lib/catalog";
import { iso6360Strings } from "../_strings/iso-6360";
import "./decoder.css";

const TOOL_PATH = "/tools/iso-6360";
const LANGUAGES = { en: localizedPath(TOOL_PATH, "EN"), tr: localizedPath(TOOL_PATH, "TR"), ar: localizedPath(TOOL_PATH, "AR"), "x-default": localizedPath(TOOL_PATH, "EN") };
const OG_LOCALE: Record<SiteLocale, string> = { EN: "en_US", TR: "tr_TR", AR: "ar_IQ" };

export function buildMetadata(locale: SiteLocale): Metadata {
  const { title, description } = iso6360Strings[locale].meta; const canonical = localizedPath(TOOL_PATH, locale);
  return { title, description, alternates: { canonical, languages: LANGUAGES }, openGraph: { title, description, url: canonical, siteName: "Tammuz Medical", locale: OG_LOCALE[locale], type: "website", images: [{ url: "/assets/social/tammuz-medical-og.webp", width: 1200, height: 630, alt: title }] }, twitter: { card: "summary_large_image", title, description, images: ["/assets/social/tammuz-medical-og.webp"] } };
}

export function Iso6360Page({ locale }: { locale: SiteLocale }) {
  const s = iso6360Strings[locale];
  return <ToolShell locale={locale} labels={s.shell}>
    <section className="section"><Iso6360Decoder locale={locale} /></section>
    <section className="section faq-section"><p className="eyebrow"><span />{s.faqEyebrow}</p><h2>{s.faqHeading}</h2><div>{s.faq.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>
    <section className="section note"><p>{s.cta.question}</p><a className="button primary" href={localizedPath("/contact", locale)}>{s.cta.button}</a></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }).replace(/</g, "\\u003c") }} />
  </ToolShell>;
}
