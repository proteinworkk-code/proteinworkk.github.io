import type { APIRoute } from 'astro';
import { routeList } from '../config/routes';
import { BRAND, abs } from '../config/site';

/** XML sitemap generated from the central route table. Only indexable pages are listed. */
export const GET: APIRoute = () => {
  const urls = routeList
    .filter((r) => r.indexable)
    .map(
      (r) =>
        `  <url>\n    <loc>${abs(r.path)}</loc>\n    <lastmod>${BRAND.lastModified}</lastmod>\n  </url>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
