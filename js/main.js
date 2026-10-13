/* ============================================
   ZU DIGITAL HUB — MAIN JS
   ============================================ */

'use strict';

/* ---- Page Transition ---- */
const pageTransition = document.createElement('div');
pageTransition.className = 'page-transition';
document.body.prepend(pageTransition);

window.addEventListener('load', () => {
  document.body.classList.remove('loading');
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || link.target === '_blank') return;
  e.preventDefault();
  pageTransition.classList.add('active');
  setTimeout(() => {
    window.location.href = href;
  }, 450);
});

window.addEventListener('pageshow', () => {
  pageTransition.classList.remove('active');
});

/* ---- Header ---- */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let lastScroll = 0;

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  };

  // Ensure hamburger lines color matches header theme
  const isLight = header.classList.contains('header-light');
  if (!isLight) {
    header.querySelectorAll('.hamburger span').forEach(s => s.style.background = 'white');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active nav link */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  };

  hamburger.addEventListener('click', toggle);

  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggle();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggle();
  });
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ---- Animated Counters ---- */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const easeOutQuad = t => t * (2 - t);

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1800;
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const current = easedProgress * target;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ---- Testimonial Slider ---- */
function initTestimonialSlider() {
  const track = document.querySelector('.testimonials-track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (!track || !slides.length) return;

  let current = 0;
  let autoPlayTimer = null;

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const startAuto = () => {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => goTo(current + 1), 3000);
  };

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  /* Touch/Swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      startAuto();
    }
  });

  goTo(0);
  startAuto();
}

/* ---- Portfolio Filter ---- */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      items.forEach((item, i) => {
        const cat = item.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;

        if (show) {
          item.classList.remove('hidden', 'hiding');
          item.style.transitionDelay = `${i * 60}ms`;
        } else {
          item.classList.add('hiding');
          setTimeout(() => {
            item.classList.add('hidden');
            item.style.transitionDelay = '0ms';
          }, 400);
        }
      });
    });
  });
}

/* ---- Hero Animations ---- */
function initHeroAnimations() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  setTimeout(() => {
    hero.querySelector('.hero-eyebrow')?.classList.add('revealed');
  }, 200);

  setTimeout(() => {
    hero.querySelectorAll('.line-inner').forEach(el => el.classList.add('revealed'));
  }, 400);

  setTimeout(() => {
    hero.querySelector('.hero-description')?.classList.add('revealed');
  }, 700);

  setTimeout(() => {
    hero.querySelector('.hero-actions')?.classList.add('revealed');
  }, 900);

  setTimeout(() => {
    hero.querySelector('.hero-visual')?.classList.add('revealed');
  }, 300);
}

/* ---- Smooth Number Format ---- */
function formatNumber(n, decimals = 0) {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initTestimonialSlider();
  initPortfolioFilter();
  initHeroAnimations();
});
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  if (!filterBtns.length || !portfolioItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

initPortfolioFilter();