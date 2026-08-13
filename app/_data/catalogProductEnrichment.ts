/**
 * Native EN/TR/AR product-page copy for all non-matrix references.
 *
 * The compact facts are generated exclusively from matched 2025 catalogue
 * pages. Each language composes its own sentences from the normalized facts;
 * there is no translated master paragraph and no catalogue prose is copied.
 */
import factsJson from "./catalogProductFacts.json";
import catalogItemsJson from "./asaCatalog.json";
import type { ForcepsSampleLocale, SampleCopy } from "./forcepsProductSamples";

type ReprocessingFact = [boolean | null, boolean | null, number | null];

type Fact = {
  sku: string;
  catalogueName: string;
  category: string;
  priority: "1b" | "2";
  family: string;
  overallLengthMm: number | null;
  workingLengthMm: number | null;
  tipWidthMm: number | null;
  diameterMm: number | null;
  sizeMm: number[] | null;
  anglesDegrees: number[];
  forms: string[];
  sizeDesignations: string[];
  colors: string[];
  arches: string[];
  toothGroups: string[];
  sides: string[];
  patientGroups: string[];
  documentedUses: string[];
  materials: string[];
  finishes: string[];
  quantity: number | null;
  singleUse: boolean | null;
  sterilizable: boolean | null;
  maxTemperatureC: number | null;
  sourceMatched: boolean;
};

export type CatalogPageEnrichment = {
  sku: string;
  copy: Record<ForcepsSampleLocale, SampleCopy>;
  relationships: Array<{ sku: string; kind: "official_similar_product" | "official_set_member" }>;
  overallLengthMm?: number;
  hasHandlingFacts: boolean;
  allowCategoryFallback: true;
};

const catalogBySku = new Map((catalogItemsJson as Array<{ code: string; name: string; category: string }>).map(item => [item.code, item]));

function readReprocessingFact(sku: string, value: readonly unknown[]): ReprocessingFact {
  if (value.length !== 3) throw new Error(`Invalid reprocessing fact for ${sku}: expected 3 values`);
  const [singleUse, sterilizable, maxTemperatureC] = value;
  if (singleUse !== null && typeof singleUse !== "boolean") {
    throw new Error(`Invalid single-use fact for ${sku}`);
  }
  if (sterilizable !== null && typeof sterilizable !== "boolean") {
    throw new Error(`Invalid sterilization fact for ${sku}`);
  }
  if (maxTemperatureC !== null && typeof maxTemperatureC !== "number") {
    throw new Error(`Invalid reprocessing temperature for ${sku}`);
  }
  return [singleUse, sterilizable, maxTemperatureC];
}

const facts = factsJson.records.map(record => {
  const item = catalogBySku.get(record.s);
  if (!item) throw new Error(`Missing catalogue record for ${record.s}`);
  const [singleUse, sterilizable, maxTemperatureC] = readReprocessingFact(record.s, record.r);
  return {
    sku: record.s,
    catalogueName: item.name,
    category: item.category,
    priority: item.category === "Extractive Surgery" || item.category === "Ideal Periotomi" ? "1b" as const : "2" as const,
    family: record.f,
    overallLengthMm: record.l,
    workingLengthMm: null,
    tipWidthMm: record.w,
    diameterMm: record.d,
    sizeMm: record.z,
    anglesDegrees: record.a,
    forms: record.o,
    sizeDesignations: record.v,
    colors: record.c,
    arches: record.h,
    toothGroups: record.t,
    sides: record.e,
    patientGroups: record.p,
    documentedUses: record.u,
    materials: record.m,
    finishes: record.n,
    quantity: record.q,
    singleUse,
    sterilizable,
    maxTemperatureC,
    sourceMatched: record.x,
  } satisfies Fact;
});

