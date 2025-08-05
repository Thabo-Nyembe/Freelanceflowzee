const { chromium } = require('playwright');

async function testLogoutDebug() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    console.log('1. Logging in manually...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
      localStorage.setItem('kazi-auth', 'true');
      localStorage.setItem('kazi-user', JSON.stringify({ email: 'thabo@kaleidocraft.co.za', name: 'Test User' }));
      window.location.href = '/dashboard';
    });
    
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('2. Successfully logged in to dashboard');
    
    console.log('3. Looking for logout button...');
    const logoutButton = await page.locator('[data-testid="logout"]');
    const buttonExists = await logoutButton.count();
    console.log(`Logout button count: ${buttonExists}`);
    
    if (buttonExists > 0) {
      console.log('4. Trying direct logout via page.evaluate...');
      await page.evaluate(() => {
        console.log('Manual logout - clearing localStorage and redirecting...');
        localStorage.removeItem('kazi-auth');
        localStorage.removeItem('kazi-user');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
        localStorage.removeItem('session-data');
        window.location.href = '/';
      });
      
      console.log('5. Waiting for redirect...');
      await page.waitForTimeout(3000);
      console.log('Current URL after logout:', page.url());
      
      // Check localStorage
      const authAfterLogout = await page.evaluate(() => {
        return {
          'kazi-auth': localStorage.getItem('kazi-auth'),
          'kazi-user': localStorage.getItem('kazi-user')
        };
      });
      console.log('LocalStorage after logout:', authAfterLogout);
    } else {
      console.log('Logout button not found');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLogoutDebug();