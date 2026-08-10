import type { SiteLocale } from "../../_lib/catalog";
import type { Dentition, Tooth } from "../_lib/tooth-notation";
import type { ToolShellLabels } from "../../_components/ToolShell";

/**
 * Copy for the tooth numbering converter, written natively per language.
 * Arabic adjectives agree with the gender of the tooth noun, so names carry
 * their gender and the label builder picks the matching form.
 */

type Gender = "m" | "f";
type Named = { name: string; gender: Gender };

export type ToothNotationStrings = {
  meta: { title: string; description: string };
  shell: ToolShellLabels;
  dentition: Record<Dentition, string>;
  systems: { fdi: string; universal: string; palmer: string };
  systemNotes: { fdi: string; universal: string; palmer: string };
  input: { legend: string; label: string; placeholder: string; invalid: string; clear: string };
  chart: { groupLabel: string; upper: string; lower: string; hint: string };
  result: { heading: string; arch: string; side: string; quadrant: string; toothName: string; prompt: string };
  values: { upper: string; lower: string; right: string; left: string };
  faqEyebrow: string;
  faqHeading: string;
  faq: { q: string; a: string }[];
  cta: { question: string; button: string };
  toothName: (tooth: Tooth) => string;
};

const EN_PERMANENT: Record<number, Named> = {
  1: { name: "central incisor", gender: "m" }, 2: { name: "lateral incisor", gender: "m" },
  3: { name: "canine", gender: "m" }, 4: { name: "first premolar", gender: "m" },
  5: { name: "second premolar", gender: "m" }, 6: { name: "first molar", gender: "m" },
  7: { name: "second molar", gender: "m" }, 8: { name: "third molar", gender: "m" },
};
const EN_PRIMARY: Record<number, Named> = {
  1: { name: "central incisor", gender: "m" }, 2: { name: "lateral incisor", gender: "m" },
  3: { name: "canine", gender: "m" }, 4: { name: "first molar", gender: "m" },
  5: { name: "second molar", gender: "m" },
};

const TR_PERMANENT: Record<number, Named> = {
  1: { name: "santral kesici", gender: "m" }, 2: { name: "lateral kesici", gender: "m" },
  3: { name: "kanin", gender: "m" }, 4: { name: "birinci küçük azı", gender: "m" },
  5: { name: "ikinci küçük azı", gender: "m" }, 6: { name: "birinci büyük azı", gender: "m" },
  7: { name: "ikinci büyük azı", gender: "m" }, 8: { name: "yirmi yaş dişi", gender: "m" },
};
const TR_PRIMARY: Record<number, Named> = {
  1: { name: "santral kesici", gender: "m" }, 2: { name: "lateral kesici", gender: "m" },
  3: { name: "kanin", gender: "m" }, 4: { name: "birinci süt azısı", gender: "m" },
  5: { name: "ikinci süt azısı", gender: "m" },
};

const AR_PERMANENT: Record<number, Named> = {
  1: { name: "القاطع المركزي", gender: "m" }, 2: { name: "القاطع الجانبي", gender: "m" },
  3: { name: "الناب", gender: "m" }, 4: { name: "الضاحك الأول", gender: "m" },
  5: { name: "الضاحك الثاني", gender: "m" }, 6: { name: "الرحى الأولى", gender: "f" },
  7: { name: "الرحى الثانية", gender: "f" }, 8: { name: "ضرس العقل", gender: "m" },
};
const AR_PRIMARY: Record<number, Named> = {
  1: { name: "القاطع المركزي", gender: "m" }, 2: { name: "القاطع الجانبي", gender: "m" },
  3: { name: "الناب", gender: "m" }, 4: { name: "الرحى الأولى", gender: "f" },
  5: { name: "الرحى الثانية", gender: "f" },
};

const AR_ARCH = { m: { upper: "العلوي", lower: "السفلي" }, f: { upper: "العلوية", lower: "السفلية" } };
const AR_SIDE = { m: { right: "الأيمن", left: "الأيسر" }, f: { right: "اليمنى", left: "اليسرى" } };
const AR_PRIMARY_ADJ = { m: "اللبني", f: "اللبنية" };