const categoryLabels: Record<ForcepsSampleLocale, Record<string, string>> = {
  EN: {
    "AsaOne disposables": "AsaOne disposables", Diagnostic: "diagnostics", "Oral Surgery": "oral surgery",
    "Extractive Surgery": "extractive surgery", "Implant Surgery": "implant surgery", Restorative: "restorative dentistry",
    Periodontal: "periodontics", Orthodontic: "orthodontics", "Instrument cassettes and trays": "instrument cassettes and trays",
    "Ideal Periotomi": "Ideal Periotomi", "Impression Trays": "impression trays", "Laboratory instruments": "laboratory instruments",
    "Other ASA Dental instruments": "other AsaDental instruments",
  },
  TR: {
    "AsaOne disposables": "AsaOne tek kullanımlık ürünler", Diagnostic: "diagnostik", "Oral Surgery": "oral cerrahi",
    "Extractive Surgery": "çekim cerrahisi", "Implant Surgery": "implant cerrahisi", Restorative: "restoratif diş hekimliği",
    Periodontal: "periodontoloji", Orthodontic: "ortodonti", "Instrument cassettes and trays": "alet kasetleri ve tepsiler",
    "Ideal Periotomi": "Ideal Periotomi", "Impression Trays": "ölçü kaşıkları", "Laboratory instruments": "laboratuvar aletleri",
    "Other ASA Dental instruments": "diğer AsaDental aletleri",
  },
  AR: {
    "AsaOne disposables": "مستهلكات AsaOne", Diagnostic: "التشخيص", "Oral Surgery": "جراحة الفم",
    "Extractive Surgery": "جراحة القلع", "Implant Surgery": "جراحة الزرع", Restorative: "طب الأسنان الترميمي",
    Periodontal: "علاج دواعم السن", Orthodontic: "تقويم الأسنان", "Instrument cassettes and trays": "حافظات وصواني الأدوات",
    "Ideal Periotomi": "Ideal Periotomi", "Impression Trays": "ملاعق الطبعات", "Laboratory instruments": "أدوات المختبر",
    "Other ASA Dental instruments": "أدوات AsaDental الأخرى",
  },
};

const familyLabels: Record<ForcepsSampleLocale, Record<string, string>> = {
  EN: {
    root_elevator: "root elevator", bone_rongeur: "bone rongeur", periotome: "periotome", impression_tray: "impression tray",
    instrument_tray: "instrument tray", instrument_cassette: "instrument cassette", needle_holder: "needle holder", scissors: "scissors",
    plier: "plier", probe: "probe", curette: "curette", scaler: "scaler", chisel: "chisel", osteotome: "osteotome",
    spatula: "spatula", mirror: "mirror", clamp: "clamp", forceps_other: "forceps", retractor: "retractor", excavator: "excavator",
    burnisher: "burnisher", carver: "carver", articulator_component: "articulator component", disposable_supply: "disposable supply",
    catalogue_item: "catalogue item",
  },
  TR: {
    root_elevator: "kök elevatörü", bone_rongeur: "kemik ronjörü", periotome: "periotom", impression_tray: "ölçü kaşığı",
    instrument_tray: "alet tepsisi", instrument_cassette: "alet kaseti", needle_holder: "portegü", scissors: "makas",
    plier: "pens", probe: "sond", curette: "küret", scaler: "diş taşı temizleme aleti", chisel: "keski", osteotome: "osteotom",
    spatula: "spatül", mirror: "ayna", clamp: "klem", forceps_other: "forseps", retractor: "ekartör", excavator: "ekskavatör",
    burnisher: "polisaj aleti", carver: "modelaj aleti", articulator_component: "artikülatör parçası", disposable_supply: "tek kullanımlık sarf malzemesi",
    catalogue_item: "katalog ürünü",
  },
  AR: {
    root_elevator: "رافعة جذور", bone_rongeur: "قاضمة عظم", periotome: "بيريوتوم", impression_tray: "ملعقة طبعة",
    instrument_tray: "صينية أدوات", instrument_cassette: "حافظة أدوات", needle_holder: "ماسك إبر", scissors: "مقص",
    plier: "كماشة", probe: "مسبار", curette: "مكشطة", scaler: "أداة إزالة الجير", chisel: "إزميل", osteotome: "أوستيوتوم",
    spatula: "ملعقة", mirror: "مرآة", clamp: "مشبك", forceps_other: "ملقط", retractor: "مبعد", excavator: "حفارة",
    burnisher: "أداة صقل", carver: "أداة نحت", articulator_component: "جزء مفصل", disposable_supply: "مادة استهلاكية أحادية الاستخدام",
    catalogue_item: "منتج كتالوج",
  },
};

const valueLabels: Record<ForcepsSampleLocale, Record<string, string>> = {
  EN: {
    upper: "upper", lower: "lower", left: "left", right: "right", incisors: "incisors", canines: "canines", premolars: "premolars",
    molars: "molars", wisdom_teeth: "wisdom teeth", roots: "roots", children: "children", stainless_steel: "stainless steel",
    anodized_aluminum: "anodized aluminum", aluminum: "aluminum", titanium: "titanium", silicone: "silicone", rubber: "rubber",
    plastic: "plastic", ptfe: "PTFE", carbon: "carbon", tungsten_carbide: "tungsten carbide", satin: "satin finish",
    mirror_polished: "mirror-polished finish", non_reflective: "non-reflective finish", straight: "straight", curved: "curved",
    angled: "angled", perforated: "perforated", non_perforated: "non-perforated", serrated: "serrated", blunt: "blunt",
    sharp: "sharp", locking: "locking", single_ended: "single-ended", double_ended: "double-ended", double_action: "double action",
    root_elevation: "root elevation", tooth_extraction: "tooth extraction", impression_taking: "impression taking",
    periodontal_pocket_measurement: "periodontal pocket measurement", bone_cutting: "bone cutting", implant_osteotomy: "implant osteotomy",
    suture_handling: "suture handling", impacted_wisdom_tooth_elevation: "elevation of impacted wisdom teeth",
  },
  TR: {
    upper: "üst", lower: "alt", left: "sol", right: "sağ", incisors: "kesici dişler", canines: "kaninler", premolars: "premolarlar",
    molars: "molarlar", wisdom_teeth: "yirmi yaş dişleri", roots: "kökler", children: "çocuklar", stainless_steel: "paslanmaz çelik",
    anodized_aluminum: "eloksallı alüminyum", aluminum: "alüminyum", titanium: "titanyum", silicone: "silikon", rubber: "kauçuk",
    plastic: "plastik", ptfe: "PTFE", carbon: "karbon", tungsten_carbide: "tungsten karbür", satin: "saten yüzey",
    mirror_polished: "ayna polisajlı yüzey", non_reflective: "yansıma yapmayan yüzey", straight: "düz", curved: "eğri",
    angled: "açılı", perforated: "delikli", non_perforated: "deliksiz", serrated: "tırtıklı", blunt: "künt",
    sharp: "keskin", locking: "kilitli", single_ended: "tek uçlu", double_ended: "çift uçlu", double_action: "çift etkili",
    root_elevation: "kök elevasyonu", tooth_extraction: "diş çekimi", impression_taking: "ölçü alma",
    periodontal_pocket_measurement: "periodontal cep ölçümü", bone_cutting: "kemik kesme", implant_osteotomy: "implant osteotomisi",
    suture_handling: "sütür işlemi", impacted_wisdom_tooth_elevation: "gömülü yirmi yaş dişi elevasyonu",
  },
  AR: {
    upper: "علوي", lower: "سفلي", left: "يسار", right: "يمين", incisors: "القواطع", canines: "الأنياب", premolars: "الضواحك",
    molars: "الأضراس", wisdom_teeth: "ضروس العقل", roots: "الجذور", children: "الأطفال", stainless_steel: "فولاذ مقاوم للصدأ",
    anodized_aluminum: "ألمنيوم مؤكسد", aluminum: "ألمنيوم", titanium: "تيتانيوم", silicone: "سيليكون", rubber: "مطاط",
    plastic: "بلاستيك", ptfe: "PTFE", carbon: "كربون", tungsten_carbide: "كربيد التنغستن", satin: "سطح ساتان",
    mirror_polished: "سطح مصقول كالمرآة", non_reflective: "سطح غير عاكس", straight: "مستقيم", curved: "منحنٍ",
    angled: "بزاوية", perforated: "مثقب", non_perforated: "غير مثقب", serrated: "مسنن", blunt: "كليل",
    sharp: "حاد", locking: "مزود بقفل", single_ended: "أحادي الطرف", double_ended: "ثنائي الطرف", double_action: "مزدوج الحركة",
    root_elevation: "رفع الجذور", tooth_extraction: "قلع الأسنان", impression_taking: "أخذ الطبعات",
    periodontal_pocket_measurement: "قياس الجيوب حول السنية", bone_cutting: "قطع العظم", implant_osteotomy: "تحضير موقع الزرعة",
    suture_handling: "التعامل مع الغرز", impacted_wisdom_tooth_elevation: "رفع ضروس العقل المنطمرة",
  },
};

