/* Sergio Construction — Landing v2
   Lightweight, no dependencies. Respects prefers-reduced-motion. */

(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Nav scroll state (rAF-throttled) ----------
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    const update = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 32);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // ---------- Mobile menu ----------
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && !reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Stat counters ----------
  const statNums = document.querySelectorAll('[data-count]');
  if (statNums.length && !reduced && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    statNums.forEach((el) => io2.observe(el));
  } else {
    statNums.forEach((el) => {
      const target = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      el.textContent = target + suffix;
    });
  }

  // ---------- Video poster fallback ----------
  // If video fails (low data mode, codec, autoplay block), keep poster image visible.
  const heroVideo = document.querySelector('.hero-media video');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => heroVideo.style.display = 'none');
    // Stop autoplay on slow connections to save data
    if ('connection' in navigator && navigator.connection.saveData) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
      heroVideo.style.display = 'none';
    }
  }

  // ---------- Contact form → email (Resend) + WhatsApp ----------
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const payload = {
        name:    (data.get('name')    || '').toString().trim(),
        phone:   (data.get('phone')   || '').toString().trim(),
        email:   (data.get('email')   || '').toString().trim(),
        city:    (data.get('city')    || '').toString().trim(),
        message: (data.get('message') || '').toString().trim(),
      };

      // 1. Send email to Sergio's inbox via /api/contact (fire-and-forget,
      //    silent fail if Resend isn't configured yet).
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      // 2. Open WhatsApp with the message pre-filled.
      let body = `Përshëndetje! Jam i interesuar për një konsultë.\n\n`;
      body += `Emri: ${payload.name}\n`;
      if (payload.phone)   body += `Tel: ${payload.phone}\n`;
      if (payload.email)   body += `Email: ${payload.email}\n`;
      if (payload.city)    body += `Qyteti i interesit: ${payload.city}\n`;
      if (payload.message) body += `\nMesazhi: ${payload.message}\n`;
      body += `\n— Nga sergioconstruction.al`;

      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Duke u dërguar…';

      window.open(`https://wa.me/355696900727?text=${encodeURIComponent(body)}`,
                  '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        btn.textContent = 'U dërgua ✓';
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
          form.reset();
        }, 2200);
      }, 400);
    });
  }
})();
