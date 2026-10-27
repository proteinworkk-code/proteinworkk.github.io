/**
 * One centralized route table. Paths, titles, descriptions, breadcrumb names, navigation labels
 * and sitemap flags all live here, so links, canonicals, sitemap entries, metadata and
 * structured data stay consistent. Paths match the content pack (Part 9) exactly.
 */
import { BRAND, abs } from './site';
import { programs, PRICES, GROUP_CAP } from '../data/programs';

export interface Route {
  path: string;
  /** Breadcrumb / link name */
  name: string;
  /** Short label for the main navigation (omit to keep out of the nav) */
  nav?: string;
  title: string;
  description: string;
  /** false = noindex and excluded from the sitemap */
  indexable: boolean;
}

const girl = programs['girl-power'];
const men = programs.mens;

export const ROUTES = {
  home: {
    path: '/',
    name: 'Home',
    nav: 'Home',
    title: 'Online Personal Training & Fitness Coaching | Proteinworkk',
    description: `Online personal training from ₹${PRICES.oneToOneSession.amount} a session and group training from ₹${PRICES.group.amount.toLocaleString('en-IN')} a month. Bengaluru-based coaching, small groups, nutrition support.`,
    indexable: true,
  },
  about: {
    path: '/about/',
    name: 'About Proteinworkk',
    nav: 'About',
    title: 'About Proteinworkk | Online Fitness Coaching from Bengaluru',
    description:
      'Proteinworkk is an online fitness coaching and nutrition support brand based in Bengaluru, Karnataka, India. See our programs, prices and how training works.',
    indexable: true,
  },
  oneToOne: {
    path: '/online-personal-training/',
    name: 'Online Personal Training',
    nav: 'One-to-One Training',
    title: 'Online Personal Training in India | Proteinworkk',
    description: `One-to-one online personal training from Bengaluru: a personal plan, trainer guidance and accountability. ${PRICES.oneToOneSession.label} or ${PRICES.oneToOneMonth.label}.`,
    indexable: true,
  },
  group: {
    path: '/online-group-training/',
    name: 'Online Group Training',
    nav: 'Group Training',
    title: 'Online Group Training Classes in India | Proteinworkk',
    description: `Trainer-guided online group workouts in groups of up to ${GROUP_CAP}. Structured strength and fitness training for ${PRICES.group.label}. Join Proteinworkk.`,
    indexable: true,
  },
  girlPower: {
    path: '/girl-power-womens-online-fitness/',
    name: 'Girl Power Women’s Online Group Training',
    nav: 'Girl Power',
    title: 'Women’s Online Fitness Classes | Girl Power | Proteinworkk',
    description: girl.priceConfirmed
      ? `Girl Power is a women-only online group training program with up to ${GROUP_CAP} members per group. Build strength and consistency for ${girl.priceLabel.replace('per month', 'a month')}.`
      : `Girl Power is a women-only online group training program with up to ${GROUP_CAP} members per group. Build strength, confidence and consistency. Beginners welcome.`,
    indexable: true,
  },
  mens: {
    path: '/mens-online-fitness-training/',
    name: 'Men’s Online Group Training',
    nav: 'Men’s Training',
    title: 'Online Fitness Training for Men | Proteinworkk',
    description: men.priceConfirmed
      ? `Men’s online group training for strength, muscle and conditioning. Structured workouts, groups of up to ${GROUP_CAP} and nutrition guidance. ${men.priceLabel}.`
      : `Men’s online group training for strength, muscle and conditioning. Structured workouts, groups of up to ${GROUP_CAP} and nutrition guidance.`,
    indexable: true,
  },
  contact: {
    path: '/contact/',
    name: 'Contact',
    nav: 'Contact',
    title: 'Contact Proteinworkk | Online Fitness Consultation',
    description:
      'Ask about online personal training, group workouts, Girl Power or nutrition support. Email contact@proteinworkk.com or send an enquiry form.',
    indexable: true,
  },
  privacy: {
    path: '/privacy-policy/',
    name: 'Privacy Policy',
    title: 'Privacy Policy | Proteinworkk',
    description:
      'How Proteinworkk uses the details you send through the enquiry form.',
    indexable: true,
  },
} satisfies Record<string, Route>;

export type RouteKey = keyof typeof ROUTES;

export const routeList: Route[] = Object.values(ROUTES);

/** Main navigation, in display order. */
export const NAV_ITEMS = [
  ROUTES.home,
  ROUTES.about,
  ROUTES.oneToOne,
  ROUTES.group,
  ROUTES.girlPower,
  ROUTES.mens,
  ROUTES.contact,
].map((r: Route) => ({ label: r.nav as string, path: r.path }));

export interface Crumb {
  name: string;
  path: string;
}

/** Breadcrumb trail for an inner page: Home > Page. */
export const crumbsFor = (route: Route): Crumb[] => [
  { name: ROUTES.home.name, path: ROUTES.home.path },
  { name: route.name, path: route.path },
];

export const canonicalFor = (route: Route): string => abs(route.path);
export const ORG_NAME = BRAND.name;
