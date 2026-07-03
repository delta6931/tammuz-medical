/**
 * catalog.js — Tammuz Dental
 * Fetches product data, renders product cards, handles category filtering,
 * and pre-populates the quote modal with selected product info.
 */

'use strict';

/* ============================================================
   PRODUCT CARD TEMPLATE
   ============================================================ */
function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card reveal';
  card.dataset.category = product.category;

  // Category color map
  const categoryColors = {
    impression:  '#079992', // Teal/green
    restorative: '#38ada9', // Teal
    auxiliary:   '#78e08f', // Greenish
    diagnostic:  '#3c6382', // Slate blue
    surgery:     '#b71540', // Crimson/red
    periodontal: '#0a3d62', // Deep blue
    orthodontic: '#60a3bc', // Light blue
    trays:       '#82ccdd', // Sky blue
    laboratory:  '#0c2461', // Dark Navy
    devices:     '#f6b93b', // Warm Gold
  };
  const categoryBg = categoryColors[product.category] || '#2a4558';

  // Specs list HTML
  const specsHTML = product.specs
    .map(s => `<li style="font-size:var(--text-xs);color:var(--color-text-light);margin-bottom:4px;">• ${s}</li>`)
    .join('');

  // Determine image HTML
  let imageHTML = `
    <div class="product-card__placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.122l4.5 1.5m-10.5-9.336a2.25 2.25 0 012.25 0M3 16.5v-6a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 10.5v6m-18 0a3 3 0 003 3h12a3 3 0 003-3m-18 0h18" />
      </svg>
    </div>
  `;

  if (product.images && product.images.length > 1) {
    // Has multiple images for slider
    imageHTML = `
      <div class="product-card__slider">
        <img src="${product.images[0]}" alt="${product.name} - View 1" class="product-card__img slider-img-1" loading="lazy" />
        <img src="${product.images[1]}" alt="${product.name} - View 2" class="product-card__img slider-img-2" loading="lazy" />
      </div>
    `;
  } else if (product.image) {
    // Has single image
    imageHTML = `<img src="${product.image}" alt="${product.name}" class="product-card__img" loading="lazy" />`;
  }

  card.innerHTML = `
    <div class="product-card__image-wrap">
      ${imageHTML}
      <span class="product-card__category-badge" style="background-color:rgba(${hexToRgb(categoryBg)}, 0.85)">
        ${product.category_label}
      </span>
    </div>

    <div class="product-card__body">
      <h3 class="product-card__name">${product.name}</h3>
      <p class="product-card__desc">${product.description}</p>
      <ul style="margin-top:var(--space-2);padding:0;list-style:none;">
        ${specsHTML}
      </ul>
      <p class="product-card__unit">${product.unit}</p>
    </div>

    <div class="product-card__footer">
      <button
        class="btn btn-primary btn-full"
        data-quote-trigger
        data-product-id="${product.id}"
        data-product-name="${product.name}"
        aria-label="Request B2B quote for ${product.name}"
        id="quote-btn-${product.id}"
      >
        Request B2B Quote
      </button>
    </div>
  `;

  return card;
}

/* ============================================================
   SKELETON LOADING CARDS
   ============================================================ */
function renderSkeletons(container, count = 6) {
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div style="padding:var(--space-5) var(--space-6);">
        <div class="skeleton skeleton-line skeleton-line--short" style="margin:0 0 var(--space-3);"></div>
        <div class="skeleton skeleton-line skeleton-line--medium" style="margin:0 0 var(--space-2);"></div>
        <div class="skeleton skeleton-line" style="margin:0 0 var(--space-2);"></div>
        <div class="skeleton skeleton-line skeleton-line--short" style="margin:0;"></div>
      </div>
    `;
    container.appendChild(card);
  }
}

/* ============================================================
   FILTER LOGIC
   ============================================================ */
function initFilters(products, container) {
  const filterBar = document.getElementById('filter-bar');
  if (!filterBar) return;

  let currentFilter = 'all';

  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      if (cat === currentFilter) return;

      currentFilter = cat;

      // Update active state
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      const cards = container.querySelectorAll('.product-card');
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.style.display = match ? '' : 'none';
      });

      // Re-trigger reveal for newly shown cards
      cards.forEach(card => {
        if (card.style.display !== 'none') {
          card.classList.add('revealed');
        }
      });
    });
  });
}

/* ============================================================
   MAIN CATALOG INIT
   ============================================================ */
async function initCatalog() {
  const container = document.getElementById('product-grid');
  if (!container) return;

  // Show skeletons
  const skeletonCount = parseInt(container.dataset.skeletons || '6');
  renderSkeletons(container, skeletonCount);

  try {
    // Determine base path (works both locally and on GitHub Pages/Netlify)
    const basePath = document.documentElement.dataset.basePath || '';
    const res = await fetch(`${basePath}/products/data.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    // Clear skeletons
    container.innerHTML = '';

    if (!products.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__text">No products found.</p>
        </div>`;
      return;
    }

    // Sort: products with images first
    const sorted = [...products].sort((a, b) => {
      const aHasImg = !!(a.image || (a.images && a.images.length));
      const bHasImg = !!(b.image || (b.images && b.images.length));
      return bHasImg - aHasImg;
    });

    // Render cards
    sorted.forEach((product, index) => {
      const card = createProductCard(product);
      // Stagger reveal delays
      const delayClass = `reveal-delay-${Math.min((index % 6) + 1, 6)}`;
      card.classList.add(delayClass);
      container.appendChild(card);
    });

    // Init filters
    initFilters(products, container);

    // Re-run scroll reveal for newly added elements
    const revealEls = container.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));

    // Attach quote button listeners
    container.querySelectorAll('[data-quote-trigger]').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId   = btn.dataset.productId;
        const productName = btn.dataset.productName;
        window.openQuoteModal({ id: productId, name: productName });
      });
    });

  } catch (err) {
    console.error('Failed to load products:', err);
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text">
          Unable to load the product catalog. Please refresh the page or contact us directly.
        </p>
      </div>`;
  }
}

/* ============================================================
   FEATURED PRODUCTS (subset for index.html)
   ============================================================ */
async function initFeaturedProducts() {
  const container = document.getElementById('featured-grid');
  if (!container) return;

  renderSkeletons(container, 3);

  try {
    const basePath = document.documentElement.dataset.basePath || '';
    const res = await fetch(`${basePath}/products/data.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    container.innerHTML = '';

    // Sort: products with images first
    const sorted = [...products].sort((a, b) => {
      const aHasImg = !!(a.image || (a.images && a.images.length));
      const bHasImg = !!(b.image || (b.images && b.images.length));
      return bHasImg - aHasImg;
    });

    // Show first 6 products as featured (images-first order)
    sorted.slice(0, 6).forEach((product, index) => {
      const card = createProductCard(product);
      card.classList.add(`reveal-delay-${Math.min(index + 1, 6)}`);
      container.appendChild(card);
    });

    // Reveal observer
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
    );
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Attach quote modal triggers
    container.querySelectorAll('[data-quote-trigger]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.openQuoteModal({
          id: btn.dataset.productId,
          name: btn.dataset.productName
        });
      });
    });

  } catch (err) {
    console.error('Featured products load error:', err);
    container.innerHTML = '';
  }
}

/* ============================================================
   UTILITY: Hex to RGB for inline style
   ============================================================ */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '42, 74, 114';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCatalog();
  initFeaturedProducts();
});
