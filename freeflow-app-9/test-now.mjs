import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

await page.goto('http://localhost:9323/login', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.screenshot({ path: '/tmp/now-1-filled.png' });

await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/now-2-result.png' });
console.log('URL:', page.url());

if (page.url().includes('dashboard')) {
  console.log('SUCCESS! Navigating to clients...');
  await page.goto('http://localhost:9323/dashboard/clients');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/now-3-clients.png' });
}

await page.waitForTimeout(60000);
await browser.close();
