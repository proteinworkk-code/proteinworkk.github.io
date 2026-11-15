/**
 * Mobile navigation & dropdown menus. Without JavaScript the menu simply stays open as a normal list
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

  // Dropdown toggles
  const dropdownToggles = nav.querySelectorAll<HTMLButtonElement>('.nav__dropdown-toggle');
  dropdownToggles.forEach((btn) => {
    const parentItem = btn.closest<HTMLElement>('.nav__item--dropdown');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (parentItem) {
        parentItem.dataset.open = String(!isExpanded);
      }
    });
  });

  // Close after choosing a link (also covers same-page anchors).
  nav.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) {
      setOpen(false);
      dropdownToggles.forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
        const parentItem = btn.closest<HTMLElement>('.nav__item--dropdown');
        if (parentItem) parentItem.dataset.open = 'false';
      });
    }
  });

  // Escape closes and returns focus to the toggle / dropdown button.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      let closedDropdown = false;
      dropdownToggles.forEach((btn) => {
        if (btn.getAttribute('aria-expanded') === 'true') {
          btn.setAttribute('aria-expanded', 'false');
          const parentItem = btn.closest<HTMLElement>('.nav__item--dropdown');
          if (parentItem) parentItem.dataset.open = 'false';
          btn.focus();
          closedDropdown = true;
        }
      });
      if (!closedDropdown && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    }
  });

  // Clicking outside closes.
  document.addEventListener('click', (e) => {
    if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(e.target as Node)) {
      setOpen(false);
    }
    dropdownToggles.forEach((btn) => {
      const parentItem = btn.closest<HTMLElement>('.nav__item--dropdown');
      if (parentItem && !parentItem.contains(e.target as Node)) {
        btn.setAttribute('aria-expanded', 'false');
        parentItem.dataset.open = 'false';
      }
    });
  });

  // Reset when growing to the desktop layout.
  desktop.addEventListener('change', () => {
    setOpen(false);
    dropdownToggles.forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      const parentItem = btn.closest<HTMLElement>('.nav__item--dropdown');
      if (parentItem) parentItem.dataset.open = 'false';
    });
  });
}
