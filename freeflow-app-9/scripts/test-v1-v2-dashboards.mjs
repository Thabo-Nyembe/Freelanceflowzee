#!/usr/bin/env node

/**
 * Test V1 and V2 Dashboard Routes
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:9323';
const SCREENSHOT_DIR = './screenshots/v1-v2-dashboards';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

let passed = 0, failed = 0;

async function testPage(browser, name, path) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await page.goto(`${BASE_URL}${path}?demo=true`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    await delay(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png` });

    const hasData = await page.evaluate(() => {
      const text = document.body.innerText;
      return /\d+\s*(projects?|clients?|tasks?)/i.test(text) ||
             /\$[\d,]+/.test(text) ||
             /Enterprise|Dashboard|Platform|Acme|TechStart/i.test(text);
    });

    if (hasData) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.log(`? ${name} (no data detected)`);
    }

  } catch (error) {
    console.log(`✗ ${name}: ${error.message.substring(0, 50)}`);
    failed++;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('V1 & V2 DASHBOARD VERIFICATION');
  console.log('='.repeat(50));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const routes = [
    // V1 Routes
    { name: 'v1-dashboard', path: '/v1/dashboard' },
    { name: 'v1-projects', path: '/v1/dashboard/projects-hub' },
    { name: 'v1-clients', path: '/v1/dashboard/clients' },
    { name: 'v1-invoicing', path: '/v1/dashboard/invoicing' },
    { name: 'v1-analytics', path: '/v1/dashboard/analytics' },
    { name: 'v1-team', path: '/v1/dashboard/team' },
    { name: 'v1-calendar', path: '/v1/dashboard/my-day' },
    { name: 'v1-financial', path: '/v1/dashboard/financial' },

    // V2 Routes
    { name: 'v2-dashboard', path: '/v2/dashboard' },
    { name: 'v2-projects', path: '/v2/dashboard/projects' },
    { name: 'v2-invoicing', path: '/v2/dashboard/invoicing' },
    { name: 'v2-analytics', path: '/v2/dashboard/analytics' },
    { name: 'v2-team', path: '/v2/dashboard/team' },
    { name: 'v2-files', path: '/v2/dashboard/files' },
    { name: 'v2-community', path: '/v2/dashboard/community' },
    { name: 'v2-payments', path: '/v2/dashboard/payments' },
  ];

  for (const r of routes) {
    await testPage(browser, r.name, r.path);
  }

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);
}

main().catch(console.error);
