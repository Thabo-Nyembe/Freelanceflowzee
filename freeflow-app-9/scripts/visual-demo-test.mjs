#!/usr/bin/env node

/**
 * Visual Demo Test - Browse app as demo user, capture screenshots and errors
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:9323';
const DEMO_EMAIL = 'alex@freeflow.io';
const DEMO_PASSWORD = 'investor2026';

const SCREENSHOT_DIR = './screenshots';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const consoleErrors = [];
const pageErrors = [];
const networkErrors = [];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filename = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`  Screenshot: ${filename}`);
  return filename;
}

async function login(page) {
  console.log('\n=== LOGGING IN ===\n');

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);

  // Take screenshot of login page
  await takeScreenshot(page, '01-login-page');

  // Fill in credentials
  try {
    await page.type('input[type="email"], input[name="email"]', DEMO_EMAIL);
    await page.type('input[type="password"], input[name="password"]', DEMO_PASSWORD);
    await delay(500);

    // Click login button
    await page.click('button[type="submit"]');
    await delay(3000);

    // Check if logged in
    const url = page.url();
    console.log(`  Current URL: ${url}`);

    if (url.includes('dashboard') || url.includes('v1') || url.includes('v2')) {
      console.log('  Login successful!');
      await takeScreenshot(page, '02-after-login');
      return true;
    } else {
      console.log('  Login may have failed, taking screenshot...');
      await takeScreenshot(page, '02-login-failed');
      return false;
    }
  } catch (e) {
    console.log('  Login error:', e.message);
    await takeScreenshot(page, '02-login-error');
    return false;
  }
}

async function testPage(page, name, url, waitFor = 3000) {
  console.log(`\nTesting: ${name}`);
  console.log(`  URL: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(waitFor);

    // Get page title
    const title = await page.title();
    console.log(`  Title: ${title}`);

    // Check for visible errors on page
    const errorElements = await page.$$('.error, .error-message, [class*="error"], [data-error]');
    if (errorElements.length > 0) {
      console.log(`  Warning: Found ${errorElements.length} error elements on page`);
    }

    // Take screenshot
    const screenshotName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await takeScreenshot(page, screenshotName);

    return { success: true, url, title };
  } catch (e) {
    console.log(`  Error: ${e.message}`);
    pageErrors.push({ page: name, url, error: e.message });
    return { success: false, url, error: e.message };
  }
}

async function main() {
  console.log('===========================================');
  console.log('VISUAL DEMO USER TEST');
  console.log('===========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Demo User: ${DEMO_EMAIL}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('404')) {
        consoleErrors.push({ type: 'console', message: text });
      }
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    pageErrors.push({ type: 'pageerror', message: error.message });
  });

  // Capture network errors
  page.on('requestfailed', request => {
    const url = request.url();
    if (!url.includes('favicon') && !url.includes('analytics')) {
      networkErrors.push({ url, error: request.failure()?.errorText });
    }
  });

  try {
    // Skip login - use demo mode directly for investor showcase
    console.log('\n=== DEMO MODE NAVIGATION ===\n');
    console.log('Using demo mode (?demo=true) for all pages...');

    // Comprehensive test of all key pages in demo mode
    const pagesToTest = [
      // Main Dashboards
      { name: '01-dashboard-main', url: `${BASE_URL}/dashboard?demo=true` },
      { name: '02-dashboard-v1', url: `${BASE_URL}/v1/dashboard?demo=true` },
      { name: '03-dashboard-v2', url: `${BASE_URL}/v2/dashboard?demo=true` },

      // Core Business Features
      { name: '04-projects-hub', url: `${BASE_URL}/dashboard/projects-hub-v2?demo=true` },
      { name: '05-clients-crm', url: `${BASE_URL}/dashboard/clients-v2?demo=true` },
      { name: '06-invoices', url: `${BASE_URL}/dashboard/invoices-v2?demo=true` },
      { name: '07-time-tracking', url: `${BASE_URL}/dashboard/time-tracking-v2?demo=true` },
      { name: '08-calendar', url: `${BASE_URL}/dashboard/calendar-v2?demo=true` },
      { name: '09-messages', url: `${BASE_URL}/dashboard/messages-v2?demo=true` },
      { name: '10-files', url: `${BASE_URL}/dashboard/files-v2?demo=true` },
      { name: '11-tasks', url: `${BASE_URL}/dashboard/tasks-v2?demo=true` },

      // Community & Networking
      { name: '12-community-hub', url: `${BASE_URL}/dashboard/community-hub?demo=true` },
      { name: '13-cv-portfolio', url: `${BASE_URL}/dashboard/cv-portfolio?demo=true` },
      { name: '14-profile', url: `${BASE_URL}/dashboard/profile-v2?demo=true` },

      // Productivity & Planning
      { name: '15-my-day', url: `${BASE_URL}/dashboard/my-day-v2?demo=true` },
      { name: '16-bookings', url: `${BASE_URL}/dashboard/bookings-v2?demo=true` },
      { name: '17-team-hub', url: `${BASE_URL}/dashboard/team-hub-v2?demo=true` },

      // Finance & Payments
      { name: '18-crypto-payments', url: `${BASE_URL}/dashboard/crypto-payments?demo=true` },
      { name: '19-financial', url: `${BASE_URL}/dashboard/financial-v2?demo=true` },
      { name: '20-escrow', url: `${BASE_URL}/dashboard/escrow-v2?demo=true` },

      // Analytics & Insights
      { name: '21-analytics', url: `${BASE_URL}/dashboard/analytics-v2?demo=true` },
      { name: '22-reports', url: `${BASE_URL}/dashboard/reports-v2?demo=true` },
      { name: '23-activity-logs', url: `${BASE_URL}/dashboard/activity-logs-v2?demo=true` },

      // AI Features
      { name: '24-ai-assistant', url: `${BASE_URL}/dashboard/ai-assistant-v2?demo=true` },
      { name: '25-ai-create', url: `${BASE_URL}/dashboard/ai-create-v2?demo=true` },
      { name: '26-ai-video-studio', url: `${BASE_URL}/dashboard/ai-video-studio?demo=true` },
      { name: '27-ai-content-studio', url: `${BASE_URL}/dashboard/ai-content-studio?demo=true` },

      // Collaboration & Tools
      { name: '28-collaboration', url: `${BASE_URL}/dashboard/collaboration-v2?demo=true` },
      { name: '29-canvas', url: `${BASE_URL}/dashboard/canvas-v2?demo=true` },
      { name: '30-video-studio', url: `${BASE_URL}/dashboard/video-studio-v2?demo=true` },

      // Settings & Admin
      { name: '31-settings', url: `${BASE_URL}/dashboard/settings-v2?demo=true` },
      { name: '32-integrations', url: `${BASE_URL}/dashboard/integrations-v2?demo=true` },
      { name: '33-notifications', url: `${BASE_URL}/dashboard/notifications-v2?demo=true` },

      // Knowledge & Learning
      { name: '34-knowledge-base', url: `${BASE_URL}/dashboard/knowledge-base-v2?demo=true` },
      { name: '35-faq', url: `${BASE_URL}/dashboard/faq-v2?demo=true` },
    ];

    const results = [];
    for (const p of pagesToTest) {
      const result = await testPage(page, p.name, p.url);
      results.push({ ...p, ...result });
    }

    // Summary
    console.log('\n===========================================');
    console.log('TEST SUMMARY');
    console.log('===========================================');

    console.log(`\nPages Tested: ${results.length}`);
    console.log(`Successful: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);

    if (consoleErrors.length > 0) {
      console.log(`\nConsole Errors (${consoleErrors.length}):`);
      const uniqueErrors = [...new Set(consoleErrors.map(e => e.message))];
      uniqueErrors.slice(0, 10).forEach(e => console.log(`  - ${e.substring(0, 100)}`));
    }

    if (networkErrors.length > 0) {
      console.log(`\nNetwork Errors (${networkErrors.length}):`);
      networkErrors.slice(0, 10).forEach(e => console.log(`  - ${e.url}: ${e.error}`));
    }

    if (pageErrors.length > 0) {
      console.log(`\nPage Errors (${pageErrors.length}):`);
      pageErrors.slice(0, 10).forEach(e => console.log(`  - ${e.page || e.type}: ${e.message?.substring(0, 100) || e.error}`));
    }

    // Write detailed report
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      demoUser: DEMO_EMAIL,
      results,
      consoleErrors,
      networkErrors,
      pageErrors
    };

    fs.writeFileSync(`${SCREENSHOT_DIR}/test-report.json`, JSON.stringify(report, null, 2));
    console.log(`\nDetailed report saved to: ${SCREENSHOT_DIR}/test-report.json`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

main();
