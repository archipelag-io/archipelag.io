// Hero scroll expansion
(function() {
  const wrapper = document.getElementById('hero-wrapper');
  if (!wrapper) return;
  const section = wrapper.querySelector('.hero-section');
  const SCROLL_DISTANCE = 200;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update() {
    if (reduceMotion) return;
    const t = Math.min(1, window.scrollY / SCROLL_DISTANCE);
    const eased = t * t;
    const radius = (1 - eased) * 2.5;
    const pad = (1 - eased);
    section.style.setProperty('--hero-radius', radius + 'rem');
    wrapper.style.padding = (pad * 24) + 'px ' + (pad * 24) + 'px 0';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// Archipelago map canvas animation
(function() {
  const canvas = document.getElementById('archipelago-map');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const section = canvas.parentElement;
  const networkStatusLabel = document.getElementById('network-sim-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildGrid(rect.width, rect.height);
  }

  function colorToRgb(value, fallback) {
    const color = value.trim();
    const hex = color.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const n = parseInt(hex[1], 16);
      return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    }
    const rgb = color.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    return rgb ? rgb[1] + ',' + rgb[2] + ',' + rgb[3] : fallback;
  }

  function getColors() {
    const styles = getComputedStyle(document.documentElement);
    const dark = !document.documentElement.classList.contains('light');
    return {
      wire: colorToRgb(styles.getPropertyValue('--accent'), '0,255,221'),
      yellow: dark
        ? colorToRgb(styles.getPropertyValue('--accent-yellow'), '255,240,51')
        : '201,147,0',
      pink: colorToRgb(styles.getPropertyValue('--accent-pink'), '255,92,184'),
      bg: styles.getPropertyValue('--bg').trim() || '#0a0a0a',
      dark,
      strength: dark ? 1 : 1.55,
      gridAlpha: dark ? 0.085 : 0.17,
    };
  }
  let palette = getColors();

  const TILE = 32;
  const TX = TILE, TY = TILE * 0.5, TILE_H = 14, R = 4;

  function toScreen(gx, gy, ox, oy) {
    return { x: (gx - gy) * TX + ox, y: (gx + gy) * TY + oy };
  }

  // Seeded PRNG (mulberry32)
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  // Dynamic grid — sized to fill the entire canvas
  let COLS = 0, ROWS = 0, map = [], tileOffsets = [];
  let networkNodes = [], networkNodeKeys = new Set(), renderedNodes = [];
  let hoveredNode = null, keyboardNodeIndex = 0;
  let networkState = {
    phase: 'request',
    phaseStarted: performance.now(),
    cycle: 0,
    consumer: null,
    producer: null,
    route: null,
    failedThisCycle: false,
  };

  function generateMap(cols, rows) {
    const m = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const gen = mulberry32(42);

    // Pass 1: scatter cluster seeds (~2.5% density)
    const seeds = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (gen() < 0.025) seeds.push([r, c]);

    // Pass 2: grow clusters from seeds via random walk
    for (const [sr, sc] of seeds) {
      const size = Math.floor(gen() * 6) + 2;
      m[sr][sc] = 1;
      let cr = sr, cc = sc;
      for (let i = 1; i < size; i++) {
        const dirs = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1]];
        const [dr, dc] = dirs[Math.floor(gen() * dirs.length)];
        const nr = cr + dr, nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          m[nr][nc] = 1;
          cr = nr; cc = nc;
        }
      }
    }

    // Pass 3: sprinkle lone islands (~2%)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (m[r][c] === 0 && gen() < 0.02) m[r][c] = 1;

    // Pass 4: add neutral environmental decorations to ~15% of island tiles.
    // Compute markers are reserved for producer Islands so roles stay unambiguous.
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (m[r][c] === 1 && gen() < 0.15) {
          const v = gen();
          m[r][c] = v < 0.68 ? 2 : 3;
        }

    return m;
  }

  let slideAnims = [], lastSlideTime = 0;
  const SLIDE_COUNT = 9;

  function rebuildGrid(w, h) {
    // Diamond must cover all 4 screen corners:
    // COLS + ROWS >= w/TX + h/TY
    const needed = Math.ceil(w / TX + h / TY) + 6;
    const newCols = Math.max(Math.ceil(needed * 0.6), 30);
    const newRows = Math.max(needed - newCols, 20);

    if (newCols === COLS && newRows === ROWS) return;

    COLS = newCols;
    ROWS = newRows;
    map = generateMap(COLS, ROWS);
    tileOffsets = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ dx: 0, dy: 0 }))
    );
    slideAnims = [];
    rebuildNetwork(w, h);
  }

  function rebuildNetwork(w, h) {
    const baseOx = w / 2 - (COLS - ROWS) * TX / 2;
    const baseOy = h / 2 - (COLS + ROWS) * TY / 2;
    const candidates = [];
    for (let r = 2; r < ROWS - 2; r++)
      for (let c = 2; c < COLS - 2; c++)
        if (map[r][c] !== 0 && [[0,1],[1,0],[0,-1],[-1,0]].some(([dr, dc]) => map[r + dr][c + dc] === 0)) {
          const screen = toScreen(c, r, baseOx, baseOy);
          if (screen.x > 28 && screen.x < w - 28 && screen.y > 64 && screen.y < h - 46)
            candidates.push({ r, c, screenX: screen.x, screenY: screen.y });
        }

    const gen = mulberry32(COLS * 97 + ROWS * 193);
    networkNodes = [];
    const targetCount = Math.min(8, Math.max(6, Math.round((COLS + ROWS) / 16)));
    const targets = [
      { x: 0.12, y: 0.52, role: 'consumer' },
      { x: 0.88, y: 0.48, role: 'consumer' },
      { x: 0.14, y: 0.2, role: 'producer' },
      { x: 0.86, y: 0.2, role: 'producer' },
      { x: 0.14, y: 0.78, role: 'producer' },
      { x: 0.86, y: 0.78, role: 'producer' },
      { x: 0.5, y: 0.12, role: 'producer' },
      { x: 0.5, y: 0.86, role: 'producer' },
    ];
    for (const target of targets.slice(0, targetCount)) {
      const available = candidates
        .filter((candidate) => !networkNodes.includes(candidate))
        .filter((candidate) => networkNodes.every((node) =>
          Math.abs(node.r - candidate.r) + Math.abs(node.c - candidate.c) > 5
        ))
        .sort((a, b) => {
          const ax = a.screenX - w * target.x;
          const ay = a.screenY - h * target.y;
          const bx = b.screenX - w * target.x;
          const by = b.screenY - h * target.y;
          return ax * ax + ay * ay - (bx * bx + by * by);
        });
      const candidate = available[0];
      if (!candidate) continue;
      candidate.phase = gen();
      candidate.role = target.role;
      candidate.online = true;
      candidate.recoverAt = 0;
      networkNodes.push(candidate);
      map[candidate.r][candidate.c] = 1;
    }

    networkNodeKeys = new Set(networkNodes.map((node) => node.r + ',' + node.c));
    const firstConsumer = networkNodes.find((node) => node.role === 'consumer') || null;
    networkState = {
      phase: firstConsumer ? 'request' : 'waiting-consumer',
      phaseStarted: performance.now(),
      cycle: 0,
      consumer: firstConsumer,
      producer: null,
      route: null,
      failedThisCycle: false,
    };
  }

  function buildGridRoute(from, to, gen) {
    const startKey = from.r + ',' + from.c;
    const targetKey = to.r + ',' + to.c;
    const queue = [{ c: from.c, r: from.r }];
    const previous = new Map([[startKey, null]]);
    const directions = [[0,1],[1,0],[0,-1],[-1,0]];
    const rotation = Math.floor(gen() * directions.length);

    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      if (current.r === to.r && current.c === to.c) break;
      for (let i = 0; i < directions.length; i++) {
        const [dr, dc] = directions[(i + rotation) % directions.length];
        const r = current.r + dr;
        const c = current.c + dc;
        const key = r + ',' + c;
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS || previous.has(key)) continue;
        if (map[r][c] !== 0 && key !== targetKey) continue;
        previous.set(key, current.r + ',' + current.c);
        queue.push({ c, r });
      }
    }

    if (!previous.has(targetKey)) {
      const fallback = [{ c: from.c, r: from.r }];
      let c = from.c;
      let r = from.r;
      while (c !== to.c || r !== to.r) {
        if (c !== to.c) c += Math.sign(to.c - c);
        else r += Math.sign(to.r - r);
        fallback.push({ c, r });
      }
      return fallback;
    }
    const path = [];
    let key = targetKey;
    while (key) {
      const [r, c] = key.split(',').map(Number);
      path.push({ c, r });
      key = previous.get(key);
    }
    return path.reverse();
  }

  function setNetworkPhase(phase, now) {
    networkState.phase = phase;
    networkState.phaseStarted = now;
    if (networkStatusLabel) {
      const labels = {
        request: 'Consumer requesting inference',
        matching: 'Producer Islands offering compute',
        dispatch: 'Job attributed and dispatched',
        processing: 'Producer running the Cargo',
        failover: 'Producer offline — rerouting',
        response: 'Streaming inference response',
        complete: 'Inference delivered',
        'waiting-producer': 'Waiting for producer capacity',
        'waiting-consumer': 'Click a Consumer Island to start',
      };
      networkStatusLabel.textContent = labels[phase] || 'Network ready';
    }
  }

  function beginRequest(now, preferredConsumer) {
    const consumers = networkNodes.filter((node) => node.role === 'consumer' && node.online);
    if (!consumers.length) {
      networkState.consumer = null;
      networkState.producer = null;
      networkState.route = null;
      setNetworkPhase('waiting-consumer', now);
      return;
    }
    const consumer = preferredConsumer && preferredConsumer.online
      ? preferredConsumer
      : consumers[networkState.cycle % consumers.length];
    networkState.consumer = consumer;
    networkState.producer = null;
    networkState.route = null;
    networkState.failedProducer = null;
    networkState.failedThisCycle = false;
    setNetworkPhase('request', now);
  }

  function assignProducer(now, excludedProducer) {
    if (!networkState.consumer) return false;
    const producers = networkNodes
      .filter((node) => node.role === 'producer' && node.online && node !== excludedProducer)
      .sort((a, b) => {
        const distanceA = Math.abs(a.r - networkState.consumer.r) + Math.abs(a.c - networkState.consumer.c);
        const distanceB = Math.abs(b.r - networkState.consumer.r) + Math.abs(b.c - networkState.consumer.c);
        return distanceA - distanceB;
      });
    if (!producers.length) {
      networkState.producer = null;
      networkState.route = null;
      setNetworkPhase('waiting-producer', now);
      return false;
    }

    const producer = producers[0];
    const routeSeed = networkState.cycle * 313 + producer.r * 17 + producer.c * 31;
    networkState.producer = producer;
    networkState.route = buildGridRoute(networkState.consumer, producer, mulberry32(routeSeed));
    setNetworkPhase('dispatch', now);
    return true;
  }

  function triggerFailover(now, producer, automatic) {
    if (!producer) return;
    producer.online = false;
    producer.recoverAt = automatic ? now + 9000 : 0;
    networkState.failedProducer = producer;
    networkState.failedThisCycle = true;
    setNetworkPhase('failover', now);
  }

  function updateNetworkState(now) {
    networkNodes.forEach((node) => {
      if (!node.online && node.recoverAt && now >= node.recoverAt) {
        node.online = true;
        node.recoverAt = 0;
      }
    });

    if (networkState.consumer && !networkState.consumer.online) {
      networkState.cycle++;
      beginRequest(now);
      return;
    }
    if (networkState.producer && !networkState.producer.online && networkState.phase !== 'failover') {
      triggerFailover(now, networkState.producer, false);
      return;
    }

    const elapsed = now - networkState.phaseStarted;
    switch (networkState.phase) {
      case 'request':
        if (elapsed > 1700) setNetworkPhase('matching', now);
        break;
      case 'matching':
        if (elapsed > 1500) assignProducer(now, null);
        break;
      case 'dispatch':
        if (elapsed > 2400) setNetworkPhase('processing', now);
        break;
      case 'processing':
        if (elapsed > 1900) {
          if (!networkState.failedThisCycle && networkState.cycle % 3 === 0) {
            triggerFailover(now, networkState.producer, true);
          } else {
            setNetworkPhase('response', now);
          }
        }
        break;
      case 'failover':
        if (elapsed > 1500) assignProducer(now, networkState.failedProducer);
        break;
      case 'response':
        if (elapsed > 2900) setNetworkPhase('complete', now);
        break;
      case 'complete':
        if (elapsed > 1300) {
          networkState.cycle++;
          beginRequest(now);
        }
        break;
      case 'waiting-producer':
        if (networkNodes.some((node) => node.role === 'producer' && node.online))
          setNetworkPhase('matching', now);
        break;
      case 'waiting-consumer':
        if (networkNodes.some((node) => node.role === 'consumer' && node.online))
          beginRequest(now);
        break;
    }
  }

  const SLIDE_INTERVAL = 4200, SLIDE_DURATION = 1100;

  const rng = mulberry32(77);

  function pickSlide(now) {
    if (slideAnims.length > 0 || now - lastSlideTime < SLIDE_INTERVAL) return;
    // Collect all movable tiles
    const candidates = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === 0) continue;
        if (networkNodeKeys.has(r + ',' + c)) continue;
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && map[nr][nc] === 0 &&
              !networkNodeKeys.has(nr + ',' + nc))
            candidates.push({ r, c, dr, dc });
        });
      }
    if (!candidates.length) return;
    // Pick multiple non-conflicting slides
    const claimed = new Set();
    for (let i = 0; i < SLIDE_COUNT && candidates.length > 0; i++) {
      const idx = Math.floor(rng() * candidates.length);
      const pick = candidates[idx];
      const srcKey = pick.r + ',' + pick.c;
      const dstKey = (pick.r + pick.dr) + ',' + (pick.c + pick.dc);
      if (claimed.has(srcKey) || claimed.has(dstKey)) {
        candidates.splice(idx, 1);
        i--;
        continue;
      }
      claimed.add(srcKey);
      claimed.add(dstKey);
      slideAnims.push({ ...pick, progress: 0, startTime: now });
      candidates.splice(idx, 1);
    }
    lastSlideTime = now;
  }

  function updateSlide(now) {
    for (let i = slideAnims.length - 1; i >= 0; i--) {
      const anim = slideAnims[i];
      const elapsed = now - anim.startTime;
      anim.progress = Math.min(1, elapsed / SLIDE_DURATION);
      const t = anim.progress;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const { r, c, dr, dc } = anim;
      tileOffsets[r][c] = { dx: dc * eased, dy: dr * eased };
      if (anim.progress >= 1) {
        tileOffsets[r][c] = { dx: 0, dy: 0 };
        map[r + dr][c + dc] = map[r][c];
        map[r][c] = 0;
        slideAnims.splice(i, 1);
      }
    }
  }

  function drawRoundedIsoDiamond(cx, cy, w, h, r) {
    const top = { x: cx, y: cy - h }, right = { x: cx + w, y: cy };
    const bottom = { x: cx, y: cy + h }, left = { x: cx - w, y: cy };
    ctx.beginPath();
    ctx.moveTo(top.x + r*0.7, top.y + r*0.35);
    ctx.lineTo(right.x - r*0.7, right.y - r*0.35);
    ctx.quadraticCurveTo(right.x, right.y, right.x - r*0.7, right.y + r*0.35);
    ctx.lineTo(bottom.x + r*0.7, bottom.y - r*0.35);
    ctx.quadraticCurveTo(bottom.x, bottom.y, bottom.x - r*0.7, bottom.y - r*0.35);
    ctx.lineTo(left.x + r*0.7, left.y + r*0.35);
    ctx.quadraticCurveTo(left.x, left.y, left.x + r*0.7, left.y - r*0.35);
    ctx.lineTo(top.x - r*0.7, top.y + r*0.35);
    ctx.quadraticCurveTo(top.x, top.y, top.x + r*0.7, top.y + r*0.35);
    ctx.closePath();
  }

  function drawCuboidSides(cx, cy, color, alpha, bg) {
    const w = TX - 2, h = TY - 1, d = TILE_H;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy); ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx - w, cy + d);
    ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.3})`;
    ctx.lineWidth = 0.8; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + w, cy); ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx + w, cy + d);
    ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.25})`;
    ctx.lineWidth = 0.8; ctx.stroke();
  }

  function drawCuboidTop(cx, cy, color, alpha, bg) {
    const w = TX - 2, h = TY - 1;
    drawRoundedIsoDiamond(cx, cy, w, h, R);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.4})`;
    ctx.lineWidth = 1; ctx.stroke();
  }

  // Pre-built sprite paths from SVGs
  const palmPath = new Path2D('m42.079 17.179l-2.005-3.601l4.701.215l-2.209-3.348l4.297.074l-2.328-2.965L49 7.93l-2.479-3.08l3.826-1.102c-11.779-6.61-17.98 6.786-18.672 19.198C28.091 10.376 17.52-2.529 6.886 8.725l4.148-.289l-1.636 3.863l4.378-1.949l-1.516 3.697l4.295-1.598l-.895 2.788C9.724 13.338 4.284 14.757 2 22.525l3.554-1.906l.322 4.199l2.999-3.521l.351 3.996l3.087-3.164l.702 4.211l3.281-3.566l1.102 4.574l2.96-3.098l.717 2.688c-8.249 1.297-14.342 5.75-9.069 14.255l.745-3.238l2.926 2.416l-.623-3.914l2.813 2.273l-.342-3.746l3.15 2.203l-.495-4.107l3.609 2.199l-.365-3.631l1.06.614c.396 1.249 1.197 2.28 2.302 2.904c.317.18.658.315 1.009.421L32.587 62h1.524l-.173-.952l6.464-1.2l-6.895-1.172l-.774-4.27l6.363-1.184l-6.787-1.149l-.795-4.381l5.876-1.093l-6.267-1.063l-.82-4.52l5.592-1.04l-5.964-1.012l-.574-3.162a5.6 5.6 0 0 0 2.285-.544c.39.406.823.752 1.303 1.002l-2.167.403l6.037 1.025l1.399 4.647l-5.114.952l5.691.964l1.413 4.695l-5.184.964l5.769.979l1.394 4.63l-5.456 1.015l6.072 1.03L44.135 62h1.566l-7.893-26.22a4 4 0 0 0 1.311-2.658a4.5 4.5 0 0 0-.136-1.443l2.149-1.351l-.525 3.439l3.402-2.232l-.666 3.898l2.982-2.219l-.506 3.547l2.68-2.268l-.771 3.719l2.789-2.406l.51 3.02c5.41-8.526-.439-12.442-8.263-13.12l.876-3.028l2.959 2.859l1.104-4.223l3.281 3.291l.701-3.885l3.086 2.92l.354-3.688l2.996 3.248l.322-3.875L62 21.086c-3.08-9.662-11.884-8.695-19.921-3.907m-22.69-.363a25 25 0 0 0-2.315-1.07l2.853-1.148zm3.314 1.999q-.572-.39-1.146-.751l1.426-.545zm.729 7.842l.676-.687l.26.618a40 40 0 0 0-.936.069m16.727-1.041c-.15-.273-.33-.53-.531-.774l.263-.576l1.444 1.354c-.388-.014-.783-.005-1.176-.004m-1.118-6.421l-.977-1.863l3.602.097a39 39 0 0 0-2.625 1.766');
  const hutPath = new Path2D('M29 18.976c.53-.099.93-.563.93-1.121c0-.16-.03-.31-.06-.45a2 2 0 0 1-.098-.163l-.032-.057q-.365-.585-.74-1.163V16h-.015a62 62 0 0 0-1.735-2.525c-2.58-3.59-5.48-6.69-8.66-9.52c-1.43-1.27-3.58-1.27-5.03-.02c-3.3 2.84-6.17 5.91-8.82 9.54c-.87 1.18-1.7 2.4-2.48 3.66l-.034.047c-.042.058-.087.12-.126.183c0 .02-.01.03-.02.04c-.05.14-.08.29-.08.45c0 .59.429 1.065 1 1.132V31h26zM26.143 18c.36.056.622.173.857.307V29h-6.011v-3.78c0-1.89-1.706-3.22-3.538-3.22h-2.914C12.723 22 11 23.314 11 25.22V29H5V18.33c.244-.144.514-.271.89-.33h.956c.5.079.811.279 1.123.479c.402.258.805.516 1.611.516c.799 0 1.199-.257 1.6-.514c.313-.2.626-.402 1.13-.481h.956c.5.079.812.279 1.123.479c.402.258.805.516 1.611.516s1.207-.258 1.61-.515c.314-.2.627-.401 1.13-.48h.96c.503.079.817.28 1.13.48c.403.258.805.515 1.61.515s1.207-.258 1.61-.515c.313-.2.627-.401 1.13-.48z');

  function drawSprite(cx, cy, path, color, alpha, scale, vb, bg) {
    ctx.save();
    ctx.translate(cx - (vb / 2) * scale, cy - vb * scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = bg;
    ctx.fill(path, 'evenodd');
    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.35})`;
    ctx.lineWidth = 1.5 / scale;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke(path);
    ctx.restore();
  }

  function drawPalmTree(cx, cy, color, alpha, bg) {
    drawSprite(cx, cy, palmPath, color, alpha, 0.42, 64, bg);
  }

  function drawMountain(cx, cy, color, alpha, bg) {
    drawSprite(cx, cy, hutPath, color, alpha, 0.75, 32, bg);
  }

  const parasolPath = new Path2D('m259.431 268.8l140-140l-27.785-27.785A208.333 208.333 0 0 0 77.019 395.646l27.781 27.785l132-132L401.372 456h45.256ZM224.333 72a175.18 175.18 0 0 1 124.686 51.646l5.157 5.158l-57.058 57.058a477.7 477.7 0 0 0-62.879-53.924c-25.216-17.838-49.439-30.329-71.994-37.131a153 153 0 0 0-17.092-4.129A175.6 175.6 0 0 1 224.333 72M104.8 378.176l-5.158-5.157a176.64 176.64 0 0 1-32.964-203.866a153 153 0 0 0 4.129 17.092c6.8 22.556 19.3 46.778 37.131 71.994a477.7 477.7 0 0 0 53.924 62.879Zm79.7-79.7c-11.857-11.634-32.231-32.977-50.438-58.718c-22.872-32.336-46.59-77.9-33.753-115.45c37.421-12.793 82.8 10.736 115.005 33.437c25.864 18.233 47.431 38.815 59.158 50.759Z');

  function drawComputeNode(cx, cy, color, alpha, time, bg) {
    drawSprite(cx, cy, parasolPath, color, alpha, 0.052, 512, bg);
  }

  // Purpose-built isometric markers — deliberately simpler than the old icon silhouettes.
  function drawTreeMarker(cx, cy, color, alpha, bg) {
    const stroke = Math.min(0.9, alpha * 0.46);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = `rgba(${color}, ${alpha * 0.08})`;
    ctx.beginPath(); ctx.ellipse(cx, cy - 1, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = bg;
    ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(cx, cy - 2); ctx.quadraticCurveTo(cx - 2, cy - 13, cx + 1, cy - 21); ctx.stroke();
    ctx.strokeStyle = `rgba(${color}, ${stroke})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const crownY = cy - 21;
    [[-12,-5],[-8,-10],[0,-12],[9,-9],[13,-3]].forEach(([dx, dy], index) => {
      ctx.beginPath();
      ctx.moveTo(cx + 1, crownY);
      ctx.quadraticCurveTo(cx + dx * 0.45, crownY + dy * 0.22, cx + dx, crownY + dy);
      ctx.strokeStyle = `rgba(${color}, ${Math.min(0.95, stroke + (index === 2 ? 0.16 : 0))})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });
    ctx.fillStyle = `rgba(${color}, ${Math.min(1, alpha * 0.72)})`;
    ctx.beginPath(); ctx.arc(cx + 1, crownY, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawDepotMarker(cx, cy, color, alpha, bg) {
    const stroke = `rgba(${color}, ${Math.min(0.9, alpha * 0.48)})`;
    ctx.save();
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 11); ctx.lineTo(cx, cy - 5); ctx.lineTo(cx, cy + 1); ctx.lineTo(cx - 11, cy - 5);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 11, cy - 11); ctx.lineTo(cx, cy - 5); ctx.lineTo(cx, cy + 1); ctx.lineTo(cx + 11, cy - 5);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy - 23); ctx.lineTo(cx - 13, cy - 12); ctx.lineTo(cx, cy - 5); ctx.closePath();
    ctx.fillStyle = `rgba(${color}, ${alpha * 0.09})`; ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 23); ctx.lineTo(cx + 13, cy - 12); ctx.lineTo(cx, cy - 5); ctx.closePath();
    ctx.fillStyle = `rgba(${color}, ${alpha * 0.14})`; ctx.fill(); ctx.stroke();

    ctx.strokeStyle = `rgba(${color}, ${Math.min(1, alpha * 0.68)})`;
    ctx.strokeRect(cx + 3, cy - 8, 4, 6);
    ctx.restore();
  }

  function drawComputeMarker(cx, cy, color, alpha, time, bg) {
    const w = 8, h = 4, d = 14;
    const topY = cy - 14;
    const stroke = `rgba(${color}, ${Math.min(1, alpha * 0.62)})`;
    ctx.save();
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - w, topY); ctx.lineTo(cx, topY + h); ctx.lineTo(cx, topY + h + d); ctx.lineTo(cx - w, topY + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + w, topY); ctx.lineTo(cx, topY + h); ctx.lineTo(cx, topY + h + d); ctx.lineTo(cx + w, topY + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.stroke();
    drawRoundedIsoDiamond(cx, topY, w, h, 1.5);
    ctx.fillStyle = `rgba(${color}, ${alpha * 0.16})`; ctx.fill(); ctx.stroke();

    const blink = reduceMotion ? 0.8 : 0.58 + Math.sin(time * 2.4) * 0.25;
    ctx.fillStyle = `rgba(${color}, ${Math.min(1, alpha * blink)})`;
    [-4, 0, 4].forEach((offset) => {
      ctx.beginPath(); ctx.arc(cx + offset, topY + h + 8, 1, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = `rgba(${color}, ${Math.min(0.9, alpha * 0.44)})`;
    ctx.beginPath(); ctx.moveTo(cx, topY - 1); ctx.lineTo(cx, topY - 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, topY - 10, 2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawProducerMarker(cx, cy, colors, alpha, time, active) {
    const tone = colors.yellow;
    drawComputeMarker(cx, cy, tone, alpha, time, colors.bg);
    const brainY = cy - 38;
    const nodes = [[-7,1],[-4,-6],[2,-8],[8,-3],[7,5],[0,7],[-6,6]];
    const links = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,5],[2,4]];
    const pulse = reduceMotion ? 0.75 : 0.62 + Math.sin(time * 2.2) * 0.18;
    ctx.save();
    ctx.strokeStyle = `rgba(${tone}, ${Math.min(0.72, alpha * (active ? 0.48 : 0.28))})`;
    ctx.lineWidth = 0.8;
    links.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(cx + nodes[a][0], brainY + nodes[a][1]);
      ctx.lineTo(cx + nodes[b][0], brainY + nodes[b][1]);
      ctx.stroke();
    });
    nodes.forEach(([x, y], index) => {
      ctx.fillStyle = `rgba(${tone}, ${Math.min(1, alpha * (active && index % 2 === 0 ? pulse : 0.58))})`;
      ctx.beginPath(); ctx.arc(cx + x, brainY + y, active ? 1.7 : 1.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = `rgba(${tone}, ${Math.min(0.8, alpha * 0.44)})`;
    ctx.beginPath(); ctx.ellipse(cx, brainY, 12, 10, 0, 0, Math.PI * 2); ctx.stroke();
    if (active) {
      for (let i = 0; i < 3; i++) {
        const angle = time * (0.8 + i * 0.12) + i * Math.PI * 0.66;
        ctx.fillStyle = `rgba(${tone}, ${0.5 + i * 0.12})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * 15, brainY + Math.sin(angle) * 7, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawConsumerMarker(cx, cy, colors, alpha, time, active) {
    const tone = colors.pink;
    const bob = reduceMotion || !active ? 0 : Math.sin(time * 1.8) * 0.8;
    const top = cy - 29 + bob;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.fillStyle = `rgba(${tone}, ${alpha * 0.08})`;
    ctx.beginPath(); ctx.ellipse(cx, cy - 1, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 12, top); ctx.lineTo(cx + 12, top + 2); ctx.lineTo(cx + 10, top + 16); ctx.lineTo(cx - 10, top + 14);
    ctx.closePath();
    ctx.fillStyle = colors.bg; ctx.fill();
    ctx.strokeStyle = `rgba(${tone}, ${Math.min(1, alpha * (active ? 0.82 : 0.54))})`;
    ctx.lineWidth = 1.2; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(cx - 7, top + 6); ctx.lineTo(cx - 3, top + 9); ctx.lineTo(cx - 7, top + 12);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, top + 12); ctx.lineTo(cx + 6, top + 12.5); ctx.stroke();
    if (active && (reduceMotion || Math.sin(time * 4) > -0.15)) {
      ctx.fillStyle = `rgba(${tone}, ${Math.min(1, alpha * 0.86)})`;
      ctx.fillRect(cx + 6.5, top + 10, 1.4, 3.6);
    }
    ctx.beginPath(); ctx.moveTo(cx, top + 16); ctx.lineTo(cx - 3, cy - 5); ctx.lineTo(cx + 5, cy - 4); ctx.stroke();
    drawRoundedIsoDiamond(cx + 1, cy - 2, 9, 4, 1.5);
    ctx.fillStyle = colors.bg; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function panelPath(x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawProducerRoleIcon(cx, cy, colors, alpha, time, active) {
    const tone = colors.yellow;
    const x = cx - 12;
    const y = cy - 35;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, y + 10, 0, cx, y + 10, active ? 25 : 18);
    glow.addColorStop(0, `rgba(${tone}, ${active ? 0.2 : 0.08})`);
    glow.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, y + 10, active ? 25 : 18, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = `rgba(${tone}, ${Math.min(1, alpha * 0.72)})`;
    ctx.lineWidth = 1.1;
    [-7, 0, 7].forEach((offset) => {
      ctx.beginPath(); ctx.moveTo(cx + offset, y - 3); ctx.lineTo(cx + offset, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + offset, y + 20); ctx.lineTo(cx + offset, y + 23); ctx.stroke();
    });
    [-5, 5].forEach((offset) => {
      ctx.beginPath(); ctx.moveTo(x - 3, y + 10 + offset); ctx.lineTo(x, y + 10 + offset); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 24, y + 10 + offset); ctx.lineTo(x + 27, y + 10 + offset); ctx.stroke();
    });

    panelPath(x, y, 24, 20, 5);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.96)'; ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `rgba(${tone}, ${Math.min(1, alpha * 0.95)})`;
    ctx.font = '700 9px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AI', cx, y + 10.5);
    if (active && !reduceMotion) {
      const scanY = y + 4 + ((time * 8) % 12);
      ctx.strokeStyle = `rgba(${tone}, 0.28)`;
      ctx.beginPath(); ctx.moveTo(x + 4, scanY); ctx.lineTo(x + 20, scanY); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx, y + 20); ctx.lineTo(cx, cy - 4); ctx.stroke();
    drawRoundedIsoDiamond(cx, cy - 2, 8, 3.5, 1.5);
    ctx.fillStyle = colors.bg; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawConsumerRoleIcon(cx, cy, colors, alpha, time, active) {
    const tone = colors.pink;
    const x = cx - 13;
    const y = cy - 33;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, y + 9, 0, cx, y + 9, active ? 24 : 17);
    glow.addColorStop(0, `rgba(${tone}, ${active ? 0.18 : 0.07})`);
    glow.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, y + 9, active ? 24 : 17, 0, Math.PI * 2); ctx.fill();

    panelPath(x, y, 26, 18, 4);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.96)'; ctx.fill();
    ctx.strokeStyle = `rgba(${tone}, ${Math.min(1, alpha * 0.8)})`;
    ctx.lineWidth = 1.1; ctx.stroke();
    ctx.fillStyle = `rgba(${tone}, ${Math.min(1, alpha * 0.94)})`;
    ctx.font = '700 9px IBM Plex Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const cursor = active && !reduceMotion && Math.sin(time * 4.5) < 0 ? ' ' : '_';
    ctx.fillText('>' + cursor, cx, y + 9.5);
    ctx.strokeStyle = `rgba(${tone}, ${Math.min(1, alpha * 0.68)})`;
    ctx.beginPath(); ctx.moveTo(cx, y + 18); ctx.lineTo(cx, cy - 4); ctx.stroke();
    drawRoundedIsoDiamond(cx, cy - 2, 9, 3.5, 1.5);
    ctx.fillStyle = colors.bg; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function roundedRectPath(x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + w / 2 + 3, y + h);
    ctx.lineTo(x + w / 2, y + h + 4);
    ctx.lineTo(x + w / 2 - 3, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawStatusBubble(cx, cy, symbol, tone, colors, time, phase) {
    const bob = reduceMotion ? 0 : Math.sin(time * 2.1 + phase * 5) * 2;
    const x = cx - 12;
    const y = cy - 61 + bob;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, y + 10, 0, cx, y + 10, 22);
    glow.addColorStop(0, `rgba(${tone}, ${colors.dark ? 0.2 : 0.12})`);
    glow.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, y + 10, 22, 0, Math.PI * 2); ctx.fill();
    roundedRectPath(x, y, 24, 20, 6);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.96)';
    ctx.fill();
    ctx.strokeStyle = `rgba(${tone}, 0.82)`; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = `rgba(${tone}, 0.96)`;
    ctx.font = '700 12px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(symbol, cx, y + 9.5);
    ctx.restore();
  }

  function drawRoleTile(cx, cy, tone, alpha) {
    drawRoundedIsoDiamond(cx, cy, TX - 3, TY - 2, R);
    ctx.fillStyle = `rgba(${tone}, ${alpha})`;
    ctx.fill();
  }

  function drawNodeSelection(cx, cy, tone, time) {
    const pulse = reduceMotion ? 0 : (Math.sin(time * 3) + 1) * 1.5;
    ctx.save();
    ctx.strokeStyle = `rgba(${tone}, 0.72)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy + 5, TX - 2 + pulse, TY + pulse * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  const WATER_LEVEL = 0.35;

  function drawWater(w, h, time, color, ox, floorOy, baseAlpha) {
    const waterSurfaceBase = floorOy - TILE_H * WATER_LEVEL;
    const pad = Math.ceil(Math.max(w, h) / TILE) + 5;
    const gridMin = -pad;
    const gridMax = Math.max(ROWS, COLS) + pad;

    ctx.lineWidth = 0.5;
    // Row lines
    for (let r = gridMin; r <= gridMax; r++) {
      const shimmer = baseAlpha + (Math.sin(time * 0.55 + r * 0.32) + 1) * 0.018;
      ctx.strokeStyle = `rgba(${color}, ${shimmer})`;
      const a = toScreen(r, gridMin, ox, waterSurfaceBase);
      const b = toScreen(r, gridMax, ox, waterSurfaceBase);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // Column lines
    for (let c = gridMin; c <= gridMax; c++) {
      const shimmer = baseAlpha * 0.94 + (Math.cos(time * 0.5 + c * 0.29) + 1) * 0.018;
      ctx.strokeStyle = `rgba(${color}, ${shimmer})`;
      const a = toScreen(gridMin, c, ox, waterSurfaceBase);
      const b = toScreen(gridMax, c, ox, waterSurfaceBase);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }

  function pointOnGridRoute(path, progress, ox, oy) {
    const segmentCount = Math.max(1, path.length - 1);
    const scaled = Math.min(segmentCount - 0.0001, progress * segmentCount);
    const index = Math.floor(scaled);
    const local = scaled - index;
    const a = toScreen(path[index].c, path[index].r, ox, oy);
    const b = toScreen(path[Math.min(index + 1, path.length - 1)].c,
      path[Math.min(index + 1, path.length - 1)].r, ox, oy);
    return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
  }

  function drawCargo(cx, cy, color, bg, strength) {
    const w = 7;
    const h = 4;
    const d = 7;
    cy -= 5;
    ctx.save();
    ctx.fillStyle = `rgba(${color}, ${0.12 * strength})`;
    ctx.beginPath(); ctx.ellipse(cx, cy + d + 8, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - w, cy); ctx.lineTo(cx, cy + h); ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx - w, cy + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = `rgba(${color}, ${Math.min(1, 0.72 * strength)})`; ctx.lineWidth = 1; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + w, cy); ctx.lineTo(cx, cy + h); ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx + w, cy + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.stroke();

    drawRoundedIsoDiamond(cx, cy, w, h, 1.5);
    ctx.fillStyle = `rgba(${color}, ${0.18 * strength})`; ctx.fill();
    ctx.strokeStyle = `rgba(${color}, ${Math.min(1, 0.9 * strength)})`; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - h); ctx.lineTo(cx, cy + h); ctx.stroke();
    ctx.fillStyle = `rgba(${color}, ${Math.min(1, 0.92 * strength)})`;
    ctx.font = '700 6px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', cx, cy - 0.5);
    ctx.restore();
  }

  function drawDemandToken(cx, cy, colors, time) {
    const tone = colors.pink;
    const bob = reduceMotion ? 0 : Math.sin(time * 5) * 1.2;
    const x = cx - 9;
    const y = cy - 18 + bob;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, y + 9, 0, cx, y + 9, 17);
    glow.addColorStop(0, `rgba(${tone}, ${colors.dark ? 0.42 : 0.26})`);
    glow.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, y + 9, 17, 0, Math.PI * 2); ctx.fill();
    panelPath(x, y, 18, 18, 6);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.96)' : 'rgba(255,255,255,0.97)'; ctx.fill();
    ctx.strokeStyle = `rgba(${tone}, 0.94)`; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = `rgba(${tone}, 1)`;
    ctx.font = '700 11px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', cx, y + 8.5);
    ctx.restore();
  }

  function drawInferenceToken(cx, cy, glyph, color, colors, visibility, scale) {
    const width = 12 * scale;
    const height = 10 * scale;
    const x = cx - width / 2;
    const y = cy - 10 - height / 2;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, y + height / 2, 0, cx, y + height / 2, 12 * scale);
    glow.addColorStop(0, `rgba(${color}, ${(colors.dark ? 0.45 : 0.28) * visibility})`);
    glow.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, y + height / 2, 12 * scale, 0, Math.PI * 2); ctx.fill();

    panelPath(x, y, width, height, 3 * scale);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.96)' : 'rgba(255,255,255,0.97)';
    ctx.globalAlpha = visibility;
    ctx.fill();
    ctx.strokeStyle = `rgba(${color}, 0.94)`;
    ctx.lineWidth = Math.max(0.7, scale);
    ctx.stroke();
    ctx.fillStyle = `rgba(${color}, 1)`;
    ctx.font = `700 ${Math.max(4.5, 5.5 * scale)}px IBM Plex Mono, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(glyph, cx, y + height / 2 + 0.3);
    ctx.restore();
  }

  function drawDataPackets(path, progress, ox, routeOy, color, colors) {
    const glyphs = ['A', '01', '<>', 'AI'];
    for (let i = 0; i < 4; i++) {
      const packetProgress = progress - i * 0.16;
      if (packetProgress <= 0 || packetProgress >= 1) continue;
      const point = pointOnGridRoute(path, 1 - packetProgress, ox, routeOy);
      const fadeIn = Math.min(1, packetProgress / 0.08);
      const fadeOut = Math.min(1, (1 - packetProgress) / 0.12);
      const visibility = Math.min(fadeIn, fadeOut);
      drawInferenceToken(point.x, point.y, glyphs[i], color, colors, visibility, 1 - i * 0.045);
    }
  }

  function drawNetwork(time, now, colors, ox, routeOy) {
    updateNetworkState(now);
    const path = networkState.route;
    if (!path || path.length < 2) return;

    const phase = networkState.phase;
    const failed = phase === 'failover';
    const tone = failed ? colors.pink : colors.wire;
    const routeFade = failed
      ? Math.max(0.12, 1 - (now - networkState.phaseStarted) / 1500)
      : 1;

    ctx.save();
    path.forEach((cell, index) => {
      if (index === 0 || index === path.length - 1) return;
      const point = toScreen(cell.c, cell.r, ox, routeOy);
      const wave = reduceMotion ? 0.7 : 0.55 + Math.sin(time * 3.1 - index * 0.58) * 0.25;
      drawRoundedIsoDiamond(point.x, point.y, TX - 4, TY - 2, 3);
      ctx.fillStyle = `rgba(${tone}, ${(colors.dark ? 0.075 : 0.13) * wave * routeFade})`;
      ctx.fill();
    });

    if (phase === 'dispatch') {
      const progress = reduceMotion ? 0.56 : Math.min(1, (now - networkState.phaseStarted) / 2400);
      const packet = pointOnGridRoute(path, progress, ox, routeOy);
      const glow = ctx.createRadialGradient(packet.x, packet.y, 0, packet.x, packet.y, 16);
      glow.addColorStop(0, `rgba(${colors.pink}, ${colors.dark ? 0.42 : 0.28})`);
      glow.addColorStop(1, `rgba(${colors.pink}, 0)`);
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(packet.x, packet.y, 16, 0, Math.PI * 2); ctx.fill();
      drawDemandToken(packet.x, packet.y, colors, time);
    }

    if (phase === 'response') {
      const progress = reduceMotion ? 0.58 : ((now - networkState.phaseStarted) / 2900) * 1.48;
      drawDataPackets(path, progress, ox, routeOy, colors.yellow, colors);
    }
    ctx.restore();
  }

  function drawNodeBeacon(cx, cy, color, time, phase, strength) {
    const pulse = reduceMotion ? 0.45 : (time * 0.34 + phase) % 1;
    ctx.save();
    ctx.strokeStyle = `rgba(${color}, ${Math.min(1, 0.32 * (1 - pulse) * strength)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy + TY * 0.35, TX * (0.45 + pulse * 0.45), TY * (0.32 + pulse * 0.32), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(${color}, ${Math.min(1, 0.72 * strength)})`;
    ctx.beginPath(); ctx.arc(cx, cy - TILE_H * 1.85, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  let startTime = performance.now();
  let isVisible = true;
  let lastFrameTime = 0;
  const FRAME_INTERVAL = 1000 / 30; // cap at 30fps
  const pointer = { targetX: 0, targetY: 0, x: 0, y: 0, active: false, px: 0, py: 0 };

  section.addEventListener('pointermove', (event) => {
    const rect = section.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    pointer.targetX = x / rect.width * 2 - 1;
    pointer.targetY = y / rect.height * 2 - 1;
    pointer.px = x;
    pointer.py = y;
    pointer.active = true;
    section.style.setProperty('--hero-pointer-x', (x / rect.width * 100).toFixed(1) + '%');
    section.style.setProperty('--hero-pointer-y', (y / rect.height * 100).toFixed(1) + '%');
  }, { passive: true });

  section.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    pointer.active = false;
    section.style.setProperty('--hero-pointer-x', '50%');
    section.style.setProperty('--hero-pointer-y', '50%');
  });

  function renderedNodeAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let closest = null;
    let closestDistance = 34;
    renderedNodes.forEach((item) => {
      const distance = Math.hypot(x - item.x, y - (item.y - 18));
      if (distance < closestDistance) {
        closest = item.node;
        closestDistance = distance;
      }
    });
    return closest;
  }

  function toggleNetworkNode(node, now) {
    if (!node) return;
    if (node.role === 'producer') {
      if (node.online) {
        if (node === networkState.producer) triggerFailover(now, node, false);
        else {
          node.online = false;
          node.recoverAt = 0;
        }
      } else {
        node.online = true;
        node.recoverAt = 0;
        if (networkState.phase === 'waiting-producer') setNetworkPhase('matching', now);
      }
      if (reduceMotion) requestAnimationFrame(draw);
      return;
    }

    if (node === networkState.consumer && node.online) {
      node.online = false;
      networkState.cycle++;
      beginRequest(now);
    } else {
      node.online = true;
      beginRequest(now, node);
    }
    if (reduceMotion) requestAnimationFrame(draw);
  }

  canvas.addEventListener('pointermove', (event) => {
    hoveredNode = renderedNodeAt(event.clientX, event.clientY);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => {
    hoveredNode = null;
    canvas.style.cursor = 'default';
  });
  canvas.addEventListener('click', (event) => {
    const node = renderedNodeAt(event.clientX, event.clientY);
    if (node) toggleNetworkNode(node, performance.now());
  });
  canvas.addEventListener('keydown', (event) => {
    if (!networkNodes.length) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      keyboardNodeIndex = (keyboardNodeIndex + 1) % networkNodes.length;
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      keyboardNodeIndex = (keyboardNodeIndex - 1 + networkNodes.length) % networkNodes.length;
      event.preventDefault();
    } else if (event.key === 'Enter' || event.key === ' ') {
      toggleNetworkNode(networkNodes[keyboardNodeIndex], performance.now());
      event.preventDefault();
    }
  });

  // Pause animation when hero is off-screen
  const visObs = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) requestAnimationFrame(draw);
  }, { threshold: 0 });
  visObs.observe(canvas.parentElement);

  function draw(timestamp) {
    if (!isVisible) return;

    // Throttle to ~30fps
    if (timestamp - lastFrameTime < FRAME_INTERVAL) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrameTime = timestamp;

    const now = performance.now();
    const time = reduceMotion ? 0 : (now - startTime) / 1000;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const colors = palette;
    const teal = colors.wire;
    const bg = colors.bg;
    pointer.x += (pointer.targetX - pointer.x) * 0.055;
    pointer.y += (pointer.targetY - pointer.y) * 0.055;
    const ox = w / 2 - (COLS - ROWS) * TX / 2 + pointer.x * 10;
    const oy = h / 2 - (COLS + ROWS) * TY / 2 + pointer.y * 6;
    const floorOy = oy + (TY - 1) + TILE_H;
    const routeOy = floorOy - TILE_H * WATER_LEVEL;

    if (!reduceMotion) {
      pickSlide(now);
      updateSlide(now);
    }

    // Pass 1: cuboid sides
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === 0) continue;
        const off = tileOffsets[r][c];
        const pos = toScreen(c + off.dx, r + off.dy, ox, oy);
        if (pos.x < -TX * 2 || pos.x > w + TX * 2 || pos.y < -TY * 2 - TILE_H || pos.y > h + TY * 2 + TILE_H) continue;
        const depthAlpha = Math.max(0.42, Math.min(1, 0.48 + pos.y / Math.max(h, 1) * 0.52));
        drawCuboidSides(pos.x, pos.y, teal, depthAlpha * colors.strength, bg);
      }

    // Water surface
    drawWater(w, h, time, teal, ox, floorOy, colors.gridAlpha);
    drawNetwork(time, now, colors, ox, routeOy);

    // Pass 2: cuboid tops + decorations
    renderedNodes = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === 0) continue;
        const off = tileOffsets[r][c];
        const pos = toScreen(c + off.dx, r + off.dy, ox, oy);
        if (pos.x < -TX * 2 || pos.x > w + TX * 2 || pos.y < -TY * 2 - TILE_H || pos.y > h + TY * 2 + TILE_H) continue;
        const key = r + ',' + c;
        const isNetworkNode = networkNodeKeys.has(key);
        const pointerDistance = pointer.active ? Math.hypot(pointer.px - pos.x, pointer.py - pos.y) : Infinity;
        const proximity = Math.max(0, 1 - pointerDistance / 150);
        const depthAlpha = Math.max(0.48, Math.min(1, 0.52 + pos.y / Math.max(h, 1) * 0.48));
        const alpha = Math.min(1, depthAlpha + proximity * 0.28);
        drawCuboidTop(pos.x, pos.y, teal, alpha * colors.strength, bg);
        if (proximity > 0) {
          ctx.fillStyle = `rgba(${teal}, ${proximity * 0.06})`;
          drawRoundedIsoDiamond(pos.x, pos.y, TX - 3, TY - 2, R);
          ctx.fill();
        }
        if (isNetworkNode) {
          const node = networkNodes.find((item) => item.r === r && item.c === c);
          if (node) {
            const tone = node.role === 'consumer' ? colors.pink : colors.yellow;
            const roleActive = node.role === 'consumer'
              ? node === networkState.consumer
              : node === networkState.producer || networkState.phase === 'matching' || networkState.phase === 'failover';
            const markerAlpha = alpha * colors.strength * (node.online ? 1 : 0.28);
            drawRoleTile(pos.x, pos.y, tone, node.online ? (roleActive ? 0.13 : 0.055) : 0.025);
            if (node.role === 'consumer')
              drawConsumerRoleIcon(pos.x, pos.y, colors, markerAlpha, time, roleActive);
            else
              drawProducerRoleIcon(pos.x, pos.y, colors, markerAlpha, time, roleActive && node.online);
            renderedNodes.push({ node, x: pos.x, y: pos.y });
          }
        } else {
          if (map[r][c] === 2) drawTreeMarker(pos.x, pos.y, teal, alpha * colors.strength, bg);
          if (map[r][c] === 3) drawDepotMarker(pos.x, pos.y, teal, alpha * colors.strength, bg);
        }
      }

    const keyboardNode = document.activeElement === canvas ? networkNodes[keyboardNodeIndex] : null;
    const selectedNode = hoveredNode || keyboardNode;
    renderedNodes.forEach((item) => {
      const node = item.node;
      const tone = node.role === 'consumer' ? colors.pink : colors.yellow;
      if (node === selectedNode) drawNodeSelection(item.x, item.y, tone, time);

      let symbol = null;
      let bubbleTone = tone;
      if (!node.online) {
        symbol = '×';
        bubbleTone = colors.pink;
      } else if (node.role === 'consumer' && node === networkState.consumer) {
        symbol = networkState.phase === 'complete' ? '✓' : '?';
      } else if (node.role === 'producer') {
        const isCandidate = networkState.phase === 'matching' || networkState.phase === 'failover';
        const isAssigned = node === networkState.producer &&
          ['dispatch', 'processing', 'response', 'complete'].includes(networkState.phase);
        if (isCandidate || isAssigned) symbol = '!';
      }
      if (symbol) drawStatusBubble(item.x, item.y, symbol, bubbleTone, colors, time, node.phase);
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reduceMotion) requestAnimationFrame(draw);
  });
  // Re-adapt when theme toggles
  const obs = new MutationObserver(() => {
    palette = getColors();
    resize();
    if (reduceMotion) requestAnimationFrame(draw);
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  requestAnimationFrame(draw);
})();
