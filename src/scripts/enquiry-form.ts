/**
 * Enquiry form behaviour: validation, accessible errors, loading/success/error states.
 * Success is shown ONLY after the server answered with a successful HTTP status.
 */
const form = document.getElementById('enquiry-form') as HTMLFormElement | null;

if (form) {
  const endpoint = form.dataset.endpoint ?? '';
  const email = form.dataset.email ?? '';
  const submit = document.getElementById('form-submit') as HTMLButtonElement;
  const successBox = document.getElementById('form-success') as HTMLElement;
  const errorBox = document.getElementById('form-error') as HTMLElement;
  const errorText = document.getElementById('form-error-text') as HTMLElement;
  const mailto = document.getElementById('form-mailto') as HTMLAnchorElement;
  const notice = document.getElementById('form-config-notice');
  const submitLabel = submit.textContent ?? 'Request a Consultation';

  // Pre-select a program from ?program=... (e.g. links from program pages).
  const wanted = new URLSearchParams(window.location.search).get('program');
  const programSelect = form.elements.namedItem('program') as HTMLSelectElement | null;
  if (wanted && programSelect && [...programSelect.options].some((o) => o.value === wanted)) {
    programSelect.value = wanted;
  }

  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const errorEl = (input: HTMLElement) => document.getElementById(`${input.id}-error`) as HTMLElement | null;

  const setError = (input: HTMLElement, message: string) => {
    const el = errorEl(input);
    input.setAttribute('aria-invalid', 'true');
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
  };
  const clearError = (input: HTMLElement) => {
    const el = errorEl(input);
    input.removeAttribute('aria-invalid');
    if (el) {
      el.textContent = '';
      el.hidden = true;
    }
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validate = (): HTMLElement[] => {
    const bad: HTMLElement[] = [];
    const name = field('name');
    const mail = field('email');
    const phone = field('phone');
    const consent = field('consent');

    [name, mail, phone, consent].forEach(clearError);

    if (!name.value.trim()) {
      setError(name, 'Enter your full name.');
      bad.push(name);
    }
    if (!mail.value.trim()) {
      setError(mail, 'Enter your email address.');
      bad.push(mail);
    } else if (!EMAIL_RE.test(mail.value.trim())) {
      setError(mail, 'Enter a valid email address, for example name@example.com.');
      bad.push(mail);
    }
    const digits = phone.value.replace(/\D/g, '');
    if (phone.value.trim() && (digits.length < 7 || digits.length > 15 || /[^\d+()\-\s.]/.test(phone.value))) {
      setError(phone, 'Enter a valid phone number, or leave this blank.');
      bad.push(phone);
    }
    if (!consent.checked) {
      setError(consent, 'Tick the box to agree before sending your enquiry.');
      bad.push(consent);
    }
    return bad;
  };

  const buildMailto = (data: FormData) => {
    const lines = [
      `Name: ${data.get('name') ?? ''}`,
      `Email: ${data.get('email') ?? ''}`,
      `Phone: ${data.get('phone') ?? ''}`,
      `City: ${data.get('city') ?? ''}`,
      `Preferred program: ${programSelect?.selectedOptions[0]?.text ?? ''}`,
      `Primary fitness goal: ${data.get('goal') ?? ''}`,
      '',
      String(data.get('message') ?? ''),
    ];
    return `mailto:${email}?subject=${encodeURIComponent('Proteinworkk enquiry')}&body=${encodeURIComponent(lines.join('\n'))}`;
  };

  const showError = (message: string, data: FormData) => {
    errorText.textContent = message;
    mailto.href = buildMailto(data);
    mailto.textContent = 'Open an email with my details';
    errorBox.hidden = false;
    errorBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const setLoading = (loading: boolean) => {
    submit.disabled = loading;
    submit.textContent = loading ? 'Sending…' : submitLabel;
    form.setAttribute('aria-busy', String(loading));
  };

  // Clear a field's error as soon as the person starts fixing it.
  ['name', 'email', 'phone', 'consent'].forEach((n) => {
    const el = field(n);
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.hidden = true;

    const invalid = validate();
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);

    // Honeypot filled: almost certainly a bot. Stop quietly, show nothing, send nothing.
    if (String(data.get('_gotcha') ?? '') !== '') return;

    // Not configured: be honest. Nothing was sent.
    if (!endpoint) {
      showError(
        'This form is not connected yet, so nothing has been sent. Please email us instead; the button below opens an email with the details you entered.',
        data,
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        let detail = '';
        try {
          const json = await response.json();
          if (Array.isArray(json?.errors)) detail = json.errors.map((e: { message?: string }) => e.message).filter(Boolean).join(' ');
        } catch {
          /* response was not JSON */
        }
        showError(
          `Your enquiry could not be sent${detail ? ` (${detail})` : ''}. Please try again, or email us instead.`,
          data,
        );
        return;
      }

      // Real success: the server accepted it.
      form.hidden = true;
      notice?.setAttribute('hidden', '');
      successBox.hidden = false;
      successBox.focus();
      // Only non-personal details go to analytics.
      (window as unknown as { pwTrack?: (n: string, p?: Record<string, string>) => void }).pwTrack?.('enquiry_submitted', {
        program: String(data.get('program') ?? ''),
        goal: String(data.get('goal') ?? ''),
      });
    } catch {
      showError('Your enquiry could not be sent because of a connection problem. Please try again, or email us instead.', data);
    } finally {
      setLoading(false);
    }
  });
}

export {};
