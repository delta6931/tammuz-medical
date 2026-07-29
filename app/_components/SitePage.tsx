"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import catalogItems from "../_data/asaCatalog.json";
import { Locale, LOCALES, translations } from "../_data/translations";

const WHATSAPP_URL = "https://wa.me/905338877740";
const QUOTE_EMAIL = "info@tammuzmedical.com";

type PageKind = "home" | "catalog" | "manufacturers" | "contact";

const navigation = [
  ["nav.home", "/index.html", "home"],
  ["nav.catalog", "/catalog.html", "catalog"],
  ["nav.manufacturers", "/verified-manufacturers.html", "manufacturers"],
  ["nav.contact", "/contact.html", "contact"],
] as const;

// Featured catalog products are matched to ASA item codes and supplied product images.
const products = [
  { category: "Extractive surgery", code: "0100-1", title: "Extracting forcep with non slip jaws #1", image: "/assets/products/0100-1.jpeg", alt: "AsaDental extracting forcep with non slip jaws, item 0100-1" },
  { category: "Diagnostic", code: "0102-1", title: "Root splinter forcep Stieglitz", image: "/assets/products/0102-1.jpeg", alt: "AsaDental Root splinter forcep Stieglitz, item 0102-1" },
  { category: "Oral surgery", code: "0300-1", title: "Gum scissors, 12 cm, straight", image: "/assets/products/0300-1.jpeg", alt: "AsaDental straight gum scissors, item 0300-1" },
  { category: "Implant surgery", code: "0103-10", title: "Bone rongeur Luer", image: "/assets/products/0103-10.jpeg", alt: "AsaDental Luer bone rongeur, item 0103-10" },
  { category: "Periodontal", code: "0103-25", title: "Bone rongeur Mini-Friedman", image: "/assets/products/0103-25.jpeg", alt: "AsaDental Mini-Friedman bone rongeur, item 0103-25" },
  { category: "Orthodontic", code: "0507-1", title: "Elastic forcep, 12 cm, straight", image: "/assets/products/0507-1.jpeg", alt: "AsaDental straight elastic forcep, item 0507-1" },
  { category: "Sterilisation", code: "0565-1", title: "Sterilizing forcep, 20 cm", image: "/assets/products/0565-1.jpeg", alt: "AsaDental sterilizing forcep, item 0565-1" },
  { category: "Ideal Periotomi", code: "0280-2R", title: "Root elevator #2 straight", image: "/assets/products/0280-2R.jpeg", alt: "AsaDental straight root elevator, item 0280-2R" },
  { category: "Impression trays", code: "2800-L4", title: "Full arch lower impression tray #4, M", image: "/assets/products/2800-L4.jpeg", alt: "AsaDental lower full arch impression tray, item 2800-L4" },
] as const;

const categoryTiles = [
  ["AsaOne disposables", "cat.asaone", "/assets/categories/asaone.jpeg"],
  ["Diagnostic", "cat.diagnostic", "/assets/categories/diagnostic.jpeg"],
  ["Oral Surgery", "cat.oral_surgery", "/assets/categories/oral-surgery.jpeg"],
  ["Extractive Surgery", "cat.extractive_surgery", "/assets/categories/extractive-surgery.jpeg"],
  ["Implant Surgery", "cat.implant_surgery", "/assets/categories/implant-surgery.jpeg"],
  ["Restorative", "cat.restorative", "/assets/categories/restorative.jpeg"],
  ["Periodontal", "cat.periodontal", "/assets/categories/periodontal.jpeg"],
  ["Orthodontic", "cat.orthodontic", "/assets/categories/orthodontic.jpeg"],
  ["Instrument cassettes and trays", "cat.cassettes", "/assets/categories/cassettes.jpeg"],
  ["Ideal Periotomi", "cat.periotomi", "/assets/categories/periotomi.jpeg"],
  ["Impression Trays", "cat.impression", "/assets/categories/impression-trays.jpeg"],
  ["Laboratory instruments", "cat.laboratory", "/assets/categories/laboratory.jpeg"],
] as const;

