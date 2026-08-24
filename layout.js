/* ============================================================
   BillOS — Shared Desktop Sidebar
   Injects the desktop sidebar into every page that loads this
   script. Existing mobile bottom navigation remains untouched.
   ============================================================ */

(function () {
  "use strict";

  const SIDEBAR_STATE_KEY = "billos-sidebar-state";

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

  function createSidebar() {
    if (document.querySelector(".app-sidebar")) return;

    const sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";

    const currentPage = getCurrentPage();

    sidebar.innerHTML = `
      <div class="app-sidebar-brand">
        <div class="app-sidebar-logo">B</div>
        <div class="app-sidebar-brand-name">BillOS</div>
        <button type="button" class="app-sidebar-collapse-btn" id="sidebarCollapseBtn" aria-label="Collapse sidebar">«</button>
      </div>

      <nav class="app-sidebar-nav">
        ${navItems.map(item => `
          <a
            class="app-sidebar-link ${
              currentPage === item.href ? "active" : ""
            }"
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

    document.body.prepend(sidebar);

    createToggleButton();
    restoreSidebarState();

    const collapseBtn = document.getElementById("sidebarCollapseBtn");
    if (collapseBtn) {
      collapseBtn.addEventListener("click", toggleSidebar);
    }

    const logout = document.getElementById("sidebarLogout");

    if (logout) {
      logout.addEventListener("click", handleLogout);
    }
  }

  function createToggleButton() {
    if (document.querySelector(".app-sidebar-toggle")) return;

    const button = document.createElement("button");

    button.className = "app-sidebar-toggle";
    button.type = "button";
    button.setAttribute("aria-label", "Open sidebar");
    button.innerHTML = "☰";

    document.body.appendChild(button);

    button.addEventListener("click", toggleSidebar);
  }

  function toggleSidebar() {
    const sidebar = document.querySelector(".app-sidebar");

    if (!sidebar) return;

    const isCollapsed = document.body.classList.toggle(
      "sidebar-collapsed"
    );

    sidebar.classList.toggle("collapsed", isCollapsed);

    localStorage.setItem(
      SIDEBAR_STATE_KEY,
      isCollapsed ? "collapsed" : "open"
    );
  }

  function restoreSidebarState() {
    const sidebar = document.querySelector(".app-sidebar");

    if (!sidebar) return;

    const savedState = localStorage.getItem(
      SIDEBAR_STATE_KEY
    );

    if (savedState === "collapsed") {
      document.body.classList.add("sidebar-collapsed");
      sidebar.classList.add("collapsed");
    }
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

    /*
      Fallback: redirect to the login page.
      Change this only if the existing project uses another
      login route.
    */
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
