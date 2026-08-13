export type TermCategory = "anatomy" | "diagnostic" | "surgical" | "restorative" | "periodontal" | "endo" | "procurement";
export type DentalTerm = { id: string; category: TermCategory; en: string; tr: string; ar: string };

export const DENTAL_TERMS: DentalTerm[] = [
  { id: "dental-mirror", category: "diagnostic", en: "Dental mirror", tr: "Ağız aynası", ar: "مرآة فموية" },
  { id: "explorer", category: "diagnostic", en: "Dental explorer", tr: "Dental sond", ar: "مسبار سني" },
  { id: "periodontal-probe", category: "periodontal", en: "Periodontal probe", tr: "Periodontal sond", ar: "مسبار دواعم السن" },
  { id: "scaler", category: "periodontal", en: "Scaler", tr: "Diş taşı kazıyıcısı", ar: "مقلحة" },
  { id: "curette", category: "periodontal", en: "Curette", tr: "Küret", ar: "مكشطة" },
  { id: "gracey-curette", category: "periodontal", en: "Gracey curette", tr: "Gracey küreti", ar: "مكشطة غرايسي" },
  { id: "extraction-forceps", category: "surgical", en: "Extraction forceps", tr: "Diş çekme davyesi", ar: "كلّابة قلع" },
  { id: "root-elevator", category: "surgical", en: "Root elevator", tr: "Kök elevatörü", ar: "رافعة جذور" },
  { id: "periosteal-elevator", category: "surgical", en: "Periosteal elevator", tr: "Periost elevatörü", ar: "رافعة السمحاق" },
  { id: "rongeur", category: "surgical", en: "Bone rongeur", tr: "Kemik ronjuru", ar: "قاضمة عظم" },
  { id: "needle-holder", category: "surgical", en: "Needle holder", tr: "Portegü", ar: "ماسك إبرة" },
  { id: "hemostat", category: "surgical", en: "Hemostatic forceps", tr: "Hemostatik pens", ar: "ملقط مرقئ" },
  { id: "surgical-scissors", category: "surgical", en: "Surgical scissors", tr: "Cerrahi makas", ar: "مقص جراحي" },
  { id: "retractor", category: "surgical", en: "Retractor", tr: "Ekartör", ar: "مبعد" },
  { id: "excavator", category: "restorative", en: "Excavator", tr: "Ekskavatör", ar: "حفّارة عاج" },
  { id: "plugger", category: "restorative", en: "Plugger / condenser", tr: "Plugger / kondansör", ar: "مكثّف" },
  { id: "burnisher", category: "restorative", en: "Burnisher", tr: "Brunvar", ar: "مملّس" },
  { id: "carver", category: "restorative", en: "Carver", tr: "Şekillendirme aleti", ar: "أداة نحت" },
  { id: "matrix-retainer", category: "restorative", en: "Matrix retainer", tr: "Matris tutucu", ar: "حامل المصفوفة" },
  { id: "rubber-dam-clamp", category: "restorative", en: "Rubber dam clamp", tr: "Lastik örtü klempi", ar: "مشبك الحاجز المطاطي" },
  { id: "clamp-forceps", category: "restorative", en: "Clamp forceps", tr: "Klemp pensi", ar: "ملقط المشابك" },
  { id: "impression-tray", category: "restorative", en: "Impression tray", tr: "Ölçü kaşığı", ar: "ملعقة طبعة" },
  { id: "root-canal-file", category: "endo", en: "Root canal file", tr: "Kök kanal eğesi", ar: "مِبرد قناة الجذر" },
  { id: "spreader", category: "endo", en: "Root canal spreader", tr: "Kök kanal spreaderi", ar: "ناشر قنوات الجذور" },
  { id: "endo-ruler", category: "endo", en: "Endodontic ruler", tr: "Endodontik cetvel", ar: "مسطرة لبّية" },
  { id: "upper-jaw", category: "anatomy", en: "Upper jaw / maxilla", tr: "Üst çene / maksilla", ar: "الفك العلوي" },
  { id: "lower-jaw", category: "anatomy", en: "Lower jaw / mandible", tr: "Alt çene / mandibula", ar: "الفك السفلي" },
  { id: "incisor", category: "anatomy", en: "Incisor", tr: "Kesici diş", ar: "قاطع" },
  { id: "canine", category: "anatomy", en: "Canine", tr: "Kanin", ar: "ناب" },
  { id: "premolar", category: "anatomy", en: "Premolar", tr: "Küçük azı", ar: "ضاحك" },
  { id: "molar", category: "anatomy", en: "Molar", tr: "Büyük azı", ar: "رحى" },
  { id: "root", category: "anatomy", en: "Root", tr: "Kök", ar: "جذر" },
  { id: "mesial", category: "anatomy", en: "Mesial", tr: "Mezial", ar: "أنسي" },
  { id: "distal", category: "anatomy", en: "Distal", tr: "Distal", ar: "وحشي" },
  { id: "buccal", category: "anatomy", en: "Buccal", tr: "Bukkal", ar: "شدقي" },
  { id: "lingual", category: "anatomy", en: "Lingual", tr: "Lingual", ar: "لساني" },
  { id: "palatal", category: "anatomy", en: "Palatal", tr: "Palatinal", ar: "حنكي" },
  { id: "serrated", category: "procurement", en: "Serrated", tr: "Tırtıklı", ar: "مسنّن" },
  { id: "sterilizable", category: "procurement", en: "Sterilizable", tr: "Sterilize edilebilir", ar: "قابل للتعقيم" },
  { id: "single-use", category: "procurement", en: "Single-use", tr: "Tek kullanımlık", ar: "أحادي الاستعمال" },
  { id: "instrument-set", category: "procurement", en: "Instrument set", tr: "Alet seti", ar: "طقم أدوات" },
  { id: "catalogue-code", category: "procurement", en: "Catalogue code", tr: "Katalog kodu", ar: "رمز الكتالوج" },
];

export function searchDentalTerms(query: string, category: TermCategory | "all" = "all") {
  const needle = query.trim().toLocaleLowerCase();
  return DENTAL_TERMS.filter(term => {
    if (category !== "all" && term.category !== category) return false;
    if (!needle) return true;
    return [term.en, term.tr, term.ar].some(value => value.toLocaleLowerCase().includes(needle));
  });
}
