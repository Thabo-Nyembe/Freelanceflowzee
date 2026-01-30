#!/usr/bin/env node

import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:9323';

const ROUTES = [
  { path: '/v2/dashboard', name: 'Dashboard' },
  { path: '/v2/dashboard/projects', name: 'Projects' },
  { path: '/v2/dashboard/messages', name: 'Messages' },
  { path: '/v2/dashboard/reports', name: 'Reports' }
];

async function main() {
  console.log('='.repeat(60));
  console.log('CHECKING CONSOLE ERRORS');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    let errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });

    try {
      console.log(`\n--- ${route.name} (${route.path}) ---`);

      await page.goto(`${BASE_URL}${route.path}?demo=true`, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      await new Promise(r => setTimeout(r, 2000));

      if (errors.length > 0) {
        console.log(`Found ${errors.length} console errors:`);
        errors.slice(0, 5).forEach((err, i) => {
          console.log(`  ${i + 1}. ${err.substring(0, 200)}...`);
        });
      } else {
        console.log('No console errors');
      }
    } catch (error) {
      console.log(`Error: ${error.message.substring(0, 100)}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

main().catch(console.error);
