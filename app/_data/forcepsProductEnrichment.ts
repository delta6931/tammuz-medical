/**
 * Product-page presentation layer for the approved 186-forceps data slice.
 *
 * Facts come from the compact projection generated from
 * data/asadental/derived/forceps-enriched.json. English, Turkish and Arabic
 * copy are composed independently so the pages are not translations of one
 * master template. The three approved review samples remain exact overrides.
 */
import forcepsFactsJson from "./forcepsProductFacts.json";
import confirmedLengthsJson from "../../data/asadental/overrides/confirmed-lengths.json";
import {
  forcepsOverallLengthMm as approvedSampleLength,
  forcepsProductSamples,
  localizedOverallLength,
  type ForcepsSampleLocale,
  type SampleCopy,
} from "./forcepsProductSamples";

type Arch = "upper" | "lower";
type ToothGroup = "incisors_canines" | "premolars" | "molars" | "roots" | "wisdom_teeth";
type Side = "left" | "right";
type Serration = "serrated" | "non_serrated" | null;
type RestPosition = "open" | "closed" | null;

type ForcepsFact = {
  sku: string;
  subcategory: string;
  patternCode: string | null;
  patternName: string | null;
  handleVariant: "standard" | "asalady" | null;
  handleFeatures: string[];
  serration: Serration;
  beaksAtRest: RestPosition;
  arches: Arch[];
  toothGroups: ToothGroup[];
  sides: Side[];
  patientGroups: Array<"children" | "unspecified">;
  qualifiers: string[];
  lengthMm: number | null;
  materialName: string | null;
  singleUse: boolean | null;
  sterilizable: boolean | null;
  maxTemperatureC: number | null;
  relatedSkus: string[];
};

type ConfirmedLengthOverride = {
  valueMm: number;
  tolerancePlusMinusMm?: number | null;
};

export type ForcepsPageEnrichment = {
  sku: string;
  copy: Record<ForcepsSampleLocale, SampleCopy>;
  relationships: Array<{
    sku: string;
    kind: "official_similar_product" | "official_set_member";
  }>;
  overallLengthMm?: number;
  hasHandlingFacts: boolean;
};

const facts = (forcepsFactsJson as { records: ForcepsFact[] }).records;
const confirmedLengths = confirmedLengthsJson as { overrides: Record<string, ConfirmedLengthOverride> };

function variant(sku: string, count: number) {
  return [...sku].reduce((total, character) => total + character.charCodeAt(0), 0) % count;
}

