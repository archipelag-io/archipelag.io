// Budget slider on the Compute Exchange page. Mirrors the Coordinator's
// market selection (Jobs.find_host_with_market_pricing): the best placement
// match takes the Job if its ask fits the budget; otherwise the cheapest
// eligible Island within budget does. The Consumer always pays the ask.
(function () {
  'use strict';

  var root = document.querySelector('[data-budget-match]');
  if (!root) return;

  var SCALE = 20;
  var range = root.querySelector('[data-bm-range]');
  var out = root.querySelector('[data-bm-out]');
  var line = root.querySelector('[data-bm-line]');
  var result = root.querySelector('[data-bm-result]');
  var bars = Array.prototype.map.call(root.querySelectorAll('.bm-bar'), function (el) {
    el.style.setProperty('--h', (Number(el.getAttribute('data-ask')) / SCALE) * 100 + '%');
    return { el: el, ask: Number(el.getAttribute('data-ask')), name: el.getAttribute('data-name'), best: el.hasAttribute('data-best') };
  });
  var best = bars.filter(function (b) { return b.best; })[0];

  function credits(n) { return n + (n === 1 ? ' credit' : ' credits'); }

  function update() {
    var budget = Number(range.value);
    out.textContent = credits(budget);
    line.style.setProperty('--b', (budget / SCALE) * 100 + '%');

    var chosen = null;
    if (best.ask <= budget) {
      chosen = best;
    } else {
      bars.forEach(function (b) {
        if (b.ask <= budget && (!chosen || b.ask < chosen.ask)) chosen = b;
      });
    }

    bars.forEach(function (b) {
      b.el.classList.toggle('is-eligible', b.ask <= budget);
      b.el.classList.toggle('is-out', b.ask > budget);
      b.el.classList.toggle('is-chosen', b === chosen);
    });

    var html;
    if (chosen === best) {
      html = 'Your Job runs on <strong>' + best.name + '</strong>, the best fit. You pay its ask, <strong>' +
        credits(best.ask) + '</strong>' + (budget > best.ask ? ', not your full budget of ' + credits(budget) + '.' : '.');
    } else {
      html = best.name + ' asks ' + credits(best.ask) + ', more than your budget. The Coordinator picks the cheapest capable Island ' +
        'within budget instead: <strong>' + chosen.name + '</strong> at <strong>' + credits(chosen.ask) + '</strong>.';
    }
    result.innerHTML = html;
  }

  range.addEventListener('input', update);
  update();
})();
