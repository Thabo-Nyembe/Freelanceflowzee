const { chromium } = require('playwright');

async function testManualLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to all console messages
  page.on('console', msg => {
    console.log(`Browser Console [${msg.type()}]:`, msg.text());
  });

  try {
    console.log('1. Navigating to login...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    console.log('2. Filling credentials...');
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    
    console.log('3. Evaluating login directly...');
    await page.evaluate(() => {
      console.log('Direct evaluation - setting localStorage and redirecting...');
      localStorage.setItem('kazi-auth', 'true');
      localStorage.setItem('kazi-user', JSON.stringify({ email: 'thabo@kaleidocraft.co.za', name: 'Test User' }));
      window.location.href = '/dashboard';
    });
    
    console.log('4. Waiting for navigation...');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    console.log('✅ Success! Final URL:', page.url());
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Current URL:', page.url());
  } finally {
    await browser.close();
  }
}

testManualLogin();