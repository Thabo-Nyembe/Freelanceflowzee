import { chromium, FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

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
    // Wait for server to be ready
    let retries = 5;
    while (retries > 0) {
      try {
        await page.goto(baseURL);
        break;
      } catch (error) {
        console.log(`Waiting for server to be ready... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries--;
        if (retries === 0) throw error;
      }
    }

    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Fill login form with test credentials
    await page.fill('[data-testid="email-input"]', 'test@freeflowzee.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');

    // Wait for successful login and navigation
    await page.waitForURL('**/dashboard');

    // Ensure storage directory exists
    const storageDir = path.join(process.cwd(), 'tests', 'storage');
    await fs.mkdir(storageDir, { recursive: true });

    // Store authentication state
    await page.context().storageState({
      path: path.join(storageDir, 'storage-state.json')
    });

  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
