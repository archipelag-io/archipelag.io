// Scroll reveal and sequenced diagrams.
// Content below the fold fades up as it enters the viewport; content already on
// screen at load is left alone so nothing flashes. [data-sequence] diagrams
// light their steps one after another while visible.
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TARGETS = [
    '.section-header', '.section-header-row', '.antigrid-card', '.audience-grid > *',
    '.maturity-col', '.faq-item', '.glossary-strip', '.final-cta-panel', '.jj', '.bm',
    '.plan-layout > *', '.lab-divider', '.cargo-card'
  ].join(',');

  var fold = window.innerHeight;
  var seen = [];

  Array.prototype.forEach.call(document.querySelectorAll('main ' + TARGETS.split(',').join(', main ')), function (el) {
    if (el.getBoundingClientRect().top < fold) return;
    // Nested targets would fade twice; the outermost one is enough
    if (el.parentElement && el.parentElement.closest('.reveal')) return;
    el.classList.add('reveal');
    seen.push(el);
  });

  // Stagger siblings that enter together
  seen.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--reveal-delay', Math.min(i, 4) * 80 + 'ms');
  });

  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  seen.forEach(function (el) { revealer.observe(el); });

  // Sequenced diagrams
  Array.prototype.forEach.call(document.querySelectorAll('[data-sequence]'), function (diagram) {
    var steps = diagram.querySelectorAll(diagram.getAttribute('data-sequence') || ':scope > *');
    if (!steps.length) return;
    var timer = 0;
    var lit = 0;

    function tick() {
      lit = lit >= steps.length ? 0 : lit + 1;
      Array.prototype.forEach.call(steps, function (s, i) { s.classList.toggle('is-lit', i < lit); });
    }

    diagram.classList.add('is-sequencing');
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!timer) { tick(); timer = setInterval(tick, 900); }
      } else {
        clearInterval(timer);
        timer = 0;
      }
    }, { threshold: 0.4 }).observe(diagram);
  });
})();
