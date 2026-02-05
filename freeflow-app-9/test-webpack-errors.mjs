#!/usr/bin/env node

/**
 * Comprehensive Webpack & Next.js Error Checker
 * Tests all dashboard pages and reports compilation/runtime errors
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:9323';
const TIMEOUT = 30000;

// Get all dashboard routes
const routes = [
  '/dashboard',
  '/dashboard/my-day-v2',
  '/dashboard/context7-docs',
  '/dashboard/react-query-devtools',
  '/dashboard/files-hub-v2',
  '/dashboard/api-keys-v2',
  '/dashboard/automation-v2',
  '/dashboard/profile-v2',
  '/dashboard/settings-v2',
  '/dashboard/analytics-v2',
  '/dashboard/clients-v2',
  '/dashboard/projects-v2',
  '/dashboard/tasks-v2',
  '/dashboard/invoices-v2',
  '/dashboard/expenses-v2',
  '/dashboard/time-tracking-v2',
  '/dashboard/deals-v2',
  '/dashboard/messages-v2',
  '/dashboard/calendar-v2',
  '/dashboard/contacts-v2',
  '/dashboard/documents-v2',
  '/dashboard/video-studio-v2',
  '/dashboard/collaboration-v2',
  '/dashboard/crm-v2',
  '/dashboard/business-intelligence-v2',
];

async function checkPageForErrors() {
  console.log('🔍 Starting Webpack & Next.js Error Check...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const errors = [];
  const warnings = [];
  const successPages = [];

  // Capture console errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      errors.push({
        type: 'Console Error',
        message: text,
        url: page.url()
      });
    } else if (type === 'warning' && (
      text.includes('Warning') ||
      text.includes('webpack') ||
      text.includes('Module not found') ||
      text.includes('Failed to compile')
    )) {
      warnings.push({
        type: 'Console Warning',
        message: text,
        url: page.url()
      });
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push({
      type: 'Page Error',
      message: error.message,
      stack: error.stack,
      url: page.url()
    });
  });

  // Test each route
  for (const route of routes) {
    try {
      console.log(`📄 Testing: ${route}`);

      const response = await page.goto(`${BASE_URL}${route}`, {
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });

      const status = response?.status();

      if (status === 200) {
        // Wait a bit to capture any runtime errors
        await page.waitForTimeout(2000);

        // Check for Next.js error overlay
        const errorOverlay = await page.locator('nextjs-portal').count();
        const hasError = errorOverlay > 0;

        if (hasError) {
          const errorText = await page.locator('nextjs-portal').textContent();
          errors.push({
            type: 'Next.js Compilation Error',
            message: errorText || 'Unknown error',
            url: route
          });
          console.log(`   ❌ Next.js Error Overlay Detected`);
        } else {
          successPages.push(route);
          console.log(`   ✅ OK (${status})`);
        }
      } else {
        errors.push({
          type: 'HTTP Error',
          message: `Status ${status}`,
          url: route
        });
        console.log(`   ❌ HTTP ${status}`);
      }
    } catch (error) {
      errors.push({
        type: 'Navigation Error',
        message: error.message,
        url: route
      });
      console.log(`   ❌ Navigation failed: ${error.message}`);
    }
  }

  await browser.close();

  // Generate report
  console.log('\n' + '='.repeat(80));
  console.log('WEBPACK & NEXT.JS ERROR REPORT');
  console.log('='.repeat(80));

  console.log(`\n✅ Successful Pages: ${successPages.length}/${routes.length}`);
  console.log(`❌ Pages with Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n🔴 ERRORS FOUND:\n');
    errors.forEach((err, index) => {
      console.log(`${index + 1}. ${err.type}`);
      console.log(`   URL: ${err.url}`);
      console.log(`   Message: ${err.message}`);
      if (err.stack) {
        console.log(`   Stack: ${err.stack.substring(0, 200)}...`);
      }
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS FOUND:\n');
    warnings.forEach((warn, index) => {
      console.log(`${index + 1}. ${warn.type}`);
      console.log(`   URL: ${warn.url}`);
      console.log(`   Message: ${warn.message}`);
      console.log('');
    });
  }

  // Save to file
  const report = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    successfulPages: successPages.length,
    errors: errors,
    warnings: warnings,
    successPages: successPages
  };

  writeFileSync(
    'webpack-errors-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n📝 Report saved to: webpack-errors-report.json');
  console.log('='.repeat(80));

  return {
    hasErrors: errors.length > 0,
    errorCount: errors.length,
    warningCount: warnings.length
  };
}

// Run the check
checkPageForErrors()
  .then(result => {
    if (result.hasErrors) {
      console.log('\n❌ FAILED: Errors found. Please review the report above.');
      process.exit(1);
    } else {
      console.log('\n✅ SUCCESS: No Webpack or Next.js errors found!');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('\n💥 Test script error:', error);
    process.exit(1);
  });
