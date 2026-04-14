/* ============================================================
   LUMIÈRE BEAUTY STUDIO — JavaScript
   ============================================================ */

'use strict';

// ── Navbar scroll behavior ──────────────────────────────────
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ── Mobile hamburger menu ───────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ── Hero particles ──────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 12 : 24;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 40}%;
      --duration: ${6 + Math.random() * 8}s;
      --delay:    ${Math.random() * 5}s;
      --drift:    ${(Math.random() - 0.5) * 80}px;
      width:  ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      opacity: ${0.2 + Math.random() * 0.6};
    `;
    container.appendChild(p);
  }
}
spawnParticles();

// ── Scroll-reveal (Intersection Observer) ──────────────────
const fadeEls = document.querySelectorAll(
  '.service-card, .gallery-item, .testimonial-card, .contact-item, .perk, .section-header'
);

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Don't unobserve so re-entering viewport re-triggers (optional)
    }
  });
}, observerOptions);

fadeEls.forEach((el, idx) => {
  el.classList.add('fade-in');
  el.style.transitionDelay = `${(idx % 6) * 80}ms`;
  observer.observe(el);
});

// ── Set min date for date picker to today ───────────────────
function setMinDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const dd   = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}
setMinDate();

// ── Booking form validation & submission ────────────────────
const bookingForm = document.getElementById('booking-form');
const submitBtn   = document.getElementById('submit-btn');
const btnText     = document.getElementById('btn-text');
const btnLoader   = document.getElementById('btn-loader');
const formSuccess = document.getElementById('form-success');

/**
 * Validate a single field and show/hide its error message.
 * @returns {boolean} whether field is valid
 */
function validateField(field) {
  const errorEl = document.getElementById(`${field.id}-error`);
  let message = '';

  // Required check
  if (field.required && !field.value.trim()) {
    message = 'This field is required.';
  }
  // Phone pattern check
  else if (field.id === 'phone') {
    const digits = field.value.replace(/\D/g, '');
    if (digits.length < 10) {
      message = 'Enter a valid 10-digit mobile number.';
    }
  }
  // Date: must be today or future
  else if (field.id === 'date' && field.value) {
    const selected = new Date(field.value);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      message = 'Please select a future date.';
    }
  }

  if (errorEl) errorEl.textContent = message;
  field.classList.toggle('error', !!message);
  return !message;
}

// Live validation on blur
bookingForm.querySelectorAll('input, select').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate all required fields
  const requiredFields = bookingForm.querySelectorAll('[required]');
  let isValid = true;
  requiredFields.forEach(field => {
    if (!validateField(field)) isValid = false;
  });

  if (!isValid) {
    // Scroll to first error
    const firstError = bookingForm.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Collect data
  const data = {
    name:    document.getElementById('name').value.trim(),
    phone:   document.getElementById('phone').value.trim(),
    service: document.getElementById('service').value,
    date:    document.getElementById('date').value,
    time:    document.getElementById('time').value,
    message: document.getElementById('message').value.trim(),
  };

  // UI: loading state
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  submitBtn.disabled = true;

  /*
   * BACKEND INTEGRATION POINT:
   * Replace the setTimeout with a real fetch() to your backend API:
   *
   * try {
   *   const res = await fetch('/api/bookings', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(data),
   *   });
   *   if (!res.ok) throw new Error('Server error');
   * } catch (err) {
   *   // Handle error
   * }
   *
   * For now, we simulate success and redirect to WhatsApp with pre-filled message.
   */
  await new Promise(r => setTimeout(r, 1400));

  // Build WhatsApp message
  const serviceLabel = document.getElementById('service').options[document.getElementById('service').selectedIndex].text;
  const waMsg = encodeURIComponent(
    `Hi Lumière! I'd like to book an appointment.\n\n` +
    `👤 Name: ${data.name}\n` +
    `📞 Phone: ${data.phone}\n` +
    `💆 Service: ${serviceLabel}\n` +
    `📅 Date: ${data.date}${data.time ? ' at ' + data.time : ''}\n` +
    `📝 Notes: ${data.message || 'None'}`
  );

  // Show success message
  btnText.classList.remove('hidden');
  btnLoader.classList.add('hidden');
  submitBtn.disabled = false;
  formSuccess.classList.remove('hidden');
  bookingForm.reset();

  // Reset error states
  requiredFields.forEach(f => f.classList.remove('error'));

  // Redirect to WhatsApp
  setTimeout(() => {
    window.open(`https://wa.me/919876543210?text=${waMsg}`, '_blank', 'noopener,noreferrer');
  }, 800);

  // Hide success after 6 seconds
  setTimeout(() => {
    formSuccess.classList.add('hidden');
  }, 6000);
});

// ── Smooth active nav link highlighting on scroll ───────────
const sections   = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      allNavLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => sectionObserver.observe(sec));

// ── Booking form: pre-select service from service card CTAs ─
document.querySelectorAll('.service-cta').forEach(cta => {
  cta.addEventListener('click', (e) => {
    // The link already points to #booking — after navigation:
    setTimeout(() => {
      const serviceSelect = document.getElementById('service');
      if (!serviceSelect) return;
      // Try to match by card heading text
      const cardHeading = e.currentTarget.closest('.service-card')?.querySelector('h3')?.textContent?.toLowerCase() || '';
      const options = Array.from(serviceSelect.options);
      const match = options.find(opt => cardHeading.includes(opt.text.toLowerCase()));
      if (match) serviceSelect.value = match.value;
    }, 400);
  });
});

// ── Prefers-reduced-motion check ───────────────────────────
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if (mq.matches) {
  document.querySelectorAll('.particle').forEach(p => p.remove());
  document.querySelector('.marquee-track')?.style?.setProperty('animation', 'none');
}

// ─────────────────────────────────────────────────────────────
// ══ BEFORE / AFTER DRAG SLIDER ══
// ─────────────────────────────────────────────────────────────
(function initBeforeAfterSlider() {
  const slider  = document.getElementById('ba-slider');
  const before  = document.getElementById('ba-before');
  const handle  = document.getElementById('ba-handle');
  const hint    = document.getElementById('ba-hint');

  if (!slider || !before || !handle) return;

  let isDragging  = false;
  let hintHidden  = false;
  let rafId       = null;
  let currentPct  = 50;  // start at 50%

  /** Clamp a value between min and max */
  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  /** Update slider visual position */
  function setPosition(pct) {
    currentPct = clamp(pct, 2, 98);
    // clip-path reveals left portion of the before image
    before.style.clipPath  = `inset(0 ${(100 - currentPct).toFixed(2)}% 0 0)`;
    handle.style.left      = currentPct + '%';
    handle.setAttribute('aria-valuenow', Math.round(currentPct));
  }

  /** Convert clientX to percentage inside the slider */
  function clientXToPercent(clientX) {
    const rect   = slider.getBoundingClientRect();
    const relX   = clientX - rect.left;
    return (relX / rect.width) * 100;
  }

  /** Hide hint on first interaction */
  function hideHint() {
    if (hintHidden || !hint) return;
    hintHidden = true;
    hint.classList.add('hidden');
  }

  // ── Mouse events ────────────────────────────────────────────
  slider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    hideHint();
    setPosition(clientXToPercent(e.clientX));
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      setPosition(clientXToPercent(e.clientX));
    });
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // ── Touch events (swipe) ────────────────────────────────────
  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    hideHint();
    setPosition(clientXToPercent(e.touches[0].clientX));
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();   // prevent scroll while swiping slider
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      setPosition(clientXToPercent(e.touches[0].clientX));
    });
  }, { passive: false });

  slider.addEventListener('touchend', () => {
    isDragging = false;
  });

  // ── Keyboard accessibility (arrow keys) ─────────────────────
  handle.addEventListener('keydown', (e) => {
    hideHint();
    if (e.key === 'ArrowLeft')  setPosition(currentPct - 2);
    if (e.key === 'ArrowRight') setPosition(currentPct + 2);
    if (e.key === 'Home')       setPosition(2);
    if (e.key === 'End')        setPosition(98);
  });

  // ── Auto intro animation on page load ───────────────────────
  // Slowly sweep from 50 → 30 → 50 to show it's interactive
  if (!mq.matches) {
    let introFrame = null;
    let introDir   = -1;
    let introPct   = 50;
    let introSteps = 0;

    function introAnimate() {
      if (isDragging || hintHidden) return;
      introPct  += introDir * 0.4;
      introSteps++;
      setPosition(introPct);
      if (introPct <= 30 && introDir === -1) introDir = 1;
      if (introPct >= 50 && introDir === 1 && introSteps > 50) return; // stop
      introFrame = requestAnimationFrame(introAnimate);
    }

    // Start intro after 1.2s
    setTimeout(() => {
      if (!hintHidden) introFrame = requestAnimationFrame(introAnimate);
    }, 1200);
  }

  // Initialise position
  setPosition(50);
})();
