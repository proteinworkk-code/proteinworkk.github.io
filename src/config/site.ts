/**
 * Central brand facts and environment-driven settings.
 * Wording here follows the "consistent fact set" in the content pack (Part 2) and is reused
 * by pages, JSON-LD and llms.txt so facts never drift.
 */

/** Canonical origin without trailing slash. Set via PUBLIC_SITE_URL (see astro.config.mjs). */
export const SITE_URL: string = String(import.meta.env.SITE).replace(/\/+$/, '');

/** Absolute URL for a site path such as "/contact/". */
export const abs = (path: string): string => `${SITE_URL}${path}`;

export const BRAND = {
  name: 'Proteinworkk',
  tagline: 'Strength within reach.',
  email: 'contact@proteinworkk.com',
  locality: 'Bengaluru',
  region: 'Karnataka',
  country: 'India',
  countryCode: 'IN',
  /** Approved one-sentence description (also used for Organization JSON-LD). */
  description:
    'Proteinworkk is an online fitness coaching and nutrition support brand based in Bengaluru, Karnataka, India.',
  philosophy: 'Our philosophy is to make fitness accessible to everyone.',
  delivery: 'All training is delivered online.',
  lastUpdated: 'October 2026',
  /** ISO date used for sitemap <lastmod>. Change only when page content genuinely changes. */
  lastModified: '2026-10-19',
  logoPath: '/images/logo-h512.png',
  ogImagePath: '/images/og-default.png',
  ogImageAlt: 'Proteinworkk logo with the tagline Strength within reach.',
} as const;

export const MEDICAL_DISCLAIMER =
  'Proteinworkk provides fitness coaching and nutrition education. It does not provide medical advice, diagnosis or treatment. Consult a qualified healthcare professional before starting any exercise or nutrition program.';

export const SHORT_MEDICAL_NOTE =
  'Proteinworkk is a fitness coaching service. We do not diagnose conditions or provide medical treatment. Please speak to your doctor before starting a new program if you have a health concern.';

/** Enquiry form endpoint (e.g. Formspree). Empty string = form not connected yet. */
export const FORM_ENDPOINT: string = String(import.meta.env.PUBLIC_FORM_ENDPOINT ?? '').trim();

/** GA4 ID is only accepted if it looks real; otherwise analytics stays completely off. */
export const GA4_ID: string = (() => {
  const v = String(import.meta.env.PUBLIC_GA4_ID ?? '').trim();
  return /^G-[A-Z0-9]{4,}$/.test(v) ? v : '';
})();

/**
 * Contact methods the business has CONFIRMED it can support. Only email is confirmed.
 * Add 'Phone call' and/or 'WhatsApp' here once the business confirms (and add the numbers
 * to the contact page deliberately).
 */
export const CONTACT_METHODS: string[] = ['Email'];

/** Social profile URLs. Leave empty until real profiles exist: nothing is rendered for empty values. */
export const SOCIAL_LINKS: { label: string; href: string }[] = [];
