const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  retries: process.env.CI ? 1 : 0,
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173',
  },
  webServer: {
    command: 'npx http-server -p 4173 .',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
});
