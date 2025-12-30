const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('success') || text.includes('Created') || text.includes('Failed') || text.includes('Error')) {
      console.log(`[${msg.type()}]`, text);
    }
  });

  // Login
  await page.goto('http://localhost:9323/login');
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', 'test@kazi.dev');
  await page.fill('input[type="password"]', 'test12345');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(5000);

  // Navigate to budgets
  await page.goto('http://localhost:9323/dashboard/budgets-v2');
  await page.waitForTimeout(3000);

  console.log('Opening Add Transaction modal...');
  const addBtn = await page.locator('button:has-text("Add Transaction")').first();
  await addBtn.click();
  await page.waitForTimeout(1500);

  // Fill form - just required fields
  console.log('Filling form...');
  await page.fill('#txn-description', 'Test Transaction - Database Check');
  await page.fill('input[type="number"]', '99.99');

  // Take screenshot before submit
  await page.screenshot({ path: '/tmp/test-before-submit.png' });
  console.log('Screenshot before submit saved');

  // Submit without selecting category (defaults to General)
  console.log('Clicking submit...');
  const submitBtn = await page.locator('button:has-text("Add Expense")').first();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  // Take screenshot after submit
  await page.screenshot({ path: '/tmp/test-after-submit.png' });
  console.log('Screenshot after submit saved');

  await page.waitForTimeout(3000);
  await browser.close();
})();
