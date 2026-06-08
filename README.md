# Tammuz Dental — Deployment Guide

## Project Overview

Static B2B product catalog website for Tammuz Dental.
No backend, no build step — just open HTML files or push to a static host.

---

## 1. Run Locally

No server required for basic browsing, but product cards fetch `products/data.json`
via `fetch()` which requires a local HTTP server (not `file://`).

### Using Python (no install needed)
```bash
cd tammuz-dental
python -m http.server 8080
# Open: http://localhost:8080
```

### Using Node.js serve
```bash
npx serve .
# Open: http://localhost:3000
```

### Using VS Code
Install the "Live Server" extension → right-click `index.html` → "Open with Live Server"

---

## 2. Deploy to Netlify (Recommended — Free)

### Option A: Drag & Drop (Fastest)
1. Go to https://app.netlify.com
2. Log in / create a free account
3. Drag the entire `tammuz-dental/` folder onto the Netlify deploy area
4. Done — you'll get a URL like `https://tammuz-dental.netlify.app`

### Option B: Git Integration (Recommended for ongoing updates)
1. Push this folder to a GitHub repository
2. Go to https://app.netlify.com → "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Build settings:
   - **Build command:** _(leave blank — no build step)_
   - **Publish directory:** `.` (root of repo, or the subfolder if nested)
5. Click Deploy

**Custom domain:** Netlify → Site settings → Domain management → Add custom domain

---

## 3. Deploy to GitHub Pages (Alternative — Free)

1. Push this folder to a GitHub repository (e.g. `yourusername/tammuz-dental`)
2. Go to repository **Settings** → **Pages**
3. Source: Deploy from a branch
4. Branch: `main` → `/` (root)
5. Save — site will be at: `https://yourusername.github.io/tammuz-dental/`

> ⚠️ **Path Note for GitHub Pages subdirectory:**
> If deployed to a subdirectory (not a custom domain), the `data-base-path`
> attribute on `<html>` in each HTML file needs to match your repo name.
> Example: if your URL is `yourusername.github.io/tammuz-dental/`, set:
> ```html
> <html data-base-path="/tammuz-dental">
> ```
> This ensures `products/data.json` is fetched correctly.

---

## 4. One-Time Setup After Deployment

### A. Configure Formspree (Lead Capture)
1. Create a free account at https://formspree.io
2. Create a new form → copy the endpoint URL
3. Open `js/form.js` and replace:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';
   ```
   with your actual endpoint.
4. Redeploy.

**Free tier:** 50 submissions/month. Upgrade to paid for more volume.

### B. Add WhatsApp Number
Open `contact.html` and find:
```html
href="https://wa.me/90XXXXXXXXXX?text=..."
```
Replace `90XXXXXXXXXX` with your Turkish WhatsApp Business number.
Format: country code (90) + number without leading zero.
Example: `+90 532 123 45 67` → `905321234567`

### C. Update Canonical URLs
Once you have a real domain, update these in all HTML files:
```html
<link rel="canonical" href="https://YOUR-DOMAIN.com/PAGE.html" />
```
And update the `og:url` meta tags too.

### D. Add Favicon
Place a `favicon.ico` file in the project root. Add to each `<head>`:
```html
<link rel="icon" type="image/x-icon" href="favicon.ico" />
```

---

## 5. Add Product Photos

Place product images in `assets/images/products/`. Supported formats: `.jpg`, `.png`, `.webp`.

In `products/data.json`, set the `image` field for each product:
```json
"image": "assets/images/products/alginate.jpg"
```

Then in `js/catalog.js`, update `createProductCard()` to render an `<img>` tag
instead of the SVG placeholder when a product has an image path set.

Recommended image specs:
- **Dimensions:** 800×600px (4:3 ratio)
- **Format:** WebP for best performance, JPG as fallback
- **Size:** Under 150KB per image

---

## 6. Domain Migration (Buying a .com or .com.tr)

When you purchase a custom domain:

### On Netlify
1. Netlify Dashboard → Site settings → Domain management → Add custom domain
2. Follow the DNS instructions (point your domain registrar's nameservers or A/CNAME records)
3. Netlify auto-provisions a free SSL certificate via Let's Encrypt
4. Old `*.netlify.app` URL will auto-301 redirect to your new domain — no code change needed

### On GitHub Pages
1. Create a file named `CNAME` in the root containing only your domain:
   ```
   tammuz-dental.com
   ```
2. At your domain registrar, add a CNAME record pointing to `yourusername.github.io`
3. Enable HTTPS in repository Settings → Pages

---

## 7. Adding Google Analytics 4

Paste this inside `<head>` on all HTML pages (replace `G-XXXXXXXX`):
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

---

## File Size Summary

| File                   | Approx. Size |
|------------------------|-------------|
| `index.html`           | ~12 KB      |
| `catalog.html`         | ~10 KB      |
| `contact.html`         | ~10 KB      |
| `404.html`             | ~3 KB       |
| `css/style.css`        | ~8 KB       |
| `css/components.css`   | ~14 KB      |
| `css/animations.css`   | ~4 KB       |
| `js/main.js`           | ~3 KB       |
| `js/catalog.js`        | ~6 KB       |
| `js/form.js`           | ~6 KB       |
| `products/data.json`   | ~6 KB       |
| **Total (no images)**  | **~82 KB**  |

Google Fonts adds ~30–40 KB on first load (cached after that).

---

## Legal

Operated by **Demozi Kozmetik ve Makina Dış Ticaret Ltd. Şti.**
All B2B transactions under Turkish commercial law.
