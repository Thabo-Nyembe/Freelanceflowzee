const { chromium } = require('playwright');

async function testSpecificButton() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    
    // Click the specific login button
    await page.click('button:has-text("Sign In")');
    
    await page.waitForTimeout(3000);
    console.log('Final URL:', page.url());
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSpecificButton();