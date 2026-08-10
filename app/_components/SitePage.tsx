"use client";

/* Exact .html routes and transparent catalog assets are intentional requirements. */
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element, react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { catalogProductForSku } from "../_data/catalogProductEnrichment";
import { forcepsProductForSku, localizedOverallLength } from "../_data/forcepsProductEnrichment";
import { Locale, LOCALES, translations } from "../_data/translations";
import { trackEvent } from "./Analytics";
import {
  CatalogItem,
  catalogCategories,
  catalogItems,
  categoryForName,
  categoryForSlug,
  categoryPath,
  indexableProducts,
  localizedPath,
  productForSlug,
  productImages,
  productPath,
  SiteLocale,
} from "../_lib/catalog";
import type { SitePageKind } from "../_lib/site-route";

const WHATSAPP_URL = "https://wa.me/905338877740";
const QUOTE_EMAIL = "info@tammuzmedical.com";

type QuoteLine = Pick<CatalogItem, "code" | "name"> & { quantity: number };

// Featured catalog products are matched to ASA item codes and supplied product images.
const products = [
  { category: "Extractive surgery", code: "0100-1", title: "Extracting forcep with non slip jaws #1", image: productImages["0100-1"], alt: "AsaDental extracting forcep with non slip jaws, item 0100-1" },
  { category: "Diagnostic", code: "0102-1", title: "Root splinter forcep Stieglitz", image: productImages["0102-1"], alt: "AsaDental root splinter forcep Stieglitz, item 0102-1" },
  { category: "Oral surgery", code: "0300-1", title: "Gum scissors, 12 cm, straight", image: productImages["0300-1"], alt: "AsaDental straight gum scissors, item 0300-1" },
  { category: "Extractive Surgery", code: "0103-10", title: "Bone rongeur Luer", image: productImages["0103-10"], alt: "AsaDental Luer bone rongeur, item 0103-10" },
  { category: "Extractive Surgery", code: "0103-25", title: "Bone rongeur Mini-Friedman", image: productImages["0103-25"], alt: "AsaDental Mini-Friedman bone rongeur, item 0103-25" },
  { category: "Orthodontic", code: "0507-1", title: "Elastic forcep, 12 cm, straight", image: productImages["0507-1"], alt: "AsaDental straight elastic forcep, item 0507-1" },
  { category: "Sterilisation", code: "0565-1", title: "Sterilizing forcep, 20 cm", image: productImages["0565-1"], alt: "AsaDental sterilizing forcep, item 0565-1" },
  { category: "Ideal Periotomi", code: "0280-2R", title: "Root elevator #2 straight", image: productImages["0280-2R"], alt: "AsaDental straight root elevator, item 0280-2R" },
  { category: "Impression trays", code: "2800-L4", title: "Full arch lower impression tray #4, M", image: productImages["2800-L4"], alt: "AsaDental lower full arch impression tray, item 2800-L4" },
] as const;

// Generated from the manufacturer-supplied catalog media by product code.
const productThumbnails: Record<string, string> = productImages;
const categoryThumbnails: Record<string, string> = {};
for (const item of catalogItems) {
  if (!categoryThumbnails[item.category] && productThumbnails[item.code]) {
    categoryThumbnails[item.category] = productThumbnails[item.code];
  }
}

/**
 * Main SitePage Shell with complete React i18n integration.
 * - Language state supports EN, TR, AR (and KU structurally).
 * - Automatic country-language suggestion with manual override persistence in localStorage.
 * - Dynamic `lang` and `dir="rtl"` updating on <html>.
 */