const productThumbnails: Record<string, string> = Object.fromEntries(products.map(product => [product.code, product.image]));

/**
 * Main SitePage Shell with complete React i18n integration.
 * - Language state supports EN, TR, AR (and KU structurally).
 * - Automatic country-language suggestion with manual override persistence in localStorage.
 * - Dynamic `lang` and `dir="rtl"` updating on <html>.
 */
export function SitePage({ page = "home" }: { page?: PageKind }) {
  const [language, setLanguageState] = useState<Locale>("EN");
  const [country, setCountryState] = useState<string>("Turkey");
  const [userHasSelectedLang, setUserHasSelectedLang] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Initialize language and country preferences from localStorage or defaults
  useEffect(() => {
    const savedLang = localStorage.getItem("tmz_lang") as Locale | null;
    const savedCountry = localStorage.getItem("tmz_country");

    if (savedCountry) {
      setCountryState(savedCountry);
    }

    if (savedLang && (savedLang === "EN" || savedLang === "TR" || savedLang === "AR")) {
      setLanguageState(savedLang);
      setUserHasSelectedLang(true);
    } else if (savedCountry) {
      if (savedCountry === "Turkey") setLanguageState("TR");
      else if (savedCountry === "Iraq") setLanguageState("AR");
      else setLanguageState("EN");
    } else {
      // Turkey is the default market, so a new visitor receives the matching language suggestion.
      setLanguageState("TR");
    }
  }, []);

  // Sync HTML lang and dir attributes dynamically whenever active language changes
  useEffect(() => {
    const langCode = LOCALES[language]?.code.toLowerCase() || "en";
    const dir = LOCALES[language]?.dir || "ltr";
    document.documentElement.lang = langCode;
    document.documentElement.dir = dir;
  }, [language]);

  // Handle Country selection with automatic language suggestion (unless manually overridden)
  function handleCountryChange(newCountry: string) {
    setCountryState(newCountry);
    localStorage.setItem("tmz_country", newCountry);

    if (!userHasSelectedLang) {
      let suggestedLang: Locale = "EN";
      if (newCountry === "Turkey") suggestedLang = "TR";
      else if (newCountry === "Iraq") suggestedLang = "AR";
      setLanguageState(suggestedLang);
    }
  }

  // Handle manual Language selection (persists user choice and overrides automatic country choice)
  function handleLanguageChange(newLang: Locale) {
    setLanguageState(newLang);
    setUserHasSelectedLang(true);
    localStorage.setItem("tmz_lang", newLang);
  }

  /** Strongly typed translation lookup helper */
  function t(key: string, params?: Record<string, string | number>): string {
    let text = translations[language]?.[key] || translations["EN"]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return text;
  }

  // Filter locales to display only enabled ones in selector (EN, TR, AR)
  const activeSelectorLocales = (Object.keys(LOCALES) as Locale[]).filter(
    code => LOCALES[code].enabledInSelector
  );

  return <>
    <header className="site-header">
      <a className="brand brand-logo" href="/index.html" aria-label={t("a11y.home")}>
        <img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical logo" />
      </a>
      <button type="button" className="menu" aria-label={t("a11y.toggle_nav")} onClick={() => setMenuOpen(!menuOpen)}>{t("nav.menu")}</button>
      <nav className={menuOpen ? "nav open" : "nav"} aria-label={t("a11y.main_nav")}>
        {navigation.map(([navKey, href, key]) => (
          <a key={href} className={key === page ? "active" : ""} href={href}>
            {t(navKey)}
          </a>
        ))}
      </nav>
      <div className="tools">
        <select
          value={country}
          aria-label={t("quote.label_country")}
          onChange={event => handleCountryChange(event.target.value)}
        >
          <option value="Turkey">{t("country.turkey")}</option>
          <option value="Iraq">{t("country.iraq")}</option>
          <option value="Other">{t("country.other")}</option>
        </select>
        <span>
          {activeSelectorLocales.map(item => (
            <button
              type="button"
              className={item === language ? "selected" : ""}
              onClick={() => handleLanguageChange(item)}
              key={item}
              aria-label={t("a11y.switch_language", { language: LOCALES[item].nativeName })}
              aria-pressed={item === language}
            >
              {item}
            </button>
          ))}
        </span>
      </div>
    </header>
    <main>
      {page === "home" ? (
        <Home country={country} t={t} />
      ) : page === "catalog" ? (
        <Catalog t={t} />
      ) : page === "manufacturers" ? (
        <Manufacturers t={t} />
      ) : (
        <Contact t={t} />
      )}
    </main>
    <Footer t={t} />
    <a
      className="wa"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={t("a11y.whatsapp")}
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="" />
      <span>{t("wa.label")}</span>
    </a>
  </>;
}

