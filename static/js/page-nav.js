// In-page section navigation for long pages.
// Builds pill links from <section data-toc="Label" id="..."> elements, keeps the
// pill for the section in view highlighted, and scrolls it into view on phones.
(function () {
  'use strict';

  var nav = document.querySelector('[data-page-nav]');
  if (!nav) return;
  var list = nav.querySelector('.page-nav-list');
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[data-toc][id]'));
  if (sections.length < 3 || !list) return;

  var links = sections.map(function (section) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + section.id;
    a.textContent = section.getAttribute('data-toc');
    a.className = 'page-nav-link';
    li.appendChild(a);
    list.appendChild(li);
    return a;
  });
  nav.hidden = false;

  var current = null;
  function setActive(index) {
    if (current === index) return;
    current = index;
    links.forEach(function (link, i) {
      var active = i === index;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
        // Keep the active pill visible in the horizontally scrolling bar
        var left = link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2;
        list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // The active section is the last one whose top has passed a line a quarter of
  // the way down the visible area (sections carry large top padding)
  function update() {
    var top = nav.getBoundingClientRect().bottom;
    var offset = top + (window.innerHeight - top) * 0.25;
    var index = -1;
    sections.forEach(function (section, i) {
      if (section.getBoundingClientRect().top <= offset) index = i;
    });
    setActive(index);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
