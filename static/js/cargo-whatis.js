// "What's a Cargo?" expandable panel toggle
(function () {
  'use strict';
  var btn = document.getElementById('cargo-whatis-toggle');
  var panel = document.getElementById('cargo-whatis-panel');
  if (!btn || !panel) return;
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !open);
    if (open) { panel.setAttribute('inert', ''); } else { panel.removeAttribute('inert'); }
    panel.style.maxHeight = open ? '0' : panel.scrollHeight + 'px';
  });
  window.addEventListener('resize', function () {
    if (btn.getAttribute('aria-expanded') === 'true') {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
})();
