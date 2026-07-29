/**
 * main.js — Tammuz Dental
 * Navigation scroll behavior, mobile menu, scroll reveal animations
 */

'use strict';

const TAMMUZ_WHATSAPP_NUMBER = '905338877740';

function getWhatsAppMessage(productName) {
  const lang = document.documentElement.lang || 'en';
  if (productName) {
    if (lang === 'tr') {
      return `Merhaba Tammuz Medical, şu ürün için fiyat ve stok bilgisi almak istiyorum: ${productName}`;
    }
    if (lang === 'ar') {
      return `مرحبا Tammuz Medical، أريد معرفة السعر والتوفر لهذا المنتج: ${productName}`;
    }
    return `Hello Tammuz Medical, I would like pricing and availability for: ${productName}`;
  }

  if (lang === 'tr') {
    return 'Merhaba Tammuz Medical, ürünleriniz hakkında bilgi almak istiyorum.';
  }
  if (lang === 'ar') {
    return 'مرحبا Tammuz Medical، أريد معرفة المزيد عن منتجاتكم.';
  }
  return 'Hello Tammuz Medical, I would like more information about your products.';
}

function buildWhatsAppUrl(productName) {
  return `https://wa.me/${TAMMUZ_WHATSAPP_NUMBER}?text=${encodeURIComponent(getWhatsAppMessage(productName))}`;
}

window.TammuzWhatsApp = {
  number: TAMMUZ_WHATSAPP_NUMBER,
  urlFor: buildWhatsAppUrl,
  open(productName) {
    window.location.href = buildWhatsAppUrl(productName);
  },
};

/* ============================================================
   NAV SCROLL BEHAVIOR
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const SCROLL_THRESHOLD = 40;

  function updateNav() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  updateNav(); // run on load
  window.addEventListener('scroll', updateNav, { passive: true });
})();

/* ============================================================
   MOBILE HAMBURGER MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close when clicking a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });
})();

/* ============================================================
   SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-fade');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // only fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
})();

/* ============================================================
   ACTIVE NAV LINK (highlight current page)
   ============================================================ */
(function initActiveLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav__link, .nav__mobile-link, .footer__link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop();
    if (linkFile === currentPath || (currentPath === '' && linkFile === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();

/* ============================================================
   SMOOTH ANCHOR SCROLL (for in-page links)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navHeight = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   WHATSAPP CONTACT SHORTCUTS
   ============================================================ */
(function initWhatsAppShortcuts() {
  document.addEventListener('click', event => {
    const quoteTrigger = event.target.closest('[data-open-modal]');
    if (!quoteTrigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.TammuzWhatsApp.open();
  }, true);
})();
