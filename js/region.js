/**
 * region.js — Tammuz Medical
 * Handles: region gate redirections, localStorage preference storage.
 *
 * Gate behaviour:
 *   - Remember the visitor's first region choice and redirect root visits.
 *   - Redirection leads to /tr/ (Turkey/Turkish) or /ar/ (Iraq/Arabic).
 */
(function () {
  'use strict';

  const STORAGE_REGION = 'tmz_region';
  const STORAGE_LANG   = 'tmz_lang';
  const STORAGE_COUNT  = 'tmz_pick_count';
  const REMEMBER_AFTER = 1;

  const REGION_LANG_MAP = { tr: 'tr', ar: 'ar' };

  // ── 1. Detect location ──────────────────────────────────────────────────
  const path  = window.location.pathname;
  const inTR  = path.startsWith('/tr/') || path === '/tr';
  const inAR  = path.startsWith('/ar/') || path === '/ar';
  const inEN  = path.startsWith('/en/') || path === '/en';
  const inRoot = !inTR && !inAR && !inEN;

  const storedRegion = localStorage.getItem(STORAGE_REGION);
  const storedLang   = localStorage.getItem(STORAGE_LANG);
  const storedCount  = parseInt(localStorage.getItem(STORAGE_COUNT) || '0', 10);

  // ── 2. Root Redirect ────────────────────────────────────────────────────
  if (inRoot && storedLang && storedCount >= REMEMBER_AFTER) {
    const filename = path.split('/').pop() || 'index.html';
    if (filename.endsWith('.html') || filename === 'index.html') {
      window.location.replace('/' + storedLang + '/' + filename);
      return;
    }
  }

  // ── 3. Gate actions ─────────────────────────────────────────────────────
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
    localStorage.setItem(STORAGE_REGION, region);
    localStorage.setItem(STORAGE_LANG, REGION_LANG_MAP[region]);
    localStorage.setItem(STORAGE_COUNT, String(REMEMBER_AFTER));

    // Redirect to the correct language subfolder
    const destFolder = region === 'tr' ? 'tr' : 'ar';
    window.location.href = '/' + destFolder + '/';
  }

  // Fallback for root pages switcher buttons (which use onclick="switchLang('...')")
  window.switchLang = function (lang) {
    const filename = path.split('/').pop() || 'index.html';
    window.location.href = '/' + lang + '/' + filename;
  };

  // ── 4. DOM Initialization ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // Hook region buttons (only exist on root index.html)
    const btnTR = document.getElementById('region-btn-tr');
    const btnIQ = document.getElementById('region-btn-iq'); // Iraq button
    if (btnTR) btnTR.addEventListener('click', () => chooseRegion('tr'));
    if (btnIQ) btnIQ.addEventListener('click', () => chooseRegion('ar')); // Go to /ar/

    // Show gate on root unless remember threshold met
    if (inRoot && !(storedRegion && storedCount >= REMEMBER_AFTER)) {
      showGate();
    }
  });

})();
