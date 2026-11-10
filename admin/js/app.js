(() => {
  "use strict";
  const links = [...document.querySelectorAll("[data-view]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const title = document.getElementById("pageTitle");
  const welcome = document.getElementById("welcomePanel");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const scrim = document.getElementById("mobileScrim");

  const titles = {
    dashboard: "الرئيسية",
    content: "المحتوى والصفحات",
    sections: "الأقسام والواجهة",
    materials: "الملفات والمواد",
    education: "الهيكل التعليمي",
    analytics: "الإحصائيات والتقارير",
    storage: "التخزين والنسخ الاحتياطي",
    team: "المستخدمون والصلاحيات",
    security: "الأمان وسجل العمليات",
    settings: "الإعدادات العامة"
  };

  function closeMenu() {
    sidebar.classList.remove("open");
    scrim.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function showView(view, updateHash = true) {
    const selected = Object.hasOwn(titles, view) ? view : "dashboard";
    panels.forEach(panel => {
      panel.hidden = panel.dataset.panel !== selected;
    });
    links.forEach(link => {
      const active = link.dataset.view === selected;
      if (link.classList.contains("nav-link")) {
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    });
    title.textContent = titles[selected];
    welcome.hidden = selected !== "dashboard";
    if (updateHash && location.hash !== "#" + selected) {
      history.replaceState(null, "", "#" + selected);
    }
    closeMenu();
  }

  links.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showView(link.dataset.view);
    });
  });

  menuToggle.addEventListener("click", () => {
    const open = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", open);
    scrim.classList.toggle("show", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  scrim.addEventListener("click", closeMenu);
  window.addEventListener("hashchange", () => showView(location.hash.slice(1), false));
  window.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  showView(location.hash.slice(1) || "dashboard", false);
})();