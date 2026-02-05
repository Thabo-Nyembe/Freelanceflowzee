import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:9323';
const LOGIN_EMAIL = 'alex@freeflow.io';
const LOGIN_PASSWORD = 'investor2026';
const SCREENSHOT_DIR = '/Users/thabonyembe/Documents/freeflow-app-9/screenshots/batch3';

// Pages from batch-ae (CORRECTED - no doubled paths)
const pages = [
  'seo-v2',
  'service-desk-v2',
  'settings-v2',
  'shipping-v2',
  'shuttle-v2',
  'sitemap-v2',
  'skills-matrix-v2',
  'social-media-v2',
  'sprints-v2',
  'sso-v2',
  'stock-v2',
  'storage-v2',
  'streaming-v2',
  'subscriptions-v2',
  'suggestions-v2',
  'suppliers-v2',
  'supply-chain-v2',
  'support-tickets-v2',
  'support-v2',
  'surveys-v2',
  'sustainability-v2',
  'system-health-v2',
  'system-insights-v2',
  'tasks-v2',
  'tax-intelligence-v2',
  'taxes-v2',
  'team-hub-v2',
  'team-management-v2',
  'templates-v2',
  'territories-v2',
  'testimonials-v2',
  'testing-v2',
  'theme-store-v2',
  'third-party-integrations-v2',
  'tickets-v2',
  'time-off-v2',
  'time-tracking-v2',
  'training-v2',
  'transactions-v2',
  'tutorials-v2',
  'upgrades-showcase',
  'user-management-v2',
  'vending-v2',
  'vendors-v2',
  'video-review-v2',
  'video-studio-v2',
  'visitors-v2',
  'volunteering-v2',
  'vulnerabilities-v2',
  'vulnerability-scan-v2',
  'wallet-v2',
  'warehouse-v2',
  'webhooks-v2',
  'webinars-v2',
  'wellness-v2',
  'widget-library-v2',
  'work-orders-v2',
  'workflow-builder-v2',
  'workflows-v2',
  'workspace-v2'
];

const results = {
  successful: [],
  errors: [],
  layoutIssues: [],
  consoleErrors: [],
  timestamp: new Date().toISOString()
};

async function login(page) {
  console.log('Attempting login...');

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Fill login form
  await page.fill('input[type="email"]', LOGIN_EMAIL);
  await page.fill('input[type="password"]', LOGIN_PASSWORD);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForTimeout(3000);

  console.log('Login completed');
}

async function checkLayout(page) {
  const layoutIssues = [];

  try {
    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);

    if (bodyWidth > viewportWidth) {
      layoutIssues.push({
        type: 'horizontal-overflow',
        bodyWidth,
        viewportWidth,
        overflow: bodyWidth - viewportWidth
      });
    }

    // Check for elements extending beyond viewport
    const overflowingElements = await page.evaluate(() => {
      const elements = [];
      const viewportWidth = document.documentElement.clientWidth;

      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > viewportWidth + 10) { // 10px tolerance
          elements.push({
            tag: el.tagName,
            className: el.className,
            right: rect.right,
            overflow: rect.right - viewportWidth
          });
        }
      });

      return elements.slice(0, 5); // Return first 5 overflowing elements
    });

    if (overflowingElements.length > 0) {
      layoutIssues.push({
        type: 'overflowing-elements',
        elements: overflowingElements
      });
    }

    // Check spacing (looking for negative margins, overlapping elements)
    const spacingIssues = await page.evaluate(() => {
      const issues = [];

      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        const marginTop = parseInt(style.marginTop);
        const marginBottom = parseInt(style.marginBottom);

        if (marginTop < -50 || marginBottom < -50) {
          issues.push({
            tag: el.tagName,
            className: el.className,
            marginTop,
            marginBottom
          });
        }
      });

      return issues.slice(0, 3); // Return first 3 spacing issues
    });

    if (spacingIssues.length > 0) {
      layoutIssues.push({
        type: 'spacing-issues',
        issues: spacingIssues
      });
    }

  } catch (error) {
    layoutIssues.push({
      type: 'error',
      message: error.message
    });
  }

  return layoutIssues;
}

