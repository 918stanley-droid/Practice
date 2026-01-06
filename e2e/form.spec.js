const { test, expect } = require('@playwright/test');

// Helpers to stub outbound calls (only the form submission endpoint)
const stubOutbound = async (page) => {
  await page.route('https://script.google.com/**', (route) => {
    route.fulfill({ status: 200, body: JSON.stringify({ status: 'success' }), headers: { 'content-type': 'application/json' } });
  });
};

test.beforeEach(async ({ page }) => {
  await stubOutbound(page);
});

test('form submission shows success message', async ({ page }) => {
  await page.goto('/');
  await page.fill('#name', 'Test User');
  await page.fill('#email', 'test@example.com');
  await page.fill('#description', 'Two-bedroom move next week.');
  await page.getByRole('button', { name: /get your free quote/i }).click();

  const msg = page.locator('#formMessage');
  await expect(msg).toContainText(/thanks/i);
});
