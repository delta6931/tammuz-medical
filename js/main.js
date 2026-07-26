/**
 * main.js — Tammuz Dental
 * Navigation scroll behavior, mobile menu, scroll reveal animations
 */

'use strict';

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
