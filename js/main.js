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
   HERO SLIDESHOW
   ============================================================ */
(function initHeroSlideshow() {
  const slideshowWrappers = document.querySelectorAll('.slideshow-wrapper');
  if (!slideshowWrappers.length) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  slideshowWrappers.forEach(wrapper => {
    const slides = wrapper.querySelectorAll('.slideshow-slide');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let timer = null;

    const showNextSlide = () => {
      const current = slides[currentIndex];

      current.classList.add('exiting');

      setTimeout(() => {
        current.classList.remove('active', 'exiting');
      }, 900);

      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    };

    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (timer || reducedMotionQuery.matches) return;
      timer = setInterval(showNextSlide, 4500);
    };

    wrapper.addEventListener('mouseenter', stop);
    wrapper.addEventListener('mouseleave', start);
    wrapper.addEventListener('focusin', stop);
    wrapper.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
    const handleMotionPreferenceChange = event => {
      if (event.matches) stop();
      else start();
    };

    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
    } else if (reducedMotionQuery.addListener) {
      reducedMotionQuery.addListener(handleMotionPreferenceChange);
    }

    start();
  });
})();

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

  const floatingButton = document.createElement('a');
  floatingButton.className = 'floating-whatsapp';
  floatingButton.href = buildWhatsAppUrl();
  floatingButton.target = '_blank';
  floatingButton.rel = 'noopener noreferrer';
  floatingButton.setAttribute('aria-label', 'Chat with Tammuz Medical on WhatsApp');
  floatingButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  `;
  document.body.appendChild(floatingButton);
})();
