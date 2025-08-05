const { chromium } = require('playwright');

async function testFormLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    console.log('2. Waiting for form inputs...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    console.log('3. Filling form...');
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    
    console.log('4. Clicking submit button...');
    await page.click('button[type="submit"]');
    
    console.log('5. Waiting for redirect...');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    console.log('✅ Form login successful! URL:', page.url());
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('Current URL:', page.url());
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'login-debug.png' });
    console.log('Screenshot saved to login-debug.png');
  } finally {
    await browser.close();
  }
}

testFormLogin();