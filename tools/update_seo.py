"""
update_seo.py — Tammuz Medical
Batch-updates SEO meta tags, canonical URLs, Open Graph, Schema.org JSON-LD,
and title tags across all HTML files in the project (including /tr/ and /iq/).
"""
import os
import re
import json

ROOT = r'C:\Users\garbarking\.gemini\antigravity\scratch\tammuz-dental'

# Collect every HTML file recursively
html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    # Skip .git
    dirnames[:] = [d for d in dirnames if d != '.git']
    for fname in filenames:
        if fname.endswith('.html'):
            html_files.append(os.path.join(dirpath, fname))

# ── Per-page SEO config ────────────────────────────────────────────────────
# Key: filename (basename), value: overrides
PAGE_SEO = {
    'index.html': {
        'title': 'Tammuz Medical — Premium B2B Medical & Dental Supplies | Turkey & Iraq',
        'description': 'Tammuz Medical sources premium medical and dental supplies for B2B clients across Turkey and Iraq. Asadental instruments, consumables, lab equipment. Request a quote today.',
        'keywords': 'medical supplies Turkey, dental supplies Iraq, B2B medical wholesale, diş malzemeleri, dental instruments, Asadental distributor Turkey Iraq',
        'og_title': 'Tammuz Medical — B2B Medical & Dental Supplies',
        'og_description': 'Premium medical and dental supplies for clinics, hospitals and distributors in Turkey and Iraq. B2B verified partners only.',
    },
    'catalog.html': {
        'title': 'Product Catalog — Tammuz Medical | Medical & Dental Supplies',
        'description': 'Browse our full catalog of medical and dental supplies including Asadental instruments, dental consumables, and lab equipment. Available for B2B order in Turkey and Iraq.',
        'keywords': 'dental catalog, medical supply catalog, Asadental, dental instruments, B2B dental Turkey, medical supplies Iraq',
        'og_title': 'Tammuz Medical — Full Product Catalog',
        'og_description': 'Browse 2500+ medical and dental products. B2B pricing available for clinics and distributors in Turkey and Iraq.',
    },
    'contact.html': {
        'title': 'Contact & Quote Request — Tammuz Medical',
        'description': 'Get in touch with Tammuz Medical for B2B quotes, product samples, and partnership inquiries. Serving Turkey (Demozi Ltd.) and Iraq (Mega Standard General Trading).',
        'keywords': 'contact Tammuz Medical, B2B dental quote Turkey, medical supply quote Iraq, info@tammuzmedical.com',
        'og_title': 'Contact Tammuz Medical — B2B Quote Request',
        'og_description': 'Request a B2B quote or product sample. Our team responds within 24 hours.',
    },
    '404.html': {
        'title': 'Page Not Found — Tammuz Medical',
        'description': 'The page you are looking for does not exist. Return to the Tammuz Medical homepage.',
        'keywords': '',
        'og_title': 'Page Not Found — Tammuz Medical',
        'og_description': 'Return to Tammuz Medical homepage.',
    },
}

# Schema.org for index pages
INDEX_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tammuz Medical",
    "alternateName": "Tammuz Global Medical Supply",
    "url": "https://tammuzmedical.com/",
    "description": "B2B medical and dental supply company sourcing premium products for the Turkish and Iraqi markets.",
    "legalName": "Demozi Kozmetik ve Makina Dış Ticaret Ltd. Şti.",
    "areaServed": ["TR", "IQ"],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "B2B Sales",
        "email": "info@tammuzmedical.com",
        "availableLanguage": ["Turkish", "Arabic", "English"]
    },
    "sameAs": ["https://tammuzmedical.com"]
}

def get_seo(filepath):
    fname = os.path.basename(filepath)
    return PAGE_SEO.get(fname, PAGE_SEO['index.html'])

def get_canonical(filepath):
    """Build canonical URL based on file location."""
    rel = os.path.relpath(filepath, ROOT).replace('\\', '/')
    if rel == 'index.html':
        return 'https://tammuzmedical.com/'
    elif rel == 'catalog.html':
        return 'https://tammuzmedical.com/catalog.html'
    elif rel == 'contact.html':
        return 'https://tammuzmedical.com/contact.html'
    elif rel.startswith('tr/'):
        page = rel.replace('tr/', '')
        return f'https://tammuzmedical.com/tr/{page}'
    elif rel.startswith('iq/'):
        page = rel.replace('iq/', '')
        return f'https://tammuzmedical.com/iq/{page}'
    return 'https://tammuzmedical.com/'

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html
    seo = get_seo(filepath)
    canonical = get_canonical(filepath)
    fname = os.path.basename(filepath)

    # ── Title ──────────────────────────────────────────────────────────────
    html = re.sub(r'<title>[^<]*</title>', f'<title>{seo["title"]}</title>', html)

    # ── Meta description ───────────────────────────────────────────────────
    html = re.sub(
        r'<meta name="description"[^>]*/?>',
        f'<meta name="description" content="{seo["description"]}" />',
        html
    )

    # ── Meta keywords ──────────────────────────────────────────────────────
    if seo.get('keywords'):
        html = re.sub(
            r'<meta name="keywords"[^>]*/?>',
            f'<meta name="keywords" content="{seo["keywords"]}" />',
            html
        )

    # ── Canonical ──────────────────────────────────────────────────────────
    html = re.sub(
        r'<link rel="canonical"[^>]*/?>',
        f'<link rel="canonical" href="{canonical}" />',
        html
    )

    # ── Open Graph ─────────────────────────────────────────────────────────
    html = re.sub(
        r'<meta property="og:title"[^>]*/?>',
        f'<meta property="og:title" content="{seo["og_title"]}" />',
        html
    )
    html = re.sub(
        r'<meta property="og:description"[^>]*/?>',
        f'<meta property="og:description" content="{seo["og_description"]}" />',
        html
    )
    html = re.sub(
        r'<meta property="og:url"[^>]*/?>',
        f'<meta property="og:url" content="{canonical}" />',
        html
    )
    html = re.sub(
        r'<meta property="og:site_name"[^>]*/?>',
        '<meta property="og:site_name" content="Tammuz Medical" />',
        html
    )

    # ── Twitter card ───────────────────────────────────────────────────────
    html = re.sub(
        r'<meta name="twitter:title"[^>]*/?>',
        f'<meta name="twitter:title" content="{seo["og_title"]}" />',
        html
    )
    html = re.sub(
        r'<meta name="twitter:description"[^>]*/?>',
        f'<meta name="twitter:description" content="{seo["og_description"]}" />',
        html
    )

    # ── Schema.org JSON-LD (index pages only) ──────────────────────────────
    if fname == 'index.html':
        schema_json = json.dumps(INDEX_SCHEMA, indent=2, ensure_ascii=False)
        html = re.sub(
            r'<script type="application/ld\+json">.*?</script>',
            f'<script type="application/ld+json">\n  {schema_json}\n  </script>',
            html, flags=re.DOTALL
        )

    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Updated SEO: {os.path.relpath(filepath, ROOT)}')
    else:
        print(f'No changes:  {os.path.relpath(filepath, ROOT)}')

for fp in sorted(html_files):
    update_file(fp)

print(f'\nDone. Processed {len(html_files)} HTML files.')
