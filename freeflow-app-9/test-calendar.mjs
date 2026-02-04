import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('Logging in...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('Logged in!');

console.log('Going to /dashboard/calendar...');
await page.goto('http://localhost:9323/dashboard/calendar');
await page.waitForTimeout(5000);

const finalUrl = page.url();
console.log(`Final URL: ${finalUrl}`);

await page.screenshot({ path: '/tmp/calendar-test.png' });
console.log('Screenshot saved to /tmp/calendar-test.png');

await page.waitForTimeout(15000);
await browser.close();
