import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

// Capture console errors
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('Console error:', msg.text());
  }
});

page.on('pageerror', error => {
  console.log('Page error:', error.message);
});

console.log('Logging in...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('Logged in!\n');

console.log('Testing /dashboard/deployments...');
await page.goto('http://localhost:9323/dashboard/deployments');
await page.waitForTimeout(10000);

await page.screenshot({ path: '/tmp/deploy-debug.png' });
console.log('Screenshot saved');

await browser.close();
