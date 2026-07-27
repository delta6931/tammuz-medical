/**
 * catalog.js — Tammuz Dental
 * Supports three product types: singleton, merged (variant selector), bundle (specialty kit).
 * Includes 50-per-page pagination and a "Specialty Kits" filter tab.
 */

'use strict';

const PRODUCTS_PER_PAGE = 50;

/* ============================================================
   UTILITY: Hex to RGB
   ============================================================ */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '42, 74, 114';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

const CATEGORY_COLORS = {
  impression:  '#079992',
  restorative: '#38ada9',
  auxiliary:   '#78e08f',
  diagnostic:  '#3c6382',
  surgery:     '#b71540',
  periodontal: '#0a3d62',
  orthodontic: '#60a3bc',
  trays:       '#82ccdd',
  laboratory:  '#0c2461',
  devices:     '#f6b93b',
};

function getCategoryBg(cat) {
  return CATEGORY_COLORS[cat] || '#2a4558';
}

/* ============================================================
   IMAGE HTML HELPER
   ============================================================ */
function buildImageHTML(product, basePath) {
  const placeholder = `
    <div class="product-card__placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.122l4.5 1.5m-10.5-9.336a2.25 2.25 0 012.25 0M3 16.5v-6a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 10.5v6m-18 0a3 3 0 003 3h12a3 3 0 003-3m-18 0h18" />
      </svg>
    </div>`;

  if (product.images && product.images.length > 1) {
    return `
      <div class="product-card__slider">
        <img src="${basePath}${product.images[0]}" alt="${product.name} - View 1" class="product-card__img slider-img-1" loading="lazy" />
        <img src="${basePath}${product.images[1]}" alt="${product.name} - View 2" class="product-card__img slider-img-2" loading="lazy" />
      </div>`;
  } else if (product.image) {
    return `<img src="${basePath}${product.image}" alt="${product.name}" class="product-card__img" loading="lazy" />`;
  }
  return placeholder;
}

/* ============================================================
   VARIANT SELECTOR HTML HELPER
   ============================================================ */
function buildVariantSelector(product) {
  if (!product.variants || !product.variants.length) return '';

  const uid = product.id.replace(/[^a-z0-9]/gi, '-');

  if (product.selector_type === 'dropdown') {
    const options = product.variants.map(v =>
      `<option value="${v.code}">${v.label} &mdash; ${v.code}</option>`
    ).join('');
    return `
      <div class="variant-selector" data-product-id="${uid}">
        <label class="variant-selector__label" for="variant-${uid}">Select size / number:</label>
        <select class="variant-selector__dropdown" id="variant-${uid}" data-variant-select>
          <option value="">&#8212; Choose variant &#8212;</option>
          ${options}
        </select>
      </div>`;
  }

  // Chips (12 or fewer variants)
  const chips = product.variants.map((v, i) =>
    `<button type="button"
       class="variant-chip${i === 0 ? ' variant-chip--active' : ''}"
       data-code="${v.code}"
       data-chip
       aria-label="Select ${v.label}"
       title="${v.code}"
     >${v.label}</button>`
  ).join('');
  return `
    <div class="variant-selector" data-product-id="${uid}">
      <span class="variant-selector__label">Select size / number:</span>
      <div class="variant-chips" role="group">${chips}</div>
    </div>`;
}

/* ============================================================
   STANDARD & MERGED PRODUCT CARD
   ============================================================ */
function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card reveal';
  card.dataset.category = product.category;

  const categoryBg = getCategoryBg(product.category);
  const basePath = document.documentElement.dataset.basePath || '';
  const imageHTML = buildImageHTML(product, basePath);

  const specsHTML = (product.specs || [])
    .map(s => `<li style="font-size:var(--text-xs);color:var(--color-text-light);margin-bottom:4px;">&#8226; ${s}</li>`)
    .join('');

  const variantHTML = product.type === 'merged' ? buildVariantSelector(product) : '';
  const priceHTML   = product.price_display
    ? `<span class="product-card__price">${product.price_display}</span>` : '';

  card.innerHTML = `
    <div class="product-card__image-wrap">
      ${imageHTML}
      <span class="product-card__category-badge" style="background-color:rgba(${hexToRgb(categoryBg)}, 0.85)">
        ${product.category_label}
      </span>
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name">${product.name}</h3>
      <div class="moq-badges">
        <span class="moq-badge moq-badge--sample">&#128077; Sample Available</span>
        <span class="moq-badge moq-badge--wholesale">&#128230; Wholesale B2B</span>
      </div>
      <p class="product-card__desc">${product.description}</p>
      ${variantHTML}
      <ul style="margin-top:var(--space-2);padding:0;list-style:none;">${specsHTML}</ul>
      ${priceHTML}
      <p class="product-card__unit">${product.unit || '1 Unit'}</p>
    </div>
    <div class="product-card__footer">
      <button
        class="btn btn-primary btn-full"
        data-quote-trigger
        data-product-id="${product.id}"
        data-product-name="${product.name}"
        data-has-variants="${product.type === 'merged' ? 'true' : 'false'}"
        aria-label="Request B2B quote for ${product.name}"
        id="quote-btn-${product.id}"
      >Request B2B Quote</button>
    </div>
  `;

  // Chip interactions
  const chips = card.querySelectorAll('[data-chip]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('variant-chip--active'));
      chip.classList.add('variant-chip--active');
    });
  });

  // Quote binding — for merged, capture selected variant
  const quoteBtn = card.querySelector('[data-quote-trigger]');
  if (quoteBtn) {
    quoteBtn.addEventListener('click', () => {
      let name = product.name;
      if (product.type === 'merged') {
        const activeChip = card.querySelector('.variant-chip--active');
        const sel = card.querySelector('[data-variant-select]');
        const code = activeChip ? activeChip.dataset.code : (sel ? sel.value : '');
        if (code) name += ` \u2014 ${code}`;
      }
      window.openQuoteModal({ id: product.id, name });
    });
  }

  return card;
}

