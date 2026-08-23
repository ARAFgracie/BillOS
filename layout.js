/* ============================================================
   BillOS — Shared Desktop Layout Injection
   Injects a left sidebar (visible only on wide screens, styled
   by layout.css) as the first element in <body>. No existing
   page markup needs to change for this to work.

   Sidebar is collapsible: collapses after nav-link click,
   expands via the ⋮ toggle button. State persisted in
   localStorage under key "billos-sidebar-state".
   ============================================================ */

(function () {
  const NAV_ITEMS = [
    { file: 'dashboard.html', icon: '🏠', label: 'Dashboard' },
    { file: 'billing.html',   icon: '🛒', label: 'Billing' },
    { file: 'inventory.html', icon: '📦', label: 'Inventory' },
    { file: 'bills.html',     icon: '🧾', label: 'Bills' },
    { file: 'analytics.html', icon: '📊', label: 'Analytics' },
    { file: 'reports.html',   icon: '📈', label: 'Reports' },
  ];

  // Login/demo pages don't get the app sidebar — they aren't "inside" the app yet.
  const PAGES_WITHOUT_SIDEBAR = ['', 'index.html', 'login.html', 'demo.html'];
  const STORAGE_KEY = 'billos-sidebar-state';

  function currentPageFile() {
    return window.location.pathname.split('/').pop();
  }

  function isCollapsed() {
    return localStorage.getItem(STORAGE_KEY) === 'collapsed';
  }

  function setCollapsed(collapsed) {
    localStorage.setItem(STORAGE_KEY, collapsed ? 'collapsed' : 'expanded');
    const sidebar = document.querySelector('.app-sidebar');
    if (sidebar) {
      if (collapsed) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
      } else {
        sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
      }
    }
  }

  function collapseSidebar() {
    setCollapsed(true);
  }

  function expandSidebar() {
    setCollapsed(false);
  }

  function buildSidebar() {
    const current = currentPageFile();
    if (PAGES_WITHOUT_SIDEBAR.includes(current)) return;

    const linksHtml = NAV_ITEMS.map(item => `
      <a href="${item.file}" class="app-sidebar-link${item.file === current ? ' active' : ''}">
        <span class="app-sidebar-icon">${item.icon}</span>${item.label}
      </a>
    `).join('');

    const sidebar = document.createElement('div');
    sidebar.className = 'app-sidebar glass';
    sidebar.innerHTML = `
      <div class="app-sidebar-brand">
        <div class="app-sidebar-logo">B</div>
        <div class="app-sidebar-brand-name">BillOS</div>
      </div>
      <nav class="app-sidebar-nav">${linksHtml}</nav>
      <div class="app-sidebar-logout" onclick="window.__billosSidebarLogout()">⏻ Logout</div>
    `;
    document.body.prepend(sidebar);

    // Toggle button (⋮) — fixed on left edge when sidebar is collapsed
    const toggle = document.createElement('button');
    toggle.className = 'app-sidebar-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open sidebar');
    toggle.textContent = '⋮';
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      expandSidebar();
    });
    document.body.appendChild(toggle);

    // Collapse after any nav link is clicked (even same-page)
    sidebar.querySelectorAll('.app-sidebar-link').forEach(function (link) {
      link.addEventListener('click', function () {
        collapseSidebar();
      });
    });

    // Restore persisted state
    if (isCollapsed()) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
    }
  }

  // Reuses whatever Supabase client each page already created (every page
  // declares `const sb = createClient(...)`; top-level const/let is shared
  // across script tags in the same document, so this resolves at click time).
  window.__billosSidebarLogout = async function () {
    try {
      if (typeof sb !== 'undefined' && sb?.auth) {
        await sb.auth.signOut();
      }
    } finally {
      window.location.href = 'index.html';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSidebar);
  } else {
    buildSidebar();
  }
})();
