import type { SiteLocale } from "../../_lib/catalog";
import type { Region, Surface } from "../_lib/gracey";
import type { ToolShellLabels } from "../../_components/ToolShell";

/**
 * Copy for the Gracey curette selector, written natively per language.
 * Arabic adjectives agree with the gender of the tooth noun, so tooth names
 * carry their gender and the label builder picks the matching form.
 */

type Gender = "m" | "f";
type Named = { name: string; gender: Gender };

export type GraceyStrings = {
  meta: { title: string; description: string };
  shell: ToolShellLabels;
  chart: { groupLabel: string; upper: string; lower: string; hint: string };
  surfaceLegend: string;
  surfaces: Record<Surface, string>;
  surfaceHint: string;
  regions: Record<Region, string>;
  result: {
    prompt: string; pickSurface: string; heading: (tooth: string, surface: string) => string;
    countOne: string; countMany: string; noMatch: string;
    figure: string; covers: string; variants: string;
  };
  sets: { heading: string; note: string };
  link: string;
  disclaimer: string;
  faqEyebrow: string; faqHeading: string;
  faq: { q: string; a: string }[];
  cta: { question: string; button: string };
  toothLabel: (fdi: number) => string;
};

const EN_TEETH: Record<number, Named> = {
  1: { name: "central incisor", gender: "m" }, 2: { name: "lateral incisor", gender: "m" },
  3: { name: "canine", gender: "m" }, 4: { name: "first premolar", gender: "m" },
  5: { name: "second premolar", gender: "m" }, 6: { name: "first molar", gender: "m" },
  7: { name: "second molar", gender: "m" }, 8: { name: "third molar", gender: "m" },
};
const TR_TEETH: Record<number, Named> = {
  1: { name: "santral kesici", gender: "m" }, 2: { name: "lateral kesici", gender: "m" },
  3: { name: "kanin", gender: "m" }, 4: { name: "birinci küçük azı", gender: "m" },
  5: { name: "ikinci küçük azı", gender: "m" }, 6: { name: "birinci büyük azı", gender: "m" },
  7: { name: "ikinci büyük azı", gender: "m" }, 8: { name: "yirmi yaş dişi", gender: "m" },
};
const AR_TEETH: Record<number, Named> = {
  1: { name: "القاطع المركزي", gender: "m" }, 2: { name: "القاطع الجانبي", gender: "m" },
  3: { name: "الناب", gender: "m" }, 4: { name: "الضاحك الأول", gender: "m" },
  5: { name: "الضاحك الثاني", gender: "m" }, 6: { name: "الرحى الأولى", gender: "f" },
  7: { name: "الرحى الثانية", gender: "f" }, 8: { name: "ضرس العقل", gender: "m" },
};
const AR_ARCH = { m: { upper: "العلوي", lower: "السفلي" }, f: { upper: "العلوية", lower: "السفلية" } };
const AR_SIDE = { m: { right: "الأيمن", left: "الأيسر" }, f: { right: "اليمنى", left: "اليسرى" } };

function parts(fdi: number) {
  const q = Math.floor(fdi / 10);
  return { upper: q === 1 || q === 2, right: q === 1 || q === 4, position: fdi % 10 };
}

