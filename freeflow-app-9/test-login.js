const { chromium } = require('playwright');

async function testLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    console.log('2. Checking for login form...');
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.waitForSelector('#password', { timeout: 10000 });
    
    console.log('3. Filling login form...');
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    
    console.log('4. Submitting form...');
    await page.click('button[type="submit"]');
    
    console.log('5. Waiting for redirect...');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed - still on:', currentUrl);
      
      // Check for any error messages
      const errorElements = await page.$$('[class*="error"], [role="alert"]');
      if (errorElements.length > 0) {
        console.log('Found error elements:', errorElements.length);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin();