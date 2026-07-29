"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import catalogItems from "../_data/asaCatalog.json";

const WHATSAPP_URL = "https://wa.me/905338877740";
const QUOTE_EMAIL = "info@tammuzmedical.com";

type PageKind = "home" | "catalog" | "manufacturers" | "contact";

const navigation = [
  ["Home", "/index.html", "home"],
  ["Catalog", "/catalog.html", "catalog"],
  ["Manufacturers", "/verified-manufacturers.html", "manufacturers"],
  ["Contact", "/contact.html", "contact"],
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
  ["AsaOne disposables", "AsaOne", "/assets/categories/asaone.jpeg"],
  ["Diagnostic", "Diagnostic", "/assets/categories/diagnostic.jpeg"],
  ["Oral Surgery", "Oral surgery", "/assets/categories/oral-surgery.jpeg"],
  ["Extractive Surgery", "Extractive surgery", "/assets/categories/extractive-surgery.jpeg"],
  ["Implant Surgery", "Implant surgery", "/assets/categories/implant-surgery.jpeg"],
  ["Restorative", "Restorative", "/assets/categories/restorative.jpeg"],
  ["Periodontal", "Periodontal", "/assets/categories/periodontal.jpeg"],
  ["Orthodontic", "Orthodontic", "/assets/categories/orthodontic.jpeg"],
  ["Instrument cassettes and trays", "Cassettes & trays", "/assets/categories/cassettes.jpeg"],
  ["Ideal Periotomi", "Ideal Periotomi", "/assets/categories/periotomi.jpeg"],
  ["Impression Trays", "Impression trays", "/assets/categories/impression-trays.jpeg"],
  ["Laboratory instruments", "Laboratory", "/assets/categories/laboratory.jpeg"],
] as const;

const productThumbnails: Record<string, string> = Object.fromEntries(products.map(product => [product.code, product.image]));

/** Shared site shell with all live contact, navigation, and language controls. */
export function SitePage({ page = "home" }: { page?: PageKind }) {
  const [language, setLanguage] = useState("EN");
  const [country, setCountry] = useState("Turkey");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language === "TR" ? "tr" : language === "AR" ? "ar" : "en";
    document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
  }, [language]);

  return <>
    <div className="announcement">Official AsaDental supply partner for Turkey &amp; Iraq</div>
    <header className="site-header">
      <a className="brand brand-logo" href="/index.html" aria-label="Tammuz Global Medical home"><img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical logo" /></a>
      <button className="menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
      <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
        {navigation.map(([label, href, key]) => <a key={href} className={key === page ? "active" : ""} href={href}>{label}</a>)}
      </nav>
      <div className="tools">
        <select value={country} aria-label="Country" onChange={event => setCountry(event.target.value)}><option>Turkey</option><option>Iraq</option><option>Other</option></select>
        <span>{["EN", "TR", "AR"].map(item => <button className={item === language ? "selected" : ""} onClick={() => setLanguage(item)} key={item}>{item}</button>)}</span>
      </div>
    </header>
    <main>{page === "home" ? <Home country={country} /> : page === "catalog" ? <Catalog /> : page === "manufacturers" ? <Manufacturers /> : <Contact />}</main>
    <Footer />
    <a className="wa" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Chat with Tammuz Global Medical on WhatsApp"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt=""/> <span>WhatsApp</span></a>
  </>;
}

function Home({ country }: { country: string }) {
  return <>
    <section className="hero"><div className="hero-copy"><Eyebrow>Italian dental expertise, locally supplied</Eyebrow><h1>Premium Dental Supplies for Turkish Clinics &amp; Distributors</h1><p className="lede">Tammuz Global Medical is a trusted B2B partner for clinics, distributors and procurement teams across {country}. Source quality-led AsaDental products with a clear, responsive supply process.</p><div className="buttons"><a className="button primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a><a className="button" href="/catalog.html">View Full Catalog ↓</a></div><div className="stats"><b>2,959<small>AsaDental references available</small></b><b>2<small>Regional operating markets</small></b><b>1:1<small>Dedicated account support</small></b></div></div><div className="hero-art best-seller"><div className="best-seller-label">MOST REQUESTED INSTRUMENT</div><img src="/assets/products/0100-1.jpeg" alt="AsaDental extracting forcep with non slip jaws, item 0100-1"/><div className="best-seller-copy"><span>AsaDental · 0100-1</span><b>Extracting forcep with non slip jaws #1</b><a href="/catalog.html">Explore catalog →</a></div></div></section>
    <Trust />
    <section className="section"><Heading eyebrow="Selected from the AsaDental portfolio" title="Featured dental instruments" link="Explore full catalog"/><Products limit={3} /></section>
    <section className="story"><div className="italy italy-photo"><img src="/assets/brand/asa-factory.png" alt="AsaDental manufacturing facility in Italy" /></div><div className="story-copy"><img className="asa-story-logo" src="/assets/brand/asa-dental.png" alt="AsaDental logo" /><Eyebrow>Our manufacturing partner</Eyebrow><h2>Italian craft, built for everyday clinical precision.</h2><p>AsaDental combines technical expertise and Italian manufacturing tradition to create instruments that feel balanced in the hand and perform reliably in practice.</p><p>We bring its professional portfolio closer to buyers in Turkey and Iraq—with product guidance that makes confident selection straightforward.</p><a className="text-link" href="/verified-manufacturers.html">Meet AsaDental →</a></div></section>
    <section className="section sourcing"><div><Eyebrow>The Tammuz approach</Eyebrow><h2>Supply should be the easy part of your day.</h2><p>From first product list to final inspection, we make a detailed sourcing process clear, considered and accountable.</p></div><div className="processes">{[["01", "Specify", "Tell us what your practice, distributor network or tender requires."], ["02", "Source", "We match verified products, quantities and documentation."], ["03", "Inspect", "Every order is checked before dispatch."], ["04", "Deliver", "Regional logistics and responsive support keep supply moving."]].map(item => <article key={item[0]}><small>{item[0]}</small><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div></section>
    <Quote />
  </>;
}

function Trust() { return <section className="trust"><h3>Built on verifiable standards</h3><div><p><b>ISO</b>ISO 13485<br/>Certified</p><p><b>CE</b>CE Mark<br/>Compliant</p><p className="trust-partner"><img src="/assets/brand/asa-dental.png" alt="AsaDental logo"/><span>AsaDental<br/>Partner</span></p><p><b>✓</b>Pre-Shipment<br/>Inspection</p></div></section>; }

function Products({ limit }: { limit?: number }) { const selection = limit ? products.slice(0, limit) : products; return <div className="products">{selection.map(product => <article key={product.code}><img src={product.image} alt={product.alt}/><div><small>{product.category} · {product.code}</small><h3>{product.title}</h3><p>AsaDental item {product.code}</p><a href="#quote">Request a quote →</a></div></article>)}</div>; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="eyebrow"><span/> {children}</p>; }
function Heading({ eyebrow, title, link }: { eyebrow: string; title: string; link: string }) { return <div className="heading"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></div><a className="text-link" href="/catalog.html">{link} →</a></div>; }

/** Quote handling opens a pre-addressed email without exposing a third-party form provider. */
function Quote() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const subject = `Quote request — ${values.get("company") || values.get("name")}`;
    const body = ["New quote request from tammuzmedical.com", "", `Name: ${values.get("name")}`, `Company / clinic: ${values.get("company")}`, `Email: ${values.get("email")}`, `Country: ${values.get("country")}`, "", "Requirement:", String(values.get("requirement"))].join("\n");
    window.location.href = `mailto:${QUOTE_EMAIL}?${new URLSearchParams({ subject, body }).toString()}`;
    setSent(true);
  }
  return <section id="quote" className="quote"><div><Eyebrow>Start a conversation</Eyebrow><h2>Let&apos;s build your next supply order.</h2><p>Send a brief or product list and our team will respond with availability, documentation and next steps.</p><a href="tel:+905338877740">+90 533 887 77 40</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp quick-chat ↗</a></div><form onSubmit={submit}><div className="form-row"><label>Full name<input required name="name" placeholder="Your name"/></label><label>Company<input required name="company" placeholder="Company / clinic"/></label></div><div className="form-row"><label>Email<input required name="email" type="email" placeholder="you@company.com"/></label><label>Country<select name="country"><option>Turkey</option><option>Iraq</option><option>Other</option></select></label></div><label>What are you looking for?<textarea required name="requirement" rows={4} placeholder="Products, quantities, or an outline of your requirement"/></label><button className="button primary">Request a quote →</button>{sent && <p className="success">Your email app should now be open with your request addressed to our team. You can also contact us on WhatsApp.</p>}</form></section>;
}

function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <section className="page-hero"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{text}</p></section>; }
function Catalog() { return <><PageHero eyebrow="Browse the AsaDental portfolio" title="Find the right instrument, faster." text="Search the complete AsaDental product list by item code or product name, or start with a clinical category."/><CatalogBrowser /><Quote/></>; }

