import type { SiteLocale } from "../../_lib/catalog";

/**
 * Copy for the extraction forceps selector, written natively in each language
 * rather than translated from the English. Arabic adjectives agree in gender
 * with the tooth noun, so tooth names carry their grammatical gender and the
 * label builder selects the matching form.
 */

type Gender = "m" | "f";
type ToothName = { name: string; gender: Gender };

export type ForcepsStrings = {
  meta: { title: string; description: string };
  shell: {
    eyebrow: string; title: string; lede: string;
    home: string; tools: string; catalog: string; contact: string; manufacturers: string;
    navLabel: string; footerBlurb: string;
    footerCatalogHead: string; footerAllReferences: string; footerExtractive: string;
    footerCompanyHead: string; legalLine: string; legalPrices: string;
  };
  chart: { groupLabel: string; upperArch: string; lowerArch: string; hint: string };
  filters: { roots: string; children: string; asalady: string };
  results: {
    prompt: string; rootSuffix: string;
    countOne: string; countMany: string;
    noMatch: (group: string) => string;
  };
  groupLabels: { incisors_canines: string; premolars: string; molars: string; wisdom_teeth: string; roots: string };
  spec: { length: string; tips: string; beaks: string; serrated: string; nonSerrated: string; open: string; closed: string };
  link: string;
  asaladyTag: string;
  disclaimer: (count: number) => string;
  cta: { question: string; button: string };
  faqHeading: string; faqEyebrow: string;
  faq: { q: string; a: string }[];
  toothLabel: (fdi: number) => string;
};

/** Second FDI digit → tooth. Shared shape across locales; wording differs. */
const EN_TEETH: Record<number, ToothName> = {
  1: { name: "central incisor", gender: "m" }, 2: { name: "lateral incisor", gender: "m" },
  3: { name: "canine", gender: "m" }, 4: { name: "first premolar", gender: "m" },
  5: { name: "second premolar", gender: "m" }, 6: { name: "first molar", gender: "m" },
  7: { name: "second molar", gender: "m" }, 8: { name: "third molar", gender: "m" },
};

const TR_TEETH: Record<number, ToothName> = {
  1: { name: "santral kesici", gender: "m" }, 2: { name: "lateral kesici", gender: "m" },
  3: { name: "kanin", gender: "m" }, 4: { name: "birinci küçük azı", gender: "m" },
  5: { name: "ikinci küçük azı", gender: "m" }, 6: { name: "birinci büyük azı", gender: "m" },
  7: { name: "ikinci büyük azı", gender: "m" }, 8: { name: "yirmi yaş dişi", gender: "m" },
};

const AR_TEETH: Record<number, ToothName> = {
  1: { name: "القاطع المركزي", gender: "m" }, 2: { name: "القاطع الجانبي", gender: "m" },
  3: { name: "الناب", gender: "m" }, 4: { name: "الضاحك الأول", gender: "m" },
  5: { name: "الضاحك الثاني", gender: "m" }, 6: { name: "الرحى الأولى", gender: "f" },
  7: { name: "الرحى الثانية", gender: "f" }, 8: { name: "ضرس العقل", gender: "m" },
};

function quadrant(fdi: number) {
  const q = Math.floor(fdi / 10);
  return { upper: q === 1 || q === 2, right: q === 1 || q === 4, position: fdi % 10 };
}

const AR_ARCH = { m: { upper: "العلوي", lower: "السفلي" }, f: { upper: "العلوية", lower: "السفلية" } };
const AR_SIDE = { m: { right: "الأيمن", left: "الأيسر" }, f: { right: "اليمنى", left: "اليسرى" } };

