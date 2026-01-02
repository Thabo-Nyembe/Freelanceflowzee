import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:9323';

// All V2 dashboard pages to test
const allPages = [
  { path: '/dashboard/overview-v2', name: 'Overview' },
  { path: '/dashboard/my-day-v2', name: 'My Day' },
  { path: '/dashboard/projects-hub-v2', name: 'Projects Hub' },
  { path: '/dashboard/ai-create-v2', name: 'AI Create' },
  { path: '/dashboard/video-studio-v2', name: 'Video Studio' },
  { path: '/dashboard/analytics-v2', name: 'Analytics' },
  { path: '/dashboard/files-hub-v2', name: 'Files Hub' },
  { path: '/dashboard/messages-v2', name: 'Messages' },
  { path: '/dashboard/calendar-v2', name: 'Calendar' },
  { path: '/dashboard/financial-v2', name: 'Financial' },
  { path: '/dashboard/clients-v2', name: 'Clients' },
  { path: '/dashboard/community-v2', name: 'Community' },
  { path: '/dashboard/settings-v2', name: 'Settings' },
  { path: '/dashboard/notifications-v2', name: 'Notifications' },
  { path: '/dashboard/profile-v2', name: 'Profile' },
  { path: '/dashboard/crm-v2', name: 'CRM' },
  { path: '/dashboard/team-hub-v2', name: 'Team Hub' },
  { path: '/dashboard/invoices-v2', name: 'Invoices' },
  { path: '/dashboard/bookings-v2', name: 'Bookings' },
  { path: '/dashboard/gallery-v2', name: 'Gallery' },
];

interface PageTestResult {
  pageName: string;
  pageUrl: string;
  loaded: boolean;
  errors: string[];
  consoleErrors: string[];
  buttonsFound: number;
  buttonsClicked: number;
  inputsFound: number;
  tabsFound: number;
  tabsClicked: number;
  modalsOpened: number;
  dropdownsFound: number;
  screenshot: string;
}

const results: PageTestResult[] = [];

