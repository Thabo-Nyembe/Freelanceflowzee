import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Create directories for test artifacts
  const fs = require('fs');
  const dirs = [
    'test-results/screenshots',
    'test-results/videos', 
    'test-results/traces'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Verify test server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3001', { timeout: 30000 });
    console.log('✅ Test server is accessible');
  } catch (error) {
    console.error('❌ Test server is not accessible');
    throw new Error('Test server must be running on localhost:3001');
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup complete');
}

export default globalSetup;
