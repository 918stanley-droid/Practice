const fs = require('fs');
const path = require('path');
const { axe, toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);

describe('accessibility checks', () => {
  let html;

  beforeEach(() => {
    html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    document.documentElement.innerHTML = html;
  });

  test('page has no obvious accessibility violations (axe)', async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  test('form has aria-describedby and live region', () => {
    const form = document.getElementById('leadForm');
    const msg = document.getElementById('formMessage');
    expect(form.getAttribute('aria-describedby')).toBe('formMessage');
    expect(msg.getAttribute('role')).toBe('status');
  });
});
