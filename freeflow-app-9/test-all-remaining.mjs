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
  '/dashboard',
  '/dashboard/clients',
  '/dashboard/invoices',
  '/dashboard/files',
  '/dashboard/calendar',
  '/dashboard/tasks',
  '/dashboard/messages',
  '/dashboard/api-keys',
  '/dashboard/audit-logs',
  '/dashboard/assets',
  '/dashboard/vendors',
  '/dashboard/shipping',
  '/dashboard/warehouse',
  '/dashboard/ci-cd',
  '/dashboard/deployments',
  '/dashboard/milestones',
  '/dashboard/sprints',
  '/dashboard/backlog',
  '/dashboard/feedback',
  '/dashboard/time-tracking',
];

for (let i = 0; i < pagesToTest.length; i++) {
  const p = pagesToTest[i];
  console.log((i + 1) + '. Testing ' + p + '...');

  try {
    await page.goto('http://localhost:9323' + p, { timeout: 12000 });
    await page.waitForTimeout(2500);

    const finalUrl = page.url();
    const errorText = await page.locator('text=Something went wrong').count();
    const unknownError = await page.locator('text=Unknown error').count();

    if (errorText > 0 || unknownError > 0) {
      console.log('   ❌ Error');
    } else {
      console.log('   ✅ ' + finalUrl.split('/').pop());
    }
  } catch (err) {
    console.log('   ❌ Timeout/Failed');
  }
}

await browser.close();
console.log('\nDone!');