const specLabels: Record<ForcepsSampleLocale, Record<string, string>> = {
  EN: { family: "Product family", chapter: "Catalogue chapter", tipWidth: "Tip width", diameter: "Diameter", size: "Dimensions", angle: "Angle", form: "Configuration", arch: "Arch", tooth: "Anatomical reference", side: "Side", patient: "Patient group", use: "Documented use", material: "Material", finish: "Finish", sizeDesignation: "Size", quantity: "Pack or set quantity", singleUse: "Use classification", sterilizable: "Sterilization", temperature: "Maximum temperature" },
  TR: { family: "Ürün ailesi", chapter: "Katalog bölümü", tipWidth: "Uç genişliği", diameter: "Çap", size: "Ölçüler", angle: "Açı", form: "Yapı", arch: "Çene", tooth: "Anatomik referans", side: "Taraf", patient: "Hasta grubu", use: "Belgelenmiş kullanım", material: "Malzeme", finish: "Yüzey", sizeDesignation: "Boyut", quantity: "Paket veya set adedi", singleUse: "Kullanım sınıfı", sterilizable: "Sterilizasyon", temperature: "Azami sıcaklık" },
  AR: { family: "عائلة المنتج", chapter: "فصل الكتالوج", tipWidth: "عرض الطرف", diameter: "القطر", size: "الأبعاد", angle: "الزاوية", form: "التكوين", arch: "الفك", tooth: "المرجع التشريحي", side: "الجهة", patient: "فئة المرضى", use: "الاستخدام الموثق", material: "المادة", finish: "السطح", sizeDesignation: "المقاس", quantity: "عدد العبوة أو المجموعة", singleUse: "تصنيف الاستخدام", sterilizable: "التعقيم", temperature: "درجة الحرارة القصوى" },
};

function variant(sku: string, count: number) {
  return [...sku].reduce((sum, character) => sum + character.charCodeAt(0), 0) % count;
}

function label(locale: ForcepsSampleLocale, value: string) {
  return valueLabels[locale][value] || value.replaceAll("_", " ");
}

function join(locale: ForcepsSampleLocale, values: string[]) {
  if (values.length <= 1) return values[0] || "";
  const conjunction = locale === "EN" ? "and" : locale === "TR" ? "ve" : "و";
  if (values.length === 2) return `${values[0]} ${conjunction} ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} ${conjunction} ${values.at(-1)}`;
}

