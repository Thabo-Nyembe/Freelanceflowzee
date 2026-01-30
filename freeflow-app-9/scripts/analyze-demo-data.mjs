#!/usr/bin/env node

/**
 * Analyze Demo Data - Check all pages for actual data content
 * Takes screenshots and extracts key metrics to verify demo data is loaded
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:9323';
const SCREENSHOT_DIR = './screenshots/demo-data-audit';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = {
  timestamp: new Date().toISOString(),
  pages: [],
  issues: [],
  summary: { total: 0, withData: 0, empty: 0, errors: 0 }
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzePage(page, name, url) {
  console.log(`\nAnalyzing: ${name}`);
  console.log(`  URL: ${url}`);

  const pageResult = {
    name,
    url,
    hasData: false,
    metrics: {},
    issues: [],
    screenshot: null
  };

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000); // Wait for client-side data loading

    // Take screenshot
    const screenshotPath = `${SCREENSHOT_DIR}/${name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    pageResult.screenshot = screenshotPath;

    // Extract text content to check for data
    const pageContent = await page.evaluate(() => {
      // Get all text content
      const text = document.body.innerText;

      // Look for common "empty" indicators
      const emptyIndicators = [
        'No data',
        'No items',
        'No results',
        'Nothing here',
        'Get started',
        'Create your first',
        'No projects',
        'No clients',
        'No invoices',
        'No tasks',
        'No messages',
        '0 projects',
        '0 clients',
        '0 tasks',
        '$0.00',
        '$0',
        '0%'
      ];

      const foundEmpty = emptyIndicators.filter(indicator =>
        text.toLowerCase().includes(indicator.toLowerCase())
      );

      // Look for data indicators (numbers, currency, percentages)
      const hasNumbers = /\$[\d,]+\.\d{2}|\d+%|\d{1,3}(,\d{3})+/.test(text);
      const hasCurrency = /\$\d/.test(text);

      // Extract visible metrics (look for card values)
      const cards = document.querySelectorAll('[class*="card"], [class*="stat"], [class*="metric"]');
      const metrics = [];
      cards.forEach(card => {
        const title = card.querySelector('h2, h3, h4, [class*="title"], [class*="label"]')?.innerText;
        const value = card.querySelector('[class*="value"], [class*="number"], [class*="amount"]')?.innerText;
        if (title && value) {
          metrics.push({ title: title.trim(), value: value.trim() });
        }
      });

      // Check for zero/empty values in stats
      const zeroStats = [];
      document.querySelectorAll('[class*="stat"], [class*="metric"], [class*="kpi"]').forEach(el => {
        const text = el.innerText;
        if (/^[\s]*0[\s]*$|^\$0|^0%/.test(text.trim())) {
          zeroStats.push(text.trim().substring(0, 50));
        }
      });

      return {
        foundEmpty,
        hasNumbers,
        hasCurrency,
        metrics,
        zeroStats,
        textSample: text.substring(0, 500)
      };
    });

    // Analyze results
    pageResult.metrics = pageContent.metrics;

    if (pageContent.foundEmpty.length > 0) {
      pageResult.issues.push(`Found empty indicators: ${pageContent.foundEmpty.join(', ')}`);
    }

    if (pageContent.zeroStats.length > 0) {
      pageResult.issues.push(`Found zero values: ${pageContent.zeroStats.length} items`);
    }

    if (!pageContent.hasNumbers && !pageContent.hasCurrency) {
      pageResult.issues.push('No numeric data found on page');
    }

    pageResult.hasData = pageContent.hasNumbers || pageContent.hasCurrency || pageContent.metrics.length > 0;

    if (pageResult.hasData && pageResult.issues.length === 0) {
      console.log(`  ✓ Has data`);
      results.summary.withData++;
    } else if (pageResult.issues.length > 0) {
      console.log(`  ⚠ Issues: ${pageResult.issues.join('; ')}`);
      results.summary.empty++;
      results.issues.push({ page: name, issues: pageResult.issues });
    } else {
      console.log(`  ? Uncertain data state`);
    }

  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    pageResult.issues.push(`Error: ${error.message}`);
    results.summary.errors++;
  }

  results.pages.push(pageResult);
  results.summary.total++;
  return pageResult;
}

async function main() {
  console.log('='.repeat(60));
  console.log('DEMO DATA AUDIT');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Demo Mode: ?demo=true`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Key pages to audit for demo data
  const pagesToAudit = [
    // Main Dashboards - should show overview stats
    { name: '01-dashboard-main', path: '/dashboard' },
    { name: '02-dashboard-v1', path: '/v1/dashboard' },
    { name: '03-dashboard-v2', path: '/v2/dashboard' },

    // Core Business - should show projects, clients, revenue
    { name: '04-projects-hub', path: '/dashboard/projects-hub-v2' },
    { name: '05-clients-crm', path: '/dashboard/clients-v2' },
    { name: '06-invoices', path: '/dashboard/invoices-v2' },
    { name: '07-time-tracking', path: '/dashboard/time-tracking-v2' },
    { name: '08-tasks', path: '/dashboard/tasks-v2' },

    // Calendar & Scheduling
    { name: '09-calendar', path: '/dashboard/calendar-v2' },
    { name: '10-bookings', path: '/dashboard/bookings-v2' },

    // Communication
    { name: '11-messages', path: '/dashboard/messages-v2' },
    { name: '12-notifications', path: '/dashboard/notifications-v2' },

    // Community & Profile
    { name: '13-community-hub', path: '/dashboard/community-hub' },
    { name: '14-cv-portfolio', path: '/dashboard/cv-portfolio' },
    { name: '15-profile', path: '/dashboard/profile-v2' },

    // Finance & Payments
    { name: '16-crypto-payments', path: '/dashboard/crypto-payments' },
    { name: '17-financial', path: '/dashboard/financial-v2' },
    { name: '18-escrow', path: '/dashboard/escrow-v2' },

    // Analytics & Reports
    { name: '19-analytics', path: '/dashboard/analytics-v2' },
    { name: '20-reports', path: '/dashboard/reports-v2' },
    { name: '21-activity-logs', path: '/dashboard/activity-logs-v2' },

    // AI Features
    { name: '22-ai-assistant', path: '/dashboard/ai-assistant-v2' },
    { name: '23-ai-create', path: '/dashboard/ai-create-v2' },

    // Files & Storage
    { name: '24-files', path: '/dashboard/files-v2' },

    // Team & Collaboration
    { name: '25-team-hub', path: '/dashboard/team-hub-v2' },
    { name: '26-collaboration', path: '/dashboard/collaboration-v2' },

    // Settings
    { name: '27-settings', path: '/dashboard/settings-v2' },
    { name: '28-integrations', path: '/dashboard/integrations-v2' },
  ];

  for (const p of pagesToAudit) {
    await analyzePage(page, p.name, `${BASE_URL}${p.path}?demo=true`);
  }

  await browser.close();

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total pages: ${results.summary.total}`);
  console.log(`With data: ${results.summary.withData}`);
  console.log(`Empty/Issues: ${results.summary.empty}`);
  console.log(`Errors: ${results.summary.errors}`);

  if (results.issues.length > 0) {
    console.log('\n--- PAGES NEEDING DATA ---');
    results.issues.forEach(issue => {
      console.log(`\n${issue.page}:`);
      issue.issues.forEach(i => console.log(`  - ${i}`));
    });
  }

  // Save detailed report
  fs.writeFileSync(`${SCREENSHOT_DIR}/audit-report.json`, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report: ${SCREENSHOT_DIR}/audit-report.json`);
}

main().catch(console.error);
