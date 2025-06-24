import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set test mode headers
  await page.setExtraHTTPHeaders({
    'x-test-mode': 'true',
    'user-agent': 'Playwright/Test Runner'
  });

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Fill login form with test credentials
    await page.fill('[data-testid="email-input"]', 'test@freeflowzee.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');

    // Wait for successful login and navigation
    await page.waitForURL('**/dashboard');

    // Store authentication state
    await page.context().storageState({
      path: './tests/storage-state.json'
    });

  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
