import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
const warnings = [];

page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(`[ERROR] ${msg.text()}`);
  } else if (msg.type() === 'warning') {
    warnings.push(`[WARN] ${msg.text()}`);
  }
});

page.on('pageerror', err => {
  errors.push(`[PAGE ERROR] ${err.message}`);
});

page.on('requestfailed', req => {
  errors.push(`[NETWORK] ${req.failure()?.errorText} - ${req.url()}`);
});

console.log('Logging in...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

const pagesToTest = [
  '/dashboard/clients-v2',
  '/dashboard/invoices-v2',
  '/dashboard/projects-hub-v2',
  '/dashboard/messages-v2',
  '/dashboard/calendar-v2'
];

for (const p of pagesToTest) {
  console.log(`\n--- Testing ${p} ---`);
  errors.length = 0;
  warnings.length = 0;

  await page.goto(`http://localhost:9323${p}`);
  await page.waitForTimeout(3000);

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log('  ' + e));
  } else {
    console.log('No errors');
  }

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.slice(0, 5).forEach(w => console.log('  ' + w));
  }
}

await browser.close();
console.log('\nDone!');
