/* ui-features/dropdown.js — IIFE #7-8 (split из ui-features.js v1.1.31)
   dropdown closeAll на outside click, toggle .open, blur */


/* [7/8] Dropdown closeAll #1 — blur on outside click + touch toggle */
(function () {
  document.addEventListener("click", (e) => {
    const a = e.target.closest(".dropdown-menu a, .history-menu .history-list > div");
    if (a) {
      const dd = a.closest(".dropdown");
      if (dd) {
        const btn = dd.querySelector(":scope > .btn");
        if (btn) setTimeout(() => { btn.blur(); }, 30);
      }
    }
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown > .btn").forEach((b) => { b.blur(); });
    }
  }, true);
  document.querySelectorAll(".dropdown > .btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const dd = btn.parentElement;
      if (!dd) return;
      if (false) { /* DISABLED: toggle handled by IIFE [8/8] — avoided double-toggle on touch */
        document.querySelectorAll(".dropdown.open").forEach((other) => {
          if (other !== dd) other.classList.remove("open");
        });
        dd.classList.toggle("open");
      }
    });
  });
})();

/* [8/8] Dropdown closeAll #2 — preventDefault + closeAll + toggle + blur */
(function () {
  function closeAll(except) {
    document.querySelectorAll(".dropdown.open").forEach((d) => {
      if (d !== except) d.classList.remove("open");
    });
  }
  document.querySelectorAll(".dropdown > .btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dd = btn.closest(".dropdown");
      if (!dd) return;
      closeAll(dd);
      dd.classList.toggle("open");
      btn.blur();
    });
  });
  document.querySelectorAll(".dropdown-menu a").forEach((a) => {
    a.addEventListener("click", () => {
      const dd = a.closest(".dropdown");
      if (dd) {
        dd.classList.remove("open");
        const b = dd.querySelector(":scope > .btn");
        if (b) b.blur();
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) closeAll(null);
  });
})();