function specifications(record: Fact, locale: ForcepsSampleLocale) {
  const labels = specLabels[locale];
  const rows: Array<{ label: string; value: string }> = [];
  const add = (key: string, value: string | undefined | null) => { if (value) rows.push({ label: labels[key], value }); };
  add("family", familyLabels[locale][record.family]);
  if (record.sourceMatched) add("chapter", categoryLabels[locale][record.category] || record.category);
  if (record.tipWidthMm != null) add("tipWidth", `${record.tipWidthMm} mm`);
  if (record.diameterMm != null) add("diameter", `${record.diameterMm} mm`);
  if (record.sizeMm?.length) add("size", `${record.sizeMm.join(" × ")} mm`);
  if (record.anglesDegrees.length) add("angle", join(locale, record.anglesDegrees.map(value => `${value}°`)));
  if (record.forms.length) add("form", join(locale, record.forms.map(value => label(locale, value))));
  if (record.arches.length) add("arch", join(locale, record.arches.map(value => label(locale, value))));
  if (record.toothGroups.length) add("tooth", join(locale, record.toothGroups.map(value => label(locale, value))));
  if (record.sides.length) add("side", join(locale, record.sides.map(value => label(locale, value))));
  if (record.patientGroups.length) add("patient", join(locale, record.patientGroups.map(value => label(locale, value))));
  if (record.documentedUses.length) add("use", join(locale, record.documentedUses.map(value => label(locale, value))));
  if (record.materials.length) add("material", join(locale, record.materials.map(value => label(locale, value))));
  if (record.finishes.length) add("finish", join(locale, record.finishes.map(value => label(locale, value))));
  if (record.sizeDesignations.length) add("sizeDesignation", record.sizeDesignations.join(", "));
  if (record.quantity != null) add("quantity", String(record.quantity));
  if (record.singleUse != null) add("singleUse", locale === "EN" ? (record.singleUse ? "Single use" : "Reusable") : locale === "TR" ? (record.singleUse ? "Tek kullanımlık" : "Yeniden kullanılabilir") : (record.singleUse ? "أحادي الاستخدام" : "قابل لإعادة الاستخدام"));
  if (record.sterilizable != null) add("sterilizable", locale === "EN" ? (record.sterilizable ? "Sterilizable" : "Not listed as sterilizable") : locale === "TR" ? (record.sterilizable ? "Sterilize edilebilir" : "Sterilize edilebilir olarak listelenmemiş") : (record.sterilizable ? "قابل للتعقيم" : "غير مدرج كمنتج قابل للتعقيم"));
  if (record.maxTemperatureC != null) add("temperature", `${record.maxTemperatureC}°C`);
  return rows;
}

function factPhrase(record: Fact, locale: ForcepsSampleLocale) {
  const parts = [];
  if (record.tipWidthMm != null) parts.push(locale === "EN" ? `${record.tipWidthMm} mm tip width` : locale === "TR" ? `${record.tipWidthMm} mm uç genişliği` : `عرض طرف ${record.tipWidthMm} مم`);
  if (record.diameterMm != null) parts.push(locale === "EN" ? `${record.diameterMm} mm diameter` : locale === "TR" ? `${record.diameterMm} mm çap` : `قطر ${record.diameterMm} مم`);
  if (record.sizeMm?.length) parts.push(locale === "EN" ? `${record.sizeMm.join(" × ")} mm dimensions` : locale === "TR" ? `${record.sizeMm.join(" × ")} mm ölçüler` : `أبعاد ${record.sizeMm.join(" × ")} مم`);
  if (record.materials.length) parts.push(join(locale, record.materials.map(value => label(locale, value))));
  if (record.forms.length) parts.push(join(locale, record.forms.map(value => label(locale, value))));
  if (record.arches.length || record.toothGroups.length || record.sides.length) parts.push(join(locale, [...record.arches, ...record.toothGroups, ...record.sides].map(value => label(locale, value))));
  if (record.documentedUses.length) parts.push(join(locale, record.documentedUses.map(value => label(locale, value))));
  if (record.quantity != null) parts.push(locale === "EN" ? `quantity ${record.quantity}` : locale === "TR" ? `${record.quantity} adet` : `كمية ${record.quantity}`);
  return parts.slice(0, 4);
}

