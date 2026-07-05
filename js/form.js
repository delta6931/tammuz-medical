/**
 * form.js — Tammuz Medical
 * Quote request modal: open/close, form validation, Formspree submission.
 *
 * Formspree endpoint: https://formspree.io/f/mjgdwdpp
 * Make sure the form in your Formspree dashboard is set to deliver to info@tammuzmedical.com
 */

'use strict';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mjgdwdpp';

/** Pull region/language from localStorage for every submission */
function getSubmissionMeta() {
  const region = localStorage.getItem('tmz_region') || 'unknown';
  const lang   = localStorage.getItem('tmz_lang')   || 'en';
  const regionLabel = region === 'tr' ? '🇹🇷 Turkey' : region === 'iq' ? '🇮🇶 Iraq' : 'Unknown';
  return { region: regionLabel, language: lang, page: window.location.href };
}

/* ============================================================
   MODAL STATE
   ============================================================ */
const modalBackdrop = document.getElementById('quote-modal-backdrop');
const modal         = document.getElementById('quote-modal');
const modalClose    = document.getElementById('modal-close');
const modalProductRef = document.getElementById('modal-product-ref-name');
const quoteForm     = document.getElementById('quote-form');
const formMessage   = document.getElementById('form-message');

let isSubmitting = false;

/* ============================================================
   OPEN MODAL
   Called by catalog.js and any "Request Quote" buttons.
   product = { id, name } or null for generic
   ============================================================ */
window.openQuoteModal = function openQuoteModal(product) {
  if (!modalBackdrop) return;

  // Pre-fill product reference
  if (product && product.name) {
    if (modalProductRef) {
      modalProductRef.textContent = product.name;
      document.getElementById('modal-product-ref-row').style.display = 'flex';
    }
    // Also pre-fill the "Requested Materials" textarea
    const notesField = document.getElementById('field-notes');
    if (notesField && !notesField.value) {
      notesField.value = `Product inquiry: ${product.name}\n\nPlease include your required quantity and preferred packaging.`;
    }
  } else {
    document.getElementById('modal-product-ref-row').style.display = 'none';
  }

  // Show modal
  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus first input for accessibility
  requestAnimationFrame(() => {
    const firstInput = modal.querySelector('input, textarea');
    if (firstInput) firstInput.focus();
  });
};

/* ============================================================
   CLOSE MODAL
   ============================================================ */
function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
  resetForm();
}

if (modalClose)    modalClose.addEventListener('click', closeModal);
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
}

// ESC key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop?.classList.contains('open')) closeModal();
});

/* ============================================================
   OPEN MODAL FROM STATIC BUTTONS (non-catalog pages)
   ============================================================ */
document.querySelectorAll('[data-open-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    window.openQuoteModal(null);
  });
});

/* ============================================================
   FORM VALIDATION
   ============================================================ */
function getField(id) {
  return document.getElementById(id);
}

function showError(field, msgId, message) {
  if (!field) return;
  field.classList.add('error');
  const msg = document.getElementById(msgId);
  if (msg) { msg.textContent = message; msg.classList.add('visible'); }
}

function clearError(field, msgId) {
  if (!field) return;
  field.classList.remove('error');
  const msg = document.getElementById(msgId);
  if (msg) { msg.textContent = ''; msg.classList.remove('visible'); }
}

function validateForm() {
  let valid = true;

  // Full Name
  const nameField = getField('field-name');
  if (!nameField?.value.trim()) {
    showError(nameField, 'error-name', 'Please enter your full name.');
    valid = false;
  } else {
    clearError(nameField, 'error-name');
  }

  // Clinic / Company
  const companyField = getField('field-company');
  if (!companyField?.value.trim()) {
    showError(companyField, 'error-company', 'Please enter your clinic or company name.');
    valid = false;
  } else {
    clearError(companyField, 'error-company');
  }

  // Email
  const emailField = getField('field-email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailField?.value.trim() || !emailRegex.test(emailField.value.trim())) {
    showError(emailField, 'error-email', 'Please enter a valid email address.');
    valid = false;
  } else {
    clearError(emailField, 'error-email');
  }

  // Phone
  const phoneField = getField('field-phone');
  const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
  if (!phoneField?.value.trim() || !phoneRegex.test(phoneField.value.trim())) {
    showError(phoneField, 'error-phone', 'Please enter a valid phone number.');
    valid = false;
  } else {
    clearError(phoneField, 'error-phone');
  }

  return valid;
}

