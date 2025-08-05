const { chromium } = require('playwright');

async function testLoginDebug() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('2. Filling form...');
    await page.fill('input[type="email"]', 'thabo@kaleidocraft.co.za');
    await page.fill('input[type="password"]', 'password1234');
    
    console.log('3. Adding debug listener...');
    await page.evaluate(() => {
      window.addEventListener('beforeunload', () => {
        console.log('Page is about to unload - redirect happening!');
      });
    });
    
    console.log('4. Checking button handlers...');
    const buttonInfo = await page.evaluate(() => {
      const button = document.querySelector('button');
      return {
        exists: !!button,
        text: button?.textContent,
        onclick: button?.onclick !== null,
        listeners: button?.getAttribute('onclick')
      };
    });
    console.log('Button info:', buttonInfo);
    
    console.log('5. Clicking login button...');
    await page.click('button:has-text("Sign In")');
    
    console.log('6. Waiting for potential redirect...');
    try {
      await page.waitForURL('**/dashboard**', { timeout: 8000 });
      console.log('✅ Redirected to dashboard!');
    } catch (e) {
      console.log('No redirect detected, current URL:', page.url());
      
      // Check if localStorage was set
      const auth = await page.evaluate(() => {
        return {
          auth: localStorage.getItem('kazi-auth'),
          user: localStorage.getItem('kazi-user')
        };
      });
      console.log('localStorage auth:', auth);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginDebug();