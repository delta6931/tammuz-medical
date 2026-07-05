import os
import re

ROOT = r'C:\Users\garbarking\.gemini\antigravity\scratch\tammuz-dental'
PAGES = ['index.html', 'catalog.html', 'contact.html', '404.html']

LANGUAGES = {
    'en': {
        'lang': 'en',
        'dir': 'ltr',
        'replacements': {
            # Header / Navigation
            '<a href="index.html" class="nav__link" aria-current="page" data-i18n="nav.home">Home</a>': '<a href="index.html" class="nav__link" aria-current="page">Home</a>',
            '<a href="catalog.html" class="nav__link" data-i18n="nav.catalog">Catalog</a>': '<a href="catalog.html" class="nav__link">Catalog</a>',
            '<a href="contact.html" class="nav__link" data-i18n="nav.contact">Contact</a>': '<a href="contact.html" class="nav__link">Contact</a>',
            '<span data-i18n="nav.quote">Request Quote</span>': 'Request Quote',
            '<a href="index.html" class="nav__mobile-link" data-i18n="nav.home">Home</a>': '<a href="index.html" class="nav__mobile-link">Home</a>',
            '<a href="catalog.html" class="nav__mobile-link" data-i18n="nav.catalog">Product Catalog</a>': '<a href="catalog.html" class="nav__mobile-link">Product Catalog</a>',
            '<a href="contact.html" class="nav__mobile-link" data-i18n="nav.contact">Contact & Quote</a>': '<a href="contact.html" class="nav__mobile-link">Contact & Quote</a>',
            '<span data-i18n="nav.quote">Request B2B Quote</span>': 'Request B2B Quote',
            'Exclusively serving dental clinics, polyclinics &amp; distributors': 'Exclusively serving medical &amp; dental clinics, polyclinics &amp; distributors',
            'Tammuz Dental is a specialized trading brand': 'Tammuz Medical is a specialized trading brand',
            'About Tammuz Dental': 'About Tammuz Medical',
            'Dental Professional': 'Medical &amp; Dental Professional',
        }
    },
    'tr': {
        'lang': 'tr',
        'dir': 'ltr',
        'replacements': {
            # Title & Meta Description overrides
            '<title>Tammuz Medical — Premium B2B Medical & Dental Supplies | Turkey & Iraq</title>': '<title>Tammuz Medical — Türkiye ve Irak için Premium B2B Medikal & Diş Malzemeleri</title>',
            '<title>Product Catalog — Tammuz Medical | Medical & Dental Supplies</title>': '<title>Ürün Kataloğu — Tammuz Medical | Medikal ve Diş Malzemeleri</title>',
            '<title>Contact & Quote Request — Tammuz Medical</title>': '<title>İletişim ve Teklif Talebi — Tammuz Medical</title>',
            '<title>Page Not Found — Tammuz Medical</title>': '<title>Sayfa Bulunamadı — Tammuz Medical</title>',
            '<meta name="description" content="Tammuz Medical sources premium medical and dental supplies for B2B clients across Turkey and Iraq. Asadental instruments, consumables, lab equipment. Request a quote today." />': '<meta name="description" content="Tammuz Medical, Türkiye ve Irak genelindeki B2B müşterileri için premium medikal ve diş malzemeleri tedarik eder. Asadental aletleri, sarf malzemeleri, laboratuvar ekipmanları." />',

            # Header / Navigation
            'Home': 'Ana Sayfa',
            'Catalog': 'Katalog',
            'Product Catalog': 'Ürün Kataloğu',
            'Contact': 'İletişim',
            'Contact &amp; Quote': 'İletişim &amp; Teklif',
            'Contact & Quote': 'İletişim & Teklif',
            'Request Quote': 'Teklif İste',
            'Request B2B Quote': 'B2B Teklif İste',
            'Request a B2B quote': 'B2B teklif talebinde bulunun',

            # Index / Home Page Content
            'B2B Only · Wholesale &amp; Sample Orders': 'Yalnızca B2B · Toptan ve Numune Siparişleri',
            'Premium Dental Supplies<br />\n          for <em>Turkish Clinics</em><br />\n          &amp; Distributors': 'Türk Klinikleri ve Distribütörleri İçin<br />\n          <em>Premium Diş Malzemeleri</em>',
            'Tammuz Dental sources high-performance consumables — alginate, composites, impression materials, and more — directly from certified global manufacturers. Request B2B pricing or a product sample with no commitment.': 'Tammuz Medical, aljinat, kompozitler, ölçü maddeleri ve daha fazlası gibi yüksek performanslı diş sarf malzemelerini doğrudan sertifikalı küresel üreticilerden tedarik eder. Taahhüt olmaksızın B2B fiyatlandırması veya ürün numunesi talep edin.',
            'View Full Catalog': 'Tüm Kataloğu Görüntüle',
            'Request a Quote': 'Teklif Alın',
            'Scroll': 'Kaydır',

            # Trust Strip
            'Global Sourcing Network': 'Küresel Tedarik Ağı',
            'B2B Verified Partners Only': 'Yalnızca B2B Doğrulanmış Ortaklar',
            'Sample Orders Available': 'Numune Siparişleri Mevcut',
            'Flexible MOQ & Pricing': 'Esnek MOQ ve Fiyatlandırma',

            # Featured Section
            'Featured Products': 'Öne Çıkan Ürünler',
            'Our Product Range': 'Ürün Yelpazemiz',
            'Sourced from ISO-certified manufacturers. Available for B2B bulk orders and single-product sampling.': 'ISO sertifikalı üreticilerden tedarik edilmiştir. B2B toplu siparişler ve tek ürün numuneleri için mevcuttur.',

            # About Section
            'About Tammuz Dental': 'Tammuz Medical Hakkında',
            'Built for the B2B<br />Dental Professional': 'B2B Diş Hekimliği<br />Profesyonelleri İçin Tasarlandı',
            'Tammuz Dental is a specialized trading brand that bridges certified global dental manufacturers with clinics, polyclinics, and distributors across Turkey. We focus exclusively on the B2B segment — no retail, no consumer marketplace.': 'Tammuz Medical, sertifikalı küresel üreticiler ile Türkiye genelindeki klinikler, poliklinikler ve distribütörler arasında köprü kuran uzmanlaşmış bir B2B ticaret markasıdır. Sadece B2B segmentine odaklanıyoruz.',
            'Our process is straightforward: you identify the materials you need, we source them from vetted suppliers, and we deliver competitive pricing with the option to trial samples before committing to a bulk order.': 'Sürecimiz basittir: İhtiyacınız olan malzemeleri belirlersiniz, bunları onaylanmış tedarikçilerden tedarik ederiz ve toplu sipariş vermeden önce numuneleri deneme seçeneğiyle rekabetçi fiyatlar sunarız.',
            'B2B Only': 'Yalnızca B2B',
            'Exclusively serving dental clinics, polyclinics &amp; distributors': 'Özel olarak diş klinikleri, poliklinikler ve distribütörlere hizmet vermekteyiz',
            'Sample First': 'Önce Numune',
            'Every product available for trial before bulk commitment': 'Toplu sipariş taahhüdünden önce her ürün deneme için mevcuttur',

            # CTA Banner
            'Ready to Source Smarter?': 'Daha Akıllı Tedarik Etmeye Hazır mısınız?',
            'Get competitive B2B pricing or request product samples — no commitment required. Our team responds within 24 hours.': 'Rekabetçi B2B fiyatları alın veya ürün numuneleri isteyin — taahhüt gerekmez. Ekibimiz 24 saat içinde yanıt verir.',
            'Browse Catalog': 'Kataloğa Göz At',

            # Footer
            'Premium medical supplies for Turkish B2B professionals. Sample before you commit.': 'B2B profesyonelleri için premium tıbbi ve diş malzemeleri. Taahhüt etmeden önce numune isteyin.',
            'Navigation': 'Navigasyon',
            'Email': 'E-posta',
            'WhatsApp: Available on request': 'WhatsApp: Talep üzerine paylaşılır',

            # Catalog Page
            'All products are available for B2B wholesale orders and individual sample requests. Click any product to initiate a quote.': 'Tüm ürünler B2B toptan siparişleri ve bireysel numune talepleri için mevcuttur. Teklif başlatmak için herhangi bir ürüne tıklayın.',
            'All Products': 'Tüm Ürünler',
            'Diagnostics': 'Tanı Aletleri',
            'Restoratives': 'Restoratif Aletler',
            'Impression': 'Ölçü Maddeleri',
            'Oral &amp; Implant Surgery': 'Ağız &amp; İmplant Cerrahisi',
            'Periodontics': 'Periodontoloji',
            'Orthodontics': 'Ortodonti',
            'Cassettes &amp; Trays': 'Kasetler &amp; Küvetler',
            'Lab Instruments': 'Laboratuvar Aletleri',
            'Preventive &amp; Auxiliary': 'Koruyucu &amp; Yardımcı',
            'Devices': 'Cihazlar',
            "Don't See What You Need?": 'Aradığınızı Bulamadınız mı?',
            "We source on demand. If you need a specific product not listed here, reach out and we'll locate a certified supplier.": "Talep üzerine özel tedarik yapıyoruz. Listede olmayan spesifik bir ürüne ihtiyacınız varsa bize ulaşın, sertifikalı bir üretici bulalım.",
            'Submit a Custom Request': 'Özel İstek Gönder',
            'Contact Our Team': 'Ekibimizle İletişime Geçin',

            # Contact Page
            'Fill in the form below and our sourcing team will respond with pricing and availability within 24 hours.': 'Aşağıdaki formu doldurun, tedarik ekibimiz 24 saat içinde fiyat ve bulunabilirlik ile size geri dönecektir.',
            'We Respond<br />Within 24 Hours': '24 Saat İçinde<br />Yanıt Veriyoruz',
            'Whether you need pricing for a specific product, want to arrange sample delivery, or have a custom sourcing requirement — use the form to reach our team.': 'İster belirli bir ürün için fiyat isteyin, ister numune teslimatı ayarlamak isteyin, ister özel bir tedarik gereksiniminiz olsun — ekibimize ulaşmak için formu kullanın.',
            'Available upon request': 'Talep üzerine paylaşılır',
            'Legal Entity': 'Yasal Şirket',
            'Prefer WhatsApp? Contact us directly:': 'WhatsApp tercih mi edersiniz? Doğrudan iletişime geçin:',
            'Chat on WhatsApp': 'WhatsApp\'ta Sohbet Et',
            'Send a Message': 'Mesaj Gönder',
            'Company / Clinic': 'Şirket / Klinik',
            'Email Address': 'E-posta Adresi',
            'Phone Number': 'Telefon Numarası',
            'Requested Materials & Quantities (or general inquiry)': 'Talep Edilen Malzemeler & Miktarlar (veya genel bilgi isteği)',
            'By submitting this form, you confirm this is a B2B enquiry. We do not process consumer/retail orders.': 'Bu formu göndererek bunun bir B2B sorgusu olduğunu onaylıyorsunuz. Tüketici/perakende siparişleri işlemiyoruz.',
            'Send Message': 'Mesajı Gönder',

            # 404 Page
            'Page Not Found': 'Sayfa Bulunamadı',
            'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.': 'Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.',
            'Back to Homepage': 'Ana Sayfaya Dön',
        }
    },
    'ar': {
        'lang': 'ar',
        'dir': 'rtl',
        'replacements': {
            # Title & Meta Description overrides
            '<title>Tammuz Medical — Premium B2B Medical & Dental Supplies | Turkey & Iraq</title>': '<title>تمّوز ميديكال — مستلزمات طبية وأسنان فاخرة للعيادات والموزعين في العراق وتركيا</title>',
            '<title>Product Catalog — Tammuz Medical | Medical & Dental Supplies</title>': '<title>كتالوج المنتجات — تمّوز ميديكال | المستلزمات الطبية والأسنان</title>',
            '<title>Contact & Quote Request — Tammuz Medical</title>': '<title>الاتصال وطلب عرض السعر — تمّوز ميديكال</title>',
            '<title>Page Not Found — Tammuz Medical</title>': '<title>الصفحة غير موجودة — تمّوز ميديكال</title>',
            '<meta name="description" content="Tammuz Medical sources premium medical and dental supplies for B2B clients across Turkey and Iraq. Asadental instruments, consumables, lab equipment. Request a quote today." />': '<meta name="description" content="تقوم تمّوز ميديكال بتوفير مستلزمات طبية وأسنان فاخرة لعملاء B2B في العراق وتركيا. أدوات Asadental ومواد استهلاكية وأجهزة مختبرات. اطلب سعراً اليوم." />',

            # Header / Navigation
            'Home': 'الرئيسية',
            'Catalog': 'الكتالوج',
            'Product Catalog': 'كتالوج المنتجات',
            'Contact': 'تواصل معنا',
            'Contact &amp; Quote': 'الاتصال والطلب',
            'Contact & Quote': 'الاتصال والطلب',
            'Request Quote': 'طلب عرض سعر',
            'Request B2B Quote': 'طلب عرض سعر B2B',
            'Request a B2B quote': 'طلب عرض سعر B2B للشركات',

            # Index / Home Page Content
            'B2B Only · Wholesale &amp; Sample Orders': 'B2B فقط · طلبات الجملة وعينات تجريبية',
            'Premium Dental Supplies<br />\n          for <em>Turkish Clinics</em><br />\n          &amp; Distributors': 'مستلزمات طب أسنان فاخرة<br />\n          للعيادات و <em>الموزعين في العراق</em><br />\n          وتركيا',
            'Tammuz Dental sources high-performance consumables — alginate, composites, impression materials, and more — directly from certified global manufacturers. Request B2B pricing or a product sample with no commitment.': 'تقوم تمّوز ميديكال بتوريد مواد الأسنان الاستهلاكية عالية الجودة - الألجينات، والكومبوزيت، ومواد الطبعات، والمزيد - مباشرة من كبار المصنعين العالميين المعتمدين. اطلب أسعار الجملة أو عينات مجانية دون التزام.',
            'View Full Catalog': 'عرض الكتالوج بالكامل',
            'Request a Quote': 'طلب عرض سعر',
            'Scroll': 'مرر لأسفل',

            # Trust Strip
            'Global Sourcing Network': 'شبكة استيراد وتوريد عالمية',
            'B2B Verified Partners Only': 'شركاء عمل موثقين B2B فقط',
            'Sample Orders Available': 'توفير عينات قبل الطلب',
            'Flexible MOQ & Pricing': 'حدود طلب دنيا وأسعار مرنة',

            # Featured Section
            'Featured Products': 'المنتجات المميزة',
            'Our Product Range': 'مجموعة منتجاتنا',
            'Sourced from ISO-certified manufacturers. Available for B2B bulk orders and single-product sampling.': 'مستوردة من مصنّعين معتمدين بشهادة الأيزو. متوفرة لطلبات الجملة B2B وعينات المنتجات.',

            # About Section
            'About Tammuz Dental': 'حول تمّوز ميديكال',
            'Built for the B2B<br />Dental Professional': 'مُصممة لخدمة قطاع<br />أطباء ومستلزمات الأسنان B2B',
            'Tammuz Dental is a specialized trading brand that bridges certified global dental manufacturers with clinics, polyclinics, and distributors across Turkey. We focus exclusively on the B2B segment — no retail, no consumer marketplace.': 'تمّوز ميديكال هي علامة تجارية متخصصة في التجارة والتوريد، تربط بين مصنعي مستلزمات الأسنان العالميين المعتمدين والعيادات والموزعين في العراق وتركيا. نحن نركز حصرياً على قطاع الشركات B2B ولا نقدم مبيعات تجزئة.',
            'Our process is straightforward: you identify the materials you need, we source them from vetted suppliers, and we deliver competitive pricing with the option to trial samples before committing to a bulk order.': 'طريقتنا واضحة وبسيطة: تحدد المواد التي تحتاجها، نقوم نحن بتوريدها من أفضل الموردين المعتمدين، ونوفر لك أسعاراً منافسة مع خيار تجربة عينات قبل الالتزام بالطلب الكبير.',
            'B2B Only': 'عمليات B2B فقط',
            'Exclusively serving dental clinics, polyclinics &amp; distributors': 'نخدم حصرياً عيادات ومراكز وموزعي مستلزمات طب الأسنان',
            'Sample First': 'تجربة العينات أولاً',
            'Every product available for trial before bulk commitment': 'كل منتج متاح للتجربة قبل الالتزام بالشراء بكميات كبيرة',

            # CTA Banner
            'Ready to Source Smarter?': 'هل أنت مستعد للتوريد بذكاء أكبر؟',
            'Get competitive B2B pricing or request product samples — no commitment required. Our team responds within 24 hours.': 'احصل على أسعار B2B تنافسية أو اطلب عينات للمنتجات — دون أي التزام مسبق. سيرد فريقنا عليك خلال 24 ساعة.',
            'Browse Catalog': 'تصفح الكتالوج',

            # Footer
            'Premium medical supplies for Turkish B2B professionals. Sample before you commit.': 'مستلزمات طبية وأسنان فاخرة لمتخصصي B2B في العراق وتركيا. جرب العينة قبل الشراء.',
            'Navigation': 'روابط التنقل',
            'Email': 'البريد الإلكتروني',
            'WhatsApp: Available on request': 'واتساب: متاح عند الطلب',

            # Catalog Page
            'All products are available for B2B wholesale orders and individual sample requests. Click any product to initiate a quote.': 'جميع المنتجات متاحة لطلبات الجملة B2B وطلبات العينات الفردية. اضغط على أي منتج لطلب سعر.',
            'All Products': 'جميع المنتجات',
            'Diagnostics': 'أدوات التشخيص',
            'Restoratives': 'مواد الحشوات والترميم',
            'Impression': 'مواد وطبعات الأسنان',
            'Oral &amp; Implant Surgery': 'جراحة الفم والزراعة',
            'Periodontics': 'أمراض اللثة',
            'Orthodontics': 'تقويم الأسنان',
            'Cassettes &amp; Trays': 'علب وحافظات الأدوات',
            'Lab Instruments': 'أدوات المختبر',
            'Preventive &amp; Auxiliary': 'المواد الوقائية والمساعدة',
            'Devices': 'الأجهزة والمعدات',
            "Don't See What You Need?": 'لم تجد ما تبحث عنه؟',
            "We source on demand. If you need a specific product not listed here, reach out and we'll locate a certified supplier.": "نحن نقوم بالتوريد حسب الطلب. إذا كنت بحاجة إلى منتج معين غير مدرج هنا، تواصل معنا وسنجد لك مورداً معتمداً.",
            'Submit a Custom Request': 'إرسال طلب خاص مخصص',
            'Contact Our Team': 'اتصل بفريق العمل لدينا',

            # Contact Page
            'Fill in the form below and our sourcing team will respond with pricing and availability within 24 hours.': 'املاً النموذج أدناه وسيقوم فريق التوريد لدينا بالرد عليك بالأسعار والتوفر خلال 24 ساعة.',
            'We Respond<br />Within 24 Hours': 'نرد على طلبكم<br />خلال 24 ساعة',
            'Whether you need pricing for a specific product, want to arrange sample delivery, or have a custom sourcing requirement — use the form to reach our team.': 'سواء كنت بحاجة إلى أسعار لمنتج معين، أو ترغب في ترتيب إرسال عينات، أو لديك متطلبات توريد خاصة مخصصة — استخدم النموذج للتواصل مع فريقنا.',
            'Available upon request': 'متاح عند الطلب',
            'Legal Entity': 'الكيان القانوني للشركة',
            'Prefer WhatsApp? Contact us directly:': 'هل تفضل التواصل عبر واتساب؟ اتصل بنا مباشرة:',
            'Chat on WhatsApp': 'دردشة عبر واتساب',
            'Send a Message': 'إرسال رسالة',
            'Company / Clinic': 'الشركة / العيادة',
            'Email Address': 'البريد الإلكتروني',
            'Phone Number': 'رقم الهاتف',
            'Requested Materials & Quantities (or general inquiry)': 'المواد والكميات المطلوبة (أو استفسار عام)',
            'By submitting this form, you confirm this is a B2B enquiry. We do not process consumer/retail orders.': 'بإرسال هذا النموذج، فإنك تؤكد أن هذا استفسار تجاري B2B. نحن لا نقوم بمعالجة طلبات المستهلكين أو التجزئة.',
            'Send Message': 'إرسال الرسالة',

            # 404 Page
            'Page Not Found': 'الصفحة غير موجودة',
            'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.': 'الصفحة التي تبحث عنها ربما تم حذفها، أو تغير اسمها، أو غير متاحة مؤقتاً.',
            'Back to Homepage': 'العودة للصفحة الرئيسية',
        }
    }
}