/** Full product-browser interface. Pricing remains deliberately excluded from the public catalog. */
function CatalogBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All AsaDental products");
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogItems.filter(item => (category === "All AsaDental products" || item.category === category) && (!needle || item.code.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle)));
  }, [category, query]);
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  function selectCategory(nextCategory: string) { setCategory(nextCategory); setPage(1); }
  function updateSearch(value: string) { setQuery(value); setPage(1); }
  return <section className="catalog-browser section">
    <div className="catalog-search"><label htmlFor="product-search">Search AsaDental catalog</label><input id="product-search" value={query} onChange={event => updateSearch(event.target.value)} placeholder="Search by item code or product name"/><span>{catalogItems.length.toLocaleString()} product references</span></div>
    <div className="category-grid" aria-label="AsaDental product categories">{categoryTiles.map(([key, label, image]) => <button key={key} className={category === key ? "category-card selected" : "category-card"} onClick={() => selectCategory(key)}><img src={image} alt={`${label} AsaDental product category`}/><b>{label}</b></button>)}</div>
    <div className="catalog-results-head"><div><p className="eyebrow"><span/> Catalog results</p><h2>{category === "All AsaDental products" ? "All AsaDental products" : category.replace("ASA Dental", "AsaDental")}</h2></div><button className="catalog-reset" onClick={() => { setQuery(""); selectCategory("All AsaDental products"); }}>Reset filters</button></div>
    <p className="catalog-count">Showing {visible.length} of {filtered.length.toLocaleString()} matching references. Prices are available on request.</p>
    <div className="catalog-results">{visible.map(item => <article className="catalog-item" key={`${item.code}-${item.name}`}><div className="catalog-item-image">{productThumbnails[item.code] ? <img src={productThumbnails[item.code]} alt={`AsaDental ${item.name}, item ${item.code}`}/> : <img className="catalog-logo" src="/assets/brand/asa-dental.png" alt="AsaDental"/>}</div><div><small>{item.category.replace("ASA Dental", "AsaDental")}</small><b>{item.code}</b><h3>{item.name}</h3><a href="#quote">Request a quote →</a></div></article>)}</div>
    <div className="catalog-pagination"><button disabled={page === 1} onClick={() => setPage(current => current - 1)}>← Previous</button><span>Page {page} of {maxPage}</span><button disabled={page === maxPage} onClick={() => setPage(current => current + 1)}>Next →</button></div>
  </section>;
}
function Manufacturers() { return <><PageHero eyebrow="Verified manufacturing" title="Manufacturing partnerships you can stand behind." text="We select suppliers with the technical discipline, quality systems and service orientation our market expects."/><section className="section manufacturer"><div className="asa manufacturer-asset"><img src="/assets/brand/asa-dental.png" alt="AsaDental Make People Smile logo"/></div><div><Eyebrow>Featured partner</Eyebrow><h2>AsaDental</h2><p className="large">Italian manufacturer of professional dental instruments and solutions, established on a tradition of precision and practical innovation.</p><div className="details"><p><b>Origin</b>Italy</p><p><b>Focus</b>Dental instruments &amp; equipment</p><p><b>Assurance</b>ISO 13485 / CE compliance</p></div></div></section><section className="section values"><div><Eyebrow>Our sourcing promise</Eyebrow><h2>Every partnership is checked against the same standard.</h2></div><div><p><b>01</b>Product quality that holds up in daily clinical use.</p><p><b>02</b>Clear technical information and supporting documentation.</p><p><b>03</b>Reliable supply relationships—not transactional listings.</p></div></section><Quote/></>; }
function Contact() { return <><PageHero eyebrow="Contact Tammuz Global Medical" title="A direct route to the right supply solution." text="Whether you need product guidance, distributor pricing or a formal quote, our team is ready to help."/><section className="contact"><div><Eyebrow>Get in touch</Eyebrow><h2>Talk to our sourcing team.</h2><a href="tel:+905338877740">+90 533 887 77 40</a><a href={`mailto:${QUOTE_EMAIL}`}>{QUOTE_EMAIL}</a><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp quick-chat ↗</a><p>Serving clinics, distributors and procurement teams in Turkey and Iraq.</p><div className="coverage"><b>Turkey</b><b>Iraq</b><small>Regional supply coverage</small></div></div><Quote/></section></>; }

function Footer() { return <footer><div className="footer-top"><div><a className="brand brand-logo footer-logo" href="/index.html"><img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical logo"/></a><p>Premium dental and medical supply solutions for Turkey and Iraq.</p></div><div className="footer-nav"><div><b>Explore</b>{navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div><div><b>Contact</b><a href="tel:+905338877740">+90 533 887 77 40</a><a href={`mailto:${QUOTE_EMAIL}`}>{QUOTE_EMAIL}</a><a href={WHATSAPP_URL}>WhatsApp</a><a href="https://www.instagram.com/tammuzmedical" target="_blank" rel="noreferrer">Instagram @tammuzmedical</a><a href="https://www.facebook.com/share/1EwfKRBYuT/?mibextid=wwXIfr" target="_blank" rel="noreferrer">Facebook</a></div></div></div><div className="legal"><p>© {new Date().getFullYear()} Tammuz Global Medical. All rights reserved.</p><p>Demozi Kozmetik ve Makina Dış Ticaret Ltd. Şti. (Turkey)<br/>Mega Standard General Trading LLC (Iraq)</p></div></footer>; }
