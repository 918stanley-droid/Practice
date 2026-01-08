(function () {
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
      
      // Use iframe approach to bypass CORS with Google Apps Script
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'submission_frame_' + Date.now();
      document.body.appendChild(iframe);
      
      try {
        // Create a temporary form and submit via iframe
        const tempForm = document.createElement('form');
        tempForm.method = 'POST';
        tempForm.action = endpoint;
        tempForm.target = iframe.name;
        tempForm.style.display = 'none';
        
        // Add fields as form data (Google Apps Script expects form-urlencoded by default)
        Object.keys(data).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data[key];
          tempForm.appendChild(input);
        });
        
        document.body.appendChild(tempForm);
        tempForm.submit();
        
        // Show success message immediately
        if (msg) {
          msg.textContent = 'Thanks — your request has been sent. We will contact you shortly.';
          msg.classList.remove('error');
          msg.classList.add('success');
        }
        form.reset();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(tempForm);
          document.body.removeChild(iframe);
        }, 1000);
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
    });
  }

  // Export for tests
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initLeadForm };
  }
  if (typeof window !== 'undefined') {
    window.initLeadForm = initLeadForm;
  }
})();
