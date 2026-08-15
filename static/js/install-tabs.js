// Install tabs: OS detection + tab switching
(function () {
  var buttons = document.querySelectorAll("[data-install-tab]");
  var panels = document.querySelectorAll("[data-install-panel]");

  if (!buttons.length) return;

  function activate(tab) {
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-install-tab") === tab;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-install-panel") !== tab;
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activate(btn.getAttribute("data-install-tab"));
    });
    btn.addEventListener("keydown", function (event) {
      var current = Array.prototype.indexOf.call(buttons, btn);
      var next = current;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % buttons.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;

      event.preventDefault();
      var target = buttons[next];
      activate(target.getAttribute("data-install-tab"));
      target.focus();
    });
  });

  activate(document.querySelector('[data-install-tab][aria-selected="true"]')?.getAttribute("data-install-tab") || buttons[0].getAttribute("data-install-tab"));

  // Auto-detect OS and select the right tab
  var ua = navigator.userAgent || navigator.platform || "";
  if (/Win/.test(ua)) {
    activate("windows");
  }
})();
