(function () {
  function loadAnalytics(measurementId) {
    if (!measurementId) return;
    if (document.getElementById('ga-script')) return; // already loaded

    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', measurementId, { anonymize_ip: true });
  }

  function initAnalyticsConsent() {
    const banner = document.getElementById('consentBanner');
    if (!banner) return;

    const acceptBtn = document.getElementById('consentAccept');
    const declineBtn = document.getElementById('consentDecline');

    const setHidden = (el, value) => {
      if (!el) return;
      el.hidden = value;
      if (value) {
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('aria-hidden');
      }
    };

    const loadIfPermitted = (consentValue) => {
      const measurementId = (document.body && document.body.dataset && document.body.dataset.analyticsId) || null;
      if (consentValue === 'granted') {
        loadAnalytics(measurementId);
        setHidden(banner, true);
      } else if (consentValue === 'denied') {
        setHidden(banner, true);
      } else {
        setHidden(banner, false);
      }
    };

    let stored = null;
    try {
      stored = window.localStorage.getItem('analytics-consent');
    } catch (err) {
      // ignore storage issues
    }

    loadIfPermitted(stored);

    const handleChoice = (value) => {
      try {
        window.localStorage.setItem('analytics-consent', value);
      } catch (err) {
        // ignore storage issues
      }
      loadIfPermitted(value);
    };

    if (acceptBtn) acceptBtn.addEventListener('click', () => handleChoice('granted'));
    if (declineBtn) declineBtn.addEventListener('click', () => handleChoice('denied'));
  }

  function initLeadForm() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const form = document.getElementById('leadForm');
    if (!form) return;

    const msg = document.getElementById('formMessage');
    const submitBtn = form.querySelector('button[type="submit"]');

    async function handleSubmit(e) {
      e.preventDefault();

      // Use built-in validation where possible
      if (!form.checkValidity()) {
        // mark invalid fields with aria-invalid and focus the first invalid field
        const invalids = Array.from(form.querySelectorAll(':invalid'));
        invalids.forEach((el) => {
          el.setAttribute('aria-invalid', 'true');
          const onInput = () => {
            el.removeAttribute('aria-invalid');
            el.removeEventListener('input', onInput);
          };
          el.addEventListener('input', onInput);
        });
        try {
          form.reportValidity();
        } catch (err) {
          // reportValidity may not exist in some test environments — ignore
        }
        if (invalids.length) invalids[0].focus();
        if (msg) msg.textContent = 'Please fix the marked fields and try again.';
        return;
      }

      const data = {
        name: (form.name && form.name.value) ? form.name.value.trim() : '',
        email: (form.email && form.email.value) ? form.email.value.trim() : '',
        phone: (form.phone && form.phone.value) ? form.phone.value.trim() : '',
        description: (form.description && form.description.value) ? form.description.value.trim() : ''
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
      }

      // Anti-spam: check honeypot
      const hp = form.querySelector('input[name="website"]');
      if (hp && hp.value && hp.value.trim()) {
        // Treat as spam: don't send to server — pretend it succeeded to avoid feedback to bots
        if (msg) {
          msg.textContent = 'Thanks — your request has been sent.';
          msg.classList.remove('error');
          msg.classList.add('success');
        }
        form.reset();
        return;
      }

      const endpoint = form.dataset.endpoint;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          mode: 'cors'
        });

        if (!res.ok) throw new Error('Network response was not ok');

        if (msg) {
          msg.textContent = 'Thanks — your request has been sent. We will contact you shortly.';
          msg.classList.remove('error');
          msg.classList.add('success');
        }
        form.reset();
      } catch (err) {
        if (msg) {
          msg.textContent = 'Sorry — we could not submit the form right now. Please try again later.';
          msg.classList.remove('success');
          msg.classList.add('error');
        }
        // keep the error visible in console for debugging
        if (typeof console !== 'undefined' && console.error) console.error(err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.setAttribute('aria-disabled', 'false');
        }
      }
    }

    form.addEventListener('submit', handleSubmit);
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      initLeadForm();
      initAnalyticsConsent();
    });
  }

  // Export for tests
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initLeadForm, initAnalyticsConsent, loadAnalytics };
  }
  if (typeof window !== 'undefined') {
    window.initLeadForm = initLeadForm;
    window.initAnalyticsConsent = initAnalyticsConsent;
    window.loadAnalytics = loadAnalytics;
  }
})();
