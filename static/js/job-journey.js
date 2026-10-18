// "Follow one Job" explainer on the homepage.
// Plays a Job through the network: the Coordinator checks each Island, sends the
// Job to the best match, and the answer streams back. All timing runs on a
// virtual clock so the animation can pause (button, off-screen) and resume.
(function () {
  'use strict';

  var root = document.querySelector('[data-job-journey]');
  if (!root) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ISLAND_ORDER = ['berlin', 'munich', 'hamburg', 'lisbon', 'oregon'];

  // Verdicts: ok = chosen, meh = capable but a worse match, no = can't take it
  var SCENARIOS = [
    {
      label: 'A normal day',
      status: { munich: 'busy' },
      verdicts: {
        berlin: ['ok', 'Best match'],
        munich: ['no', 'Busy'],
        hamburg: ['no', 'Model won’t fit'],
        lisbon: ['meh', 'Next region'],
        oregon: ['meh', 'Far away']
      },
      chosen: 'berlin',
      prompt: 'Name three famous archipelagos.',
      answer: 'The Philippines, Indonesia, and the Galápagos Islands.'
    },
    {
      label: 'An Island goes offline',
      status: { berlin: 'offline' },
      verdicts: {
        berlin: ['no', 'Offline'],
        munich: ['ok', 'Best match'],
        hamburg: ['no', 'Model won’t fit'],
        lisbon: ['meh', 'Next region'],
        oregon: ['meh', 'Far away']
      },
      chosen: 'munich',
      prompt: 'Summarize this email in one line.',
      answer: 'The launch moves to Tuesday, and slides are due Monday.'
    },
    {
      label: 'Your region is busy',
      status: { berlin: 'busy', munich: 'busy' },
      verdicts: {
        berlin: ['no', 'Busy'],
        munich: ['no', 'Busy'],
        hamburg: ['no', 'Model won’t fit'],
        lisbon: ['ok', 'Best available'],
        oregon: ['meh', 'Farther away']
      },
      chosen: 'lisbon',
      prompt: 'How do I say “good morning” in Portuguese?',
      answer: '“Bom dia!” In the afternoon, say “boa tarde.”'
    }
  ];

  var stage = root.querySelector('.jj-stage');
  var svg = root.querySelector('.jj-wires');
  var you = root.querySelector('[data-node="you"]');
  var coord = root.querySelector('[data-node="coord"]');
  var coordStatus = root.querySelector('.jj-coord-status');
  var steps = root.querySelectorAll('.jj-steps li');
  var promptEl = root.querySelector('[data-jj-prompt]');
  var answerEl = root.querySelector('[data-jj-answer]');
  var answerLabel = root.querySelector('[data-jj-answer-label]');
  var scenarioEl = root.querySelector('[data-jj-scenario]');
  var pauseBtn = root.querySelector('[data-jj-pause]');
  var nextBtn = root.querySelector('[data-jj-next]');
  var islands = {};
  ISLAND_ORDER.forEach(function (id) {
    islands[id] = root.querySelector('[data-island="' + id + '"]');
  });

  // ---------- Wires ----------
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var wires = {};
  function makeWire(key) {
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('class', 'jj-wire');
    svg.appendChild(path);
    wires[key] = path;
  }
  makeWire('you');
  ISLAND_ORDER.forEach(makeWire);

  function box(el) {
    var s = stage.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return { l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top,
      cx: (r.left + r.right) / 2 - s.left, cy: (r.top + r.bottom) / 2 - s.top };
  }

  // Curve between two elements, leaving from the facing sides
  function connect(path, fromEl, toEl) {
    var a = box(fromEl);
    var b = box(toEl);
    var x1, y1, x2, y2, d;
    if (b.l >= a.r - 4) {
      x1 = a.r; y1 = a.cy; x2 = b.l; y2 = b.cy;
      var mx = (x1 + x2) / 2;
      d = 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2;
    } else {
      x1 = a.cx; y1 = a.b; x2 = b.cx; y2 = b.t;
      var my = (y1 + y2) / 2;
      d = 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' + x2 + ',' + my + ' ' + x2 + ',' + y2;
    }
    path.setAttribute('d', d);
  }

  function layout() {
    svg.setAttribute('width', stage.clientWidth);
    svg.setAttribute('height', stage.clientHeight);
    connect(wires.you, you, coord);
    ISLAND_ORDER.forEach(function (id) { connect(wires[id], coord, islands[id]); });
  }

  // ---------- Virtual clock ----------
  var now = 0;
  var last = 0;
  var tasks = [];
  var rafId = 0;
  var userPaused = false;
  var visible = false;
  var gen = 0;

  function frame(ts) {
    var dt = last ? Math.min(ts - last, 50) : 16;
    last = ts;
    now += dt;
    tasks = tasks.filter(function (task) { return !task(now); });
    rafId = requestAnimationFrame(frame);
  }

  function syncClock() {
    var shouldRun = visible && !userPaused && !reduceMotion;
    if (shouldRun && !rafId) {
      last = 0;
      rafId = requestAnimationFrame(frame);
    } else if (!shouldRun && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function tween(duration, fn) {
    return new Promise(function (resolve) {
      var start = now;
      tasks.push(function (t) {
        var p = duration ? Math.min(1, (t - start) / duration) : 1;
        if (fn) fn(p);
        if (p >= 1) { resolve(); return true; }
        return false;
      });
    });
  }

  function wait(ms) { return tween(ms); }

  var CANCELLED = {};
  function guard(g) { if (g !== gen) throw CANCELLED; }

  function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

  // Moves a dot along a wire; reverse runs it from the far end back
  function travel(path, reverse, duration, dot) {
    var el = dot || spawnDot();
    return tween(duration, function (p) {
      var len = path.getTotalLength();
      var pt = path.getPointAtLength((reverse ? 1 - ease(p) : ease(p)) * len);
      el.style.transform = 'translate(' + pt.x + 'px,' + pt.y + 'px)';
    }).then(function () { return el; });
  }

  function spawnDot(small) {
    var dot = document.createElement('span');
    dot.className = 'jj-packet' + (small ? ' jj-packet-token' : '');
    dot.setAttribute('aria-hidden', 'true');
    stage.appendChild(dot);
    return dot;
  }

  function clearDots() {
    Array.prototype.forEach.call(stage.querySelectorAll('.jj-packet'), function (d) { d.remove(); });
  }

  function typeInto(el, text, duration) {
    return tween(duration, function (p) {
      el.textContent = text.slice(0, Math.round(p * text.length));
    });
  }

  // ---------- Scene state ----------
  function setStep(n) {
    Array.prototype.forEach.call(steps, function (li) {
      var s = Number(li.getAttribute('data-step'));
      li.classList.toggle('is-active', s === n);
      li.classList.toggle('is-done', s < n);
    });
  }

  function setVerdict(id, verdict) {
    var li = islands[id];
    li.setAttribute('data-verdict', verdict ? verdict[0] : '');
    li.querySelector('.jj-verdict').textContent = verdict ? verdict[1] : '';
    wires[id].setAttribute('data-verdict', verdict ? verdict[0] : '');
  }

  function reset(s, index) {
    clearDots();
    ISLAND_ORDER.forEach(function (id) {
      var li = islands[id];
      li.setAttribute('data-status', s.status[id] || 'idle');
      li.classList.remove('is-chosen', 'is-running', 'is-done');
      setVerdict(id, null);
      wires[id].classList.remove('is-lit');
    });
    wires.you.classList.remove('is-lit');
    you.classList.remove('is-active');
    coord.classList.remove('is-active');
    coordStatus.textContent = 'Waiting for a Job';
    promptEl.textContent = '';
    answerEl.textContent = '';
    answerLabel.textContent = 'Island';
    root.classList.remove('is-answering');
    scenarioEl.textContent = 'Scenario ' + (index + 1) + ' of ' + SCENARIOS.length + ': ' + s.label;
    setStep(0);
  }

  function islandName(id) {
    return islands[id].querySelector('.jj-island-name').textContent;
  }

  function renderFinal(s, index) {
    reset(s, index);
    ISLAND_ORDER.forEach(function (id) { setVerdict(id, s.verdicts[id]); });
    islands[s.chosen].classList.add('is-chosen', 'is-done');
    wires[s.chosen].classList.add('is-lit');
    wires.you.classList.add('is-lit');
    coordStatus.textContent = 'Sent to ' + islandName(s.chosen);
    promptEl.textContent = s.prompt;
    answerLabel.textContent = 'Island · ' + islandName(s.chosen);
    answerEl.textContent = s.answer;
    setStep(5);
  }

  async function play(s, index, g) {
    reset(s, index);
    var chosen = islands[s.chosen];
    var name = islandName(s.chosen);

    await wait(700); guard(g);

    // 1. Send
    setStep(1);
    you.classList.add('is-active');
    await typeInto(promptEl, s.prompt, 700); guard(g);
    wires.you.classList.add('is-lit');
    var dot = await travel(wires.you, false, 900); guard(g);
    dot.remove();
    coord.classList.add('is-active');

    // 2. Pick an Island
    setStep(2);
    coordStatus.textContent = 'Checking ' + ISLAND_ORDER.length + ' Islands…';
    for (var i = 0; i < ISLAND_ORDER.length; i++) {
      await wait(420); guard(g);
      setVerdict(ISLAND_ORDER[i], s.verdicts[ISLAND_ORDER[i]]);
    }
    await wait(700); guard(g);

    // 3. Run the Cargo
    setStep(3);
    coordStatus.textContent = 'Sending to ' + name;
    chosen.classList.add('is-chosen');
    wires[s.chosen].classList.add('is-lit');
    dot = await travel(wires[s.chosen], false, 800); guard(g);
    dot.remove();
    chosen.classList.add('is-running');
    chosen.querySelector('.jj-verdict').textContent = 'Running Cargo';
    coordStatus.textContent = 'Running on ' + name;
    await wait(1300); guard(g);

    // 4. Stream back: tokens hop Island -> Coordinator -> you while text types
    setStep(4);
    coordStatus.textContent = 'Relaying tokens';
    answerLabel.textContent = 'Island · ' + name;
    root.classList.add('is-answering');
    var streamFor = 2400;
    var streaming = typeInto(answerEl, s.answer, streamFor);
    for (var sent = 0; sent < streamFor; sent += 260) {
      (function () {
        var token = spawnDot(true);
        travel(wires[s.chosen], true, 550, token).then(function () {
          return travel(wires.you, true, 550, token);
        }).then(function () { token.remove(); });
      })();
      await wait(260); guard(g);
    }
    await streaming; guard(g);
    await wait(1200); guard(g);
    root.classList.remove('is-answering');
    chosen.classList.remove('is-running');
    chosen.classList.add('is-done');
    chosen.querySelector('.jj-verdict').textContent = 'Done · work recorded';
    coordStatus.textContent = 'Job complete';
    setStep(5);
    await wait(3500); guard(g);
  }

  var index = 0;

  async function loop() {
    var g = ++gen;
    tasks = [];
    try {
      while (true) {
        await play(SCENARIOS[index], index, g);
        index = (index + 1) % SCENARIOS.length;
      }
    } catch (e) {
      if (e !== CANCELLED) throw e;
    }
  }

  function show(i) {
    index = i;
    if (reduceMotion) {
      renderFinal(SCENARIOS[index], index);
    } else {
      loop();
    }
  }

  nextBtn.addEventListener('click', function () {
    if (userPaused) setPaused(false);
    show((index + 1) % SCENARIOS.length);
  });

  function setPaused(p) {
    userPaused = p;
    pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
    pauseBtn.textContent = p ? 'Play' : 'Pause';
    root.classList.toggle('is-paused', p);
    syncClock();
  }
  pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
  if (reduceMotion) pauseBtn.hidden = true;

  layout();
  if (window.ResizeObserver) {
    new ResizeObserver(layout).observe(stage);
  } else {
    window.addEventListener('resize', layout);
  }
  // Fonts loading late can shift node sizes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  root.classList.add('is-ready');
  var started = false;
  function start() {
    if (started) return;
    started = true;
    show(0);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
      syncClock();
    }, { threshold: 0.25 }).observe(root);
  } else {
    visible = true;
    start();
    syncClock();
  }
  // Render the first scene right away so the stage is never empty
  renderFinal(SCENARIOS[0], 0);
  if (!reduceMotion) reset(SCENARIOS[0], 0);
})();
