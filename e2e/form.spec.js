const { test, expect } = require('@playwright/test');

// Helpers to stub outbound calls
const stubOutbound = async (page) => {
  // Fake Apps Script endpoint
  await page.route('https://script.google.com/**', (route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ status: 'success' }), headers: { 'content-type': 'application/json' } });
  });
  // Fake GA script load
  await page.route('https://www.googletagmanager.com/gtag/js**', (route) => {
    route.fulfill({ status: 200, body: '' });
  });
};

test.beforeEach(async ({ page }) => {
  await stubOutbound(page);
});

test('form submission shows success message', async ({ page }) => {
  // Avoid consent prompt interfering with submit flow
  await page.addInitScript(() => localStorage.setItem('analytics-consent', 'denied'));

  await page.goto('/');
  await page.fill('#name', 'Test User');
  await page.fill('#email', 'test@example.com');
  await page.fill('#description', 'Two-bedroom move next week.');
  await page.getByRole('button', { name: /get your free quote/i }).click();

  const msg = page.locator('#formMessage');
  await expect(msg).toContainText(/thanks/i);
});

test('analytics consent accept hides banner and loads tag', async ({ page }) => {
  await page.goto('/');

  const banner = page.locator('#consentBanner');
  await expect(banner).toBeVisible();

  await page.getByRole('button', { name: /allow analytics/i }).click();

  await expect(banner).toBeHidden();
  const gaScript = page.locator('#ga-script');
  await expect(gaScript).toHaveAttribute('src', /googletagmanager/);
});

test('analytics consent decline hides banner and does not load tag', async ({ page }) => {
  await page.goto('/');

  const banner = page.locator('#consentBanner');
  await expect(banner).toBeVisible();

  await page.getByRole('button', { name: /no, thanks/i }).click();

  await expect(banner).toBeHidden();
  const gaScript = page.locator('#ga-script');
  await expect(gaScript).toHaveCount(0);
});