export const toothNotationStrings: Record<SiteLocale, ToothNotationStrings> = {
  EN: {
    meta: {
      title: "Tooth Numbering Converter — FDI ↔ Universal ↔ Palmer | Tammuz Medical",
      description:
        "Convert between FDI (ISO 3950), Universal and Palmer tooth numbering instantly. Click a tooth or type any notation. Covers permanent and primary dentition, with a printable reference chart.",
    },
    shell: {
      eyebrow: "Free clinical tool", title: "Tooth numbering converter",
      lede: "Convert between the three dental numbering systems — FDI (ISO 3950), Universal and Palmer. Click a tooth on the chart, or type a number in the system you have and read the other two.",
      home: "Home", tools: "Tools", catalog: "Catalog", contact: "Contact", manufacturers: "Manufacturers",
      navLabel: "Tools",
      footerBlurb: "European dental instruments for clinics, distributors and procurement teams in Turkey and Iraq.",
      footerCatalogHead: "Catalog", footerAllReferences: "All references", footerExtractive: "Extractive surgery",
      footerCompanyHead: "Company",
      legalLine: "Tammuz Global Medical — B2B dental supply, Turkey & Iraq.",
      legalPrices: "Prices on request. Product data published by AsaDental.",
    },
    dentition: { permanent: "Permanent teeth", primary: "Primary (baby) teeth" },
    systems: { fdi: "FDI / ISO", universal: "Universal", palmer: "Palmer" },
    systemNotes: {
      fdi: "Two digits: quadrant then position, e.g. 16.",
      universal: "1–32 for permanent, A–T for primary.",
      palmer: "Position plus a quadrant bracket, e.g. 6┘ or UR6.",
    },
    input: {
      legend: "Convert a number you already have",
      label: "I have this number in",
      placeholder: "e.g. 16",
      invalid: "Not a valid tooth in that system.",
      clear: "Clear",
    },
    chart: {
      groupLabel: "Dental arch chart, FDI numbering",
      upper: "Upper arch", lower: "Lower arch",
      hint: "Left and right are the patient's own left and right, as you face them.",
    },
    result: {
      heading: "Selected tooth", arch: "Arch", side: "Side", quadrant: "Quadrant",
      toothName: "Tooth", prompt: "Click a tooth on the chart, or type a number above.",
    },
    values: { upper: "Upper", lower: "Lower", right: "Right", left: "Left" },
    faqEyebrow: "Reference",
    faqHeading: "About the three numbering systems",
    faq: [
      { q: "What is FDI tooth numbering?", a: "FDI notation, standardised as ISO 3950, uses two digits. The first is the quadrant — 1 upper right, 2 upper left, 3 lower left, 4 lower right for permanent teeth, and 5 to 8 in the same order for primary teeth. The second digit counts outward from the midline, 1 to 8. So 16 is the upper right first molar. It is the system used across Europe, Turkey and most of the world." },
      { q: "What is Universal tooth numbering?", a: "The Universal system, used mainly in the United States, numbers permanent teeth 1 to 32 in one continuous sweep: 1 is the upper right third molar, 16 the upper left third molar, 17 the lower left third molar, and 32 the lower right third molar. Primary teeth use letters A to T on the same path." },
      { q: "What is Palmer notation?", a: "Palmer notation gives the tooth its position number, 1 to 8, together with a bracket showing which quadrant it belongs to as you face the patient. Upper right teeth take a bracket opening to the upper left, and so on around the mouth. Primary teeth use letters A to E instead of numbers. It is still common in orthodontics and in the UK." },
      { q: "Why does 16 mean two different teeth?", a: "Because the systems overlap numerically. In FDI, 16 is the upper right first molar. In Universal, 16 is the upper left third molar. That is why this converter asks which system your number is in rather than guessing — a wrong guess would give you the wrong tooth." },
      { q: "How do primary teeth differ?", a: "Primary dentition has 20 teeth rather than 32, with no premolars. FDI uses quadrants 5 to 8 with positions 1 to 5, Universal uses letters A to T, and Palmer uses letters A to E with the same quadrant brackets. Switch the toggle above to work in primary numbering." },
    ],
    cta: { question: "Sourcing instruments for your clinic in Turkey or Iraq?", button: "Request a quote" },
    toothName: tooth => {
      const table = tooth.dentition === "permanent" ? EN_PERMANENT : EN_PRIMARY;
      const arch = tooth.arch === "upper" ? "Upper" : "Lower";
      const side = tooth.side === "right" ? "right" : "left";
      const primary = tooth.dentition === "primary" ? "primary " : "";
      return `${arch} ${side} ${primary}${table[tooth.position].name}`;
    },
  },

  TR: {
    meta: {
      title: "Diş Numaralandırma Çevirici — FDI ↔ Universal ↔ Palmer | Tammuz Medical",
      description:
        "FDI (ISO 3950), Universal ve Palmer diş numaralandırma sistemleri arasında anında çeviri yapın. Dişe tıklayın veya elinizdeki numarayı yazın. Sürekli ve süt dişleri için tam referans.",
    },
    shell: {
      eyebrow: "Ücretsiz klinik araç", title: "Diş numaralandırma çevirici",
      lede: "Üç diş numaralandırma sistemi arasında çeviri yapın — FDI (ISO 3950), Universal ve Palmer. Şemadan bir dişe tıklayın veya elinizdeki numarayı yazıp diğer ikisini görün.",
      home: "Ana sayfa", tools: "Araçlar", catalog: "Katalog", contact: "İletişim", manufacturers: "Üreticiler",
      navLabel: "Araçlar",
      footerBlurb: "Türkiye ve Irak'taki klinikler, distribütörler ve satın alma ekipleri için Avrupa dental aletleri.",
      footerCatalogHead: "Katalog", footerAllReferences: "Tüm referanslar", footerExtractive: "Çekim cerrahisi",
      footerCompanyHead: "Kurumsal",
      legalLine: "Tammuz Global Medical — Türkiye ve Irak için B2B dental tedarik.",
      legalPrices: "Fiyatlar talep üzerine. Ürün verileri AsaDental tarafından yayımlanmıştır.",
    },
    dentition: { permanent: "Sürekli dişler", primary: "Süt dişleri" },
    systems: { fdi: "FDI / ISO", universal: "Universal", palmer: "Palmer" },
    systemNotes: {
      fdi: "İki hane: çeyrek ve sıra, örn. 16.",
      universal: "Sürekli dişlerde 1–32, süt dişlerinde A–T.",
      palmer: "Sıra numarası ve çeyrek işareti, örn. 6┘ veya UR6.",
    },
    input: {
      legend: "Elinizdeki numarayı çevirin",
      label: "Numaram şu sistemde",
      placeholder: "örn. 16",
      invalid: "Bu sistemde geçerli bir diş değil.",
      clear: "Temizle",
    },
    chart: {
      groupLabel: "Diş arkı şeması, FDI numaralandırması",
      upper: "Üst çene", lower: "Alt çene",
      hint: "Sağ ve sol, karşısında durduğunuz hastanın kendi sağı ve soludur.",
    },
    result: {
      heading: "Seçilen diş", arch: "Çene", side: "Taraf", quadrant: "Çeyrek",
      toothName: "Diş", prompt: "Şemadan bir dişe tıklayın veya yukarıya numara yazın.",
    },
    values: { upper: "Üst", lower: "Alt", right: "Sağ", left: "Sol" },
    faqEyebrow: "Referans",
    faqHeading: "Üç numaralandırma sistemi hakkında",
    faq: [
      { q: "FDI diş numaralandırması nedir?", a: "ISO 3950 ile standartlaştırılan FDI sistemi iki hane kullanır. İlk hane çeyreği gösterir — sürekli dişlerde 1 üst sağ, 2 üst sol, 3 alt sol, 4 alt sağ; süt dişlerinde aynı sırayla 5'ten 8'e. İkinci hane orta hattan dışa doğru 1'den 8'e sayar. Yani 16, üst sağ birinci büyük azıdır. Avrupa'da, Türkiye'de ve dünyanın büyük bölümünde kullanılan sistemdir." },
      { q: "Universal diş numaralandırması nedir?", a: "Ağırlıkla Amerika Birleşik Devletleri'nde kullanılan Universal sistem, sürekli dişleri kesintisiz biçimde 1'den 32'ye numaralandırır: 1 üst sağ yirmi yaş dişi, 16 üst sol yirmi yaş dişi, 17 alt sol yirmi yaş dişi ve 32 alt sağ yirmi yaş dişidir. Süt dişleri aynı güzergâhta A'dan T'ye harflerle gösterilir." },
      { q: "Palmer notasyonu nedir?", a: "Palmer notasyonu, dişin 1–8 arası sıra numarasını, hastaya baktığınızda hangi çeyreğe ait olduğunu gösteren bir köşe işaretiyle birlikte verir. Üst sağ dişler sol üste açılan bir işaret alır ve ağız boyunca bu düzen devam eder. Süt dişlerinde rakam yerine A–E harfleri kullanılır. Ortodontide ve Birleşik Krallık'ta hâlâ yaygındır." },
      { q: "16 neden iki farklı diş anlamına geliyor?", a: "Çünkü sistemler sayısal olarak örtüşür. FDI'da 16 üst sağ birinci büyük azıdır. Universal'da 16 üst sol yirmi yaş dişidir. Bu araç, numaranızın hangi sistemde olduğunu tahmin etmek yerine size sormasının nedeni budur — yanlış tahmin yanlış dişi verirdi." },
      { q: "Süt dişlerinde ne değişir?", a: "Süt dişlenmesinde 32 değil 20 diş bulunur ve küçük azı yoktur. FDI 5–8 çeyreklerini ve 1–5 sıralarını, Universal A–T harflerini, Palmer ise aynı çeyrek işaretleriyle A–E harflerini kullanır. Süt dişi numaralandırmasına geçmek için yukarıdaki seçeneği değiştirin." },
    ],
    cta: { question: "Türkiye veya Irak'taki kliniğiniz için alet mi tedarik ediyorsunuz?", button: "Teklif isteyin" },
    toothName: tooth => {
      const table = tooth.dentition === "permanent" ? TR_PERMANENT : TR_PRIMARY;
      const arch = tooth.arch === "upper" ? "Üst" : "Alt";
      const side = tooth.side === "right" ? "sağ" : "sol";
      return `${arch} ${side} ${table[tooth.position].name}`;
    },
  },

  AR: {
    meta: {
      title: "محوّل ترقيم الأسنان — FDI ↔ Universal ↔ Palmer | Tammuz Medical",
      description:
        "حوّل فوراً بين أنظمة ترقيم الأسنان FDI (ISO 3950) وUniversal وPalmer. اضغط على السن أو اكتب الرقم الذي لديك. يشمل الأسنان الدائمة واللبنية مع مخطّط مرجعي كامل.",
    },
    shell: {
      eyebrow: "أداة سريرية مجانية", title: "محوّل ترقيم الأسنان",
      lede: "حوّل بين أنظمة ترقيم الأسنان الثلاثة — FDI (ISO 3950) وUniversal وPalmer. اضغط على سنّ في المخطّط، أو اكتب الرقم الذي لديك لتقرأ النظامين الآخرين.",
      home: "الرئيسية", tools: "الأدوات", catalog: "الكتالوج", contact: "تواصل معنا", manufacturers: "المصنّعون",
      navLabel: "الأدوات",
      footerBlurb: "أدوات أسنان أوروبية للعيادات والموزّعين وفرق المشتريات في تركيا والعراق.",
      footerCatalogHead: "الكتالوج", footerAllReferences: "جميع المراجع", footerExtractive: "جراحة القلع",
      footerCompanyHead: "الشركة",
      legalLine: "Tammuz Global Medical — توريد مستلزمات طب الأسنان بين الشركات، تركيا والعراق.",
      legalPrices: "الأسعار عند الطلب. بيانات المنتجات منشورة من AsaDental.",
    },
    dentition: { permanent: "الأسنان الدائمة", primary: "الأسنان اللبنية" },
    systems: { fdi: "FDI / ISO", universal: "Universal", palmer: "Palmer" },
    systemNotes: {
      fdi: "رقمان: الربع ثم الموضع، مثل 16.",
      universal: "من 1 إلى 32 للدائمة، ومن A إلى T للبنية.",
      palmer: "رقم الموضع مع قوس الربع، مثل ‎6┘‎ أو UR6.",
    },
    input: {
      legend: "حوّل رقماً لديك",
      label: "الرقم لديّ بنظام",
      placeholder: "مثال: 16",
      invalid: "ليس سنّاً صالحاً في هذا النظام.",
      clear: "مسح",
    },
    chart: {
      groupLabel: "مخطّط قوس الأسنان بترقيم FDI",
      upper: "الفك العلوي", lower: "الفك السفلي",
      hint: "اليمين واليسار من منظور المريض نفسه وأنت تقف أمامه.",
    },
    result: {
      heading: "السن المحدّد", arch: "الفك", side: "الجهة", quadrant: "الربع",
      toothName: "السن", prompt: "اضغط على سنّ في المخطّط، أو اكتب رقماً في الأعلى.",
    },
    values: { upper: "علوي", lower: "سفلي", right: "يمين", left: "يسار" },
    faqEyebrow: "مرجع",
    faqHeading: "عن أنظمة الترقيم الثلاثة",
    faq: [
      { q: "ما هو ترقيم FDI؟", a: "نظام FDI، المعتمد كمواصفة ISO 3950، يستخدم رقمين. الأول يدل على الربع — 1 للعلوي الأيمن، 2 للعلوي الأيسر، 3 للسفلي الأيسر، 4 للسفلي الأيمن في الأسنان الدائمة، ومن 5 إلى 8 بالترتيب نفسه في الأسنان اللبنية. والرقم الثاني يَعُدّ من الخط المنصّف نحو الخارج من 1 إلى 8. فالرقم 16 يعني الرحى الأولى العلوية اليمنى. وهو النظام المستخدم في أوروبا وتركيا ومعظم دول العالم." },
      { q: "ما هو ترقيم Universal؟", a: "نظام Universal، المستخدم أساساً في الولايات المتحدة، يرقّم الأسنان الدائمة من 1 إلى 32 في مسار متصل: الرقم 1 لضرس العقل العلوي الأيمن، و16 لضرس العقل العلوي الأيسر، و17 لضرس العقل السفلي الأيسر، و32 لضرس العقل السفلي الأيمن. أمّا الأسنان اللبنية فتأخذ الحروف من A إلى T على المسار نفسه." },
      { q: "ما هو ترميز Palmer؟", a: "يعطي ترميز Palmer رقم موضع السن من 1 إلى 8 مع قوس يبيّن الربع الذي ينتمي إليه وأنت تواجه المريض. فالأسنان العلوية اليمنى تأخذ قوساً منفتحاً نحو الأعلى واليسار، وهكذا حول الفم. وتُستخدم الحروف من A إلى E بدل الأرقام في الأسنان اللبنية. ولا يزال شائعاً في تقويم الأسنان وفي المملكة المتحدة." },
      { q: "لماذا يدل الرقم 16 على سنّين مختلفين؟", a: "لأن الأنظمة تتداخل رقمياً. ففي FDI يعني 16 الرحى الأولى العلوية اليمنى، بينما يعني في Universal ضرس العقل العلوي الأيسر. ولهذا يسألك هذا المحوّل عن النظام الذي ينتمي إليه رقمك بدل التخمين — لأن التخمين الخاطئ يعطيك السن الخطأ." },
      { q: "ما الفرق في الأسنان اللبنية؟", a: "تضم الأسنان اللبنية 20 سنّاً بدل 32، ولا توجد فيها ضواحك. يستخدم FDI الأرباع من 5 إلى 8 والمواضع من 1 إلى 5، ويستخدم Universal الحروف من A إلى T، بينما يستخدم Palmer الحروف من A إلى E مع أقواس الأرباع نفسها. بدّل الخيار في الأعلى للعمل بترقيم الأسنان اللبنية." },
    ],
    cta: { question: "هل توفّر أدوات لعيادتك في تركيا أو العراق؟", button: "اطلب عرض سعر" },
    toothName: tooth => {
      const table = tooth.dentition === "permanent" ? AR_PERMANENT : AR_PRIMARY;
      const entry = table[tooth.position];
      const arch = AR_ARCH[entry.gender][tooth.arch];
      const side = AR_SIDE[entry.gender][tooth.side];
      const primary = tooth.dentition === "primary" ? ` ${AR_PRIMARY_ADJ[entry.gender]}` : "";
      return `${entry.name}${primary} ${arch} ${side}`;
    },
  },
};
