// Post-build checks for the generated site in ./dist. Run with: npm run verify (after npm run build).
// Dependency-free on purpose. Exits with code 1 if any check fails.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const failures = [];
const warnings = [];
const fail = (page, msg) => failures.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

// ---------- helpers ----------
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const htmlFiles = walk(DIST).filter((f) => extname(f) === '.html');
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
const textOf = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const routeOf = (file) => {
  const rel = file.slice(DIST.length).replace(/\\/g, '/');
  if (rel === '/index.html') return '/';
  if (rel === '/404.html') return '/404/';
  return rel.replace(/index\.html$/, '');
};
const fileForPath = (p) => {
  const clean = p.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return join(DIST, 'index.html');
  const direct = join(DIST, clean);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const idx = join(DIST, clean, 'index.html');
  return existsSync(idx) ? idx : null;
};

// ---------- site facts ----------
const configSrc = readFileSync('astro.config.mjs', 'utf8');
const SITE = (process.env.PUBLIC_SITE_URL || (configSrc.match(/'(https?:\/\/[^']+)'\)\.replace/) || [])[1] || 'https://proteinworkk.com').replace(/\/+$/, '');
const programsSrc = readFileSync('src/data/programs.ts', 'utf8');
const girlConfirmed = /const girlPowerConfirmed = true/.test(programsSrc);
const mensConfirmed = /const mensConfirmed = true/.test(programsSrc);

const PAGES = {
  '/': { jsonLd: ['Organization', 'WebSite', 'FAQPage'], quick: true },
  '/about/': { jsonLd: ['AboutPage', 'BreadcrumbList'], quick: true },
  '/contact/': { jsonLd: ['ContactPage', 'BreadcrumbList'], quick: true },
  '/online-personal-training/': { jsonLd: ['Service', 'BreadcrumbList', 'FAQPage'], quick: true, offers: 2 },
  '/online-group-training/': { jsonLd: ['Service', 'BreadcrumbList', 'FAQPage'], quick: true, offers: 1 },
  '/girl-power-womens-online-fitness/': { jsonLd: ['Service', 'BreadcrumbList', 'FAQPage'], quick: true, offers: girlConfirmed ? 1 : 0, provisional: !girlConfirmed },
  '/mens-online-fitness-training/': { jsonLd: ['Service', 'BreadcrumbList', 'FAQPage'], quick: true, offers: mensConfirmed ? 1 : 0, provisional: !mensConfirmed },
  '/privacy-policy/': { jsonLd: [], noindex: true },
  '/404/': { jsonLd: [], noindex: true },
};

const titles = new Map();
const descriptions = new Map();
let pagesChecked = 0;

for (const file of htmlFiles) {
  const route = routeOf(file);
  const html = readFileSync(file, 'utf8');
  const spec = PAGES[route];
  pagesChecked++;
  if (!spec) {
    fail(route, 'built page is not listed in verify script PAGES (update the script)');
    continue;
  }

  // Titles / descriptions
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!title) fail(route, 'missing <title>');
  if (title.length > 65) warn(route, `title is ${title.length} characters`);
  if (!desc) fail(route, 'missing meta description');
  if (desc.length > 160) fail(route, `meta description is ${desc.length} characters (max 160)`);
  if (titles.has(title)) fail(route, `duplicate title with ${titles.get(title)}`);
  if (descriptions.has(desc)) fail(route, `duplicate description with ${descriptions.get(desc)}`);
  titles.set(title, route);
  descriptions.set(desc, route);

  // H1 and heading order
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) fail(route, `expected exactly one <h1>, found ${h1s.length}`);
  let last = 0;
  for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    if (last && level > last + 1) fail(route, `heading level jumps from h${last} to h${level}`);
    last = level;
  }

  // Canonical / robots / Open Graph
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  const expected = route === '/404/' ? `${SITE}/404/` : `${SITE}${route}`;
  if (canonical !== expected) fail(route, `canonical is ${canonical}, expected ${expected}`);
  const robotsMeta = /<meta name="robots" content="([^"]+)"/.exec(html)?.[1];
  if (spec.noindex && !(robotsMeta || '').includes('noindex')) fail(route, 'expected noindex');
  if (!spec.noindex && robotsMeta) fail(route, `indexable page has robots meta "${robotsMeta}"`);
  for (const prop of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (!html.includes(`property="${prop}"`)) fail(route, `missing ${prop}`);
  }

  // Visible text checks
  const text = textOf(html);
  if (/\[[^\]]{2,}\]/.test(text)) fail(route, `square-bracketed placeholder in visible text: ${(text.match(/\[[^\]]{2,}\]/) || [''])[0]}`);
  if (/NEEDS (BUSINESS )?CONFIRMATION|NEEDS VERIFIED|PUBLICATION WARNING/i.test(text)) fail(route, 'internal confirmation note visible');
  if (/provisional/i.test(text)) fail(route, 'word "provisional" appears in public text');
  if (/\b(98%|500\+|10,000 transformations)\b/.test(text)) fail(route, 'suspicious invented statistic');
  if (/guarantee(d)? (results|weight loss|fat loss)/i.test(text) && !/not guarantee|cannot guarantee|no coach can guarantee|do not promise|not guaranteed/i.test(text)) {
    fail(route, 'guarantee language without a disclaimer');
  }
  if (/href="#"/.test(html)) fail(route, 'empty href="#" link');
  if (/\b(phone|whatsapp)\b[^.]{0,30}\+?\d{8,}/i.test(text)) fail(route, 'phone/WhatsApp number appears in text');

  // Provisional pricing must not appear on Girl Power / Men's pages or in their JSON-LD
  if (spec.provisional && /2,999|2999/.test(html)) fail(route, 'provisional ₹2,999 appears on a page whose price is unconfirmed');

  // Images need alt attributes and existing files
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\balt=/.test(tag)) fail(route, `<img> without alt: ${tag.slice(0, 80)}`);
    const src = (tag.match(/\bsrc="([^"]+)"/) || [])[1];
    if (src && src.startsWith('/') && !fileForPath(src)) fail(route, `image not found: ${src}`);
  }

  // Internal links
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    const href = decode(m[1]);
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (/^https?:\/\//.test(href)) {
      if (href.startsWith(SITE)) {
        if (!fileForPath(href.slice(SITE.length) || '/')) fail(route, `broken absolute internal link ${href}`);
      }
      continue;
    }
    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (id && !html.includes(`id="${id}"`)) fail(route, `anchor target #${id} not found`);
      continue;
    }
    const target = fileForPath(href);
    if (!target) fail(route, `broken internal link ${href}`);
    else if (href.includes('#')) {
      const id = href.split('#')[1];
      if (id && !readFileSync(target, 'utf8').includes(`id="${id}"`)) fail(route, `anchor #${id} not found in ${href.split('#')[0]}`);
    }
  }

  // JSON-LD: valid JSON, expected types, matches visible FAQ, offers only where confirmed
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const types = [];
  let offerCount = 0;
  for (const raw of blocks) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      fail(route, `invalid JSON-LD: ${e.message}`);
      continue;
    }
    types.push(data['@type']);
    if (data['@context'] !== 'https://schema.org') fail(route, 'JSON-LD missing schema.org @context');
    if (data['@type'] === 'FAQPage') {
      for (const q of data.mainEntity) {
        if (!text.includes(norm(q.name))) fail(route, `FAQ question not in visible text: ${q.name}`);
        if (!text.includes(norm(q.acceptedAnswer.text))) fail(route, `FAQ answer not in visible text for: ${q.name}`);
      }
    }
    if (data['@type'] === 'Service') {
      const o = data.offers ? (Array.isArray(data.offers) ? data.offers : [data.offers]) : [];
      offerCount += o.length;
      for (const offer of o) {
        if (offer.priceCurrency !== 'INR') fail(route, 'Offer without INR currency');
        const shown = Number(offer.price).toLocaleString('en-IN');
        if (!text.includes(`₹${shown}`)) fail(route, `Offer price ₹${shown} not visible on the page`);
      }
    }
    if (data['@type'] === 'Organization') {
      for (const key of ['telephone', 'sameAs', 'aggregateRating', 'review']) if (key in data) fail(route, `unexpected ${key} in Organization`);
      if (data.address?.streetAddress) fail(route, 'street address in Organization JSON-LD');
    }
    if (['LocalBusiness', 'Review', 'AggregateRating'].includes(data['@type'])) fail(route, `${data['@type']} markup not allowed yet`);
  }
  for (const t of spec.jsonLd) if (!types.includes(t)) fail(route, `missing JSON-LD ${t}`);
  if (spec.offers !== undefined && offerCount !== spec.offers) fail(route, `expected ${spec.offers} Offer(s), found ${offerCount}`);

  // Quick answer present and a sensible length
  if (spec.quick) {
    const qa = html.match(/<p class="quick__text"[^>]*>([\s\S]*?)<\/p>/);
    if (!qa) fail(route, 'missing Quick answer block');
    else {
      const words = textOf(qa[1]).split(' ').filter(Boolean).length;
      if (words < 35 || words > 75) warn(route, `Quick answer is ${words} words (target about 40-70)`);
    }
    if (route !== '/privacy-policy/' && !/Last updated: October 2026/.test(text)) fail(route, 'missing "Last updated" line');
  }
}

// ---------- sitemap, robots, llms.txt ----------
const sitemap = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!locs.length) fail('sitemap.xml', 'missing or empty');
for (const loc of locs) {
  if (!loc.startsWith(SITE)) fail('sitemap.xml', `URL not on canonical domain: ${loc}`);
  if (!fileForPath(loc.slice(SITE.length) || '/')) fail('sitemap.xml', `URL has no built page: ${loc}`);
}
const indexable = Object.entries(PAGES).filter(([, s]) => !s.noindex).map(([r]) => r);
for (const r of indexable) if (!locs.includes(`${SITE}${r}`)) fail('sitemap.xml', `missing indexable page ${r}`);
for (const loc of locs) if (!indexable.includes(loc.slice(SITE.length) || '/')) fail('sitemap.xml', `lists non-indexable page ${loc}`);

const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (!robots) fail('robots.txt', 'missing');
if (/^\s*Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt', 'blocks the whole site');
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots.txt', 'sitemap line missing or wrong domain');

const llms = existsSync(join(DIST, 'llms.txt')) ? readFileSync(join(DIST, 'llms.txt'), 'utf8') : '';
if (!llms) fail('llms.txt', 'missing');
for (const m of llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
  if (!m[1].startsWith(SITE) || !fileForPath(m[1].slice(SITE.length))) fail('llms.txt', `bad link ${m[1]}`);
}
if (!girlConfirmed && /Girl Power[^\n]*(₹|Rs)\s*\d/.test(llms)) fail('llms.txt', 'provisional Girl Power price present');
if (!mensConfirmed && /Men's[^\n]*(₹|Rs)\s*\d/.test(llms)) fail('llms.txt', "provisional Men's price present");

// Analytics must stay off without an ID
if (!process.env.PUBLIC_GA4_ID) {
  for (const file of htmlFiles) {
    if (readFileSync(file, 'utf8').includes('googletagmanager')) fail(routeOf(file), 'GA4 loader present without PUBLIC_GA4_ID');
  }
}

// ---------- report ----------
console.log(`Checked ${pagesChecked} HTML pages, ${locs.length} sitemap URLs (canonical: ${SITE}).`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(`  - ${w}`));
}
if (failures.length) {
  console.log(`\n${failures.length} FAILURE(S):`);
  failures.forEach((f) => console.log(`  x ${f}`));
  process.exit(1);
}
console.log('\nAll checks passed.');
