const { chromium } = require('playwright');

async function testSimpleLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:9323/login');
    
    console.log('2. Waiting for page to load...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for React hydration
    
    console.log('3. Taking screenshot...');
    await page.screenshot({ path: 'login-state.png' });
    
    console.log('4. Looking for any input fields...');
    const inputs = await page.locator('input').count();
    console.log(`Found ${inputs} input fields`);
    
    if (inputs > 0) {
      console.log('5. Filling form...');
      const emailInput = page.locator('input').first();
      const passwordInput = page.locator('input').last();
      
      await emailInput.fill('thabo@kaleidocraft.co.za');
      await passwordInput.fill('password1234');
      
      console.log('6. Looking for submit button...');
      const buttons = await page.locator('button').count();
      console.log(`Found ${buttons} buttons`);
      
      if (buttons > 0) {
        await page.locator('button[type="submit"]').click();
        
        console.log('7. Waiting for redirect...');
        await page.waitForTimeout(5000);
        console.log('Final URL:', page.url());
      }
    } else {
      console.log('No input fields found. Login form may not have loaded.');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('Current URL:', page.url());
  } finally {
    await browser.close();
  }
}

testSimpleLogin();