/**
 * Programs, prices and group size: the single source for every page, card, table and JSON-LD offer.
 *
 * PRICE CONFIRMATION
 * - Confirmed: one-to-one (₹600 per session, ₹4,999 per month) and online group (₹2,999 per month).
 * - Provisional (NOT shown publicly, NOT in JSON-LD): Girl Power and Men's, ₹2,999 per month.
 *   When the owner confirms a price, set the matching `...Confirmed` constant below to true.
 *   The price then appears on the page, in FAQs, in the meta description and in the Offer
 *   markup automatically.
 */

export const GROUP_CAP = 12;

export const PRICES = {
  oneToOneSession: { amount: 600, label: '₹600 per session' },
  oneToOneMonth: { amount: 4999, label: '₹4,999 per month' },
  group: { amount: 2999, label: '₹2,999 per month' },
} as const;

/** Provisional amount for Girl Power and Men's. Only used once confirmed. */
const PROVISIONAL = { amount: 2999, label: '₹2,999 per month' } as const;

export const PRICE_ON_ENQUIRY = 'Pricing on enquiry';

export type ProgramId = 'one-to-one' | 'group' | 'girl-power' | 'mens';

export interface Program {
  id: ProgramId;
  /** Full name used in headings and schema */
  name: string;
  /** Short name used in navigation and compact lists */
  short: string;
  href: string;
  audience: string;
  format: string;
  summary: string;
  benefits: string[];
  priceConfirmed: boolean;
  /** Text shown wherever a price appears */
  priceLabel: string;
  /** Offers for JSON-LD. Empty while the price is unconfirmed. */
  offers: { name: string; amount: number }[];
  cta: string;
  tone: 'one' | 'group' | 'women' | 'men';
}

const girlPowerConfirmed = false; // provisional until the owner approves
const mensConfirmed = false; // provisional until the owner approves

export const programs: Record<ProgramId, Program> = {
  'one-to-one': {
    id: 'one-to-one',
    name: 'Online One-to-One Personal Training',
    short: 'One-to-One Personal Training',
    href: '/online-personal-training/',
    audience: 'Individual planning and a trainer’s full attention',
    format: 'One-to-one, delivered online',
    summary:
      'Private coaching built around your goals, experience and schedule. Your trainer plans your progression, monitors your consistency and adjusts the program as you improve.',
    benefits: [
      'A plan built around your goals, experience and schedule',
      'Your trainer plans progression and tracks consistency',
      'Practical nutrition guidance as part of how we coach',
    ],
    priceConfirmed: true,
    priceLabel: `${PRICES.oneToOneSession.label} or ${PRICES.oneToOneMonth.label}`,
    offers: [
      { name: 'Per session', amount: PRICES.oneToOneSession.amount },
      { name: 'Monthly membership', amount: PRICES.oneToOneMonth.amount },
    ],
    cta: 'Choose Personal Training',
    tone: 'one',
  },
  group: {
    id: 'group',
    name: 'Online Group Training',
    short: 'Group Training',
    href: '/online-group-training/',
    audience: 'Structure and community at a lower monthly cost',
    format: `Group of up to ${GROUP_CAP} members, delivered online`,
    summary: `Trainer-guided online workouts with a clear structure, a regular rhythm and fellow members training alongside you. Groups are capped at ${GROUP_CAP}, so the trainer’s attention stays meaningful.`,
    benefits: [
      'Trainer-guided workouts with a clear structure',
      `Groups capped at ${GROUP_CAP} members`,
      'Community accountability at a lower monthly cost',
    ],
    priceConfirmed: true,
    priceLabel: PRICES.group.label,
    offers: [{ name: 'Monthly membership', amount: PRICES.group.amount }],
    cta: 'Join Online Group Training',
    tone: 'group',
  },
  'girl-power': {
    id: 'girl-power',
    name: 'Girl Power — Women’s Online Group Training',
    short: 'Girl Power',
    href: '/girl-power-womens-online-fitness/',
    audience: 'A women-only, beginner-friendly space',
    format: `Women-only group of up to ${GROUP_CAP}, delivered online`,
    summary:
      'A women-only online community focused on strength, confidence, conditioning and habits you can maintain. Beginners are welcome and training progresses at a sensible pace.',
    benefits: [
      'Women-only and beginner-friendly',
      'Strength, confidence, conditioning and sustainable habits',
      `Groups capped at ${GROUP_CAP} women`,
    ],
    priceConfirmed: girlPowerConfirmed,
    priceLabel: girlPowerConfirmed ? PROVISIONAL.label : PRICE_ON_ENQUIRY,
    offers: girlPowerConfirmed ? [{ name: 'Monthly membership', amount: PROVISIONAL.amount }] : [],
    cta: 'Explore Girl Power',
    tone: 'women',
  },
  mens: {
    id: 'mens',
    name: 'Men’s Online Group Training',
    short: 'Men’s Training',
    href: '/mens-online-fitness-training/',
    audience: 'Strength, muscle and conditioning in a group',
    format: `Men’s group of up to ${GROUP_CAP}, delivered online`,
    summary:
      'Structured group workouts centered on strength, muscle development, endurance and conditioning, with a practical approach to weight management. Built on progression, not ego lifting.',
    benefits: [
      'Strength, muscle development, endurance and conditioning',
      'A practical approach to weight management',
      `Groups capped at ${GROUP_CAP} men`,
    ],
    priceConfirmed: mensConfirmed,
    priceLabel: mensConfirmed ? PROVISIONAL.label : PRICE_ON_ENQUIRY,
    offers: mensConfirmed ? [{ name: 'Monthly membership', amount: PROVISIONAL.amount }] : [],
    cta: 'Start Men’s Training',
    tone: 'men',
  },
};

export const programList: Program[] = [
  programs['one-to-one'],
  programs.group,
  programs['girl-power'],
  programs.mens,
];

/** Enquiry-form program options (values double as the ?program= query parameter). */
export const FORM_PROGRAMS: { value: string; label: string }[] = [
  { value: 'one-to-one', label: 'One-to-One Personal Training' },
  { value: 'group', label: 'Online Group Training' },
  { value: 'girl-power', label: 'Girl Power Women’s Training' },
  { value: 'mens', label: 'Men’s Online Group Training' },
  { value: 'nutrition', label: 'Nutrition Support' },
  { value: 'not-sure', label: 'Not Sure — Help Me Choose' },
];

export const FORM_GOALS: string[] = [
  'Fat loss',
  'Muscle building',
  'Strength and endurance',
  'General fitness',
  'Weight management',
  'Nutrition guidance',
  'Other',
];

/** Link to the enquiry form with a program pre-selected. */
export const enquiryHref = (program: string = 'not-sure'): string =>
  `/contact/?program=${encodeURIComponent(program)}#enquiry`;
