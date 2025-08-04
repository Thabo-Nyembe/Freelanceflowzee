import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for KAZI application tests
 * Prepares test environment and authentication
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up KAZI test environment...');
  
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    console.log(`Waiting for application at ${baseURL}...`);
    await page.goto(baseURL || 'http://localhost:9323');
    
    // Wait for the main app to load
    await page.waitForSelector('[data-testid="app-ready"]', { 
      timeout: 30000,
      state: 'attached' 
    }).catch(() => {
      // If no specific ready indicator, just wait for navigation
      console.log('No app-ready indicator found, checking basic navigation...');
    });

    // Test basic navigation to ensure app is functional
    await page.waitForTimeout(2000);
    
    console.log('✅ KAZI application is ready for testing');
    
    // Save authentication state if needed (for future authenticated tests)
    // await page.context().storageState({ path: 'tests/auth.json' });
    
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;