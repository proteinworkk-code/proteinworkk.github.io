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

export const collectionPage = (path: string, name: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  url: abs(path),
  description,
  about: { '@type': 'Organization', name: BRAND.name, url: abs('/') },
});

export const blogPosting = (opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  authorName?: string;
  keywords?: string[];
  inLanguage?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: opts.headline,
  description: opts.description,
  url: abs(opts.path),
  mainEntityOfPage: { '@type': 'WebPage', '@id': abs(opts.path) },
  image: opts.image ? abs(opts.image) : abs(BRAND.ogImagePath),
  datePublished: opts.datePublished,
  dateModified: opts.dateModified,
  inLanguage: opts.inLanguage ?? 'en-IN',
  ...(opts.keywords && opts.keywords.length ? { keywords: opts.keywords.join(', ') } : {}),
  contentLocation: {
    '@type': 'Place',
    name: `${BRAND.locality}, ${BRAND.region}, ${BRAND.country}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.locality,
      addressRegion: BRAND.region,
      addressCountry: BRAND.countryCode,
    },
  },
  author: {
    '@type': 'Organization',
    name: opts.authorName ?? BRAND.name,
    url: abs('/'),
  },
  publisher: {
    '@type': 'Organization',
    name: BRAND.name,
    url: abs('/'),
    logo: {
      '@type': 'ImageObject',
      url: abs(BRAND.logoPath),
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND.locality,
      addressRegion: BRAND.region,
      addressCountry: BRAND.countryCode,
    },
  },
});

