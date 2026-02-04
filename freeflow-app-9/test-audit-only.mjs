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

console.log('Testing /dashboard/audit-logs with longer wait...');
await page.goto('http://localhost:9323/dashboard/audit-logs');
await page.waitForTimeout(6000);

await page.screenshot({ path: '/tmp/audit-long-wait.png' });
console.log('Screenshot saved to /tmp/audit-long-wait.png');

const errorText = await page.locator('text=Something went wrong').count();
const loadingText = await page.locator('text=Loading').count();

if (errorText > 0) {
  console.log('Still showing error');
} else if (loadingText > 0) {
  console.log('Still loading');
} else {
  console.log('Page loaded successfully!');
}

await browser.close();