def fix_paths(html, lang):
    """Fix relative asset links to go up one level (../) since they are in a subdirectory."""
    # Prepend ../ to local asset refs (css, js, assets, products)
    # But do NOT prepended to .html page links since they link to local files in the same folder!
    
    def replacer(m):
        attr = m.group(1)
        val = m.group(2)
        # Skip absolute URLs, anchors, mailto, tel, already prefixed, and .html files
        if val.startswith(('http', '#', 'mailto', 'tel', '//', '../', '/')):
            return m.group(0)
        if val.endswith('.html'):
            return m.group(0)
        return f'{attr}="../{val}"'
        
    html = re.sub(r'(href|src)="([^"]+)"', replacer, html)
    return html

def fix_switcher_links(html, page_name):
    """
    Update the EN/TR/AR switcher links dynamically to point to the correct subfolders.
    Instead of onclick switchLang() which was dynamic, we now point direct <a> links for SEO.
    """
    # Replace the EN switcher button
    html = re.sub(
        r'<button class="lang-btn"[^>]*data-lang-btn="en"[^>]*>EN</button>',
        f'<a href="../en/{page_name}" class="lang-btn" data-lang-btn="en">EN</a>',
        html
    )
    # Replace the TR switcher button
    html = re.sub(
        r'<button class="lang-btn"[^>]*data-lang-btn="tr"[^>]*>TR</button>',
        f'<a href="../tr/{page_name}" class="lang-btn" data-lang-btn="tr">TR</a>',
        html
    )
    # Replace the AR switcher button
    html = re.sub(
        r'<button class="lang-btn"[^>]*data-lang-btn="ar"[^>]*>AR</button>',
        f'<a href="../ar/{page_name}" class="lang-btn" data-lang-btn="ar">AR</a>',
        html
    )
    return html

