// Shared by every page: dark/light theme, header menus, header background while scrolling,
// back-to-top, the small "toast" message, and the spam-protected e-mail links.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, home = document.body.classList.contains('home');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
    off: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
    on: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>' };
  const AB = window.AB = window.AB || {};
  AB.ICON = ICON;

  // ---------- small message at the bottom of the screen ----------
  const toastEl = $('#toast'); let toastT = null;
  AB.toast = m => { if (!toastEl) return; toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2400); };

  // ---------- theme: follows the device until the visitor chooses (the choice is remembered) ----------
  let theme = root.dataset.theme === 'light' ? 'light' : 'dark';
  function applyTheme(t, save) {
    theme = t; root.dataset.theme = t;
    $$('.thm').forEach(b => { b.innerHTML = t === 'dark' ? ICON.sun : ICON.moon; b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); });
    if (save) { try { localStorage.setItem('ab-theme', t); } catch (e) {} }
    document.dispatchEvent(new CustomEvent('ab:theme', { detail: t }));
  }
  AB.theme = () => theme;
  $$('.thm').forEach(b => b.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark', true)));
  applyTheme(theme, false);

  // ---------- menus ----------
  // WRITING dropdown: hover opens it on computers; click / tap / Enter toggles it; leaving it, Esc or clicking elsewhere closes it
  const dd = $('.dd'), ddb = $('.ddb'), canHover = matchMedia('(hover: hover)').matches; let ddT = null;
  function ddSet(o) { clearTimeout(ddT); dd.classList.toggle('open', o); ddb.setAttribute('aria-expanded', o); }
  ddb.addEventListener('click', e => { if (canHover && e.detail > 0) ddSet(true); else ddSet(!dd.classList.contains('open')); });
  if (canHover) { dd.addEventListener('mouseenter', () => ddSet(true)); dd.addEventListener('mouseleave', () => { ddT = setTimeout(() => ddSet(false), 200); }); }
  dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) ddSet(false); });
  // phone menu: the ☰ button opens it; WRITING opens a small side panel
  const drop = $('#drop'), burger = $('#burger'), msub = $('.msub'), msb = $('.msb');
  function mSet(o) { msub.classList.toggle('open', o); msb.setAttribute('aria-expanded', o); }
  function closeMenus() { ddSet(false); mSet(false); drop.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
  AB.closeMenus = closeMenus;
  burger.addEventListener('click', () => { const o = drop.classList.toggle('open'); burger.setAttribute('aria-expanded', o); if (!o) mSet(false); });
  msb.addEventListener('click', () => mSet(!msub.classList.contains('open')));
  document.addEventListener('click', e => {
    if (!dd.contains(e.target)) ddSet(false);
    if (!msub.contains(e.target)) mSet(false);
    if (drop.classList.contains('open') && !drop.contains(e.target) && !burger.contains(e.target)) { drop.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { const inDd = dd.contains(document.activeElement), inDrop = drop.contains(document.activeElement); closeMenus(); if (inDd) ddb.focus(); else if (inDrop) burger.focus(); } });
  $$('#drop a').forEach(a => a.addEventListener('click', () => { drop.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  // ---------- header gets a solid background once the page scrolls (the home page manages its own) ----------
  if (!home) { const hd = $('#hd'), on = () => hd.classList.toggle('solid', scrollY > 8); addEventListener('scroll', on, { passive: true }); on(); }

  // ---------- back to top ----------
  $$('.tt').forEach(b => b.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })));

  // ---------- e-mail links ----------
  // The page source never contains the addresses (spam robots read the source to collect them). Each link holds its address
  // backwards and without the "@": data-u = name, data-d = domain. Here it is put back together for people.
  $$('a[data-u][data-d]').forEach(a => {
    const rev = s => s.split('').reverse().join(''), addr = rev(a.dataset.u) + '@' + rev(a.dataset.d);
    a.href = 'mailto:' + addr; a.textContent = addr;
  });
})();
