#!/usr/bin/env node

/**
 * Comprehensive Demo Test
 * - Tests all dashboard routes
 * - Captures console errors
 * - Takes screenshots
 * - Checks for 404s
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:9323';
const SCREENSHOT_DIR = './screenshots/comprehensive-test';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

const results = {
  passed: [],
  failed: [],
  errors: [],
  consoleErrors: [],
  notFound: []
};

// All dashboard routes to test
const ALL_ROUTES = [
  // Main app routes
  '/dashboard',
  '/dashboard/projects-hub-v2',
  '/dashboard/clients-v2',
  '/dashboard/invoices-v2',
  '/dashboard/tasks-v2',
  '/dashboard/calendar-v2',
  '/dashboard/time-tracking-v2',
  '/dashboard/analytics-v2',
  '/dashboard/files-v2',
  '/dashboard/messages-v2',
  '/dashboard/notifications-v2',
  '/dashboard/team-hub-v2',
  '/dashboard/bookings-v2',
  '/dashboard/financial-v2',
  '/dashboard/profile-v2',
  '/dashboard/settings-v2',
  '/dashboard/ai-assistant-v2',
  '/dashboard/ai-create-v2',
  '/dashboard/community-hub',
  '/dashboard/cv-portfolio',
  '/dashboard/crypto-payments',
  '/dashboard/escrow-v2',
  '/dashboard/collaboration-v2',
  '/dashboard/reports-v2',
  '/dashboard/activity-logs-v2',
  '/dashboard/integrations-v2',

  // V1 routes
  '/v1/dashboard',
  '/v1/dashboard/projects-hub',
  '/v1/dashboard/clients',
  '/v1/dashboard/invoicing',
  '/v1/dashboard/analytics',
  '/v1/dashboard/team',
  '/v1/dashboard/my-day',
  '/v1/dashboard/financial',
  '/v1/dashboard/ai-assistant',
  '/v1/dashboard/community-hub',
  '/v1/dashboard/notifications',
  '/v1/dashboard/settings',

  // V2 routes
  '/v2/dashboard',
  '/v2/dashboard/projects',
  '/v2/dashboard/invoicing',
  '/v2/dashboard/analytics',
  '/v2/dashboard/team',
  '/v2/dashboard/files',
  '/v2/dashboard/community',
  '/v2/dashboard/payments',
  '/v2/dashboard/settings',
  '/v2/dashboard/ai-assistant',
];

async function testRoute(browser, route) {
  const page = await browser.newPage();
  const pageErrors = [];
  const consoleLogs = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  try {
    const response = await page.goto(`${BASE_URL}${route}?demo=true`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    const status = response?.status() || 0;

    if (status === 404) {
      results.notFound.push(route);
      console.log(`  404: ${route}`);
      await page.close();
      return;
    }

    await delay(2000);

    // Check for data
    const hasData = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.length > 500 && !/error|404|not found/i.test(text);
    });

    // Take screenshot
    const screenshotName = route.replace(/\//g, '_').replace(/^_/, '');
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${screenshotName}.png`,
      fullPage: false
    });

    if (pageErrors.length > 0) {
      results.errors.push({ route, errors: pageErrors });
      console.log(`  ⚠ ${route} (${pageErrors.length} JS errors)`);
    } else if (consoleLogs.length > 0) {
      results.consoleErrors.push({ route, errors: consoleLogs.slice(0, 3) });
      console.log(`  ? ${route} (${consoleLogs.length} console errors)`);
    } else if (hasData) {
      results.passed.push(route);
      console.log(`  ✓ ${route}`);
    } else {
      results.failed.push(route);
      console.log(`  ✗ ${route} (no content)`);
    }

  } catch (error) {
    if (error.message.includes('timeout')) {
      results.failed.push(route);
      console.log(`  ⏱ ${route} (timeout)`);
    } else {
      results.errors.push({ route, errors: [error.message] });
      console.log(`  ✗ ${route} (${error.message.substring(0, 40)})`);
    }
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('COMPREHENSIVE DEMO TEST');
  console.log('='.repeat(60));
  console.log(`Testing ${ALL_ROUTES.length} routes...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const route of ALL_ROUTES) {
    await testRoute(browser, route);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Passed: ${results.passed.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);
  console.log(`⚠ JS Errors: ${results.errors.length}`);
  console.log(`? Console Errors: ${results.consoleErrors.length}`);
  console.log(`404 Not Found: ${results.notFound.length}`);

  if (results.notFound.length > 0) {
    console.log('\n--- 404 Routes ---');
    results.notFound.forEach(r => console.log(`  ${r}`));
  }

  if (results.failed.length > 0) {
    console.log('\n--- Failed Routes ---');
    results.failed.forEach(r => console.log(`  ${r}`));
  }

  // Save report
  fs.writeFileSync(
    `${SCREENSHOT_DIR}/comprehensive-report.json`,
    JSON.stringify(results, null, 2)
  );
  console.log(`\nReport: ${SCREENSHOT_DIR}/comprehensive-report.json`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);
}

main().catch(console.error);
