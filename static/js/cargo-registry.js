// Cargo Registry — client-side search and filter
(function () {
  'use strict';

  var searchInput = document.getElementById('cargo-search');
  var formatBtns = document.querySelectorAll('[data-filter-format]');
  var categoryBtns = document.querySelectorAll('[data-filter-category]');
  var maintainerBtns = document.querySelectorAll('[data-filter-maintainer]');
  var rows = document.querySelectorAll('.cargo-row');
  var countEl = document.getElementById('cargo-count');
  var list = document.getElementById('cargo-grid');
  var emptyState = document.getElementById('cargo-empty');

  var activeFormat = 'all';
  var activeCategory = 'all';
  var activeMaintainer = 'all';
  var searchQuery = '';

  function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  }

  function filterRows() {
    var visible = 0;

    rows.forEach(function (row) {
      var format = row.dataset.format;
      var category = row.dataset.category;
      var maintainer = row.dataset.maintainer;
      var searchable = normalize(row.dataset.search || '');
      var query = normalize(searchQuery);

      var matchesFormat = activeFormat === 'all' || format === activeFormat;
      var matchesCategory = activeCategory === 'all' || category === activeCategory;
      var matchesMaintainer = activeMaintainer === 'all' || maintainer === activeMaintainer;
      var matchesSearch = !query || query.split(' ').every(function (term) {
        return term === '' || searchable.indexOf(term) !== -1;
      });

      if (matchesFormat && matchesCategory && matchesMaintainer && matchesSearch) {
        row.style.display = '';
        visible++;
      } else {
        row.style.display = 'none';
      }
    });

    countEl.textContent = visible;
    emptyState.style.display = visible === 0 ? '' : 'none';
    list.style.display = visible === 0 ? 'none' : '';
  }

  // Search
  searchInput.addEventListener('input', function () {
    searchQuery = this.value;
    filterRows();
  });

  // Format filter buttons
  formatBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeFormat = this.dataset.filterFormat;
      formatBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterRows();
    });
  });

  // Category filter buttons
  categoryBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeCategory = this.dataset.filterCategory;
      categoryBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterRows();
    });
  });

  // Maintainer filter buttons
  maintainerBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeMaintainer = this.dataset.filterMaintainer;
      maintainerBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterRows();
    });
  });

  // Keyboard shortcut: focus search with /
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      searchQuery = '';
      searchInput.blur();
      filterRows();
    }
  });
})();
