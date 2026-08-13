import type { SiteLocale } from "../../_lib/catalog";
import type { ToolShellLabels } from "../../_components/ToolShell";

/** Copy for the /tools hub, written natively per language. */

export type ToolCard = { path: string; name: string; blurb: string; tag: string };

export type ToolsIndexStrings = {
  meta: { title: string; description: string };
  shell: ToolShellLabels;
  cards: ToolCard[];
  cta: { question: string; button: string };
  note: string;
};

/** Shared across locales so a new tool is added in one place. */
const PATHS = {
  forceps: "/tools/forceps-selector",
  numbering: "/tools/tooth-numbering",
  gracey: "/tools/gracey-selector",
  clinic: "/tools/clinic-setup",
  iso6360: "/tools/iso-6360",
  endo: "/tools/endo-file-chart",
  terminology: "/tools/dental-terminology",
};

export const toolsIndexStrings: Record<SiteLocale, ToolsIndexStrings> = {
  EN: {
    meta: {
      title: "Free Dental Tools — Clinical & Procurement References | Tammuz Medical",
      description:
        "Free dental reference tools: select forceps and Gracey curettes, convert tooth notation, decode ISO 6360 bur codes, check endodontic sizes, and search trilingual terminology.",
    },
    shell: {
      eyebrow: "Free clinical tools", title: "Dental tools",
      lede: "Practical reference tools built from manufacturer data and published clinical standards. Free to use, no sign-up, and every result links to the instrument that supplies it.",
      home: "Home", tools: "Tools", catalog: "Catalog", contact: "Contact", manufacturers: "Manufacturers",
      navLabel: "Tools",
      footerBlurb: "European dental instruments for clinics, distributors and procurement teams in Turkey and Iraq.",
      footerCatalogHead: "Catalog", footerAllReferences: "All references", footerExtractive: "Extractive surgery",
      footerCompanyHead: "Company",
      legalLine: "Tammuz Global Medical — B2B dental supply, Turkey & Iraq.",
      legalPrices: "Prices on request. Product data published by AsaDental.",
    },
    cards: [
      { path: PATHS.forceps, tag: "Extraction", name: "Extraction forceps selector", blurb: "Click the tooth you are extracting and see which AsaDental forceps patterns are designed for that position — arch, tooth group, side, serration and beak configuration." },
      { path: PATHS.numbering, tag: "Reference", name: "Tooth numbering converter", blurb: "Convert between FDI (ISO 3950), Universal and Palmer notation. Click a tooth or type a number, for permanent and primary dentition." },
      { path: PATHS.gracey, tag: "Periodontal", name: "Gracey curette selector", blurb: "Choose a tooth and the surface you are working, and see which area-specific Gracey figures are indicated — including combination instruments." },
      { path: PATHS.clinic, tag: "Procurement", name: "Clinic setup builder", blurb: "Equipping a new surgery or adding chairs? Choose your treatment areas and room count, then build a list of AsaDental instrument sets ready to send for a quote." },
      { path: PATHS.iso6360, tag: "Rotary", name: "ISO 6360 bur code decoder", blurb: "Split a 15- or 18-digit rotary-instrument number into material, shank, shape, characteristics and nominal diameter groups without guessing unknown codes." },
      { path: PATHS.endo, tag: "Endodontic", name: "Endodontic size and colour chart", blurb: "Match ISO file sizes to colours and tip diameters, then calculate diameter along a stated constant-taper working part." },
      { path: PATHS.terminology, tag: "Language", name: "Trilingual dental terminology", blurb: "Search practical instrument and anatomy terms side by side in English, Turkish and Arabic for clearer cross-border procurement." },
    ],
    cta: { question: "Need instruments quoted for your clinic in Turkey or Iraq?", button: "Request a quote" },
    note: "These tools are product-matching aids for procurement, not clinical advice. Instrument choice remains the clinician's judgement.",
  },

  TR: {
    meta: {
      title: "Ücretsiz Dental Araçlar — Klinik ve Satın Alma Referansları | Tammuz Medical",
      description:
        "Ücretsiz dental referans araçları: davye ve Gracey seçin, diş numarasını çevirin, ISO 6360 frez kodunu çözün, endodontik boyutlara ve üç dilli terimlere bakın.",
    },
    shell: {
      eyebrow: "Ücretsiz klinik araçlar", title: "Dental araçlar",
      lede: "Üretici verilerinden ve yayımlanmış klinik standartlardan geliştirilmiş pratik referans araçları. Ücretsiz, kayıt gerektirmez ve her sonuç ilgili aletin ürün sayfasına bağlanır.",
      home: "Ana sayfa", tools: "Araçlar", catalog: "Katalog", contact: "İletişim", manufacturers: "Üreticiler",
      navLabel: "Araçlar",
      footerBlurb: "Türkiye ve Irak'taki klinikler, distribütörler ve satın alma ekipleri için Avrupa dental aletleri.",
      footerCatalogHead: "Katalog", footerAllReferences: "Tüm referanslar", footerExtractive: "Çekim cerrahisi",
      footerCompanyHead: "Kurumsal",
      legalLine: "Tammuz Global Medical — Türkiye ve Irak için B2B dental tedarik.",
      legalPrices: "Fiyatlar talep üzerine. Ürün verileri AsaDental tarafından yayımlanmıştır.",
    },
    cards: [
      { path: PATHS.forceps, tag: "Çekim", name: "Diş çekme davyesi seçici", blurb: "Çekeceğiniz dişe tıklayın ve o pozisyon için tasarlanmış AsaDental davye modellerini görün — çene, diş grubu, taraf, tırtık durumu ve uçların istirahat konumu." },
      { path: PATHS.numbering, tag: "Referans", name: "Diş numaralandırma çevirici", blurb: "FDI (ISO 3950), Universal ve Palmer sistemleri arasında çeviri yapın. Dişe tıklayın veya numara yazın; sürekli ve süt dişleri için." },
      { path: PATHS.gracey, tag: "Periodontal", name: "Gracey küret seçici", blurb: "Çalıştığınız dişi ve yüzeyi seçin, bölgeye özgü hangi Gracey figürlerinin endike olduğunu görün — kombinasyon aletleri dâhil." },
      { path: PATHS.clinic, tag: "Satın alma", name: "Klinik kurulum oluşturucu", blurb: "Yeni muayenehane mi kuruyorsunuz ya da ünit mi ekliyorsunuz? Tedavi alanlarını ve oda sayısını seçin, teklife hazır AsaDental set listesi oluşturun." },
      { path: PATHS.iso6360, tag: "Döner alet", name: "ISO 6360 frez kod çözücü", blurb: "15 veya 18 haneli döner alet numarasını malzeme, şaft, şekil, özellik ve nominal çap gruplarına ayırın; bilinmeyen kodlar tahmin edilmez." },
      { path: PATHS.endo, tag: "Endodonti", name: "Endodontik boyut ve renk tablosu", blurb: "ISO eğe boyutlarını renk ve uç çapıyla eşleştirin; sabit konik çalışan bölüm boyunca çapı hesaplayın." },
      { path: PATHS.terminology, tag: "Dil", name: "Üç dilli dental terimler", blurb: "Sınır ötesi satın alma için pratik alet ve anatomi terimlerini İngilizce, Türkçe ve Arapça yan yana arayın." },
    ],
    cta: { question: "Türkiye veya Irak'taki kliniğiniz için teklif ister misiniz?", button: "Teklif isteyin" },
    note: "Bu araçlar satın alma sürecinde ürün eşleştirme amaçlıdır, klinik tavsiye değildir. Alet seçimi hekimin kararındadır.",
  },

  AR: {
    meta: {
      title: "أدوات مجانية لطب الأسنان — مراجع سريرية وللمشتريات | Tammuz Medical",
      description:
        "أدوات مرجعية مجانية: اختيار كلاّبات القلع وغرايسي، تحويل ترقيم الأسنان، تفسير ISO 6360، مراجعة مقاسات الجذور، والبحث في المصطلحات بثلاث لغات.",
    },
    shell: {
      eyebrow: "أدوات سريرية مجانية", title: "أدوات طب الأسنان",
      lede: "أدوات مرجعية عملية مبنية على بيانات الشركات المصنّعة والمعايير السريرية المنشورة. مجانية وبلا تسجيل، وكل نتيجة مرتبطة بصفحة الأداة التي توفّرها.",
      home: "الرئيسية", tools: "الأدوات", catalog: "الكتالوج", contact: "تواصل معنا", manufacturers: "المصنّعون",
      navLabel: "الأدوات",
      footerBlurb: "أدوات أسنان أوروبية للعيادات والموزّعين وفرق المشتريات في تركيا والعراق.",
      footerCatalogHead: "الكتالوج", footerAllReferences: "جميع المراجع", footerExtractive: "جراحة القلع",
      footerCompanyHead: "الشركة",
      legalLine: "Tammuz Global Medical — توريد مستلزمات طب الأسنان بين الشركات، تركيا والعراق.",
      legalPrices: "الأسعار عند الطلب. بيانات المنتجات منشورة من AsaDental.",
    },
    cards: [
      { path: PATHS.forceps, tag: "القلع", name: "أداة اختيار كلاّبات القلع", blurb: "اضغط على السن المراد قلعه لترى نماذج كلاّبات AsaDental المصمّمة لهذا الموضع — الفك ومجموعة الأسنان والجهة والتسنين ووضع الفكين عند الراحة." },
      { path: PATHS.numbering, tag: "مرجع", name: "محوّل ترقيم الأسنان", blurb: "حوّل بين أنظمة FDI (ISO 3950) وUniversal وPalmer. اضغط على سنّ أو اكتب رقماً، للأسنان الدائمة واللبنية." },
      { path: PATHS.gracey, tag: "اللثة", name: "أداة اختيار مكاشط غرايسي", blurb: "اختر السن والسطح الذي تعمل عليه لترى أرقام غرايسي المخصّصة لتلك المنطقة — بما فيها الأدوات المركّبة." },
      { path: PATHS.clinic, tag: "المشتريات", name: "أداة تجهيز العيادة", blurb: "هل تجهّز عيادة جديدة أو تضيف كراسي؟ اختر مجالات العلاج وعدد الغرف، ثم كوّن قائمة أطقم AsaDental جاهزة لطلب عرض السعر." },
      { path: PATHS.iso6360, tag: "أدوات دوّارة", name: "مفسّر رمز ISO 6360", blurb: "قسّم رقم الأداة الدوّارة المكوّن من 15 أو 18 خانة إلى المادة والساق والشكل والخصائص والقطر الاسمي، من دون تخمين الرموز غير الموثقة." },
      { path: PATHS.endo, tag: "علاج الجذور", name: "جدول مقاسات وألوان المبارد", blurb: "طابق مقاسات مبارد ISO مع اللون وقطر الرأس، واحسب القطر على طول الجزء العامل ذي التدرج الثابت." },
      { path: PATHS.terminology, tag: "اللغة", name: "مصطلحات أسنان بثلاث لغات", blurb: "ابحث عن مصطلحات الأدوات والتشريح بالإنجليزية والتركية والعربية جنباً إلى جنب لتسهيل المشتريات عبر الحدود." },
    ],
    cta: { question: "هل تحتاج عرض سعر لأدوات عيادتك في تركيا أو العراق؟", button: "اطلب عرض سعر" },
    note: "هذه الأدوات وسيلة لمطابقة المنتجات لأغراض الشراء وليست استشارة سريرية. يبقى اختيار الأداة من مسؤولية الطبيب.",
  },
};