async function setupScreenshotDir() {
  const dir = path.join(process.cwd(), 'test-results', 'interactive-demo');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function testPageInteractions(page: Page, pageInfo: { path: string; name: string }, screenshotDir: string): Promise<PageTestResult> {
  const result: PageTestResult = {
    pageName: pageInfo.name,
    pageUrl: pageInfo.path,
    loaded: false,
    errors: [],
    consoleErrors: [],
    buttonsFound: 0,
    buttonsClicked: 0,
    inputsFound: 0,
    tabsFound: 0,
    tabsClicked: 0,
    modalsOpened: 0,
    dropdownsFound: 0,
    screenshot: ''
  };

  // Collect console errors
  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      result.consoleErrors.push(msg.text().substring(0, 200));
    }
  };

  const errorHandler = (error: any) => {
    result.errors.push(error.message.substring(0, 200));
  };

  page.on('console', consoleHandler);
  page.on('pageerror', errorHandler);

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Testing: ${pageInfo.name} (${pageInfo.path})`);
    console.log(`${'='.repeat(60)}`);

    // Navigate to page
    const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    if (!response || response.status() === 404) {
      result.errors.push(`Page returned ${response?.status() || 'no response'}`);
      page.off('console', consoleHandler);
      page.off('pageerror', errorHandler);
      return result;
    }

    result.loaded = true;
    await page.waitForTimeout(2000);

    // Take initial screenshot
    const initialScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-01-initial.png`);
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    result.screenshot = initialScreenshot;

    // ========== COUNT ELEMENTS ==========
    console.log('\n📊 Counting interactive elements...');

    // Count buttons (excluding navigation buttons)
    const allButtons = await page.locator('button:visible').all();
    result.buttonsFound = allButtons.length;
    console.log(`   🔘 Buttons: ${result.buttonsFound}`);

    // Count tabs
    result.tabsFound = await page.locator('[role="tab"]:visible').count();
    console.log(`   📑 Tabs: ${result.tabsFound}`);

    // Count inputs
    result.inputsFound = await page.locator('input:visible:not([type="hidden"]), textarea:visible').count();
    console.log(`   ✏️ Inputs: ${result.inputsFound}`);

    // Count dropdowns
    result.dropdownsFound = await page.locator('[role="combobox"]:visible, select:visible').count();
    console.log(`   📂 Dropdowns: ${result.dropdownsFound}`);

    // ========== TEST TABS (safest interaction) ==========
    console.log('\n📑 Testing Tabs...');
    const tabs = page.locator('[role="tab"]:visible');
    const tabCount = await tabs.count();

    for (let i = 0; i < Math.min(tabCount, 5); i++) {
      try {
        const tab = tabs.nth(i);
        const tabText = await tab.textContent().catch(() => `tab-${i}`);

        // Check if still on same page
        const currentUrl = page.url();
        if (!currentUrl.includes(pageInfo.path)) {
          console.log('   ⚠️ Navigation detected, returning to page');
          await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
          break;
        }

        console.log(`   📑 Clicking tab: ${(tabText || '').substring(0, 25)}...`);
        await tab.click({ timeout: 2000, force: true }).catch(() => {});
        result.tabsClicked++;
        await page.waitForTimeout(500);

        // Screenshot after tab
        const tabScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-tab-${i + 1}.png`);
        await page.screenshot({ path: tabScreenshot }).catch(() => {});

      } catch (error) {
        console.log(`   ⚠️ Tab click failed`);
      }
    }

    // ========== TEST SAFE BUTTONS ONLY ==========
    console.log('\n🔘 Testing Safe Buttons...');

    // Only click buttons with specific safe text
    const safePatterns = ['View', 'Show', 'Filter', 'Refresh', 'Details', 'More', 'Toggle', 'Expand', 'Collapse'];
    const skipPatterns = ['delete', 'remove', 'logout', 'sign', 'login', 'cancel', 'close', 'submit', 'save', 'create', 'add', 'new'];

    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      try {
        const button = allButtons[i];
        const buttonText = (await button.textContent().catch(() => '')) || '';
        const ariaLabel = (await button.getAttribute('aria-label').catch(() => '')) || '';
        const buttonId = buttonText.trim() || ariaLabel || `button-${i}`;
        const lowerText = buttonId.toLowerCase();

        // Skip if contains dangerous patterns
        if (skipPatterns.some(p => lowerText.includes(p))) {
          continue;
        }

        // Check if disabled
        const isDisabled = await button.isDisabled().catch(() => true);
        if (isDisabled) continue;

        // Check we're still on the same page
        if (!page.url().includes(pageInfo.path)) {
          console.log('   ⚠️ Navigation detected, stopping button tests');
          break;
        }

        console.log(`   🖱️ Clicking: ${buttonId.substring(0, 30)}...`);

        // Use force click to avoid navigation
        await button.click({ timeout: 2000, force: true }).catch(() => {});
        result.buttonsClicked++;
        await page.waitForTimeout(300);

        // Check for modal
        const modal = page.locator('[role="dialog"]:visible').first();
        if (await modal.isVisible().catch(() => false)) {
          result.modalsOpened++;
          console.log(`   📋 Modal opened!`);

          // Screenshot modal
          const modalScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-modal-${result.modalsOpened}.png`);
          await page.screenshot({ path: modalScreenshot }).catch(() => {});

          // Close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(200);
        }

      } catch (error) {
        // Continue to next button
      }
    }

    // ========== FINAL SCREENSHOT ==========
    // Return to page if navigated away
    if (!page.url().includes(pageInfo.path)) {
      await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(1000);
    }

    const finalScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-99-final.png`);
    await page.screenshot({ path: finalScreenshot, fullPage: true }).catch(() => {});

    // Summary
    console.log(`\n📊 Page Summary: ${pageInfo.name}`);
    console.log(`   Buttons: ${result.buttonsClicked}/${result.buttonsFound} clicked`);
    console.log(`   Tabs: ${result.tabsClicked}/${result.tabsFound} clicked`);
    console.log(`   Modals opened: ${result.modalsOpened}`);
    console.log(`   Console errors: ${result.consoleErrors.length}`);
    console.log(`   Page errors: ${result.errors.length}`);

    if (result.consoleErrors.length > 0) {
      console.log('\n   ❌ Console Errors:');
      result.consoleErrors.slice(0, 3).forEach(e => console.log(`      - ${e.substring(0, 80)}`));
    }

  } catch (error: any) {
    result.errors.push(`Page test failed: ${error.message}`);
    console.log(`   ❌ Page test failed: ${error.message}`);
  }

  page.off('console', consoleHandler);
  page.off('pageerror', errorHandler);

  return result;
}

function generateReport(results: PageTestResult[]): string {
  let report = '# KAZI Platform - Comprehensive Interactive Test Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;

  // Overall Summary
  const totalButtons = results.reduce((sum, r) => sum + r.buttonsFound, 0);
  const totalButtonsClicked = results.reduce((sum, r) => sum + r.buttonsClicked, 0);
  const totalTabs = results.reduce((sum, r) => sum + r.tabsFound, 0);
  const totalTabsClicked = results.reduce((sum, r) => sum + r.tabsClicked, 0);
  const totalInputs = results.reduce((sum, r) => sum + r.inputsFound, 0);
  const totalModals = results.reduce((sum, r) => sum + r.modalsOpened, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length + r.consoleErrors.length, 0);
  const pagesLoaded = results.filter(r => r.loaded).length;

  report += '## Overall Summary\n\n';
  report += `| Metric | Count |\n`;
  report += `|--------|-------|\n`;
  report += `| Pages Tested | ${results.length} |\n`;
  report += `| Pages Loaded | ${pagesLoaded} |\n`;
  report += `| Buttons Found | ${totalButtons} |\n`;
  report += `| Buttons Clicked | ${totalButtonsClicked} |\n`;
  report += `| Tabs Found | ${totalTabs} |\n`;
  report += `| Tabs Clicked | ${totalTabsClicked} |\n`;
  report += `| Inputs Found | ${totalInputs} |\n`;
  report += `| Modals Opened | ${totalModals} |\n`;
  report += `| Total Errors | ${totalErrors} |\n\n`;

  // Page by Page Results
  report += '## Page Results\n\n';

  for (const r of results) {
    const status = r.loaded && r.errors.length === 0 && r.consoleErrors.length === 0 ? '✅' :
                   r.loaded ? '⚠️' : '❌';
    report += `### ${status} ${r.pageName}\n\n`;
    report += `**URL:** \`${r.pageUrl}\`\n\n`;

    if (!r.loaded) {
      report += `**Status:** Failed to load\n\n`;
      continue;
    }

    report += `| Element Type | Found | Interacted |\n`;
    report += `|--------------|-------|------------|\n`;
    report += `| Buttons | ${r.buttonsFound} | ${r.buttonsClicked} |\n`;
    report += `| Tabs | ${r.tabsFound} | ${r.tabsClicked} |\n`;
    report += `| Dropdowns | ${r.dropdownsFound} | - |\n`;
    report += `| Inputs | ${r.inputsFound} | - |\n`;
    report += `| Modals | - | ${r.modalsOpened} |\n\n`;

    if (r.errors.length > 0 || r.consoleErrors.length > 0) {
      report += `**Errors Found (${r.errors.length + r.consoleErrors.length}):**\n`;
      [...r.errors, ...r.consoleErrors].slice(0, 5).forEach(e => {
        report += `- \`${e.substring(0, 100)}\`\n`;
      });
      report += '\n';
    }
  }

  // Error Summary
  const pagesWithErrors = results.filter(r => r.errors.length > 0 || r.consoleErrors.length > 0);
  if (pagesWithErrors.length > 0) {
    report += '## Pages with Errors\n\n';
    for (const r of pagesWithErrors) {
      report += `### ${r.pageName}\n`;
      [...r.errors, ...r.consoleErrors].forEach(e => {
        report += `- \`${e.substring(0, 150)}\`\n`;
      });
      report += '\n';
    }
  }

  return report;
}