/* ============================================================
   SPECIALTY BUNDLE CARD
   ============================================================ */
function createBundleCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card product-card--bundle reveal';
  card.dataset.category = product.category;

  const categoryBg = getCategoryBg(product.category);
  const basePath = document.documentElement.dataset.basePath || '';
  const imageHTML = buildImageHTML(product, basePath);

  const itemsHTML = (product.items || []).map(item => {
    const uid = 'bi-' + item.base_name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    let selectorHTML = '';
    if (item.variants && item.variants.length > 1) {
      const isDropdown = item.selector_type === 'dropdown' || item.variants.length > 12;
      if (isDropdown) {
        const opts = item.variants.map(v =>
          `<option value="${v.code}">${v.label} (${v.code})</option>`).join('');
        selectorHTML = `<select class="bundle-item__select" id="${uid}" data-variant-select>
          <option value="">&#8212; Choose &#8212;</option>${opts}</select>`;
      } else {
        const chips = item.variants.map((v, i) =>
          `<button type="button" class="variant-chip variant-chip--sm${i===0?' variant-chip--active':''}"
            data-code="${v.code}" data-chip title="${v.code}">${v.label}</button>`
        ).join('');
        selectorHTML = `<div class="variant-chips variant-chips--sm" role="group">${chips}</div>`;
      }
    } else if (item.variants && item.variants.length === 1) {
      selectorHTML = `<span class="bundle-item__code">${item.variants[0].code}</span>`;
    }
    return `
      <li class="bundle-item">
        <span class="bundle-item__name">${item.base_name}</span>
        ${selectorHTML}
      </li>`;
  }).join('');

  card.innerHTML = `
    <div class="product-card__image-wrap">
      ${imageHTML}
      <span class="product-card__category-badge" style="background-color:rgba(${hexToRgb(categoryBg)}, 0.85)">
        Specialty Kit
      </span>
    </div>
    <div class="product-card__body">
      <div class="bundle-title-row">
        <span class="bundle-badge">&#128300; Specialty Kit</span>
        <h3 class="product-card__name">${product.name}</h3>
      </div>
      <p class="product-card__desc">${product.description}</p>
      <div class="bundle-items">
        <p class="bundle-items__heading">Instruments in this kit:</p>
        <ul class="bundle-items__list">${itemsHTML}</ul>
      </div>
      <div class="bundle-lead-time">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"/>
        </svg>
        ${product.lead_time}
      </div>
      <p class="bundle-price-note">Price on request &mdash; quoted per order based on landed cost.</p>
    </div>
    <div class="product-card__footer">
      <button
        class="btn btn-primary btn-full"
        data-quote-trigger
        data-product-id="${product.id}"
        data-product-name="${product.name}"
        aria-label="Request quote for ${product.name}"
        id="quote-btn-${product.id}"
      >Request Kit Quote</button>
    </div>
  `;

  // Chip interactions within bundle items
  card.querySelectorAll('.bundle-item').forEach(itemEl => {
    const bChips = itemEl.querySelectorAll('[data-chip]');
    bChips.forEach(chip => {
      chip.addEventListener('click', () => {
        bChips.forEach(c => c.classList.remove('variant-chip--active'));
        chip.classList.add('variant-chip--active');
      });
    });
  });

  const quoteBtn = card.querySelector('[data-quote-trigger]');
  if (quoteBtn) {
    quoteBtn.addEventListener('click', () => {
      window.openQuoteModal({ id: quoteBtn.dataset.productId, name: quoteBtn.dataset.productName });
    });
  }

  return card;
}

/* ============================================================
   CARD FACTORY
   ============================================================ */
function createCard(product) {
  if (product.type === 'bundle') return createBundleCard(product);
  return createProductCard(product);
}

/* ============================================================
   SKELETONS
   ============================================================ */
