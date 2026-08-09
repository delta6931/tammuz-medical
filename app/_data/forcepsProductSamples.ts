/**
 * Review-gated product enrichment.
 *
 * Only these three SKUs are allowed to render the enriched layout until the
 * user approves the sample. Facts are normalized separately from native copy
 * so later matrix records can reuse the same queryable clinical structure.
 */
import confirmedLengthsJson from "../../data/asadental/overrides/confirmed-lengths.json";

export type ForcepsSampleLocale = "EN" | "TR" | "AR";

type ConfirmedLengthOverride = {
  valueMm: number;
  tolerancePlusMinusMm?: number | null;
  confirmedBy: string;
  confirmedAt: string;
  evidenceReference: string;
};

const confirmedLengths = confirmedLengthsJson as {
  overrides: Record<string, ConfirmedLengthOverride>;
};

export type SampleCopy = {
  eyebrow: string;
  title: string;
  metaDescription: string;
  introduction: string;
  clinicalHeading: string;
  clinicalSummary: string;
  specificationHeading: string;
  specifications: Array<{ label: string; value: string }>;
  handlingHeading: string;
  handlingText: string;
  sourceNote: string;
  relatedHeading: string;
  relatedIntro: string;
  quoteHeading: string;
  quoteText: string;
};

export type ForcepsProductSample = {
  sku: string;
  facts: {
    arch: "upper" | "lower";
    toothGroups: Array<"molars" | "wisdom_teeth">;
    side: "left" | "right" | null;
    patientGroup: "children" | null;
    patternCode: string;
    patternName: string | null;
    tipSerration: "serrated";
    beaksAtRest: "open" | "closed";
    overallLengthMm?: number;
    material: "Stainless Steel";
    singleUse: false;
    sterilizable: true;
    maxTemperatureC: 177;
  };
  relationships: Array<{
    sku: string;
    kind: "official_similar_product" | "official_set_member";
  }>;
  source: {
    cataloguePdfPage: number;
    matrixPdfPage: 2;
    officialProductUrl: string;
  };
  copy: Record<ForcepsSampleLocale, SampleCopy>;
};

