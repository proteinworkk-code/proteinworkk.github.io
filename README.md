# Proteinworkk website

Static, multi-page marketing site for **Proteinworkk**, an online fitness coaching and nutrition support brand based in Bengaluru, Karnataka, India. Built with [Astro](https://astro.build) (static output, almost no JavaScript), self-hosted fonts and no UI framework.

**Status:** all pages are built and the production build and automated checks pass. It has **not** been deployed or connected to a domain, and it must not go live until the blockers in [`TODO.md`](./TODO.md) are resolved.

## Pages

| Page | Route |
| --- | --- |
| Homepage | `/` |
| About Proteinworkk | `/about/` |
| Online One-to-One Personal Training | `/online-personal-training/` |
| Online Group Training | `/online-group-training/` |
| Girl Power, women's online group training | `/girl-power-womens-online-fitness/` |
| Men's Online Group Training | `/mens-online-fitness-training/` |
| Contact Us (enquiry form) | `/contact/` |
| Privacy Policy (**draft**, `noindex`) | `/privacy-policy/` |
| 404 | `/404.html` |
| Generated | `/sitemap.xml`, `/robots.txt`, `/llms.txt` |

There is deliberately no standalone Nutrition Support page: the content pack does not supply its copy and the scope is unconfirmed. Nutrition is introduced on the homepage and enquiries go to the contact form (see `TODO.md`).

## Requirements

Node.js **22.22 or newer** (Astro 7 requirement) and npm.

## 1. Install

```bash
npm install
```

## 2. Run locally

```bash
npm run dev
```

Open http://localhost:4321 and preview every page:

- http://localhost:4321/
- http://localhost:4321/about/
- http://localhost:4321/online-personal-training/
- http://localhost:4321/online-group-training/
- http://localhost:4321/girl-power-womens-online-fitness/
- http://localhost:4321/mens-online-fitness-training/
- http://localhost:4321/contact/
- http://localhost:4321/privacy-policy/

## 3. Build and check

```bash
npm run build        # outputs the static site to dist/
npm run preview      # serves dist/ locally
npm run verify       # post-build checks (see below)
npm run test:dom     # form, menu and analytics behaviour tests (jsdom)
npm run check        # build + verify + test:dom in one go
```

`npm run verify` checks, for every built page: one H1, no skipped heading levels, unique titles and descriptions (max 160 characters), correct canonical, `noindex` only where intended, Open Graph tags, valid JSON-LD, FAQ markup matching visible text, Offer markup only where a price is confirmed and visible, no bracketed placeholders or "provisional" wording, no `href="#"`, working internal links and anchors, image alt attributes and files, sitemap/robots/llms.txt correctness, and that analytics is absent without an ID.

What is **not** covered by these automated checks: real-browser rendering, visual layout on physical phones, screen-reader testing and Lighthouse scores. Do those on a preview deployment before launch.

## 4. Configuration (environment variables)

Copy `.env.example` to `.env` for local work. On GitHub, set the same names as repository **Variables**. They are not secrets and end up in the public site.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Canonical domain, no trailing slash. Default `https://proteinworkk.com` (assumed from the contact email, **unverified**). |
| `PUBLIC_FORM_ENDPOINT` | Enquiry form endpoint, e.g. a Formspree URL. Blank = form tells visitors it is not connected. |
| `PUBLIC_GA4_ID` | GA4 measurement ID (`G-XXXXXXXXXX`). Blank = no analytics code at all. |

### Canonical domain

`PUBLIC_SITE_URL` is the only place the domain is set. Canonical tags, Open Graph URLs, the sitemap, `robots.txt`, `llms.txt` and all JSON-LD read from it. To change it, set the variable and rebuild. Never hard-code the domain in pages.

### Contact form

1. Create a form at [Formspree](https://formspree.io) (or any service that accepts a multipart POST and replies with JSON).
2. Set `PUBLIC_FORM_ENDPOINT=https://formspree.io/f/your-id` and rebuild.
3. In the Formspree dashboard, enable its spam protection (reCAPTCHA or similar) and set the notification email. The form already includes a honeypot field (`_gotcha`).
4. Submit a real test enquiry and confirm it arrives.

Behaviour: client-side validation with accessible inline errors, a loading state, and a success message **only** after the server confirms. If the endpoint is missing or the request fails, the visitor sees an honest error and a button that opens an email draft to `contact@proteinworkk.com` containing what they typed. Nothing is ever reported as sent when it was not.

The "Preferred contact method" menu lists only Email, because it is the only confirmed channel. Add options in `CONTACT_METHODS` (`src/config/site.ts`) once the business confirms phone or WhatsApp.

### Google Analytics 4

Set `PUBLIC_GA4_ID` and rebuild. The site then sends:

- `enquiry_submitted` (only after a real successful submission; carries the chosen program and goal only)
- `cta_click` (primary buttons)
- `email_click` (any `mailto:` link, without the address)
- `program_enquiry_click` (links that pre-select a program)

No names, emails, phone numbers or message text are ever sent. Depending on your audience and legal advice you may need a consent banner before enabling analytics; none is included.

## 5. Where to edit things

| To change | Edit |
| --- | --- |
| Brand facts, contact email, tagline, last-updated date | `src/config/site.ts` |
| Page titles, descriptions, paths, nav labels | `src/config/routes.ts` |
| Prices, group size, program cards, form options | `src/data/programs.ts` |
| **Confirming the Girl Power / Men's price** | Set `girlPowerConfirmed` / `mensConfirmed` to `true` in `src/data/programs.ts`. The price then appears on the page, in FAQs, meta description, `llms.txt` and Offer markup automatically. |
| Page copy and FAQs | the matching file in `src/pages/` |
| Trainer profiles | `src/data/trainers.ts` (renders only entries with `verified: true`) |
| Testimonials | `src/data/testimonials.ts` (renders only entries with `consented: true`) |
| Colours, fonts, spacing | tokens at the top of `src/styles/global.css` |
| Social links | `SOCIAL_LINKS` in `src/config/site.ts` (nothing renders while it is empty) |

Update `lastModified` in `src/config/site.ts` and the "Last updated" text only when content genuinely changes.

## 6. Logo and images

- The supplied logo is kept untouched in `assets-source/Proteinworkk_logo.png`.
- `public/images/logo-h*.png` are the same artwork with only the empty transparent margin trimmed and then resized proportionally (transparency preserved, no distortion). The header and footer pair the mark with a text wordmark.
- Favicons, the Apple touch icon and `og-default.png` (1200x630 social image) are generated from the same logo.
- To regenerate sizes after replacing the logo, replace `assets-source/Proteinworkk_logo.png` and run `python3 scripts/make-image-assets.py` (needs Pillow).
- **Photography:** none is used, on purpose, because no verified images were supplied. To add real photos, put them in `public/images/`, use `width`/`height` attributes and `loading="lazy"` below the fold, and write descriptive `alt` text (empty `alt=""` for decoration). Do not use stock or AI photos that imply a pictured person is a Proteinworkk coach. See `TODO.md` for suggested shots.

## 7. SEO, AEO and GEO notes

- Every important page has a server-rendered Quick answer (about 40-70 words), answer-first question headings and always-visible FAQs. Nothing is hidden behind scripts or accordions.
- JSON-LD: `Organization` and `WebSite` (home), `Service` (+ `Offer` only for confirmed prices), `BreadcrumbList`, `FAQPage`, `ContactPage`, `AboutPage`. Not added on purpose: `LocalBusiness`, `Review`, `AggregateRating`, telephone, street address, `sameAs`, `areaServed`. Structured data helps describe the business; it does not guarantee rich results or AI citations.
- `llms.txt` is an optional, unproven convention. It is generated from the same facts as the pages.
- `robots.txt` allows all crawlers, including AI crawlers. This was a deliberate default so answer engines can describe Proteinworkk accurately. To restrict a specific crawler, add a `User-agent` block in `src/pages/robots.txt.ts`.
- The privacy page is `noindex` and left out of the sitemap until the owner approves its wording.

## 8. Deploying with GitHub Pages and a custom domain

1. Push this project to a GitHub repository (default branch `main`).
2. **Settings > Pages > Source:** choose **GitHub Actions**.
3. **Settings > Secrets and variables > Actions > Variables:** add `PUBLIC_SITE_URL`, `PUBLIC_FORM_ENDPOINT` and (optionally) `PUBLIC_GA4_ID`.
4. Push to `main`. `.github/workflows/deploy.yml` builds, runs `npm run verify` and deploys. (This workflow has not been run yet; check the action versions and test it first.)
5. **Custom domain:** once the domain is confirmed and owned, add it under Settings > Pages, then create the DNS records GitHub shows (an `A`/`ALIAS` or `CNAME` record). Optionally add a `public/CNAME` file containing just the domain. Enable "Enforce HTTPS".
6. Make sure `PUBLIC_SITE_URL` matches the final domain (including `www` or not), then redeploy.
7. Submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools, and test the contact form on the live domain.

The site is served from the domain root, so no `base` path is configured. If you ever host it at `username.github.io/repo-name/`, add `base: '/repo-name'` in `astro.config.mjs` and update the absolute `/…` links.

Other static hosts (Cloudflare Pages, Netlify, Vercel) work too: build command `npm run build`, output directory `dist`.

## Project structure

```
src/
  components/   Header, Footer, Brand, Button, Section, QuickAnswer, DataTable, FAQ,
                PageHero, ProgramCard, EnquiryForm, CtaBand, RelatedLinks, ...
  config/       site.ts (brand facts, env), routes.ts (paths, metadata, nav)
  data/         programs.ts (prices, cards), trainers.ts, testimonials.ts
  layouts/      BaseLayout.astro (head, SEO, Open Graph, JSON-LD, analytics loader)
  lib/          schema.ts (JSON-LD builders)
  pages/        one file per route + sitemap.xml.ts, robots.txt.ts, llms.txt.ts
  scripts/      menu.ts, enquiry-form.ts, analytics.ts
  styles/       global.css (design tokens and all styles)
public/         images, favicon
scripts/        verify-build.mjs, make-image-assets.py
tests/          dom-tests.mjs
assets-source/  original, untouched logo
```
