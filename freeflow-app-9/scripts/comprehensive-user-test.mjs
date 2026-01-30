#!/usr/bin/env node

/**
 * Comprehensive User Scenario Test
 * Tests the app in three scenarios:
 * 1. Demo mode (no auth, ?demo=true)
 * 2. Unauthenticated user (no demo param)
 * 3. New user simulation
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:9323';
const SCREENSHOT_DIR = './screenshots/user-scenarios';

// Create screenshot directories
const scenarios = ['demo-mode', 'no-auth', 'new-user'];
scenarios.forEach(scenario => {
  const dir = `${SCREENSHOT_DIR}/${scenario}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Track errors per scenario
const results = {
  'demo-mode': { pages: [], consoleErrors: [], networkErrors: [], success: 0, failed: 0 },
  'no-auth': { pages: [], consoleErrors: [], networkErrors: [], success: 0, failed: 0 },
  'new-user': { pages: [], consoleErrors: [], networkErrors: [], success: 0, failed: 0 }
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPage(page, scenario, name, url, timeout = 15000) {
  const startTime = Date.now();
  console.log(`  Testing: ${name}`);

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await delay(2000); // Wait for client-side rendering

    const status = response?.status() || 0;
    const title = await page.title();
    const currentUrl = page.url();

    // Check for 404 in page content - look for specific 404 page patterns
    const content = await page.content();
    const has404 = (
      // Check for 404 error page title
      content.includes('<title>404') ||
      content.includes('title="404"') ||
      // Check for specific 404 page elements (not just any "404" text)
      content.includes('class="not-found"') ||
      content.includes('data-testid="404"') ||
      // Check for "Page Not Found" as a heading
      content.includes('>Page Not Found</h') ||
      content.includes('Page not found</h')
    );

    // Take screenshot
    const screenshotPath = `${SCREENSHOT_DIR}/${scenario}/${name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });

    const duration = Date.now() - startTime;
    const success = status === 200 && !has404;

    if (success) {
      results[scenario].success++;
      console.log(`    ✓ OK (${status}) - ${duration}ms`);
    } else {
      results[scenario].failed++;
      console.log(`    ✗ FAILED (${status}${has404 ? ' - 404 content' : ''}) - ${duration}ms`);
    }

    results[scenario].pages.push({
      name,
      url,
      status,
      has404,
      success,
      duration,
      title,
      finalUrl: currentUrl
    });

    return success;
  } catch (error) {
    results[scenario].failed++;
    console.log(`    ✗ ERROR: ${error.message.substring(0, 50)}`);
    results[scenario].pages.push({
      name,
      url,
      status: 0,
      success: false,
      error: error.message
    });
    return false;
  }
}

async function runScenario(browser, scenario, urlSuffix, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SCENARIO: ${description}`);
  console.log(`${'='.repeat(60)}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('404') && text.length > 10) {
        results[scenario].consoleErrors.push(text.substring(0, 200));
      }
    }
  });

  // Track network errors
  page.on('requestfailed', request => {
    const url = request.url();
    if (!url.includes('favicon') && !url.includes('analytics') && !url.includes('engagement_sessions')) {
      results[scenario].networkErrors.push({
        url: url.substring(0, 100),
        error: request.failure()?.errorText
      });
    }
  });

  // Core pages to test
  const pages = [
    // Dashboards
    { name: '01-dashboard-main', path: '/dashboard' },
    { name: '02-dashboard-v1', path: '/v1/dashboard' },
    { name: '03-dashboard-v2', path: '/v2/dashboard' },

    // Core Business
    { name: '04-projects', path: '/dashboard/projects-hub-v2' },
    { name: '05-clients', path: '/dashboard/clients-v2' },
    { name: '06-invoices', path: '/dashboard/invoices-v2' },
    { name: '07-time-tracking', path: '/dashboard/time-tracking-v2' },
    { name: '08-calendar', path: '/dashboard/calendar-v2' },
    { name: '09-tasks', path: '/dashboard/tasks-v2' },

    // Community
    { name: '10-community-hub', path: '/dashboard/community-hub' },
    { name: '11-cv-portfolio', path: '/dashboard/cv-portfolio' },
    { name: '12-profile', path: '/dashboard/profile-v2' },

    // Finance
    { name: '13-crypto-payments', path: '/dashboard/crypto-payments' },
    { name: '14-financial', path: '/dashboard/financial-v2' },

    // Analytics
    { name: '15-analytics', path: '/dashboard/analytics-v2' },

    // AI Features
    { name: '16-ai-assistant', path: '/dashboard/ai-assistant-v2' },
    { name: '17-ai-create', path: '/dashboard/ai-create-v2' },

    // Settings
    { name: '18-settings', path: '/dashboard/settings-v2' },
  ];

  for (const p of pages) {
    const url = `${BASE_URL}${p.path}${urlSuffix}`;
    await testPage(page, scenario, p.name, url);
  }

  await page.close();
}

async function testNewUserSignup(browser) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SCENARIO: New User Signup Flow`);
  console.log(`${'='.repeat(60)}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const scenario = 'new-user';

  // Track errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && text.length > 10) {
        results[scenario].consoleErrors.push(text.substring(0, 200));
      }
    }
  });

  // Test public pages
  const publicPages = [
    { name: '01-home', path: '/' },
    { name: '02-login', path: '/login' },
    { name: '03-signup', path: '/signup' },
    { name: '04-pricing', path: '/pricing' },
    { name: '05-features', path: '/features' },
  ];

  console.log('\n  Testing public pages (new user perspective):');
  for (const p of publicPages) {
    await testPage(page, scenario, p.name, `${BASE_URL}${p.path}`);
  }

  // Test protected pages redirect behavior
  console.log('\n  Testing protected page redirects:');
  const protectedPages = [
    { name: '06-dashboard-redirect', path: '/dashboard' },
    { name: '07-projects-redirect', path: '/dashboard/projects-hub-v2' },
  ];

  for (const p of protectedPages) {
    await testPage(page, scenario, p.name, `${BASE_URL}${p.path}`);
  }

  // Test onboarding flow access
  console.log('\n  Testing onboarding pages:');
  const onboardingPages = [
    { name: '08-onboarding', path: '/onboarding' },
    { name: '09-verify-email', path: '/verify-email' },
  ];

  for (const p of onboardingPages) {
    await testPage(page, scenario, p.name, `${BASE_URL}${p.path}`);
  }

  await page.close();
}

async function main() {
  console.log('='.repeat(60));
  console.log('COMPREHENSIVE USER SCENARIO TEST');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    // Scenario 1: Demo Mode (investor showcase)
    await runScenario(browser, 'demo-mode', '?demo=true', 'DEMO MODE (Investor Showcase)');

    // Scenario 2: No Auth (unauthenticated user)
    await runScenario(browser, 'no-auth', '', 'NO AUTH (Unauthenticated User)');

    // Scenario 3: New User Flow
    await testNewUserSignup(browser);

  } finally {
    await browser.close();
  }

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));

  for (const [scenario, data] of Object.entries(results)) {
    const total = data.success + data.failed;
    const rate = total > 0 ? ((data.success / total) * 100).toFixed(1) : 0;

    console.log(`\n${scenario.toUpperCase()}:`);
    console.log(`  Pages: ${data.success}/${total} passed (${rate}%)`);
    console.log(`  Console Errors: ${data.consoleErrors.length}`);
    console.log(`  Network Errors: ${data.networkErrors.length}`);

    if (data.consoleErrors.length > 0) {
      console.log(`  Top Console Errors:`);
      const unique = [...new Set(data.consoleErrors)].slice(0, 3);
      unique.forEach(e => console.log(`    - ${e.substring(0, 80)}...`));
    }

    // List failed pages
    const failed = data.pages.filter(p => !p.success);
    if (failed.length > 0) {
      console.log(`  Failed Pages:`);
      failed.forEach(p => console.log(`    - ${p.name}: ${p.error || (p.has404 ? '404 content' : 'HTTP ' + p.status)}`));
    }
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results
  };

  fs.writeFileSync(`${SCREENSHOT_DIR}/comprehensive-report.json`, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report saved to: ${SCREENSHOT_DIR}/comprehensive-report.json`);
}

main().catch(console.error);
