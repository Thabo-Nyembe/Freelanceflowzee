import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

// Only capture JS errors (not network errors)
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

const dashboards = [
  'announcements',
  'broadcasts',
  'compliance',
  'expenses',
  'lead-generation',
  'logistics',
  'maintenance',
  'payroll',
  'roles',
  'third-party-integrations',
  'inventory',
  'suppliers',
  'purchase-orders',
  'quality-control',
  'workflows',
  'automations',
  'templates',
  'knowledge-base',
  'support-tickets',
  'contracts',
  'documents',
  'e-signatures'
];

const results = [];

for (const dashboard of dashboards) {
  jsErrors.length = 0;

  try {
    await page.goto('http://localhost:9323/dashboard/' + dashboard, { timeout: 20000 });
    await page.waitForTimeout(4000);

    // Check for error UI elements
    const errorUI = await page.locator('text=/Something went wrong|Error loading|Failed to load|Error:|Application error/i').count();

    // Check for loading stuck state
    const loadingStuck = await page.locator('text=/Loading\\.\\.\\.$/').count();

    // Check for JS errors that aren't just hydration warnings
    const criticalJSErrors = jsErrors.filter(e =>
      !e.includes('hydration') &&
      !e.includes('Minified React error') &&
      (e.includes('is not defined') || e.includes('Cannot read properties') || e.includes('TypeError'))
    );

    if (errorUI > 0 || criticalJSErrors.length > 0) {
      results.push({ dashboard, status: 'FAIL', errors: criticalJSErrors.length > 0 ? criticalJSErrors : ['UI shows error state'] });
    } else {
      results.push({ dashboard, status: 'PASS', errors: [] });
    }
  } catch (err) {
    results.push({ dashboard, status: 'FAIL', errors: [err.message] });
  }

  console.log(dashboard + ': ' + results[results.length-1].status);
}

console.log('\n--- Summary ---');
const failed = results.filter(r => r.status === 'FAIL');
const passed = results.filter(r => r.status === 'PASS');
console.log('Passed: ' + passed.length + '/' + results.length);
console.log('Failed: ' + failed.length + '/' + results.length);

if (failed.length > 0) {
  console.log('\nFailed dashboards:');
  for (const f of failed) {
    console.log('  ' + f.dashboard + ':');
    for (const err of f.errors) {
      console.log('    - ' + err.slice(0, 100));
    }
  }
}

await browser.close();