// Live validation on blur
['field-name', 'field-company', 'field-email', 'field-phone'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('blur', validateForm);
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateForm();
    });
  }
});

/* ============================================================
   FORM SUBMISSION
   ============================================================ */
if (quoteForm) {
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    isSubmitting = true;
    const submitBtn = quoteForm.querySelector('[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    // Hide any existing message
    if (formMessage) {
      formMessage.className = 'form-message';
      formMessage.textContent = '';
    }

    const meta = getSubmissionMeta();
    const formData = {
      name:     getField('field-name')?.value.trim(),
      company:  getField('field-company')?.value.trim(),
      email:    getField('field-email')?.value.trim(),
      phone:    getField('field-phone')?.value.trim(),
      notes:    getField('field-notes')?.value.trim(),
      product:  modalProductRef?.textContent?.trim() || 'General Inquiry',
      region:   meta.region,
      language: meta.language,
      _replyto: getField('field-email')?.value.trim(),
      _subject: `[${meta.region}] B2B Quote — ${getField('field-company')?.value.trim()}`,
    };

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        if (formMessage) {
          formMessage.className = 'form-message success';
          formMessage.textContent = '✓ Your quote request has been sent. Our team will contact you within 24 hours.';
        }
        quoteForm.reset();
        // Auto-close after 4s
        setTimeout(closeModal, 4000);
      } else {
        throw new Error(`Server responded with ${res.status}`);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      if (formMessage) {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Something went wrong. Please email us directly at info@tammuzmedical.com';
      }
    } finally {
      isSubmitting = false;
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

/* ============================================================
   RESET FORM
   ============================================================ */
function resetForm() {
  if (quoteForm) {
    quoteForm.reset();
    quoteForm.querySelectorAll('.form-input, .form-textarea').forEach(el => {
      el.classList.remove('error');
    });
    quoteForm.querySelectorAll('.form-error-msg').forEach(el => {
      el.classList.remove('visible');
      el.textContent = '';
    });
  }
  if (formMessage) {
    formMessage.className = 'form-message';
    formMessage.textContent = '';
  }
}

/* ============================================================
   CONTACT PAGE FORM (standalone — contact.html)
   ============================================================ */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    isSubmitting = true;
    const submitBtn = contactForm.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    const contactMessage = document.getElementById('contact-form-message');

    const meta = getSubmissionMeta();
    const formData = {
      name:     contactForm.querySelector('#cf-name')?.value.trim(),
      company:  contactForm.querySelector('#cf-company')?.value.trim(),
      email:    contactForm.querySelector('#cf-email')?.value.trim(),
      phone:    contactForm.querySelector('#cf-phone')?.value.trim(),
      notes:    contactForm.querySelector('#cf-notes')?.value.trim(),
      region:   meta.region,
      language: meta.language,
      _replyto: contactForm.querySelector('#cf-email')?.value.trim(),
      _subject: `[${meta.region}] B2B Quote — ${contactForm.querySelector('#cf-company')?.value.trim()}`,
    };

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        if (contactMessage) {
          contactMessage.className = 'form-message success';
          contactMessage.textContent = '✓ Request received. We will contact you within 24 hours.';
        }
        contactForm.reset();
      } else {
        throw new Error(`Server responded with ${res.status}`);
      }
    } catch (err) {
      if (contactMessage) {
        contactMessage.className = 'form-message error';
        contactMessage.textContent = 'Submission failed. Please email info@tammuzmedical.com directly.';
      }
    } finally {
      isSubmitting = false;
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}
