// Fetch live network stats from the coordinator API and populate the status strip.
// Fails silently — the strip shows placeholder dashes if the API is unreachable.
(function () {
  'use strict';

  var API_URL = 'https://app.archipelag.io/api/v1/network/stats';
  var REFRESH_MS = 30000; // 30 seconds

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function update(data) {
    var islands = document.getElementById('stat-islands');
    var regions = document.getElementById('stat-regions');
    var jobs = document.getElementById('stat-jobs');

    if (islands) islands.textContent = formatNumber(data.online_islands);
    if (regions) regions.textContent = data.regions || '—';
    if (jobs) jobs.textContent = formatNumber(data.jobs_completed);

    // Show the strip once we have data
    var strip = document.getElementById('network-status');
    if (strip) strip.removeAttribute('hidden');
  }

  function fetchStats() {
    fetch(API_URL)
      .then(function (r) { return r.json(); })
      .then(update)
      .catch(function () { /* silent — strip stays hidden or shows dashes */ });
  }

  // Initial fetch + periodic refresh
  if (document.getElementById('network-status')) {
    fetchStats();
    setInterval(fetchStats, REFRESH_MS);
  }
})();