export const forcepsStrings: Record<SiteLocale, ForcepsStrings> = {
  EN: {
    meta: {
      title: "Extraction Forceps Selector — Find the Right Forceps by Tooth | Tammuz Medical",
      description:
        "Click a tooth to see which AsaDental extraction forceps are designed for it. Covers upper and lower arches, retained roots, wisdom teeth and paediatric patterns, with serration and beak data.",
    },
    shell: {
      eyebrow: "Free clinical tool", title: "Extraction forceps selector",
      lede: "Click the tooth you are extracting and see which AsaDental forceps patterns are designed for that position — arch, tooth group, side, serration and beak configuration, taken from the manufacturer's published range-of-application data.",
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
      upperArch: "Upper arch", lowerArch: "Lower arch",
      hint: "Numbers follow FDI notation. Left and right are the patient's own left and right.",
    },
    filters: { roots: "Retained root", children: "Paediatric", asalady: "AsaLady handle" },
    results: {
      prompt: "Select a tooth above to see the extraction forceps designed for it.",
      rootSuffix: " — retained root",
      countOne: "instrument", countMany: "instruments",
      noMatch: group =>
        `No instrument in the current dataset is indicated for a ${group} in this position with these filters. Send us the tooth and procedure and we will identify the pattern for you.`,
    },
    groupLabels: {
      incisors_canines: "incisor or canine", premolars: "premolar", molars: "molar",
      wisdom_teeth: "wisdom tooth", roots: "retained root",
    },
    spec: { length: "Length", tips: "Tips", beaks: "Beaks at rest", serrated: "Serrated", nonSerrated: "Non-serrated", open: "Open", closed: "Closed" },
    link: "View details & request a quote →",
    asaladyTag: "AsaLady",
    disclaimer: count =>
      `This selector reflects AsaDental's published range-of-application data for ${count} extraction instruments. It is a product-matching aid for procurement, not clinical advice — instrument choice remains the clinician's judgement.`,
    cta: { question: "Need a full extraction setup quoted for your clinic?", button: "Request a quote" },
    faqEyebrow: "How the selector works",
    faqHeading: "Questions dentists ask about forceps selection",
    faq: [
      { q: "How do I know which extraction forceps to use?", a: "Extraction forceps are designed around three things: the arch, the tooth group (incisor and canine, premolar, molar, wisdom tooth, or retained root), and for many molar patterns the side, because the beaks are shaped to engage the buccal furcation. Select the tooth above and the tool filters AsaDental's range to the patterns indicated for that position." },
      { q: "Why do some forceps show left and right versions?", a: "Upper molars have two buccal roots and one palatal root, so the beaks are asymmetric — one engages the buccal furcation while the other stays smooth for the palatal surface. That makes the instrument handed, which is why patterns such as 0100-22L and 0100-22R exist as a pair. Instruments with no side listed are not handed and work on either side." },
      { q: "What does serrated versus non-serrated mean?", a: "Serrated beaks grip a crown or root surface more securely and are generally preferred where the tooth is sound. Non-serrated beaks are gentler on the root surface. AsaDental publishes this per pattern; where the catalogue and the manufacturer's product page disagree, we show nothing rather than guess." },
      { q: "What does 'beaks open at rest' mean?", a: "It describes the resting position of the working ends when no pressure is applied. Patterns with beaks open at rest sit ready around the tooth and are common for molars; closed-at-rest patterns are typical of narrower root and incisor forceps." },
      { q: "What is an AsaLady handle?", a: "AsaLady patterns — codes beginning with W or SW — have smaller, lighter handles with reduced finger holes, designed for smaller hands. The working ends match the standard pattern of the same number." },
      { q: "Can I order these instruments in Iraq or Turkey?", a: "Yes. Tammuz Global Medical supplies AsaDental instruments to clinics, distributors and procurement teams across Turkey and Iraq. Prices are quoted per order — choose the instruments you need and send us the item codes." },
    ],
    toothLabel: fdi => {
      const { upper, right, position } = quadrant(fdi);
      return `${upper ? "Upper" : "Lower"} ${right ? "right" : "left"} ${EN_TEETH[position].name}`;
    },
  },

  TR: {
    meta: {
      title: "Diş Çekme Davyesi Seçici — Dişe Göre Doğru Davye | Tammuz Medical",
      description:
        "Çekeceğiniz dişe tıklayın, o pozisyon için tasarlanmış AsaDental çekme davyelerini görün. Üst ve alt çene, kalıntı kök, yirmi yaş dişi ve çocuk davyeleri; tırtık ve uç konumu bilgisiyle.",
    },
    shell: {
      eyebrow: "Ücretsiz klinik araç", title: "Diş çekme davyesi seçici",
      lede: "Çekeceğiniz dişe tıklayın ve o pozisyon için tasarlanmış AsaDental davye modellerini görün — çene, diş grubu, taraf, tırtık durumu ve uçların istirahat konumu, üreticinin yayımladığı kullanım alanı verisinden alınmıştır.",
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
      upperArch: "Üst çene", lowerArch: "Alt çene",
      hint: "Numaralar FDI sistemine göredir. Sağ ve sol, hastanın kendi sağı ve soludur.",
    },
    filters: { roots: "Kalıntı kök", children: "Çocuk", asalady: "AsaLady sap" },
    results: {
      prompt: "Bu pozisyon için tasarlanmış davyeleri görmek üzere yukarıdan bir diş seçin.",
      rootSuffix: " — kalıntı kök",
      countOne: "alet", countMany: "alet",
      noMatch: group =>
        `Mevcut veri setinde bu pozisyondaki ${group} için bu filtrelerle uygun alet bulunmuyor. Dişi ve işlemi bize bildirin, uygun modeli sizin için belirleyelim.`,
    },
    groupLabels: {
      incisors_canines: "kesici veya kanin", premolars: "küçük azı", molars: "büyük azı",
      wisdom_teeth: "yirmi yaş dişi", roots: "kalıntı kök",
    },
    spec: { length: "Uzunluk", tips: "Uçlar", beaks: "İstirahat konumu", serrated: "Tırtıklı", nonSerrated: "Tırtıksız", open: "Açık", closed: "Kapalı" },
    link: "Ayrıntılar ve teklif talebi →",
    asaladyTag: "AsaLady",
    disclaimer: count =>
      `Bu seçici, AsaDental'in ${count} çekim aleti için yayımladığı kullanım alanı verisine dayanır. Satın alma sürecinde ürün eşleştirme amaçlıdır; klinik tavsiye değildir — alet seçimi hekimin kararındadır.`,
    cta: { question: "Kliniğiniz için komple çekim seti teklifi ister misiniz?", button: "Teklif isteyin" },
    faqEyebrow: "Seçici nasıl çalışır",
    faqHeading: "Davye seçimi hakkında sık sorulanlar",
    faq: [
      { q: "Hangi çekme davyesini kullanacağımı nasıl bilirim?", a: "Çekme davyeleri üç unsura göre tasarlanır: çene (üst veya alt), diş grubu (kesici ve kanin, küçük azı, büyük azı, yirmi yaş dişi veya kalıntı kök) ve birçok büyük azı modelinde taraf — çünkü uçlar bukkal furkasyonu kavrayacak biçimde şekillendirilmiştir. Yukarıdan dişi seçtiğinizde araç, AsaDental serisini o pozisyon için endike modellere göre filtreler." },
      { q: "Neden bazı davyelerin sağ ve sol versiyonu var?", a: "Üst büyük azıların iki bukkal, bir palatinal kökü vardır; bu nedenle uçlar asimetriktir — biri bukkal furkasyonu kavrarken diğeri palatinal yüzey için düz kalır. Bu da aleti tarafa özgü kılar; 0100-22L ve 0100-22R gibi modeller bu yüzden çift olarak bulunur. Taraf belirtilmeyen aletler her iki tarafta da kullanılabilir." },
      { q: "Tırtıklı ve tırtıksız uç ne anlama gelir?", a: "Tırtıklı uçlar kron veya kök yüzeyini daha güvenli kavrar ve diş sağlamken genellikle tercih edilir. Tırtıksız uçlar kök yüzeyine daha naziktir. AsaDental bu bilgiyi model bazında yayımlar; katalog ile üreticinin ürün sayfası çeliştiğinde tahmin yürütmek yerine bu alanı boş bırakıyoruz." },
      { q: "\"Uçlar istirahatte açık\" ne demek?", a: "Baskı uygulanmadığında çalışan uçların duruşunu tanımlar. İstirahatte açık modeller dişin çevresine hazır oturur ve büyük azılarda yaygındır; kapalı modeller ise dar kök ve kesici davyelerinde tipiktir." },
      { q: "AsaLady sap nedir?", a: "AsaLady modelleri — kodu W veya SW ile başlayanlar — daha küçük ve hafif saplara, daraltılmış parmak halkalarına sahiptir ve küçük eller için tasarlanmıştır. Çalışan uçlar aynı numaralı standart modelle aynıdır." },
      { q: "Bu aletleri Irak veya Türkiye'de sipariş edebilir miyim?", a: "Evet. Tammuz Global Medical, AsaDental aletlerini Türkiye ve Irak genelindeki kliniklere, distribütörlere ve satın alma ekiplerine tedarik eder. Fiyatlar siparişe göre verilir — ihtiyacınız olan aletleri seçip ürün kodlarını bize gönderin." },
    ],
    toothLabel: fdi => {
      const { upper, right, position } = quadrant(fdi);
      return `${upper ? "Üst" : "Alt"} ${right ? "sağ" : "sol"} ${TR_TEETH[position].name}`;
    },
  },

  AR: {
    meta: {
      title: "أداة اختيار كلاّبات القلع — اختر الكلاّبة المناسبة حسب السن | Tammuz Medical",
      description:
        "اضغط على السن المراد قلعه لعرض كلاّبات القلع من AsaDental المصمّمة له. تشمل الفكين العلوي والسفلي والجذور المتبقية وأضراس العقل وكلاّبات الأطفال، مع بيانات التسنين ووضع الفكين.",
    },
    shell: {
      eyebrow: "أداة سريرية مجانية", title: "أداة اختيار كلاّبات القلع",
      lede: "اضغط على السن المراد قلعه لترى نماذج كلاّبات AsaDental المصمّمة لهذا الموضع — الفك ومجموعة الأسنان والجهة والتسنين ووضع الفكين عند الراحة، وفق بيانات نطاق الاستخدام المنشورة من الشركة المصنّعة.",
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
      upperArch: "الفك العلوي", lowerArch: "الفك السفلي",
      hint: "الأرقام وفق نظام FDI. اليمين واليسار من منظور المريض نفسه.",
    },
    filters: { roots: "جذر متبقٍ", children: "أطفال", asalady: "مقبض AsaLady" },
    results: {
      prompt: "اختر سنّاً من الأعلى لعرض كلاّبات القلع المصمّمة له.",
      rootSuffix: " — جذر متبقٍ",
      countOne: "أداة", countMany: "أدوات",
      noMatch: group =>
        `لا توجد أداة في البيانات الحالية مخصّصة لـ${group} في هذا الموضع بهذه الفلاتر. أرسل لنا السن والإجراء وسنحدّد لك النموذج المناسب.`,
    },
    groupLabels: {
      incisors_canines: "قاطع أو ناب", premolars: "ضاحك", molars: "رحى",
      wisdom_teeth: "ضرس عقل", roots: "جذر متبقٍ",
    },
    spec: { length: "الطول", tips: "الأطراف", beaks: "وضع الفكين عند الراحة", serrated: "مسنّنة", nonSerrated: "غير مسنّنة", open: "مفتوح", closed: "مغلق" },
    link: "التفاصيل وطلب عرض سعر ←",
    asaladyTag: "AsaLady",
    disclaimer: count =>
      `تعتمد هذه الأداة على بيانات نطاق الاستخدام المنشورة من AsaDental لعدد ${count} أداة قلع. وهي وسيلة لمطابقة المنتجات لأغراض الشراء وليست استشارة سريرية — يبقى اختيار الأداة من مسؤولية الطبيب.`,
    cta: { question: "هل تحتاج عرض سعر لطقم قلع متكامل لعيادتك؟", button: "اطلب عرض سعر" },
    faqEyebrow: "كيف تعمل الأداة",
    faqHeading: "أسئلة شائعة حول اختيار كلاّبات القلع",
    faq: [
      { q: "كيف أعرف أي كلاّبة قلع أستخدم؟", a: "تُصمَّم كلاّبات القلع وفق ثلاثة عوامل: الفك، ومجموعة الأسنان (قاطع وناب، ضاحك، رحى، ضرس عقل، أو جذر متبقٍ)، والجهة في كثير من نماذج الأرحاء لأن الفكين مشكَّلان لاحتضان التفرّع الجذري الدهليزي. اختر السن من الأعلى لتصفية سلسلة AsaDental على النماذج المخصّصة لهذا الموضع." },
      { q: "لماذا توجد نسخ يمنى ويسرى لبعض الكلاّبات؟", a: "للأرحاء العلوية جذران دهليزيان وجذر حنكي واحد، لذلك يكون الفكان غير متماثلين — أحدهما يحتضن التفرّع الجذري الدهليزي بينما يبقى الآخر أملس للسطح الحنكي. هذا يجعل الأداة مخصّصة لجهة بعينها، ولذلك توجد نماذج مثل 0100-22L و0100-22R كزوج. أمّا الأدوات التي لا تُذكر لها جهة فهي صالحة للجهتين." },
      { q: "ما الفرق بين الأطراف المسنّنة وغير المسنّنة؟", a: "تمسك الأطراف المسنّنة سطح التاج أو الجذر بثبات أكبر، وتُفضَّل عادةً عندما يكون السن سليماً. أمّا غير المسنّنة فهي ألطف على سطح الجذر. تنشر AsaDental هذه المعلومة لكل نموذج؛ وعند اختلاف الكتالوج عن صفحة المنتج لدى الشركة المصنّعة نترك الحقل فارغاً بدل التخمين." },
      { q: "ماذا يعني «الفكان مفتوحان عند الراحة»؟", a: "يصف وضع الطرفين العاملين عند عدم تطبيق أي ضغط. النماذج المفتوحة عند الراحة تستقر جاهزة حول السن وهي شائعة للأرحاء، بينما النماذج المغلقة معتادة في كلاّبات الجذور الضيقة والقواطع." },
      { q: "ما هو مقبض AsaLady؟", a: "نماذج AsaLady — وهي الرموز التي تبدأ بحرف W أو SW — لها مقابض أصغر وأخف مع حلقات أصابع مصغّرة، مصمّمة لليد الصغيرة. أمّا الأطراف العاملة فمطابقة للنموذج القياسي الذي يحمل الرقم نفسه." },
      { q: "هل يمكنني طلب هذه الأدوات في العراق أو تركيا؟", a: "نعم. توفّر Tammuz Global Medical أدوات AsaDental للعيادات والموزّعين وفرق المشتريات في تركيا والعراق. تُقدَّم الأسعار حسب الطلب — اختر الأدوات التي تحتاجها وأرسل لنا رموز المنتجات." },
    ],
    toothLabel: fdi => {
      const { upper, right, position } = quadrant(fdi);
      const tooth = AR_TEETH[position];
      const arch = AR_ARCH[tooth.gender][upper ? "upper" : "lower"];
      const side = AR_SIDE[tooth.gender][right ? "right" : "left"];
      return `${tooth.name} ${arch} ${side}`;
    },
  },
};
