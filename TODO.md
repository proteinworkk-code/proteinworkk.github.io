# Proteinworkk: pre-launch TODO

Every item below was marked "NEEDS BUSINESS CONFIRMATION" (or highlighted/bracketed) in the content pack, or is a technical step that needs a real account or value. None of this is shown to the public as an unresolved note. Where information is missing, the site either leaves the claim out or tells visitors to ask the team.

Source: content pack Part 12 and the in-line confirmation notes. Tick items off as they are resolved.

## Launch blockers (do these first)

- [ ] **Confirm the canonical domain.** `https://proteinworkk.com` is assumed from `contact@proteinworkk.com`. Verify the business owns it, and whether the canonical form is with or without `www`. Set `PUBLIC_SITE_URL`. *Affects: every canonical tag, sitemap, robots.txt, llms.txt, JSON-LD.*
- [ ] **Create the form endpoint** (e.g. Formspree), set `PUBLIC_FORM_ENDPOINT`, enable provider spam protection, send a real test enquiry. Until then the form honestly says it is not connected. *Affects: `/contact/` (`EnquiryForm.astro`).*
- [ ] **Confirm the Girl Power price** (provisional ₹2,999 per month). Then set `girlPowerConfirmed = true` in `src/data/programs.ts`. *Affects: homepage cards and pricing table, Girl Power page, About, Contact FAQ, meta description, llms.txt, Offer markup.*
- [ ] **Confirm the Men's program price** (provisional ₹2,999 per month). Then set `mensConfirmed = true`. *Affects: same places as above, on the Men's page.*
- [ ] **Approve the privacy policy** with the business and a legal adviser, replace the draft wording, then remove the "Draft for review" notice and the `noindex` (set `indexable: true` for `privacy` in `src/config/routes.ts` and add it to the `PAGES` list in `scripts/verify-build.mjs`). *Affects: `/privacy-policy/`, form consent checkbox.*
- [ ] **Add legal pages the business needs.** The footer links only to the privacy policy. Decide on Terms, Cancellation/Refund and Disclaimer pages. *Affects: footer, checkout/enquiry trust.*

## Training format

- [ ] Group programs: live or recorded sessions? Sessions per week, session length, platform, schedule, how members are assigned to groups, onboarding. *Affects: Group, Girl Power, Men's pages ("Ask the team for current details…" lines).*
- [ ] Confirm the real onboarding steps used for one-to-one coaching (the "How it works" steps are generic). Do not name apps, check-in intervals or measurements until confirmed. *Affects: One-to-one page, homepage "How does Proteinworkk work?".*
- [ ] Group size: confirm 12 is a firm maximum for every program. *Affects: all pages, schema descriptions.*
- [ ] Girl Power and Men's: any in-session modifications, level groupings or trial availability. *Affects: Girl Power, Men's pages.*

## One-to-one pricing and membership

- [ ] What exactly is included in **₹600 per session** and **₹4,999 per month**? Number of sessions, session length, frequency, scheduling, rescheduling rules, check-ins, messaging access. *Affects: One-to-one page FAQ and pricing section, homepage FAQ, pricing table.* The site currently makes no claim about any of these.
- [ ] Is a **free consultation or trial** offered? The site says "Request a Consultation" (a label from the build brief) and "no obligation to join", but never says free. Rename the button if no consultation call exists. *Affects: all "Request a Consultation" buttons, contact page.*

## Payments and policies

- [ ] GST treatment (are prices inclusive or exclusive?), accepted payment methods, discounts, extra fees, billing cycle, cancellations, refunds, pauses, plan transfers. *Affects: all pricing sections and FAQs; new policy pages.*

## Nutrition support

- [ ] What does it include, who provides it, what qualifications do they hold, are customized diet plans offered, does it cost extra, is it included in each program price? *Affects: homepage nutrition section, One-to-one, Girl Power and Men's nutrition sections, Contact FAQ.*
- [ ] Supply the copy for a standalone **Nutrition Support page** (not in the content pack). Once it exists, add the route, nav item and links, and change the homepage CTA from "Ask About Nutrition Support" to the new page. *Affects: new page, `routes.ts`, homepage.*

## Trainers and testimonials

- [ ] Supply genuine trainer names, photos, certifications with issuing bodies, specialities, bios and years of experience, then add to `src/data/trainers.ts` with `verified: true`. The homepage "Meet your coaches" section appears automatically. *Affects: homepage, About.*
- [ ] Collect genuine member testimonials with written consent, then add to `src/data/testimonials.ts`. No invented replacements, no star ratings. *Affects: homepage.*

