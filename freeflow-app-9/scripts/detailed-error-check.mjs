#!/usr/bin/env node

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:9323';

const ROUTES = [
  { path: '/v2/dashboard', name: 'Dashboard' },
  { path: '/v2/dashboard/projects', name: 'Projects' },
  { path: '/v2/dashboard/messages', name: 'Messages' },
  { path: '/v2/dashboard/profile', name: 'Profile' },
  { path: '/v2/dashboard/settings', name: 'Settings' },
  { path: '/v2/dashboard/reports', name: 'Reports' },
  { path: '/v2/dashboard/activity-logs', name: 'Activity Logs' },
  { path: '/v2/dashboard/ai-assistant', name: 'AI Assistant' },
  { path: '/v2/dashboard/crypto-payments', name: 'Crypto' },
  { path: '/v2/dashboard/escrow', name: 'Escrow' }
];

async function main() {
  console.log('='.repeat(70));
  console.log('DETAILED CONSOLE ERROR CHECK - DEMO MODE');
  console.log('='.repeat(70));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    let errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out noisy errors
        if (!text.includes('Download the React DevTools') &&
            !text.includes('favicon') &&
            !text.includes('manifest')) {
          errors.push(text);
        }
      }
    });

    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });

    try {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`${route.name} (${route.path})`);
      console.log('='.repeat(70));

      await page.goto(`${BASE_URL}${route.path}?demo=true`, {
        waitUntil: 'networkidle0',
        timeout: 20000
      });

      await new Promise(r => setTimeout(r, 2000));

      if (errors.length > 0) {
        console.log(`Found ${errors.length} console error(s):`);
        errors.forEach((err, i) => {
          // Truncate long errors
          const displayErr = err.length > 300 ? err.substring(0, 300) + '...' : err;
          console.log(`\n  [${i + 1}] ${displayErr}`);
        });
      } else {
        console.log('No console errors');
      }
    } catch (error) {
      console.log(`Navigation error: ${error.message.substring(0, 100)}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n' + '='.repeat(70));
  console.log('Done');
  console.log('='.repeat(70));
}

main().catch(console.error);