export function SitePage({
  page = "home",
  initialLocale = "EN",
  canonicalPath = "/",
  categorySlug,
  productSlug,
}: {
  page?: SitePageKind;
  initialLocale?: SiteLocale;
  canonicalPath?: string;
  categorySlug?: string;
  productSlug?: string;
}) {
  const [language, setLanguageState] = useState<Locale>(initialLocale);
  const [country, setCountryState] = useState<string>(page === "iraq" ? "Iraq" : "Turkey");
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([]);

  // Initialize language and country preferences from localStorage or defaults
  useEffect(() => {
    const savedCountry = localStorage.getItem("tmz_country");
    if (savedCountry) setCountryState(savedCountry);
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
    const suggestedLang: SiteLocale = newCountry === "Turkey" ? "TR" : newCountry === "Iraq" ? "AR" : "EN";
    handleLanguageChange(suggestedLang);
  }

  // Handle manual Language selection (persists user choice and overrides automatic country choice)
  function handleLanguageChange(newLang: Locale) {
    setLanguageState(newLang);
    localStorage.setItem("tmz_lang", newLang);
    trackEvent("language_switch", { language: newLang });
    const neutralPath = canonicalPath.replace(/^\/(tr|ar)(?=\/|$)/, "") || "/";
    window.location.assign(localizedPath(neutralPath, newLang as SiteLocale));
  }

  function addQuoteLine(item: Pick<CatalogItem, "code" | "name">) {
    setQuoteLines(current => {
      const existing = current.find(line => line.code === item.code && line.name === item.name);
      if (existing) return current.map(line => line === existing ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...item, quantity: 1 }];
    });
    trackEvent("product_add_to_quote", { item_code: item.code, item_name: item.name });
    window.setTimeout(() => document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const navigation = [
    ["nav.home", localizedPath("/", language as SiteLocale), "home"],
    ["nav.catalog", localizedPath("/catalog", language as SiteLocale), "catalog"],
    ["nav.manufacturers", localizedPath("/verified-manufacturers", language as SiteLocale), "manufacturers"],
    ["nav.contact", localizedPath("/contact", language as SiteLocale), "contact"],
  ] as const;

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
      <a className="brand brand-logo" href={localizedPath("/", language as SiteLocale)} aria-label={t("a11y.home")}>
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
        <Home country={country} locale={language as SiteLocale} t={t} addQuoteLine={addQuoteLine} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      ) : page === "catalog" ? (
        <Catalog locale={language as SiteLocale} t={t} addQuoteLine={addQuoteLine} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      ) : page === "category" ? (
        <CategoryPage locale={language as SiteLocale} categorySlug={categorySlug!} t={t} addQuoteLine={addQuoteLine} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      ) : page === "product" ? (
        <ProductPage locale={language as SiteLocale} productSlug={productSlug!} t={t} addQuoteLine={addQuoteLine} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      ) : page === "iraq" ? (
        <IraqLanding locale={language as SiteLocale} t={t} addQuoteLine={addQuoteLine} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      ) : page === "privacy" || page === "terms" || page === "guide" ? (
        <InformationPage page={page} locale={language as SiteLocale} t={t} />
      ) : page === "manufacturers" ? (
        <Manufacturers locale={language as SiteLocale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      ) : page === "not-found" ? (
        <NotFound t={t} />
      ) : (
        <Contact locale={language as SiteLocale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      )}
    </main>
    <Footer locale={language as SiteLocale} t={t} />
    <a
      className="wa"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={t("a11y.whatsapp")}
      onClick={() => trackEvent("whatsapp_click", { placement: "floating", page })}
    >
      <img src="/assets/brand/whatsapp.png" alt="" />
      <span>{t("wa.label")}</span>
    </a>
  </>;
}

interface ComponentWithT {
  t: (key: string, params?: Record<string, string | number>) => string;
}

type QuoteStateProps = {
  quoteLines: QuoteLine[];
  setQuoteLines: React.Dispatch<React.SetStateAction<QuoteLine[]>>;
};

const growthCopy = {
  EN: {
    addQuote: "Add to quote",
    added: "Selected products",
    details: "View details",
    phone: "Phone / WhatsApp",
    preferred: "Preferred contact",
    email: "Email",
    whatsapp: "WhatsApp",
    privacy: "I agree that Tammuz Medical may use these details to respond to my quote request.",
    privacyLink: "Privacy notice",
    remove: "Remove",
    quantity: "Quantity",
  },
  TR: {
    addQuote: "Teklife ekle",
    added: "Seçilen ürünler",
    details: "Ürün detayı",
    phone: "Telefon / WhatsApp",
    preferred: "Tercih edilen iletişim",
    email: "E-posta",
    whatsapp: "WhatsApp",
    privacy: "Tammuz Medical'ın teklif talebime yanıt vermek için bu bilgileri kullanmasını kabul ediyorum.",
    privacyLink: "Gizlilik bildirimi",
    remove: "Kaldır",
    quantity: "Miktar",
  },
  AR: {
    addQuote: "أضف إلى طلب السعر",
    added: "المنتجات المختارة",
    details: "تفاصيل المنتج",
    phone: "الهاتف / واتساب",
    preferred: "وسيلة التواصل المفضلة",
    email: "البريد الإلكتروني",
    whatsapp: "واتساب",
    privacy: "أوافق على استخدام Tammuz Medical لهذه البيانات للرد على طلب عرض السعر.",
    privacyLink: "إشعار الخصوصية",
    remove: "إزالة",
    quantity: "الكمية",
  },
} as const;

const pageCopy = {
  EN: {
    categoryEyebrow: "Clinical catalog",
    categoryTitle: (name: string) => `${name} dental instruments`,
    categoryText: (count: number) => `Compare ${count.toLocaleString()} AsaDental references in this category. Search by item code, build a product list and request availability and documentation from our team.`,
    productEyebrow: "AsaDental product reference",
    manufacturer: "Manufacturer",
    category: "Clinical category",
    productIntro: (code: string, name: string, category: string) => `AsaDental reference ${code}, ${name}, is listed in the ${category} range. Use the exact item code when requesting availability, documentation and a commercial quotation.`,
    relatedTitle: "Related references in this category",
    allReferences: (count: number) => `Browse all ${count.toLocaleString()} references in this category`,
    catalogBreadcrumb: "Catalog",
    quoteTitle: "Add this reference to your quote list",
    quoteText: "Pricing, availability, minimum order requirements and delivery timing are confirmed against the requested quantity and destination.",
    iraqEyebrow: "Dental supply for Iraq",
    iraqTitle: "European dental instruments, matched to your requirement in Iraq.",
    iraqLede: "For clinics, distributors and procurement teams: send item codes or a product list, and receive a documented quotation with the next sourcing steps.",
    clinic: "For clinics",
    clinicText: "Identify instruments by procedure, reference or image and request the quantities you actually need.",
    distributor: "For distributors",
    distributorText: "Build mixed-category requirements and discuss documentation, order size and regional supply planning.",
    faqTitle: "Iraq buyer questions",
    faqs: [
      ["Are prices shown online?", "No. B2B pricing is quoted against the item codes, quantities and destination you provide."],
      ["Is there a fixed minimum order?", "Minimum order requirements vary by product and manufacturer and are confirmed in the quotation."],
      ["What documents are available?", "We confirm the documentation available for the selected products before order commitment."],
      ["When will an order arrive?", "Lead time is confirmed after the exact products, quantities, destination and shipping route are reviewed."],
    ],
  },
  TR: {
    categoryEyebrow: "Klinik katalog",
    categoryTitle: (name: string) => `${name} dental aletleri`,
    categoryText: (count: number) => `Bu kategorideki ${count.toLocaleString("tr-TR")} AsaDental referansını karşılaştırın. Ürün koduyla arayın, listenizi oluşturun ve stok ile belgeler için teklif isteyin.`,
    productEyebrow: "AsaDental ürün referansı",
    manufacturer: "Üretici",
    category: "Klinik kategori",
    productIntro: (code: string, name: string, category: string) => `AsaDental ${code} referansı, ${name}, ${category} grubunda yer alır. Stok, belge ve ticari teklif talep ederken tam ürün kodunu kullanın.`,
    relatedTitle: "Bu kategorideki ilgili referanslar",
    allReferences: (count: number) => `Bu kategorideki ${count.toLocaleString("tr-TR")} referansın tamamını görüntüleyin`,
    catalogBreadcrumb: "Katalog",
    quoteTitle: "Bu referansı teklif listenize ekleyin",
    quoteText: "Fiyat, stok, minimum sipariş ve teslim süresi talep edilen miktar ve hedef ülkeye göre teyit edilir.",
    iraqEyebrow: "Irak için dental tedarik",
    iraqTitle: "Irak'taki ihtiyacınıza uygun Avrupa dental aletleri.",
    iraqLede: "Klinikler, distribütörler ve satın alma ekipleri için: ürün kodlarını veya listenizi gönderin; belgeli teklif ve sonraki adımları alın.",
    clinic: "Klinikler için",
    clinicText: "Aletleri işlem, ürün kodu veya görsele göre belirleyin ve ihtiyacınız olan miktarı talep edin.",
    distributor: "Distribütörler için",
    distributorText: "Birden fazla kategoriden talep oluşturun; belge, sipariş hacmi ve bölgesel tedariki görüşün.",
    faqTitle: "Irak alıcılarının soruları",
    faqs: [
      ["Fiyatlar sitede gösteriliyor mu?", "Hayır. B2B fiyatlandırma, ilettiğiniz ürün kodu, miktar ve hedefe göre teklif edilir."],
      ["Sabit minimum sipariş var mı?", "Minimum sipariş şartları ürün ve üreticiye göre değişir ve teklifte teyit edilir."],
      ["Hangi belgeler sunulabilir?", "Seçilen ürünler için mevcut belgeler sipariş taahhüdünden önce teyit edilir."],
      ["Sipariş ne zaman ulaşır?", "Teslim süresi ürünler, miktarlar, hedef ve sevkiyat rotası incelendikten sonra teyit edilir."],
    ],
  },
  AR: {
    categoryEyebrow: "الكتالوج السريري",
    categoryTitle: (name: string) => `أدوات ${name} لطب الأسنان`,
    categoryText: (count: number) => `قارن بين ${count.toLocaleString("ar-IQ")} مرجعاً من AsaDental في هذه الفئة. ابحث برمز المنتج، وأنشئ قائمتك، واطلب التوفر والوثائق من فريقنا.`,
    productEyebrow: "مرجع منتج AsaDental",
    manufacturer: "المُصنّع",
    category: "الفئة السريرية",
    productIntro: (code: string, name: string, category: string) => `مرجع AsaDental رقم ${code}، ${name}، مدرج ضمن فئة ${category}. استخدم رمز المنتج الكامل عند طلب التوفر والوثائق وعرض السعر التجاري.`,
    relatedTitle: "مراجع مرتبطة ضمن هذه الفئة",
    allReferences: (count: number) => `تصفح جميع المراجع في هذه الفئة وعددها ${count.toLocaleString("ar-IQ")}`,
    catalogBreadcrumb: "الكتالوج",
    quoteTitle: "أضف هذا المرجع إلى قائمة طلب السعر",
    quoteText: "يتم تأكيد السعر والتوفر والحد الأدنى للطلب ومدة التجهيز وفق الكمية والوجهة المطلوبة.",
    iraqEyebrow: "توريد طب الأسنان للعراق",
    iraqTitle: "أدوات أسنان أوروبية مطابقة لاحتياجك في العراق.",
    iraqLede: "للعيادات والموزعين وفرق المشتريات: أرسل رموز المنتجات أو قائمتك لتحصل على عرض موثق وخطوات التوريد التالية.",
    clinic: "للعيادات",
    clinicText: "حدّد الأدوات حسب الإجراء أو الرمز أو الصورة واطلب الكميات التي تحتاجها فعلياً.",
    distributor: "للموزعين",
    distributorText: "أنشئ طلباً من فئات متعددة وناقش الوثائق وحجم الطلب وخطة التوريد الإقليمية.",
    faqTitle: "أسئلة المشترين في العراق",
    faqs: [
      ["هل الأسعار معروضة على الموقع؟", "لا. يتم إعداد سعر B2B وفق رموز المنتجات والكميات والوجهة التي ترسلها."],
      ["هل يوجد حد أدنى ثابت للطلب؟", "يختلف الحد الأدنى حسب المنتج والمُصنّع ويتم تأكيده في عرض السعر."],
      ["ما الوثائق المتاحة؟", "نؤكد الوثائق المتاحة للمنتجات المختارة قبل الالتزام بالطلب."],
      ["متى يصل الطلب؟", "يتم تأكيد المدة بعد مراجعة المنتجات والكميات والوجهة ومسار الشحن."],
    ],
  },
} as const;

type InformationSection = { title: string; paragraphs: string[] };
type InformationEntry = { eyebrow: string; title: string; updated: string; sections: InformationSection[] };

const informationCopy: Record<SiteLocale, Record<"privacy" | "terms" | "guide", InformationEntry>> = {
  EN: {
    privacy: {
      eyebrow: "Your information",
      title: "Privacy policy",
      updated: "Last updated: 6 August 2026",
      sections: [
        { title: "Information we receive", paragraphs: ["When you request a quote, we receive the contact, company, country, product and requirement information you submit. We use it to answer your request, prepare sourcing information and maintain the related business correspondence."] },
        { title: "Email delivery", paragraphs: ["Quote requests are sent to info@tammuzmedical.com through our configured email-delivery provider. We do not sell your submitted contact information."] },
        { title: "Optional analytics", paragraphs: ["If analytics identifiers are configured, analytics and advertising measurement scripts load only after you accept the website consent notice. You can decline and continue using the site."] },
        { title: "Contact and retention", paragraphs: ["Business correspondence is retained only as reasonably needed for quotations, customer service, compliance and legitimate business records. Contact info@tammuzmedical.com to ask about your submitted information."] },
      ],
    },
    terms: {
      eyebrow: "Website use",
      title: "Website terms",
      updated: "Last updated: 6 August 2026",
      sections: [
        { title: "B2B information", paragraphs: ["This website provides business-to-business product and sourcing information. It is not medical advice and does not replace product instructions, clinical judgment or applicable professional requirements."] },
        { title: "Quotations", paragraphs: ["Website content is not a binding offer. Prices, availability, minimum order requirements, documentation, delivery terms and lead times are confirmed in a formal quotation."] },
        { title: "Products and trademarks", paragraphs: ["Product names, codes, specifications and manufacturer marks remain the property of their respective owners. Product information may be updated by the manufacturer."] },
        { title: "Responsible use", paragraphs: ["Users are responsible for confirming that selected products and documentation are appropriate for their intended market and professional use before ordering."] },
      ],
    },
    guide: {
      eyebrow: "Buyer resource",
      title: "Dental supply procurement guide",
      updated: "A practical starting point for clinics, distributors and procurement teams.",
      sections: [
        { title: "1. Identify the requirement", paragraphs: ["Start with product codes where available. Otherwise send the product name, intended procedure, quantity and a reference image so the requirement can be matched accurately."] },
        { title: "2. Confirm the manufacturer and documents", paragraphs: ["Check the exact manufacturer reference and ask which technical or compliance documents are available for that product and destination."] },
        { title: "3. Compare the complete quotation", paragraphs: ["Review unit quantities, minimum order requirements, availability, payment terms, transport assumptions and estimated timing together—not only the headline price."] },
        { title: "4. Verify before shipment", paragraphs: ["Agree on the checks, packaging information and documentation that should be confirmed before goods are released for shipment."] },
      ],
    },
  },
  TR: {
    privacy: {
      eyebrow: "Bilgileriniz",
      title: "Gizlilik politikası",
      updated: "Son güncelleme: 6 Ağustos 2026",
      sections: [
        { title: "Aldığımız bilgiler", paragraphs: ["Teklif istediğinizde ilettiğiniz iletişim, şirket, ülke, ürün ve ihtiyaç bilgilerini alırız. Bu bilgiler talebinizi yanıtlamak ve ilgili iş yazışmalarını yürütmek için kullanılır."] },
        { title: "E-posta teslimi", paragraphs: ["Teklif talepleri yapılandırılmış e-posta hizmetimiz üzerinden info@tammuzmedical.com adresine iletilir. Gönderdiğiniz iletişim bilgilerini satmayız."] },
        { title: "İsteğe bağlı analiz", paragraphs: ["Analiz kimlikleri yapılandırılmışsa, analiz ve reklam ölçüm komutları yalnızca onayınızdan sonra yüklenir. Reddedip siteyi kullanmaya devam edebilirsiniz."] },
        { title: "İletişim ve saklama", paragraphs: ["İş yazışmaları teklif, müşteri hizmeti, uyum ve meşru kayıt gereksinimleri için makul süreyle saklanır. Bilgileriniz hakkında info@tammuzmedical.com ile iletişime geçebilirsiniz."] },
      ],
    },
    terms: {
      eyebrow: "Web sitesi kullanımı",
      title: "Web sitesi koşulları",
      updated: "Son güncelleme: 6 Ağustos 2026",
      sections: [
        { title: "B2B bilgileri", paragraphs: ["Bu site işletmeler arası ürün ve tedarik bilgisi sunar. Tıbbi tavsiye değildir; ürün talimatlarının, klinik değerlendirmenin veya mesleki şartların yerini almaz."] },
        { title: "Teklifler", paragraphs: ["Site içeriği bağlayıcı teklif değildir. Fiyat, stok, minimum sipariş, belge, teslim ve süre bilgileri resmi teklifte teyit edilir."] },
        { title: "Ürünler ve markalar", paragraphs: ["Ürün adları, kodları, özellikleri ve üretici markaları ilgili hak sahiplerine aittir. Bilgiler üretici tarafından güncellenebilir."] },
        { title: "Sorumlu kullanım", paragraphs: ["Kullanıcılar siparişten önce ürünlerin ve belgelerin hedef pazar ve mesleki kullanım için uygunluğunu teyit etmekten sorumludur."] },
      ],
    },
    guide: {
      eyebrow: "Alıcı kaynağı",
      title: "Dental tedarik satın alma rehberi",
      updated: "Klinikler, distribütörler ve satın alma ekipleri için pratik başlangıç.",
      sections: [
        { title: "1. İhtiyacı tanımlayın", paragraphs: ["Varsa ürün koduyla başlayın. Yoksa doğru eşleştirme için ürün adı, işlem, miktar ve referans görselini gönderin."] },
        { title: "2. Üretici ve belgeleri teyit edin", paragraphs: ["Tam üretici referansını ve ürün ile hedef ülke için hangi teknik veya uyum belgelerinin mevcut olduğunu kontrol edin."] },
        { title: "3. Teklifin tamamını karşılaştırın", paragraphs: ["Yalnızca fiyatı değil; miktar, minimum sipariş, stok, ödeme, taşıma varsayımları ve tahmini süreyi birlikte değerlendirin."] },
        { title: "4. Sevkiyat öncesi doğrulayın", paragraphs: ["Ürünler sevk edilmeden önce kontrol, ambalaj bilgisi ve belgelerin nasıl teyit edileceğini kararlaştırın."] },
      ],
    },
  },
  AR: {
    privacy: {
      eyebrow: "معلوماتك",
      title: "سياسة الخصوصية",
      updated: "آخر تحديث: 6 أغسطس 2026",
      sections: [
        { title: "المعلومات التي نستلمها", paragraphs: ["عند طلب عرض سعر نستلم بيانات التواصل والشركة والبلد والمنتجات والمتطلبات التي ترسلها. نستخدمها للرد وإعداد معلومات التوريد وحفظ المراسلات التجارية ذات الصلة."] },
        { title: "إرسال البريد", paragraphs: ["تُرسل طلبات الأسعار إلى info@tammuzmedical.com عبر مزود إرسال البريد المهيأ للموقع. لا نبيع بيانات التواصل التي ترسلها."] },
        { title: "التحليلات الاختيارية", paragraphs: ["إذا تم إعداد معرفات التحليل، فلن تعمل أدوات التحليل وقياس الإعلانات إلا بعد موافقتك. يمكنك الرفض والاستمرار في استخدام الموقع."] },
        { title: "التواصل والاحتفاظ", paragraphs: ["تُحتفظ المراسلات للمدة المعقولة اللازمة للعروض وخدمة العملاء والامتثال والسجلات التجارية. تواصل مع info@tammuzmedical.com للاستفسار عن بياناتك."] },
      ],
    },
    terms: {
      eyebrow: "استخدام الموقع",
      title: "شروط الموقع",
      updated: "آخر تحديث: 6 أغسطس 2026",
      sections: [
        { title: "معلومات بين الشركات", paragraphs: ["يقدم الموقع معلومات منتجات وتوريد بين الشركات. وهو ليس نصيحة طبية ولا بديلاً عن تعليمات المنتج أو الحكم السريري أو المتطلبات المهنية."] },
        { title: "عروض الأسعار", paragraphs: ["محتوى الموقع ليس عرضاً ملزماً. يتم تأكيد السعر والتوفر والحد الأدنى والوثائق وشروط التسليم والمدة في عرض رسمي."] },
        { title: "المنتجات والعلامات", paragraphs: ["تعود أسماء المنتجات ورموزها ومواصفاتها وعلامات المصنّعين إلى أصحابها. وقد يحدّث المصنّع معلومات المنتج."] },
        { title: "الاستخدام المسؤول", paragraphs: ["يتحمل المستخدم مسؤولية التأكد من ملاءمة المنتجات والوثائق للسوق والاستخدام المهني المقصود قبل الطلب."] },
      ],
    },
    guide: {
      eyebrow: "مرجع المشتري",
      title: "دليل شراء مستلزمات طب الأسنان",
      updated: "نقطة بداية عملية للعيادات والموزعين وفرق المشتريات.",
      sections: [
        { title: "1. حدّد المتطلب", paragraphs: ["ابدأ برمز المنتج إن توفر. وإلا أرسل الاسم والإجراء المقصود والكمية وصورة مرجعية للمطابقة الدقيقة."] },
        { title: "2. أكد المصنّع والوثائق", paragraphs: ["تحقق من مرجع المصنّع الدقيق واسأل عن الوثائق الفنية أو التنظيمية المتاحة للمنتج والوجهة."] },
        { title: "3. قارن العرض كاملاً", paragraphs: ["راجع الكميات والحد الأدنى والتوفر وشروط الدفع وافتراضات النقل والمدة المتوقعة معاً، وليس السعر فقط."] },
        { title: "4. تحقق قبل الشحن", paragraphs: ["اتفق على الفحوص ومعلومات التغليف والوثائق التي يجب تأكيدها قبل تسليم البضاعة للشحن."] },
      ],
    },
  },
};

function translatedCategory(category: string, t: ComponentWithT["t"]) {
  const tile = categoryForName(category);
  if (tile) return t(tile.labelKey);
  if (category === "Other ASA Dental instruments") return t("cat.other");
  if (category.toLowerCase() === "sterilisation") return t("cat.sterilisation");
  return category.replace("ASA Dental", "AsaDental");
}

function Home({ country, locale, t, addQuoteLine, quoteLines, setQuoteLines }: { country: string; locale: SiteLocale; t: ComponentWithT["t"]; addQuoteLine: (item: Pick<CatalogItem, "code" | "name">) => void } & QuoteStateProps) {
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
          <a className="button primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "hero" })}>
            {t("hero.chat_wa")}
          </a>
          <a className="button" href={localizedPath("/catalog", locale)}>
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
        <img className="hero-showcase-image" src="/assets/hero-instrument-collage.webp" alt="European dental and surgical instrument collection supplied by Tammuz Global Medical" fetchPriority="high" />
        <div className="hero-showcase-mark">
          <img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical logo" />
          <span>{t("hero.showcase_title")}<br />{t("hero.showcase_sub")}</span>
        </div>
      </div>
    </section>

    <Trust t={t} />
    <section className="section">
      <Heading eyebrow={t("featured.eyebrow")} title={t("featured.title")} link={t("featured.link")} locale={locale} />
      <Products limit={3} locale={locale} t={t} addQuoteLine={addQuoteLine} />
    </section>

    <section className="story">
      <div className="italy italy-photo">
        <video
          muted
          playsInline
          controls
          preload="none"
          poster="/assets/brand/asa-showcase-poster.webp"
          aria-label={t("a11y.showcase_video")}
        >
          <source src="/assets/videos/asadental-showcase-preview.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="story-copy">
        <img className="asa-story-logo" src="/assets/brand/asa-dental.png" alt="AsaDental logo" />
        <Eyebrow>{t("story.eyebrow")}</Eyebrow>
        <h2>{t("story.title")}</h2>
        <p>{t("story.p1")}</p>
        <p>{t("story.p2")}</p>
        <a className="text-link" href={localizedPath("/verified-manufacturers", locale)}>{t("story.link")}</a>
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

    <Quote t={t} locale={locale} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
  </>;
}

function Trust({ t }: ComponentWithT) {
  return (
    <section className="trust">
      <h3>{t("trust.title")}</h3>
      <div>
        <p><b>ISO</b><span dangerouslySetInnerHTML={{ __html: t("trust.iso") }} /></p>
        <p><b>CE</b><span dangerouslySetInnerHTML={{ __html: t("trust.ce") }} /></p>
        <p><b>✓</b><span dangerouslySetInnerHTML={{ __html: t("trust.psi") }} /></p>
      </div>
    </section>
  );
}

function Products({ limit, locale, t, addQuoteLine }: { limit?: number; locale: SiteLocale; t: ComponentWithT["t"]; addQuoteLine: (item: Pick<CatalogItem, "code" | "name">) => void }) {
  const selection = limit ? products.slice(0, limit) : products;
  return (
    <div className="products">
      {selection.map(product => {
        const catalogProduct = catalogItems.find(item => item.code === product.code) || { code: product.code, name: product.title, category: product.category };
        const hasDetailPage = indexableProducts.some(item => item.code === catalogProduct.code && item.name === catalogProduct.name);
        return <article key={product.code}>
          <img src={product.image} alt={product.alt} loading="lazy" decoding="async" />
          <div>
            <small>{translatedCategory(product.category, t)} · {product.code}</small>
            <h3>{product.title}</h3>
            <p>AsaDental item {product.code}</p>
            <div className="card-actions">
              <button type="button" className="text-link" onClick={() => addQuoteLine({ code: product.code, name: product.title })}>{growthCopy[locale].addQuote}</button>
              {hasDetailPage && <a href={productPath(catalogProduct, locale)}>{growthCopy[locale].details}</a>}
            </div>
          </div>
        </article>;
      })}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow"><span /> {children}</p>;
}

function Heading({ eyebrow, title, link, locale }: { eyebrow: string; title: string; link: string; locale: SiteLocale }) {
  return (
    <div className="heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      <a className="text-link" href={localizedPath("/catalog", locale)}>{link} →</a>
    </div>
  );
}

/** Quote requests post to the server and are delivered without leaving the page. */
function Quote({ t, locale, quoteLines, setQuoteLines }: ComponentWithT & QuoteStateProps & { locale: SiteLocale }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formStartedAt] = useState(() => Date.now());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setStatus("submitting");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          company: values.get("company"),
          email: values.get("email"),
          phone: values.get("phone"),
          country: values.get("country"),
          preferredContact: values.get("preferredContact"),
          requirement: values.get("requirement"),
          products: quoteLines,
          consent: values.get("consent") === "yes",
          website: values.get("website"),
          formStartedAt,
          requestId: crypto.randomUUID(),
        }),
      });

      if (!response.ok) throw new Error("Quote submission failed");
      form.reset();
      setQuoteLines([]);
      setStatus("success");
      trackEvent("quote_submit_success", { country: values.get("country"), product_count: quoteLines.length });
    } catch {
      setStatus("error");
      trackEvent("quote_submit_error");
    }
  }

  return (
    <section id="quote" className="quote">
      <div>
        <Eyebrow>{t("quote.eyebrow")}</Eyebrow>
        <h2>{t("quote.title")}</h2>
        <p>{t("quote.lede")}</p>
        <a href="tel:+905338877740">+90 533 887 77 40</a>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "quote" })}>{t("quote.wa_link")}</a>
      </div>
      <form onSubmit={submit}>
        {quoteLines.length > 0 && (
          <fieldset className="quote-list">
            <legend>{growthCopy[locale].added}</legend>
            {quoteLines.map(line => (
              <div className="quote-line" key={`${line.code}-${line.name}`}>
                <span><b>{line.code}</b>{line.name}</span>
                <label>
                  {growthCopy[locale].quantity}
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={line.quantity}
                    onChange={event => setQuoteLines(current => current.map(item => item.code === line.code && item.name === line.name ? { ...item, quantity: Math.max(1, Number(event.target.value) || 1) } : item))}
                  />
                </label>
                <button type="button" onClick={() => {
                  setQuoteLines(current => current.filter(item => item.code !== line.code || item.name !== line.name));
                  trackEvent("quote_item_remove", { item_code: line.code });
                }}>{growthCopy[locale].remove}</button>
              </div>
            ))}
          </fieldset>
        )}
        <label className="form-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
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
            {growthCopy[locale].phone}
            <input name="phone" type="tel" autoComplete="tel" placeholder="+964 / +90" />
          </label>
          <label>
            {growthCopy[locale].preferred}
            <select name="preferredContact">
              <option value="Email">{growthCopy[locale].email}</option>
              <option value="WhatsApp">{growthCopy[locale].whatsapp}</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            {t("quote.label_email")}
            <input required name="email" type="email" placeholder={t("quote.placeholder_email")} />
          </label>
          <label>
            {t("quote.label_country")}
            <select name="country" defaultValue={locale === "AR" ? "Iraq" : "Turkey"}>
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
        <label className="consent-check">
          <input required type="checkbox" name="consent" value="yes" />
          <span>{growthCopy[locale].privacy} <a href={localizedPath("/privacy", locale)}>{growthCopy[locale].privacyLink}</a></span>
        </label>
        <button className="button primary" disabled={status === "submitting"}>
          {status === "submitting" ? t("quote.sending") : t("quote.submit_btn")}
        </button>
        <div className="form-status" aria-live="polite">
          {status === "success" && <p className="success">{t("quote.delivered")}</p>}
          {status === "error" && <p className="form-error">{t("quote.error")}</p>}
        </div>
      </form>
    </section>
  );
}

