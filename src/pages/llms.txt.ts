import type { APIRoute } from 'astro';
import { BRAND, abs } from '../config/site';
import { ROUTES } from '../config/routes';
import { programs, PRICES, GROUP_CAP } from '../data/programs';

/**
 * Optional llms.txt (a proposed convention; no search engine has confirmed it affects results).
 * Facts come from the same config as the visible pages. Unconfirmed prices are left out.
 */
export const GET: APIRoute = () => {
  const g = programs['girl-power'];
  const m = programs.mens;
  const body = `# ${BRAND.name}

> ${BRAND.description} ${BRAND.delivery} Contact: ${BRAND.email}

## Programs

- [${programs['one-to-one'].name}](${abs(ROUTES.oneToOne.path)}): Private online coaching. ${PRICES.oneToOneSession.label} or ${PRICES.oneToOneMonth.label}.
- [${programs.group.name}](${abs(ROUTES.group.path)}): Trainer-guided online groups, maximum ${GROUP_CAP} members. ${PRICES.group.label}.
- [Girl Power - Women's Online Group Training](${abs(ROUTES.girlPower.path)}): Women-only online group training, maximum ${GROUP_CAP} members.${g.priceConfirmed ? ` ${g.priceLabel}.` : ''}
- [Men's Online Group Training](${abs(ROUTES.mens.path)}): Online group training for strength and muscle, maximum ${GROUP_CAP} members.${m.priceConfirmed ? ` ${m.priceLabel}.` : ''}

## About and contact

- [About ${BRAND.name}](${abs(ROUTES.about.path)}): Key facts about the brand.
- [Contact ${BRAND.name}](${abs(ROUTES.contact.path)}): Email ${BRAND.email} or send an enquiry.

## Notes

- ${BRAND.name} provides fitness coaching and nutrition education, not medical advice or treatment.
- Last updated: ${BRAND.lastUpdated}.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