function renderSkeletons(container, count) {
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
      </div>`;
    container.appendChild(card);
  }
}

/* ============================================================
   PAGINATION
   ============================================================ */
function renderPagination(filteredProducts, currentPage, container, observer) {
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

  container.innerHTML = '';
  pageProducts.forEach((product, index) => {
    const card = createCard(product);
    card.classList.add(`reveal-delay-${Math.min((index % 6) + 1, 6)}`);
    container.appendChild(card);
  });

  container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  let paginationEl = document.getElementById('catalog-pagination');
  if (!paginationEl) {
    paginationEl = document.createElement('div');
    paginationEl.id = 'catalog-pagination';
    container.parentNode.insertBefore(paginationEl, container.nextSibling);
  }

  if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

  let pageButtons = '';
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
      pageButtons += `<button class="pagination__btn ${p === currentPage ? 'pagination__btn--active' : ''}"
        data-page="${p}" aria-label="Page ${p}" ${p === currentPage ? 'aria-current="page"' : ''}>${p}</button>`;
    } else if (p === currentPage - 3 || p === currentPage + 3) {
      pageButtons += `<span class="pagination__ellipsis">&hellip;</span>`;
    }
  }

  paginationEl.innerHTML = `
    <div class="pagination">
      <button class="pagination__btn pagination__btn--nav" data-page="${currentPage - 1}"
        ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">&larr; Prev</button>
      ${pageButtons}
      <button class="pagination__btn pagination__btn--nav" data-page="${currentPage + 1}"
        ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">Next &rarr;</button>
    </div>
    <p class="pagination__info">
      Showing ${start + 1}&ndash;${Math.min(start + PRODUCTS_PER_PAGE, filteredProducts.length)}
      of ${filteredProducts.length} products
    </p>`;

  paginationEl.querySelectorAll('.pagination__btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextPage = parseInt(btn.dataset.page);
      if (!isNaN(nextPage) && nextPage !== currentPage) {
        renderPagination(filteredProducts, nextPage, container, observer);
      }
    });
  });
}

/* ============================================================
   SPECIALTY KITS FILTER TAB
   ============================================================ */
function ensureSpecialtyTab(filterBar) {
  if (!filterBar || filterBar.querySelector('[data-filter="specialty"]')) return;
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.dataset.filter = 'specialty';
  btn.setAttribute('aria-label', 'Filter: Specialty Kits');
  btn.id = 'filter-specialty';
  btn.innerHTML = '&#128300; Specialty Kits';
  filterBar.appendChild(btn);
}

/* ============================================================
   FILTERS
   ============================================================ */
function initFilters(allProducts, container, observer) {
  const filterBar = document.getElementById('filter-bar');
  if (!filterBar) return;

  ensureSpecialtyTab(filterBar);

  let currentFilter = 'all';
  let currentPage = 1;

  const getFiltered = () => {
    if (currentFilter === 'all') return allProducts;
    if (currentFilter === 'specialty') return allProducts.filter(p => p.type === 'bundle');
    return allProducts.filter(p => p.category === currentFilter && p.type !== 'bundle');
  };

  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      if (cat === currentFilter) return;
      currentFilter = cat;
      currentPage = 1;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPagination(getFiltered(), currentPage, container, observer);
    });
  });
}

/* ============================================================
   MAIN CATALOG INIT
   ============================================================ */
async function initCatalog() {
  const container = document.getElementById('product-grid');
  if (!container) return;

  renderSkeletons(container, parseInt(container.dataset.skeletons || '6'));

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    }),
    { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
  );

  try {
    const basePath = document.documentElement.dataset.basePath || '';
    const res = await fetch(`${basePath}/products/data.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    container.innerHTML = '';
    if (!products.length) {
      container.innerHTML = `<div class="empty-state"><p class="empty-state__text">No products found.</p></div>`;
      return;
    }

    const sorted = [...products].sort((a, b) => {
      if (a.type === 'bundle' && b.type !== 'bundle') return 1;
      if (b.type === 'bundle' && a.type !== 'bundle') return -1;
      const aImg = !!(a.image || (a.images && a.images.length));
      const bImg = !!(b.image || (b.images && b.images.length));
      return bImg - aImg;
    });

    renderPagination(sorted, 1, container, observer);
    initFilters(sorted, container, observer);

  } catch (err) {
    console.error('Catalog load error:', err);
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text">Unable to load the product catalog. Please refresh the page or contact us directly.</p>
      </div>`;
  }
}

/* ============================================================
   FEATURED PRODUCTS (homepage, no bundles)
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

    const sorted = [...products]
      .filter(p => p.type !== 'bundle')
      .sort((a, b) => {
        const aImg = !!(a.image || (a.images && a.images.length));
        const bImg = !!(b.image || (b.images && b.images.length));
        return bImg - aImg;
      });

    sorted.slice(0, 6).forEach((product, index) => {
      const card = createCard(product);
      card.classList.add(`reveal-delay-${Math.min(index + 1, 6)}`);
      container.appendChild(card);
    });

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      }),
      { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
    );
    container.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  } catch (err) {
    console.error('Featured products load error:', err);
    container.innerHTML = '';
  }
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCatalog();
  initFeaturedProducts();
});
