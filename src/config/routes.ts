/**
 * One centralized route table. Paths, titles, descriptions, breadcrumb names, navigation labels
 * and sitemap flags all live here, so links, canonicals, sitemap entries, metadata and
 * structured data stay consistent. Paths match the content pack (Part 9) exactly.
 */
import { BRAND, abs } from './site';
import { programs, PRICES, GROUP_CAP, enquiryHref } from '../data/programs';

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
    description: `Online personal training from ₹${PRICES.oneToOneMonth.amount.toLocaleString('en-IN')} a month and group training from ₹${PRICES.group.amount.toLocaleString('en-IN')} a month. Bengaluru-based coaching, small groups, nutrition support.`,
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
    description: `Virtual 1:1 online personal training: 3 live sessions/week, custom plan and accountability for ${PRICES.oneToOneMonth.label}. Virtual dual training available.`,
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
  blog: {
    path: '/blog/',
    name: 'Blog',
    nav: 'Blog',
    title: 'Fitness Blog, Training Guides & Nutrition | Proteinworkk',
    description:
      'Evidence-based guides on online personal training, muscle building, fat loss, and sustainable nutrition habits from certified fitness coaches.',
    indexable: true,
  },
  blogWorthIt: {
    path: '/blog/is-online-personal-training-worth-it/',
    name: 'Is Online Personal Training Worth It?',
    title: 'Is Online Personal Training Worth It? Cost, Benefits & Results',
    description:
      'Is online personal training worth it? Discover real costs, pros and cons, results for weight loss and muscle building, and how to choose the right coach.',
    indexable: true,
  },
  blogWeightLoss: {
    path: '/blog/best-weight-loss-programs/',
    name: 'Best Weight Loss Programs',
    title: 'Best Weight Loss Programs: Find a Plan That Works | Proteinworkk',
    description:
      'Compare weight loss programs and learn how to choose one that fits your lifestyle, fitness level and goals, with structured workouts and nutrition guidance.',
    indexable: true,
  },
  blogWomensStrength: {
    path: '/blog/womens-strength-training-guide/',
    name: 'Women’s Strength Training Guide',
    title: 'Women’s Strength Training Guide: Myths, Workouts & Nutrition',
    description:
      'Learn how women’s strength training builds muscle, bone health, and lasting confidence. Myths busted, beginner workouts, nutrition tips, and a weekly plan.',
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

export interface SubNavItem {
  label: string;
  path: string;
  desc?: string;
}

export interface NavItem {
  label: string;
  path?: string;
  children?: SubNavItem[];
}

export const TRAINING_SERVICES: SubNavItem[] = [
  { label: 'Virtual 1:1 Personal Training', path: ROUTES.oneToOne.path, desc: '3 live sessions/week, custom plan & 1:1 coaching' },
  { label: 'Virtual Dual Training (2:1)', path: `${ROUTES.oneToOne.path}#dual-training`, desc: '1 trainer coaching 2 clients together live' },
  { label: 'Online Group Training', path: ROUTES.group.path, desc: `Small groups capped at ${GROUP_CAP} members` },
  { label: 'Girl Power (Women’s Training)', path: ROUTES.girlPower.path, desc: 'Women-only online group training & strength' },
  { label: 'Men’s Online Training', path: ROUTES.mens.path, desc: 'Hypertrophy, strength & conditioning for men' },
  { label: 'Nutrition Support', path: enquiryHref('nutrition'), desc: 'Personalized meal planning and habit guidance' },
];

/** Main navigation, in display order with Training dropdown. */
export const NAV_ITEMS: NavItem[] = [
  { label: ROUTES.home.nav as string, path: ROUTES.home.path },
  { label: ROUTES.about.nav as string, path: ROUTES.about.path },
  {
    label: 'Training',
    children: TRAINING_SERVICES,
  },
  { label: ROUTES.blog.nav as string, path: ROUTES.blog.path },
  { label: ROUTES.contact.nav as string, path: ROUTES.contact.path },
];

export interface Crumb {
  name: string;
  path: string;
}

/** Breadcrumb trail for an inner page: Home > Page. */
export const crumbsFor = (route: Route): Crumb[] => [
  { name: ROUTES.home.name, path: ROUTES.home.path },
  { name: route.name, path: route.path },
];

/** Breadcrumb trail for a blog post: Home > Blog > Post. */
export const blogPostCrumbs = (postRoute: Route): Crumb[] => [
  { name: ROUTES.home.name, path: ROUTES.home.path },
  { name: ROUTES.blog.name, path: ROUTES.blog.path },
  { name: postRoute.name, path: postRoute.path },
];

export const canonicalFor = (route: Route): string => abs(route.path);
export const ORG_NAME = BRAND.name;
