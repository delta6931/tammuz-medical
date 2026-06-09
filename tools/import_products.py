"""
import_products.py — Tammuz Global Medical Supply
=================================================
Scans the assets/images/products/ directory and auto-generates
product entries for products/data.json.

HOW TO USE:
1. For each new product, create a folder inside:
       assets/images/products/YOUR PRODUCT NAME/

2. Put all product images inside that folder (JPG, PNG, WEBP).
   Name them anything — the script picks them all up.

3. Optionally create a file called "info.txt" inside the folder with:
       name: JINTAI Dental Vibrator
       category: devices
       unit: 1 Unit
       description: Short English description here.

   If info.txt is missing, the script will guess from the folder name.

4. Run this script from the tammuz-dental project root:
       python tools/import_products.py

5. Review the output — it prints new JSON entries you can paste
   into products/data.json, or use --write to auto-merge.

OPTIONS:
   python tools/import_products.py            # Print new entries
   python tools/import_products.py --write    # Auto-merge into data.json
   python tools/import_products.py --all      # Re-export all (overwrites)
"""

import os
import json
import re
import sys

# ── Config ──────────────────────────────────────────────────────────────────
PRODUCTS_DIR  = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'products')
DATA_JSON     = os.path.join(os.path.dirname(__file__), '..', 'products', 'data.json')
IMAGE_EXTS    = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

CATEGORY_KEYWORDS = {
    'impression':  ['alginate', 'impression', 'putty', 'tray'],
    'restorative': ['composite', 'resin', 'bonding', 'cement', 'glass ionomer'],
    'auxiliary':   ['glove', 'mask', 'syringe', 'needle', 'bib', 'cotton', 'gauze', 'cup'],
    'devices':     ['vibrator', 'curing', 'light', 'handpiece', 'scaler', 'autoclave',
                    'unit', 'chair', 'compressor', 'motor', 'machine', 'equipment', 'device'],
}

CATEGORY_LABELS = {
    'impression':  'Impression Materials',
    'restorative': 'Restorative Composites',
    'auxiliary':   'Preventive & Auxiliary',
    'devices':     'Professional Dental Devices',
}

def guess_category(name: str) -> str:
    name_lower = name.lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in name_lower for kw in keywords):
            return cat
    return 'auxiliary'  # default

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text[:40]

def parse_info_file(path: str) -> dict:
    info = {}
    try:
        with open(path, encoding='utf-8', errors='ignore') as f:
            for line in f:
                if ':' in line:
                    key, _, val = line.partition(':')
                    info[key.strip().lower()] = val.strip()
    except Exception:
        pass
    return info

def load_existing_ids() -> set:
    try:
        with open(DATA_JSON, encoding='utf-8') as f:
            data = json.load(f)
        return {p['id'] for p in data}
    except Exception:
        return set()

def load_existing_data() -> list:
    try:
        with open(DATA_JSON, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def collect_products(skip_existing: bool = True) -> list:
    existing_ids = load_existing_ids() if skip_existing else set()
    products_dir = os.path.abspath(PRODUCTS_DIR)

    if not os.path.isdir(products_dir):
        print(f"[ERROR] Products directory not found: {products_dir}")
        return []

    entries = []
    for folder_name in sorted(os.listdir(products_dir)):
        folder_path = os.path.join(products_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue

        # Parse optional info.txt
        info_path = os.path.join(folder_path, 'info.txt')
        info = parse_info_file(info_path) if os.path.exists(info_path) else {}

        # Also try "all about this product.txt"
        for fname in os.listdir(folder_path):
            if fname.endswith('.txt') and fname != 'info.txt':
                info2 = parse_info_file(os.path.join(folder_path, fname))
                # Merge — info.txt wins
                for k, v in info2.items():
                    if k not in info:
                        info[k] = v

        product_name = info.get('name') or folder_name.replace('_', ' ').title()
        product_id   = info.get('id') or slugify(folder_name)

        if skip_existing and product_id in existing_ids:
            print(f"[SKIP] {product_name} (already in data.json)")
            continue

        category = info.get('category') or guess_category(folder_name)
        category = category.strip().lower()

        # Gather images — prefer files with "main_image" in name first
        all_imgs = [
            f for f in sorted(os.listdir(folder_path))
            if os.path.splitext(f)[1].lower() in IMAGE_EXTS
        ]
        main_imgs   = [f for f in all_imgs if 'main' in f.lower()]
        other_imgs  = [f for f in all_imgs if 'main' not in f.lower()]
        ordered_imgs = main_imgs + other_imgs

        # Build relative paths (relative to project root)
        rel_prefix = f"assets/images/products/{folder_name}/"
        image_paths = [rel_prefix + f for f in ordered_imgs]

        entry = {
            "id":             product_id,
            "category":       category,
            "category_label": CATEGORY_LABELS.get(category, category.title()),
            "name":           product_name,
            "name_tr":        info.get('name_tr', product_name),
            "description":    info.get('description', f"Professional-grade {product_name.lower()} for dental practice and lab use."),
            "description_tr": info.get('description_tr', ""),
            "unit":           info.get('unit', '1 Unit'),
            "image":          image_paths[0] if image_paths else "",
            "images":         image_paths[:4],   # up to 4 for the slider
            "specs":          [],
            "tags":           [t.strip() for t in info.get('tags', '').split(',') if t.strip()]
                              or [category, folder_name.lower()],
        }

        # Parse specs from info file if present
        if 'specs' in info:
            entry['specs'] = [s.strip() for s in info['specs'].split(';') if s.strip()]

        entries.append(entry)
        print(f"[NEW]  {product_name} ({len(image_paths)} images) → {product_id}")

    return entries

def main():
    args = sys.argv[1:]
    write_mode = '--write' in args
    all_mode   = '--all' in args

    print(f"\n{'='*60}")
    print("  Tammuz Product Importer")
    print(f"  Scanning: {os.path.abspath(PRODUCTS_DIR)}")
    print(f"{'='*60}\n")

    new_entries = collect_products(skip_existing=not all_mode)

    if not new_entries:
        print("\nNo new products found.")
        return

    print(f"\n{'─'*60}")
    print(f"Found {len(new_entries)} new product(s).")

    if write_mode:
        existing = load_existing_data() if not all_mode else []
        combined = existing + new_entries
        with open(DATA_JSON, 'w', encoding='utf-8') as f:
            json.dump(combined, f, indent=2, ensure_ascii=False)
        print(f"\n✅  Written to {os.path.abspath(DATA_JSON)}")
        print("   Now run: git add -A && git commit -m 'Add new products' && git push")
    else:
        print("\nGenerated JSON (paste into products/data.json or run with --write):\n")
        print(json.dumps(new_entries, indent=2, ensure_ascii=False))
        print(f"\n{'─'*60}")
        print("TIP: Run with --write to auto-merge into data.json")
        print("TIP: Run with --write --all to rebuild all entries")

if __name__ == '__main__':
    main()
