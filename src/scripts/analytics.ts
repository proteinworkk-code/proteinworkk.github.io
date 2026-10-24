/**
 * Privacy-safe event helper. It does nothing unless a real GA4 ID was configured
 * (the layout only loads gtag.js when PUBLIC_GA4_ID is valid).
 * Events never contain names, emails, phone numbers or message text.
 */
type Params = Record<string, string | number>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    pwTrack?: (name: string, params?: Params) => void;
  }
}

window.pwTrack = (name, params = {}) => {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
};

document.addEventListener('click', (e) => {
  const link = (e.target as Element | null)?.closest?.('a');
  if (!link) return;
  const href = link.getAttribute('href') ?? '';
  const location = link.dataset.ctaLocation ?? '';

  if (href.startsWith('mailto:')) {
    // Deliberately no address in the event.
    window.pwTrack?.('email_click', { link_location: location });
  }

  if (link.dataset.cta === 'primary') {
    window.pwTrack?.('cta_click', {
      cta_text: (link.textContent ?? '').trim().slice(0, 80),
      cta_location: location,
      link_path: href.split('#')[0].split('?')[0],
    });
  }

  try {
    const program = new URL(href, window.location.origin).searchParams.get('program');
    if (program) window.pwTrack?.('program_enquiry_click', { program });
  } catch {
    /* ignore malformed URLs */
  }
});

export {};
