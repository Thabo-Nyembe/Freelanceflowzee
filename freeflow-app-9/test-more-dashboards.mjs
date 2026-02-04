import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push({ type: 'console', text: msg.text() });
  }
});
page.on('pageerror', error => {
  errors.push({ type: 'page', text: error.message });
});

console.log('Logging in as alex@freeflow.io...');
await page.goto('http://localhost:9323/login');
await page.waitForLoadState('networkidle');
await page.fill('input[type="email"]', 'alex@freeflow.io');
await page.fill('input[type="password"]', 'investor2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);
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
  errors.length = 0;

  try {
    await page.goto('http://localhost:9323/dashboard/' + dashboard, { timeout: 15000 });
    await page.waitForTimeout(3000);

    const errorText = await page.locator('text=Something went wrong').count();
    const errorLoading = await page.locator('text=Error loading').count();
    const failedLoad = await page.locator('text=Failed to load').count();

    const hasUIError = errorText > 0 || errorLoading > 0 || failedLoad > 0;
    const hasJSError = errors.some(e => !e.text.includes('hydration') && !e.text.includes('favicon'));

    if (hasUIError || hasJSError) {
      results.push({ dashboard, status: 'FAIL', errors: errors.map(e => e.text).slice(0, 2) });
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
      console.log('    - ' + err.slice(0, 120));
    }
  }
}

await browser.close();
