import type { APIRoute } from 'astro';
import { abs } from '../config/site';

/**
 * robots.txt: all public content is crawlable, including search and AI crawlers.
 * DECISION (documented in README): AI crawlers are deliberately allowed so Proteinworkk
 * can be described accurately by answer engines. To restrict one, add a block such as
 *   User-agent: GPTBot
 *   Disallow: /
 * No page is blocked here; the draft privacy page is kept out of search with a noindex tag instead.
 */
export const GET: APIRoute = () => {
  const body = `# Proteinworkk robots.txt
# All public pages may be crawled by search engines and AI crawlers (deliberate decision, see README).
User-agent: *
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
