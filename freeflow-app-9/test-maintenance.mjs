import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

page.on('pageerror', error => {
  console.log('JS Error:', error.message);
});

console.log('Logging in...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);

console.log('Testing maintenance...');
await page.goto('http://localhost:9323/dashboard/maintenance', { timeout: 30000 });
await page.waitForTimeout(5000);

await page.screenshot({ path: '/tmp/maintenance-debug.png' });
console.log('Screenshot saved to /tmp/maintenance-debug.png');

// Check for error text
const bodyText = await page.textContent('body');
if (bodyText.includes('Error') || bodyText.includes('Something went wrong')) {
  console.log('Found error in page');
}

await browser.close();
