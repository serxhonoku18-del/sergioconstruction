// ========== Mobile menu toggle ==========
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
  });
}

// ========== Navbar scroll effect ==========
const navbar = document.getElementById('navbar') || document.getElementById('landingNav');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ========== SLIDESHOW SYSTEM ==========
function initSlideshow(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const slides = container.querySelectorAll('.slideshow-slide');
  const prevBtn = container.querySelector('.slideshow-prev');
  const nextBtn = container.querySelector('.slideshow-next');
  const counterEl = container.querySelector('.slideshow-current');
  const infoName = container.querySelector('.slideshow-name');
  const infoLoc = container.querySelector('.slideshow-location');
  const infoNeto = container.querySelector('.slideshow-neto');
  const infoTotale = container.querySelector('.slideshow-totale');
  const track = container.querySelector('.slideshow-track');
  let current = 0;

  function showSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    slides[idx].classList.add('active');
    current = idx;
    if (counterEl) counterEl.textContent = idx + 1;

    const slide = slides[idx];
    if (infoName) infoName.textContent = slide.dataset.name || '';
    if (infoLoc) infoLoc.textContent = slide.dataset.location || '';
    if (infoNeto) infoNeto.textContent = slide.dataset.neto || '';
    if (infoTotale) infoTotale.textContent = slide.dataset.totale || '';
  }

  if (prevBtn) prevBtn.addEventListener('click', () => {
    showSlide((current - 1 + slides.length) % slides.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    showSlide((current + 1) % slides.length);
  });

  // Click image to open fullscreen plan viewer
  if (track) track.addEventListener('click', () => {
    const slide = slides[current];
    const img = slide.querySelector('img');
    if (img && planViewer) {
      planViewerImg.src = img.src;
      planViewerImg.alt = slide.dataset.name || '';
      planViewerTitle.textContent = (slide.dataset.name || '') + ' \u2014 ' + (slide.dataset.location || '');

      const neto = slide.dataset.neto || '';
      const totale = slide.dataset.totale || '';
      const badge = slide.dataset.badge || '';
      const loc = slide.dataset.location || '';

      planViewerInfo.innerHTML =
        '<div class="pv-detail"><span class="pv-label">Tipologjia</span><span class="pv-value">' + badge + '</span></div>' +
        '<div class="pv-detail"><span class="pv-label">Sip\u00ebrfaqja Neto</span><span class="pv-value">' + neto + '</span></div>' +
        (totale ? '<div class="pv-detail"><span class="pv-label">Sip\u00ebrfaqja Totale</span><span class="pv-value">' + totale + '</span></div>' : '') +
        '<div class="pv-detail"><span class="pv-label">Pozicioni</span><span class="pv-value">' + loc + '</span></div>';

      planViewer.classList.add('active');
      document.body.style.overflow = 'hidden';
      planViewerImg.classList.remove('zoomed');
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Only if this slideshow is in viewport
    const rect = container.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft') showSlide((current - 1 + slides.length) % slides.length);
    if (e.key === 'ArrowRight') showSlide((current + 1) % slides.length);
  });
}

initSlideshow('slideshowApartments');
initSlideshow('slideshowSherbime');
initSlideshow('slideshowParkime');
initSlideshow('slideshowRenders');

// ========== FULL PAGE PLAN VIEWER ==========
const planViewer = document.getElementById('planViewer');
const planViewerImg = document.getElementById('planViewerImg');
const planViewerTitle = document.getElementById('planViewerTitle');
const planViewerInfo = document.getElementById('planViewerInfo');
const planViewerClose = document.getElementById('planViewerClose');

function openPlanViewer(card) {
  if (!planViewer) return;

  const img = card.querySelector('.apartment-img img');
  const name = card.querySelector('.apartment-name')?.textContent || '';
  const location = card.querySelector('.apartment-location')?.textContent || '';
  const badge = card.querySelector('.apartment-badge')?.textContent || '';
  const neto = card.querySelector('.size-neto')?.textContent || '';
  const totale = card.querySelector('.size-totale')?.textContent || '';

  planViewerImg.src = img.src;
  planViewerImg.alt = name;
  planViewerTitle.textContent = name + ' — ' + location;

  planViewerInfo.innerHTML = `
    <div class="pv-detail">
      <span class="pv-label">Tipologjia</span>
      <span class="pv-value">${badge}</span>
    </div>
    <div class="pv-detail">
      <span class="pv-label">Sipërfaqja Neto</span>
      <span class="pv-value">${neto}</span>
    </div>
    ${totale ? `<div class="pv-detail">
      <span class="pv-label">Sipërfaqja Totale</span>
      <span class="pv-value">${totale}</span>
    </div>` : ''}
    <div class="pv-detail">
      <span class="pv-label">Pozicioni</span>
      <span class="pv-value">${location}</span>
    </div>
  `;

  planViewer.classList.add('active');
  document.body.style.overflow = 'hidden';
  planViewerImg.classList.remove('zoomed');
}

function closePlanViewer() {
  if (!planViewer) return;
  planViewer.classList.remove('active');
  document.body.style.overflow = '';
}

// Zoom toggle on plan image
if (planViewerImg) {
  planViewerImg.addEventListener('click', () => {
    planViewerImg.classList.toggle('zoomed');
  });
}

if (planViewerClose) {
  planViewerClose.addEventListener('click', closePlanViewer);
}

// Click apartment cards to open plan viewer (for non-slideshow pages)
document.querySelectorAll('.apartment-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    openPlanViewer(card);
  });
});

// ESC to close plan viewer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePlanViewer();
    closeLightbox();
  }
});

// ========== LIGHTBOX (Gallery) ==========
const lightbox = document.getElementById('lightboxModal') || document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let lightboxImages = [];
let currentIdx = 0;

function initLightbox() {
  if (!lightbox) return;
  const galleryImgs = document.querySelectorAll('.gallery-item img, .render-item img');
  lightboxImages = Array.from(galleryImgs).map(img => img.src);

  galleryImgs.forEach((img, i) => {
    img.addEventListener('click', () => {
      currentIdx = i;
      openLightbox(img.src, true);
    });
  });
}

function openLightbox(src, showNav) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (lightboxPrev) lightboxPrev.style.display = showNav ? 'block' : 'none';
  if (lightboxNext) lightboxNext.style.display = showNav ? 'block' : 'none';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

if (lightboxPrev) {
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIdx = (currentIdx - 1 + lightboxImages.length) % lightboxImages.length;
    lightboxImg.src = lightboxImages[currentIdx];
  });
}
if (lightboxNext) {
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIdx = (currentIdx + 1) % lightboxImages.length;
    lightboxImg.src = lightboxImages[currentIdx];
  });
}

document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
  if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
});

initLightbox();

// ========== Contact form handler ==========
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Faleminderit për mesazhin! Do t\'ju kontaktojmë sa më shpejt.');
    contactForm.reset();
  });
}

// ========== Scroll reveal ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.apartment-card, .gallery-item, .render-item, .video-item, .property-card, .city-card, .stat, .slideshow').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
