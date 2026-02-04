import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('Logging in...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('Logged in!\n');

const pagesToTest = [
  '/dashboard/projects',
  '/dashboard/analytics',
  '/dashboard/team',
  '/dashboard/settings',
  '/dashboard/reports',
  '/dashboard/leads',
  '/dashboard/crm',
  '/dashboard/inventory',
  '/dashboard/orders',
  '/dashboard/products',
  '/dashboard/employees',
  '/dashboard/payroll',
  '/dashboard/expenses',
  '/dashboard/budgets',
  '/dashboard/campaigns'
];

for (let i = 0; i < pagesToTest.length; i++) {
  const p = pagesToTest[i];
  console.log(`${i + 1}. Testing ${p}...`);

  try {
    await page.goto(`http://localhost:9323${p}`, { timeout: 10000 });
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    const pageName = p.split('/').pop();
    await page.screenshot({ path: `/tmp/page-${pageName}.png` });

    // Check for errors
    const errorText = await page.locator('text=Something went wrong').count();
    const noDataText = await page.locator('text=No data').count() + await page.locator('text=No results').count() + await page.locator('text=not found').count();

    if (errorText > 0) {
      console.log(`   ❌ Error on page`);
    } else if (noDataText > 0) {
      console.log(`   ⚠️  No data shown - ${finalUrl}`);
    } else {
      console.log(`   ✅ ${finalUrl}`);
    }
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}`);
  }
}

await browser.close();
console.log('\nDone! Screenshots saved to /tmp/');
