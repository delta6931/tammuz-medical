import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePage } from "../_components/SitePage";
import { forcepsProductForSku } from "../_data/forcepsProductEnrichment";
import { translations } from "../_data/translations";
import { categoryForSlug, localizedPath, productForSlug } from "../_lib/catalog";
import { parseSiteRoute } from "../_lib/site-route";

const seoCopy = {
  EN: {
    home: ["Tammuz Medical — Premium Medical & Dental Supplies | Turkey & Iraq", "European dental and medical supply for clinics, distributors and procurement teams in Turkey and Iraq."],
    catalog: ["AsaDental Dental Instruments Catalog | Tammuz Medical", "Search 2,969 AsaDental dental instrument references by product name, item code or clinical category."],
    manufacturers: ["Verified European Dental Manufacturers | Tammuz Medical", "Learn how Tammuz Global Medical evaluates European manufacturers, documentation and pre-shipment requirements."],
    contact: ["Request a Dental Supply Quote | Turkey & Iraq | Tammuz Medical", "Send a product list or request guidance from the Tammuz Global Medical supply team."],
    iraq: ["Dental Supplies for Clinics & Distributors in Iraq | Tammuz Medical", "Request European dental instruments for Iraq with product matching, documentation support and pre-shipment inspection."],
    privacy: ["Privacy Policy | Tammuz Medical", "How Tammuz Medical handles quote requests, contact information and basic website analytics."],
    terms: ["Website Terms | Tammuz Medical", "Terms governing use of the Tammuz Medical B2B dental and medical supply website."],
    guide: ["Dental Supply Procurement Guide | Tammuz Medical", "A practical B2B guide to product identification, documentation, inspection and quotation."],
  },
  TR: {
    home: ["Türkiye ve Irak için Medikal ve Dental Tedarik | Tammuz Medical", "Türkiye ve Irak'taki klinikler, distribütörler ve satın alma ekipleri için Avrupa dental ve medikal ürün tedariki."],
    catalog: ["AsaDental Dental Alet Kataloğu | Tammuz Medical", "2.959 AsaDental ürün referansını ürün adı, kodu veya klinik kategoriye göre arayın."],
    manufacturers: ["Doğrulanmış Avrupalı Dental Üreticiler | Tammuz Medical", "Üretici, belge ve sevkiyat öncesi kontrol değerlendirme yaklaşımımızı inceleyin."],
    contact: ["Dental Ürün Teklifi İsteyin | Tammuz Medical", "Ürün listenizi gönderin veya Tammuz Global Medical tedarik ekibinden destek alın."],
    iraq: ["Irak için Dental Ürün Tedariki | Tammuz Medical", "Irak'a yönelik Avrupa dental aletleri için ürün eşleştirme, belge desteği ve teklif talep edin."],
    privacy: ["Gizlilik Politikası | Tammuz Medical", "Teklif taleplerinin, iletişim bilgilerinin ve temel web sitesi analizlerinin nasıl işlendiği."],
    terms: ["Web Sitesi Koşulları | Tammuz Medical", "Tammuz Medical B2B web sitesi kullanım koşulları."],
    guide: ["Dental Tedarik Satın Alma Rehberi | Tammuz Medical", "Ürün tanımlama, belge, kontrol ve teklif süreçleri için pratik B2B rehberi."],
  },
  AR: {
    home: ["توريد المستلزمات الطبية وطب الأسنان في تركيا والعراق | Tammuz Medical", "توريد أوروبي لعيادات الأسنان والموزعين وفرق المشتريات في تركيا والعراق."],
    catalog: ["كتالوج أدوات AsaDental لطب الأسنان | Tammuz Medical", "ابحث في 2,969 مرجعاً من AsaDental حسب اسم المنتج أو الرمز أو الفئة السريرية."],
    manufacturers: ["مصنّعون أوروبيون موثوقون لطب الأسنان | Tammuz Medical", "تعرّف على منهجنا في تقييم المصنّعين والوثائق ومتطلبات الفحص قبل الشحن."],
    contact: ["اطلب عرض سعر لمستلزمات طب الأسنان | Tammuz Medical", "أرسل قائمة المنتجات أو اطلب المساعدة من فريق توريد Tammuz Global Medical."],
    iraq: ["مستلزمات طب الأسنان للعيادات والموزعين في العراق | Tammuz Medical", "اطلب أدوات أسنان أوروبية للعراق مع مطابقة المنتجات ودعم الوثائق والفحص قبل الشحن."],
    privacy: ["سياسة الخصوصية | Tammuz Medical", "كيفية التعامل مع طلبات عروض الأسعار وبيانات التواصل وتحليلات الموقع الأساسية."],
    terms: ["شروط استخدام الموقع | Tammuz Medical", "شروط استخدام موقع Tammuz Medical لتوريد مستلزمات طب الأسنان بين الشركات."],
    guide: ["دليل شراء مستلزمات طب الأسنان | Tammuz Medical", "دليل عملي لتحديد المنتجات والوثائق والفحص وطلب عروض الأسعار."],
  },
} as const;

