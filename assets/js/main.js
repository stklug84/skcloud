/* Steffen Klug — site interactions
   - Theme toggle (auto / light / dark) with localStorage
   - Mobile nav toggle
   - Sticky-header scroll state
   - Scroll-reveal for .reveal and .reveal-children
   - CV scrollorama: active state in left timeline + click-to-scroll
*/
(function () {
  'use strict';

  var html = document.documentElement;
  var mql = window.matchMedia('(prefers-color-scheme: dark)');

  // ---------- Theme ----------
  function resolveTheme(t) {
    if (t === 'auto' || !t) return mql.matches ? 'dark' : 'light';
    return t;
  }
  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    html.setAttribute('data-resolved', resolveTheme(t));
  }
  function nextTheme(t) {
    // cycle: auto -> light -> dark -> auto
    if (t === 'auto') return 'light';
    if (t === 'light') return 'dark';
    return 'auto';
  }
  var saved = (function () {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  })();
  applyTheme(saved || 'auto');

  mql.addEventListener && mql.addEventListener('change', function () {
    var current = html.getAttribute('data-theme') || 'auto';
    if (current === 'auto') applyTheme('auto');
  });

  document.querySelectorAll('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') || 'auto';
      var next = nextTheme(current);
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      btn.setAttribute('title', 'Theme: ' + next + ' (click to change)');
    });
  });

  // ---------- Mobile nav ----------
  var nav = document.querySelector('.site-nav');
  var navToggle = document.querySelector('.nav-toggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    // close on Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // ---------- Header scroll state ----------
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Scroll reveal ----------
  var reveals = [];
  document.querySelectorAll('.reveal').forEach(function (el) { reveals.push(el); });
  document.querySelectorAll('.reveal-children').forEach(function (parent) {
    Array.prototype.forEach.call(parent.children, function (child) { reveals.push(child); });
  });

  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // small staggered delay if siblings
          var parent = entry.target.parentElement;
          if (parent && parent.classList.contains('reveal-children')) {
            var index = Array.prototype.indexOf.call(parent.children, entry.target);
            entry.target.style.transitionDelay = Math.min(index * 60, 360) + 'ms';
          }
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---------- CV scrollorama ----------
  var cvScenes = Array.prototype.slice.call(document.querySelectorAll('.cv-scene'));
  var cvNav = Array.prototype.slice.call(document.querySelectorAll('.cv-timeline li'));

  if (cvScenes.length) {
    // Reveal scenes
    if ('IntersectionObserver' in window) {
      var sceneIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            sceneIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      cvScenes.forEach(function (s) { sceneIO.observe(s); });
    } else {
      cvScenes.forEach(function (s) { s.classList.add('is-visible'); });
    }

    // Active-state tracking on left timeline
    if ('IntersectionObserver' in window && cvNav.length) {
      var setActive = function (id) {
        cvNav.forEach(function (li) {
          li.classList.toggle('is-active', li.getAttribute('data-target') === id);
        });
      };
      var activeIO = new IntersectionObserver(function (entries) {
        // pick the entry closest to the top of the viewport that is intersecting
        var visible = entries.filter(function (e) { return e.isIntersecting; });
        if (!visible.length) return;
        visible.sort(function (a, b) {
          return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
        });
        setActive(visible[0].target.id);
      }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.6, 1] });
      cvScenes.forEach(function (s) { activeIO.observe(s); });

      // initialize first as active
      setActive(cvScenes[0].id);

      // click to scroll
      cvNav.forEach(function (li) {
        li.addEventListener('click', function () {
          var id = li.getAttribute('data-target');
          var target = document.getElementById(id);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); li.click();
          }
        });
      });
    }
  }
})();
