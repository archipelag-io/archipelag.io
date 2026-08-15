// Island vignette illustrations — small isometric scenes for marketing sections
// Reuses the visual language from the hero archipelago map
(function() {
  const TILE = 28;
  const TX = TILE, TY = TILE * 0.5, TILE_H = 12, R = 3;

  function toScreen(gx, gy, ox, oy) {
    return { x: (gx - gy) * TX + ox, y: (gx + gy) * TY + oy };
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function colorToRgb(value, fallback) {
    var color = value.trim();
    var hex = color.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      var n = parseInt(hex[1], 16);
      return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    }
    var rgb = color.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    return rgb ? rgb[1] + ',' + rgb[2] + ',' + rgb[3] : fallback;
  }

  function getColors() {
    var styles = getComputedStyle(document.documentElement);
    var dark = !document.documentElement.classList.contains('light');
    return {
      wire: colorToRgb(styles.getPropertyValue('--accent'), '0,255,221'),
      yellow: dark ? colorToRgb(styles.getPropertyValue('--accent-yellow'), '255,240,51') : '201,147,0',
      pink: colorToRgb(styles.getPropertyValue('--accent-pink'), '255,92,184'),
      bg: styles.getPropertyValue('--bg').trim() || '#0a0a0a',
      dark: dark,
      strength: dark ? 1 : 1.55,
      gridAlpha: dark ? 0.1 : 0.19
    };
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

  // Compact markers designed for the isometric scene instead of adapted icon silhouettes.
  function drawTreeMarker(ctx, cx, cy, color, alpha, bg) {
    var stroke = Math.min(0.9, alpha * 0.46);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(' + color + ', ' + (alpha * 0.08) + ')';
    ctx.beginPath(); ctx.ellipse(cx, cy - 1, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = bg;
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(cx, cy - 2); ctx.quadraticCurveTo(cx - 2, cy - 12, cx + 1, cy - 19); ctx.stroke();
    ctx.strokeStyle = 'rgba(' + color + ', ' + stroke + ')';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    var crownY = cy - 19;
    [[-11,-4],[-7,-9],[0,-11],[8,-8],[11,-3]].forEach(function(leaf, index) {
      ctx.beginPath();
      ctx.moveTo(cx + 1, crownY);
      ctx.quadraticCurveTo(cx + leaf[0] * 0.45, crownY + leaf[1] * 0.22, cx + leaf[0], crownY + leaf[1]);
      ctx.strokeStyle = 'rgba(' + color + ', ' + Math.min(0.95, stroke + (index === 2 ? 0.16 : 0)) + ')';
      ctx.lineWidth = 1.7;
      ctx.stroke();
    });
    ctx.fillStyle = 'rgba(' + color + ', ' + Math.min(1, alpha * 0.72) + ')';
    ctx.beginPath(); ctx.arc(cx + 1, crownY, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawDepotMarker(ctx, cx, cy, color, alpha, bg) {
    var stroke = 'rgba(' + color + ', ' + Math.min(0.9, alpha * 0.48) + ')';
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 10); ctx.lineTo(cx, cy - 5); ctx.lineTo(cx, cy + 1); ctx.lineTo(cx - 10, cy - 4);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 10); ctx.lineTo(cx, cy - 5); ctx.lineTo(cx, cy + 1); ctx.lineTo(cx + 10, cy - 4);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 21); ctx.lineTo(cx - 12, cy - 11); ctx.lineTo(cx, cy - 5); ctx.closePath();
    ctx.fillStyle = 'rgba(' + color + ', ' + (alpha * 0.09) + ')'; ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 21); ctx.lineTo(cx + 12, cy - 11); ctx.lineTo(cx, cy - 5); ctx.closePath();
    ctx.fillStyle = 'rgba(' + color + ', ' + (alpha * 0.14) + ')'; ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(' + color + ', ' + Math.min(1, alpha * 0.68) + ')';
    ctx.strokeRect(cx + 3, cy - 8, 3.5, 6);
    ctx.restore();
  }

  function drawComputeMarker(ctx, cx, cy, color, alpha, time, bg) {
    var w = 7, h = 3.5, d = 12, topY = cy - 12;
    var stroke = 'rgba(' + color + ', ' + Math.min(1, alpha * 0.62) + ')';
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - w, topY); ctx.lineTo(cx, topY + h); ctx.lineTo(cx, topY + h + d); ctx.lineTo(cx - w, topY + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + w, topY); ctx.lineTo(cx, topY + h); ctx.lineTo(cx, topY + h + d); ctx.lineTo(cx + w, topY + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.stroke();
    drawRoundedIsoDiamond(ctx, cx, topY, w, h, 1.2);
    ctx.fillStyle = 'rgba(' + color + ', ' + (alpha * 0.16) + ')'; ctx.fill(); ctx.stroke();
    var blink = reduceMotion ? 0.8 : 0.58 + Math.sin(time * 2.4) * 0.25;
    ctx.fillStyle = 'rgba(' + color + ', ' + Math.min(1, alpha * blink) + ')';
    [-3.5, 0, 3.5].forEach(function(offset) {
      ctx.beginPath(); ctx.arc(cx + offset, topY + h + 7, 0.9, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(' + color + ', ' + Math.min(0.9, alpha * 0.44) + ')';
    ctx.beginPath(); ctx.moveTo(cx, topY - 1); ctx.lineTo(cx, topY - 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, topY - 9, 1.7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawProducerMarker(ctx, cx, cy, colors, alpha, time, active) {
    var tone = colors.yellow;
    drawComputeMarker(ctx, cx, cy, tone, alpha, time, colors.bg);
    var brainY = cy - 33;
    var nodes = [[-6,1],[-3,-5],[2,-7],[7,-2],[6,5],[0,6],[-6,5]];
    var links = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,5],[2,4]];
    var pulse = reduceMotion ? 0.75 : 0.62 + Math.sin(time * 2.2) * 0.18;
    ctx.save();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(0.72, alpha * (active ? 0.48 : 0.28)) + ')';
    ctx.lineWidth = 0.75;
    links.forEach(function(link) {
      ctx.beginPath();
      ctx.moveTo(cx + nodes[link[0]][0], brainY + nodes[link[0]][1]);
      ctx.lineTo(cx + nodes[link[1]][0], brainY + nodes[link[1]][1]);
      ctx.stroke();
    });
    nodes.forEach(function(node, index) {
      ctx.fillStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * (active && index % 2 === 0 ? pulse : 0.58)) + ')';
      ctx.beginPath(); ctx.arc(cx + node[0], brainY + node[1], active ? 1.5 : 1.1, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(0.8, alpha * 0.44) + ')';
    ctx.beginPath(); ctx.ellipse(cx, brainY, 10.5, 8.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawConsumerMarker(ctx, cx, cy, colors, alpha, time, active) {
    var tone = colors.pink;
    var top = cy - 25 + (reduceMotion || !active ? 0 : Math.sin(time * 1.8) * 0.7);
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 10, top); ctx.lineTo(cx + 10, top + 2); ctx.lineTo(cx + 8, top + 14); ctx.lineTo(cx - 8, top + 12);
    ctx.closePath(); ctx.fillStyle = colors.bg; ctx.fill();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * (active ? 0.82 : 0.54)) + ')';
    ctx.lineWidth = 1.1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 6, top + 5); ctx.lineTo(cx - 3, top + 8); ctx.lineTo(cx - 6, top + 11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, top + 11); ctx.lineTo(cx + 5, top + 11.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, top + 14); ctx.lineTo(cx - 2, cy - 4); ctx.lineTo(cx + 4, cy - 3); ctx.stroke();
    drawRoundedIsoDiamond(ctx, cx + 1, cy - 1, 8, 3.5, 1.2);
    ctx.fillStyle = colors.bg; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function panelPath(ctx, x, y, w, h, radius) {
    var r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawProducerRoleIcon(ctx, cx, cy, colors, alpha, time, active) {
    var tone = colors.yellow, x = cx - 10, y = cy - 30;
    ctx.save();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.74) + ')';
    ctx.lineWidth = 1;
    [-6, 0, 6].forEach(function(offset) {
      ctx.beginPath(); ctx.moveTo(cx + offset, y - 2.5); ctx.lineTo(cx + offset, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + offset, y + 17); ctx.lineTo(cx + offset, y + 19.5); ctx.stroke();
    });
    panelPath(ctx, x, y, 20, 17, 4);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.96)'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.96) + ')';
    ctx.font = '700 8px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AI', cx, y + 9);
    if (active && !reduceMotion) {
      ctx.strokeStyle = 'rgba(' + tone + ', 0.26)';
      ctx.beginPath(); ctx.moveTo(x + 3, y + 4 + ((time * 7) % 9)); ctx.lineTo(x + 17, y + 4 + ((time * 7) % 9)); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx, y + 17); ctx.lineTo(cx, cy - 3); ctx.stroke();
    drawRoundedIsoDiamond(ctx, cx, cy - 1, 7, 3, 1.2); ctx.fillStyle = colors.bg; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawConsumerRoleIcon(ctx, cx, cy, colors, alpha, time, active) {
    var tone = colors.pink, x = cx - 11, y = cy - 29;
    ctx.save();
    panelPath(ctx, x, y, 22, 16, 4);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.96)'; ctx.fill();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.82) + ')'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.95) + ')';
    ctx.font = '700 7px IBM Plex Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var cursor = active && !reduceMotion && Math.sin(time * 4.5) < 0 ? ' ' : '_';
    ctx.fillText('>' + cursor, cx, y + 8.5);
    ctx.beginPath(); ctx.moveTo(cx, y + 16); ctx.lineTo(cx, cy - 3); ctx.stroke();
    drawRoundedIsoDiamond(ctx, cx, cy - 1, 7.5, 3, 1.2); ctx.fillStyle = colors.bg; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawStatusBubble(ctx, cx, cy, symbol, color, colors, time, phase) {
    var bob = reduceMotion ? 0 : Math.sin(time * 2 + phase) * 1.4;
    var x = cx - 10, y = cy - 52 + bob, w = 20, h = 17, r = 5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(cx + 2.5, y + h); ctx.lineTo(cx, y + h + 3.5); ctx.lineTo(cx - 2.5, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.96)'; ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', 0.82)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(' + color + ', 0.96)';
    ctx.font = '700 10px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(symbol, cx, y + 8);
    ctx.restore();
  }

  // Draw grid floor lines
  function drawGrid(ctx, ox, oy, gridCols, gridRows, color, alpha) {
    ctx.strokeStyle = 'rgba(' + color + ', ' + alpha + ')';
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

  function buildGridRoute(from, to, alternate) {
    var path = [{ c: from[0], r: from[1] }];
    var c = from[0];
    var r = from[1];
    var moveColumn = alternate;
    while (c !== to[0] || r !== to[1]) {
      if (c !== to[0] && (r === to[1] || moveColumn)) c += Math.sign(to[0] - c);
      else r += Math.sign(to[1] - r);
      path.push({ c: c, r: r });
      moveColumn = !moveColumn;
    }
    return path;
  }

  function pointOnGridRoute(path, progress, ox, oy) {
    var segments = Math.max(1, path.length - 1);
    var scaled = Math.min(segments - 0.0001, progress * segments);
    var index = Math.floor(scaled);
    var local = scaled - index;
    var a = toScreen(path[index].c, path[index].r, ox, oy);
    var next = path[Math.min(index + 1, path.length - 1)];
    var b = toScreen(next.c, next.r, ox, oy);
    return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
  }

  function drawMiniCargo(ctx, cx, cy, color, bg, strength) {
    var w = 5, h = 2.8, d = 5;
    cy -= 4;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - w, cy); ctx.lineTo(cx, cy + h); ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx - w, cy + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', ' + Math.min(1, 0.78 * strength) + ')'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + w, cy); ctx.lineTo(cx, cy + h); ctx.lineTo(cx, cy + h + d); ctx.lineTo(cx + w, cy + d);
    ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.stroke();
    drawRoundedIsoDiamond(ctx, cx, cy, w, h, 1);
    ctx.fillStyle = 'rgba(' + color + ', ' + (0.16 * strength) + ')'; ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', ' + Math.min(1, 0.94 * strength) + ')'; ctx.stroke();
    ctx.restore();
  }

  function drawMiniDemandToken(ctx, cx, cy, color, colors) {
    var x = cx - 7, y = cy - 14;
    ctx.save();
    var glow = ctx.createRadialGradient(cx, y + 7, 0, cx, y + 7, 13);
    glow.addColorStop(0, 'rgba(' + color + ', ' + (colors.dark ? 0.38 : 0.24) + ')');
    glow.addColorStop(1, 'rgba(' + color + ', 0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, y + 7, 13, 0, Math.PI * 2); ctx.fill();
    panelPath(ctx, x, y, 14, 14, 5);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.96)' : 'rgba(255,255,255,0.97)'; ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', 0.94)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(' + color + ', 1)';
    ctx.font = '700 9px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', cx, y + 6.7);
    ctx.restore();
  }

  function drawConnection(ctx, from, to, ox, oy, color, colors, time, phase, intensity, showCargo) {
    var path = buildGridRoute(from, to, phase > 0.3);
    ctx.save();
    path.forEach(function(cell, index) {
      if (index === 0 || index === path.length - 1) return;
      var point = toScreen(cell.c, cell.r, ox, oy);
      drawRoundedIsoDiamond(ctx, point.x, point.y, TX - 5, TY - 3, 2.5);
      ctx.fillStyle = 'rgba(' + color + ', ' + (colors.dark ? 0.045 : 0.085) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(' + color + ', ' + (colors.dark ? 0.22 : 0.4) + ')';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    if (showCargo) {
      var progress = reduceMotion ? 0.55 : (time * 0.16 + phase) % 1;
      var packet = pointOnGridRoute(path, progress, ox, oy);
      var glow = ctx.createRadialGradient(packet.x, packet.y, 0, packet.x, packet.y, 10);
      glow.addColorStop(0, 'rgba(' + color + ', ' + (colors.dark ? 0.35 : 0.24) + ')');
      glow.addColorStop(1, 'rgba(' + color + ', 0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(packet.x, packet.y, 10, 0, Math.PI * 2); ctx.fill();
      drawMiniDemandToken(ctx, packet.x, packet.y, colors.pink, colors);
    }
    ctx.restore();
  }

  function drawFlowGuide(ctx, path, ox, oy, color, alpha) {
    [0.24, 0.48, 0.72].forEach(function(progress) {
      var point = pointOnGridRoute(path, progress, ox, oy);
      var next = pointOnGridRoute(path, Math.min(0.99, progress + 0.025), ox, oy);
      var angle = Math.atan2(next.y - point.y, next.x - point.x);
      ctx.save();
      ctx.translate(point.x, point.y - 3);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-3.5, -2.5);
      ctx.lineTo(1.5, 0);
      ctx.lineTo(-3.5, 2.5);
      ctx.strokeStyle = 'rgba(' + color + ', ' + alpha + ')';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawInfoBadge(ctx, cx, cy, label, color, colors, emphasis) {
    ctx.save();
    ctx.font = '700 7px IBM Plex Mono, monospace';
    var width = Math.max(29, ctx.measureText(label).width + 12);
    var height = 15;
    panelPath(ctx, cx - width / 2, cy - height / 2, width, height, 5);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.94)' : 'rgba(255,255,255,0.97)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', ' + (emphasis ? 0.9 : 0.38) + ')';
    ctx.lineWidth = emphasis ? 1.1 : 0.8;
    ctx.stroke();
    ctx.fillStyle = 'rgba(' + color + ', ' + (emphasis ? 1 : 0.62) + ')';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy + 0.5);
    ctx.restore();
  }

  function drawTravelToken(ctx, path, progress, ox, oy, symbol, color, colors) {
    var point = pointOnGridRoute(path, progress, ox, oy);
    var radius = 7;
    ctx.save();
    var glow = ctx.createRadialGradient(point.x, point.y - 7, 0, point.x, point.y - 7, 15);
    glow.addColorStop(0, 'rgba(' + color + ', ' + (colors.dark ? 0.42 : 0.26) + ')');
    glow.addColorStop(1, 'rgba(' + color + ', 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(point.x, point.y - 7, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(point.x, point.y - 7, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.97)' : 'rgba(255,255,255,0.98)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', 0.96)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(' + color + ', 1)';
    ctx.font = '700 8px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, point.x, point.y - 6.5);
    ctx.restore();
  }

  function drawSignedCargo(ctx, path, progress, ox, oy, colors) {
    var point = pointOnGridRoute(path, progress, ox, oy);
    drawMiniCargo(ctx, point.x, point.y, colors.wire, colors.bg, colors.strength);
    ctx.save();
    ctx.fillStyle = 'rgba(' + colors.wire + ', 1)';
    ctx.font = '800 7px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2713', point.x, point.y - 5.5);
    ctx.restore();
  }

  function drawShield(ctx, cx, cy, color, colors, time, active) {
    var pulse = reduceMotion ? 0.7 : 0.58 + Math.sin(time * 2.2) * 0.12;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 48);
    ctx.bezierCurveTo(cx + 20, cy - 45, cx + 21, cy - 30, cx + 17, cy - 20);
    ctx.bezierCurveTo(cx + 12, cy - 8, cx + 4, cy - 3, cx, cy);
    ctx.bezierCurveTo(cx - 4, cy - 3, cx - 12, cy - 8, cx - 17, cy - 20);
    ctx.bezierCurveTo(cx - 21, cy - 30, cx - 20, cy - 45, cx, cy - 48);
    ctx.closePath();
    ctx.fillStyle = 'rgba(' + color + ', ' + (colors.dark ? 0.045 : 0.06) + ')';
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + color + ', ' + (active ? pulse : 0.38) + ')';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 25);
    ctx.lineTo(cx - 2, cy - 18);
    ctx.lineTo(cx + 10, cy - 32);
    ctx.strokeStyle = 'rgba(' + color + ', 0.92)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  function drawCoordinatorMarker(ctx, cx, cy, colors, alpha, time) {
    var tone = colors.wire;
    var top = cy - 38;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 4);
    ctx.lineTo(cx - 4, top + 10);
    ctx.lineTo(cx + 4, top + 10);
    ctx.lineTo(cx + 7, cy - 4);
    ctx.closePath();
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.96)' : 'rgba(255,255,255,0.97)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.72) + ')';
    ctx.lineWidth = 1;
    ctx.stroke();
    panelPath(ctx, cx - 8, top + 2, 16, 10, 3);
    ctx.fillStyle = 'rgba(' + tone + ', ' + (colors.dark ? 0.12 : 0.09) + ')';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(' + tone + ', 0.92)';
    ctx.beginPath(); ctx.arc(cx, top + 7, 2.2, 0, Math.PI * 2); ctx.fill();
    var sweep = reduceMotion ? -0.25 : Math.sin(time * 0.9) * 0.48;
    var beamLength = 38;
    var beam = ctx.createLinearGradient(cx, top + 7, cx + Math.cos(sweep) * beamLength, top + 7 + Math.sin(sweep) * beamLength);
    beam.addColorStop(0, 'rgba(' + tone + ', 0.32)');
    beam.addColorStop(1, 'rgba(' + tone + ', 0)');
    ctx.strokeStyle = beam;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, top + 7);
    ctx.lineTo(cx + Math.cos(sweep) * beamLength, top + 7 + Math.sin(sweep) * beamLength);
    ctx.stroke();
    ctx.restore();
  }

  function drawRelayMarker(ctx, cx, cy, colors, alpha, time) {
    var tone = colors.wire;
    var mastTop = cy - 34;
    ctx.save();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.76) + ')';
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(cx, cy - 2); ctx.lineTo(cx, mastTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 7, cy - 3); ctx.lineTo(cx, cy - 12); ctx.lineTo(cx + 7, cy - 3); ctx.stroke();
    ctx.fillStyle = 'rgba(' + tone + ', 0.96)';
    ctx.beginPath(); ctx.arc(cx, mastTop, 2.2, 0, Math.PI * 2); ctx.fill();
    [8, 14].forEach(function(radius, index) {
      var pulse = reduceMotion ? 0.7 : 0.45 + Math.sin(time * 2.1 - index * 0.7) * 0.18;
      ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.max(0.14, pulse * alpha) + ')';
      ctx.beginPath(); ctx.arc(cx, mastTop, radius, Math.PI * 1.16, Math.PI * 1.84); ctx.stroke();
    });
    ctx.restore();
  }

  function drawCreditMarker(ctx, cx, cy, colors, alpha, time) {
    var tone = colors.yellow;
    var bob = reduceMotion ? 0 : Math.sin(time * 1.7) * 0.8;
    ctx.save();
    [0, 4, 8].forEach(function(offset, index) {
      var y = cy - 6 - offset + bob;
      ctx.beginPath();
      ctx.ellipse(cx, y, 9, 3.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.96)' : 'rgba(255,255,255,0.98)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * (0.58 + index * 0.1)) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.fillStyle = 'rgba(' + tone + ', 0.98)';
    ctx.font = '700 8px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CR', cx, cy - 15 + bob);
    ctx.restore();
  }

  function drawCargoMarker(ctx, cx, cy, colors, alpha) {
    drawMiniCargo(ctx, cx, cy - 7, colors.wire, colors.bg, colors.strength);
    ctx.save();
    ctx.fillStyle = 'rgba(' + colors.wire + ', ' + Math.min(1, alpha) + ')';
    ctx.font = '800 7px Satoshi, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2713', cx, cy - 12.5);
    ctx.strokeStyle = 'rgba(' + colors.wire + ', ' + Math.min(0.8, alpha * 0.55) + ')';
    ctx.beginPath(); ctx.moveTo(cx, cy - 2); ctx.lineTo(cx, cy - 7); ctx.stroke();
    ctx.restore();
  }

  function drawMobileMarker(ctx, cx, cy, colors, alpha, time) {
    var tone = colors.yellow;
    var y = cy - 34;
    var bob = reduceMotion ? 0 : Math.sin(time * 1.8) * 0.7;
    ctx.save();
    ctx.lineJoin = 'round';
    panelPath(ctx, cx - 8, y + bob, 16, 27, 4);
    ctx.fillStyle = colors.dark ? 'rgba(10,10,10,0.96)' : 'rgba(255,255,255,0.98)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.82) + ')';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.min(1, alpha * 0.62) + ')';
    ctx.beginPath(); ctx.moveTo(cx - 3, y + 4 + bob); ctx.lineTo(cx + 3, y + 4 + bob); ctx.stroke();
    ctx.fillStyle = 'rgba(' + tone + ', 0.96)';
    ctx.beginPath(); ctx.arc(cx, y + 22.5 + bob, 1.1, 0, Math.PI * 2); ctx.fill();
    var pulse = reduceMotion ? 0.7 : 0.5 + Math.sin(time * 2.5) * 0.2;
    ctx.strokeStyle = 'rgba(' + tone + ', ' + Math.max(0.22, pulse) + ')';
    [5, 9].forEach(function(radius) {
      ctx.beginPath(); ctx.arc(cx, y + 13 + bob, radius, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(cx, y + 27 + bob); ctx.lineTo(cx, cy - 3); ctx.stroke();
    drawRoundedIsoDiamond(ctx, cx, cy - 1, 7.5, 3, 1.2);
    ctx.fillStyle = colors.bg; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawPulseRing(ctx, point, color, time, phase, intensity) {
    var pulse = reduceMotion ? 0.42 : (time * 0.38 + phase) % 1;
    ctx.save();
    ctx.strokeStyle = 'rgba(' + color + ', ' + ((1 - pulse) * 0.4 * intensity) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(point.x, point.y + 4, 8 + pulse * 19, 4 + pulse * 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Scene definitions: each is a grid size + list of tiles.
  // tile: [col, row, type] where 1-4 are terrain, 5-6 are network roles,
  // and 7-11 are Coordinator, relay, credit, Cargo, and mobile landmarks.
  var scenes = {
    // Proximity — one nearby Island is selected over a visibly slower option.
    routing: {
      cols: 5, rows: 4,
      tiles: [[0,2,5],[2,2,6],[4,0,6]],
      tone: 'wire'
    },
    // Market — a Consumer pays the selected Island without an intermediary.
    exchange: {
      cols: 5, rows: 4,
      tiles: [[0,2,5],[3,2,6]],
      tone: 'yellow'
    },
    // Security — only a signed Cargo may enter the verified, sandboxed Island.
    security: {
      cols: 5, rows: 4,
      tiles: [[3,2,6]],
      tone: 'wire'
    },
    // A connected overview of the dependable components under the network.
    architecture: {
      cols: 10, rows: 5,
      tiles: [[0,3,5],[3,3,7],[5,2,8],[7,1,6],[7,3,6],[9,2,6],[2,0,2],[6,4,3]],
      tone: 'wire'
    },
    // A complete contribution loop: job in, compute, credits out.
    earning: {
      cols: 6, rows: 4,
      tiles: [[0,2,5],[3,2,6],[5,1,9]],
      tone: 'yellow'
    },
    // A signed Cargo moves from a Consumer to a compatible Island.
    cargo: {
      cols: 6, rows: 4,
      tiles: [[0,2,5],[3,2,10],[5,1,6]],
      tone: 'wire'
    },
    // A phone registered as a small mobile Island.
    mobile: {
      cols: 4, rows: 4,
      tiles: [[2,2,11],[0,2,8]],
      tone: 'yellow'
    },
    // A small relay Island for contact and communication moments.
    beacon: {
      cols: 5, rows: 4,
      tiles: [[2,2,8],[1,3,2],[4,1,3]],
      tone: 'wire'
    },
    // A quiet stranded Island for the 404 page.
    lost: {
      cols: 5, rows: 4,
      tiles: [[2,2,3]],
      tone: 'pink'
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

  var states = [];
  var startTime = performance.now();

  function resizeState(state) {
    var rect = state.canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    state.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    state.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    state.canvas.style.width = rect.width + 'px';
    state.canvas.style.height = rect.height + 'px';
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.width = rect.width;
    state.height = rect.height;
  }

  function tileLift(sceneName, index, time, hover) {
    if (reduceMotion) return 0;
    return 0;
  }

  function renderState(state, time) {
    var scene = state.scene;
    var ctx = state.ctx;
    var w = state.width;
    var h = state.height;
    if (!w || !h) return;

    state.x += (state.targetX - state.x) * 0.08;
    state.y += (state.targetY - state.y) * 0.08;

    var colors = state.colors;
    var teal = colors.wire;
    var bg = colors.bg;
    var tone = colors[scene.tone] || teal;
    var intensity = state.hover ? 1 : 0.72;
    var gridH = (scene.cols + scene.rows) * TY;
    var ox = w / 2 - (scene.cols - scene.rows) * TX / 2 + state.x * 5;
    var oy = h / 2 - gridH / 2 + TY + state.y * 3;
    var positions = [];
    var floorOy = oy + TY - 1 + TILE_H;

    ctx.clearRect(0, 0, w, h);
    drawGrid(ctx, ox, floorOy, scene.cols, scene.rows, teal, colors.gridAlpha);

    for (var i = 0; i < scene.tiles.length; i++) {
      var tile = scene.tiles[i];
      var point = toScreen(tile[0], tile[1], ox, oy);
      point.y += tileLift(state.name, i, time, state.hover);
      positions.push(point);
    }

    (scene.links || []).forEach(function(link, index) {
      drawConnection(ctx, scene.tiles[link[0]], scene.tiles[link[1]], ox, floorOy,
        tone, colors, time, index * 0.23, intensity, index === 0);
    });

    var semanticPath;
    var flowOy = floorOy - TILE_H * 0.35;
    if (state.name === 'routing') {
      semanticPath = buildGridRoute(scene.tiles[0], scene.tiles[1], true);
      drawFlowGuide(ctx, semanticPath, ox, flowOy, teal, 0.66);
      var requestProgress = reduceMotion ? 0.56 : (time * 0.18) % 1;
      drawTravelToken(ctx, semanticPath, requestProgress, ox, flowOy, '?', colors.pink, colors);
    }
    if (state.name === 'exchange') {
      semanticPath = buildGridRoute(scene.tiles[0], scene.tiles[1], false);
      drawFlowGuide(ctx, semanticPath, ox, flowOy, colors.yellow, 0.74);
      var paymentProgress = reduceMotion ? 0.58 : (time * 0.2) % 1;
      drawTravelToken(ctx, semanticPath, paymentProgress, ox, flowOy, 'CR', colors.yellow, colors);
    }
    if (state.name === 'security') {
      semanticPath = buildGridRoute([0,2], scene.tiles[0], true);
      drawFlowGuide(ctx, semanticPath, ox, flowOy, teal, 0.7);
      var cargoProgress = reduceMotion ? 0.52 : (time * 0.16) % 1;
      drawSignedCargo(ctx, semanticPath, cargoProgress, ox, flowOy, colors);
    }
    var architecturePaths;
    if (state.name === 'architecture') {
      architecturePaths = [
        buildGridRoute(scene.tiles[0], scene.tiles[1], true),
        buildGridRoute(scene.tiles[1], scene.tiles[2], false),
        buildGridRoute(scene.tiles[2], scene.tiles[3], true),
        buildGridRoute(scene.tiles[2], scene.tiles[4], false),
        buildGridRoute(scene.tiles[2], scene.tiles[5], true)
      ];
      architecturePaths.forEach(function(path, index) {
        drawFlowGuide(ctx, path, ox, flowOy, index === 0 ? colors.pink : teal, index < 2 ? 0.68 : 0.42);
      });
      var architectureProgress = reduceMotion ? 0.55 : (time * 0.16) % 1;
      drawTravelToken(ctx, architecturePaths[0], architectureProgress, ox, flowOy, '?', colors.pink, colors);
      drawTravelToken(ctx, architecturePaths[2], (architectureProgress + 0.34) % 1, ox, flowOy, '01', colors.yellow, colors);
      drawTravelToken(ctx, architecturePaths[3], (architectureProgress + 0.68) % 1, ox, flowOy, 'AI', colors.yellow, colors);
    }
    var earningPaths;
    if (state.name === 'earning') {
      earningPaths = [
        buildGridRoute(scene.tiles[0], scene.tiles[1], true),
        buildGridRoute(scene.tiles[1], scene.tiles[2], false)
      ];
      drawFlowGuide(ctx, earningPaths[0], ox, flowOy, colors.pink, 0.62);
      drawFlowGuide(ctx, earningPaths[1], ox, flowOy, colors.yellow, 0.7);
      var earningPhase = reduceMotion ? 0.58 : (time * 0.18) % 1;
      if (reduceMotion || earningPhase < 0.5)
        drawTravelToken(ctx, earningPaths[0], reduceMotion ? 0.58 : earningPhase * 2, ox, flowOy, '?', colors.pink, colors);
      else
        drawTravelToken(ctx, earningPaths[1], (earningPhase - 0.5) * 2, ox, flowOy, 'CR', colors.yellow, colors);
    }
    var cargoPaths;
    if (state.name === 'cargo') {
      cargoPaths = [
        buildGridRoute(scene.tiles[0], scene.tiles[1], true),
        buildGridRoute(scene.tiles[1], scene.tiles[2], false)
      ];
      drawFlowGuide(ctx, cargoPaths[0], ox, flowOy, colors.pink, 0.58);
      drawFlowGuide(ctx, cargoPaths[1], ox, flowOy, teal, 0.68);
      var cargoScenePhase = reduceMotion ? 0.56 : (time * 0.15) % 1;
      if (reduceMotion || cargoScenePhase < 0.5)
        drawTravelToken(ctx, cargoPaths[0], reduceMotion ? 0.56 : cargoScenePhase * 2, ox, flowOy, '?', colors.pink, colors);
      else
        drawSignedCargo(ctx, cargoPaths[1], (cargoScenePhase - 0.5) * 2, ox, flowOy, colors);
    }

    for (var sideIndex = 0; sideIndex < scene.tiles.length; sideIndex++) {
      drawCuboidSides(ctx, positions[sideIndex].x, positions[sideIndex].y, teal, 0.88 * colors.strength, bg);
    }

    for (var topIndex = 0; topIndex < scene.tiles.length; topIndex++) {
      var currentTile = scene.tiles[topIndex];
      var pos = positions[topIndex];
      drawCuboidTop(ctx, pos.x, pos.y, teal, colors.strength, bg);
      if (currentTile[2] === 2) drawTreeMarker(ctx, pos.x, pos.y, teal, colors.strength, bg);
      if (currentTile[2] === 3) drawDepotMarker(ctx, pos.x, pos.y, teal, colors.strength, bg);
      if (currentTile[2] === 4) drawComputeMarker(ctx, pos.x, pos.y, teal, colors.strength, time, bg);
      if (currentTile[2] === 5) drawConsumerRoleIcon(ctx, pos.x, pos.y, colors, colors.strength, time, true);
      if (currentTile[2] === 6) {
        var producerActive = (state.name === 'exchange' || state.name === 'routing' || state.name === 'earning')
          ? topIndex === 1
          : state.name === 'architecture';
        drawProducerRoleIcon(ctx, pos.x, pos.y, colors, colors.strength, time, producerActive);
      }
      if (currentTile[2] === 7) drawCoordinatorMarker(ctx, pos.x, pos.y, colors, colors.strength, time);
      if (currentTile[2] === 8) drawRelayMarker(ctx, pos.x, pos.y, colors, colors.strength, time);
      if (currentTile[2] === 9) drawCreditMarker(ctx, pos.x, pos.y, colors, colors.strength, time);
      if (currentTile[2] === 10) drawCargoMarker(ctx, pos.x, pos.y, colors, colors.strength);
      if (currentTile[2] === 11) drawMobileMarker(ctx, pos.x, pos.y, colors, colors.strength, time);
    }

    if (state.name === 'routing') {
      drawInfoBadge(ctx, positions[0].x - 13, positions[0].y - 44, 'CONSUMER', colors.pink, colors, true);
      drawInfoBadge(ctx, positions[1].x + 19, positions[1].y - 46, 'NEAREST \u00b7 12ms', teal, colors, true);
      drawInfoBadge(ctx, positions[2].x + 8, positions[2].y - 44, 'FAR \u00b7 86ms', teal, colors, false);
    } else if (state.name === 'exchange') {
      var paymentLabelPoint = pointOnGridRoute(semanticPath, 0.51, ox, flowOy);
      drawInfoBadge(ctx, positions[0].x - 12, positions[0].y - 44, 'CONSUMER', colors.pink, colors, true);
      drawInfoBadge(ctx, paymentLabelPoint.x, paymentLabelPoint.y - 21, 'VIRTUAL', colors.yellow, colors, true);
      drawInfoBadge(ctx, positions[1].x + 15, positions[1].y - 45, 'ISLAND \u00b7 0.08 CR', colors.yellow, colors, true);
    } else if (state.name === 'security') {
      drawShield(ctx, positions[0].x, positions[0].y, teal, colors, time, true);
      var cargoLabelPoint = toScreen(0, 2, ox, flowOy);
      drawInfoBadge(ctx, cargoLabelPoint.x - 4, cargoLabelPoint.y - 24, 'SIGNED CARGO \u2713', teal, colors, true);
      drawInfoBadge(ctx, positions[0].x + 22, positions[0].y - 47, 'SIGNED ONLY \u2713', teal, colors, true);
      drawInfoBadge(ctx, positions[0].x - 24, positions[0].y - 20, 'SANDBOXED', teal, colors, true);
    } else if (state.name === 'architecture') {
      drawInfoBadge(ctx, positions[0].x + 2, positions[0].y - 46, 'CONSUMER', colors.pink, colors, true);
      drawInfoBadge(ctx, positions[1].x - 8, positions[1].y - 54, 'PHOENIX CONTROL', teal, colors, true);
      drawInfoBadge(ctx, positions[2].x + 2, positions[2].y - 51, 'NATS', teal, colors, true);
      drawInfoBadge(ctx, positions[3].x + 22, positions[3].y - 48, 'RUST ISLANDS', colors.yellow, colors, true);
    } else if (state.name === 'earning') {
      drawInfoBadge(ctx, positions[0].x - 8, positions[0].y - 46, 'JOB', colors.pink, colors, true);
      drawInfoBadge(ctx, positions[1].x + 2, positions[1].y - 49, 'YOUR ISLAND', colors.yellow, colors, true);
      drawInfoBadge(ctx, positions[2].x + 12, positions[2].y - 35, 'VIRTUAL +0.08 CR', colors.yellow, colors, true);
    } else if (state.name === 'cargo') {
      drawInfoBadge(ctx, positions[0].x - 4, positions[0].y - 46, 'CONSUMER', colors.pink, colors, true);
      drawInfoBadge(ctx, positions[1].x, positions[1].y - 36, 'SIGNED CARGO', teal, colors, true);
      drawInfoBadge(ctx, positions[2].x + 14, positions[2].y - 46, 'COMPATIBLE ISLAND', colors.yellow, colors, true);
    } else if (state.name === 'beacon') {
      drawInfoBadge(ctx, positions[0].x + 7, positions[0].y - 52, 'OPEN CHANNEL', teal, colors, true);
    } else if (state.name === 'mobile') {
      drawInfoBadge(ctx, positions[0].x + 8, positions[0].y - 49, 'MOBILE ISLAND', colors.yellow, colors, true);
      drawInfoBadge(ctx, positions[1].x - 4, positions[1].y - 48, 'HEARTBEAT', teal, colors, true);
    } else if (state.name === 'lost') {
      drawStatusBubble(ctx, positions[0].x, positions[0].y, '?', colors.pink, colors, time, 0);
      drawInfoBadge(ctx, positions[0].x + 25, positions[0].y - 18, 'NO ROUTE', colors.pink, colors, true);
    } else {
      scene.tiles.forEach(function(tile, index) {
        if (tile[2] === 5) drawStatusBubble(ctx, positions[index].x, positions[index].y, '?', colors.pink, colors, time, index);
        if (tile[2] === 6)
          drawStatusBubble(ctx, positions[index].x, positions[index].y, '!', colors.yellow, colors, time, index);
      });
    }

    intensity *= colors.strength;
    if (state.name === 'routing') drawPulseRing(ctx, positions[1], tone, time, 0.08, intensity);
    if (state.name === 'exchange') {
      drawPulseRing(ctx, positions[1], tone, time, 0, intensity);
    }
    if (state.name === 'security') {
      drawPulseRing(ctx, positions[0], tone, time * 0.72, 0.1, intensity * 0.72);
    }
    if (state.name === 'architecture') {
      drawPulseRing(ctx, positions[1], teal, time, 0.1, intensity * 0.62);
      drawPulseRing(ctx, positions[2], teal, time, 0.45, intensity * 0.78);
      drawPulseRing(ctx, positions[3], colors.yellow, time, 0.18, intensity * 0.55);
      drawPulseRing(ctx, positions[4], colors.yellow, time, 0.54, intensity * 0.48);
    }
    if (state.name === 'earning') {
      drawPulseRing(ctx, positions[1], colors.yellow, time, 0.12, intensity * 0.72);
      drawPulseRing(ctx, positions[2], colors.yellow, time, 0.55, intensity * 0.5);
    }
    if (state.name === 'cargo') {
      drawPulseRing(ctx, positions[1], teal, time, 0.12, intensity * 0.6);
      drawPulseRing(ctx, positions[2], colors.yellow, time, 0.48, intensity * 0.48);
    }
    if (state.name === 'beacon') {
      drawPulseRing(ctx, positions[0], teal, time, 0.12, intensity);
      drawPulseRing(ctx, positions[0], teal, time, 0.58, intensity * 0.6);
    }
    if (state.name === 'mobile') {
      drawPulseRing(ctx, positions[0], colors.yellow, time, 0.16, intensity * 0.72);
      drawPulseRing(ctx, positions[1], teal, time, 0.5, intensity * 0.5);
    }
    if (state.name === 'lost') {
      drawPulseRing(ctx, positions[0], colors.pink, time * 0.7, 0.2, intensity * 0.5);
    }
  }

  function createState(canvas) {
    var name = canvas.getAttribute('data-island-scene');
    var scene = scenes[name];
    if (!scene) return null;
    var state = {
      canvas: canvas,
      ctx: canvas.getContext('2d'),
      name: name,
      scene: scene,
      colors: getColors(),
      width: 0,
      height: 0,
      visible: true,
      hover: false,
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };

    canvas.addEventListener('pointerenter', function() { state.hover = true; });
    canvas.addEventListener('pointermove', function(event) {
      var rect = canvas.getBoundingClientRect();
      state.targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
      state.targetY = (event.clientY - rect.top) / rect.height * 2 - 1;
    }, { passive: true });
    canvas.addEventListener('pointerleave', function() {
      state.hover = false;
      state.targetX = 0;
      state.targetY = 0;
    });

    resizeState(state);
    return state;
  }

  document.querySelectorAll('canvas[data-island-scene]').forEach(function(canvas) {
    var state = createState(canvas);
    if (state) states.push(state);
  });

  var visibilityObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var state = states.find(function(item) { return item.canvas === entry.target; });
      if (state) state.visible = entry.isIntersecting;
    });
  }, { threshold: 0 });
  states.forEach(function(state) { visibilityObserver.observe(state.canvas); });

  function frame(now) {
    var time = reduceMotion ? 0 : (now - startTime) / 1000;
    states.forEach(function(state) {
      if (state.visible) renderState(state, time);
    });
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', function() {
    states.forEach(function(state) { resizeState(state); });
    if (reduceMotion) requestAnimationFrame(frame);
  });

  var obs = new MutationObserver(function() {
    states.forEach(function(state) {
      state.colors = getColors();
      resizeState(state);
    });
    if (reduceMotion) requestAnimationFrame(frame);
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  requestAnimationFrame(frame);
})();
