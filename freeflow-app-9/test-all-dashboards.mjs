import { chromium } from 'playwright';
import { readdirSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

// Only capture critical JS errors
const jsErrors = [];
page.on('pageerror', error => {
  jsErrors.push(error.message);
});

console.log('Logging in as alex@freeflow.io...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
console.log('Logged in!\n');

// Get all dashboard directories
const dashboardDir = 'app/(app)/dashboard';
const dashboards = readdirSync(dashboardDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name.replace('-v2', '').replace('-v3', ''))
  .filter((v, i, a) => a.indexOf(v) === i); // unique

console.log(`Testing ${dashboards.length} dashboards...\n`);

const results = [];
const batchSize = 10;

for (let i = 0; i < dashboards.length; i += batchSize) {
  const batch = dashboards.slice(i, i + batchSize);

  for (const dashboard of batch) {
    jsErrors.length = 0;

    try {
      await page.goto('http://localhost:9323/dashboard/' + dashboard, { timeout: 15000 });
      await page.waitForTimeout(2500);

      // Check for error UI elements
      const errorUI = await page.locator('text=/Something went wrong|Error loading|Failed to load|Application error/i').count();

      // Check for critical JS errors
      const criticalJSErrors = jsErrors.filter(e =>
        !e.includes('hydration') &&
        !e.includes('Minified React error') &&
        (e.includes('is not defined') || e.includes('Cannot read properties') || e.includes('TypeError'))
      );

      if (errorUI > 0 || criticalJSErrors.length > 0) {
        results.push({ dashboard, status: 'FAIL', errors: criticalJSErrors.length > 0 ? criticalJSErrors.slice(0, 1) : ['UI error'] });
        process.stdout.write('X');
      } else {
        results.push({ dashboard, status: 'PASS', errors: [] });
        process.stdout.write('.');
      }
    } catch (err) {
      results.push({ dashboard, status: 'FAIL', errors: [err.message.slice(0, 50)] });
      process.stdout.write('X');
    }
  }

  // Progress indicator
  process.stdout.write(` [${Math.min(i + batchSize, dashboards.length)}/${dashboards.length}]\n`);
}

console.log('\n--- Summary ---');
const failed = results.filter(r => r.status === 'FAIL');
const passed = results.filter(r => r.status === 'PASS');
console.log(`Passed: ${passed.length}/${results.length}`);
console.log(`Failed: ${failed.length}/${results.length}`);

if (failed.length > 0) {
  console.log('\nFailed dashboards:');
  for (const f of failed) {
    console.log(`  ${f.dashboard}: ${f.errors[0]?.slice(0, 80) || 'unknown'}`);
  }
}

await browser.close();
