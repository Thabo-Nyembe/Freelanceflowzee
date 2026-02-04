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

const errorPages = [
  '/dashboard/audit-logs',
  '/dashboard/ci-cd',
  '/dashboard/deployments',
  '/dashboard/milestones',
  '/dashboard/feedback',
];

for (const p of errorPages) {
  console.log('Testing ' + p + '...');
  const pageName = p.split('/').pop();

  try {
    await page.goto('http://localhost:9323' + p, { timeout: 15000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: '/tmp/err-' + pageName + '.png' });
    console.log('   Screenshot: /tmp/err-' + pageName + '.png');

    // Try to get error text
    const errorBox = await page.locator('.bg-red-50, [class*="error"], .text-red').first();
    if (await errorBox.isVisible()) {
      const text = await errorBox.textContent();
      console.log('   Error: ' + (text || '').substring(0, 100));
    }
  } catch (err) {
    console.log('   Failed: ' + err.message);
  }
  console.log('');
}

await browser.close();
console.log('Done!');
