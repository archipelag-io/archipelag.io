/**
 * Hardware Earnings Calculator
 *
 * Estimates potential earnings for prospective Archipelag.io hosts
 * based on their GPU model, using the same bandwidth table and
 * fit scoring logic as the coordinator placement engine.
 */
(function () {
  'use strict';

  var form = document.getElementById('calc-form');
  if (!form) return;

  // GPU bandwidth table (GB/s) — subset matching coordinator's GpuSpecs module
  var GPU_DB = [
    // NVIDIA Data Center
    { name: 'NVIDIA H100',           vram: 80,  bw: 3350,  tier: 'enterprise' },
    { name: 'NVIDIA A100 80GB',      vram: 80,  bw: 2039,  tier: 'enterprise' },
    { name: 'NVIDIA A100 40GB',      vram: 40,  bw: 1555,  tier: 'enterprise' },
    { name: 'NVIDIA L40S',           vram: 48,  bw: 864,   tier: 'enterprise' },
    { name: 'NVIDIA A40',            vram: 48,  bw: 696,   tier: 'high_end' },
    { name: 'NVIDIA L4',             vram: 24,  bw: 300,   tier: 'mid_range' },
    { name: 'NVIDIA T4',             vram: 16,  bw: 320,   tier: 'mid_range' },
    // NVIDIA Workstation
    { name: 'NVIDIA RTX A6000',      vram: 48,  bw: 768,   tier: 'high_end' },
    { name: 'NVIDIA RTX A5000',      vram: 24,  bw: 768,   tier: 'high_end' },
    { name: 'NVIDIA RTX A4000',      vram: 16,  bw: 448,   tier: 'mid_range' },
    // RTX 50 series
    { name: 'NVIDIA RTX 5090',       vram: 32,  bw: 1792,  tier: 'enterprise' },
    { name: 'NVIDIA RTX 5080',       vram: 16,  bw: 960,   tier: 'high_end' },
    { name: 'NVIDIA RTX 5070 Ti',    vram: 16,  bw: 896,   tier: 'high_end' },
    { name: 'NVIDIA RTX 5070',       vram: 12,  bw: 672,   tier: 'mid_range' },
    // RTX 40 series
    { name: 'NVIDIA RTX 4090',       vram: 24,  bw: 1008,  tier: 'enterprise' },
    { name: 'NVIDIA RTX 4080 Super', vram: 16,  bw: 736,   tier: 'high_end' },
    { name: 'NVIDIA RTX 4080',       vram: 16,  bw: 716.8, tier: 'high_end' },
    { name: 'NVIDIA RTX 4070 Ti Super', vram: 16, bw: 672, tier: 'high_end' },
    { name: 'NVIDIA RTX 4070 Ti',    vram: 12,  bw: 504,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 4070 Super', vram: 12,  bw: 504,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 4070',       vram: 12,  bw: 504,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 4060 Ti',    vram: 8,   bw: 288,   tier: 'entry' },
    { name: 'NVIDIA RTX 4060',       vram: 8,   bw: 272,   tier: 'entry' },
    // RTX 30 series
    { name: 'NVIDIA RTX 3090 Ti',    vram: 24,  bw: 1008,  tier: 'high_end' },
    { name: 'NVIDIA RTX 3090',       vram: 24,  bw: 936.2, tier: 'high_end' },
    { name: 'NVIDIA RTX 3080 Ti',    vram: 12,  bw: 912.4, tier: 'high_end' },
    { name: 'NVIDIA RTX 3080',       vram: 10,  bw: 760.3, tier: 'mid_range' },
    { name: 'NVIDIA RTX 3070 Ti',    vram: 8,   bw: 608.3, tier: 'mid_range' },
    { name: 'NVIDIA RTX 3070',       vram: 8,   bw: 448,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 3060 Ti',    vram: 8,   bw: 448,   tier: 'entry' },
    { name: 'NVIDIA RTX 3060',       vram: 12,  bw: 360,   tier: 'entry' },
    // RTX 20 series
    { name: 'NVIDIA RTX 2080 Ti',    vram: 11,  bw: 616,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 2080 Super', vram: 8,   bw: 496,   tier: 'mid_range' },
    { name: 'NVIDIA RTX 2070 Super', vram: 8,   bw: 448,   tier: 'entry' },
    { name: 'NVIDIA RTX 2060 Super', vram: 8,   bw: 448,   tier: 'entry' },
    // GTX
    { name: 'NVIDIA GTX 1080 Ti',    vram: 11,  bw: 484,   tier: 'entry' },
    { name: 'NVIDIA GTX 1080',       vram: 8,   bw: 320,   tier: 'entry' },
    { name: 'NVIDIA GTX 1070',       vram: 8,   bw: 256.3, tier: 'entry' },
    // AMD
    { name: 'AMD RX 7900 XTX',       vram: 24,  bw: 960,   tier: 'high_end' },
    { name: 'AMD RX 7900 XT',        vram: 20,  bw: 800,   tier: 'high_end' },
    { name: 'AMD RX 7800 XT',        vram: 16,  bw: 624,   tier: 'mid_range' },
    { name: 'AMD RX 7700 XT',        vram: 12,  bw: 432,   tier: 'mid_range' },
    { name: 'AMD RX 6900 XT',        vram: 16,  bw: 512,   tier: 'mid_range' },
    { name: 'AMD RX 6800 XT',        vram: 16,  bw: 512,   tier: 'mid_range' },
    // Apple Silicon
    { name: 'Apple M4 Max',          vram: 48,  bw: 546,   tier: 'high_end' },
    { name: 'Apple M4 Pro',          vram: 24,  bw: 273,   tier: 'mid_range' },
    { name: 'Apple M3 Max',          vram: 48,  bw: 400,   tier: 'mid_range' },
    { name: 'Apple M3 Pro',          vram: 18,  bw: 150,   tier: 'entry' },
    { name: 'Apple M2 Max',          vram: 32,  bw: 400,   tier: 'mid_range' },
    { name: 'Apple M2 Pro',          vram: 16,  bw: 200,   tier: 'entry' },
    // CPU only
    { name: 'CPU only (no GPU)',      vram: 0,   bw: 0,     tier: 'cpu_only' }
  ];

  // Tier multipliers (match coordinator pricing.ex)
  var TIER_MULT = {
    enterprise: 2.0,
    high_end:   1.5,
    mid_range:  1.2,
    entry:      1.0,
    cpu_only:   0.5
  };

  var TIER_COLORS = {
    enterprise: { bar: 'rgba(168, 85, 247, 0.8)',  glow: 'rgba(168, 85, 247, 0.3)' },
    high_end:   { bar: 'rgba(13, 148, 136, 0.8)',   glow: 'rgba(13, 148, 136, 0.3)' },
    mid_range:  { bar: 'rgba(59, 130, 246, 0.8)',   glow: 'rgba(59, 130, 246, 0.3)' },
    entry:      { bar: 'rgba(156, 163, 175, 0.6)',  glow: 'rgba(156, 163, 175, 0.2)' },
    cpu_only:   { bar: 'rgba(107, 114, 128, 0.4)',  glow: 'rgba(107, 114, 128, 0.1)' }
  };

  var TIER_LABELS = {
    enterprise: 'Enterprise',
    high_end: 'High-End',
    mid_range: 'Mid-Range',
    entry: 'Entry',
    cpu_only: 'CPU'
  };

  // Reference workloads
  var WORKLOADS = [
    { name: 'LLM Chat (7B)',      minVram: 6,  modelGb: 4.5,  basePrice: 1.0,  type: 'llm' },
    { name: 'LLM Chat (13B)',     minVram: 10, modelGb: 8.0,  basePrice: 2.0,  type: 'llm' },
    { name: 'LLM Chat (70B)',     minVram: 40, modelGb: 40.0, basePrice: 8.0,  type: 'llm' },
    { name: 'Image Generation',   minVram: 8,  modelGb: 3.0,  basePrice: 3.0,  type: 'container' },
    { name: 'WASM Task',          minVram: 0,  modelGb: 0,    basePrice: 0.5,  type: 'wasm' }
  ];

  var PLATFORM_FEE = 0.20;
  var CREDIT_VALUE = 0.01; // $0.01 per credit (beta)
  var UTILIZATION = 0.15; // 15% of online time is actual job execution

  // Calculate best earnings for a GPU at given hours
  function calcBestEarnings(gpu, hoursPerDay) {
    var mult = TIER_MULT[gpu.tier] || 1.0;
    var bestDaily = 0;
    var bestWl = '';

    WORKLOADS.forEach(function (wl) {
      var canRun = gpu.vram >= wl.minVram;
      if (!canRun) return;

      var creditsPerHour = 0;
      if (wl.type === 'llm' && gpu.bw > 0) {
        var efficiency = 0.55;
        var modeFactor = gpu.vram >= (wl.modelGb * 1.2) ? 1.0 : 0.5;
        var tokS = Math.round(gpu.bw / wl.modelGb * efficiency * modeFactor);
        var secsPerJob = (200 / Math.max(tokS, 1)) + 2;
        var jobsPerHour = Math.round(Math.floor(3600 / secsPerJob) * UTILIZATION);
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      } else if (wl.type === 'container') {
        var jobsPerHour = Math.round(120 * UTILIZATION);
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      } else if (wl.type === 'wasm') {
        var jobsPerHour = Math.round(300 * UTILIZATION);
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      }

      var daily = creditsPerHour * hoursPerDay;
      if (daily > bestDaily) { bestDaily = daily; bestWl = wl.name; }
    });

    return { daily: Math.round(bestDaily), monthly: Math.round(bestDaily * 30), bestCargo: bestWl };
  }

  // Populate GPU selector
  var select = document.getElementById('calc-gpu');
  GPU_DB.forEach(function (gpu) {
    var opt = document.createElement('option');
    opt.value = gpu.name;
    opt.textContent = gpu.name + (gpu.vram > 0 ? ' (' + gpu.vram + ' GB)' : '');
    select.appendChild(opt);
  });

  // Hours slider
  var hoursSlider = document.getElementById('calc-hours');
  var hoursValue = document.getElementById('calc-hours-value');
  hoursSlider.addEventListener('input', function () {
    hoursValue.textContent = hoursSlider.value + 'h';
    updateComparison();
    // If a GPU is selected, also update its detail view
    if (select.value) triggerCalc();
  });

  // Draw the comparison bar chart
  function drawComparisonChart(gpuData, selectedName) {
    var canvas = document.getElementById('calc-comparison-chart');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var wrapper = canvas.parentElement;
    var W = wrapper.clientWidth || wrapper.offsetWidth || 800;
    var H = wrapper.clientHeight || wrapper.offsetHeight || 320;
    if (W < 10 || H < 10) { W = 800; H = 320; }
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var isDark = !document.documentElement.classList.contains('light');

    // Margins
    var ml = 60, mr = 20, mt = 30, mb = 14;
    var chartW = W - ml - mr, chartH = H - mt - mb;

    ctx.clearRect(0, 0, W, H);

    if (gpuData.length === 0) return;

    var maxVal = Math.max.apply(null, gpuData.map(function (d) { return d.monthly; }));
    if (maxVal === 0) maxVal = 1;

    // Y-axis gridlines
    var ySteps = 5;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    for (var i = 0; i <= ySteps; i++) {
      var y = mt + chartH - (i / ySteps) * chartH;
      var val = Math.round(maxVal * i / ySteps);
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(ml, y); ctx.lineTo(ml + chartW, y); ctx.stroke();
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
      ctx.fillText(val.toLocaleString(), ml - 8, y);
    }

    // Y-axis label
    ctx.save();
    ctx.translate(14, mt + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    ctx.fillText('credits / month', 0, 0);
    ctx.restore();

    // Bars
    var n = gpuData.length;
    var barGap = Math.max(1, Math.min(3, chartW / n * 0.15));
    var barW = Math.max(2, (chartW - barGap * (n - 1)) / n);

    // Find sweet spot: best earnings-per-VRAM ratio among mid_range/high_end
    var bestEfficiency = 0, sweetSpotIdx = -1;
    gpuData.forEach(function (d, i) {
      if (d.vram > 0 && (d.tier === 'mid_range' || d.tier === 'high_end')) {
        var eff = d.monthly / d.vram;
        if (eff > bestEfficiency) { bestEfficiency = eff; sweetSpotIdx = i; }
      }
    });

    gpuData.forEach(function (d, i) {
      var x = ml + i * (barW + barGap);
      var barH = (d.monthly / maxVal) * chartH;
      var y = mt + chartH - barH;

      var colors = TIER_COLORS[d.tier] || TIER_COLORS.entry;
      var isSelected = d.name === selectedName;
      var isSweet = i === sweetSpotIdx;

      // Glow for sweet spot
      if (isSweet) {
        ctx.shadowColor = 'rgba(13, 148, 136, 0.6)';
        ctx.shadowBlur = 12;
      }

      // Bar
      ctx.fillStyle = isSelected ? 'rgba(13, 148, 136, 1)' : colors.bar;
      ctx.beginPath();
      var r = Math.min(3, barW / 2);
      ctx.moveTo(x, y + r);
      ctx.arcTo(x, y, x + barW, y, r);
      ctx.arcTo(x + barW, y, x + barW, y + barH, r);
      ctx.lineTo(x + barW, mt + chartH);
      ctx.lineTo(x, mt + chartH);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Sweet spot marker
      if (isSweet && barH > 20) {
        ctx.fillStyle = isDark ? '#fff' : '#000';
        ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('\u2605', x + barW / 2, y - 6);
      }

      // Selected marker
      if (isSelected) {
        ctx.fillStyle = 'rgba(13, 148, 136, 1)';
        ctx.beginPath();
        ctx.arc(x + barW / 2, mt + chartH + 7, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Legend
    var legendX = ml;
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    var tiers = ['enterprise', 'high_end', 'mid_range', 'entry'];
    tiers.forEach(function (t) {
      ctx.fillStyle = TIER_COLORS[t].bar;
      ctx.fillRect(legendX, 8, 10, 10);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
      ctx.fillText(TIER_LABELS[t], legendX + 14, 13);
      legendX += ctx.measureText(TIER_LABELS[t]).width + 28;
    });

    // Sweet spot label
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    ctx.fillText('\u2605 = best credits/VRAM ratio', legendX, 13);
  }

  // Build and update the full GPU comparison table + chart
  function updateComparison() {
    var hours = parseInt(hoursSlider.value, 10);
    var compHoursEl = document.getElementById('comp-hours');
    if (compHoursEl) compHoursEl.textContent = hours;

    // Calculate earnings for all GPUs
    var data = GPU_DB.map(function (gpu) {
      var result = calcBestEarnings(gpu, hours);
      return {
        name: gpu.name,
        tier: gpu.tier,
        vram: gpu.vram,
        monthly: result.monthly,
        bestCargo: result.bestCargo,
        usd: (result.monthly * CREDIT_VALUE).toFixed(2)
      };
    });

    // Sort by monthly earnings descending
    data.sort(function (a, b) { return b.monthly - a.monthly; });

    // Find sweet spot (best credits/VRAM for mid/high tier)
    var bestEff = 0, sweetName = '';
    data.forEach(function (d) {
      if (d.vram > 0 && (d.tier === 'mid_range' || d.tier === 'high_end')) {
        var eff = d.monthly / d.vram;
        if (eff > bestEff) { bestEff = eff; sweetName = d.name; }
      }
    });

    // Build table
    var html = '';
    data.forEach(function (d) {
      var isSweet = d.name === sweetName;
      html += '<tr class="' + (isSweet ? 'calc-highlight' : '') + '">';
      html += '<td>' + d.name + (isSweet ? ' <span style="color:var(--accent);">\u2605</span>' : '') + '</td>';
      html += '<td><span class="calc-badge calc-badge-' + (d.tier === 'enterprise' ? 'perfect' : d.tier === 'high_end' ? 'good' : 'tight') + '">' + TIER_LABELS[d.tier] + '</span></td>';
      html += '<td>' + (d.vram > 0 ? d.vram + ' GB' : '&mdash;') + '</td>';
      html += '<td>' + (d.bestCargo || '&mdash;') + '</td>';
      html += '<td style="text-align:right; font-weight:500;">' + d.monthly.toLocaleString() + '</td>';
      html += '<td style="text-align:right;">$' + d.usd + '</td>';
      html += '</tr>';
    });
    document.getElementById('calc-comparison-body').innerHTML = html;

    // Draw chart
    drawComparisonChart(data, select.value);
  }

  // Per-GPU detail calculation
  function triggerCalc() {
    var gpuName = select.value;
    if (!gpuName) return;

    var gpu = GPU_DB.find(function (g) { return g.name === gpuName; });
    if (!gpu) return;

    var hoursPerDay = parseInt(hoursSlider.value, 10);
    var mult = TIER_MULT[gpu.tier] || 1.0;

    var html = '';
    var bestDaily = 0;

    WORKLOADS.forEach(function (wl) {
      var canRun = gpu.vram >= wl.minVram;
      var tokS = 0;
      var throughputLabel = '';
      var fitLevel = '';
      var creditsPerHour = 0;

      if (canRun && wl.type === 'llm' && gpu.bw > 0) {
        var efficiency = 0.55;
        var modeFactor = gpu.vram >= (wl.modelGb * 1.2) ? 1.0 : 0.5;
        tokS = Math.round(gpu.bw / wl.modelGb * efficiency * modeFactor);
        throughputLabel = tokS + ' tok/s';
        fitLevel = modeFactor === 1.0 ? 'Perfect' : 'Good';
        var secsPerJob = (200 / Math.max(tokS, 1)) + 2;
        var maxJobsPerHour = Math.floor(3600 / secsPerJob);
        var jobsPerHour = Math.round(maxJobsPerHour * UTILIZATION);
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      } else if (canRun && wl.type === 'container') {
        var maxPerHour = 120;
        var jobsPerHour = Math.round(maxPerHour * UTILIZATION);
        throughputLabel = jobsPerHour + ' jobs/hr';
        fitLevel = gpu.vram >= wl.minVram * 1.5 ? 'Perfect' : 'Good';
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      } else if (canRun && wl.type === 'wasm') {
        var maxPerHour = 300;
        var jobsPerHour = Math.round(maxPerHour * UTILIZATION);
        throughputLabel = jobsPerHour + ' jobs/hr';
        fitLevel = 'Perfect';
        creditsPerHour = jobsPerHour * wl.basePrice * mult * (1 - PLATFORM_FEE);
      }

      var thisDaily = canRun ? (creditsPerHour * hoursPerDay) : 0;
      if (thisDaily > bestDaily) bestDaily = thisDaily;

      html += '<tr class="' + (canRun ? '' : 'calc-disabled') + '">';
      html += '<td>' + wl.name + '</td>';
      html += '<td>';
      if (!canRun) {
        html += '<span class="calc-badge calc-badge-tight">Needs ' + wl.minVram + ' GB</span>';
      } else {
        html += '<span class="calc-badge calc-badge-' + fitLevel.toLowerCase() + '">' + fitLevel + '</span>';
      }
      html += '</td>';
      html += '<td>' + (canRun ? throughputLabel : '&mdash;') + '</td>';
      html += '<td>' + (canRun ? Math.round(creditsPerHour).toLocaleString() + ' cr/hr' : '&mdash;') + '</td>';
      html += '</tr>';
    });

    var dailyCredits = Math.round(bestDaily);
    var monthlyCredits = dailyCredits * 30;
    var monthlyUsd = (monthlyCredits * CREDIT_VALUE).toFixed(2);

    document.getElementById('calc-daily').textContent = dailyCredits.toLocaleString();
    document.getElementById('calc-monthly').textContent = monthlyCredits.toLocaleString();
    document.getElementById('calc-usd').textContent = '$' + monthlyUsd;
    document.getElementById('calc-tier').textContent = gpu.tier.replace(/_/g, ' ');
    document.getElementById('calc-mult').textContent = mult + 'x';

    document.getElementById('calc-table-body').innerHTML = html;
    var resultsEl = document.getElementById('calc-results');
    resultsEl.classList.remove('calc-results-hidden');
    resultsEl.style.display = 'block';

    // Update comparison chart to highlight selected GPU
    updateComparison();
  }

  // Calculate button
  var btn = document.getElementById('calc-btn');
  btn.addEventListener('click', function () {
    triggerCalc();
    document.getElementById('calc-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Auto-calculate when GPU selection changes
  select.addEventListener('change', function () {
    if (select.value) triggerCalc();
  });

  // Initialize comparison table and chart on page load
  // Use rAF to ensure CSS layout is computed before reading dimensions
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      updateComparison();
    });
  });

  // Re-render chart on resize and theme change
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateComparison, 150);
  });
  var obs = new MutationObserver(function () { updateComparison(); });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
