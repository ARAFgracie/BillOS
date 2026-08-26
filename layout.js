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

  let sidebarEl, backdropEl, toggleEl, closeTimer;

  function openDrawer() {
    clearTimeout(closeTimer);
    sidebarEl.classList.add("open");
    backdropEl.classList.add("open");
  }

  function closeDrawer() {
    sidebarEl.classList.remove("open");
    backdropEl.classList.remove("open");
  }

  function scheduleClose() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeDrawer, 300);
  }

  function cancelScheduledClose() {
    clearTimeout(closeTimer);
  }

  function toggleDrawer() {
    if (sidebarEl.classList.contains("open")) closeDrawer();
    else openDrawer();
  }

  function createSidebar() {
    if (document.querySelector(".app-sidebar")) return;

    const currentPage = getCurrentPage();

    // Trigger button — mounted inside the page's own .brand (next to
    // the logo) so it's always a normal, correctly-spaced flex item
    // and can never float over / hide the logo like a fixed button would.
    toggleEl = document.createElement("button");
    toggleEl.type = "button";
    toggleEl.className = "app-sidebar-toggle";
    toggleEl.setAttribute("aria-label", "Open navigation");
    toggleEl.innerHTML = "⋮";

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

    // Mount the toggle inside .brand if present, otherwise fall back
    // to the topbar, otherwise fall back to a fixed corner button.
    const brand = document.querySelector(".topbar .brand") || document.querySelector(".brand");
    const topbar = document.querySelector(".topbar");
    if (brand) {
      brand.insertBefore(toggleEl, brand.firstChild);
    } else if (topbar) {
      topbar.insertBefore(toggleEl, topbar.firstChild);
    } else {
      document.body.prepend(toggleEl);
      toggleEl.style.position = "fixed";
      toggleEl.style.top = "18px";
      toggleEl.style.left = "16px";
      toggleEl.style.zIndex = "110";
    }

    // Click still works (touch devices, accessibility)
    toggleEl.addEventListener("click", toggleDrawer);

    // Hover the toggle or the open drawer to keep it open; moving the
    // mouse away from both auto-closes it after a short delay.
    toggleEl.addEventListener("mouseenter", openDrawer);
    toggleEl.addEventListener("mouseleave", scheduleClose);
    sidebarEl.addEventListener("mouseenter", cancelScheduledClose);
    sidebarEl.addEventListener("mouseleave", scheduleClose);

    const closeBtn = sidebarEl.querySelector("#sidebarCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    const logout = sidebarEl.querySelector("#sidebarLogout");
    if (logout) logout.addEventListener("click", handleLogout);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  async function handleLogout() {
    // Give the current page a chance to intercept (billing.html uses
    // this to offer holding an in-progress bill before signing out).
    if (typeof window.billosBeforeLogout === "function") {
      const shouldContinue = await window.billosBeforeLogout();
      if (!shouldContinue) return;
    }

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