async function testPage(browser, pagePath, index, total) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const consoleMessages = [];
  const pageErrors = [];

  // Collect console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    }
  });

  // Collect page errors
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  const pageUrl = `${BASE_URL}/dashboard/${pagePath}`;
  const pageName = pagePath.split('/').pop();
  const screenshotPath = path.join(SCREENSHOT_DIR, `${pageName}.png`);

  console.log(`\n[${index + 1}/${total}] Testing: ${pagePath}`);
  console.log(`URL: ${pageUrl}`);

  try {
    // Navigate to page
    const response = await page.goto(pageUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('  Redirected to login, logging in...');
      await login(page);

      // Navigate to page again
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
    }

    // Wait for page to be stable
    await page.waitForTimeout(2000);

    // Check layout
    const layoutIssues = await checkLayout(page);

    // Take screenshot
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    // Collect results
    const result = {
      page: pagePath,
      url: pageUrl,
      status: response?.status() || 'unknown',
      screenshot: screenshotPath,
      consoleErrors: consoleMessages,
      pageErrors: pageErrors,
      layoutIssues: layoutIssues,
      timestamp: new Date().toISOString()
    };

    if (response?.status() === 200 || response?.status() === 304) {
      results.successful.push(result);
      console.log(`  ✓ Success (${response.status()})`);
    } else {
      results.errors.push(result);
      console.log(`  ✗ Error (${response?.status() || 'unknown'})`);
    }

    if (consoleMessages.length > 0) {
      results.consoleErrors.push({
        page: pagePath,
        errors: consoleMessages
      });
      console.log(`  ⚠ Console errors: ${consoleMessages.length}`);
    }

    if (layoutIssues.length > 0) {
      results.layoutIssues.push({
        page: pagePath,
        issues: layoutIssues
      });
      console.log(`  ⚠ Layout issues: ${layoutIssues.length}`);
    }

    if (pageErrors.length > 0) {
      console.log(`  ⚠ Page errors: ${pageErrors.length}`);
    }

  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    results.errors.push({
      page: pagePath,
      url: pageUrl,
      error: error.message,
      stack: error.stack,
      screenshot: screenshotPath,
      timestamp: new Date().toISOString()
    });

    // Try to take screenshot even on error
    try {
      await page.screenshot({ path: screenshotPath });
    } catch (screenshotError) {
      console.log(`  Could not take screenshot: ${screenshotError.message}`);
    }
  } finally {
    await context.close();
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('BATCH-AE DASHBOARD PAGES TEST');
  console.log('='.repeat(80));
  console.log(`Testing ${pages.length} pages from batch-ae`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
  console.log('='.repeat(80));

  const browser = await chromium.launch({
    headless: true
  });

  try {
    // Test each page
    for (let i = 0; i < pages.length; i++) {
      await testPage(browser, pages[i], i, pages.length);

      // Small delay between pages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate report
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total pages tested: ${pages.length}`);
    console.log(`Successful: ${results.successful.length}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log(`Pages with console errors: ${results.consoleErrors.length}`);
    console.log(`Pages with layout issues: ${results.layoutIssues.length}`);

    // Save detailed report
    const reportPath = '/Users/thabonyembe/Documents/freeflow-app-9/batch-ae-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\nDetailed report saved: ${reportPath}`);

    // Generate markdown report
    const mdReport = generateMarkdownReport(results);
    const mdReportPath = '/Users/thabonyembe/Documents/freeflow-app-9/BATCH_AE_TEST_REPORT.md';
    fs.writeFileSync(mdReportPath, mdReport);
    console.log(`Markdown report saved: ${mdReportPath}`);

    console.log('='.repeat(80));

  } catch (error) {
    console.error('Test suite failed:', error);
  } finally {
    await browser.close();
  }
}

function generateMarkdownReport(results) {
  let md = '# Batch-AE Dashboard Pages Test Report\n\n';
  md += `**Test Date:** ${new Date().toLocaleString()}\n\n`;
  md += `**Total Pages Tested:** ${pages.length}\n\n`;

  md += '## Summary\n\n';
  md += `- ✓ Successful: ${results.successful.length}\n`;
  md += `- ✗ Errors: ${results.errors.length}\n`;
  md += `- ⚠ Console Errors: ${results.consoleErrors.length}\n`;
  md += `- ⚠ Layout Issues: ${results.layoutIssues.length}\n\n`;

  md += '---\n\n';

  // Successful pages
  if (results.successful.length > 0) {
    md += '## ✓ Successful Pages\n\n';
    md += `${results.successful.length} pages loaded successfully:\n\n`;
    results.successful.forEach(result => {
      md += `- **${result.page}**\n`;
      md += `  - Status: ${result.status}\n`;
      md += `  - Screenshot: \`${result.screenshot}\`\n`;
      if (result.consoleErrors.length > 0) {
        md += `  - ⚠ Console errors: ${result.consoleErrors.length}\n`;
      }
      if (result.layoutIssues.length > 0) {
        md += `  - ⚠ Layout issues: ${result.layoutIssues.length}\n`;
      }
      md += '\n';
    });
    md += '\n';
  }

  // Error pages
  if (results.errors.length > 0) {
    md += '## ✗ Pages with Errors\n\n';
    results.errors.forEach(result => {
      md += `### ${result.page}\n\n`;
      md += `- **URL:** ${result.url}\n`;
      md += `- **Status:** ${result.status || 'Failed to load'}\n`;
      if (result.error) {
        md += `- **Error:** ${result.error}\n`;
      }
      md += `- **Screenshot:** \`${result.screenshot}\`\n`;
      if (result.pageErrors && result.pageErrors.length > 0) {
        md += `- **Page Errors:**\n`;
        result.pageErrors.forEach(err => {
          md += `  - ${err.message}\n`;
        });
      }
      md += '\n';
    });
    md += '\n';
  }

  // Console errors detail
  if (results.consoleErrors.length > 0) {
    md += '## ⚠ Console Errors Detail\n\n';
    results.consoleErrors.forEach(item => {
      md += `### ${item.page}\n\n`;
      md += `${item.errors.length} console error(s):\n\n`;
      item.errors.forEach((err, idx) => {
        md += `${idx + 1}. **${err.type}:** ${err.text}\n`;
        if (err.location) {
          md += `   - Location: ${err.location.url}:${err.location.lineNumber}\n`;
        }
      });
      md += '\n';
    });
    md += '\n';
  }

  // Layout issues detail
  if (results.layoutIssues.length > 0) {
    md += '## ⚠ Layout Issues Detail\n\n';
    results.layoutIssues.forEach(item => {
      md += `### ${item.page}\n\n`;
      item.issues.forEach(issue => {
        md += `**${issue.type}:**\n`;
        if (issue.type === 'horizontal-overflow') {
          md += `- Body width: ${issue.bodyWidth}px\n`;
          md += `- Viewport width: ${issue.viewportWidth}px\n`;
          md += `- Overflow: ${issue.overflow}px\n`;
        } else if (issue.type === 'overflowing-elements') {
          md += `Found ${issue.elements.length} overflowing elements:\n`;
          issue.elements.forEach(el => {
            md += `- ${el.tag}${el.className ? '.' + el.className : ''} - overflow: ${Math.round(el.overflow)}px\n`;
          });
        } else if (issue.type === 'spacing-issues') {
          md += `Found ${issue.issues.length} spacing issues:\n`;
          issue.issues.forEach(iss => {
            md += `- ${iss.tag}${iss.className ? '.' + iss.className : ''} - margins: ${iss.marginTop}px / ${iss.marginBottom}px\n`;
          });
        }
        md += '\n';
      });
    });
  }

  md += '---\n\n';
  md += `*Report generated on ${new Date().toLocaleString()}*\n`;

  return md;
}

// Run tests
main().catch(console.error);
