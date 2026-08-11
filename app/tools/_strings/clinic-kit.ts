import type { SiteLocale } from "../../_lib/catalog";
import type { ToolShellLabels } from "../../_components/ToolShell";

/** Copy for the clinic setup builder, written natively per language. */

export type ClinicKitStrings = {
  meta: { title: string; description: string };
  shell: ToolShellLabels;
  areas: Record<string, string>;
  step1: { legend: string; label: string; hint: string };
  step2: { legend: string; hint: string; selectAll: string; clear: string };
  step3: { legend: string; empty: string; perRoom: string; add: string; added: string };
  summary: {
    heading: string; empty: string; lines: string; totalUnits: string;
    remove: string; copy: string; copied: string; whatsapp: string; quote: string;
    subject: string;
  };
  disclaimer: string;
  faqEyebrow: string; faqHeading: string;
  faq: { q: string; a: string }[];
};

export const clinicKitStrings: Record<SiteLocale, ClinicKitStrings> = {
  EN: {
    meta: {
      title: "Clinic Setup Kit Builder — Equip a New Dental Surgery | Tammuz Medical",
      description:
        "Building or expanding a dental clinic? Pick your treatment areas and number of rooms, and assemble a complete AsaDental instrument set list ready to send for a quote.",
    },
    shell: {
      eyebrow: "Free procurement tool", title: "Clinic setup builder",
      lede: "Opening a new surgery or adding chairs? Choose the treatment areas you will cover and how many rooms you are equipping, then build a list of AsaDental instrument sets and send it straight to us for a quotation.",
      home: "Home", tools: "Tools", catalog: "Catalog", contact: "Contact", manufacturers: "Manufacturers",
      navLabel: "Tools",
      footerBlurb: "European dental instruments for clinics, distributors and procurement teams in Turkey and Iraq.",
      footerCatalogHead: "Catalog", footerAllReferences: "All references", footerExtractive: "Extractive surgery",
      footerCompanyHead: "Company",
      legalLine: "Tammuz Global Medical — B2B dental supply, Turkey & Iraq.",
      legalPrices: "Prices on request. Product data published by AsaDental.",
    },
    areas: {
      diagnostic: "Examination & diagnostic", extraction: "Extraction", periodontal: "Periodontal",
      restorative: "Restorative", impression: "Impression & prosthetics", oral_surgery: "Oral surgery",
      implant: "Implant surgery", laboratory: "Laboratory", other: "Other instruments",
    },
    step1: { legend: "1. How many treatment rooms?", label: "Treatment rooms / chairs", hint: "Quantities default to one set per room. You can change any line afterwards." },
    step2: { legend: "2. Which treatment areas?", hint: "Pick everything the clinic will offer. Only sets from these areas are shown below.", selectAll: "Select all", clear: "Clear" },
    step3: { legend: "3. Choose the sets you need", empty: "Select at least one treatment area above.", perRoom: "per room", add: "Add", added: "Added" },
    summary: {
      heading: "Your setup list", empty: "Nothing added yet. Choose sets above to build your list.",
      lines: "sets", totalUnits: "units in total", remove: "Remove",
      copy: "Copy list", copied: "Copied", whatsapp: "Send on WhatsApp", quote: "Request a quote",
      subject: "Clinic setup enquiry — AsaDental instrument sets",
    },
    disclaimer:
      "These are AsaDental's own published set products. The product name states what each set contains; exact contents and current availability are confirmed on quotation. This is a procurement aid, not clinical advice.",
    faqEyebrow: "Setting up a clinic",
    faqHeading: "Questions about equipping a new surgery",
    faq: [
      { q: "How many instrument sets does one treatment room need?", a: "It depends entirely on your sterilisation cycle and patient throughput. A common approach is enough sets per room to cover a full session between autoclave runs, so a busy surgery may hold three or four of a frequently used set and only one of a specialist set. Start with one per room here, then raise the lines you know you will turn over quickly." },
      { q: "Why does the tool not list what is inside each set?", a: "AsaDental prints set contents in its catalogue, but we only publish specifications we can verify item by item. Rather than show you a list that might be wrong, we show the set as the manufacturer names it and confirm the exact contents with you on quotation. If you need the full breakdown before ordering, ask and we will send it." },
      { q: "Can I mix individual instruments with sets?", a: "Yes. Sets are usually the cheaper way to cover a treatment area, but most clinics add individual references for the patterns they prefer. Build the set list here, then add individual item codes in your message or browse the full catalogue." },
      { q: "Do you supply clinics outside Turkey and Iraq?", a: "Our supply, documentation and inspection process is built around Turkey and Iraq. Send us your requirement anyway and we will tell you honestly whether we can serve your market." },
      { q: "What happens after I send the list?", a: "We check availability, confirm the exact contents of each set, and come back with a quotation including documentation and delivery terms. Prices are always quoted per order — we do not publish price lists." },
    ],
  },

  TR: {
    meta: {
      title: "Klinik Kurulum Seti Oluşturucu — Yeni Muayenehane Donanımı | Tammuz Medical",
      description:
        "Klinik mi kuruyorsunuz veya büyütüyor musunuz? Tedavi alanlarını ve oda sayısını seçin, komple AsaDental alet seti listesini oluşturup teklif için gönderin.",
    },
    shell: {
      eyebrow: "Ücretsiz satın alma aracı", title: "Klinik kurulum oluşturucu",
      lede: "Yeni bir muayenehane mi açıyorsunuz ya da ünit mi ekliyorsunuz? Sunacağınız tedavi alanlarını ve donatacağınız oda sayısını seçin, AsaDental alet setlerinden bir liste oluşturup teklif için doğrudan bize gönderin.",
      home: "Ana sayfa", tools: "Araçlar", catalog: "Katalog", contact: "İletişim", manufacturers: "Üreticiler",
      navLabel: "Araçlar",
      footerBlurb: "Türkiye ve Irak'taki klinikler, distribütörler ve satın alma ekipleri için Avrupa dental aletleri.",
      footerCatalogHead: "Katalog", footerAllReferences: "Tüm referanslar", footerExtractive: "Çekim cerrahisi",
      footerCompanyHead: "Kurumsal",
      legalLine: "Tammuz Global Medical — Türkiye ve Irak için B2B dental tedarik.",
      legalPrices: "Fiyatlar talep üzerine. Ürün verileri AsaDental tarafından yayımlanmıştır.",
    },
    areas: {
      diagnostic: "Muayene ve teşhis", extraction: "Çekim", periodontal: "Periodontal",
      restorative: "Restoratif", impression: "Ölçü ve protez", oral_surgery: "Ağız cerrahisi",
      implant: "İmplant cerrahisi", laboratory: "Laboratuvar", other: "Diğer aletler",
    },
    step1: { legend: "1. Kaç tedavi odası?", label: "Tedavi odası / ünit", hint: "Miktarlar oda başına bir set olarak başlar. Sonrasında her satırı değiştirebilirsiniz." },
    step2: { legend: "2. Hangi tedavi alanları?", hint: "Kliniğin sunacağı her alanı seçin. Aşağıda yalnızca bu alanlardaki setler gösterilir.", selectAll: "Tümünü seç", clear: "Temizle" },
    step3: { legend: "3. İhtiyacınız olan setleri seçin", empty: "Yukarıdan en az bir tedavi alanı seçin.", perRoom: "oda başına", add: "Ekle", added: "Eklendi" },
    summary: {
      heading: "Kurulum listeniz", empty: "Henüz bir şey eklenmedi. Listenizi oluşturmak için yukarıdan set seçin.",
      lines: "set", totalUnits: "toplam adet", remove: "Kaldır",
      copy: "Listeyi kopyala", copied: "Kopyalandı", whatsapp: "WhatsApp ile gönder", quote: "Teklif isteyin",
      subject: "Klinik kurulum talebi — AsaDental alet setleri",
    },
    disclaimer:
      "Bunlar AsaDental'in kendi yayımladığı set ürünleridir. Ürün adı her setin içeriğini belirtir; kesin içerik ve güncel stok durumu teklif aşamasında teyit edilir. Bu bir satın alma yardımcısıdır, klinik tavsiye değildir.",
    faqEyebrow: "Klinik kurulumu",
    faqHeading: "Yeni muayenehane donanımı hakkında sorular",
    faq: [
      { q: "Bir tedavi odası için kaç alet seti gerekir?", a: "Bu tamamen sterilizasyon döngünüze ve hasta sirkülasyonunuza bağlıdır. Yaygın yaklaşım, otoklav turları arasında bir seansı karşılayacak kadar set bulundurmaktır; yoğun bir klinik sık kullanılan bir setten üç dört adet, özel bir setten ise yalnızca bir adet tutabilir. Burada oda başına bir setle başlayın, hızlı döneceğini bildiğiniz satırları artırın." },
      { q: "Araç neden her setin içeriğini listelemiyor?", a: "AsaDental set içeriklerini katalogunda yayımlıyor, ancak biz yalnızca kalem kalem doğrulayabildiğimiz özellikleri yayımlıyoruz. Yanlış olabilecek bir liste göstermek yerine seti üreticinin adlandırdığı şekilde gösteriyor, kesin içeriği teklif aşamasında sizinle teyit ediyoruz. Sipariş öncesi tam dökümü isterseniz söyleyin, gönderelim." },
      { q: "Setlerle tekil aletleri birlikte alabilir miyim?", a: "Evet. Setler bir tedavi alanını karşılamanın genellikle daha ekonomik yoludur, ancak çoğu klinik tercih ettiği modeller için tekil referanslar ekler. Set listesini burada oluşturun, mesajınıza tekil ürün kodlarını ekleyin veya tam katalogu inceleyin." },
      { q: "Türkiye ve Irak dışına tedarik yapıyor musunuz?", a: "Tedarik, belge ve kontrol sürecimiz Türkiye ve Irak üzerine kuruludur. Yine de talebinizi gönderin; pazarınıza hizmet verip veremeyeceğimizi açıkça söyleyelim." },
      { q: "Listeyi gönderdikten sonra ne oluyor?", a: "Stok durumunu kontrol eder, her setin kesin içeriğini teyit eder ve belge ile teslim koşullarını içeren bir teklifle döneriz. Fiyatlar her zaman siparişe göre verilir — fiyat listesi yayımlamıyoruz." },
    ],
  },

  AR: {
    meta: {
      title: "أداة تجهيز العيادة — جهّز عيادة أسنان جديدة | Tammuz Medical",
      description:
        "هل تفتتح عيادة أسنان أو توسّعها؟ اختر مجالات العلاج وعدد الغرف، وكوّن قائمة كاملة بأطقم أدوات AsaDental جاهزة للإرسال للحصول على عرض سعر.",
    },
    shell: {
      eyebrow: "أداة شراء مجانية", title: "أداة تجهيز العيادة",
      lede: "هل تفتتح عيادة جديدة أو تضيف كراسي؟ اختر مجالات العلاج التي ستغطّيها وعدد الغرف التي تجهّزها، ثم كوّن قائمة بأطقم أدوات AsaDental وأرسلها إلينا مباشرة للحصول على عرض سعر.",
      home: "الرئيسية", tools: "الأدوات", catalog: "الكتالوج", contact: "تواصل معنا", manufacturers: "المصنّعون",
      navLabel: "الأدوات",
      footerBlurb: "أدوات أسنان أوروبية للعيادات والموزّعين وفرق المشتريات في تركيا والعراق.",
      footerCatalogHead: "الكتالوج", footerAllReferences: "جميع المراجع", footerExtractive: "جراحة القلع",
      footerCompanyHead: "الشركة",
      legalLine: "Tammuz Global Medical — توريد مستلزمات طب الأسنان بين الشركات، تركيا والعراق.",
      legalPrices: "الأسعار عند الطلب. بيانات المنتجات منشورة من AsaDental.",
    },
    areas: {
      diagnostic: "الفحص والتشخيص", extraction: "القلع", periodontal: "أمراض اللثة",
      restorative: "الترميم", impression: "الطبعات والتعويضات", oral_surgery: "جراحة الفم",
      implant: "جراحة الزراعة", laboratory: "المختبر", other: "أدوات أخرى",
    },
    step1: { legend: "١. كم عدد غرف العلاج؟", label: "غرف العلاج / الكراسي", hint: "تبدأ الكميات بطقم واحد لكل غرفة، ويمكنك تعديل أي بند لاحقاً." },
    step2: { legend: "٢. أي مجالات علاجية؟", hint: "اختر كل ما ستقدّمه العيادة. لن تظهر أدناه سوى الأطقم الخاصة بهذه المجالات.", selectAll: "اختيار الكل", clear: "مسح" },
    step3: { legend: "٣. اختر الأطقم التي تحتاجها", empty: "اختر مجالاً علاجياً واحداً على الأقل من الأعلى.", perRoom: "لكل غرفة", add: "إضافة", added: "أُضيف" },
    summary: {
      heading: "قائمة التجهيز", empty: "لم تُضف أي عناصر بعد. اختر أطقماً من الأعلى لتكوين قائمتك.",
      lines: "طقم", totalUnits: "وحدة إجمالاً", remove: "إزالة",
      copy: "نسخ القائمة", copied: "تم النسخ", whatsapp: "أرسل عبر واتساب", quote: "اطلب عرض سعر",
      subject: "طلب تجهيز عيادة — أطقم أدوات AsaDental",
    },
    disclaimer:
      "هذه أطقم منشورة من AsaDental نفسها. يوضّح اسم المنتج محتوى كل طقم، وتُؤكَّد المحتويات الدقيقة والتوافر الحالي عند إعداد عرض السعر. وهي أداة مساعدة للشراء وليست استشارة سريرية.",
    faqEyebrow: "تجهيز العيادة",
    faqHeading: "أسئلة عن تجهيز عيادة جديدة",
    faq: [
      { q: "كم طقم أدوات تحتاج غرفة العلاج الواحدة؟", a: "يعتمد ذلك كلياً على دورة التعقيم لديك وعدد المرضى. والنهج الشائع هو توفير أطقم تكفي جلسة كاملة بين دورات جهاز التعقيم، فقد تحتفظ العيادة المزدحمة بثلاثة أو أربعة من طقم كثير الاستخدام وبواحد فقط من طقم تخصّصي. ابدأ هنا بطقم لكل غرفة ثم ارفع البنود التي تعرف أنها ستدور بسرعة." },
      { q: "لماذا لا تعرض الأداة محتويات كل طقم؟", a: "تنشر AsaDental محتويات الأطقم في كتالوجها، لكننا لا ننشر إلا المواصفات التي يمكننا التحقّق منها بنداً بنداً. وبدل عرض قائمة قد تكون خاطئة، نعرض الطقم بالاسم الذي تسمّيه به الشركة المصنّعة ونؤكّد المحتوى الدقيق معك عند إعداد عرض السعر. وإن احتجت التفصيل الكامل قبل الطلب فاطلبه وسنرسله." },
      { q: "هل يمكنني الجمع بين أدوات مفردة وأطقم؟", a: "نعم. الأطقم عادةً أوفر لتغطية مجال علاجي، لكن معظم العيادات تضيف مراجع مفردة للنماذج التي تفضّلها. كوّن قائمة الأطقم هنا، ثم أضف رموز المنتجات المفردة في رسالتك أو تصفّح الكتالوج الكامل." },
      { q: "هل توردون لعيادات خارج تركيا والعراق؟", a: "منظومة التوريد والوثائق والفحص لدينا مبنية على تركيا والعراق. أرسل لنا طلبك على أي حال وسنخبرك بصراحة إن كنا نستطيع خدمة سوقك." },
      { q: "ماذا يحدث بعد إرسال القائمة؟", a: "نتحقّق من التوافر، ونؤكّد المحتوى الدقيق لكل طقم، ونعود إليك بعرض سعر يشمل الوثائق وشروط التسليم. تُقدَّم الأسعار دائماً حسب الطلب — نحن لا ننشر قوائم أسعار." },
    ],
  },
};
