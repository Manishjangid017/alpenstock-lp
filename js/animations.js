/*==================================================
  ALPENSTOCK - PREMIUM ON-SCROLL ANIMATIONS (engine)
  No HTML changes needed: elements are tagged by
  selector in the config below.
==================================================*/
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('has-anim')) return; // reduced-motion or disabled
  window.__animReady = true;

  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------- 1. CONFIG (one line per animation, in page order) ----------
     items   : what to animate
     scope   : (optional) container that triggers all its items together, with stagger
     fx      : up | down | left | right | rise | zoom | fade | split
     delay   : seconds before it starts
     stagger : seconds between items (only with scope)
     on      : 'load' = play on page load instead of on scroll
  ------------------------------------------------------------------------ */
  var CONFIG = [
    /* 1. Hero (plays on load) */
    { items: '.hero__logo', fx: 'down', delay: 0.15, on: 'load' },
    { items: '.hero__badge', fx: 'up', delay: 0.35, on: 'load' },
    { items: '.hero__title', fx: 'split', delay: 0.5, on: 'load' },
    { items: '.hero__text', fx: 'up', delay: 0.95, on: 'load' },
    { items: '.hero__actions', fx: 'up', delay: 1.1, on: 'load' },

    /* 2. Marquee */
    { items: '.stats-marquee .marquee', fx: 'fade' },

    /* 3. Why Alpenstock */
    { items: '.why__eyebrow', fx: 'up' },
    { items: '.why__title', fx: 'split', delay: 0.1 },
    { scope: '.why__grid', items: '.why__grid > .col', fx: 'rise', stagger: 0.14, delay: 0.1 },

    /* 4. Boarding */
    { items: '.boarding__eyebrow', fx: 'up' },
    { items: '.boarding__title', fx: 'split', delay: 0.08 },
    { items: '.boarding__text', fx: 'up', delay: 0.3 },
    { scope: '.board-tabs', items: '.board-tab', fx: 'left', stagger: 0.1, delay: 0.1 },
    { items: '.board-media', fx: 'zoom', delay: 0.1 },

    /* 5. Life at Alpenstock */
    { items: '.life__title', fx: 'split' },
    { items: '.life__text', fx: 'up', delay: 0.25 },
    { items: '.life__slider', fx: 'rise', delay: 0.15 },

    /* 6. Play. Push. Perform. */
    { items: '.play__heading', fx: 'left' },
    { items: '.play__viewport', fx: 'zoom', delay: 0.15 },
    { items: '.play__content', fx: 'right', delay: 0.3 },

    /* 7. Built for the Whole Child */
    { items: '.whole__title', fx: 'split' },
    { scope: '.bento', items: '.bento__cell', fx: 'zoom', stagger: 0.09, delay: 0.1 },

    /* 8. CTA keeps its own animation (data-cta in index.html) */

    /* 9. Footer */
    {
      scope: '.footer__top',
      items:
        '.footer__brand-row, .footer__about, .footer__badges, .footer__social, .footer__heading, .footer__item',
      fx: 'up',
      stagger: 0.06,
    },
    { items: '.footer__bottom', fx: 'fade' },
    { items: '.footer__credit', fx: 'fade', delay: 0.1 },
  ];

  /* ---------- 2. Headline splitter (word-mask reveal) ---------- */
  function splitWords(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var frag = document.createDocumentFragment();
    var i = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          var w = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          var inner = document.createElement('span');
          inner.className = 'w__i';
          inner.style.setProperty('--i', i++);
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
      } else {
        frag.appendChild(n.cloneNode(true)); // keeps <br>, <span> etc.
      }
    });
    el.textContent = '';
    el.appendChild(frag);
  }

  /* ---------- 3. Reveal engine ---------- */
  var triggers = new Map(); // scope element -> array of items to reveal
  var loadItems = [];

  function tag(el, fx, delay) {
    if (fx === 'split') splitWords(el);
    el.setAttribute('data-rv', fx);
    el.style.setProperty('--rv-d', delay.toFixed(2) + 's');
    el.__rvDelay = delay;
    el.__rvFx = fx;
  }

  function reveal(el) {
    el.classList.add('is-visible');
    // After the animation ends, drop the reveal attribute so the
    // element's own hover/transition styles work normally again.
    if (el.__rvFx !== 'split') {
      setTimeout(
        function () {
          el.removeAttribute('data-rv');
          el.style.removeProperty('--rv-d');
        },
        (el.__rvDelay + 1.5) * 1000,
      );
    }
  }

  function addTrigger(scopeEl, group) {
    if (!triggers.has(scopeEl)) triggers.set(scopeEl, []);
    triggers.get(scopeEl).push(group);
  }

  CONFIG.forEach(function (c) {
    var base = c.delay || 0;

    if (c.scope) {
      $$(c.scope).forEach(function (scopeEl) {
        var items = $$(c.items, scopeEl);
        items.forEach(function (el, i) {
          tag(el, c.fx, base + i * (c.stagger || 0));
        });
        if (items.length) addTrigger(scopeEl, items);
      });
    } else {
      $$(c.items).forEach(function (el) {
        tag(el, c.fx, base);
        if (c.on === 'load') loadItems.push(el);
        else addTrigger(el, [el]);
      });
    }
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        // also reveal anything already scrolled past (e.g. page restored mid-scroll)
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          (triggers.get(e.target) || []).forEach(function (group) {
            group.forEach(reveal);
          });
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  );
  triggers.forEach(function (_, el) {
    io.observe(el);
  });

  /* ---------- 4. Hero intro (after fonts are ready) ---------- */
  var hero = document.querySelector('.hero');
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([
    fontsReady,
    new Promise(function (r) {
      setTimeout(r, 1200);
    }),
  ]).then(function () {
    requestAnimationFrame(function () {
      if (hero) hero.classList.add('is-loaded');
      loadItems.forEach(reveal);
    });
  });

  /* ---------- 5. Number count-up (Built for the Whole Child) ---------- */
  var counters = $$('.bento__stat .stat__num');
  var counterIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        counterIO.unobserve(e.target);
        runCounter(e.target);
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach(function (el) {
    var m = el.textContent.trim().match(/^(\d+)(.*)$/);
    if (!m) return;
    el.__target = parseInt(m[1], 10);
    el.__suffix = m[2];
    el.textContent = '0' + m[2];
    counterIO.observe(el);
  });

  function runCounter(el) {
    var duration = 1800;
    setTimeout(function () {
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / duration, 1);
        var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
        el.textContent = Math.round(el.__target * eased) + el.__suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, 450);
  }

  /* ---------- 6. Scroll progress bar + hero parallax ---------- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var heroVideo = hero && hero.querySelector('.hero__video');
  var heroContent = hero && hero.querySelector('.hero__content');
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';

    if (hero && y <= hero.offsetHeight) {
      var p = y / hero.offsetHeight;
      if (heroVideo) heroVideo.style.transform = 'translate3d(0,' + (y * 0.15).toFixed(1) + 'px,0)';
      if (heroContent) {
        heroContent.style.transform = 'translate3d(0,' + (y * 0.1).toFixed(1) + 'px,0)';
        heroContent.style.opacity = Math.max(0, 1 - p * 1.3).toFixed(3);
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
