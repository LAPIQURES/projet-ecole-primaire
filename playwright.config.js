/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: 'http://localhost:3002'
  },
  testDir: 'tests/e2e'
};
module.exports = config;
