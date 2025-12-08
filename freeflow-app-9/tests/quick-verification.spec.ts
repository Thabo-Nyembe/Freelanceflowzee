import { test, expect } from '@playwright/test';

/**
 * Quick Verification Test
 * This test will help us see exactly what's rendering on each page
 */

test.describe('Quick Visual Verification', () => {

  test('Verify My Day Page Content', async ({ page }) => {
    console.log('\n🔍 VERIFYING MY DAY PAGE\n');

    await page.goto('http://localhost:9323/dashboard/my-day');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Wait for full hydration

    // Take a detailed screenshot
    await page.screenshot({
      path: 'test-results/verification-my-day-full.png',
      fullPage: true
    });

    // Get the full HTML to see what's actually rendering
    const bodyHTML = await page.locator('body').innerHTML();

    // Check for specific content
    const hasAddTaskButton = bodyHTML.includes('Add Task');
    const hasTaskContent = bodyHTML.includes('My Day') || bodyHTML.includes('task');
    const hasNavigationOnly = bodyHTML.includes('Customize Navigation');

    console.log('Content Analysis:');
    console.log(`  Add Task button in HTML: ${hasAddTaskButton ? '✓ YES' : '✗ NO'}`);
    console.log(`  Task-related content: ${hasTaskContent ? '✓ YES' : '✗ NO'}`);
    console.log(`  Navigation present: ${hasNavigationOnly ? '✓ YES' : '✗ NO'}`);

    // Count actual elements
    const buttonCount = await page.locator('button').count();
    const inputCount = await page.locator('input').count();
    const textareaCount = await page.locator('textarea').count();
    const h1Count = await page.locator('h1').count();

    console.log('\nElement Counts:');
    console.log(`  Buttons: ${buttonCount}`);
    console.log(`  Inputs: ${inputCount}`);
    console.log(`  Textareas: ${textareaCount}`);
    console.log(`  H1 headings: ${h1Count}`);

    // Look for specific data-testid elements
    const addTaskBtnTestId = await page.locator('[data-testid="add-task-header-btn"]').isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`\nSpecific Elements:`);
    console.log(`  Add Task button (by testid): ${addTaskBtnTestId ? '✓ VISIBLE' : '✗ NOT VISIBLE'}`);

    // Check if page is in loading state
    const hasLoadingSkeleton = await page.locator('[class*="skeleton"]').count();
    console.log(`  Loading skeletons: ${hasLoadingSkeleton} ${hasLoadingSkeleton > 0 ? '⚠️ PAGE MAY BE LOADING' : ''}`);

    // Get page title/heading
    const heading = await page.locator('h1, h2').first().textContent().catch(() => 'No heading found');
    console.log(`  Page heading: "${heading}"`);

    // Check for modals/overlays
    const hasOverlay = await page.locator('[class*="backdrop"], [class*="overlay"], [data-state="open"]').count();
    console.log(`  Overlays/Modals open: ${hasOverlay} ${hasOverlay > 0 ? '⚠️ MAY BE BLOCKING CONTENT' : ''}`);

    // List all visible buttons with text
    console.log('\nFirst 10 Visible Buttons:');
    const visibleButtons = await page.locator('button:visible').all();
    for (let i = 0; i < Math.min(visibleButtons.length, 10); i++) {
      const text = await visibleButtons[i].textContent();
      const testId = await visibleButtons[i].getAttribute('data-testid');
      const classes = await visibleButtons[i].getAttribute('class');
      console.log(`  ${i + 1}. "${text?.trim() || '(empty)'}" ${testId ? `[${testId}]` : ''}`);
    }
  });

  test('Verify AI Create Page Content', async ({ page }) => {
    console.log('\n🔍 VERIFYING AI CREATE PAGE\n');

    await page.goto('http://localhost:9323/dashboard/ai-create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'test-results/verification-ai-create-full.png',
      fullPage: true
    });

    const buttonCount = await page.locator('button').count();
    const textareaCount = await page.locator('textarea').count();
    const selectCount = await page.locator('select').count();
    const hasLoadingSkeleton = await page.locator('[class*="skeleton"]').count();

    console.log('Element Counts:');
    console.log(`  Buttons: ${buttonCount}`);
    console.log(`  Textareas: ${textareaCount} ${textareaCount === 0 ? '⚠️ SHOULD HAVE PROMPT INPUT' : ''}`);
    console.log(`  Select dropdowns: ${selectCount} ${selectCount === 0 ? '⚠️ SHOULD HAVE MODEL SELECTOR' : ''}`);
    console.log(`  Loading skeletons: ${hasLoadingSkeleton} ${hasLoadingSkeleton > 0 ? '⚠️ PAGE MAY BE LOADING' : ''}`);

    const heading = await page.locator('h1, h2').first().textContent().catch(() => 'No heading');
    console.log(`  Page heading: "${heading}"`);

    const bodyText = await page.locator('body').textContent();
    const hasAIContent = bodyText.includes('AI') || bodyText.includes('Generate') || bodyText.includes('Create');
    console.log(`  AI-related content: ${hasAIContent ? '✓ YES' : '✗ NO'}`);
  });

  test('Check for Common Issues', async ({ page }) => {
    console.log('\n🔍 CHECKING FOR COMMON ISSUES\n');

    await page.goto('http://localhost:9323/dashboard/my-day');
    await page.waitForLoadState('domcontentloaded');

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    // Check for JavaScript errors
    const _jsErrors = await page.evaluate(() => {
      return (window as any).__errors || [];
    });

    console.log('Error Detection:');
    console.log(`  Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('  Errors found:');
      consoleErrors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
    }

    // Check if React is loaded
    const hasReact = await page.evaluate(() => {
      return typeof (window as any).React !== 'undefined' || document.querySelector('[data-reactroot]') !== null;
    });
    console.log(`  React loaded: ${hasReact ? '✓ YES' : '✗ NO'}`);

    // Check page readiness
    const readyState = await page.evaluate(() => document.readyState);
    console.log(`  Document ready state: ${readyState}`);

    // Check for loading indicators
    const loadingIndicators = await page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').count();
    console.log(`  Loading indicators: ${loadingIndicators} ${loadingIndicators > 0 ? '⚠️ CONTENT MAY STILL BE LOADING' : '✓ DONE'}`);

    // Check main content area
    const mainContent = await page.locator('main, [role="main"], #main-content').count();
    console.log(`  Main content area found: ${mainContent > 0 ? '✓ YES' : '✗ NO'}`);
  });

  test('HTML Dump for Analysis', async ({ page }) => {
    console.log('\n🔍 CAPTURING HTML FOR ANALYSIS\n');

    await page.goto('http://localhost:9323/dashboard/my-day');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Get the entire HTML
    const fullHTML = await page.content();

    // Save to file for inspection
    const fs = require('fs');
    fs.writeFileSync('test-results/my-day-page-html.html', fullHTML);

    console.log('✓ Full HTML saved to: test-results/my-day-page-html.html');
    console.log(`  HTML size: ${(fullHTML.length / 1024).toFixed(2)} KB`);

    // Quick analysis
    const hasAddTaskInHTML = fullHTML.includes('Add Task');
    const hasDataTestId = fullHTML.includes('data-testid="add-task-header-btn"');
    const hasEmptyBody = fullHTML.length < 5000;

    console.log('\nQuick HTML Analysis:');
    console.log(`  Contains "Add Task" text: ${hasAddTaskInHTML ? '✓ YES' : '✗ NO'}`);
    console.log(`  Has data-testid attribute: ${hasDataTestId ? '✓ YES' : '✗ NO'}`);
    console.log(`  HTML seems too small: ${hasEmptyBody ? '⚠️ YES - May be empty!' : '✓ NO'}`);

    // Extract all button texts
    const buttonTexts = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => btn.textContent?.trim()).filter(Boolean).slice(0, 20);
    });

    console.log('\nAll Button Texts Found:');
    buttonTexts.forEach((text, i) => {
      console.log(`  ${i + 1}. "${text}"`);
    });
  });
});
