import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('1. Opening login page...');
await page.goto('http://localhost:9323/login', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/test-1-login.png' });
console.log('   Screenshot saved');

console.log('2. Entering credentials...');
await page.fill('input[type="email"], input[name="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"], input[name="password"]', 'investor2026');
await page.screenshot({ path: '/tmp/test-2-filled.png' });

console.log('3. Submitting...');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/test-3-result.png' });
console.log('   URL after login:', page.url());

console.log('4. Going to clients...');
await page.goto('http://localhost:9323/dashboard/clients', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/test-4-clients.png' });

console.log('\nDone! Browser staying open...');
await page.waitForTimeout(120000);
await browser.close();