export const forcepsProductSamples: Record<string, ForcepsProductSample> = {
  "0100-65L": {
    sku: "0100-65L",
    facts: {
      arch: "upper",
      toothGroups: ["molars"],
      side: "left",
      patientGroup: null,
      patternCode: "65L",
      patternName: null,
      tipSerration: "serrated",
      beaksAtRest: "open",
      overallLengthMm: 169,
      material: "Stainless Steel",
      singleUse: false,
      sterilizable: true,
      maxTemperatureC: 177,
    },
    relationships: [],
    source: {
      cataloguePdfPage: 7,
      matrixPdfPage: 2,
      officialProductUrl: "https://www.asadental.com/en/products/0100-65l/",
    },
    copy: {
      EN: {
        eyebrow: "Upper molar extraction forceps",
        title: "Upper-left molar extraction forceps, pattern 65L",
        metaDescription: "AsaDental 0100-65L is a side-specific extraction forceps for upper-left molars, with serrated tips and open beaks at rest.",
        introduction: "Pattern 65L is specified for extraction of upper-left molars. Its serrated tips and open beaks at rest distinguish the working profile, while the side marking identifies the intended quadrant.",
        clinicalHeading: "Anatomical application",
        clinicalSummary: "The AsaDental range-of-application matrix marks this reference for the upper arch, molar group and left side.",
        specificationHeading: "Clinical and design specification",
        specifications: [
          { label: "Arch", value: "Upper" },
          { label: "Tooth group", value: "Molars" },
          { label: "Side", value: "Left" },
          { label: "Pattern", value: "65L" },
          { label: "Tip pattern", value: "Serrated" },
          { label: "Beaks at rest", value: "Open" },
        ],
        handlingHeading: "Material and reprocessing",
        handlingText: "The official product record identifies stainless steel, marks the instrument as sterilizable and not single-use, and states a maximum reprocessing temperature of 177 °C.",
        sourceNote: "Structured from the AsaDental 2025 Extractive Surgery catalogue and verified against the official product record.",
        relatedHeading: "Verified related variants",
        relatedIntro: "No related variant is shown here because the official similar-product list does not identify a matching 65R relationship for this record.",
        quoteHeading: "Request reference 0100-65L",
        quoteText: "Add the exact code to your quote list so availability and documentation can be checked against the correct side-specific pattern.",
      },
      TR: {
        eyebrow: "Üst molar çekim forsepsi",
        title: "Üst sol molar çekim forsepsi, 65L model",
        metaDescription: "AsaDental 0100-65L; üst sol molarlar için belirtilen, tırtıklı uçlu ve istirahat halinde açık gagalı çekim forsepsidir.",
        introduction: "65L model, üst çenenin sol tarafındaki molar dişlerin çekimi için belirtilmiştir. Tırtıklı uçları ve istirahat halinde açık duran gagaları çalışma formunu tanımlar; taraf işareti hedeflenen kadranı açıkça ayırır.",
        clinicalHeading: "Anatomik kullanım alanı",
        clinicalSummary: "AsaDental kullanım matrisi bu referansı üst çene, molar diş grubu ve sol taraf için işaretler.",
        specificationHeading: "Klinik ve tasarımsal özellikler",
        specifications: [
          { label: "Çene", value: "Üst" },
          { label: "Diş grubu", value: "Molarlar" },
          { label: "Taraf", value: "Sol" },
          { label: "Model", value: "65L" },
          { label: "Uç yapısı", value: "Tırtıklı" },
          { label: "İstirahat konumundaki gagalar", value: "Açık" },
        ],
        handlingHeading: "Malzeme ve yeniden işleme",
        handlingText: "Resmî ürün kaydı malzemeyi paslanmaz çelik olarak belirtir; aleti sterilize edilebilir ve tek kullanımlık olmayan ürün şeklinde işaretler. Belirtilen azami yeniden işleme sıcaklığı 177 °C’dir.",
        sourceNote: "Veriler AsaDental 2025 Çekim Cerrahisi kataloğundan yapılandırılmış ve resmî ürün kaydıyla doğrulanmıştır.",
        relatedHeading: "Doğrulanmış ilgili varyantlar",
        relatedIntro: "Resmî benzer ürün listesi bu kayıt için eşleşen bir 65R ilişkisi belirtmediğinden burada varyant bağlantısı gösterilmemektedir.",
        quoteHeading: "0100-65L referansı için teklif isteyin",
        quoteText: "Doğru taraflı modelin bulunabilirliği ve belgeleri kontrol edilebilsin diye ürün kodunu teklif listenize aynen ekleyin.",
      },
      AR: {
        eyebrow: "ملقط خلع للأضراس العلوية",
        title: "ملقط خلع للأضراس العلوية اليسرى، نمط 65L",
        metaDescription: "AsaDental 0100-65L ملقط مخصص للأضراس العلوية اليسرى، بأطراف مسننة وفكّين مفتوحين في وضع السكون.",
        introduction: "يُحدّد النمط 65L لخلع أضراس الجهة اليسرى من الفك العلوي. وتوضح الأطراف المسننة والفكّان المفتوحان في وضع السكون هيئة العمل، بينما يبيّن رمز الجهة الربع المقصود بدقة.",
        clinicalHeading: "الاستخدام التشريحي",
        clinicalSummary: "تضع مصفوفة الاستخدام لدى AsaDental هذا المرجع ضمن الفك العلوي ومجموعة الأضراس والجهة اليسرى.",
        specificationHeading: "المواصفات السريرية والتصميمية",
        specifications: [
          { label: "الفك", value: "علوي" },
          { label: "مجموعة الأسنان", value: "الأضراس" },
          { label: "الجهة", value: "اليسرى" },
          { label: "النمط", value: "65L" },
          { label: "هيئة الأطراف", value: "مسننة" },
          { label: "الفكّان في وضع السكون", value: "مفتوحان" },
        ],
        handlingHeading: "المادة وإعادة المعالجة",
        handlingText: "يسجل ملف المنتج الرسمي أن الأداة مصنوعة من الفولاذ المقاوم للصدأ، وقابلة للتعقيم وليست أحادية الاستخدام، مع درجة حرارة قصوى لإعادة المعالجة تبلغ 177°م.",
        sourceNote: "نُظمت البيانات من فصل جراحة الخلع في كتالوج AsaDental لعام 2025، ثم طوبقت مع سجل المنتج الرسمي.",
        relatedHeading: "البدائل المرتبطة الموثقة",
        relatedIntro: "لا يظهر بديل مرتبط هنا لأن قائمة المنتجات المشابهة الرسمية لا تثبت علاقة مطابقة مع 65R لهذا المرجع.",
        quoteHeading: "اطلب عرضاً للمرجع 0100-65L",
        quoteText: "أضف الرمز كما هو إلى قائمة الطلب حتى يمكن التحقق من التوفر والوثائق للنمط الصحيح الخاص بالجهة.",
      },
    },
  },
  "0100-22L": {
    sku: "0100-22L",
    facts: {
      arch: "lower",
      toothGroups: ["molars", "wisdom_teeth"],
      side: "left",
      patientGroup: null,
      patternCode: "22L",
      patternName: "Routurier",
      tipSerration: "serrated",
      beaksAtRest: "closed",
      material: "Stainless Steel",
      singleUse: false,
      sterilizable: true,
      maxTemperatureC: 177,
    },
    relationships: [{ sku: "0100-22R", kind: "official_similar_product" }],
    source: {
      cataloguePdfPage: 4,
      matrixPdfPage: 2,
      officialProductUrl: "https://www.asadental.com/en/products/0100-22l/",
    },
    copy: {
      EN: {
        eyebrow: "Lower molar and wisdom-tooth forceps",
        title: "Lower-left molar and wisdom-tooth forceps, 22L Routurier",
        metaDescription: "AsaDental 0100-22L is the left-sided Routurier extraction forceps for lower molars and wisdom teeth, with serrated tips and closed beaks.",
        introduction: "The 22L Routurier pattern is assigned to lower-left molars and wisdom teeth. It combines a side-specific form with serrated tips and beaks that are closed at rest; 0100-22R is the officially listed right-side variant.",
        clinicalHeading: "Two lower-arch applications",
        clinicalSummary: "The matrix assigns this forceps to both the molar and wisdom-tooth columns for the left side of the lower arch.",
        specificationHeading: "Clinical and design specification",
        specifications: [
          { label: "Arch", value: "Lower" },
          { label: "Tooth groups", value: "Molars and wisdom teeth" },
          { label: "Side", value: "Left" },
          { label: "Pattern", value: "22L Routurier" },
          { label: "Tip pattern", value: "Serrated" },
          { label: "Beaks at rest", value: "Closed" },
        ],
        handlingHeading: "Material and reprocessing",
        handlingText: "The official product record identifies stainless steel, marks the instrument as sterilizable and not single-use, and states a maximum reprocessing temperature of 177 °C.",
        sourceNote: "Structured from the AsaDental 2025 Extractive Surgery catalogue and verified against the official product record.",
        relatedHeading: "Left and right Routurier variants",
        relatedIntro: "The official similar-product list links the left 22L reference to the right 22R reference.",
        quoteHeading: "Request the correct 22-series side",
        quoteText: "Add 0100-22L to your quote for the left-side reference, or open the verified 22R variant for the right side.",
      },
      TR: {
        eyebrow: "Alt molar ve yirmi yaş dişi forsepsi",
        title: "Alt sol molar ve yirmi yaş dişi forsepsi, 22L Routurier",
        metaDescription: "AsaDental 0100-22L; alt sol molar ve yirmi yaş dişleri için, tırtıklı uçlu ve kapalı gagalı Routurier çekim forsepsidir.",
        introduction: "22L Routurier model, alt çenenin sol tarafındaki molar ve yirmi yaş dişleri için sınıflandırılmıştır. Tarafa özgü formu tırtıklı uçlar ve istirahat halinde kapalı gagalarla birleşir; 0100-22R resmî olarak listelenen sağ taraf varyantıdır.",
        clinicalHeading: "Alt çenede iki kullanım alanı",
        clinicalSummary: "Matriste bu forseps alt çenenin sol tarafında hem molar hem de yirmi yaş dişi sütunlarında yer alır.",
        specificationHeading: "Klinik ve tasarımsal özellikler",
        specifications: [
          { label: "Çene", value: "Alt" },
          { label: "Diş grupları", value: "Molarlar ve yirmi yaş dişleri" },
          { label: "Taraf", value: "Sol" },
          { label: "Model", value: "22L Routurier" },
          { label: "Uç yapısı", value: "Tırtıklı" },
          { label: "İstirahat konumundaki gagalar", value: "Kapalı" },
        ],
        handlingHeading: "Malzeme ve yeniden işleme",
        handlingText: "Resmî ürün kaydı malzemeyi paslanmaz çelik olarak belirtir; aleti sterilize edilebilir ve tek kullanımlık olmayan ürün şeklinde işaretler. Belirtilen azami yeniden işleme sıcaklığı 177 °C’dir.",
        sourceNote: "Veriler AsaDental 2025 Çekim Cerrahisi kataloğundan yapılandırılmış ve resmî ürün kaydıyla doğrulanmıştır.",
        relatedHeading: "Sol ve sağ Routurier varyantları",
        relatedIntro: "Resmî benzer ürün listesi sol 22L referansını sağ 22R referansıyla ilişkilendirir.",
        quoteHeading: "Doğru 22 serisi tarafını isteyin",
        quoteText: "Sol taraf için 0100-22L kodunu teklifinize ekleyin; sağ taraf için doğrulanmış 22R varyantını açın.",
      },
      AR: {
        eyebrow: "ملقط للأضراس السفلية وضرس العقل",
        title: "ملقط خلع للأضراس السفلية اليسرى وضرس العقل، 22L Routurier",
        metaDescription: "AsaDental 0100-22L هو نمط Routurier للجهة اليسرى، مخصص للأضراس السفلية وضرس العقل بأطراف مسننة وفكّين مغلقين.",
        introduction: "يُصنف نمط 22L Routurier لخلع الأضراس وضروس العقل في الجهة اليسرى من الفك السفلي. ويجمع بين تصميم خاص بالجهة وأطراف مسننة وفكّين مغلقين في وضع السكون؛ أما 0100-22R فهو البديل الرسمي للجهة اليمنى.",
        clinicalHeading: "استخدامان في الفك السفلي",
        clinicalSummary: "تضع المصفوفة هذا الملقط في خانتي الأضراس وضروس العقل للجهة اليسرى من الفك السفلي.",
        specificationHeading: "المواصفات السريرية والتصميمية",
        specifications: [
          { label: "الفك", value: "سفلي" },
          { label: "مجموعات الأسنان", value: "الأضراس وضروس العقل" },
          { label: "الجهة", value: "اليسرى" },
          { label: "النمط", value: "22L Routurier" },
          { label: "هيئة الأطراف", value: "مسننة" },
          { label: "الفكّان في وضع السكون", value: "مغلقان" },
        ],
        handlingHeading: "المادة وإعادة المعالجة",
        handlingText: "يسجل ملف المنتج الرسمي أن الأداة مصنوعة من الفولاذ المقاوم للصدأ، وقابلة للتعقيم وليست أحادية الاستخدام، مع درجة حرارة قصوى لإعادة المعالجة تبلغ 177°م.",
        sourceNote: "نُظمت البيانات من فصل جراحة الخلع في كتالوج AsaDental لعام 2025، ثم طوبقت مع سجل المنتج الرسمي.",
        relatedHeading: "نسختا Routurier اليسرى واليمنى",
        relatedIntro: "تربط قائمة المنتجات المشابهة الرسمية بين المرجع الأيسر 22L والمرجع الأيمن 22R.",
        quoteHeading: "اختر الجهة الصحيحة من سلسلة 22",
        quoteText: "أضف 0100-22L للجهة اليسرى، أو افتح البديل الموثق 22R عند الحاجة إلى الجهة اليمنى.",
      },
    },
  },
  "0112-3": {
    sku: "0112-3",
    facts: {
      arch: "upper",
      toothGroups: ["molars"],
      side: null,
      patientGroup: "children",
      patternCode: "3",
      patternName: "Klein",
      tipSerration: "serrated",
      beaksAtRest: "open",
      overallLengthMm: 128,
      material: "Stainless Steel",
      singleUse: false,
      sterilizable: true,
      maxTemperatureC: 177,
    },
    relationships: [
      { sku: "0112-1", kind: "official_set_member" },
      { sku: "0112-2", kind: "official_set_member" },
      { sku: "0112-4", kind: "official_set_member" },
      { sku: "0112-5", kind: "official_set_member" },
      { sku: "0112-6", kind: "official_set_member" },
      { sku: "0112-7", kind: "official_set_member" },
    ],
    source: {
      cataloguePdfPage: 20,
      matrixPdfPage: 2,
      officialProductUrl: "https://www.asadental.com/en/products/0112-3/",
    },
    copy: {
      EN: {
        eyebrow: "Children’s upper molar forceps",
        title: "Children’s upper molar extraction forceps, Klein pattern 3",
        metaDescription: "AsaDental 0112-3 is a Klein-pattern children’s extraction forceps for upper molars, with serrated tips, open beaks and a 128 mm length.",
        introduction: "Reference 0112-3 belongs to the Klein-pattern children’s forceps range and is assigned to upper molars. The catalogue identifies serrated tips, open beaks at rest and a compact overall length verified at 128 mm.",
        clinicalHeading: "Paediatric upper-molar application",
        clinicalSummary: "Both the children and upper-molar columns are marked for this reference in the range-of-application matrix.",
        specificationHeading: "Clinical and design specification",
        specifications: [
          { label: "Patient group", value: "Children" },
          { label: "Arch", value: "Upper" },
          { label: "Tooth group", value: "Molars" },
          { label: "Pattern", value: "Klein 3" },
          { label: "Tip pattern", value: "Serrated" },
          { label: "Beaks at rest", value: "Open" },
        ],
        handlingHeading: "Material and reprocessing",
        handlingText: "The official product record identifies stainless steel, marks the instrument as sterilizable and not single-use, and states a maximum reprocessing temperature of 177 °C.",
        sourceNote: "The S0112 set table in Chapter 4 explicitly groups references 0112-1 through 0112-7 in the Klein children’s range.",
        relatedHeading: "Other instruments in the S0112 children’s set",
        relatedIntro: "These references are linked because the official Chapter 4 set table groups them together; they are not inferred procedure companions.",
        quoteHeading: "Request reference 0112-3",
        quoteText: "Add the exact code to your quote list to distinguish the upper-molar pattern from the other instruments in the children’s set.",
      },
      TR: {
        eyebrow: "Çocuklar için üst molar forsepsi",
        title: "Çocuklar için üst molar çekim forsepsi, Klein model 3",
        metaDescription: "AsaDental 0112-3; çocukların üst molar dişleri için Klein model, tırtıklı uçlu, açık gagalı ve 128 mm uzunluğunda çekim forsepsidir.",
        introduction: "0112-3 referansı çocuklara yönelik Klein model forseps grubunda yer alır ve üst molar dişler için belirtilmiştir. Katalog tırtıklı uçları ve istirahat halinde açık gagaları gösterir; toplam uzunluk 128 mm olarak doğrulanmıştır.",
        clinicalHeading: "Çocuklarda üst molar kullanımı",
        clinicalSummary: "Kullanım matrisinde bu referans için hem çocuklar hem de üst molarlar sütunu işaretlidir.",
        specificationHeading: "Klinik ve tasarımsal özellikler",
        specifications: [
          { label: "Hasta grubu", value: "Çocuklar" },
          { label: "Çene", value: "Üst" },
          { label: "Diş grubu", value: "Molarlar" },
          { label: "Model", value: "Klein 3" },
          { label: "Uç yapısı", value: "Tırtıklı" },
          { label: "İstirahat konumundaki gagalar", value: "Açık" },
        ],
        handlingHeading: "Malzeme ve yeniden işleme",
        handlingText: "Resmî ürün kaydı malzemeyi paslanmaz çelik olarak belirtir; aleti sterilize edilebilir ve tek kullanımlık olmayan ürün şeklinde işaretler. Belirtilen azami yeniden işleme sıcaklığı 177 °C’dir.",
        sourceNote: "4. bölümdeki S0112 set tablosu, 0112-1 ile 0112-7 arasındaki referansları çocuklara yönelik Klein grubunda açıkça bir araya getirir.",
        relatedHeading: "S0112 çocuk setindeki diğer aletler",
        relatedIntro: "Bu referanslar resmî 4. bölüm set tablosunda birlikte gösterildiği için bağlanmıştır; işlem eşlikçisi oldukları varsayılmamıştır.",
        quoteHeading: "0112-3 referansı için teklif isteyin",
        quoteText: "Çocuk setindeki diğer modellerden üst molar modelini ayırmak için ürün kodunu teklif listenize aynen ekleyin.",
      },
      AR: {
        eyebrow: "ملقط أضراس علوية للأطفال",
        title: "ملقط خلع أضراس علوية للأطفال، نمط Klein 3",
        metaDescription: "AsaDental 0112-3 ملقط أطفال بنمط Klein للأضراس العلوية، بأطراف مسننة وفكّين مفتوحين وطول كلي 128 مم.",
        introduction: "ينتمي المرجع 0112-3 إلى مجموعة ملاقط الأطفال بنمط Klein، ومخصص للأضراس العلوية. ويبين الكتالوج أطرافاً مسننة وفكّين مفتوحين في وضع السكون، مع طول كلي مؤكد يبلغ 128 مم.",
        clinicalHeading: "استخدام أضراس الفك العلوي لدى الأطفال",
        clinicalSummary: "تظهر علامتا الأطفال والأضراس العلوية معاً لهذا المرجع في مصفوفة نطاق الاستخدام.",
        specificationHeading: "المواصفات السريرية والتصميمية",
        specifications: [
          { label: "فئة المرضى", value: "الأطفال" },
          { label: "الفك", value: "علوي" },
          { label: "مجموعة الأسنان", value: "الأضراس" },
          { label: "النمط", value: "Klein 3" },
          { label: "هيئة الأطراف", value: "مسننة" },
          { label: "الفكّان في وضع السكون", value: "مفتوحان" },
        ],
        handlingHeading: "المادة وإعادة المعالجة",
        handlingText: "يسجل ملف المنتج الرسمي أن الأداة مصنوعة من الفولاذ المقاوم للصدأ، وقابلة للتعقيم وليست أحادية الاستخدام، مع درجة حرارة قصوى لإعادة المعالجة تبلغ 177°م.",
        sourceNote: "يجمع جدول الطقم S0112 في الفصل الرابع المراجع من 0112-1 إلى 0112-7 صراحة ضمن مجموعة Klein للأطفال.",
        relatedHeading: "الأدوات الأخرى في طقم الأطفال S0112",
        relatedIntro: "رُبطت هذه المراجع لأن جدول الطقم الرسمي في الفصل الرابع يجمعها معاً، وليس بناءً على افتراض أنها أدوات مرافقة للإجراء.",
        quoteHeading: "اطلب عرضاً للمرجع 0112-3",
        quoteText: "أضف الرمز كما هو إلى قائمة الطلب لتمييز نمط الأضراس العلوية عن بقية أدوات طقم الأطفال.",
      },
    },
  },
};

export function forcepsProductSampleForSku(sku: string) {
  return forcepsProductSamples[sku];
}

/** A confirmed override wins; otherwise use the already-verified sample value. */
export function forcepsOverallLengthMm(sample: ForcepsProductSample) {
  return confirmedLengths.overrides[sample.sku]?.valueMm ?? sample.facts.overallLengthMm;
}

export function localizedOverallLength(locale: ForcepsSampleLocale, valueMm: number) {
  if (locale === "TR") return { label: "Toplam uzunluk", value: `${valueMm} mm` };
  if (locale === "AR") return { label: "الطول الكلي", value: `${valueMm} مم` };
  return { label: "Overall length", value: `${valueMm} mm` };
}
