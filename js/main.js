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
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
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
  if (!track || !slides.length) return;

  const dotsContainer = document.querySelector('.testimonial-dots');
  if (dotsContainer && !dotsContainer.children.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dotsContainer.appendChild(dot);
    });
  }

  const dots = document.querySelectorAll('.testimonial-dot');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');

  let current = 0;
  let autoPlayTimer = null;

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const startAuto = () => {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => goTo(current + 1), 6000);
  };

  const pauseAuto = () => {
    clearInterval(autoPlayTimer);
  };

  track.addEventListener('mouseenter', pauseAuto);
  track.addEventListener('mouseleave', startAuto);

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

/* ---- Pricing Tabs ---- */
function initPricingTabs() {
  const tabs = document.querySelectorAll('.pricing-tab');
  const panels = document.querySelectorAll('.pricing-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetId = 'tab-' + tab.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
    });
  });
}

/* ---- Team Experience Cards (Hover & Click & Counting Numbers) ---- */
function initTeamExperienceCards() {
  const cards = document.querySelectorAll('.team-card');
  if (!cards.length) return;

  const animateCardCounters = (card) => {
    const counterEls = card.querySelectorAll('[data-counter]');
    if (!counterEls.length) return;

    counterEls.forEach(el => {
      const target = parseFloat(el.getAttribute('data-counter'));
      if (isNaN(target)) return;
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const duration = 1000;
      const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
      const easeOutQuad = t => t * (2 - t);
      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = easeOutQuad(progress) * target;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
        }
      };
      requestAnimationFrame(step);
    });
  };

  cards.forEach(card => {
    const btn = card.querySelector('.team-exp-btn');
    const closeBtn = card.querySelector('.team-exp-close');
    const expWindow = card.querySelector('.team-exp-window');

    if (!expWindow) return;

    // Desktop hover counter trigger
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('is-dismissed')) {
        animateCardCounters(card);
      }
    });

    // Toggle button click (Desktop & Mobile)
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = card.classList.contains('is-expanded');

        // Close any other open card first
        cards.forEach(c => {
          if (c !== card) {
            c.classList.remove('is-expanded', 'is-dismissed');
            const otherBtn = c.querySelector('.team-exp-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            const otherWin = c.querySelector('.team-exp-window');
            if (otherWin) otherWin.setAttribute('aria-hidden', 'true');
          }
        });

        if (isExpanded) {
          card.classList.remove('is-expanded');
          btn.setAttribute('aria-expanded', 'false');
          expWindow.setAttribute('aria-hidden', 'true');
        } else {
          card.classList.remove('is-dismissed');
          card.classList.add('is-expanded');
          btn.setAttribute('aria-expanded', 'true');
          expWindow.setAttribute('aria-hidden', 'false');
          animateCardCounters(card);
        }
      });
    }

    // Close button click
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('is-expanded');
        card.classList.add('is-dismissed');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        expWindow.setAttribute('aria-hidden', 'true');
      });
    }

    // Reset dismissed state on mouseleave so desktop hover works again
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-dismissed');
    });

    // Prevent clicks inside the window from closing it
    expWindow.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Click outside closes any active card
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.team-card')) {
      cards.forEach(c => {
        c.classList.remove('is-expanded', 'is-dismissed');
        const btn = c.querySelector('.team-exp-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        const win = c.querySelector('.team-exp-window');
        if (win) win.setAttribute('aria-hidden', 'true');
      });
    }
  });

  // ESC key closes any active card
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cards.forEach(c => {
        c.classList.remove('is-expanded', 'is-dismissed');
        const btn = c.querySelector('.team-exp-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        const win = c.querySelector('.team-exp-window');
        if (win) win.setAttribute('aria-hidden', 'true');
      });
    }
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initTestimonialSlider();
  initPortfolioFilter();
  initPricingTabs();
  initHeroAnimations();
  initTeamExperienceCards();
});