import type { SiteLocale } from "../../_lib/catalog";
import type { ToolShellLabels } from "../../_components/ToolShell";
import type { TermCategory } from "../_lib/dental-terms";
import { toolsIndexStrings } from "./tools-index";

export type TerminologyStrings = {
  meta:{title:string;description:string}; shell:ToolShellLabels; search:string; placeholder:string; all:string;
  categories:Record<TermCategory,string>; headings:{en:string;tr:string;ar:string}; count:(n:number)=>string; empty:string;
  note:string; faqEyebrow:string; faqHeading:string; faq:{q:string;a:string}[]; cta:{question:string;button:string};
};

export const terminologyStrings:Record<SiteLocale,TerminologyStrings>={
  EN:{
    meta:{title:"English–Turkish–Arabic Dental Instrument Dictionary | Tammuz Medical",description:"Search dental instrument and anatomy terms side by side in English, Turkish and Arabic for clinic procurement and catalogue work."},
    shell:{...toolsIndexStrings.EN.shell,eyebrow:"Free trilingual reference",title:"Dental instrument terminology dictionary",lede:"Search practical dental instrument and anatomy terms side by side in English, Turkish and Arabic. Built for clinics, distributors and procurement teams working across Turkey and Iraq."},
    search:"Search in any language",placeholder:"e.g. forceps, davye, كلّابة",all:"All terms",categories:{anatomy:"Anatomy",diagnostic:"Diagnostic",surgical:"Surgical",restorative:"Restorative",periodontal:"Periodontal",endo:"Endodontic",procurement:"Procurement"},headings:{en:"English",tr:"Türkçe",ar:"العربية"},count:n=>`${n} term${n===1?"":"s"}`,empty:"No matching term. Try another spelling or category.",
    note:"Terminology varies by country, school and manufacturer. Use catalogue codes—not translated names alone—when ordering a specific instrument.",faqEyebrow:"Using the dictionary",faqHeading:"Clear terminology for cross-border procurement",faq:[{q:"Can I search in Arabic or Turkish?",a:"Yes. The same search box checks the English, Turkish and Arabic form of every entry."},{q:"Are these product specifications?",a:"No. The dictionary helps identify terminology; it does not assert dimensions, materials or clinical indications for a particular product."},{q:"How should I request an exact instrument?",a:"Include the manufacturer and catalogue code whenever possible, then use the trilingual term to clarify the instrument family."}],cta:{question:"Need help matching an instrument name to a catalogue code?",button:"Contact procurement"}
  },
  TR:{
    meta:{title:"İngilizce–Türkçe–Arapça Dental Alet Sözlüğü | Tammuz Medical",description:"Klinik satın alma ve katalog çalışmaları için dental alet ve anatomi terimlerini İngilizce, Türkçe ve Arapça yan yana arayın."},
    shell:{...toolsIndexStrings.TR.shell,eyebrow:"Ücretsiz üç dilli referans",title:"Dental alet terimleri sözlüğü",lede:"Pratik dental alet ve anatomi terimlerini İngilizce, Türkçe ve Arapça yan yana arayın. Türkiye ve Irak arasında çalışan klinikler, distribütörler ve satın alma ekipleri için hazırlandı."},
    search:"Herhangi bir dilde arayın",placeholder:"örn. forceps, davye, كلّابة",all:"Tüm terimler",categories:{anatomy:"Anatomi",diagnostic:"Diagnostik",surgical:"Cerrahi",restorative:"Restoratif",periodontal:"Periodontal",endo:"Endodontik",procurement:"Satın alma"},headings:{en:"English",tr:"Türkçe",ar:"العربية"},count:n=>`${n} terim`,empty:"Eşleşen terim bulunamadı. Başka bir yazım veya kategori deneyin.",
    note:"Terimler ülkeye, fakülteye ve üreticiye göre değişebilir. Belirli bir aleti sipariş ederken yalnızca çevrilmiş ada değil katalog koduna başvurun.",faqEyebrow:"Sözlüğün kullanımı",faqHeading:"Sınır ötesi satın alma için açık terimler",faq:[{q:"Arapça veya Türkçe arama yapabilir miyim?",a:"Evet. Aynı arama kutusu her kaydın İngilizce, Türkçe ve Arapça karşılığını tarar."},{q:"Bunlar ürün özellikleri mi?",a:"Hayır. Sözlük terimi tanımlamaya yardımcı olur; belirli bir ürünün ölçüsü, malzemesi veya klinik endikasyonunu belirtmez."},{q:"Tam olarak istediğim aleti nasıl belirtmeliyim?",a:"Mümkünse üretici ve katalog kodunu ekleyin; alet ailesini açıklamak için üç dilli terimi kullanın."}],cta:{question:"Bir alet adını katalog koduyla eşleştirmek için yardım mı gerekiyor?",button:"Satın alma ekibine yazın"}
  },
  AR:{
    meta:{title:"قاموس أدوات الأسنان عربي–تركي–إنجليزي | Tammuz Medical",description:"ابحث عن مصطلحات أدوات الأسنان والتشريح جنباً إلى جنب بالعربية والتركية والإنجليزية لأعمال العيادات والمشتريات."},
    shell:{...toolsIndexStrings.AR.shell,eyebrow:"مرجع مجاني بثلاث لغات",title:"قاموس مصطلحات أدوات الأسنان",lede:"ابحث عن مصطلحات عملية لأدوات الأسنان والتشريح بالإنجليزية والتركية والعربية جنباً إلى جنب. أُعدّ للعيادات والموزعين وفرق المشتريات العاملة بين تركيا والعراق."},
    search:"ابحث بأي لغة",placeholder:"مثال: forceps أو davye أو كلّابة",all:"جميع المصطلحات",categories:{anatomy:"التشريح",diagnostic:"التشخيص",surgical:"الجراحة",restorative:"الترميم",periodontal:"دواعم السن",endo:"علاج الجذور",procurement:"المشتريات"},headings:{en:"English",tr:"Türkçe",ar:"العربية"},count:n=>`${n} مصطلحاً`,empty:"لا يوجد مصطلح مطابق. جرّب كتابة أخرى أو فئة مختلفة.",
    note:"قد تختلف المصطلحات باختلاف البلد والكلية والمصنّع. استخدم رمز الكتالوج، لا الاسم المترجم وحده، عند طلب أداة محددة.",faqEyebrow:"استخدام القاموس",faqHeading:"مصطلحات واضحة للمشتريات عبر الحدود",faq:[{q:"هل يمكنني البحث بالعربية أو التركية؟",a:"نعم. يبحث الحقل نفسه في المقابل الإنجليزي والتركي والعربي لكل مدخل."},{q:"هل هذه مواصفات للمنتجات؟",a:"لا. يساعد القاموس في تحديد المصطلح، ولا يثبت أبعاد منتج معين أو مادته أو دواعي استعماله السريرية."},{q:"كيف أطلب الأداة المحددة بدقة؟",a:"أرفق اسم المصنّع ورمز الكتالوج متى أمكن، ثم استخدم المصطلح الثلاثي لتوضيح عائلة الأداة."}],cta:{question:"هل تحتاج مساعدة في مطابقة اسم أداة مع رمز الكتالوج؟",button:"تواصل مع المشتريات"}
  }
};
