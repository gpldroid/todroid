/* Web2App Studio Pro — shared static layout */
(function () {
  'use strict';

  const path = window.location.pathname.replace(/\\/g, '/');
  const inPages = path.includes('/pages/');
  const root = inPages ? '../../' : './';
  const current = path.split('/').filter(Boolean).pop() || 'index.html';

  const nav = [
    ['index.html','fa-wand-magic-sparkles','Studio Builder'],
    ['pages/apps/index.html','fa-cubes','My Apps'],
    ['pages/templates/index.html','fa-table-cells','Templates'],
    ['pages/features/index.html','fa-layer-group','Platform Features'],
    ['pages/docs/index.html','fa-book-open','Docs & FAQ']
  ];

  const legal = [
    ['pages/legal/privacy.html','Privacy Policy'],
    ['pages/legal/terms.html','Terms of Service'],
    ['pages/legal/cookies.html','Cookie Policy'],
    ['pages/legal/disclaimer.html','Disclaimer'],
    ['pages/legal/gdpr.html','GDPR Compliance']
  ];

  function isActive(href) {
    const target = href === 'index.html' ? 'index.html' : href.split('/').slice(-2).join('/');
    return path.endsWith(target) || (href === 'index.html' && (path.endsWith('/') || path.endsWith('/index.html')));
  }

  const header = document.querySelector('[data-shared-header]');
  if (header) {
    header.innerHTML = `
      <header class="site-header sticky top-0 z-40 border-b border-gray-800/80 glass-panel">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 flex items-center justify-between gap-4">
          <a href="${root}index.html" class="flex items-center gap-3 shrink-0" aria-label="Web2App Studio Pro home">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <i class="fa-solid fa-mobile-screen-button text-lg" aria-hidden="true"></i>
            </span>
            <span class="hidden sm:block">
              <span class="flex items-center gap-2">
                <span class="font-extrabold text-xl tracking-tight text-white">Web2App</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">STUDIO PRO v4.0</span>
              </span>
              <span class="block text-[10px] text-gray-400">Website to Native Android APK Compiler</span>
            </span>
          </a>
          <nav class="hidden lg:flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-xs font-bold" aria-label="Primary navigation">
            ${nav.map(([href,icon,label]) => `<a href="${root}${href}" class="px-3 py-2 rounded-lg transition-all ${isActive(href) ? 'text-white bg-brand-600 shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}"><i class="fa-solid ${icon} mr-1.5" aria-hidden="true"></i>${label}</a>`).join('')}
          </nav>
          <div class="flex items-center gap-2">
            <button type="button" class="theme-toggle inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-700 bg-gray-900/80 text-gray-200" data-theme-toggle aria-label="Switch to light mode" title="Switch to light mode"><i class="fa-solid fa-sun" aria-hidden="true"></i></button>\n            <a href="${root}index.html" class="hidden sm:inline-flex px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition">
              <i class="fa-solid fa-bolt mr-1.5" aria-hidden="true"></i> Quick Build
            </a>
            <button type="button" class="mobile-menu-button lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-700 bg-gray-900/80 text-gray-200" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-menu">
              <i class="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div id="mobile-menu" class="mobile-menu hidden lg:hidden border-t border-gray-800 bg-[#0d111b]/98 backdrop-blur-xl">
          <nav class="max-w-7xl mx-auto px-4 py-4 grid gap-1" aria-label="Mobile navigation">
            ${nav.map(([href,icon,label]) => `<a href="${root}${href}" class="mobile-nav-link ${isActive(href) ? 'active' : ''}"><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span></a>`).join('')}
            <a href="${root}index.html" class="mobile-nav-link"><i class="fa-solid fa-bolt" aria-hidden="true"></i><span>Quick Build APK</span></a>
          </nav>
        </div>
      </header>`;
  }

  const footer = document.querySelector('[data-shared-footer]');
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer border-t border-gray-800 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <div class="font-extrabold text-white">Web2App Studio Pro</div>
              <p class="mt-2 text-xs text-gray-500 max-w-sm">A browser-based toolkit for configuring website-to-Android app projects.</p>
            </div>
            <div><h2 class="text-xs font-bold uppercase tracking-wider text-gray-400">Navigation</h2><div class="mt-3 grid gap-2 text-xs">${nav.map(([href,,label])=>`<a href="${root}${href}" class="text-gray-500 hover:text-white transition">${label}</a>`).join('')}</div></div>
            <div><h2 class="text-xs font-bold uppercase tracking-wider text-gray-400">Legal</h2><div class="mt-3 grid gap-2 text-xs">${legal.map(([href,label])=>`<a href="${root}${href}" class="text-gray-500 hover:text-white transition">${label}</a>`).join('')}</div></div>
          </div>
          <div class="mt-8 pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-600">
            <span>© <span data-current-year></span> Web2App Studio Pro. All rights reserved.</span>
            <span class="flex gap-3"><a href="${root}pages/legal/privacy.html" class="hover:text-gray-400">Privacy</a><a href="${root}pages/legal/terms.html" class="hover:text-gray-400">Terms</a><a href="${root}pages/legal/cookies.html" class="hover:text-gray-400">Cookies</a></span>
          </div>
        </div>
      </footer>`;
  }

  const themeKey = 'web2app-theme';
  const applyTheme = (theme) => {
    const selected = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = selected;
    document.documentElement.classList.toggle('dark', selected === 'dark');
    document.documentElement.classList.toggle('light', selected === 'light');
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const light = selected === 'light';
      btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
      btn.title = light ? 'Switch to dark mode' : 'Switch to light mode';
      btn.innerHTML = '<i class="fa-solid ' + (light ? 'fa-moon' : 'fa-sun') + '" aria-hidden="true"></i>';
    });
  };
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(themeKey); } catch (e) {}
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(themeKey, next); } catch (e) {}
    applyTheme(next);
  }));
  window.addEventListener('storage', (event) => {
    if (event.key === themeKey) applyTheme(event.newValue === 'light' ? 'light' : 'dark');
  });

  document.querySelectorAll('[data-current-year]').forEach(el => el.textContent = new Date().getFullYear());

  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', open);
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
      menuButton.querySelector('i').className = open ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
    });
  }

  const consentKey = 'web2app-cookie-consent-v1';
  if (!localStorage.getItem(consentKey)) {
    const box = document.createElement('aside');
    box.id = 'cookie-consent';
    box.className = 'cookie-consent fixed inset-x-3 bottom-3 sm:left-auto sm:right-5 sm:max-w-md z-[100] glass-panel border border-gray-700 rounded-2xl p-4 shadow-2xl';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-labelledby','cookie-consent-title');
    box.innerHTML = `
      <div class="flex gap-3 items-start">
        <div class="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-300 flex items-center justify-center shrink-0"><i class="fa-solid fa-cookie-bite" aria-hidden="true"></i></div>
        <div class="min-w-0">
          <h2 id="cookie-consent-title" class="text-sm font-bold text-white">Cookies & local storage</h2>
          <p class="mt-1 text-xs leading-5 text-gray-400">We use essential browser storage to remember your preferences and saved projects. Optional third-party resources may set technical cookies.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" data-cookie-action="accept" class="cookie-btn primary">Accept</button>
            <button type="button" data-cookie-action="essential" class="cookie-btn secondary">Essential only</button>
            <a href="${root}pages/legal/cookies.html" class="cookie-btn link">Cookie Policy</a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(box);
    box.querySelectorAll('[data-cookie-action]').forEach(btn => btn.addEventListener('click', () => {
      localStorage.setItem(consentKey, btn.dataset.cookieAction);
      box.remove();
    }));
  }
})();