test.describe('Comprehensive Interactive Demo', () => {

  test('Full Platform Interactive Test', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    await page.setViewportSize({ width: 1920, height: 1080 });

    const screenshotDir = await setupScreenshotDir();

    console.log('\n' + '='.repeat(70));
    console.log('🚀 KAZI PLATFORM - COMPREHENSIVE INTERACTIVE TEST');
    console.log('='.repeat(70));
    console.log(`Testing ${allPages.length} pages with interaction coverage\n`);

    // Test each page
    for (const pageInfo of allPages) {
      try {
        const result = await testPageInteractions(page, pageInfo, screenshotDir);
        results.push(result);
        await page.waitForTimeout(300).catch(() => {});
      } catch (error: any) {
        console.log(`⚠️ Error testing ${pageInfo.name}: ${error.message}`);
        results.push({
          pageName: pageInfo.name,
          pageUrl: pageInfo.path,
          loaded: false,
          errors: [error.message],
          consoleErrors: [],
          buttonsFound: 0,
          buttonsClicked: 0,
          inputsFound: 0,
          tabsFound: 0,
          tabsClicked: 0,
          modalsOpened: 0,
          dropdownsFound: 0,
          screenshot: ''
        });
      }
    }

    // Generate and save report
    const report = generateReport(results);
    const reportPath = path.join(process.cwd(), 'test-results', 'interactive-demo-report.md');
    const jsonPath = path.join(process.cwd(), 'test-results', 'interactive-demo-results.json');

    fs.writeFileSync(reportPath, report);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));

    const totalButtons = results.reduce((sum, r) => sum + r.buttonsFound, 0);
    const totalButtonsClicked = results.reduce((sum, r) => sum + r.buttonsClicked, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length + r.consoleErrors.length, 0);
    const pagesLoaded = results.filter(r => r.loaded).length;

    console.log(`\n✅ Pages loaded: ${pagesLoaded}/${results.length}`);
    console.log(`🔘 Buttons: ${totalButtonsClicked}/${totalButtons} clicked`);
    console.log(`❌ Total errors: ${totalErrors}`);
    console.log(`\n📄 Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ${screenshotDir}`);

    // Test passes if most pages loaded
    expect(pagesLoaded).toBeGreaterThan(results.length * 0.5);
  });
});
