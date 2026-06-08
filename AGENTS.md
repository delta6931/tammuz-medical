# AGENTS.md — Tammuz Dental Project Specification

> This file is the single source of truth for any AI agent or developer
> working on the Tammuz Dental website. Read this before making any changes.

---

## Project Overview

**Brand:** Tammuz Dental (trading name of Demozi Kozmetik ve Makina Dış Ticaret Ltd. Şti.)
**Type:** B2B dental supply smoke-test / demand validation website
**Market:** Turkish dental clinics, polyclinics, and distributors
**Model:** No direct purchase flow. All products show "Request B2B Quote" — leads
captured via form and routed through Formspree to the operator's inbox.
**Hosting:** Static file hosting — GitHub Pages or Netlify (zero cost).

---

## Design System

### Color Palette
| Token                 | Value     | Usage                         |
|-----------------------|-----------|-------------------------------|
| `--color-navy-900`    | `#060D1A` | Page darkest background       |
| `--color-navy-800`    | `#0A1628` | Nav dark bg, dark sections    |
| `--color-navy-700`    | `#0D1F3C` | Trust strip, CTA banner       |
| `--color-gold-500`    | `#C9A84C` | Primary accent, buttons       |
| `--color-gold-400`    | `#D9BC72` | Hover states, nav links       |
| `--color-cream-100`   | `#F8F5F0` | Page background               |
| `--color-white`       | `#FFFFFF` | Card backgrounds              |

### Typography
- **Headings:** Playfair Display (serif) — institutional authority
- **Body / UI:** Inter (sans-serif) — clarity and readability
- Both loaded via Google Fonts with `display=swap`

### Spacing
8pt grid. All spacing tokens defined in `css/style.css` as `--space-N`.

---

## File Structure

```
tammuz-dental/
├── index.html              Landing page
├── catalog.html            Full product catalog
├── contact.html            Standalone B2B quote form
├── 404.html                Custom 404
│
├── css/
│   ├── style.css           Design tokens, reset, typography, layout
│   ├── components.css      All UI components
│   └── animations.css      Scroll reveal, micro-animations
│
├── js/
│   ├── main.js             Nav, mobile menu, scroll reveal
│   ├── catalog.js          Product rendering, filtering, modal trigger
│   └── form.js             Modal logic, validation, Formspree submission
│
├── products/
│   └── data.json           Product catalog data (source of truth)
│
├── assets/
│   ├── images/products/    Product images (drop JPGs/PNGs here)
│   └── logo/               Logo assets
│
├── AGENTS.md               This file
└── README.md               Deployment instructions
```

---

## Product Data Schema

All products are defined in `products/data.json`. Each entry follows this schema:

```jsonc
{
  "id": "cat-001",                    // Unique ID: category prefix + number
  "category": "impression",           // One of: impression | restorative | auxiliary
  "category_label": "Impression Materials",  // Human-readable label
  "name": "Product Name (EN)",
  "name_tr": "Ürün Adı (TR)",
  "description": "English description.",
  "description_tr": "Türkçe açıklama.",
  "unit": "Pack size / format string",
  "image": "assets/images/products/filename.jpg",  // Optional — CSS placeholder shown if missing
  "specs": [                          // Array of spec strings shown on card
    "Key: Value",
    "Key: Value"
  ],
  "tags": ["tag1", "tag2"]            // For future search/filter expansion
}
```

### Current Product Categories
| Category ID   | Label                   | SKU Count |
|---------------|-------------------------|-----------|
| `impression`  | Impression Materials    | 3         |
| `restorative` | Restorative Composites  | 3         |
| `auxiliary`   | Preventive & Auxiliary  | 3         |

**To add a product:** Add a new JSON object to `products/data.json`. The site auto-renders it.

---

## Lead Capture

### Form Backend: Formspree
**File:** `js/form.js` line 1 — `FORMSPREE_ENDPOINT`

**Setup steps:**
1. Go to https://formspree.io → Create account → New Form
2. Copy the endpoint URL (e.g. `https://formspree.io/f/xabc1234`)
3. Replace `YOUR_FORMSPREE_ID` in `js/form.js`
4. Verify your email in Formspree dashboard

**Fields captured:**
- `name` — Full name
- `company` — Clinic or company name
- `email` — Email address
- `phone` — Phone / WhatsApp
- `notes` — Requested materials and quantities
- `product` — Pre-filled from product card click
- `_subject` — Auto-set: "B2B Quote Request — [Company Name]"

**Free tier:** 50 submissions/month (Formspree) or 100/month (Netlify Forms).

### Alternative: Netlify Forms
Replace the `<form>` tag on `contact.html` and modal forms with:
```html
<form id="quote-form" name="quote-request" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="quote-request" />
  <!-- ... fields ... -->
</form>
```
And remove the Formspree fetch logic in `js/form.js`, letting Netlify handle submission natively.

---

## WhatsApp Integration

The WhatsApp button on `contact.html` currently links to:
```
https://wa.me/90XXXXXXXXXX
```
Replace `90XXXXXXXXXX` with the actual Turkish WhatsApp Business number (country code 90 + number without leading 0).

Example: `+90 532 123 45 67` → `https://wa.me/905321234567`

---

## SEO Notes

- Each page has a unique `<title>` and `<meta name="description">`
- `index.html` includes schema.org `Organization` JSON-LD structured data
- `catalog.html` uses `<main>` and `<article>` semantic elements
- All images should include `alt` attributes when added
- Update `<link rel="canonical">` on each page once the real domain is known

### Domain Migration (when you buy .com or .com.tr)
1. Update all `<link rel="canonical">` tags to the new domain
2. In Netlify: set up a `_redirects` file or in GitHub Pages: use a CNAME file
3. 301 redirect from old Netlify/GitHub URL to new domain

---

## Task Backlog (Future Iterations)

### V1.1 — Quick Wins
- [ ] Add real product photos to `assets/images/products/`
- [ ] Configure Formspree endpoint in `js/form.js`
- [ ] Add real WhatsApp Business number to `contact.html`
- [ ] Update canonical URLs to final deployment domain
- [ ] Add favicon.ico

### V1.2 — Conversion
- [ ] Add Google Analytics 4 (gtag.js) — paste snippet before `</head>`
- [ ] Add Meta Pixel for Turkish Facebook/Instagram ads
- [ ] Add `hreflang` for TR/EN if adding Turkish language toggle
- [ ] Create landing pages per product category for SEO

### V2.0 — Scale
- [ ] Turkish language toggle (TR/EN) using i18n JSON files
- [ ] Product search / keyword filter
- [ ] WhatsApp Business API direct quote automation
- [ ] CMS integration (Decap CMS / Netlify CMS) for non-dev product updates
- [ ] PDF catalog download generation

---

## Coding Standards for Agents

1. **No frameworks** — Pure HTML, CSS, JavaScript only. No npm, no bundlers.
2. **Design tokens first** — All colors, spacing, and typography MUST use CSS custom properties from `style.css`. No hard-coded hex values in components.
3. **Semantic HTML** — Use correct elements: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`. No div-soup.
4. **Accessibility** — All interactive elements need `aria-label` or visible label. Color contrast must pass WCAG AA.
5. **Mobile first** — Test all new components at 375px width before desktop.
6. **No breaking the form** — `js/form.js` handles both the modal form and the contact page form. Do not create separate form scripts.
7. **Product data is the source of truth** — Never hardcode product information in HTML. All product data lives in `products/data.json`.