interface ComponentWithT {
  t: (key: string, params?: Record<string, string | number>) => string;
}

function translatedCategory(category: string, t: ComponentWithT["t"]) {
  const tile = categoryTiles.find(([key]) => key.toLowerCase() === category.toLowerCase());
  if (tile) return t(tile[1]);
  if (category === "Other ASA Dental instruments") return t("cat.other");
  if (category.toLowerCase() === "sterilisation") return t("cat.sterilisation");
  return category.replace("ASA Dental", "AsaDental");
}

function Home({ country, t }: { country: string; t: ComponentWithT["t"] }) {
  const localizedCountry = country === "Turkey" ? t("country.turkey") : country === "Iraq" ? t("country.iraq") : t("country.other");

  return <>
    <section className="hero">
      <div className="hero-copy">
        <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
        {/* Requirement 11: English H1 preserved exactly as "Premium Dental Supplies for Turkish Clinics & Distributors" */}
        <h1>{t("hero.h1")}</h1>
        <p className="lede">
          {t("hero.lede", { country: localizedCountry })}
        </p>
        <div className="buttons">
          <a className="button primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            {t("hero.chat_wa")}
          </a>
          <a className="button" href="/catalog.html">
            {t("hero.view_catalog")}
          </a>
        </div>
        <div className="stats">
          <b>{t("hero.stat1_num")}<small>{t("hero.stat1_label")}</small></b>
          <b>{t("hero.stat2_num")}<small>{t("hero.stat2_label")}</small></b>
          <b>{t("hero.stat3_num")}<small>{t("hero.stat3_label")}</small></b>
        </div>
      </div>
      <div className="hero-art hero-showcase">
        <img className="hero-showcase-image" src="/assets/hero-instrument-collage.png" alt="European dental and surgical instrument collection supplied by Tammuz Global Medical" />
        <div className="hero-showcase-mark">
          <img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical logo" />
          <span>{t("hero.showcase_title")}<br />{t("hero.showcase_sub")}</span>
        </div>
      </div>
    </section>

    <Trust t={t} />
    <section className="section">
      <Heading eyebrow={t("featured.eyebrow")} title={t("featured.title")} link={t("featured.link")} />
      <Products limit={3} t={t} />
    </section>

    <section className="story">
      <div className="italy italy-photo">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/brand/asa-factory.png"
          aria-label={t("a11y.showcase_video")}
        >
          <source src="/assets/videos/asadental-showcase.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="story-copy">
        <img className="asa-story-logo" src="/assets/brand/asa-dental.png" alt="AsaDental logo" />
        <Eyebrow>{t("story.eyebrow")}</Eyebrow>
        <h2>{t("story.title")}</h2>
        <p>{t("story.p1")}</p>
        <p>{t("story.p2")}</p>
        <a className="text-link" href="/verified-manufacturers.html">{t("story.link")}</a>
      </div>
    </section>

    <section className="section sourcing">
      <div>
        <Eyebrow>{t("sourcing.eyebrow")}</Eyebrow>
        <h2>{t("sourcing.title")}</h2>
        <p>{t("sourcing.lede")}</p>
      </div>
      <div className="processes">
        {[
          [t("sourcing.step1_num"), t("sourcing.step1_title"), t("sourcing.step1_desc")],
          [t("sourcing.step2_num"), t("sourcing.step2_title"), t("sourcing.step2_desc")],
          [t("sourcing.step3_num"), t("sourcing.step3_title"), t("sourcing.step3_desc")],
          [t("sourcing.step4_num"), t("sourcing.step4_title"), t("sourcing.step4_desc")],
        ].map(item => (
          <article key={item[0]}>
            <small>{item[0]}</small>
            <h3>{item[1]}</h3>
            <p>{item[2]}</p>
          </article>
        ))}
      </div>
    </section>

    <Quote t={t} />
  </>;
}

