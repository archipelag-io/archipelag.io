// Karma sandbox on /earn. Mirrors the Coordinator's default rules
// (app/lib/coordinator/karma.ex): 60 compute minutes = +1 Karma, minutes count
// 1.5x while below the 10-Karma threshold, penalties -3 / -5 / -20, and Karma
// can go below zero.
(function () {
  'use strict';

  var root = document.querySelector('[data-karma-meter]');
  if (!root) return;

  var THRESHOLD = 10;
  var MINUTES_PER_KARMA = 60;
  var BOOST = 1.5;
  var SCALE_MAX = 30;
  var PENALTIES = {
    timeout: [-3, 'Job timed out'],
    failed: [-5, 'Job failed'],
    disconnect: [-20, 'Disconnected mid-Job']
  };

  var scoreEl = root.querySelector('[data-km-score]');
  var hoursEl = root.querySelector('[data-km-hours]');
  var statusEl = root.querySelector('[data-km-status]');
  var fillEl = root.querySelector('[data-km-fill]');
  var logEl = root.querySelector('[data-km-log]');
  var playBtn = root.querySelector('[data-km="play"]');

  var karma, pending, hours, playTimer;

  function log(text, delta) {
    var li = document.createElement('li');
    var label = document.createElement('span');
    label.textContent = text;
    li.appendChild(label);
    if (delta) {
      var d = document.createElement('span');
      d.className = delta > 0 ? 'km-plus' : 'km-minus';
      d.textContent = (delta > 0 ? '+' : '−') + Math.abs(delta);
      li.appendChild(d);
    }
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 4) logEl.removeChild(logEl.lastChild);
  }

  function render() {
    scoreEl.textContent = karma < 0 ? '−' + Math.abs(karma) : String(karma);
    hoursEl.textContent = String(hours);
    fillEl.style.width = Math.max(0, Math.min(1, karma / SCALE_MAX)) * 100 + '%';
    var earning = karma >= THRESHOLD;
    root.classList.toggle('is-earning', earning);
    root.classList.toggle('is-negative', karma < 0);
    statusEl.textContent = earning
      ? 'Jobs are credited'
      : 'Not credited yet · ' + (THRESHOLD - karma) + ' to go';
  }

  function addHour() {
    var boosted = karma < THRESHOLD;
    hours += 1;
    pending += boosted ? MINUTES_PER_KARMA * BOOST : MINUTES_PER_KARMA;
    var gained = Math.floor(pending / MINUTES_PER_KARMA);
    pending = pending % MINUTES_PER_KARMA;
    var wasEarning = karma >= THRESHOLD;
    karma += gained;
    log('Hour ' + hours + (boosted ? ' · 1.5× new-Island boost' : ' of Jobs'), gained);
    if (!wasEarning && karma >= THRESHOLD) log('Threshold reached · Jobs now credited');
    render();
  }

  function penalize(kind) {
    var p = PENALTIES[kind];
    var wasEarning = karma >= THRESHOLD;
    karma += p[0];
    log(p[1], p[0]);
    if (wasEarning && karma < THRESHOLD) log('Below threshold · credits paused');
    render();
  }

  function stop() {
    clearInterval(playTimer);
    playTimer = 0;
    playBtn.textContent = 'Play a day';
  }

  function reset() {
    stop();
    karma = 0;
    pending = 0;
    hours = 0;
    logEl.textContent = '';
    log('New Island comes online');
    render();
  }

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-km]');
    if (!btn) return;
    var action = btn.getAttribute('data-km');
    if (action === 'hour') addHour();
    else if (action === 'reset') reset();
    else if (action === 'play') {
      if (playTimer) { stop(); return; }
      playBtn.textContent = 'Pause';
      var left = 24;
      playTimer = setInterval(function () {
        addHour();
        left -= 1;
        if (left <= 0) stop();
      }, 280);
    } else penalize(action);
  });

  reset();
})();