function basePath(canonicalPath: string) {
  return canonicalPath.replace(/^\/(tr|ar)(?=\/|$)/, "") || "/";
}

export async function generateMetadata({ params }: { params: Promise<{ segments: string[] }> }): Promise<Metadata> {
  const { segments } = await params;
  const route = parseSiteRoute(segments);
  if (route.page === "not-found") return { robots: { index: false, follow: false } };

  const copy = seoCopy[route.locale];
  let title: string;
  let description: string;
  if (route.page === "category") {
    const category = categoryForSlug(route.categorySlug!)!;
    const categoryName = translations[route.locale][category.labelKey] || category.name.replace("ASA Dental", "AsaDental");
    if (route.locale === "AR") {
      title = `أدوات ${categoryName} من AsaDental | Tammuz Medical`;
      description = `تصفح مراجع AsaDental ضمن فئة ${categoryName} وابحث برمز المنتج واطلب عرض سعر للتوريد إلى العراق أو تركيا.`;
    } else if (route.locale === "TR") {
      title = `AsaDental ${categoryName} Ürünleri | Tammuz Medical`;
      description = `AsaDental ${categoryName} ürün referanslarını inceleyin, ürün koduyla arayın ve Türkiye veya Irak için B2B teklif isteyin.`;
    } else {
      title = `${categoryName.replace("ASA Dental", "AsaDental")} Dental Instruments | Tammuz Medical`;
      description = `Browse AsaDental ${categoryName.replace("ASA Dental", "AsaDental")} references and request a B2B quote for Turkey or Iraq.`;
    }
  } else if (route.page === "product") {
    const product = productForSlug(route.productSlug!)!;
    const enrichment = forcepsProductForSku(product.code);
    if (enrichment) {
      const localized = enrichment.copy[route.locale];
      title = `${localized.title} | Tammuz Medical`;
      description = localized.metaDescription;
    } else if (route.locale === "AR") {
      title = `${product.name} – رمز ${product.code} | Tammuz Medical`;
      description = `اطّلع على مرجع AsaDental رقم ${product.code}: ${product.name}. أضفه إلى طلب عرض سعر للتوريد إلى العراق أو تركيا.`;
    } else if (route.locale === "TR") {
      title = `${product.name} ${product.code} | Tammuz Medical`;
      description = `AsaDental ${product.code} referansını inceleyin: ${product.name}. Türkiye veya Irak için teklif listenize ekleyin.`;
    } else {
      title = `${product.name} ${product.code} | Tammuz Medical`;
      description = `View AsaDental item ${product.code}, ${product.name}, and add it to a quote request for Turkey or Iraq.`;
    }
  } else {
    [title, description] = copy[route.page];
  }

  const neutralPath = basePath(route.canonicalPath);
  const languages = {
    "en": localizedPath(neutralPath, "EN"),
    "tr": localizedPath(neutralPath, "TR"),
    "ar": localizedPath(neutralPath, "AR"),
    "x-default": localizedPath(neutralPath, "EN"),
  };

  return {
    title,
    description,
    alternates: { canonical: route.canonicalPath, languages },
    openGraph: {
      title,
      description,
      url: route.canonicalPath,
      siteName: "Tammuz Medical",
      locale: route.locale === "AR" ? "ar_IQ" : route.locale === "TR" ? "tr_TR" : "en_US",
      type: "website",
      images: [{ url: "/assets/social/tammuz-medical-og.webp", width: 1200, height: 630, alt: "Tammuz Global Medical European dental supply for Turkey and Iraq" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/assets/social/tammuz-medical-og.webp"] },
  };
}

export default async function DynamicSitePage({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  const route = parseSiteRoute(segments);
  if (route.page === "not-found") notFound();

  return (
    <SitePage
      page={route.page}
      initialLocale={route.locale}
      canonicalPath={route.canonicalPath}
      categorySlug={route.categorySlug}
      productSlug={route.productSlug}
    />
  );
}
