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
  var cvCues = Array.prototype.slice.call(document.querySelectorAll('.cv-cue'));
  var bgLayers = Array.prototype.slice.call(document.querySelectorAll('.cv-bg-layer'));
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cross-fade two background layers between scenes.
  // We use two layers so background-image swaps don't flicker.
  var bgState = { current: 0, lastUrl: '' };
  function setSceneBg(url) {
    if (!bgLayers.length || prefersReduced) return;
    if (!url) {
      bgLayers.forEach(function (l) { l.classList.remove('is-active'); });
      bgState.lastUrl = '';
      return;
    }
    if (url === bgState.lastUrl) return;
    bgState.lastUrl = url;
    var next = (bgState.current + 1) % 2;
    var nextLayer = bgLayers[next];
    var prevLayer = bgLayers[bgState.current];
    nextLayer.style.backgroundImage = 'url("' + url + '")';
    // double-RAF to ensure the new image is decoded before fading
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        nextLayer.classList.add('is-active');
        if (prevLayer) prevLayer.classList.remove('is-active');
        bgState.current = next;
      });
    });
  }

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

    // Reading-line continuous progress model.
    // For each scene compute progress = clamp01((readingY - top) / height).
    // Drives: per-item --p, --cv-rail-fill, --cv-bg-opacity (bell curve),
    //         and the discrete .is-active marker + bg image swap.
    var cvRoot = document.querySelector('.cv-scroll');
    var READING_LINE_RATIO = 0.40;
    var lastActiveIndex = -1;
    var ticking = false;

    function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

    function compute() {
      ticking = false;
      if (!cvRoot || !cvScenes.length) return;
      var readingY = window.innerHeight * READING_LINE_RATIO;

      // Phase 1 — reads only.
      var progress = new Array(cvScenes.length);
      for (var i = 0; i < cvScenes.length; i++) {
        var r = cvScenes[i].getBoundingClientRect();
        var h = r.bottom - r.top;
        progress[i] = h > 0 ? clamp01((readingY - r.top) / h) : 0;
      }

      // Active = last scene with progress > 0; clamp at last when all done.
      var activeIndex = 0;
      var allZero = true, allOne = true;
      for (var j = 0; j < progress.length; j++) {
        if (progress[j] > 0) allZero = false;
        if (progress[j] < 1) allOne = false;
        if (progress[j] > 0 && progress[j] <= 1) activeIndex = j;
      }
      if (allZero) activeIndex = 0;
      if (allOne) activeIndex = progress.length - 1;

      var activeProgress = progress[activeIndex];
      var railFill = (activeIndex + activeProgress) / progress.length;
      var bgOpacity = Math.sin(activeProgress * Math.PI); // 0..1..0

      // Phase 2 — writes.
      cvRoot.style.setProperty('--cv-rail-fill', railFill.toFixed(4));
      cvRoot.style.setProperty('--cv-active-index', activeIndex);
      cvRoot.style.setProperty('--cv-active-progress', activeProgress.toFixed(4));
      cvRoot.style.setProperty('--cv-bg-opacity', bgOpacity.toFixed(4));

      for (var k = 0; k < progress.length; k++) {
        var pStr = progress[k].toFixed(4);
        if (cvNav[k]) cvNav[k].style.setProperty('--p', pStr);
        if (cvCues[k]) cvCues[k].style.setProperty('--p', pStr);
      }

      // Discrete marker + bg image swap on activeIndex change.
      if (activeIndex !== lastActiveIndex) {
        for (var m = 0; m < cvNav.length; m++) {
          var on = (m === activeIndex);
          cvNav[m].classList.toggle('is-active', on);
          if (on) cvNav[m].setAttribute('aria-current', 'true');
          else cvNav[m].removeAttribute('aria-current');
        }
        for (var n = 0; n < cvCues.length; n++) {
          cvCues[n].classList.toggle('is-active', n === activeIndex);
        }
        var url = cvScenes[activeIndex].getAttribute('data-bg');
        setSceneBg(url);
        lastActiveIndex = activeIndex;
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(compute); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    compute();

    // Click-to-scroll on left timeline (kept).
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
})();
