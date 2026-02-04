import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('1. Opening login page...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/1-login-page.png' });
console.log('   ✅ Screenshot: /tmp/1-login-page.png');

console.log('2. Entering demo credentials...');
await page.fill('input[type="email"], input[name="email"]', 'test@kazi.dev');
await page.fill('input[type="password"], input[name="password"]', 'test12345');
await page.screenshot({ path: '/tmp/2-credentials-entered.png' });
console.log('   ✅ Screenshot: /tmp/2-credentials-entered.png');

console.log('3. Clicking login button...');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/3-after-login.png' });
console.log('   ✅ Screenshot: /tmp/3-after-login.png');
console.log('   Current URL:', page.url());

console.log('4. Navigating to clients dashboard...');
await page.goto('http://localhost:9323/dashboard/clients');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/4-clients-dashboard.png' });
console.log('   ✅ Screenshot: /tmp/4-clients-dashboard.png');

console.log('5. Navigating to invoices dashboard...');
await page.goto('http://localhost:9323/dashboard/invoices');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/5-invoices-dashboard.png' });
console.log('   ✅ Screenshot: /tmp/5-invoices-dashboard.png');

console.log('\n✅ Demo test complete!');
console.log('Keeping browser open for inspection...');

await page.waitForTimeout(60000);
await browser.close();
