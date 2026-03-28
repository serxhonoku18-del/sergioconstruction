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

// ========== GALLERY PREVIEW SYSTEM ==========
// "Show All" buttons - reveal the full gallery grid
document.querySelectorAll('.show-all-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const fullGallery = document.getElementById(targetId);
    if (fullGallery) {
      fullGallery.style.display = 'block';
      btn.style.display = 'none';
      // Scroll to the gallery smoothly
      fullGallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Click on any preview-card or gallery-thumb to open fullscreen plan viewer
document.querySelectorAll('.preview-card, .gallery-thumb').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    if (img && planViewer) {
      planViewerImg.src = img.src;
      planViewerImg.alt = img.alt || '';
      planViewerTitle.textContent = img.alt || 'Planimetri';
      planViewerInfo.innerHTML = '';
      planViewer.classList.add('active');
      document.body.style.overflow = 'hidden';
      planViewerImg.classList.remove('zoomed');

      // Set up navigation through all visible images
      const section = card.closest('.gallery-preview');
      if (section) {
        const allCards = Array.from(section.querySelectorAll('.preview-card, .gallery-thumb'));
        const allImgs = allCards.map(c => c.querySelector('img')).filter(Boolean);
        currentPlanImages = allImgs.map(i => ({ src: i.src, alt: i.alt }));
        currentPlanIndex = allImgs.findIndex(i => i.src === img.src);
        updatePlanNav();
      }
    }
  });
});

// ========== SLIDESHOW SYSTEM (kept for backward compat) ==========
function initSlideshow(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const slides = container.querySelectorAll('.slideshow-slide');
  const prevBtn = container.querySelector('.slideshow-prev');
  const nextBtn = container.querySelector('.slideshow-next');
  const counterEl = container.querySelector('.slideshow-current');
  const infoName = container.querySelector('.slideshow-name');
  const infoLoc = container.querySelector('.slideshow-location');
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
  }

  if (prevBtn) prevBtn.addEventListener('click', () => {
    showSlide((current - 1 + slides.length) % slides.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    showSlide((current + 1) % slides.length);
  });

  if (track) track.addEventListener('click', () => {
    const slide = slides[current];
    const img = slide.querySelector('img');
    if (img && planViewer) {
      planViewerImg.src = img.src;
      planViewerImg.alt = slide.dataset.name || '';
      planViewerTitle.textContent = (slide.dataset.name || '') + ' — ' + (slide.dataset.location || '');
      planViewerInfo.innerHTML = '';
      planViewer.classList.add('active');
      document.body.style.overflow = 'hidden';
      planViewerImg.classList.remove('zoomed');
    }
  });

  document.addEventListener('keydown', (e) => {
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

let currentPlanImages = [];
let currentPlanIndex = 0;

// Navigation buttons in plan viewer
const planPrevBtn = document.getElementById('planViewerPrev');
const planNextBtn = document.getElementById('planViewerNext');

function updatePlanNav() {
  if (planPrevBtn) planPrevBtn.style.display = currentPlanImages.length > 1 ? 'flex' : 'none';
  if (planNextBtn) planNextBtn.style.display = currentPlanImages.length > 1 ? 'flex' : 'none';
}

function showPlanImage(idx) {
  if (!currentPlanImages.length) return;
  currentPlanIndex = idx;
  planViewerImg.src = currentPlanImages[idx].src;
  planViewerImg.alt = currentPlanImages[idx].alt;
  planViewerTitle.textContent = currentPlanImages[idx].alt || 'Planimetri';
  planViewerImg.classList.remove('zoomed');
}

if (planPrevBtn) {
  planPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPlanImage((currentPlanIndex - 1 + currentPlanImages.length) % currentPlanImages.length);
  });
}
if (planNextBtn) {
  planNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPlanImage((currentPlanIndex + 1) % currentPlanImages.length);
  });
}

function openPlanViewer(card) {
  if (!planViewer) return;
  const img = card.querySelector('.apartment-img img');
  const name = card.querySelector('.apartment-name')?.textContent || '';
  const location = card.querySelector('.apartment-location')?.textContent || '';

  planViewerImg.src = img.src;
  planViewerImg.alt = name;
  planViewerTitle.textContent = name + ' — ' + location;
  planViewerInfo.innerHTML = '';

  planViewer.classList.add('active');
  document.body.style.overflow = 'hidden';
  planViewerImg.classList.remove('zoomed');
}

function closePlanViewer() {
  if (!planViewer) return;
  planViewer.classList.remove('active');
  document.body.style.overflow = '';
  currentPlanImages = [];
}

if (planViewerImg) {
  planViewerImg.addEventListener('click', () => {
    planViewerImg.classList.toggle('zoomed');
  });
}

if (planViewerClose) {
  planViewerClose.addEventListener('click', closePlanViewer);
}

document.querySelectorAll('.apartment-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    openPlanViewer(card);
  });
});

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePlanViewer();
    closeLightbox();
  }
  // Arrow keys in plan viewer
  if (planViewer && planViewer.classList.contains('active') && currentPlanImages.length > 1) {
    if (e.key === 'ArrowLeft') showPlanImage((currentPlanIndex - 1 + currentPlanImages.length) % currentPlanImages.length);
    if (e.key === 'ArrowRight') showPlanImage((currentPlanIndex + 1) % currentPlanImages.length);
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

document.querySelectorAll('.apartment-card, .gallery-item, .render-item, .video-item, .property-card, .city-card, .stat, .slideshow, .gallery-preview, .preview-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
