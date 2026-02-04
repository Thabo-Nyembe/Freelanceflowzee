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
  '/dashboard/reports',
  '/dashboard/employees',
  '/dashboard/campaigns'
];

for (const p of pagesToTest) {
  console.log(`Testing ${p}...`);

  try {
    await page.goto(`http://localhost:9323${p}`, { timeout: 15000 });
    await page.waitForTimeout(4000);

    const finalUrl = page.url();
    const pageName = p.split('/').pop();
    await page.screenshot({ path: `/tmp/fixed-${pageName}.png` });

    const errorText = await page.locator('text=Something went wrong').count();

    if (errorText > 0) {
      const errorMsg = await page.locator('.text-red-500, .text-red-600').first().textContent();
      console.log(`   ❌ Error: ${errorMsg}`);
    } else {
      console.log(`   ✅ Working - ${finalUrl}`);
    }
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}`);
  }
}

await browser.close();
console.log('\nDone!');
