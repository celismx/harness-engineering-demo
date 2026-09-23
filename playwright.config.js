const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  use: { baseURL: 'http://localhost:3000', headless: true },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
