import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

const pages = [
  '/dashboard/clients',
  '/dashboard/invoices',
  '/dashboard/projects',
  '/dashboard/tasks',
  '/dashboard/analytics',
  '/dashboard/calendar',
  '/dashboard/team',
  '/dashboard/files',
  '/dashboard/messages',
  '/dashboard/settings'
];

console.log('🚀 Testing all dashboard pages...\n');

// First login
console.log('1. Logging in...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('   Logged in!\n');

// Test each page
for (let i = 0; i < pages.length; i++) {
  const pagePath = pages[i];
  console.log(`${i + 2}. Testing ${pagePath}...`);

  await page.goto(`http://localhost:9323${pagePath}`);
  await page.waitForTimeout(2000);

  const finalUrl = page.url();
  if (finalUrl.includes('-v2')) {
    console.log(`   ✅ Redirected to: ${finalUrl}`);
  } else {
    console.log(`   ⚠️  Final URL: ${finalUrl}`);
  }

  await page.screenshot({ path: `/tmp/test-page-${i + 1}-${pagePath.split('/').pop()}.png` });
}

console.log('\n✅ All pages tested! Browser staying open for 60 seconds...');
await page.waitForTimeout(60000);
await browser.close();
