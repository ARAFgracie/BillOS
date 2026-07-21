/* ============================================================
   BillOS — Shared Theme Switcher Logic
   Runs immediately on load (before paint) to avoid a flash of
   the wrong theme, and wires up the theme-switcher dropdown
   that every page includes in its topbar.
   ============================================================ */

const THEME_STORAGE_KEY = 'billos-theme';

/* Add a new theme by: (1) adding a design-token + background
   block in theme.css for html[data-theme="value"], and
   (2) adding one entry here. */
const THEME_OPTIONS = [
  { value: 'light', label: 'White',        icon: '☀️', swatch: 'linear-gradient(135deg, #F0F3FF, #E2E6F5)' },
  { value: 'dark',  label: 'Dark Navy',    icon: '🌙', swatch: 'linear-gradient(135deg, #0B1120, #1E293B)' },
  { value: 'ash',   label: 'Ash Gradient', icon: '🌫️', swatch: 'linear-gradient(135deg, #18191A, #3A3B3C)' },
];

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const active = THEME_OPTIONS.find(o => o.value === theme) || THEME_OPTIONS[0];
    toggle.textContent = active.icon;
  }
  buildThemeMenu(theme);
}

function buildThemeMenu(activeTheme) {
  const menu = document.getElementById('theme-menu');
  if (!menu) return;
  menu.innerHTML = THEME_OPTIONS.map(opt => `
    <div class="theme-option ${opt.value === activeTheme ? 'active' : ''}" onclick="selectTheme('${opt.value}')">
      <div class="swatch" style="background:${opt.swatch}"></div>
      <span>${opt.icon} ${opt.label}</span>
    </div>
  `).join('');
}

function selectTheme(theme) {
  applyTheme(theme);
  const menu = document.getElementById('theme-menu');
  if (menu) menu.classList.remove('open');
}

function toggleThemeMenu() {
  const menu = document.getElementById('theme-menu');
  if (menu) menu.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const switcher = document.querySelector('.theme-switcher');
  const menu = document.getElementById('theme-menu');
  if (switcher && menu && !switcher.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// Apply immediately (script runs before body paint) to avoid theme flash.
applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');

// Re-sync the toggle icon + menu once the topbar markup actually exists,
// since this script runs in <head> before the body is parsed.
document.addEventListener('DOMContentLoaded', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current);
});
