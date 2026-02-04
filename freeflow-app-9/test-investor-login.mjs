import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('🚀 Testing Investor Demo Login\n');

console.log('1. Opening login page...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');

console.log('2. Entering investor demo credentials...');
await page.fill('input[type="email"], input[name="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"], input[name="password"]', 'investor2026');
await page.screenshot({ path: '/tmp/investor-1-login.png' });

console.log('3. Clicking login button...');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/investor-2-after-login.png' });
console.log('   Current URL:', page.url());

console.log('4. Navigating to clients dashboard...');
await page.goto('http://localhost:9323/dashboard/clients');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/investor-3-clients.png' });

console.log('5. Navigating to invoices dashboard...');
await page.goto('http://localhost:9323/dashboard/invoices');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/investor-4-invoices.png' });

console.log('6. Navigating to projects dashboard...');
await page.goto('http://localhost:9323/dashboard/projects');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/investor-5-projects.png' });

console.log('\n✅ Test complete! Screenshots saved to /tmp/investor-*.png');
console.log('Browser will stay open for 60 seconds...\n');

await page.waitForTimeout(60000);
await browser.close();
