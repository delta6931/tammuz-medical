import type { SiteLocale } from "../../_lib/catalog";
import type { ToolShellLabels } from "../../_components/ToolShell";
import type { EndoColour } from "../_lib/endo-sizing";
import { toolsIndexStrings } from "./tools-index";

export type EndoChartStrings = {
  meta: { title: string; description: string }; shell: ToolShellLabels;
  chartHeading: string; chartLede: string; size: string; colour: string; tip: string;
  colours: Record<EndoColour, string>;
  calculator: { heading: string; size: string; taper: string; distance: string; diameter: string; formula: string };
  caution: string; source: string; faqEyebrow: string; faqHeading: string; faq: { q: string; a: string }[];
  cta: { question: string; button: string };
};

export const endoChartStrings: Record<SiteLocale, EndoChartStrings> = {
  EN: {
    meta: { title: "ISO Endodontic File Size & Colour Chart | Tammuz Medical", description: "Reference ISO endodontic file sizes, handle colours and tip diameters, with a constant-taper diameter calculator." },
    shell: { ...toolsIndexStrings.EN.shell, eyebrow: "Free endodontic reference", title: "Endodontic file size and colour chart", lede: "Match common ISO file sizes to their colour and nominal tip diameter. For constant-taper instruments, calculate the diameter at any point along the 16 mm working portion." },
    chartHeading: "ISO size reference", chartLede: "The size number is the nominal tip diameter in hundredths of a millimetre.", size: "ISO size", colour: "Colour", tip: "Tip diameter",
    colours: { pink: "Pink", grey: "Grey", purple: "Purple", white: "White", yellow: "Yellow", red: "Red", blue: "Blue", green: "Green", black: "Black" },
    calculator: { heading: "Constant-taper calculator", size: "File size", taper: "Taper per mm", distance: "Distance from tip", diameter: "Calculated diameter", formula: "D(x) = tip diameter + taper × distance" },
    caution: "Use this calculator only for instruments with a stated constant taper. Proprietary, regressive, progressive or otherwise variable-taper files require the manufacturer’s own dimensions and instructions.", source: "Size and colour convention: ISO 3630-1 and official endodontic manufacturer catalogues.",
    faqEyebrow: "Reference", faqHeading: "Reading endodontic size and taper",
    faq: [
      { q: "What does ISO size 25 mean?", a: "It designates a nominal tip diameter of 0.25 mm. The same hundredths-of-a-millimetre relationship applies to the other standard size numbers." },
      { q: "Why do the colours repeat after size 40?", a: "The six-colour sequence white, yellow, red, blue, green and black repeats for larger standard sizes. Sizes 06, 08 and 10 use pink, grey and purple before that sequence." },
      { q: "What does a .04 taper mean?", a: "For a constant .04 taper, diameter increases by 0.04 mm for each millimetre from the tip. A size 25/.04 file is therefore 0.25 mm at the tip and 0.65 mm at 10 mm from the tip." },
    ], cta: { question: "Need endodontic instruments or a clinic set quoted?", button: "Request a quote" },
  },
  TR: {
    meta: { title: "ISO Endodontik Eğe Boyutu ve Renk Tablosu | Tammuz Medical", description: "ISO endodontik eğe boyutlarını, sap renklerini ve uç çaplarını görün; sabit koniklik için çap hesaplayın." },
    shell: { ...toolsIndexStrings.TR.shell, eyebrow: "Ücretsiz endodonti referansı", title: "Endodontik eğe boyutu ve renk tablosu", lede: "Yaygın ISO eğe boyutlarını renk ve nominal uç çapıyla eşleştirin. Sabit konik aletlerde 16 mm'lik çalışan bölümün herhangi bir noktasındaki çapı hesaplayın." },
    chartHeading: "ISO boyut referansı", chartLede: "Boyut numarası, milimetrenin yüzde biri cinsinden nominal uç çapıdır.", size: "ISO boyutu", colour: "Renk", tip: "Uç çapı",
    colours: { pink: "Pembe", grey: "Gri", purple: "Mor", white: "Beyaz", yellow: "Sarı", red: "Kırmızı", blue: "Mavi", green: "Yeşil", black: "Siyah" },
    calculator: { heading: "Sabit koniklik hesaplayıcı", size: "Eğe boyutu", taper: "Milimetre başına koniklik", distance: "Uçtan uzaklık", diameter: "Hesaplanan çap", formula: "D(x) = uç çapı + koniklik × uzaklık" },
    caution: "Bu hesaplayıcıyı yalnızca sabit konikliği belirtilen aletlerde kullanın. Tescilli, azalan, artan veya başka biçimde değişken konikliğe sahip eğelerde üreticinin ölçüleri ve kullanım talimatları geçerlidir.", source: "Boyut ve renk düzeni: ISO 3630-1 ve resmî endodontik üretici katalogları.",
    faqEyebrow: "Referans", faqHeading: "Endodontik boyut ve konikliği okumak",
    faq: [
      { q: "ISO 25 boyutu ne demektir?", a: "Nominal uç çapının 0,25 mm olduğunu gösterir. Milimetrenin yüzde biri ilişkisi diğer standart boyut numaraları için de geçerlidir." },
      { q: "Renkler 40 numaradan sonra neden tekrar eder?", a: "Beyaz, sarı, kırmızı, mavi, yeşil ve siyahtan oluşan altı renkli dizi daha büyük standart boyutlarda tekrar eder. 06, 08 ve 10 boyutları bu diziden önce pembe, gri ve mordur." },
      { q: ".04 koniklik ne demektir?", a: "Sabit .04 koniklikte çap, uçtan itibaren her milimetrede 0,04 mm artar. 25/.04 eğe uçta 0,25 mm, uçtan 10 mm uzakta ise 0,65 mm'dir." },
    ], cta: { question: "Endodontik alet veya klinik seti için teklif ister misiniz?", button: "Teklif isteyin" },
  },
  AR: {
    meta: { title: "جدول مقاسات وألوان مبارد الجذور ISO | Tammuz Medical", description: "مرجع لمقاسات مبارد الجذور وألوانها وأقطار رؤوسها وفق ISO، مع حاسبة قطر للتدرج الثابت." },
    shell: { ...toolsIndexStrings.AR.shell, eyebrow: "مرجع مجاني لعلاج الجذور", title: "جدول مقاسات وألوان مبارد الجذور", lede: "طابق مقاسات مبارد ISO الشائعة مع اللون والقطر الاسمي للرأس. واحسب قطر الأداة ذات التدرج الثابت عند أي نقطة من الجزء العامل بطول 16 مم." },
    chartHeading: "مرجع مقاسات ISO", chartLede: "يمثل رقم المقاس القطر الاسمي للرأس بأجزاء المئة من المليمتر.", size: "مقاس ISO", colour: "اللون", tip: "قطر الرأس",
    colours: { pink: "وردي", grey: "رمادي", purple: "بنفسجي", white: "أبيض", yellow: "أصفر", red: "أحمر", blue: "أزرق", green: "أخضر", black: "أسود" },
    calculator: { heading: "حاسبة التدرج الثابت", size: "مقاس المبرد", taper: "التدرج لكل مم", distance: "المسافة من الرأس", diameter: "القطر المحسوب", formula: "D(x) = قطر الرأس + التدرج × المسافة" },
    caution: "استخدم الحاسبة فقط للأدوات ذات التدرج الثابت المعلن. تتطلب المبارد ذات التدرج الخاص أو المتناقص أو المتزايد أو المتغير أبعاد المصنّع وتعليمات استخدامه.", source: "نظام المقاسات والألوان: ISO 3630-1 وكتالوجات رسمية لمصنّعي أدوات علاج الجذور.",
    faqEyebrow: "مرجع", faqHeading: "قراءة مقاس المبرد وتدرجه",
    faq: [
      { q: "ماذا يعني مقاس ISO 25؟", a: "يعني أن القطر الاسمي للرأس هو 0.25 مم. تنطبق علاقة أجزاء المئة من المليمتر نفسها على أرقام المقاسات القياسية الأخرى." },
      { q: "لماذا تتكرر الألوان بعد المقاس 40؟", a: "يتكرر تسلسل الألوان الستة: الأبيض ثم الأصفر فالأحمر فالأزرق فالأخضر فالأسود في المقاسات القياسية الأكبر. أما المقاسات 06 و08 و10 فألوانها الوردي والرمادي والبنفسجي." },
      { q: "ماذا يعني التدرج .04؟", a: "في التدرج الثابت .04 يزداد القطر 0.04 مم لكل مليمتر بعيداً عن الرأس. لذلك يكون مبرد 25/.04 بقطر 0.25 مم عند الرأس و0.65 مم على بعد 10 مم." },
    ], cta: { question: "هل تحتاج عرض سعر لأدوات علاج الجذور أو طقم عيادة؟", button: "اطلب عرض سعر" },
  },
};