function Catalog({ locale, t, addQuoteLine, quoteLines, setQuoteLines }: { locale: SiteLocale; addQuoteLine: (item: Pick<CatalogItem, "code" | "name">) => void } & ComponentWithT & QuoteStateProps) {
  return (
    <>
      <h1 className="sr-only">{t("catalog.hero_title")}</h1>
      <CatalogBrowser locale={locale} t={t} addQuoteLine={addQuoteLine} />
      <Quote locale={locale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
    </>
  );
}

/** Full product-browser interface for all 2,959 catalog items. */
function CatalogBrowser({ locale, t, addQuoteLine, initialCategory }: { locale: SiteLocale; initialCategory?: string; addQuoteLine: (item: Pick<CatalogItem, "code" | "name">) => void } & ComponentWithT) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory || "All AsaDental products");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalogItems.filter(
      item =>
        (category === "All AsaDental products" || categoryForName(item.category)?.name === category) &&
        (!needle || item.code.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle))
    );
  }, [category, query]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    setPage(1);
    trackEvent("category_select", { category: nextCategory });
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
          onBlur={() => query.trim() && trackEvent("catalog_search", { search_term: query.trim(), result_count: filtered.length })}
          placeholder={t("catalog.search_placeholder")}
        />
        <span>{t("catalog.search_count", { count: catalogItems.length.toLocaleString() })}</span>
      </div>
      <div className="category-grid" aria-label={t("catalog.category_aria")}>
        {catalogCategories.map(categoryTile => (
          <article key={categoryTile.name} className={category === categoryTile.name ? "category-card selected" : "category-card"}>
            <button type="button" onClick={() => selectCategory(categoryTile.name)}>
              <img src={categoryTile.image} alt={t("a11y.category_image", { category: t(categoryTile.labelKey) })} loading="lazy" decoding="async" />
              <b>{t(categoryTile.labelKey)}</b>
            </button>
            <a href={categoryPath(categoryTile.slug, locale)}>{growthCopy[locale].details}</a>
          </article>
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
        {visible.map(item => {
          const exactImage = productThumbnails[item.code];
          const displayImage = exactImage || categoryThumbnails[item.category];
          const hasDetailPage = indexableProducts.some(product => product.code === item.code && product.name === item.name);
          return (
            <article className="catalog-item" key={`${item.code}-${item.name}`}>
              <div className="catalog-item-image">
                <img
                  src={displayImage}
                  alt={exactImage
                    ? `AsaDental ${item.name}, item ${item.code}`
                    : `AsaDental ${translatedCategory(item.category, t)} product range`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <small>{translatedCategory(item.category, t)}</small>
                <b>{item.code}</b>
                <h3>{item.name}</h3>
                <div className="card-actions">
                  <button type="button" className="text-link" onClick={() => addQuoteLine(item)}>{growthCopy[locale].addQuote}</button>
                  {hasDetailPage && <a href={productPath(item, locale)}>{growthCopy[locale].details}</a>}
                </div>
              </div>
            </article>
          );
        })}
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

function CategoryPage({ locale, categorySlug, t, addQuoteLine, quoteLines, setQuoteLines }: { locale: SiteLocale; categorySlug: string; addQuoteLine: (item: Pick<CatalogItem, "code" | "name">) => void } & ComponentWithT & QuoteStateProps) {
  const category = categoryForSlug(categorySlug)!;
  const items = catalogItems.filter(item => categoryForName(item.category)?.slug === categorySlug);
  const title = pageCopy[locale].categoryTitle(translatedCategory(category.name, t));
  return <>
    <section className="content-hero category-hero">
      <div>
        <Eyebrow>{pageCopy[locale].categoryEyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{pageCopy[locale].categoryText(items.length)}</p>
      </div>
      <img src={category.image} alt={`AsaDental ${category.name.replace("ASA Dental", "AsaDental")} dental instruments`} />
    </section>
    <CatalogBrowser locale={locale} t={t} addQuoteLine={addQuoteLine} initialCategory={category.name} />
    <details className="category-index section">
      <summary>{pageCopy[locale].allReferences(items.length)}</summary>
      <div>
        {items.map(item => <a href={productPath(item, locale)} key={`${item.code}-${item.name}`}><b>{item.code}</b><span>{item.name}</span></a>)}
      </div>
    </details>
    <Quote locale={locale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
  </>;
}

function ProductPage({ locale, productSlug, t, addQuoteLine, quoteLines, setQuoteLines }: { locale: SiteLocale; productSlug: string; addQuoteLine: (item: Pick<CatalogItem, "code" | "name">) => void } & ComponentWithT & QuoteStateProps) {
  const product = productForSlug(productSlug)!;
  const category = categoryForName(product.category);
  const exactImage = productImages[product.code];
  const image = exactImage || category?.image || "/assets/hero-instrument-collage.webp";
  const categoryName = translatedCategory(product.category, t);
  const forcepsEnrichment = forcepsProductForSku(product.code);
  const catalogEnrichment = catalogProductForSku(product.code);
  const enrichment = forcepsEnrichment || catalogEnrichment;
  const enrichedCopy = enrichment?.copy[locale];
  const overallLengthMm = enrichment?.overallLengthMm;
  const enrichedSpecifications = enrichedCopy
    ? [
        ...enrichedCopy.specifications,
        ...(overallLengthMm ? [localizedOverallLength(locale, overallLengthMm)] : []),
      ]
    : [];
  // Forceps use only manufacturer-backed relationships. The broader catalogue
  // uses same-category references because the PDFs do not claim procedure-level
  // relationships for most product families.
  const related = forcepsEnrichment
    ? forcepsEnrichment.relationships
        .map(relationship => catalogItems.find(item => item.code === relationship.sku))
        .filter((item): item is CatalogItem => Boolean(item))
    : catalogItems
        .filter(item => item.code !== product.code && categoryForName(item.category)?.slug === category?.slug)
        .slice(0, 4);
  const whatsappText = encodeURIComponent(`Hello Tammuz Global Medical, I would like a quote for AsaDental item ${product.code}: ${product.name}.`);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://tammuzmedical.com${productPath(product, locale)}#product`,
    url: `https://tammuzmedical.com${productPath(product, locale)}`,
    name: enrichedCopy?.title || product.name,
    sku: product.code,
    mpn: product.code,
    ...(exactImage ? { image: `https://tammuzmedical.com${exactImage}` } : {}),
    description: enrichedCopy?.metaDescription || pageCopy[locale].productIntro(product.code, product.name, categoryName),
    category: product.category.replace("ASA Dental", "AsaDental"),
    inLanguage: locale.toLowerCase(),
    brand: { "@type": "Brand", name: "AsaDental" },
    manufacturer: { "@type": "Organization", name: "AsaDental" },
  };

  return <>
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <a href={localizedPath("/catalog", locale)}>{pageCopy[locale].catalogBreadcrumb}</a><span>/</span>
      <a href={category ? categoryPath(category.slug, locale) : localizedPath("/catalog", locale)}>{categoryName}</a><span>/</span>
      <b>{product.code}</b>
    </nav>
    <section className="product-detail">
      <div className="product-detail-image"><img src={image} alt={exactImage ? `AsaDental ${enrichedCopy?.title || product.name}, item ${product.code}` : `AsaDental ${categoryName} product range for item ${product.code}`} /></div>
      <div>
        <Eyebrow>{enrichedCopy?.eyebrow || pageCopy[locale].productEyebrow}</Eyebrow>
        <p className="product-code">{product.code}</p>
        <h1>{enrichedCopy?.title || product.name}</h1>
        <p className="product-intro">{enrichedCopy?.introduction || pageCopy[locale].productIntro(product.code, product.name, categoryName)}</p>
        {enrichedCopy && <p className="clinical-summary"><b>{enrichedCopy.clinicalHeading}</b>{enrichedCopy.clinicalSummary}</p>}
        <dl>
          <div><dt>{pageCopy[locale].manufacturer}</dt><dd>AsaDental</dd></div>
          <div><dt>{pageCopy[locale].category}</dt><dd><a href={category ? categoryPath(category.slug, locale) : localizedPath("/catalog", locale)}>{categoryName}</a></dd></div>
        </dl>
        <h2>{enrichedCopy?.quoteHeading || pageCopy[locale].quoteTitle}</h2>
        <p>{enrichedCopy?.quoteText || pageCopy[locale].quoteText}</p>
        <div className="buttons">
          <button type="button" className="button primary" onClick={() => addQuoteLine(product)}>{growthCopy[locale].addQuote}</button>
          <a className="button" href={`${WHATSAPP_URL}?text=${whatsappText}`} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "product", item_code: product.code })}>WhatsApp</a>
        </div>
      </div>
    </section>
    {enrichedCopy && <section className="section product-enrichment" aria-labelledby={`specification-${product.code}`}>
      <div className="product-specification">
        <Eyebrow>{enrichedCopy.clinicalHeading}</Eyebrow>
        <h2 id={`specification-${product.code}`}>{enrichedCopy.specificationHeading}</h2>
        <table>
          <tbody>
            {enrichedSpecifications.map(specification => <tr key={specification.label}>
              <th scope="row">{specification.label}</th>
              <td>{specification.value}</td>
            </tr>)}
          </tbody>
        </table>
        <p className="source-note">{enrichedCopy.sourceNote}</p>
      </div>
      {enrichment?.hasHandlingFacts && <aside className="product-handling">
        <h2>{enrichedCopy.handlingHeading}</h2>
        <p>{enrichedCopy.handlingText}</p>
      </aside>}
    </section>}
    <Trust t={t} />
    {related.length > 0 && <section className="section product-related">
      <h2>{enrichedCopy?.relatedHeading || pageCopy[locale].relatedTitle}</h2>
      {enrichedCopy && <p className="related-intro">{enrichedCopy.relatedIntro}</p>}
      <div>{related.map(item => {
        const relatedImage = productImages[item.code] || category?.image || "/assets/hero-instrument-collage.webp";
        return <a href={productPath(item, locale)} key={`${item.code}-${item.name}`}>
          <img src={relatedImage} alt={`AsaDental ${item.name}, item ${item.code}`} loading="lazy" decoding="async" />
          <span><b>{item.code}</b>{forcepsProductForSku(item.code)?.copy[locale].title || catalogProductForSku(item.code)?.copy[locale].title || item.name}</span>
        </a>;
      })}</div>
    </section>}
    <Quote locale={locale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
  </>;
}

function IraqLanding({ locale, t, addQuoteLine, quoteLines, setQuoteLines }: { locale: SiteLocale; addQuoteLine: (item: Pick<CatalogItem, "code" | "name">) => void } & ComponentWithT & QuoteStateProps) {
  const copy = pageCopy[locale];
  return <>
    <section className="iraq-hero">
      <div>
        <Eyebrow>{copy.iraqEyebrow}</Eyebrow>
        <h1>{copy.iraqTitle}</h1>
        <p>{copy.iraqLede}</p>
        <div className="buttons">
          <a className="button primary" href="#quote">{t("quote.submit_btn")}</a>
          <a className="button" href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello Tammuz Global Medical, I am requesting dental supplies for Iraq.")}`} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { placement: "iraq_hero" })}>WhatsApp</a>
        </div>
      </div>
      <img src="/assets/hero-instrument-collage.webp" alt="European dental instruments supplied for clinics and distributors in Iraq" />
    </section>
    <section className="section audience-grid">
      <article><span>01</span><h2>{copy.clinic}</h2><p>{copy.clinicText}</p></article>
      <article><span>02</span><h2>{copy.distributor}</h2><p>{copy.distributorText}</p></article>
    </section>
    <section className="section">
      <Heading eyebrow={t("featured.eyebrow")} title={t("featured.title")} link={t("featured.link")} locale={locale} />
      <Products limit={3} locale={locale} t={t} addQuoteLine={addQuoteLine} />
    </section>
    <section className="section faq-section">
      <Eyebrow>{copy.faqTitle}</Eyebrow>
      <h2>{copy.faqTitle}</h2>
      <div>{copy.faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>
    <Quote locale={locale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
  </>;
}

function InformationPage({ page, locale, t }: { page: "privacy" | "terms" | "guide"; locale: SiteLocale } & ComponentWithT) {
  const content = informationCopy[locale][page];
  return (
    <article className="legal-page">
      <Eyebrow>{content.eyebrow}</Eyebrow>
      <h1>{content.title}</h1>
      <p className="legal-updated">{content.updated}</p>
      {content.sections.map(section => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}
      <p><a className="button" href={localizedPath("/contact", locale)}>{t("nav.contact")}</a></p>
    </article>
  );
}

function Manufacturers({ locale, t, quoteLines, setQuoteLines }: { locale: SiteLocale } & ComponentWithT & QuoteStateProps) {
  const networkCopy = {
    EN: {
      eyebrow: "European sourcing network",
      title: "One verified manufacturer today. A broader European portfolio by design.",
      text: "AsaDental is the first featured manufacturer in our portfolio, not the identity or limit of Tammuz Global Medical. We evaluate additional European suppliers against the same sourcing framework as the network expands.",
      items: ["Manufacturer and product documentation review", "Commercial fit for Turkey and Iraq", "Pre-shipment verification requirements", "Reliable technical and service communication"],
    },
    TR: {
      eyebrow: "Avrupa tedarik ağı",
      title: "Bugün doğrulanmış bir üretici. Tasarım gereği daha geniş bir Avrupa portföyü.",
      text: "AsaDental portföyümüzde öne çıkan ilk üreticidir; Tammuz Global Medical'ın kimliği veya sınırı değildir. Ağ büyüdükçe yeni Avrupalı tedarikçileri aynı değerlendirme yaklaşımıyla inceleriz.",
      items: ["Üretici ve ürün belgelerinin incelenmesi", "Türkiye ve Irak için ticari uygunluk", "Sevkiyat öncesi doğrulama gereklilikleri", "Güvenilir teknik iletişim ve hizmet"],
    },
    AR: {
      eyebrow: "شبكة توريد أوروبية",
      title: "مصنّع موثّق اليوم، ومحفظة أوروبية أوسع ضمن خطتنا.",
      text: "AsaDental هو أول مصنّع مميز في محفظتنا، لكنه ليس هوية Tammuz Global Medical ولا حدودها. ومع توسع الشبكة نقيّم مورّدين أوروبيين إضافيين وفق المنهج نفسه.",
      items: ["مراجعة وثائق المصنّع والمنتجات", "الملاءمة التجارية لتركيا والعراق", "متطلبات التحقق قبل الشحن", "تواصل وخدمة فنية موثوقة"],
    },
  }[locale];
  return (
    <>
      <h1 className="sr-only">{t("mfr.hero_title")}</h1>
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
      <section className="section partner-framework">
        <div><Eyebrow>{networkCopy.eyebrow}</Eyebrow><h2>{networkCopy.title}</h2></div>
        <div><p>{networkCopy.text}</p><ul>{networkCopy.items.map(item => <li key={item}>{item}</li>)}</ul></div>
      </section>
      <Quote locale={locale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
    </>
  );
}

function Contact({ locale, t, quoteLines, setQuoteLines }: { locale: SiteLocale } & ComponentWithT & QuoteStateProps) {
  return (
    <>
      <h1 className="sr-only">{t("contact.hero_title")}</h1>
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
        <Quote locale={locale} t={t} quoteLines={quoteLines} setQuoteLines={setQuoteLines} />
      </section>
    </>
  );
}

function NotFound({ t }: ComponentWithT) {
  return (
    <section className="not-found">
      <Eyebrow>{t("notfound.eyebrow")}</Eyebrow>
      <h1>{t("notfound.title")}</h1>
      <p>{t("notfound.text")}</p>
      <div className="buttons">
        <a className="button primary" href="/index.html">{t("notfound.home")}</a>
        <a className="button" href="/catalog.html">{t("notfound.catalog")}</a>
      </div>
    </section>
  );
}

function Footer({ locale, t }: { locale: SiteLocale } & ComponentWithT) {
  const resourceLabels = {
    EN: { iraq: "Iraq dental supply", guide: "Procurement guide", privacy: "Privacy", terms: "Terms" },
    TR: { iraq: "Irak dental tedariki", guide: "Satın alma rehberi", privacy: "Gizlilik", terms: "Koşullar" },
    AR: { iraq: "توريد طب الأسنان للعراق", guide: "دليل المشتريات", privacy: "الخصوصية", terms: "الشروط" },
  }[locale];
  const footerNavigation = [
    ["nav.home", localizedPath("/", locale)],
    ["nav.catalog", localizedPath("/catalog", locale)],
    ["nav.manufacturers", localizedPath("/verified-manufacturers", locale)],
    ["nav.contact", localizedPath("/contact", locale)],
  ] as const;
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a className="brand brand-logo footer-logo" href={localizedPath("/", locale)}>
            <img src="/assets/brand/tammuz-global-medical.png" alt="Tammuz Global Medical logo" />
          </a>
          <p>{t("footer.tagline")}</p>
        </div>
        <div className="footer-nav">
          <div>
            <b>{t("footer.explore")}</b>
            {footerNavigation.map(([navKey, href]) => (
              <a key={href} href={href}>{t(navKey)}</a>
            ))}
            <a href={localizedPath("/iraq/dental-supplies", locale)}>{resourceLabels.iraq}</a>
            <a href={localizedPath("/procurement-guide", locale)}>{resourceLabels.guide}</a>
            <a href={localizedPath("/privacy", locale)}>{resourceLabels.privacy}</a>
            <a href={localizedPath("/terms", locale)}>{resourceLabels.terms}</a>
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
