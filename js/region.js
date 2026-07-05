/**
 * region.js — Tammuz Medical
 * Handles: region gate, /tr/ and /iq/ redirects, language switching, RTL, i18n.
 *
 * Gate behaviour:
 *   - Show the gate on EVERY visit to root, UNLESS the visitor has chosen
 *     the same region 5+ times in a row (then we trust their preference).
 *   - Picking a different region resets the streak counter back to 1.
 */
(function () {
  'use strict';

  const STORAGE_REGION = 'tmz_region';
  const STORAGE_LANG   = 'tmz_lang';
  const STORAGE_COUNT  = 'tmz_pick_count';   // consecutive same-region picks
  const REMEMBER_AFTER = 5;                   // skip gate after this many same picks

  const REGION_LANG_MAP = { tr: 'tr', iq: 'ar' };

  // ── 1. Detect where we are ──────────────────────────────────────────────
  const path  = window.location.pathname;
  const inTR  = path.startsWith('/tr/') || path === '/tr';
  const inIQ  = path.startsWith('/iq/') || path === '/iq';
  const inRoot = !inTR && !inIQ;

  // If inside a region subdirectory, sync storage (but do NOT increment count here)
  if (inTR) {
    if (!localStorage.getItem(STORAGE_LANG)) localStorage.setItem(STORAGE_LANG, 'tr');
  } else if (inIQ) {
    if (!localStorage.getItem(STORAGE_LANG)) localStorage.setItem(STORAGE_LANG, 'ar');
  }

  const storedRegion = localStorage.getItem(STORAGE_REGION);
  const storedLang   = localStorage.getItem(STORAGE_LANG);
  const storedCount  = parseInt(localStorage.getItem(STORAGE_COUNT) || '0', 10);

  // ── 2. On root: redirect ONLY if user has hit the remember threshold ─────
  if (inRoot && storedRegion && storedCount >= REMEMBER_AFTER) {
    const dest = storedRegion === 'tr' ? '/tr/' : '/iq/';
    if (path === '/' || path === '/index.html') {
      window.location.replace(dest);
      return;
    }
  }

  // ── 3. Gate helpers ─────────────────────────────────────────────────────
  function showGate() {
    const gate = document.getElementById('region-gate');
    if (gate) {
      gate.classList.add('is-open');
      document.body.classList.add('gate-open');
    }
  }

  function hideGate() {
    const gate = document.getElementById('region-gate');
    if (gate) {
      gate.classList.remove('is-open');
      document.body.classList.remove('gate-open');
    }
  }

  function chooseRegion(region) {
    // Track consecutive same-region picks
    const prevRegion = localStorage.getItem(STORAGE_REGION);
    const prevCount  = parseInt(localStorage.getItem(STORAGE_COUNT) || '0', 10);
    const newCount   = (prevRegion === region) ? prevCount + 1 : 1;

    localStorage.setItem(STORAGE_REGION, region);
    localStorage.setItem(STORAGE_LANG, REGION_LANG_MAP[region]);
    localStorage.setItem(STORAGE_COUNT, String(newCount));

    hideGate();
    // Small delay so fade-out plays before navigation
    setTimeout(() => { window.location.href = '/' + region + '/'; }, 320);
  }

  // ── 4. Language / i18n ──────────────────────────────────────────────────
  function applyLanguage(lang) {
    const html = document.documentElement;
    html.lang = lang;
    html.dir  = (lang === 'ar') ? 'rtl' : 'ltr';

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

    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      btn.classList.toggle('lang-btn--active', btn.getAttribute('data-lang-btn') === lang);
    });

    localStorage.setItem(STORAGE_LANG, lang);
  }

  window.switchLang = function (lang) { applyLanguage(lang); };

  // ── 5. Footer legal entity ───────────────────────────────────────────────
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

    // Show gate on root UNLESS remember threshold met
    if (inRoot && !(storedRegion && storedCount >= REMEMBER_AFTER)) {
      showGate();
    }

    // Apply active language
    const activeLang = storedLang || (inTR ? 'tr' : inIQ ? 'ar' : 'en');
    applyLanguage(activeLang);

    // Update footer entity
    const activeRegion = storedRegion || (inTR ? 'tr' : inIQ ? 'iq' : null);
    updateFooterEntity(activeRegion);

  });

})();