function Trust({ t }: ComponentWithT) {
  return (
    <section className="trust">
      <h3>{t("trust.title")}</h3>
      <div>
        <p><b>ISO</b><span dangerouslySetInnerHTML={{ __html: t("trust.iso") }} /></p>
        <p><b>CE</b><span dangerouslySetInnerHTML={{ __html: t("trust.ce") }} /></p>
        <p className="trust-partner">
          <img src="/assets/brand/asa-dental.png" alt="AsaDental logo" />
          <span dangerouslySetInnerHTML={{ __html: t("trust.partner") }} />
        </p>
        <p><b>✓</b><span dangerouslySetInnerHTML={{ __html: t("trust.psi") }} /></p>
      </div>
    </section>
  );
}

function Products({ limit, t }: { limit?: number; t: ComponentWithT["t"] }) {
  const selection = limit ? products.slice(0, limit) : products;
  return (
    <div className="products">
      {selection.map(product => (
        <article key={product.code}>
          <img src={product.image} alt={product.alt} />
          <div>
            <small>{translatedCategory(product.category, t)} · {product.code}</small>
            <h3>{product.title}</h3>
            <p>AsaDental item {product.code}</p>
            <a href="#quote">{t("featured.quote_btn")}</a>
          </div>
        </article>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow"><span /> {children}</p>;
}

function Heading({ eyebrow, title, link }: { eyebrow: string; title: string; link: string }) {
  return (
    <div className="heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      <a className="text-link" href="/catalog.html">{link} →</a>
    </div>
  );
}

/** Quote handling opens a pre-addressed email without exposing a third-party form provider. */
function Quote({ t }: ComponentWithT) {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const subject = `Quote request — ${values.get("company") || values.get("name")}`;
    const body = [
      "New quote request from tammuzmedical.com",
      "",
      `Name: ${values.get("name")}`,
      `Company / clinic: ${values.get("company")}`,
      `Email: ${values.get("email")}`,
      `Country: ${values.get("country")}`,
      "",
      "Requirement:",
      String(values.get("requirement")),
    ].join("\n");
    window.location.href = `mailto:${QUOTE_EMAIL}?${new URLSearchParams({ subject, body }).toString()}`;
    setSent(true);
  }

  return (
    <section id="quote" className="quote">
      <div>
        <Eyebrow>{t("quote.eyebrow")}</Eyebrow>
        <h2>{t("quote.title")}</h2>
        <p>{t("quote.lede")}</p>
        <a href="tel:+905338877740">+90 533 887 77 40</a>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">{t("quote.wa_link")}</a>
      </div>
      <form onSubmit={submit}>
        <div className="form-row">
          <label>
            {t("quote.label_name")}
            <input required name="name" placeholder={t("quote.placeholder_name")} />
          </label>
          <label>
            {t("quote.label_company")}
            <input required name="company" placeholder={t("quote.placeholder_company")} />
          </label>
        </div>
        <div className="form-row">
          <label>
            {t("quote.label_email")}
            <input required name="email" type="email" placeholder={t("quote.placeholder_email")} />
          </label>
          <label>
            {t("quote.label_country")}
            <select name="country">
              <option value="Turkey">{t("country.turkey")}</option>
              <option value="Iraq">{t("country.iraq")}</option>
              <option value="Other">{t("country.other")}</option>
            </select>
          </label>
        </div>
        <label>
          {t("quote.label_requirement")}
          <textarea required name="requirement" rows={4} placeholder={t("quote.placeholder_requirement")} />
        </label>
        <button className="button primary">{t("quote.submit_btn")}</button>
        {sent && <p className="success">{t("quote.success")}</p>}
      </form>
    </section>
  );
}

function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="page-hero">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}

function Catalog({ t }: ComponentWithT) {
  return (
    <>
      <PageHero
        eyebrow={t("catalog.hero_eyebrow")}
        title={t("catalog.hero_title")}
        text={t("catalog.hero_text")}
      />
      <CatalogBrowser t={t} />
      <Quote t={t} />
    </>
  );
}

/** Full product-browser interface for all 2,959 catalog items. */
function CatalogBrowser({ t }: ComponentWithT) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All AsaDental products");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogItems.filter(
      item =>
        (category === "All AsaDental products" || item.category === category) &&
        (!needle || item.code.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle))
    );
  }, [category, query]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    setPage(1);
  }

  function updateSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <section className="catalog-browser section">
      <div className="catalog-search">
        <label htmlFor="product-search">{t("catalog.search_label")}</label>
        <input
          id="product-search"
          value={query}
          onChange={event => updateSearch(event.target.value)}
          placeholder={t("catalog.search_placeholder")}
        />
        <span>{t("catalog.search_count", { count: catalogItems.length.toLocaleString() })}</span>
      </div>
      <div className="category-grid" aria-label={t("catalog.category_aria")}>
        {categoryTiles.map(([key, labelKey, image]) => (
          <button
            type="button"
            key={key}
            className={category === key ? "category-card selected" : "category-card"}
            onClick={() => selectCategory(key)}
          >
            <img src={image} alt={t("a11y.category_image", { category: t(labelKey) })} />
            <b>{t(labelKey)}</b>
          </button>
        ))}
      </div>
      <div className="catalog-results-head">
        <div>
          <p className="eyebrow"><span /> {t("catalog.results_eyebrow")}</p>
          <h2>
            {category === "All AsaDental products"
              ? t("cat.all")
              : translatedCategory(category, t)}
          </h2>
        </div>
        <button className="catalog-reset" onClick={() => { setQuery(""); selectCategory("All AsaDental products"); }}>
          {t("catalog.reset_filters")}
        </button>
      </div>
      <p className="catalog-count">
        {t("catalog.count_text", {
          visible: visible.length,
          total: filtered.length.toLocaleString(),
        })}
      </p>
      <div className="catalog-results">
        {visible.map(item => (
          <article className="catalog-item" key={`${item.code}-${item.name}`}>
            <div className="catalog-item-image">
              {productThumbnails[item.code] ? (
                <img src={productThumbnails[item.code]} alt={`AsaDental ${item.name}, item ${item.code}`} />
              ) : (
                <img className="catalog-logo" src="/assets/brand/asa-dental.png" alt="AsaDental" />
              )}
            </div>
            <div>
              <small>{translatedCategory(item.category, t)}</small>
              <b>{item.code}</b>
              <h3>{item.name}</h3>
              <a href="#quote">{t("catalog.item_quote")}</a>
            </div>
          </article>
        ))}
      </div>
      <div className="catalog-pagination">
        <button disabled={page === 1} onClick={() => setPage(current => current - 1)}>
          {t("catalog.prev")}
        </button>
        <span>{t("catalog.pagination", { page, maxPage })}</span>
        <button disabled={page === maxPage} onClick={() => setPage(current => current + 1)}>
          {t("catalog.next")}
        </button>
      </div>
    </section>
  );
}

