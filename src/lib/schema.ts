/**
 * JSON-LD builders. Everything here reads from the same config and data as the visible pages,
 * so structured data and visible copy cannot drift apart.
 *
 * Deliberately NOT generated: LocalBusiness, Review, AggregateRating, telephone, street address,
 * sameAs, areaServed (service area is unconfirmed). Add them only when the facts are real and visible.
 */
import { BRAND, abs } from '../config/site';
import type { Crumb } from '../config/routes';
import type { Program } from '../data/programs';

export interface FaqItem {
  q: string;
  a: string;
}

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.name,
  url: abs('/'),
  logo: abs(BRAND.logoPath),
  email: BRAND.email,
  description: BRAND.description,
  address: {
    '@type': 'PostalAddress',
    addressLocality: BRAND.locality,
    addressRegion: BRAND.region,
    addressCountry: BRAND.countryCode,
  },
  slogan: BRAND.tagline,
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BRAND.name,
  url: abs('/'),
});

export const breadcrumbs = (items: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: abs(c.path),
  })),
});

export const faqPage = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const service = (opts: {
  program: Program;
  serviceType: string;
  description: string;
}) => {
  const { program, serviceType, description } = opts;
  const offers = program.offers.map((o) => ({
    '@type': 'Offer',
    name: o.name,
    price: String(o.amount),
    priceCurrency: 'INR',
    url: abs(program.href),
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: program.name,
    serviceType,
    description,
    provider: { '@type': 'Organization', name: BRAND.name, url: abs('/') },
    url: abs(program.href),
    // Offer markup only exists once a price is confirmed.
    ...(offers.length === 1 ? { offers: offers[0] } : {}),
    ...(offers.length > 1 ? { offers } : {}),
  };
};

export const contactPage = (path: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Contact ${BRAND.name}`,
  url: abs(path),
  description,
  about: { '@type': 'Organization', name: BRAND.name, url: abs('/'), email: BRAND.email },
});

export const aboutPage = (path: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `About ${BRAND.name}`,
  url: abs(path),
  description,
  about: { '@type': 'Organization', name: BRAND.name, url: abs('/') },
});