function englishCopy(record: Fact): SampleCopy {
  const family = familyLabels.EN[record.family];
  const category = categoryLabels.EN[record.category] || record.category;
  const facts = factPhrase(record, "EN");
  const introductions = facts.length ? [
    `AsaDental reference ${record.sku} is catalogued as a ${family} in the ${category} range. Its matched 2025 entry documents ${join("EN", facts)}.`,
    `${record.sku} identifies a ${family} within AsaDental's ${category} chapter. The verified record specifies ${join("EN", facts)}.`,
    `In the 2025 ${category} catalogue, code ${record.sku} denotes a ${family}. The product cell records ${join("EN", facts)}.`,
  ] : [
    `AsaDental code ${record.sku} identifies a ${family} in the ${category} range. Technical fields not confirmed on a matched catalogue page are omitted.`,
    `Reference ${record.sku} is listed in AsaDental's ${category} range as a ${family}; no unverified dimension, material or indication has been added.`,
    `The supplied AsaDental index places ${record.sku} in ${category} as a ${family}. Only the confirmed code and classification are shown.`,
  ];
  return {
    eyebrow: record.priority === "1b" ? "Extractive Surgery catalogue record" : "2025 catalogue record",
    title: record.catalogueName,
    metaDescription: `AsaDental ${record.sku} ${family} in the ${category} range${facts.length ? `, documented with ${facts.slice(0, 2).join(" and ")}` : ""}.`,
    introduction: introductions[variant(record.sku, introductions.length)],
    clinicalHeading: "Documented catalogue facts",
    clinicalSummary: facts.length ? `The matched product cell records ${join("EN", facts)}.` : "No technical field beyond the manufacturer code and product classification is published.",
    specificationHeading: "Verified product specification",
    specifications: specifications(record, "EN"),
    handlingHeading: "Material and reprocessing",
    handlingText: englishHandling(record),
    sourceNote: "Facts are normalized from the matched AsaDental 2025 catalogue page. Unknown fields and catalogue marketing prose are omitted.",
    relatedHeading: "More in this catalogue range",
    relatedIntro: "Browse additional AsaDental references from the same documented product category.",
    quoteHeading: `Request a quote for ${record.sku}`,
    quoteText: "Add the exact reference to your quote list so availability and documentation can be checked for this configuration.",
  };
}