## Contact details and social

- [x] **WhatsApp integration confirmed & deployed**: Configured +91 9831153184 with global floating WhatsApp button, pre-filled welcome message, and privacy-safe analytics.
- [ ] Decide whether to publish a direct call phone number, office hours, or street address. None is shown today. *Affects: Contact page, footer, form, JSON-LD.*
- [ ] Provide real social profile URLs and add them to `SOCIAL_LINKS` in `src/config/site.ts` (the footer renders them automatically). Optionally add `sameAs` to the Organization schema. *Affects: footer, JSON-LD.*
- [ ] Confirm whether the business operates **no physical gym or studio**. The content pack stated this, but it was marked unconfirmed, so the site only says "all training is delivered online". *Affects: About, Contact, FAQs.*

## Service area and logistics

- [ ] Can customers **outside India** join? Any time-zone limits? FAQs currently say "contact the team to check availability and time-zone fit", and the Organization/Service schema omits `areaServed` until this is known. *Affects: homepage, One-to-one, Group FAQs, JSON-LD.*
- [ ] Minimum **equipment** requirements and whether bodyweight-only options exist. FAQs currently say "Tell us what equipment you have." *Affects: homepage, One-to-one, Girl Power, Men's FAQs.*

## Health screening

- [ ] Define the intake procedure and the policy for members with medical conditions, injuries, pregnancy or postpartum considerations (for example a readiness questionnaire or doctor's clearance). Current text only advises speaking to a doctor first. *Affects: Girl Power, One-to-one, About, new policy page.*

## Registration and legal

- [ ] Registered business name, GSTIN if applicable, and the correct legal wording for footer and policies. The footer shows only "© year Proteinworkk". *Affects: footer, legal pages.*

## Imagery (none used yet, on purpose)

No verified photography was supplied, so no photos appear. Suggested real shoots to replace the brand-mark panels in the page heroes:

- Homepage: a real member doing a dumbbell movement at home with a real trainer visible on a laptop screen (with written consent from both).
- Girl Power: a real group session screenshot or posed shot with members' consent.
- Men's: a real member in a home strength session.
- Trainer headshots for `src/data/trainers.ts`.

Rules: no stock or AI images implying a pictured person is a coach, no before-and-after images, descriptive `alt` text for meaningful images, `alt=""` for decoration.

## Technical follow-ups

- [ ] Add a GA4 measurement ID via `PUBLIC_GA4_ID` only when analytics is wanted; decide whether a consent banner is needed for your audience.
- [ ] Test the GitHub Actions workflow (`.github/workflows/deploy.yml`) on a test repository and check the action versions.
- [ ] Run a real-browser pass on the deployed preview: phones and tablets, the mobile menu, form submission, keyboard-only use, a screen reader, and Lighthouse/PageSpeed.
- [ ] After launch, submit `/sitemap.xml` to Google Search Console and Bing Webmaster Tools.
- [ ] Consider a custom 404 hosting rule on the final host, so the generated `/404.html` is served for unknown URLs.

## Editorial decisions made while building (review these)

Where the content pack and the build brief pointed in different directions, the brief's restrictions on unconfirmed claims won.

- Girl Power and Men's: prices removed from copy, FAQs, meta descriptions, `llms.txt` and structured data; "Pricing on enquiry" is shown instead. Pack wording that said "₹2,999 per month [provisional]" is not used.
- Removed the pack's sentence that Proteinworkk "does not operate a physical gym or studio" (unconfirmed).
- Removed `areaServed: India` from JSON-LD (service area unconfirmed).
- Nutrition: pack statements that nutrition support is "included" were softened to "ask the team what comes with your plan". No customized diet plans are promised.
- Pack scheduling claim ("Flexible around your day [confirm]") became "Not tied to gym opening hours. Ask the team how scheduling works."
- Homepage: the pack's small "program summary" table was not repeated, because the four program cards and the pricing table carry the same information. Trainer and testimonial sections are hidden until real data exists.
- Homepage CTA "Explore Nutrition Support" became "Ask About Nutrition Support", because it opens the contact form, not a page.
- Contact page Quick answer was extended to reach roughly 40-70 words, and the program guide was moved to its own full-width section.
- FAQs are always visible (no accordion) so the content is in the HTML and readable by everyone.
- The About page is built from the Part 11 entity fact sheet; no founder, team, registration number, founding year or awards are stated.