for lang, cfg in LANGUAGES.items():
    dest_dir = os.path.join(ROOT, lang)
    os.makedirs(dest_dir, exist_ok=True)
    
    for page in PAGES:
        src_path = os.path.join(ROOT, page)
        if not os.path.exists(src_path):
            continue
            
        with open(src_path, 'r', encoding='utf-8') as f:
            html = f.read()
            
        # Apply translation dictionary (sorted by key length descending to prevent substring collisions)
        sorted_keys = sorted(cfg['replacements'].keys(), key=len, reverse=True)
        for orig in sorted_keys:
            trans = cfg['replacements'][orig]
            html = html.replace(orig, trans)
            
        # Fix asset paths
        html = fix_paths(html, lang)
        
        # Turn JS buttons to static HTML links for SEO language switching
        html = fix_switcher_links(html, page)
        
        # Fix root html tag properties
        html = re.sub(
            r'<html([^>]*)>',
            f'<html lang="{cfg["lang"]}" dir="{cfg["dir"]}" data-base-path="../" data-region="{lang}">',
            html, count=1
        )
        
        # Fix canonical URL and Open Graph URL for language-specific pages
        canonical_url = f'https://tammuzmedical.com/{lang}/{page}'
        if page == 'index.html':
            canonical_url = f'https://tammuzmedical.com/{lang}/'
            
        html = re.sub(
            r'<link rel="canonical" href="[^"]*"[^>]*>',
            f'<link rel="canonical" href="{canonical_url}" />',
            html
        )
        html = re.sub(
            r'<meta property="og:url" content="[^"]*"[^>]*>',
            f'<meta property="og:url" content="{canonical_url}" />',
            html
        )
        
        # Mark active lang class on switcher button cleanly
        html = html.replace(
            f'class="lang-btn" data-lang-btn="{lang}"',
            f'class="lang-btn lang-btn--active" data-lang-btn="{lang}"'
        )
        
        dest_path = os.path.join(dest_dir, page)
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(html)
            
        print(f'Generated: {lang}/{page}')

print('\nBuild site complete!')
