// The static page remains usable if JavaScript is unavailable.
'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  if (menu && nav) {
    document.documentElement.classList.add('has-menu');
    menu.hidden = false;
    const closeMenu = () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.textContent = 'Menu';
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu(); menu.focus();
      }
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  }
  const openSection = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target?.tagName === 'DETAILS') target.open = true;
  };
  window.addEventListener('hashchange', openSection);
  openSection();
  if (typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(document.querySelector('main'), {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ], throwOnError: false
    });
  }
});
