const { chromium } = require('playwright');

async function testButtonClick() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('#email', 'thabo@kaleidocraft.co.za');
    await page.fill('#password', 'password1234');
    
    // Try evaluating the form submission directly
    const result = await page.evaluate(() => {
      const form = document.querySelector('form');
      const button = document.querySelector('button[type="submit"]');
      
      console.log('Form element:', form);
      console.log('Button element:', button);
      
      if (form && button) {
        // Try to submit the form directly
        form.requestSubmit();
        return 'Form submitted directly';
      }
      return 'No form found';
    });
    
    console.log('Evaluation result:', result);
    await page.waitForTimeout(3000);
    console.log('Final URL:', page.url());
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testButtonClick();