// Provider toggle for the "change one URL" code sample.
// Flips the base URL and model lines between OpenAI and Archipelag.io, flashes
// the changed lines, and replays the streamed output. Auto-flips while in view
// until the visitor uses the toggle themselves.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var REPLY = 'Hello! How can I help you today?';

  Array.prototype.forEach.call(document.querySelectorAll('[data-url-swap]'), function (fig) {
    var buttons = fig.querySelectorAll('[data-swap-to]');
    var output = fig.querySelector('[data-swap-output]');
    var typing = 0;
    var flashTimer = 0;
    var autoTimer = 0;
    var touched = false;
    var visible = false;

    function stream() {
      clearInterval(typing);
      if (reduceMotion) { output.textContent = REPLY; return; }
      var words = REPLY.split(' ');
      var n = 0;
      output.textContent = '';
      typing = setInterval(function () {
        n += 1;
        output.textContent = words.slice(0, n).join(' ');
        if (n >= words.length) clearInterval(typing);
      }, 110);
    }

    function set(provider) {
      fig.setAttribute('data-provider', provider);
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-swap-to') === provider ? 'true' : 'false');
      });
      fig.classList.add('is-flashing');
      clearTimeout(flashTimer);
      flashTimer = setTimeout(function () { fig.classList.remove('is-flashing'); }, 900);
      stream();
    }

    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () {
        touched = true;
        clearInterval(autoTimer);
        set(b.getAttribute('data-swap-to'));
      });
    });

    function auto() {
      clearInterval(autoTimer);
      if (touched || reduceMotion || !visible) return;
      autoTimer = setInterval(function () {
        set(fig.getAttribute('data-provider') === 'a' ? 'b' : 'a');
      }, 3800);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        auto();
      }, { threshold: 0.4 }).observe(fig);
    }
  });
})();
