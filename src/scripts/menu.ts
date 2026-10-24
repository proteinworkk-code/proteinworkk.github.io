/**
 * Mobile navigation. Without JavaScript the menu simply stays open as a normal list
 * (the `js` class on <html> is what enables the collapsed behaviour).
 */
const header = document.querySelector<HTMLElement>('.site-header');
const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
const nav = document.getElementById('site-nav');

if (header && toggle && nav) {
  const desktop = window.matchMedia('(min-width: 1200px)');

  const setOpen = (open: boolean, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    header.dataset.open = open ? 'true' : 'false';
    if (!open && returnFocus) toggle.focus();
  };

  setOpen(false);

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link (also covers same-page anchors).
  nav.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
  });

  // Escape closes and returns focus to the toggle.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });

  // Clicking outside closes.
  document.addEventListener('click', (e) => {
    if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(e.target as Node)) setOpen(false);
  });

  // Reset when growing to the desktop layout.
  desktop.addEventListener('change', () => setOpen(false));
}