function joinEnglish(items: string[]) {
  if (items.length < 2) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function joinTurkish(items: string[]) {
  if (items.length < 2) return items[0] || "";
  return `${items.slice(0, -1).join(", ")} ve ${items.at(-1)}`;
}

function joinArabic(items: string[]) {
  return items.join(" و");
}

const enGroups: Record<ToothGroup, string> = {
  incisors_canines: "incisors and canines",
  premolars: "premolars",
  molars: "molars",
  roots: "roots",
  wisdom_teeth: "wisdom teeth",
};

const trGroups: Record<ToothGroup, string> = {
  incisors_canines: "kesici ve kanin dişler",
  premolars: "premolarlar",
  molars: "molarlar",
  roots: "kökler",
  wisdom_teeth: "yirmi yaş dişleri",
};

const arGroups: Record<ToothGroup, string> = {
  incisors_canines: "القواطع والأنياب",
  premolars: "الضواحك",
  molars: "الأضراس",
  roots: "الجذور",
  wisdom_teeth: "أضراس العقل",
};

function enApplication(record: ForcepsFact) {
  const groups = joinEnglish(record.toothGroups.map(group => enGroups[group]));
  if (!record.arches.length) return groups || "the documented root-fragment application";
  const arch = record.arches.length === 2 ? "upper and lower" : record.arches[0];
  if (!groups && record.patientGroups.includes("children")) return `${arch} arch`;
  const side = record.sides[0] ? `-${record.sides[0]}` : "";
  return `${arch}${side} ${groups}`;
}

function trApplication(record: ForcepsFact) {
  const groups = joinTurkish(record.toothGroups.map(group => trGroups[group]));
  if (!record.arches.length) return groups || "belgelenmiş kök parçası uygulaması";
  const arch = record.arches.length === 2 ? "üst ve alt çenedeki" : record.arches[0] === "upper" ? "üst çenedeki" : "alt çenedeki";
  if (!groups && record.patientGroups.includes("children")) return record.arches.length === 2 ? "üst ve alt çene" : record.arches[0] === "upper" ? "üst çene" : "alt çene";
  const side = record.sides[0] === "left" ? "sol " : record.sides[0] === "right" ? "sağ " : "";
  return `${arch} ${side}${groups}`;
}

function arApplication(record: ForcepsFact) {
  const groups = joinArabic(record.toothGroups.map(group => arGroups[group]));
  if (!record.arches.length) return groups || "الاستخدام الموثق لشظايا الجذور";
  const arch = record.arches.length === 2 ? "في الفكين العلوي والسفلي" : record.arches[0] === "upper" ? "في الفك العلوي" : "في الفك السفلي";
  if (!groups && record.patientGroups.includes("children")) return record.arches.length === 2 ? "الفكين العلوي والسفلي" : record.arches[0] === "upper" ? "الفك العلوي" : "الفك السفلي";
  const side = record.sides[0] === "left" ? " من الجهة اليسرى" : record.sides[0] === "right" ? " من الجهة اليمنى" : "";
  return `${groups} ${arch}${side}`;
}

function englishCopy(record: ForcepsFact): SampleCopy {
  const application = enApplication(record);
  const pattern = record.patternName ? `${record.patternCode} ${record.patternName}` : record.patternCode || record.sku;
  const child = record.patientGroups.includes("children");
  const title = `${child ? "Children's p" : "P"}attern ${pattern} extraction forceps for ${application}`;
  const designFacts = [
    record.serration === "serrated" ? "serrated tips" : record.serration === "non_serrated" ? "non-serrated tips" : null,
    record.beaksAtRest === "open" ? "beaks open at rest" : record.beaksAtRest === "closed" ? "beaks closed at rest" : null,
    record.handleVariant === "asalady" ? "AsaLady reduced handle" : null,
  ].filter((value): value is string => Boolean(value));
  const introductions = [
    `The 2025 AsaDental application matrix assigns reference ${record.sku}, pattern ${pattern}, to ${application}. ${designFacts.length ? `Its documented profile includes ${joinEnglish(designFacts)}.` : "No unverified design claim has been added."}`,
    `For ${application}, the manufacturer's 2025 matrix identifies ${record.sku} as pattern ${pattern}. ${designFacts.length ? `The recorded design is distinguished by ${joinEnglish(designFacts)}.` : "Design fields that cannot be confirmed are intentionally omitted."}`,
    `Reference ${record.sku} is catalogued as pattern ${pattern} for ${application}. ${designFacts.length ? `The matrix and caption record ${joinEnglish(designFacts)}.` : "Only the confirmed anatomical application is shown."}`,
  ];
  const specifications = [
    ...(record.arches.length ? [{ label: "Arch", value: joinEnglish(record.arches.map(arch => arch === "upper" ? "Upper" : "Lower")) }] : []),
    { label: "Tooth group", value: joinEnglish(record.toothGroups.map(group => enGroups[group])) },
    ...(record.sides.length ? [{ label: "Side", value: record.sides[0] === "left" ? "Left" : "Right" }] : []),
    ...(child ? [{ label: "Patient group", value: "Children" }] : []),
    { label: "Pattern", value: pattern },
    ...(record.serration ? [{ label: "Tip pattern", value: record.serration === "serrated" ? "Serrated" : "Non-serrated" }] : []),
    ...(record.beaksAtRest ? [{ label: "Beaks at rest", value: record.beaksAtRest === "open" ? "Open" : "Closed" }] : []),
    ...(record.handleVariant === "asalady" ? [{ label: "Handle family", value: "AsaLady - smaller, lighter handle with reduced finger holes" }] : []),
  ].filter(specification => specification.value);
  const handling = englishHandling(record);
  return {
    eyebrow: "Verified forceps application",
    title,
    metaDescription: `AsaDental ${record.sku}, pattern ${pattern}, is documented for ${application}${record.serration ? ` with ${record.serration === "serrated" ? "serrated" : "non-serrated"} tips` : ""}.`,
    introduction: introductions[variant(record.sku, introductions.length)],
    clinicalHeading: "Documented clinical application",
    clinicalSummary: `${child ? "The paediatric range-of-application mark applies to " : "The range-of-application matrix maps this pattern to "}${application}.`,
    specificationHeading: "Clinical and design specification",
    specifications,
    handlingHeading: "Material and reprocessing",
    handlingText: handling,
    sourceNote: "Clinical and design facts are normalized from the AsaDental 2025 Extractive Surgery catalogue; unresolved fields are not published.",
    relatedHeading: "Manufacturer-listed related patterns",
    relatedIntro: "Only references explicitly listed as similar products by the manufacturer are linked here.",
    quoteHeading: `Request a quote for ${record.sku}`,
    quoteText: "Add the exact item code to your quote list so availability and documentation can be checked against the correct anatomical pattern.",
  };
}

function turkishCopy(record: ForcepsFact): SampleCopy {
  const application = trApplication(record);
  const pattern = record.patternName ? `${record.patternCode} ${record.patternName}` : record.patternCode || record.sku;
  const child = record.patientGroups.includes("children");
  const title = `${application.charAt(0).toLocaleUpperCase("tr-TR")}${application.slice(1)} için ${child ? "çocuk " : ""}${pattern} model çekim forsepsi`;
  const designFacts = [
    record.serration === "serrated" ? "tırtıklı uç" : record.serration === "non_serrated" ? "tırtıksız uç" : null,
    record.beaksAtRest === "open" ? "istirahatte açık çene" : record.beaksAtRest === "closed" ? "istirahatte kapalı çene" : null,
    record.handleVariant === "asalady" ? "küçültülmüş AsaLady sap" : null,
  ].filter((value): value is string => Boolean(value));
  const introductions = [
    `AsaDental'in 2025 uygulama matrisi ${record.sku} referanslı ${pattern} modelini ${application} için tanımlar. ${designFacts.length ? `Belgelenen tasarım özellikleri ${joinTurkish(designFacts)} şeklindedir.` : "Doğrulanamayan tasarım bilgileri sayfaya eklenmemiştir."}`,
    `${application} uygulamasında üretici matrisi ${record.sku} kodlu ${pattern} modelini gösterir. ${designFacts.length ? `Modeli ayıran kayıtlı özellikler ${joinTurkish(designFacts)} olarak belirtilmiştir.` : "Yalnızca doğrulanmış anatomik kullanım yayımlanmıştır."}`,
    `${record.sku} kodu, 2025 kataloğunda ${application} için ${pattern} model olarak yer alır. ${designFacts.length ? `Matris ve ürün başlığı ${joinTurkish(designFacts)} bilgilerini doğrular.` : "Belirsiz alanlar özellikle boş bırakılmıştır."}`,
  ];
  const specifications = [
    ...(record.arches.length ? [{ label: "Çene", value: joinTurkish(record.arches.map(arch => arch === "upper" ? "Üst" : "Alt")) }] : []),
    { label: "Diş grubu", value: joinTurkish(record.toothGroups.map(group => trGroups[group])) },
    ...(record.sides.length ? [{ label: "Taraf", value: record.sides[0] === "left" ? "Sol" : "Sağ" }] : []),
    ...(child ? [{ label: "Hasta grubu", value: "Çocuklar" }] : []),
    { label: "Model", value: pattern },
    ...(record.serration ? [{ label: "Uç yapısı", value: record.serration === "serrated" ? "Tırtıklı" : "Tırtıksız" }] : []),
    ...(record.beaksAtRest ? [{ label: "İstirahat konumu", value: record.beaksAtRest === "open" ? "Açık" : "Kapalı" }] : []),
    ...(record.handleVariant === "asalady" ? [{ label: "Sap ailesi", value: "AsaLady - daha küçük ve hafif sap, küçültülmüş parmak halkaları" }] : []),
  ].filter(specification => specification.value);
  const handling = turkishHandling(record);
  return {
    eyebrow: "Doğrulanmış forseps uygulaması",
    title,
    metaDescription: `AsaDental ${record.sku}, ${pattern} model çekim forsepsi; ${application} için belgelenmiştir${record.serration ? ` ve ${record.serration === "serrated" ? "tırtıklı" : "tırtıksız"} uçludur` : ""}.`,
    introduction: introductions[variant(record.sku, introductions.length)],
    clinicalHeading: "Belgelenmiş klinik kullanım",
    clinicalSummary: `${child ? "Çocuk kullanım işareti " : "Uygulama matrisi bu modeli "}${application} ile eşleştirir.`,
    specificationHeading: "Klinik ve tasarımsal özellikler",
    specifications,
    handlingHeading: "Malzeme ve yeniden işleme",
    handlingText: handling,
    sourceNote: "Klinik ve tasarımsal bilgiler AsaDental 2025 Ekstraktif Cerrahi kataloğundan yapılandırılmış; çözümlenmemiş alanlar yayımlanmamıştır.",
    relatedHeading: "Üreticinin listelediği benzer modeller",
    relatedIntro: "Burada yalnızca üreticinin benzer ürün olarak açıkça listelediği referanslar gösterilir.",
    quoteHeading: `${record.sku} için teklif isteyin`,
    quoteText: "Doğru anatomik model için stok ve belge kontrolü yapılabilmesi amacıyla ürün kodunu teklif listenize aynen ekleyin.",
  };
}

function arabicCopy(record: ForcepsFact): SampleCopy {
  const application = arApplication(record);
  const pattern = record.patternName ? `${record.patternCode} ${record.patternName}` : record.patternCode || record.sku;
  const child = record.patientGroups.includes("children");
  const title = `ملقط خلع ${child ? "للأطفال " : ""}بنمط ${pattern} لاستخدامه مع ${application}`;
  const designFacts = [
    record.serration === "serrated" ? "أطراف مسننة" : record.serration === "non_serrated" ? "أطراف غير مسننة" : null,
    record.beaksAtRest === "open" ? "فكان مفتوحان في وضع السكون" : record.beaksAtRest === "closed" ? "فكان مغلقان في وضع السكون" : null,
    record.handleVariant === "asalady" ? "مقبض AsaLady أصغر وأخف" : null,
  ].filter((value): value is string => Boolean(value));
  const introductions = [
    `تربط مصفوفة التطبيقات الصادرة عن AsaDental لعام 2025 المرجع ${record.sku}، بالنمط ${pattern}، مع ${application}. ${designFacts.length ? `وتشمل خصائصه الموثقة ${joinArabic(designFacts)}.` : "لم تُضف أي خاصية تصميم غير موثقة."}`,
    `بالنسبة إلى ${application}، تحدد مصفوفة الشركة المصنّعة المرجع ${record.sku} باعتباره النمط ${pattern}. ${designFacts.length ? `ويمتاز في السجل بـ${joinArabic(designFacts)}.` : "اقتصرت الصفحة على الاستخدام التشريحي المؤكد."}`,
    `يظهر الرمز ${record.sku} في كتالوج 2025 كنمط ${pattern} مخصص لـ${application}. ${designFacts.length ? `وتثبت بيانات المصفوفة والعنوان ${joinArabic(designFacts)}.` : "تُركت الحقول غير المحسومة دون نشر."}`,
  ];
  const specifications = [
    ...(record.arches.length ? [{ label: "الفك", value: joinArabic(record.arches.map(arch => arch === "upper" ? "علوي" : "سفلي")) }] : []),
    { label: "مجموعة الأسنان", value: joinArabic(record.toothGroups.map(group => arGroups[group])) },
    ...(record.sides.length ? [{ label: "الجهة", value: record.sides[0] === "left" ? "اليسرى" : "اليمنى" }] : []),
    ...(child ? [{ label: "فئة المرضى", value: "الأطفال" }] : []),
    { label: "النمط", value: pattern },
    ...(record.serration ? [{ label: "بنية الأطراف", value: record.serration === "serrated" ? "مسننة" : "غير مسننة" }] : []),
    ...(record.beaksAtRest ? [{ label: "وضع الفكين عند السكون", value: record.beaksAtRest === "open" ? "مفتوحان" : "مغلقان" }] : []),
    ...(record.handleVariant === "asalady" ? [{ label: "عائلة المقبض", value: "AsaLady - مقبض أصغر وأخف مع فتحات أصابع مخفّضة" }] : []),
  ].filter(specification => specification.value);
  const handling = arabicHandling(record);
  return {
    eyebrow: "استخدام موثق لملقط الخلع",
    title,
    metaDescription: `المرجع AsaDental ${record.sku}، بالنمط ${pattern}، موثق للاستخدام مع ${application}${record.serration ? ` وبأطراف ${record.serration === "serrated" ? "مسننة" : "غير مسننة"}` : ""}.`,
    introduction: introductions[variant(record.sku, introductions.length)],
    clinicalHeading: "الاستخدام السريري الموثق",
    clinicalSummary: `${child ? "تربط علامة استخدام الأطفال هذا النمط مع " : "تربط مصفوفة التطبيقات هذا النمط مع "}${application}.`,
    specificationHeading: "المواصفات السريرية والتصميمية",
    specifications,
    handlingHeading: "المادة وإعادة المعالجة",
    handlingText: handling,
    sourceNote: "جرت هيكلة الحقائق السريرية والتصميمية من فصل جراحة الخلع في كتالوج AsaDental لعام 2025، ولم تُنشر الحقول غير المحسومة.",
    relatedHeading: "أنماط مرتبطة أدرجتها الشركة المصنّعة",
    relatedIntro: "تظهر هنا فقط المراجع التي أدرجتها الشركة المصنّعة صراحة ضمن المنتجات المشابهة.",
    quoteHeading: `اطلب عرضاً للمرجع ${record.sku}`,
    quoteText: "أضف رمز المنتج كما هو إلى قائمة الطلب كي يتم التحقق من التوفر والوثائق للنمط التشريحي الصحيح.",
  };
}

function englishHandling(record: ForcepsFact) {
  const facts = [];
  if (record.materialName) facts.push(`The official product record identifies ${record.materialName.toLowerCase()} as the material`);
  if (record.singleUse != null) facts.push(record.singleUse ? "it is listed for single use" : "it is listed as reusable");
  if (record.sterilizable != null) facts.push(record.sterilizable ? "it is listed as sterilizable" : "it is not listed as sterilizable");
  if (record.maxTemperatureC != null) facts.push(`the stated maximum reprocessing temperature is ${record.maxTemperatureC}°C`);
  return facts.length ? `${joinEnglish(facts)}.` : "";
}

function turkishHandling(record: ForcepsFact) {
  const facts = [];
  if (record.materialName) facts.push(`resmî ürün kaydında malzeme ${record.materialName === "Stainless Steel" ? "paslanmaz çelik" : record.materialName} olarak belirtilir`);
  if (record.singleUse != null) facts.push(record.singleUse ? "tek kullanımlık olarak listelenir" : "yeniden kullanılabilir olarak listelenir");
  if (record.sterilizable != null) facts.push(record.sterilizable ? "sterilizasyona uygun olarak listelenir" : "sterilizasyona uygun olarak listelenmez");
  if (record.maxTemperatureC != null) facts.push(`belirtilen azami yeniden işleme sıcaklığı ${record.maxTemperatureC}°C'dir`);
  return facts.length ? `${joinTurkish(facts)}.` : "";
}

function arabicHandling(record: ForcepsFact) {
  const facts = [];
  if (record.materialName) facts.push(`تحدد صفحة المنتج الرسمية المادة بأنها ${record.materialName === "Stainless Steel" ? "فولاذ مقاوم للصدأ" : record.materialName}`);
  if (record.singleUse != null) facts.push(record.singleUse ? "والأداة مدرجة للاستخدام مرة واحدة" : "والأداة مدرجة كأداة قابلة لإعادة الاستخدام");
  if (record.sterilizable != null) facts.push(record.sterilizable ? "ومدرجة كأداة قابلة للتعقيم" : "وليست مدرجة كأداة قابلة للتعقيم");
  if (record.maxTemperatureC != null) facts.push(`ودرجة إعادة المعالجة القصوى المعلنة هي ${record.maxTemperatureC}°م`);
  return facts.length ? `${joinArabic(facts)}.` : "";
}

const generatedPages = new Map<string, ForcepsPageEnrichment>(
  facts.map(record => {
    const override = confirmedLengths.overrides[record.sku];
    return [record.sku, {
      sku: record.sku,
      copy: {
        EN: englishCopy(record),
        TR: turkishCopy(record),
        AR: arabicCopy(record),
      },
      relationships: record.relatedSkus.map(sku => ({ sku, kind: "official_similar_product" as const })),
      overallLengthMm: override?.valueMm ?? record.lengthMm ?? undefined,
      hasHandlingFacts: [record.materialName, record.singleUse, record.sterilizable, record.maxTemperatureC].some(value => value != null),
    }];
  }),
);

export function forcepsProductForSku(sku: string): ForcepsPageEnrichment | undefined {
  const approved = forcepsProductSamples[sku];
  if (approved) {
    return {
      sku,
      copy: approved.copy,
      relationships: approved.relationships,
      overallLengthMm: approvedSampleLength(approved),
      hasHandlingFacts: true,
    };
  }
  return generatedPages.get(sku);
}

export function forcepsOverallLengthMm(enrichment: ForcepsPageEnrichment) {
  return enrichment.overallLengthMm;
}

export { localizedOverallLength };
