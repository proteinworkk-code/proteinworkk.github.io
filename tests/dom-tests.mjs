import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Node <22.19.0 compatibility fallback for undici decompression in test runner
try {
  const z = (await import('node:zlib')).default;
  if (!z.createZstdDecompress) {
    z.createZstdDecompress = () => {};
    z.constants.ZSTD_d_windowLogMax = 23;
  }
} catch {}

const { JSDOM } = await import('jsdom');
const D = fileURLToPath(new URL('../dist/', import.meta.url));
let pass = 0, failN = 0;
const ok = (c, m) => { if (c) pass++; else { failN++; console.log('  FAIL:', m); } };

function load(page, { url = 'https://proteinworkk.com/contact/', endpoint, fetchImpl } = {}) {
  let html = readFileSync(D + page, 'utf8');
  if (endpoint) html = html.replace('<form id="enquiry-form"', `<form data-endpoint="${endpoint}" id="enquiry-form"`).replace(/(<form[^>]*?) data-endpoint="[^"]*"(?=[^>]*data-endpoint)/, '$1');
  const modules = [];
  const scriptTags = [...html.matchAll(/<script type="module"(?:\s+src="([^"]+)")?>([\s\S]*?)<\/script>/g)];
  for (const m of scriptTags) {
    if (m[1]) {
      const srcPath = m[1].replace(/^\//, '');
      if (existsSync(D + srcPath)) {
        modules.push(readFileSync(D + srcPath, 'utf8'));
      }
    } else if (m[2]) {
      modules.push(m[2]);
    }
  }
  html = html.replace(/<script type="module"[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.matchMedia = w.matchMedia || ((q) => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  const calls = [];
  w.fetch = async (u, opts) => { calls.push({ u, opts }); return fetchImpl(u, opts); };
  const tracked = [];
  w.gtag = (...a) => tracked.push(a);
  for (const code of modules) w.eval(code);
  return { w, doc: w.document, calls, tracked };
}
const fill = (doc, vals) => { for (const [k, v] of Object.entries(vals)) { const el = doc.querySelector(`[name="${k}"]`); if (el.type === 'checkbox') el.checked = v; else el.value = v; } };
const submit = async (w, doc) => { doc.getElementById('enquiry-form').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true })); await new Promise((r) => setTimeout(r, 30)); };
const visible = (el) => !el.hidden;
const good = { name: 'Asha Rao', email: 'asha@example.com', phone: '+91 98765 43210', city: 'Bengaluru', goal: 'Fat loss', message: 'Hello', consent: true };

console.log('1. Empty submit shows accessible errors and sends nothing');
{ const { w, doc, calls } = load('contact/index.html', { endpoint: 'https://formspree.io/f/test', fetchImpl: async () => ({ ok: true }) });
  await submit(w, doc);
  for (const id of ['f-name', 'f-email', 'f-consent']) {
    ok(doc.getElementById(id).getAttribute('aria-invalid') === 'true', `${id} aria-invalid`);
    ok(visible(doc.getElementById(id + '-error')) && doc.getElementById(id + '-error').textContent.length > 5, `${id} error text`);
  }
  ok(!doc.getElementById('f-phone').hasAttribute('aria-invalid'), 'optional phone not flagged');
  ok(doc.activeElement.id === 'f-name', 'focus moves to first invalid field');
  ok(calls.length === 0, 'no network call'); ok(!visible(doc.getElementById('form-success')) === true, 'no success'); }

console.log('2. Bad email / bad phone messages');
{ const { w, doc } = load('contact/index.html', { endpoint: 'https://formspree.io/f/test', fetchImpl: async () => ({ ok: true }) });
  fill(doc, { ...good, email: 'not-an-email', phone: 'abc' }); await submit(w, doc);
  ok(/valid email/i.test(doc.getElementById('f-email-error').textContent), 'email message');
  ok(/valid phone/i.test(doc.getElementById('f-phone-error').textContent), 'phone message'); }

console.log('3. Endpoint NOT configured: honest error, mailto draft, no fake success');
{ const { w, doc, calls } = load('contact/index.html', { fetchImpl: async () => ({ ok: true }) });
  ok(!!doc.getElementById('form-config-notice'), 'config notice rendered');
  fill(doc, good); await submit(w, doc);
  ok(calls.length === 0, 'no network call');
  ok(visible(doc.getElementById('form-error')), 'error box shown');
  ok(!visible(doc.getElementById('form-success')) === true, 'success stays hidden');
  const href = doc.getElementById('form-mailto').href;
  ok(href.startsWith('mailto:contact@proteinworkk.com') && href.includes('Asha%20Rao'), 'mailto draft prefilled'); }

console.log('4. Successful submission');
{ const { w, doc, calls, tracked } = load('contact/index.html', { endpoint: 'https://formspree.io/f/test', fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
  fill(doc, { ...good }); doc.querySelector('[name="program"]').value = 'girl-power'; await submit(w, doc);
  ok(calls.length === 1 && calls[0].u === 'https://formspree.io/f/test', 'one POST to endpoint');
  ok(calls[0].opts.headers.Accept === 'application/json', 'asks for JSON');
  ok(visible(doc.getElementById('form-success')), 'success shown'); ok(doc.getElementById('enquiry-form').hidden, 'form hidden after success');
  ok(!visible(doc.getElementById('form-error')) === true, 'no error shown');
  const ev = tracked.find((t) => t[1] === 'enquiry_submitted');
  ok(!!ev, 'enquiry_submitted event fired');
  const payload = JSON.stringify(tracked);
  ok(!payload.includes('asha@example.com') && !payload.includes('Asha') && !payload.includes('98765') && !payload.includes('Hello'), 'no personal data in analytics'); }

console.log('5. Server rejects (422) -> error, no success, no analytics');
{ const { w, doc, tracked } = load('contact/index.html', { endpoint: 'https://formspree.io/f/test', fetchImpl: async () => ({ ok: false, status: 422, json: async () => ({ errors: [{ message: 'email must be valid' }] }) }) });
  fill(doc, good); await submit(w, doc);
  ok(visible(doc.getElementById('form-error')) && /email must be valid/.test(doc.getElementById('form-error-text').textContent), 'error with server detail');
  ok(!visible(doc.getElementById('form-success')) === true, 'success hidden'); ok(!tracked.some((t) => t[1] === 'enquiry_submitted'), 'no conversion event');
  ok(!doc.getElementById('form-submit').disabled, 'button re-enabled'); }

console.log('6. Network failure -> error, no success');
{ const { w, doc, tracked } = load('contact/index.html', { endpoint: 'https://formspree.io/f/test', fetchImpl: async () => { throw new Error('offline'); } });
  fill(doc, good); await submit(w, doc);
  ok(visible(doc.getElementById('form-error')), 'error shown'); ok(!visible(doc.getElementById('form-success')) === true, 'success hidden'); ok(!tracked.some((t) => t[1] === 'enquiry_submitted'), 'no conversion event'); }

console.log('7. Honeypot filled -> nothing sent');
{ const { w, doc, calls } = load('contact/index.html', { endpoint: 'https://formspree.io/f/test', fetchImpl: async () => ({ ok: true }) });
  fill(doc, good); doc.querySelector('[name="_gotcha"]').value = 'spam'; await submit(w, doc);
  ok(calls.length === 0 && !visible(doc.getElementById('form-success')) === true, 'no send and no fake success'); }

console.log('8. ?program= preselects; unknown value ignored');
{ const a = load('contact/index.html', { url: 'https://proteinworkk.com/contact/?program=mens#enquiry', fetchImpl: async () => ({ ok: true }) });
  ok(a.doc.querySelector('[name="program"]').value === 'mens', 'mens preselected');
  const b = load('contact/index.html', { url: 'https://proteinworkk.com/contact/?program=evil', fetchImpl: async () => ({ ok: true }) });
  ok(b.doc.querySelector('[name="program"]').value === 'not-sure', 'unknown ignored, default kept'); }

console.log('9. Mobile menu');
{ const { w, doc } = load('index.html', { url: 'https://proteinworkk.com/', fetchImpl: async () => ({ ok: true }) });
  const t = doc.querySelector('.nav-toggle'), h = doc.querySelector('.site-header');
  ok(t.getAttribute('aria-expanded') === 'false' && h.dataset.open === 'false', 'starts closed');
  t.click(); ok(t.getAttribute('aria-expanded') === 'true' && h.dataset.open === 'true', 'opens');
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); ok(t.getAttribute('aria-expanded') === 'false', 'Escape closes'); ok(doc.activeElement === t, 'focus returns to toggle');
  t.click(); doc.querySelector('.nav__link').click(); ok(t.getAttribute('aria-expanded') === 'false', 'closes after choosing a link');
  t.click(); doc.body.click(); ok(t.getAttribute('aria-expanded') === 'false', 'outside click closes'); }

console.log('10. Analytics click events are privacy-safe');
{ const { w, doc, tracked } = load('index.html', { url: 'https://proteinworkk.com/', fetchImpl: async () => ({ ok: true }) });
  doc.querySelector('.hero a.btn--primary').click();
  doc.querySelector('.site-footer a[href^="mailto:"]').click();
  const names = tracked.map((t) => t[1]); ok(names.includes('cta_click') && names.includes('email_click') && names.includes('program_enquiry_click'), 'cta/email/program events: ' + names.join(','));
  ok(!JSON.stringify(tracked).includes('@'), 'no email address in events'); }

console.log('11. WhatsApp floating button integration and analytics');
{ const { w, doc, tracked } = load('index.html', { url: 'https://proteinworkk.com/', fetchImpl: async () => ({ ok: true }) });
  const waFab = doc.querySelector('.whatsapp-fab');
  ok(!!waFab, 'WhatsApp FAB exists in DOM');
  const href = waFab.getAttribute('href') || '';
  ok(href.startsWith('https://wa.me/919831153184'), 'destination is +91 9831153184');
  ok(href.includes(encodeURIComponent('Hi Proteinworkk team! I visited your website and would like to know more about your products. Could you please assist me?')), 'prefilled welcome message is present and encoded');
  ok(waFab.getAttribute('target') === '_blank', 'opens in new tab');
  ok((waFab.getAttribute('rel') || '').includes('noopener') && (waFab.getAttribute('rel') || '').includes('noreferrer'), 'has rel="noopener noreferrer"');
  ok(waFab.getAttribute('aria-label') === 'Chat with Proteinworkk on WhatsApp', 'accessible name set');

  waFab.click();
  const waEvent = tracked.find((t) => t[1] === 'whatsapp_click');
  ok(!!waEvent, 'whatsapp_click analytics event fired on click');
  ok(waEvent && waEvent[2].button_location === 'floating', 'button_location is floating');
  ok(!JSON.stringify(waEvent).includes('9831153184'), 'no phone number in analytics event payload'); }

console.log('12. BMI Calculator interactivity, formulas, ranges and validation');
{
  const { w, doc } = load('bmi-calculator/index.html', { url: 'https://proteinworkk.com/bmi-calculator/', fetchImpl: async () => ({ ok: true }) });

  // 12.1 Check initial state
  const out = doc.getElementById('out');
  const ph = doc.getElementById('ph');
  ok(out.hidden === true, 'BMI output hidden on initial load');
  ok(ph.hidden === false, 'BMI placeholder visible on initial load');

  // 12.2 Test Metric Calculation: 70 kg, 165 cm
  doc.getElementById('kg').value = '70';
  doc.getElementById('cm').value = '165';
  doc.getElementById('f').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true }));

  ok(out.hidden === false, 'BMI output displayed after valid calculation');
  ok(doc.getElementById('v').textContent === '25.7', 'Calculated BMI is 25.7 (70kg, 165cm)');
  ok(/Indian Obesity Threshold/i.test(doc.getElementById('c').textContent), 'Indian classification flags 25.7 as Indian Obesity Threshold');

  // 12.3 Test switching classification to International (WHO)
  const siRadio = doc.getElementById('si');
  siRadio.checked = true;
  siRadio.dispatchEvent(new w.Event('change', { bubbles: true }));

  ok(doc.getElementById('v').textContent === '25.7', 'BMI remains 25.7 after classification switch');
  ok(/Overweight/i.test(doc.getElementById('c').textContent), 'WHO classification flags 25.7 as Overweight');

  // 12.4 Test Imperial Calculation: 154 lb, 5 ft 5 in
  const uiRadio = doc.getElementById('ui');
  uiRadio.checked = true;
  uiRadio.dispatchEvent(new w.Event('change', { bubbles: true }));

  ok(doc.getElementById('metric-fields').hidden === true, 'Metric fields hidden in imperial mode');
  ok(doc.getElementById('imp-fields').hidden === false, 'Imperial fields visible in imperial mode');

  doc.getElementById('lb').value = '154';
  doc.getElementById('ft').value = '5';
  doc.getElementById('in').value = '5';
  doc.getElementById('f').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true }));

  ok(doc.getElementById('v').textContent === '25.6', 'Imperial calculated BMI is 25.6');

  // 12.5 Test Validation Errors
  doc.getElementById('lb').value = '';
  doc.getElementById('f').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true }));
  ok(doc.getElementById('err').textContent.length > 5, 'Shows error message when imperial weight is missing');
  ok(doc.getElementById('out').hidden === true, 'Hides output on invalid input');

  // 12.6 Test Reset
  doc.getElementById('rs').click();
  ok(doc.getElementById('err').textContent === '', 'Error cleared after reset');
  ok(doc.getElementById('out').hidden === true, 'Output hidden after reset');
  ok(doc.getElementById('ph').hidden === false, 'Placeholder shown after reset');
}

console.log(`\n${pass} passed, ${failN} failed`);
process.exit(failN ? 1 : 0);