function Manufacturers({ t }: ComponentWithT) {
  return (
    <>
      <PageHero
        eyebrow={t("mfr.hero_eyebrow")}
        title={t("mfr.hero_title")}
        text={t("mfr.hero_text")}
      />
      <section className="section manufacturer">
        <div className="asa manufacturer-asset">
          <img src="/assets/brand/asa-dental.png" alt="AsaDental Make People Smile logo" />
        </div>
        <div>
          <Eyebrow>{t("mfr.partner_eyebrow")}</Eyebrow>
          <h2>{t("mfr.partner_title")}</h2>
          <p className="large">{t("mfr.partner_desc")}</p>
          <div className="details">
            <p><b>{t("mfr.origin_label")}</b>{t("mfr.origin_val")}</p>
            <p><b>{t("mfr.focus_label")}</b>{t("mfr.focus_val")}</p>
            <p><b>{t("mfr.assurance_label")}</b>{t("mfr.assurance_val")}</p>
          </div>
        </div>
      </section>
      <section className="section values">
        <div>
          <Eyebrow>{t("mfr.promise_eyebrow")}</Eyebrow>
          <h2>{t("mfr.promise_title")}</h2>
        </div>
        <div>
          <p><b>{t("mfr.val1_num")}</b>{t("mfr.val1_text")}</p>
          <p><b>{t("mfr.val2_num")}</b>{t("mfr.val2_text")}</p>
          <p><b>{t("mfr.val3_num")}</b>{t("mfr.val3_text")}</p>
        </div>
      </section>
      <Quote t={t} />
    </>
  );
}

