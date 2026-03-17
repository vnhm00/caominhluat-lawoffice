document.addEventListener('DOMContentLoaded', function () {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Auto-update "years of experience" counters from founding year.
  var experienceCounters = document.querySelectorAll('.trust-number[data-start-year]');
  experienceCounters.forEach(function (counter) {
    var startYear = parseInt(counter.getAttribute('data-start-year'), 10);
    if (!Number.isFinite(startYear)) {
      return;
    }

    var currentYear = new Date().getFullYear();
    var years = Math.max(0, currentYear - startYear);
    counter.textContent = years + '+';
  });

  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavLinks = mobileNav.querySelectorAll('a[href^="#"]');

  // Header scroll shadow
  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Hamburger toggle
  hamburger.addEventListener('click', function () {
    const isOpen = mobileNav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav on link click
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      mobileNav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Scroll-triggered animations
  var animatedElements = document.querySelectorAll('.animate-on-scroll');
  var serviceCards = document.querySelectorAll('.service-card');
  var intlCards = document.querySelectorAll('.intl-card');

  function setCollapsibleMode(cards) {
    var isSmallScreen = window.matchMedia('(max-width: 767px)').matches;

    cards.forEach(function (card) {
      if (isSmallScreen) {
        card.classList.add('is-collapsible');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        if (!card.classList.contains('is-open')) {
          card.setAttribute('aria-expanded', 'false');
        }
      } else {
        card.classList.remove('is-collapsible', 'is-open');
        card.removeAttribute('role');
        card.removeAttribute('tabindex');
        card.removeAttribute('aria-expanded');
      }
    });
  }

  function toggleCard(card, cards) {
    if (!card.classList.contains('is-collapsible')) {
      return;
    }

    var willOpen = !card.classList.contains('is-open');

    cards.forEach(function (otherCard) {
      otherCard.classList.remove('is-open');
      otherCard.setAttribute('aria-expanded', 'false');
    });

    if (willOpen) {
      card.classList.add('is-open');
      card.setAttribute('aria-expanded', 'true');
    }
  }

  function bindCollapsibleCards(cards) {
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        toggleCard(card, cards);
      });

      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleCard(card, cards);
        }
      });
    });
  }

  bindCollapsibleCards(serviceCards);
  bindCollapsibleCards(intlCards);

  function syncCollapsibleCards() {
    setCollapsibleMode(serviceCards);
    setCollapsibleMode(intlCards);
  }

  syncCollapsibleCards();
  window.addEventListener('resize', syncCollapsibleCards, { passive: true });

  // ─── Capability Carousel ───
  (function () {
    var carousel = document.querySelector('.capability-carousel');
    if (!carousel) return;

    var track = carousel.querySelector('.capability-carousel-track');
    var slides = carousel.querySelectorAll('.capability-slide');
    var prevBtn = carousel.querySelector('.carousel-btn-prev');
    var nextBtn = carousel.querySelector('.carousel-btn-next');
    var dots = carousel.querySelectorAll('.carousel-dot');
    var currentIndex = 0;
    var totalSlides = slides.length;

    function isActive() {
      return window.matchMedia('(max-width: 639px)').matches;
    }

    function goTo(index) {
      if (!isActive()) return;
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === currentIndex);
        dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      });
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentIndex + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    // Touch / swipe support
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (!isActive()) return;
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });

    // Reset inline transform on resize to desktop
    window.addEventListener('resize', function () {
      if (!isActive()) {
        track.style.transform = '';
        currentIndex = 0;
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === 0);
          dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        });
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = false;
      } else {
        goTo(currentIndex);
      }
    }, { passive: true });

    goTo(0);
  }());

  // ─── Team Carousel ───
  (function () {
    var carousel = document.querySelector('.team-carousel');
    if (!carousel) return;

    var viewportEl = carousel.querySelector('.team-carousel-viewport');
    var track = carousel.querySelector('.team-carousel-track');
    var slides = carousel.querySelectorAll('.team-carousel-slide');
    var prevBtn = carousel.querySelector('.carousel-btn-prev');
    var nextBtn = carousel.querySelector('.carousel-btn-next');
    var dotsContainer = carousel.querySelector('.carousel-dots');
    var totalSlides = slides.length;
    var currentPage = 0;
    var dots = [];

    function isActive() {
      return window.matchMedia('(max-width: 1023px)').matches;
    }

    // Mobile = 1 card per page; tablet = 2 cards per page
    function getItemsPerPage() {
      return window.matchMedia('(min-width: 640px)').matches ? 2 : 1;
    }

    function getTotalPages() {
      return Math.ceil(totalSlides / getItemsPerPage());
    }

    function renderDots() {
      var pages = getTotalPages();
      dotsContainer.innerHTML = '';
      dots = [];
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === currentPage ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Trang ' + (i + 1));
        dot.setAttribute('aria-selected', i === currentPage ? 'true' : 'false');
        (function (idx) {
          dot.addEventListener('click', function () { goTo(idx); });
        }(i));
        dotsContainer.appendChild(dot);
        dots.push(dot);
      }
    }

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === currentPage);
        dot.setAttribute('aria-selected', i === currentPage ? 'true' : 'false');
      });
    }

    function goTo(page) {
      if (!isActive()) return;
      var pages = getTotalPages();
      currentPage = Math.max(0, Math.min(page, pages - 1));
      // Translate by multiples of the visible viewport width
      track.style.transform = 'translateX(-' + (currentPage * viewportEl.offsetWidth) + 'px)';
      updateDots();
      if (prevBtn) prevBtn.disabled = currentPage === 0;
      if (nextBtn) nextBtn.disabled = currentPage === pages - 1;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentPage - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentPage + 1); });

    // Touch / swipe support
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (!isActive()) return;
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? currentPage + 1 : currentPage - 1);
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (!isActive()) {
        track.style.transform = '';
        currentPage = 0;
      } else {
        // Items-per-page may have changed; rebuild dots and re-snap
        renderDots();
        var pages = getTotalPages();
        currentPage = Math.min(currentPage, pages - 1);
        goTo(currentPage);
      }
    }, { passive: true });

    // Initial render
    renderDots();
    if (isActive()) goTo(0);
  }());

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animatedElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
});
