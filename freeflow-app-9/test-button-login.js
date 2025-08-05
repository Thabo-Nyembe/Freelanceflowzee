const { chromium } = require('playwright');

async function testButtonLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    console.log('2. Waiting for form to load...');
    await page.waitForSelector('#email', { timeout: 10000 });
    
    console.log('3. Filling form...');
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    
    console.log('4. Clicking login button...');
    await page.click('button');
    
    console.log('5. Waiting for redirect...');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    console.log('✅ Login successful! URL:', page.url());
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('Current URL:', page.url());
  } finally {
    await browser.close();
  }
}

testButtonLogin();