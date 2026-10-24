// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// The canonical domain lives in ONE place: the PUBLIC_SITE_URL environment variable
// (see .env.example). Everything else (canonical tags, sitemap, JSON-LD, llms.txt, robots.txt)
// reads it from `import.meta.env.SITE`, which Astro fills from the `site` value below.
//
// ASSUMPTION: https://proteinworkk.com is inferred from contact@proteinworkk.com and is NOT yet
// verified. Confirm domain ownership before launch (see TODO.md).
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };
const site = (env.PUBLIC_SITE_URL || 'https://proteinworkk.com').replace(/\/+$/, '');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
});
