import os
import re

ROOT = r'C:\Users\garbarking\.gemini\antigravity\scratch\tammuz-dental'
PAGES = ['index.html', 'catalog.html', 'contact.html', '404.html']

REGIONS = {
    'tr': {'lang': 'tr', 'dir': 'ltr'},
    'iq': {'lang': 'ar', 'dir': 'rtl'},
}

def fix_paths(html):
    """Prefix all local relative src/href paths with ../ """
    def replacer(m):
        attr = m.group(1)
        val = m.group(2)
        # Skip absolute URLs, anchors, mailto, tel, already prefixed
        if val.startswith(('http', '#', 'mailto', 'tel', '//', '../', '/')):
            return m.group(0)
        return f'{attr}="../{val}"'
    return re.sub(r'(href|src)="([^"]+)"', replacer, html)

for region, cfg in REGIONS.items():
    dest_dir = os.path.join(ROOT, region)
    os.makedirs(dest_dir, exist_ok=True)

    for page in PAGES:
        src_path = os.path.join(ROOT, page)
        if not os.path.exists(src_path):
            print(f'SKIP (not found): {page}')
            continue

        with open(src_path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Fix all relative asset paths to use ../
        html = fix_paths(html)

        # Fix html tag — set lang, dir, data-region
        html = re.sub(
            r'<html([^>]*)>',
            f'<html lang="{cfg["lang"]}" dir="{cfg["dir"]}" data-base-path="../" data-region="{region}">',
            html, count=1
        )

        dest_path = os.path.join(dest_dir, page)
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Created: {region}/{page}')

print('\nAll region pages generated successfully.')
