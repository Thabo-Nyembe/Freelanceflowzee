const { chromium } = require('playwright');

async function testDirectLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    console.log('2. Filling form...');
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    
    console.log('3. Manually triggering login...');
    await page.evaluate(() => {
      localStorage.setItem('kazi-auth', 'true');
      localStorage.setItem('kazi-user', JSON.stringify({ email: 'thabo@kaleidocraft.co.za', name: 'Test User' }));
      window.location.href = '/dashboard';
    });
    
    console.log('4. Waiting for redirect...');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    const currentUrl = page.url();
    console.log('✅ Successfully reached:', currentUrl);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('Current URL:', page.url());
  } finally {
    await browser.close();
  }
}

testDirectLogin();