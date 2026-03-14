// Island vignette illustrations — small isometric scenes for marketing sections
// Reuses the visual language from the hero archipelago map
(function() {
  const TILE = 28;
  const TX = TILE, TY = TILE * 0.5, TILE_H = 12, R = 3;

  function toScreen(gx, gy, ox, oy) {
    return { x: (gx - gy) * TX + ox, y: (gx + gy) * TY + oy };
  }

  function isDark() { return !document.documentElement.classList.contains('light'); }
  function getColors() {
    const dark = isDark();
    return { wire: '13,148,136', bg: dark ? '#0a0a0a' : '#ffffff' };
  }

  // Drawing primitives (matching hero.js style)
  function drawRoundedIsoDiamond(ctx, cx, cy, w, h, r) {
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

  function drawCuboidSides(ctx, cx, cy, color, alpha, bg) {
    const w = TX - 2, h = TY - 1, d = TILE_H;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy); ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx - w, cy + d);
    ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', ' + (alpha * 0.3) + ')';
    ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + w, cy); ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx + w, cy + d);
    ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', ' + (alpha * 0.25) + ')';
    ctx.lineWidth = 0.8; ctx.stroke();
  }

  function drawCuboidTop(ctx, cx, cy, color, alpha, bg) {
    const w = TX - 2, h = TY - 1;
    drawRoundedIsoDiamond(ctx, cx, cy, w, h, R);
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', ' + (alpha * 0.4) + ')';
    ctx.lineWidth = 1; ctx.stroke();
  }

  function drawIsland(ctx, cx, cy, color, alpha, bg) {
    drawCuboidSides(ctx, cx, cy, color, alpha, bg);
    drawCuboidTop(ctx, cx, cy, color, alpha, bg);
  }

  // Sprite paths (same as hero.js)
  const palmPath = new Path2D('m42.079 17.179l-2.005-3.601l4.701.215l-2.209-3.348l4.297.074l-2.328-2.965L49 7.93l-2.479-3.08l3.826-1.102c-11.779-6.61-17.98 6.786-18.672 19.198C28.091 10.376 17.52-2.529 6.886 8.725l4.148-.289l-1.636 3.863l4.378-1.949l-1.516 3.697l4.295-1.598l-.895 2.788C9.724 13.338 4.284 14.757 2 22.525l3.554-1.906l.322 4.199l2.999-3.521l.351 3.996l3.087-3.164l.702 4.211l3.281-3.566l1.102 4.574l2.96-3.098l.717 2.688c-8.249 1.297-14.342 5.75-9.069 14.255l.745-3.238l2.926 2.416l-.623-3.914l2.813 2.273l-.342-3.746l3.15 2.203l-.495-4.107l3.609 2.199l-.365-3.631l1.06.614c.396 1.249 1.197 2.28 2.302 2.904c.317.18.658.315 1.009.421L32.587 62h1.524l-.173-.952l6.464-1.2l-6.895-1.172l-.774-4.27l6.363-1.184l-6.787-1.149l-.795-4.381l5.876-1.093l-6.267-1.063l-.82-4.52l5.592-1.04l-5.964-1.012l-.574-3.162a5.6 5.6 0 0 0 2.285-.544c.39.406.823.752 1.303 1.002l-2.167.403l6.037 1.025l1.399 4.647l-5.114.952l5.691.964l1.413 4.695l-5.184.964l5.769.979l1.394 4.63l-5.456 1.015l6.072 1.03L44.135 62h1.566l-7.893-26.22a4 4 0 0 0 1.311-2.658a4.5 4.5 0 0 0-.136-1.443l2.149-1.351l-.525 3.439l3.402-2.232l-.666 3.898l2.982-2.219l-.506 3.547l2.68-2.268l-.771 3.719l2.789-2.406l.51 3.02c5.41-8.526-.439-12.442-8.263-13.12l.876-3.028l2.959 2.859l1.104-4.223l3.281 3.291l.701-3.885l3.086 2.92l.354-3.688l2.996 3.248l.322-3.875L62 21.086c-3.08-9.662-11.884-8.695-19.921-3.907m-22.69-.363a25 25 0 0 0-2.315-1.07l2.853-1.148zm3.314 1.999q-.572-.39-1.146-.751l1.426-.545zm.729 7.842l.676-.687l.26.618a40 40 0 0 0-.936.069m16.727-1.041c-.15-.273-.33-.53-.531-.774l.263-.576l1.444 1.354c-.388-.014-.783-.005-1.176-.004m-1.118-6.421l-.977-1.863l3.602.097a39 39 0 0 0-2.625 1.766');
  const hutPath = new Path2D('M29 18.976c.53-.099.93-.563.93-1.121c0-.16-.03-.31-.06-.45a2 2 0 0 1-.098-.163l-.032-.057q-.365-.585-.74-1.163V16h-.015a62 62 0 0 0-1.735-2.525c-2.58-3.59-5.48-6.69-8.66-9.52c-1.43-1.27-3.58-1.27-5.03-.02c-3.3 2.84-6.17 5.91-8.82 9.54c-.87 1.18-1.7 2.4-2.48 3.66l-.034.047c-.042.058-.087.12-.126.183c0 .02-.01.03-.02.04c-.05.14-.08.29-.08.45c0 .59.429 1.065 1 1.132V31h26zM26.143 18c.36.056.622.173.857.307V29h-6.011v-3.78c0-1.89-1.706-3.22-3.538-3.22h-2.914C12.723 22 11 23.314 11 25.22V29H5V18.33c.244-.144.514-.271.89-.33h.956c.5.079.811.279 1.123.479c.402.258.805.516 1.611.516c.799 0 1.199-.257 1.6-.514c.313-.2.626-.402 1.13-.481h.956c.5.079.812.279 1.123.479c.402.258.805.516 1.611.516s1.207-.258 1.61-.515c.314-.2.627-.401 1.13-.48h.96c.503.079.817.28 1.13.48c.403.258.805.515 1.61.515s1.207-.258 1.61-.515c.313-.2.627-.401 1.13-.48z');
  const parasolPath = new Path2D('m259.431 268.8l140-140l-27.785-27.785A208.333 208.333 0 0 0 77.019 395.646l27.781 27.785l132-132L401.372 456h45.256ZM224.333 72a175.18 175.18 0 0 1 124.686 51.646l5.157 5.158l-57.058 57.058a477.7 477.7 0 0 0-62.879-53.924c-25.216-17.838-49.439-30.329-71.994-37.131a153 153 0 0 0-17.092-4.129A175.6 175.6 0 0 1 224.333 72M104.8 378.176l-5.158-5.157a176.64 176.64 0 0 1-32.964-203.866a153 153 0 0 0 4.129 17.092c6.8 22.556 19.3 46.778 37.131 71.994a477.7 477.7 0 0 0 53.924 62.879Zm79.7-79.7c-11.857-11.634-32.231-32.977-50.438-58.718c-22.872-32.336-46.59-77.9-33.753-115.45c37.421-12.793 82.8 10.736 115.005 33.437c25.864 18.233 47.431 38.815 59.158 50.759Z');

  function drawSprite(ctx, cx, cy, path, color, alpha, scale, vb, bg) {
    ctx.save();
    ctx.translate(cx - (vb / 2) * scale, cy - vb * scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = bg;
    ctx.fill(path, 'evenodd');
    ctx.strokeStyle = 'rgba(' + color + ', ' + (alpha * 0.35) + ')';
    ctx.lineWidth = 1.5 / scale;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.stroke(path);
    ctx.restore();
  }

  function drawPalmTree(ctx, cx, cy, color, alpha, bg) {
    drawSprite(ctx, cx, cy, palmPath, color, alpha, 0.36, 64, bg);
  }
  function drawMountain(ctx, cx, cy, color, alpha, bg) {
    drawSprite(ctx, cx, cy, hutPath, color, alpha, 0.65, 32, bg);
  }
  function drawComputeNode(ctx, cx, cy, color, alpha, bg) {
    drawSprite(ctx, cx, cy, parasolPath, color, alpha, 0.045, 512, bg);
  }

  // Draw grid floor lines
  function drawGrid(ctx, ox, oy, gridCols, gridRows, color) {
    ctx.strokeStyle = 'rgba(' + color + ', 0.1)';
    ctx.lineWidth = 0.5;
    for (var r = 0; r <= gridRows; r++) {
      var a = toScreen(0, r, ox, oy);
      var b = toScreen(gridCols, r, ox, oy);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (var c = 0; c <= gridCols; c++) {
      var a = toScreen(c, 0, ox, oy);
      var b = toScreen(c, gridRows, ox, oy);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }

  // Scene definitions: each is a grid size + list of tiles
  // tile: [col, row, type] where type: 1=island, 2=palm, 3=hut, 4=compute
  var scenes = {
    // Proximity — a cluster of nearby islands, one highlighted
    routing: {
      cols: 5, rows: 5,
      tiles: [[1,2,1],[2,1,2],[2,2,1],[2,3,1],[3,2,2],[3,3,1]]
    },
    // Market — islands at varying "heights" (drawn with extra depth)
    exchange: {
      cols: 5, rows: 4,
      tiles: [[1,1,4],[2,2,1],[3,1,2],[3,2,1],[1,2,1]]
    },
    // Security — single fortified island with hut
    security: {
      cols: 4, rows: 4,
      tiles: [[1,1,1],[2,1,1],[1,2,3],[2,2,1]]
    },
    // Streaming — chain of islands
    streaming: {
      cols: 6, rows: 3,
      tiles: [[0,1,2],[1,1,1],[2,1,1],[3,1,4],[4,1,1],[5,1,2]]
    },
    // Compute — island with parasol
    compute: {
      cols: 4, rows: 4,
      tiles: [[1,1,1],[2,1,1],[1,2,1],[2,2,4]]
    },
    // Single island with palm tree
    solo: {
      cols: 3, rows: 3,
      tiles: [[1,1,2]]
    }
  };

  function renderScene(canvas, sceneName) {
    var scene = scenes[sceneName];
    if (!scene) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var w = rect.width, h = rect.height;
    var colors = getColors();
    var teal = colors.wire, bg = colors.bg;

    // Center the grid in the canvas
    var gridW = (scene.cols + scene.rows) * TX;
    var gridH = (scene.cols + scene.rows) * TY;
    var ox = w / 2 - (scene.cols - scene.rows) * TX / 2;
    var oy = h / 2 - gridH / 2 + TY;

    ctx.clearRect(0, 0, w, h);

    // Draw grid floor
    var floorOy = oy + TY - 1 + TILE_H;
    drawGrid(ctx, ox, floorOy, scene.cols, scene.rows, teal);

    // Pass 1: sides (back to front)
    for (var i = 0; i < scene.tiles.length; i++) {
      var t = scene.tiles[i];
      var pos = toScreen(t[0], t[1], ox, oy);
      drawCuboidSides(ctx, pos.x, pos.y, teal, 1, bg);
    }

    // Pass 2: tops + decorations
    for (var i = 0; i < scene.tiles.length; i++) {
      var t = scene.tiles[i];
      var pos = toScreen(t[0], t[1], ox, oy);
      drawCuboidTop(ctx, pos.x, pos.y, teal, 1, bg);
      if (t[2] === 2) drawPalmTree(ctx, pos.x, pos.y, teal, 1, bg);
      if (t[2] === 3) drawMountain(ctx, pos.x, pos.y, teal, 1, bg);
      if (t[2] === 4) drawComputeNode(ctx, pos.x, pos.y, teal, 1, bg);
    }
  }

  function initAll() {
    var canvases = document.querySelectorAll('canvas[data-island-scene]');
    canvases.forEach(function(c) {
      renderScene(c, c.getAttribute('data-island-scene'));
    });
  }

  // Init + re-render on resize and theme change
  initAll();
  window.addEventListener('resize', initAll);
  var obs = new MutationObserver(initAll);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