function turkishCopy(record: Fact): SampleCopy {
  const family = familyLabels.TR[record.family];
  const category = categoryLabels.TR[record.category] || record.category;
  const facts = factPhrase(record, "TR");
  const introductions = facts.length ? [
    `AsaDental ${record.sku} kodu, ${category} grubunda yer alan bir ${family} ürününü tanımlar. Eşleşen 2025 katalog kaydı ${join("TR", facts)} bilgilerini doğrular.`,
    `${record.sku} referansı AsaDental ${category} bölümündeki bir ${family} ürünüdür. Ürün hücresinde ${join("TR", facts)} açıkça belirtilir.`,
    `2025 ${category} kataloğunda ${record.sku}, ${family} olarak listelenir. Kaynağa bağlı teknik veriler ${join("TR", facts)} şeklindedir.`,
  ] : [
    `AsaDental ${record.sku} referansı ${category} grubunda bir ${family} olarak kayıtlıdır. Doğrulanmayan ölçü, malzeme veya kullanım bilgisi eklenmemiştir.`,
    `${record.sku} kodu, AsaDental ${category} ürün ailesindeki bir ${family} kaydını gösterir; yalnızca doğrulanmış sınıflandırma yayımlanır.`,
    `Ürün dizininde ${record.sku}, ${category} altında bir ${family} olarak yer alır. Kaynakta bulunmayan teknik alanlar boş bırakılmıştır.`,
  ];
  return {
    eyebrow: record.priority === "1b" ? "Çekim cerrahisi katalog kaydı" : "2025 katalog kaydı",
    title: record.catalogueName,
    metaDescription: `AsaDental ${record.sku}, ${category} grubunda bir ${family}${facts.length ? `; kayıtlı özellikler: ${facts.slice(0, 2).join(" ve ")}` : ""}.`,
    introduction: introductions[variant(record.sku, introductions.length)],
    clinicalHeading: "Belgelenmiş katalog bilgileri",
    clinicalSummary: facts.length ? `Eşleşen ürün kaydı ${join("TR", facts)} bilgilerini içerir.` : "Üretici kodu ve ürün sınıfı dışında doğrulanmamış teknik alan yayımlanmamıştır.",
    specificationHeading: "Doğrulanmış ürün özellikleri",
    specifications: specifications(record, "TR"),
    handlingHeading: "Malzeme ve yeniden işleme",
    handlingText: turkishHandling(record),
    sourceNote: "Bilgiler eşleşen AsaDental 2025 katalog sayfasından yapılandırılmıştır. Bilinmeyen alanlar ve katalog tanıtım metinleri yayımlanmamıştır.",
    relatedHeading: "Aynı katalog grubundaki diğer ürünler",
    relatedIntro: "Aynı belgelenmiş ürün kategorisindeki diğer AsaDental referanslarını inceleyin.",
    quoteHeading: `${record.sku} için teklif isteyin`,
    quoteText: "Bu yapılandırmanın stok ve belge kontrolü için tam ürün kodunu teklif listenize ekleyin.",
  };
}

function arabicCopy(record: Fact): SampleCopy {
  const family = familyLabels.AR[record.family];
  const category = categoryLabels.AR[record.category] || record.category;
  const facts = factPhrase(record, "AR");
  const introductions = facts.length ? [
    `يشير مرجع AsaDental ${record.sku} إلى ${family} ضمن مجموعة ${category}. وتوثق خانة المنتج المطابقة في كتالوج 2025 ${join("AR", facts)}.`,
    `الرمز ${record.sku} مخصص لمنتج من نوع ${family} في فصل ${category}. ويسجل المصدر المعتمد ${join("AR", facts)}.`,
    `يظهر ${record.sku} في كتالوج ${category} لعام 2025 بوصفه ${family}. والحقائق المثبتة في خانته هي ${join("AR", facts)}.`,
  ] : [
    `يحدد رمز AsaDental ${record.sku} منتجاً من نوع ${family} ضمن مجموعة ${category}. ولم تُضف أي أبعاد أو مواد أو استخدامات غير موثقة.`,
    `المرجع ${record.sku} مدرج كمنتج ${family} في فصل ${category}؛ ولا تنشر الصفحة سوى الرمز والتصنيف المؤكدين.`,
    `يضع فهرس AsaDental الرمز ${record.sku} ضمن ${category} كمنتج ${family}. وتُترك الحقول التقنية غير الموجودة في المصدر دون عرض.`,
  ];
  return {
    eyebrow: record.priority === "1b" ? "سجل كتالوج جراحة القلع" : "سجل كتالوج 2025",
    title: record.catalogueName,
    metaDescription: `مرجع AsaDental ${record.sku} من نوع ${family} ضمن مجموعة ${category}${facts.length ? `، مع توثيق ${facts.slice(0, 2).join(" و")}` : ""}.`,
    introduction: introductions[variant(record.sku, introductions.length)],
    clinicalHeading: "حقائق الكتالوج الموثقة",
    clinicalSummary: facts.length ? `تثبت خانة المنتج المطابقة ${join("AR", facts)}.` : "لم يُنشر أي حقل تقني غير مؤكد إلى جانب رمز الشركة المصنّعة وتصنيف المنتج.",
    specificationHeading: "مواصفات المنتج الموثقة",
    specifications: specifications(record, "AR"),
    handlingHeading: "المادة وإعادة المعالجة",
    handlingText: arabicHandling(record),
    sourceNote: "جرت هيكلة الحقائق من صفحة كتالوج AsaDental لعام 2025 المطابقة للرمز. حُذفت الحقول المجهولة ونصوص الكتالوج التسويقية.",
    relatedHeading: "منتجات أخرى في مجموعة الكتالوج",
    relatedIntro: "تصفح مراجع AsaDental الأخرى ضمن فئة المنتج الموثقة نفسها.",
    quoteHeading: `اطلب عرضاً للمرجع ${record.sku}`,
    quoteText: "أضف الرمز كاملاً إلى قائمة العرض كي يتم التحقق من التوفر والوثائق الخاصة بهذا التكوين.",
  };
}

