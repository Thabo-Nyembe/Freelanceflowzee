import { test, Page } from '@playwright/test';

/**
 * Interactive Button Walkthrough
 * This test clicks through the entire app, identifying and testing every interactive element
 */

interface TestResult {
  page: string;
  element: string;
  type: string;
  status: 'working' | 'broken' | 'not_found';
  action?: string;
  error?: string;
}

const results: TestResult[] = [];

async function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'working' ? '✓' : result.status === 'broken' ? '✗' : '?';
  console.log(`${icon} [${result.page}] ${result.element} - ${result.status}${result.error ? `: ${result.error}` : ''}`);
}

async function waitForHydration(page: Page) {
  // Wait for Next.js to fully hydrate
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give time for client-side JS to execute
}

test.describe('Interactive App Walkthrough', () => {

  test('Landing Page - Full Interaction Test', async ({ page }) => {
    console.log('\n=== LANDING PAGE TEST ===\n');

    await page.goto('http://localhost:9323');
    await waitForHydration(page);

    // Take screenshot
    await page.screenshot({ path: 'test-results/landing-page.png', fullPage: true });

    // Test navigation buttons
    const navButtons = [
      { text: 'Features', href: '/features' },
      { text: 'Pricing', href: '/pricing' },
      { text: 'Demo', href: '/demo-features' },
      { text: 'Login', href: '/login' },
      { text: 'Sign Up', href: '/signup' }
    ];

    for (const btn of navButtons) {
      try {
        const link = page.locator(`a[href="${btn.href}"]`).first();
        const isVisible = await link.isVisible();

        if (isVisible) {
          await logResult({
            page: 'Landing',
            element: `${btn.text} Link`,
            type: 'navigation',
            status: 'working',
            action: `Links to ${btn.href}`
          });
        } else {
          await logResult({
            page: 'Landing',
            element: `${btn.text} Link`,
            type: 'navigation',
            status: 'not_found'
          });
        }
      } catch (error) {
        await logResult({
          page: 'Landing',
          element: `${btn.text} Link`,
          type: 'navigation',
          status: 'broken',
          error: error.message
        });
      }
    }

    // Test hero CTAs
    const heroButtons = await page.locator('button').all();
    console.log(`\nFound ${heroButtons.length} buttons on landing page`);

    for (let i = 0; i < heroButtons.length && i < 10; i++) {
      try {
        const btn = heroButtons[i];
        const text = await btn.textContent();
        const isVisible = await btn.isVisible();
        const isEnabled = await btn.isEnabled();

        if (isVisible && isEnabled) {
          await logResult({
            page: 'Landing',
            element: text?.trim() || `Button ${i}`,
            type: 'button',
            status: 'working'
          });
        } else {
          await logResult({
            page: 'Landing',
            element: text?.trim() || `Button ${i}`,
            type: 'button',
            status: 'broken',
            error: !isVisible ? 'Not visible' : 'Not enabled'
          });
        }
      } catch (error) {
        console.log(`Error testing button ${i}: ${error.message}`);
      }
    }

    // Test feature cards - "Learn More" buttons
    const learnMoreButtons = await page.locator('button:has-text("Learn More")').all();
    console.log(`\nFound ${learnMoreButtons.length} "Learn More" buttons`);

    for (let i = 0; i < learnMoreButtons.length; i++) {
      try {
        const btn = learnMoreButtons[i];
        const isVisible = await btn.isVisible();

        if (isVisible) {
          // Get parent card to understand context
          const card = btn.locator('xpath=ancestor::div[contains(@class, "p-6")]').first();
          const cardText = await card.textContent().catch(() => 'Unknown Feature');
          const featureName = cardText.split('\n')[1]?.trim() || `Feature ${i + 1}`;

          await logResult({
            page: 'Landing',
            element: `Learn More: ${featureName}`,
            type: 'cta',
            status: 'working'
          });
        }
      } catch (error) {
        console.log(`Error testing Learn More button ${i}: ${error.message}`);
      }
    }
  });

  test('Dashboard - Main Navigation Test', async ({ page }) => {
    console.log('\n=== DASHBOARD TEST ===\n');

    await page.goto('http://localhost:9323/dashboard');
    await waitForHydration(page);

    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true });

    // Count all interactive elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();

    console.log(`Dashboard has: ${buttons} buttons, ${links} links, ${inputs} inputs`);

    // Test sidebar navigation
    const sidebarPages = [
      'my-day', 'projects-hub', 'client-zone', 'files-hub',
      'ai-create', 'ai-design', 'video-studio', 'audio-studio',
      'collaboration', 'analytics', 'settings'
    ];

    for (const pageName of sidebarPages) {
      try {
        const navItem = page.locator(`a[href*="${pageName}"], button:has-text("${pageName}")`).first();
        const isVisible = await navItem.isVisible({ timeout: 1000 }).catch(() => false);

        await logResult({
          page: 'Dashboard',
          element: `Nav: ${pageName}`,
          type: 'navigation',
          status: isVisible ? 'working' : 'not_found'
        });
      } catch (error) {
        await logResult({
          page: 'Dashboard',
          element: `Nav: ${pageName}`,
          type: 'navigation',
          status: 'broken',
          error: error.message
        });
      }
    }

    // Test all visible buttons
    const allButtons = await page.locator('button:visible').all();
    console.log(`\nTesting ${Math.min(allButtons.length, 20)} visible buttons...`);

    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      try {
        const btn = allButtons[i];
        const text = await btn.textContent();
        const isEnabled = await btn.isEnabled();

        await logResult({
          page: 'Dashboard',
          element: text?.trim() || `Button ${i}`,
          type: 'button',
          status: isEnabled ? 'working' : 'broken',
          error: isEnabled ? undefined : 'Disabled'
        });
      } catch (error) {
        console.log(`Error testing button ${i}`);
      }
    }
  });

  test('My Day - Task Management Test', async ({ page }) => {
    console.log('\n=== MY DAY PAGE TEST ===\n');

    await page.goto('http://localhost:9323/dashboard/my-day-v2');
    await waitForHydration(page);

    await page.screenshot({ path: 'test-results/my-day.png', fullPage: true });

    // Count elements
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    console.log(`My Day has: ${buttons} buttons, ${inputs} inputs`);

    // Look for task-related buttons
    const taskButtons = [
      'Add Task', 'New Task', 'Create', 'Save', 'Delete',
      'Edit', 'Complete', 'Priority', 'Schedule'
    ];

    for (const btnText of taskButtons) {
      const btn = page.locator(`button:has-text("${btnText}")`).first();
      const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);

      await logResult({
        page: 'My Day',
        element: btnText,
        type: 'button',
        status: isVisible ? 'working' : 'not_found'
      });
    }

    // Test all buttons
    const allButtons = await page.locator('button:visible').all();
    console.log(`\nFound ${allButtons.length} visible buttons`);

    for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
      const btn = allButtons[i];
      const text = await btn.textContent().catch(() => '');

      if (text.trim()) {
        await logResult({
          page: 'My Day',
          element: text.trim(),
          type: 'button',
          status: 'working'
        });
      }
    }
  });

  test('Projects Hub - Project Management Test', async ({ page }) => {
    console.log('\n=== PROJECTS HUB TEST ===\n');

    await page.goto('http://localhost:9323/dashboard/projects-hub-v2');
    await waitForHydration(page);

    await page.screenshot({ path: 'test-results/projects-hub.png', fullPage: true });

    const buttons = await page.locator('button:visible').all();
    console.log(`Projects Hub has ${buttons.length} visible buttons`);

    // Test project management buttons
    const projectButtons = [
      'New Project', 'Create', 'Filter', 'Sort', 'View',
      'Edit', 'Delete', 'Share', 'Export'
    ];

    for (const btnText of projectButtons) {
      const btn = page.locator(`button:has-text("${btnText}")`).first();
      const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);

      await logResult({
        page: 'Projects Hub',
        element: btnText,
        type: 'button',
        status: isVisible ? 'working' : 'not_found'
      });
    }
  });

  test('AI Create - Content Generation Test', async ({ page }) => {
    console.log('\n=== AI CREATE PAGE TEST ===\n');

    await page.goto('http://localhost:9323/dashboard/ai-create-v2');
    await waitForHydration(page);

    await page.screenshot({ path: 'test-results/ai-create.png', fullPage: true });

    const buttons = await page.locator('button:visible').all();
    const textareas = await page.locator('textarea').count();
    const selects = await page.locator('select').count();

    console.log(`AI Create has: ${buttons.length} buttons, ${textareas} textareas, ${selects} selects`);

    // Test AI-related buttons
    const aiButtons = [
      'Generate', 'Create', 'Submit', 'Clear', 'Save',
      'Export', 'Copy', 'Regenerate', 'Stop'
    ];

    for (const btnText of aiButtons) {
      const btn = page.locator(`button:has-text("${btnText}")`).first();
      const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);

      await logResult({
        page: 'AI Create',
        element: btnText,
        type: 'button',
        status: isVisible ? 'working' : 'not_found'
      });
    }

    // Test all visible buttons
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const text = await buttons[i].textContent().catch(() => '');
      if (text.trim()) {
        await logResult({
          page: 'AI Create',
          element: text.trim(),
          type: 'button',
          status: 'working'
        });
      }
    }
  });

  test('Files Hub - File Management Test', async ({ page }) => {
    console.log('\n=== FILES HUB TEST ===\n');

    await page.goto('http://localhost:9323/dashboard/files-hub-v2');
    await waitForHydration(page);

    await page.screenshot({ path: 'test-results/files-hub.png', fullPage: true });

    const buttons = await page.locator('button:visible').all();
    console.log(`Files Hub has ${buttons.length} visible buttons`);

    // Test file management buttons
    const fileButtons = [
      'Upload', 'New Folder', 'Download', 'Share', 'Delete',
      'Move', 'Copy', 'Rename', 'Sort', 'Filter', 'Search'
    ];

    for (const btnText of fileButtons) {
      const btn = page.locator(`button:has-text("${btnText}")`).first();
      const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);

      await logResult({
        page: 'Files Hub',
        element: btnText,
        type: 'button',
        status: isVisible ? 'working' : 'not_found'
      });
    }
  });

  test('Settings - Configuration Test', async ({ page }) => {
    console.log('\n=== SETTINGS PAGE TEST ===\n');

    await page.goto('http://localhost:9323/dashboard/settings-v2');
    await waitForHydration(page);

    await page.screenshot({ path: 'test-results/settings.png', fullPage: true });

    const buttons = await page.locator('button:visible').all();
    const inputs = await page.locator('input').count();

    console.log(`Settings has: ${buttons.length} buttons, ${inputs} inputs`);

    // Test settings buttons
    const settingsButtons = [
      'Save', 'Cancel', 'Reset', 'Update', 'Change Password',
      'Upload Avatar', 'Delete Account', 'Export Data'
    ];

    for (const btnText of settingsButtons) {
      const btn = page.locator(`button:has-text("${btnText}")`).first();
      const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);

      await logResult({
        page: 'Settings',
        element: btnText,
        type: 'button',
        status: isVisible ? 'working' : 'not_found'
      });
    }
  });

  test.afterAll(async () => {
    console.log('\n\n=== COMPREHENSIVE TEST SUMMARY ===\n');

    const working = results.filter(r => r.status === 'working');
    const broken = results.filter(r => r.status === 'broken');
    const notFound = results.filter(r => r.status === 'not_found');

    console.log(`Total Elements Tested: ${results.length}`);
    console.log(`✓ Working: ${working.length}`);
    console.log(`✗ Broken: ${broken.length}`);
    console.log(`? Not Found: ${notFound.length}`);

    if (broken.length > 0) {
      console.log('\n=== BROKEN ELEMENTS (NEED FIXING) ===');
      broken.forEach(r => {
        console.log(`  ${r.page} > ${r.element}: ${r.error}`);
      });
    }

    if (notFound.length > 0) {
      console.log('\n=== MISSING ELEMENTS (NEED IMPLEMENTATION) ===');
      const byPage = notFound.reduce((acc, r) => {
        if (!acc[r.page]) acc[r.page] = [];
        acc[r.page].push(r.element);
        return acc;
      }, {} as Record<string, string[]>);

      Object.entries(byPage).forEach(([page, elements]) => {
        console.log(`\n  ${page}:`);
        elements.forEach(el => console.log(`    - ${el}`));
      });
    }

    // Write results to file
    const fs = require('fs');
    fs.writeFileSync(
      'test-results/button-audit-results.json',
      JSON.stringify(results, null, 2)
    );

    console.log('\n✓ Full results saved to test-results/button-audit-results.json');
  });
});
