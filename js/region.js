/**
 * region.js — Tammuz Medical
 * Handles: region gate (first visit), localStorage persistence,
 * /tr/ and /iq/ redirects, language switching, RTL toggle, i18n DOM updates.
 */
(function () {
  'use strict';

  const STORAGE_REGION = 'tmz_region';
  const STORAGE_LANG   = 'tmz_lang';
  const REGION_LANG_MAP = { tr: 'tr', iq: 'ar' };

  // ── 1. Detect where we are ──────────────────────────────────────────────
  const path = window.location.pathname;
  const inTR = path.startsWith('/tr/') || path === '/tr';
  const inIQ = path.startsWith('/iq/') || path === '/iq';
  const inRoot = !inTR && !inIQ;

  // If inside a region subdirectory, persist that region automatically
  if (inTR) {
    localStorage.setItem(STORAGE_REGION, 'tr');
    if (!localStorage.getItem(STORAGE_LANG)) localStorage.setItem(STORAGE_LANG, 'tr');
  } else if (inIQ) {
    localStorage.setItem(STORAGE_REGION, 'iq');
    if (!localStorage.getItem(STORAGE_LANG)) localStorage.setItem(STORAGE_LANG, 'ar');
  }

  const storedRegion = localStorage.getItem(STORAGE_REGION);
  const storedLang   = localStorage.getItem(STORAGE_LANG);

  // ── 2. On root pages: redirect if region already known ──────────────────
  if (inRoot && storedRegion) {
    const dest = storedRegion === 'tr' ? '/tr/' : '/iq/';
    // Only redirect from root index-style pages, not assets/API calls
    if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) {
      window.location.replace(dest);
      return;
    }
  }

  // ── 3. Gate helpers ─────────────────────────────────────────────────────
  function showGate() {
    const gate = document.getElementById('region-gate');
    if (gate) {
      gate.removeAttribute('hidden');
      gate.classList.add('region-gate--visible');
      document.body.classList.add('gate-open');
    }
  }

  function hideGate() {
    const gate = document.getElementById('region-gate');
    if (gate) {
      gate.classList.remove('region-gate--visible');
      document.body.classList.remove('gate-open');
      setTimeout(() => gate.setAttribute('hidden', ''), 400);
    }
  }

  function chooseRegion(region) {
    localStorage.setItem(STORAGE_REGION, region);
    localStorage.setItem(STORAGE_LANG, REGION_LANG_MAP[region]);
    hideGate();
    // Small delay so fade-out plays
    setTimeout(() => { window.location.href = '/' + region + '/'; }, 350);
  }

  // ── 4. Language / i18n ──────────────────────────────────────────────────
  function applyLanguage(lang) {
    const html = document.documentElement;
    html.lang = lang;
    html.dir  = (lang === 'ar') ? 'rtl' : 'ltr';

    // Translate data-i18n elements
    const strings = window.i18n && window.i18n[lang];
    if (strings) {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!strings[key]) return;
        const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
        if (isInput) { el.placeholder = strings[key]; }
        else         { el.textContent  = strings[key]; }
      });
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (strings[key]) el.placeholder = strings[key];
      });
    }

    // Highlight active lang button
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('lang-btn--active', btn.getAttribute('data-lang-btn') === lang);
    });

    localStorage.setItem(STORAGE_LANG, lang);
  }

  // Public API for onclick in HTML
  window.switchLang = function (lang) { applyLanguage(lang); };

  // ── 5. Footer entity ─────────────────────────────────────────────────────
  function updateFooterEntity(region) {
    const el = document.getElementById('footer-legal-entity');
    if (!el) return;
    if (region === 'tr') {
      el.innerHTML =
        '<strong>Tammuz Medical</strong> operations in Turkey are conducted by ' +
        '<strong>Demozi Kozmetik ve Makina Dış Ticaret Ltd. Şti.</strong> ' +
        'under applicable Turkish commercial law.';
    } else if (region === 'iq') {
      el.innerHTML =
        '<strong>Tammuz Medical</strong> operations in Iraq are conducted by ' +
        '<strong>Mega Standard General Trading Limited Liability Private Company</strong> ' +
        'under applicable Iraqi commercial law.';
    } else {
      el.innerHTML =
        '<strong>Tammuz Medical</strong> is operated by ' +
        '<strong>Demozi Kozmetik ve Makina Dış Ticaret Ltd. Şti.</strong> (Turkey) and ' +
        '<strong>Mega Standard General Trading LLC</strong> (Iraq).';
    }
  }

  // ── 6. DOMContentLoaded ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    // Wire gate buttons
    const btnTR = document.getElementById('region-btn-tr');
    const btnIQ = document.getElementById('region-btn-iq');
    if (btnTR) btnTR.addEventListener('click', () => chooseRegion('tr'));
    if (btnIQ) btnIQ.addEventListener('click', () => chooseRegion('iq'));

    // Show gate only on root when no region stored
    if (inRoot && !storedRegion) {
      showGate();
    }

    // Determine active lang
    const activeLang = storedLang
      || (inTR ? 'tr' : inIQ ? 'ar' : 'en');
    applyLanguage(activeLang);

    // Update footer entity
    const activeRegion = storedRegion || (inTR ? 'tr' : inIQ ? 'iq' : null);
    updateFooterEntity(activeRegion);

  });

})();