function englishHandling(record: Fact) {
  const parts = [];
  if (record.materials.length) parts.push(`Material: ${join("EN", record.materials.map(value => label("EN", value)))}`);
  if (record.finishes.length) parts.push(`finish: ${join("EN", record.finishes.map(value => label("EN", value)))}`);
  if (record.singleUse != null) parts.push(record.singleUse ? "listed for single use" : "listed as reusable");
  if (record.sterilizable != null) parts.push(record.sterilizable ? "listed as sterilizable" : "not listed as sterilizable");
  if (record.maxTemperatureC != null) parts.push(`maximum stated temperature ${record.maxTemperatureC}°C`);
  return parts.join("; ") + (parts.length ? "." : "");
}

function turkishHandling(record: Fact) {
  const parts = [];
  if (record.materials.length) parts.push(`Malzeme: ${join("TR", record.materials.map(value => label("TR", value)))}`);
  if (record.finishes.length) parts.push(`yüzey: ${join("TR", record.finishes.map(value => label("TR", value)))}`);
  if (record.singleUse != null) parts.push(record.singleUse ? "tek kullanımlık olarak listelenir" : "yeniden kullanılabilir olarak listelenir");
  if (record.sterilizable != null) parts.push(record.sterilizable ? "sterilize edilebilir olarak listelenir" : "sterilize edilebilir olarak listelenmez");
  if (record.maxTemperatureC != null) parts.push(`belirtilen azami sıcaklık ${record.maxTemperatureC}°C`);
  return parts.join("; ") + (parts.length ? "." : "");
}

function arabicHandling(record: Fact) {
  const parts = [];
  if (record.materials.length) parts.push(`المادة: ${join("AR", record.materials.map(value => label("AR", value)))}`);
  if (record.finishes.length) parts.push(`السطح: ${join("AR", record.finishes.map(value => label("AR", value)))}`);
  if (record.singleUse != null) parts.push(record.singleUse ? "مدرج للاستخدام مرة واحدة" : "مدرج كمنتج قابل لإعادة الاستخدام");
  if (record.sterilizable != null) parts.push(record.sterilizable ? "مدرج كمنتج قابل للتعقيم" : "غير مدرج كمنتج قابل للتعقيم");
  if (record.maxTemperatureC != null) parts.push(`أقصى درجة حرارة موثقة ${record.maxTemperatureC}°م`);
  return parts.join("؛ ") + (parts.length ? "." : "");
}

const pages = new Map<string, CatalogPageEnrichment>(facts.map(record => [record.sku, {
  sku: record.sku,
  copy: { EN: englishCopy(record), TR: turkishCopy(record), AR: arabicCopy(record) },
  relationships: [],
  overallLengthMm: record.overallLengthMm ?? undefined,
  hasHandlingFacts: Boolean(record.materials.length || record.finishes.length || record.singleUse != null || record.sterilizable != null || record.maxTemperatureC != null),
  allowCategoryFallback: true,
}]));

export function catalogProductForSku(sku: string) {
  return pages.get(sku);
}
