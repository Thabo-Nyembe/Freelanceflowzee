import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

page.on('pageerror', error => {
  console.log('JS Error:', error.message.slice(0, 100));
});

console.log('Logging in...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);

const pages = ['admin-overview', 'admin', 'ai-design', 'ai-enhanced', 'api-keys'];

for (const p of pages) {
  console.log(`\nTesting ${p}...`);
  await page.goto(`http://localhost:9323/dashboard/${p}`, { timeout: 30000 });
  await page.waitForTimeout(3000);

  const errorUI = await page.locator('text=/Something went wrong|Error loading|Failed to load|Application error/i').count();
  console.log(`  UI errors: ${errorUI}`);

  await page.screenshot({ path: `/tmp/${p}.png` });
}

await browser.close();
console.log('\nDone - screenshots saved to /tmp/');
