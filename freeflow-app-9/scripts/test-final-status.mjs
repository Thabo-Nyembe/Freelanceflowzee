#!/usr/bin/env node

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:9323';

const ROUTES = [
  { path: '/v2/dashboard', name: 'Dashboard' },
  { path: '/v2/dashboard/projects', name: 'Projects' },
  { path: '/v2/dashboard/clients', name: 'Clients' },
  { path: '/v2/dashboard/invoices', name: 'Invoices' },
  { path: '/v2/dashboard/tasks', name: 'Tasks' },
  { path: '/v2/dashboard/calendar', name: 'Calendar' },
  { path: '/v2/dashboard/time-tracking', name: 'Time Tracking' },
  { path: '/v2/dashboard/analytics', name: 'Analytics' },
  { path: '/v2/dashboard/files', name: 'Files' },
  { path: '/v2/dashboard/messages', name: 'Messages' },
  { path: '/v2/dashboard/notifications', name: 'Notifications' },
  { path: '/v2/dashboard/team', name: 'Team' },
  { path: '/v2/dashboard/financial', name: 'Financial' },
  { path: '/v2/dashboard/profile', name: 'Profile' },
  { path: '/v2/dashboard/settings', name: 'Settings' },
  { path: '/v2/dashboard/reports', name: 'Reports' },
  { path: '/v2/dashboard/activity-logs', name: 'Activity Logs' },
  { path: '/v2/dashboard/integrations', name: 'Integrations' },
  { path: '/v2/dashboard/ai-assistant', name: 'AI Assistant' },
  { path: '/v2/dashboard/crypto-payments', name: 'Crypto' },
  { path: '/v2/dashboard/escrow', name: 'Escrow' }
];

async function main() {
  console.log('='.repeat(60));
  console.log('FINAL STATUS CHECK - DEMO MODE');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const results = { passed: [], failed: [], timeout: [] };

  for (const route of ROUTES) {
    const page = await browser.newPage();
    let consoleErrors = 0;

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors++;
    });

    try {
      await page.goto(`${BASE_URL}${route.path}?demo=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      await new Promise(r => setTimeout(r, 2500));

      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasData = bodyText.length > 200;

      if (hasData) {
        const status = consoleErrors > 0 ? `✓ (${consoleErrors} console errors)` : '✓';
        console.log(`${status} ${route.name.padEnd(18)} ${bodyText.length} chars`);
        results.passed.push(route.name);
      } else {
        console.log(`✗ ${route.name.padEnd(18)} ${bodyText.length} chars (no content)`);
        results.failed.push(route.name);
      }
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log(`⏱ ${route.name.padEnd(18)} timeout`);
        results.timeout.push(route.name);
      } else {
        console.log(`✗ ${route.name.padEnd(18)} ${error.message.substring(0, 30)}`);
        results.failed.push(route.name);
      }
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${results.passed.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);
  console.log(`⏱ Timeout: ${results.timeout.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed pages:');
    results.failed.forEach(p => console.log(`  - ${p}`));
  }
  if (results.timeout.length > 0) {
    console.log('\nTimeout pages:');
    results.timeout.forEach(p => console.log(`  - ${p}`));
  }
}

main().catch(console.error);
