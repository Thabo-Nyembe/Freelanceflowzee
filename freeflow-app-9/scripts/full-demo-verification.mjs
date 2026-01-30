#!/usr/bin/env node

/**
 * Full Demo Data Verification
 * Tests all major pages and API endpoints
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:9323';
const SCREENSHOT_DIR = './screenshots/full-demo-verify';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

const results = {
  passed: 0,
  failed: 0,
  pages: []
};

async function testPage(browser, name, path) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const result = { name, path, status: 'unknown', hasData: false, issues: [] };

  try {
    await page.goto(`${BASE_URL}${path}?demo=true`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    await delay(4000); // Wait for data to load

    // Take screenshot
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png` });

    // Analyze page content
    const analysis = await page.evaluate(() => {
      const text = document.body.innerText;

      // Data indicators
      const hasProjects = /\d+\s*projects?/i.test(text) ||
        /Enterprise|Mobile App|Dashboard|Platform|Portal/i.test(text);
      const hasClients = /\d+\s*clients?/i.test(text) ||
        /Acme|TechStart|DataFlow|RetailMax/i.test(text);
      const hasTasks = /\d+\s*tasks?/i.test(text) ||
        /Implement|Design|Review|Deploy|Configure/i.test(text);
      const hasMoney = /\$[\d,]+\.\d{2}|\$[\d,]+[KMB]?/.test(text);
      const hasPercentage = /[1-9]\d*%/.test(text);
      const hasInvoices = /INV-|Invoice #/i.test(text);

      // Empty indicators
      const emptyPhrases = [
        'No projects', 'No clients', 'No tasks', 'No invoices',
        'Get started', 'Create your first', 'Nothing here',
        'No data', 'No items', 'No results'
      ];
      const foundEmpty = emptyPhrases.filter(p => text.includes(p));

      // Check for real data values (not just $0)
      const hasRealMoney = /\$[1-9][\d,]*/.test(text);

      return {
        hasProjects,
        hasClients,
        hasTasks,
        hasMoney: hasRealMoney,
        hasPercentage,
        hasInvoices,
        foundEmpty,
        dataScore: [hasProjects, hasClients, hasTasks, hasRealMoney, hasPercentage, hasInvoices]
          .filter(Boolean).length
      };
    });

    if (analysis.dataScore >= 2) {
      result.status = 'pass';
      result.hasData = true;
      results.passed++;
      console.log(`✓ ${name}: PASS (data score: ${analysis.dataScore}/6)`);
    } else if (analysis.foundEmpty.length > 0) {
      result.status = 'fail';
      result.issues = analysis.foundEmpty;
      results.failed++;
      console.log(`✗ ${name}: FAIL - Empty: ${analysis.foundEmpty.join(', ')}`);
    } else {
      result.status = 'partial';
      result.hasData = analysis.dataScore > 0;
      console.log(`? ${name}: PARTIAL (data score: ${analysis.dataScore}/6)`);
    }

  } catch (error) {
    result.status = 'error';
    result.issues = [error.message];
    results.failed++;
    console.log(`✗ ${name}: ERROR - ${error.message}`);
  } finally {
    await page.close();
  }

  results.pages.push(result);
}

async function testAPI(name, endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();

    if (data.success && (data.projects?.length > 0 || data.tasks?.length > 0 ||
        data.clients?.length > 0 || data.data?.stats)) {
      console.log(`✓ API ${name}: OK`);
      results.passed++;
    } else {
      console.log(`? API ${name}: No data`);
    }
  } catch (error) {
    console.log(`✗ API ${name}: ${error.message}`);
    results.failed++;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('FULL DEMO DATA VERIFICATION');
  console.log('='.repeat(60));
  console.log(`Testing: ${BASE_URL}?demo=true\n`);

  // Test APIs first
  console.log('--- API ENDPOINTS ---\n');
  await testAPI('Dashboard', '/api/dashboard?demo=true');
  await testAPI('Projects', '/api/projects?demo=true');
  await testAPI('Tasks', '/api/tasks?demo=true');
  await testAPI('Clients', '/api/clients?demo=true');
  await testAPI('Invoices', '/api/invoices?demo=true');

  console.log('\n--- UI PAGES ---\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Core business pages
  const pages = [
    { name: '01-dashboard', path: '/dashboard' },
    { name: '02-projects', path: '/dashboard/projects-hub-v2' },
    { name: '03-clients', path: '/dashboard/clients-v2' },
    { name: '04-invoices', path: '/dashboard/invoices-v2' },
    { name: '05-tasks', path: '/dashboard/tasks-v2' },
    { name: '06-calendar', path: '/dashboard/calendar-v2' },
    { name: '07-time-tracking', path: '/dashboard/time-tracking-v2' },
    { name: '08-analytics', path: '/dashboard/analytics-v2' },
    { name: '09-files', path: '/dashboard/files-v2' },
    { name: '10-messages', path: '/dashboard/messages-v2' },
    { name: '11-team', path: '/dashboard/team-hub-v2' },
    { name: '12-bookings', path: '/dashboard/bookings-v2' },
    { name: '13-financial', path: '/dashboard/financial-v2' },
    { name: '14-profile', path: '/dashboard/profile-v2' },
  ];

  for (const p of pages) {
    await testPage(browser, p.name, p.path);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);

  // Save detailed report
  fs.writeFileSync(`${SCREENSHOT_DIR}/report.json`, JSON.stringify(results, null, 2));
  console.log(`Report: ${SCREENSHOT_DIR}/report.json`);
}

main().catch(console.error);
