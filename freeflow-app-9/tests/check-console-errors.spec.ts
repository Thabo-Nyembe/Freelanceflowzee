import { test } from '@playwright/test';

test('Check Console Errors on My Day', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const logs: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
    if (msg.type() === 'log') logs.push(msg.text());
  });

  page.on('pageerror', error => {
    console.log('❌ PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:9323/dashboard/my-day-v2');
  await page.waitForTimeout(5000); // Wait for everything to load

  console.log('\n=== CONSOLE ERRORS ===');
  errors.forEach(err => console.log(`❌ ${err}`));

  console.log('\n=== CONSOLE WARNINGS ===');
  warnings.slice(0, 5).forEach(warn => console.log(`⚠️  ${warn}`));

  console.log('\n=== CONSOLE LOGS ===');
  logs.slice(0, 10).forEach(log => console.log(`📝 ${log}`));
});