function Contact({ t }: ComponentWithT) {
  return (
    <>
      <PageHero
        eyebrow={t("contact.hero_eyebrow")}
        title={t("contact.hero_title")}
        text={t("contact.hero_text")}
      />
      <section className="contact">
        <div>
          <Eyebrow>{t("contact.eyebrow")}</Eyebrow>
          <h2>{t("contact.title")}</h2>
          <a href="tel:+905338877740">+90 533 887 77 40</a>
          <a href={`mailto:${QUOTE_EMAIL}`}>{QUOTE_EMAIL}</a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">{t("contact.wa_link")}</a>
          <p>{t("contact.serving")}</p>
          <div className="coverage">
            <b>{t("contact.coverage_tr")}</b>
            <b>{t("contact.coverage_iq")}</b>
            <small>{t("contact.coverage_label")}</small>
          </div>
        </div>
        <Quote t={t} />
      </section>
    </>
  );
}

function Footer({ t }: ComponentWithT) {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a className="brand brand-logo footer-logo" href="/index.html">
            <img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical logo" />
          </a>
          <p>{t("footer.tagline")}</p>
        </div>
        <div className="footer-nav">
          <div>
            <b>{t("footer.explore")}</b>
            {navigation.map(([navKey, href]) => (
              <a key={href} href={href}>{t(navKey)}</a>
            ))}
          </div>
          <div>
            <b>{t("footer.contact")}</b>
            <a href="tel:+905338877740">+90 533 887 77 40</a>
            <a href={`mailto:${QUOTE_EMAIL}`}>{QUOTE_EMAIL}</a>
            <a href={WHATSAPP_URL}>WhatsApp</a>
            <a href="https://www.instagram.com/tammuzmedical" target="_blank" rel="noreferrer">Instagram @tammuzmedical</a>
            <a href="https://www.facebook.com/share/1EwfKRBYuT/?mibextid=wwXIfr" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </div>
      </div>
      <div className="legal">
        <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        <p dangerouslySetInnerHTML={{ __html: t("footer.entities") }} />
      </div>
    </footer>
  );
}
