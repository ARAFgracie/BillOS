/* ============================================================
   BillOS — Shared Desktop Nav Drawer
   Injects an off-canvas sidebar (closed by default) plus a fixed
   ⋮ trigger button on every page that loads this script. Opening
   the drawer never shifts or resizes the page — it floats on top
   with a backdrop, so it can't overlap or fight per-page CSS.
   Existing mobile bottom navigation remains untouched.
   ============================================================ */

(function () {
  "use strict";

  const navItems = [
    { icon: "⌂", label: "Dashboard", href: "dashboard.html" },
    { icon: "▣", label: "Billing", href: "billing.html" },
    { icon: "▤", label: "Inventory", href: "inventory.html" },
    { icon: "🧾", label: "Bills", href: "bills.html" },
    { icon: "📊", label: "Analytics", href: "analytics.html" },
    { icon: "▥", label: "Reports", href: "reports.html" }
  ];

  function getCurrentPage() {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  let sidebarEl, backdropEl, toggleEl;

  function openDrawer() {
    sidebarEl.classList.add("open");
    backdropEl.classList.add("open");
  }

  function closeDrawer() {
    sidebarEl.classList.remove("open");
    backdropEl.classList.remove("open");
  }

  function toggleDrawer() {
    if (sidebarEl.classList.contains("open")) closeDrawer();
    else openDrawer();
  }

  function createSidebar() {
    if (document.querySelector(".app-sidebar")) return;

    const currentPage = getCurrentPage();

    // Fixed trigger button — always visible on desktop, opens/closes the drawer
    toggleEl = document.createElement("button");
    toggleEl.type = "button";
    toggleEl.className = "app-sidebar-toggle";
    toggleEl.setAttribute("aria-label", "Open navigation");
    toggleEl.innerHTML = "⋮";
    toggleEl.addEventListener("click", toggleDrawer);

    // Backdrop — click anywhere outside the drawer to close it
    backdropEl = document.createElement("div");
    backdropEl.className = "app-sidebar-backdrop";
    backdropEl.addEventListener("click", closeDrawer);

    // The drawer itself
    sidebarEl = document.createElement("aside");
    sidebarEl.className = "app-sidebar";
    sidebarEl.innerHTML = `
      <div class="app-sidebar-brand">
        <div class="app-sidebar-logo">B</div>
        <div class="app-sidebar-brand-name">BillOS</div>
        <button type="button" class="app-sidebar-collapse-btn" id="sidebarCloseBtn" aria-label="Close navigation">«</button>
      </div>

      <nav class="app-sidebar-nav">
        ${navItems.map(item => `
          <a
            class="app-sidebar-link ${currentPage === item.href ? "active" : ""}"
            href="${item.href}"
          >
            <span class="app-sidebar-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join("")}
      </nav>

      <div class="app-sidebar-logout" id="sidebarLogout">
        <span class="app-sidebar-icon">↪</span>
        <span>Logout</span>
      </div>
    `;

    document.body.prepend(backdropEl);
    document.body.prepend(sidebarEl);
    document.body.prepend(toggleEl);

    const closeBtn = sidebarEl.querySelector("#sidebarCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    const logout = sidebarEl.querySelector("#sidebarLogout");
    if (logout) logout.addEventListener("click", handleLogout);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  function handleLogout() {
    /*
      Keep this compatible with the existing authentication
      implementation. If the project already has a logout
      function, use it.
    */
    if (typeof window.logout === "function") {
      window.logout();
      return;
    }
    if (typeof window.signOut === "function") {
      window.signOut();
      return;
    }
    if (window.sb && window.sb.auth && typeof window.sb.auth.signOut === "function") {
      window.sb.auth.signOut().finally(() => {
        window.location.href = "index.html";
      });
      return;
    }
    window.location.href = "index.html";
  }

  function init() {
    createSidebar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
