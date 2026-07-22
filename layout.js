/* ============================================================
   BillOS — Shared Desktop Layout Injection
   Injects a left sidebar (visible only on wide screens, styled
   by layout.css) as the first element in <body>. No existing
   page markup needs to change for this to work.
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

  function currentPageFile() {
    return window.location.pathname.split('/').pop();
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