export const graceyStrings: Record<SiteLocale, GraceyStrings> = {
  EN: {
    meta: {
      title: "Gracey Curette Selector — Which Gracey for Which Tooth Surface | Tammuz Medical",
      description:
        "Click a tooth and a surface to see which Gracey curette is designed for it. Covers 1/2 through 17/18 including combination instruments, matched to AsaDental references.",
    },
    shell: {
      eyebrow: "Free clinical tool", title: "Gracey curette selector",
      lede: "Gracey curettes are area-specific: each figure is shaped for particular teeth and particular surfaces. Choose a tooth and the surface you are working, and see which figures are indicated — with the AsaDental references that supply them.",
      home: "Home", tools: "Tools", catalog: "Catalog", contact: "Contact", manufacturers: "Manufacturers",
      navLabel: "Tools",
      footerBlurb: "European dental instruments for clinics, distributors and procurement teams in Turkey and Iraq.",
      footerCatalogHead: "Catalog", footerAllReferences: "All references", footerExtractive: "Extractive surgery",
      footerCompanyHead: "Company",
      legalLine: "Tammuz Global Medical — B2B dental supply, Turkey & Iraq.",
      legalPrices: "Prices on request. Product data published by AsaDental.",
    },
    chart: {
      groupLabel: "Dental arch, FDI tooth numbering",
      upper: "Upper arch", lower: "Lower arch",
      hint: "Numbers follow FDI notation. Left and right are the patient's own left and right.",
    },
    surfaceLegend: "Surface being instrumented",
    surfaces: { facial: "Facial / buccal", lingual: "Lingual / palatal", mesial: "Mesial", distal: "Distal" },
    surfaceHint: "Anterior figures work all four surfaces; posterior figures are surface-specific.",
    regions: { anterior: "Anteriors", premolar: "Premolars", molar: "Molars" },
    result: {
      prompt: "Select a tooth and a surface to see the Gracey figures designed for it.",
      pickSurface: "Now choose which surface you are working.",
      heading: (tooth, surface) => `${tooth} — ${surface}`,
      countOne: "figure", countMany: "figures",
      noMatch: "No Gracey figure in this catalogue is area-specific for that combination. Tell us the tooth and surface and we will identify the instrument for you.",
      figure: "Gracey", covers: "Covers", variants: "Available references",
    },
    sets: {
      heading: "Complete sets",
      note: "These are supplied as sets rather than a single figure, so they are not matched to one surface.",
    },
    link: "View details & request a quote →",
    disclaimer:
      "Gracey figures follow the published area-specific instrumentation standard; the references shown come from the AsaDental catalogue. This is a product-matching aid for procurement, not clinical advice — instrument choice remains the clinician's judgement.",
    faqEyebrow: "How Gracey numbering works",
    faqHeading: "Questions about area-specific curettes",
    faq: [
      { q: "What makes a Gracey curette 'area-specific'?", a: "Unlike a universal curette, a Gracey has its blade offset at roughly 70 degrees to the shank and only one cutting edge is used. That offset, together with the shank bends, is designed for a particular group of teeth and a particular surface. Using the wrong figure means the blade cannot adapt to the root surface, so calculus is left behind." },
      { q: "Which Gracey do I use where?", a: "Figures 1/2 and 3/4 are for anterior teeth, 5/6 extends to the premolars, 7/8 and 9/10 are for posterior facial and lingual surfaces, 11/12 is for posterior mesial surfaces and 13/14 for posterior distal. Figures 15/16 and 17/18 are extended-shank designs serving the same mesial and distal surfaces. Select a tooth above and the tool filters to the right figures." },
      { q: "Why do some instruments have two different numbers, like 11/14?", a: "Standard Gracey instruments are double-ended with two mirrored ends of the same figure, so 11/12 gives you two mesial ends. Combination instruments pair different ends — 11/14 puts a mesial end and a distal end on one handle, so it covers both surfaces and reduces instrument changes during a quadrant." },
      { q: "What are After Five and Mini Five variants?", a: "They are shank and blade modifications of the same figure. Extended-shank designs reach deeper pockets, and shorter-blade designs adapt better to narrow pockets and root concavities. The area they are indicated for stays the same as the base figure, so this tool groups them together." },
      { q: "Can I order these in Iraq or Turkey?", a: "Yes. Tammuz Global Medical supplies AsaDental periodontal instruments to clinics, distributors and procurement teams across Turkey and Iraq. Prices are quoted per order — choose the figures you need and send us the item codes." },
    ],
    cta: { question: "Need a full periodontal setup quoted for your clinic?", button: "Request a quote" },
    toothLabel: fdi => {
      const { upper, right, position } = parts(fdi);
      return `${upper ? "Upper" : "Lower"} ${right ? "right" : "left"} ${EN_TEETH[position].name}`;
    },
  },

  TR: {
    meta: {
      title: "Gracey Küret Seçici — Hangi Diş Yüzeyine Hangi Gracey | Tammuz Medical",
      description:
        "Dişe ve yüzeye tıklayın, o bölge için tasarlanmış Gracey küretini görün. 1/2'den 17/18'e tüm figürler ve kombinasyon aletleri, AsaDental referanslarıyla eşleştirilmiştir.",
    },
    shell: {
      eyebrow: "Ücretsiz klinik araç", title: "Gracey küret seçici",
      lede: "Gracey küretleri bölgeye özgüdür: her figür belirli dişler ve belirli yüzeyler için şekillendirilmiştir. Çalıştığınız dişi ve yüzeyi seçin, endike figürleri ve bunları karşılayan AsaDental referanslarını görün.",
      home: "Ana sayfa", tools: "Araçlar", catalog: "Katalog", contact: "İletişim", manufacturers: "Üreticiler",
      navLabel: "Araçlar",
      footerBlurb: "Türkiye ve Irak'taki klinikler, distribütörler ve satın alma ekipleri için Avrupa dental aletleri.",
      footerCatalogHead: "Katalog", footerAllReferences: "Tüm referanslar", footerExtractive: "Çekim cerrahisi",
      footerCompanyHead: "Kurumsal",
      legalLine: "Tammuz Global Medical — Türkiye ve Irak için B2B dental tedarik.",
      legalPrices: "Fiyatlar talep üzerine. Ürün verileri AsaDental tarafından yayımlanmıştır.",
    },
    chart: {
      groupLabel: "Diş arkı, FDI diş numaralandırması",
      upper: "Üst çene", lower: "Alt çene",
      hint: "Numaralar FDI sistemine göredir. Sağ ve sol, hastanın kendi sağı ve soludur.",
    },
    surfaceLegend: "Çalışılan yüzey",
    surfaces: { facial: "Vestibüler / bukkal", lingual: "Lingual / palatinal", mesial: "Mezial", distal: "Distal" },
    surfaceHint: "Ön bölge figürleri dört yüzeyde de çalışır; arka bölge figürleri yüzeye özgüdür.",
    regions: { anterior: "Ön dişler", premolar: "Küçük azılar", molar: "Büyük azılar" },
    result: {
      prompt: "Bu bölge için tasarlanmış Gracey figürlerini görmek üzere bir diş ve yüzey seçin.",
      pickSurface: "Şimdi çalıştığınız yüzeyi seçin.",
      heading: (tooth, surface) => `${tooth} — ${surface}`,
      countOne: "figür", countMany: "figür",
      noMatch: "Bu katalogda o kombinasyon için bölgeye özgü bir Gracey figürü bulunmuyor. Dişi ve yüzeyi bize bildirin, uygun aleti sizin için belirleyelim.",
      figure: "Gracey", covers: "Kapsadığı", variants: "Mevcut referanslar",
    },
    sets: {
      heading: "Komple setler",
      note: "Bunlar tek bir figür olarak değil set hâlinde sunulduğundan tek bir yüzeyle eşleştirilmemiştir.",
    },
    link: "Ayrıntılar ve teklif talebi →",
    disclaimer:
      "Gracey figürleri yayımlanmış bölgeye özgü enstrümantasyon standardını izler; gösterilen referanslar AsaDental katalogundan alınmıştır. Satın alma sürecinde ürün eşleştirme amaçlıdır, klinik tavsiye değildir — alet seçimi hekimin kararındadır.",
    faqEyebrow: "Gracey numaralandırması nasıl çalışır",
    faqHeading: "Bölgeye özgü küretler hakkında sık sorulanlar",
    faq: [
      { q: "Gracey küretini \"bölgeye özgü\" yapan nedir?", a: "Üniversal küretin aksine Gracey'nin ağzı sapa yaklaşık 70 derece açıyla ofsetlidir ve yalnızca bir kesici kenarı kullanılır. Bu ofset, sap bükümleriyle birlikte belirli bir diş grubu ve belirli bir yüzey için tasarlanmıştır. Yanlış figür kullanmak, ağzın kök yüzeyine adapte olamaması ve diş taşının yerinde kalması demektir." },
      { q: "Hangi Gracey'yi nerede kullanırım?", a: "1/2 ve 3/4 ön dişler içindir, 5/6 küçük azılara uzanır, 7/8 ve 9/10 arka bölge vestibüler ve lingual yüzeyler içindir, 11/12 arka bölge mezial, 13/14 ise arka bölge distal yüzeyler içindir. 15/16 ve 17/18 aynı mezial ve distal yüzeylere hizmet eden uzun saplı tasarımlardır. Yukarıdan bir diş seçin, araç doğru figürlere göre filtreler." },
      { q: "Neden bazı aletlerin 11/14 gibi iki farklı numarası var?", a: "Standart Gracey aletleri çift uçludur ve aynı figürün iki simetrik ucunu taşır; yani 11/12 size iki mezial uç verir. Kombinasyon aletleri farklı uçları eşleştirir — 11/14, bir mezial ve bir distal ucu tek sapta toplar, böylece her iki yüzeyi kapsar ve bir çeyrek boyunca alet değişimini azaltır." },
      { q: "After Five ve Mini Five varyantları nedir?", a: "Bunlar aynı figürün sap ve ağız modifikasyonlarıdır. Uzun saplı tasarımlar daha derin ceplere ulaşır, kısa ağızlı tasarımlar dar ceplere ve kök konkavitelerine daha iyi uyum sağlar. Endike oldukları bölge temel figürle aynı kaldığından bu araç onları birlikte gruplar." },
      { q: "Bunları Irak veya Türkiye'de sipariş edebilir miyim?", a: "Evet. Tammuz Global Medical, AsaDental periodontal aletlerini Türkiye ve Irak genelindeki kliniklere, distribütörlere ve satın alma ekiplerine tedarik eder. Fiyatlar siparişe göre verilir — ihtiyacınız olan figürleri seçip ürün kodlarını bize gönderin." },
    ],
    cta: { question: "Kliniğiniz için komple periodontal set teklifi ister misiniz?", button: "Teklif isteyin" },
    toothLabel: fdi => {
      const { upper, right, position } = parts(fdi);
      return `${upper ? "Üst" : "Alt"} ${right ? "sağ" : "sol"} ${TR_TEETH[position].name}`;
    },
  },

  AR: {
    meta: {
      title: "أداة اختيار مكاشط غرايسي — أي غرايسي لأي سطح سنّي | Tammuz Medical",
      description:
        "اضغط على السن والسطح لعرض مكشطة غرايسي المصمّمة له. تشمل الأرقام من 1/2 حتى 17/18 والأدوات المركّبة، مرتبطة بمراجع AsaDental.",
    },
    shell: {
      eyebrow: "أداة سريرية مجانية", title: "أداة اختيار مكاشط غرايسي",
      lede: "مكاشط غرايسي مخصّصة لمناطق بعينها: كل رقم مصمّم لأسنان محدّدة وأسطح محدّدة. اختر السن والسطح الذي تعمل عليه لترى الأرقام المناسبة ومراجع AsaDental التي توفّرها.",
      home: "الرئيسية", tools: "الأدوات", catalog: "الكتالوج", contact: "تواصل معنا", manufacturers: "المصنّعون",
      navLabel: "الأدوات",
      footerBlurb: "أدوات أسنان أوروبية للعيادات والموزّعين وفرق المشتريات في تركيا والعراق.",
      footerCatalogHead: "الكتالوج", footerAllReferences: "جميع المراجع", footerExtractive: "جراحة القلع",
      footerCompanyHead: "الشركة",
      legalLine: "Tammuz Global Medical — توريد مستلزمات طب الأسنان بين الشركات، تركيا والعراق.",
      legalPrices: "الأسعار عند الطلب. بيانات المنتجات منشورة من AsaDental.",
    },
    chart: {
      groupLabel: "قوس الأسنان، ترقيم FDI",
      upper: "الفك العلوي", lower: "الفك السفلي",
      hint: "الأرقام وفق نظام FDI. اليمين واليسار من منظور المريض نفسه.",
    },
    surfaceLegend: "السطح الذي تعمل عليه",
    surfaces: { facial: "دهليزي / شدقي", lingual: "لساني / حنكي", mesial: "إنسي", distal: "وحشي" },
    surfaceHint: "أرقام المنطقة الأمامية تعمل على الأسطح الأربعة، أمّا أرقام المنطقة الخلفية فمخصّصة لسطح بعينه.",
    regions: { anterior: "الأسنان الأمامية", premolar: "الضواحك", molar: "الأرحاء" },
    result: {
      prompt: "اختر سنّاً وسطحاً لعرض أرقام غرايسي المصمّمة له.",
      pickSurface: "اختر الآن السطح الذي تعمل عليه.",
      heading: (tooth, surface) => `${tooth} — ${surface}`,
      countOne: "رقم", countMany: "أرقام",
      noMatch: "لا يوجد في هذا الكتالوج رقم غرايسي مخصّص لهذه التركيبة. أرسل لنا السن والسطح وسنحدّد لك الأداة المناسبة.",
      figure: "غرايسي", covers: "يغطّي", variants: "المراجع المتوفّرة",
    },
    sets: {
      heading: "الأطقم الكاملة",
      note: "تُقدَّم هذه كأطقم لا كرقم مفرد، لذلك لم تُربط بسطح واحد.",
    },
    link: "التفاصيل وطلب عرض سعر ←",
    disclaimer:
      "تتبع أرقام غرايسي المعيار المنشور للأدوات المخصّصة للمناطق، والمراجع المعروضة مأخوذة من كتالوج AsaDental. وهي وسيلة لمطابقة المنتجات لأغراض الشراء وليست استشارة سريرية — يبقى اختيار الأداة من مسؤولية الطبيب.",
    faqEyebrow: "كيف يعمل ترقيم غرايسي",
    faqHeading: "أسئلة شائعة عن المكاشط المخصّصة للمناطق",
    faq: [
      { q: "ما الذي يجعل مكشطة غرايسي «مخصّصة لمنطقة»؟", a: "على خلاف المكشطة الشاملة، تكون نصلة غرايسي مائلة نحو 70 درجة على الساق ولا يُستخدم منها سوى حافة قاطعة واحدة. هذا الميل، مع انحناءات الساق، مصمّم لمجموعة أسنان بعينها ولسطح بعينه. واستخدام الرقم الخطأ يعني عجز النصلة عن التكيّف مع سطح الجذر وبقاء القلح في مكانه." },
      { q: "أي رقم غرايسي أستخدم وأين؟", a: "الرقمان 1/2 و3/4 للأسنان الأمامية، و5/6 يمتد إلى الضواحك، و7/8 و9/10 للأسطح الدهليزية واللسانية في المنطقة الخلفية، و11/12 للأسطح الإنسية الخلفية و13/14 للأسطح الوحشية الخلفية. أمّا 15/16 و17/18 فتصاميم ذات ساق ممتدة تخدم الأسطح الإنسية والوحشية نفسها. اختر سنّاً من الأعلى لتصفية الأرقام المناسبة." },
      { q: "لماذا تحمل بعض الأدوات رقمين مختلفين مثل 11/14؟", a: "أدوات غرايسي القياسية ثنائية الطرف وتحمل طرفين متماثلين للرقم نفسه، فالرقم 11/12 يمنحك طرفين إنسيّين. أمّا الأدوات المركّبة فتجمع طرفين مختلفين — إذ يضع 11/14 طرفاً إنسياً وآخر وحشياً على مقبض واحد، فيغطّي السطحين معاً ويقلّل تبديل الأدوات أثناء العمل على الربع." },
      { q: "ما هي نسخ After Five وMini Five؟", a: "هي تعديلات على ساق الأداة ونصلتها لنفس الرقم. فالتصاميم ذات الساق الممتدة تصل إلى جيوب أعمق، والتصاميم ذات النصلة الأقصر تتكيّف أفضل مع الجيوب الضيقة وتقعّرات الجذر. وتبقى المنطقة المخصّصة لها كما في الرقم الأساسي، ولذلك تجمعها هذه الأداة معاً." },
      { q: "هل يمكنني طلبها في العراق أو تركيا؟", a: "نعم. توفّر Tammuz Global Medical أدوات AsaDental لأمراض اللثة للعيادات والموزّعين وفرق المشتريات في تركيا والعراق. تُقدَّم الأسعار حسب الطلب — اختر الأرقام التي تحتاجها وأرسل لنا رموز المنتجات." },
    ],
    cta: { question: "هل تحتاج عرض سعر لطقم لثوي متكامل لعيادتك؟", button: "اطلب عرض سعر" },
    toothLabel: fdi => {
      const { upper, right, position } = parts(fdi);
      const tooth = AR_TEETH[position];
      return `${tooth.name} ${AR_ARCH[tooth.gender][upper ? "upper" : "lower"]} ${AR_SIDE[tooth.gender][right ? "right" : "left"]}`;
    },
  },
};
