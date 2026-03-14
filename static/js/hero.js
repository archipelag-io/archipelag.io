// Hero scroll expansion
(function() {
  const wrapper = document.getElementById('hero-wrapper');
  if (!wrapper) return;
  const section = wrapper.querySelector('.hero-section');
  const SCROLL_DISTANCE = 200;

  function update() {
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

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildGrid(rect.width, rect.height);
  }

  // Detect theme: dark by default, light if html.light
  function isDark() { return !document.documentElement.classList.contains('light'); }
  function getColors() {
    const dark = isDark();
    return {
      wire: dark ? '13,148,136' : '13,148,136',
      bg: dark ? '#0a0a0a' : '#ffffff',
    };
  }

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

    // Pass 4: add decorations to ~15% of island tiles
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (m[r][c] === 1 && gen() < 0.15) {
          const v = gen();
          m[r][c] = v < 0.6 ? 2 : (v < 0.85 ? 3 : 4);
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
  }
  const SLIDE_INTERVAL = 3000, SLIDE_DURATION = 800;

  const rng = mulberry32(77);

  function pickSlide(now) {
    if (slideAnims.length > 0 || now - lastSlideTime < SLIDE_INTERVAL) return;
    // Collect all movable tiles
    const candidates = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === 0) continue;
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && map[nr][nc] === 0)
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

  const WATER_LEVEL = 0.35;

  function drawWater(w, h, time, color, ox, floorOy) {
    const waterSurfaceBase = floorOy - TILE_H * WATER_LEVEL;
    const pad = Math.ceil(Math.max(w, h) / TILE) + 5;
    const gridMin = -pad;
    const gridMax = Math.max(ROWS, COLS) + pad;

    ctx.strokeStyle = `rgba(${color}, 0.12)`;
    ctx.lineWidth = 0.5;
    // Row lines
    for (let r = gridMin; r <= gridMax; r++) {
      const a = toScreen(r, gridMin, ox, waterSurfaceBase);
      const b = toScreen(r, gridMax, ox, waterSurfaceBase);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // Column lines
    for (let c = gridMin; c <= gridMax; c++) {
      const a = toScreen(gridMin, c, ox, waterSurfaceBase);
      const b = toScreen(gridMax, c, ox, waterSurfaceBase);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }

  let startTime = performance.now();
  let isVisible = true;
  let lastFrameTime = 0;
  const FRAME_INTERVAL = 1000 / 30; // cap at 30fps

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
    const time = (now - startTime) / 1000;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const colors = getColors();
    const teal = colors.wire;
    const bg = colors.bg;
    const ox = w / 2 - (COLS - ROWS) * TX / 2;
    const oy = h / 2 - (COLS + ROWS) * TY / 2;
    const floorOy = oy + (TY - 1) + TILE_H;

    pickSlide(now);
    updateSlide(now);

    // Pass 1: cuboid sides
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === 0) continue;
        const off = tileOffsets[r][c];
        const pos = toScreen(c + off.dx, r + off.dy, ox, oy);
        if (pos.x < -TX * 2 || pos.x > w + TX * 2 || pos.y < -TY * 2 - TILE_H || pos.y > h + TY * 2 + TILE_H) continue;
        drawCuboidSides(pos.x, pos.y, teal, 1, bg);
      }

    // Water surface
    drawWater(w, h, time, teal, ox, floorOy);

    // Pass 2: cuboid tops + decorations
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (map[r][c] === 0) continue;
        const off = tileOffsets[r][c];
        const pos = toScreen(c + off.dx, r + off.dy, ox, oy);
        if (pos.x < -TX * 2 || pos.x > w + TX * 2 || pos.y < -TY * 2 - TILE_H || pos.y > h + TY * 2 + TILE_H) continue;
        drawCuboidTop(pos.x, pos.y, teal, 1, bg);
        if (map[r][c] === 2) drawPalmTree(pos.x, pos.y, teal, 1, bg);
        if (map[r][c] === 3) drawMountain(pos.x, pos.y, teal, 1, bg);
        if (map[r][c] === 4) drawComputeNode(pos.x, pos.y, teal, 1, time, bg);
      }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  // Re-adapt when theme toggles
  const obs = new MutationObserver(resize);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  requestAnimationFrame(draw);
})();
