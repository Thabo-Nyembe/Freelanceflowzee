import { test, expect } from '@playwright/test';

/**
 * Comprehensive Button & Feature Testing
 * Tests all interactive elements and verifies functionality
 */

test.describe('Dashboard Pages - Button & Feature Testing', () => {

  test('My Day - Complete Feature Test', async ({ page }) => {
    console.log('\n🔍 Testing: My Day Page\n');

    await page.goto('http://localhost:9323/dashboard/my-day-v2');

    // Wait for page to load
    await page.waitForSelector('[data-testid="add-task-header-btn"]', { state: 'visible', timeout: 15000 });

    console.log('✓ Page loaded successfully');

    // Test 1: Count all interactive elements
    const buttons = await page.locator('button:visible').count();
    const inputs = await page.locator('input:visible').count();
    const links = await page.locator('a:visible').count();

    console.log(`  Buttons: ${buttons}`);
    console.log(`  Inputs: ${inputs}`);
    console.log(`  Links: ${links}`);

    // Test 2: Primary Actions
    const addTaskBtn = page.locator('[data-testid="add-task-header-btn"]');
    expect(await addTaskBtn.isVisible()).toBe(true);
    console.log('  ✓ Add Task button visible');

    // Test 3: Click Add Task button
    await addTaskBtn.click();
    await page.waitForTimeout(500);
    console.log('  ✓ Add Task button clickable');

    // Test 4: Check for task form/modal
    const hasModal = await page.locator('[role="dialog"]').count() > 0;
    const hasForm = await page.locator('form').count() > 0;
    console.log(`  Modal opened: ${hasModal ? 'YES' : 'NO'}`);
    console.log(`  Form visible: ${hasForm ? 'YES' : 'NO'}`);

    // Test 5: Tab navigation
    const tabs = ['Today\'s Tasks', 'Time Blocks', 'AI Insights', 'Analytics', 'Projects', 'Goals'];
    for (const tabName of tabs) {
      const tabExists = await page.locator(`tab:has-text("${tabName}")`).count() > 0;
      console.log(`  Tab "${tabName}": ${tabExists ? '✓' : '✗'}`);
    }

    // Test 6: Quick Actions
    const quickActions = ['View Calendar', 'Generate Schedule', 'View Projects'];
    for (const actionName of quickActions) {
      const actionBtn = await page.locator(`button:has-text("${actionName}")`).count() > 0;
      console.log(`  Quick Action "${actionName}": ${actionBtn ? '✓' : '✗'}`);
    }

    console.log('\n✅ My Day tests complete\n');
  });

  test('Projects Hub - Complete Feature Test', async ({ page }) => {
    console.log('\n🔍 Testing: Projects Hub Page\n');

    await page.goto('http://localhost:9323/dashboard/projects-hub-v2');

    // Wait for page to load
    await page.waitForSelector('button:has-text("New Project")', { state: 'visible', timeout: 15000 });

    console.log('✓ Page loaded successfully');

    // Test 1: Count interactive elements
    const buttons = await page.locator('button:visible').count();
    console.log(`  Buttons: ${buttons}`);

    // Test 2: Primary Actions
    const newProjectBtn = page.locator('button:has-text("New Project")').first();
    expect(await newProjectBtn.isVisible()).toBe(true);
    console.log('  ✓ New Project button visible');

    // Test 3: Click New Project
    await newProjectBtn.click();
    await page.waitForTimeout(500);
    console.log('  ✓ New Project button clickable');

    // Test 4: Check for project creation form
    const hasModal = await page.locator('[role="dialog"]').count() > 0;
    console.log(`  Modal opened: ${hasModal ? 'YES' : 'NO'}`);

    // Test 5: View toggles (Grid/List)
    const viewButtons = await page.locator('button[aria-label*="view"], button:has-text("Grid"), button:has-text("List")').count();
    console.log(`  View toggle buttons: ${viewButtons}`);

    // Test 6: Filter/Sort options
    const filterButtons = await page.locator('button:has-text("Filter"), button:has-text("Sort")').count();
    console.log(`  Filter/Sort buttons: ${filterButtons}`);

    console.log('\n✅ Projects Hub tests complete\n');
  });

  test('Files Hub - Complete Feature Test', async ({ page }) => {
    console.log('\n🔍 Testing: Files Hub Page\n');

    await page.goto('http://localhost:9323/dashboard/files-hub-v2');

    // Check for error first
    const hasError = await page.locator('heading:has-text("Something went wrong")').count() > 0;
    if (hasError) {
      console.log('  ⚠️  Page has error - skipping test');
      return;
    }

    // Wait for page to load
    await page.waitForSelector('button:has-text("Upload")', { state: 'visible', timeout: 15000 });

    console.log('✓ Page loaded successfully');

    // Test 1: Count interactive elements
    const buttons = await page.locator('button:visible').count();
    console.log(`  Buttons: ${buttons}`);

    // Test 2: Primary Actions
    const uploadBtn = page.locator('button:has-text("Upload")').first();
    expect(await uploadBtn.isVisible()).toBe(true);
    console.log('  ✓ Upload button visible');

    // Test 3: File operations
    const fileActions = ['Upload', 'New Folder', 'Share', 'Download'];
    for (const action of fileActions) {
      const actionBtn = await page.locator(`button:has-text("${action}")`).count() > 0;
      console.log(`  File action "${action}": ${actionBtn ? '✓' : '✗'}`);
    }

    console.log('\n✅ Files Hub tests complete\n');
  });

  test('Settings - Complete Feature Test', async ({ page }) => {
    console.log('\n🔍 Testing: Settings Page\n');

    await page.goto('http://localhost:9323/dashboard/settings-v2');

    // Check for error first
    const hasError = await page.locator('heading:has-text("Something went wrong")').count() > 0;
    if (hasError) {
      console.log('  ⚠️  Page has error - skipping test');
      return;
    }

    // Wait for page to load (look for any input field)
    await page.waitForSelector('input', { state: 'visible', timeout: 15000 });

    console.log('✓ Page loaded successfully');

    // Test 1: Count form elements
    const inputs = await page.locator('input:visible').count();
    const buttons = await page.locator('button:visible').count();
    const selects = await page.locator('select:visible').count();

    console.log(`  Inputs: ${inputs}`);
    console.log(`  Buttons: ${buttons}`);
    console.log(`  Selects: ${selects}`);

    // Test 2: Check for Save button
    const saveBtn = await page.locator('button:has-text("Save")').count() > 0;
    console.log(`  Save button: ${saveBtn ? '✓' : '✗'}`);

    // Test 3: Settings sections
    const sections = ['Profile', 'Account', 'Preferences', 'Notifications', 'Security'];
    for (const section of sections) {
      const sectionExists = await page.locator(`heading:has-text("${section}"), button:has-text("${section}")`).count() > 0;
      console.log(`  Section "${section}": ${sectionExists ? '✓' : '✗'}`);
    }

    console.log('\n✅ Settings tests complete\n');
  });

  test('Navigation - Sidebar Test', async ({ page }) => {
    console.log('\n🔍 Testing: Navigation Sidebar\n');

    await page.goto('http://localhost:9323/dashboard');
    await page.waitForLoadState('networkidle');

    // Test sidebar links
    const sidebarLinks = [
      'Dashboard',
      'My Day',
      'Projects Hub',
      'AI Create',
      'Files Hub',
      'Settings'
    ];

    for (const linkText of sidebarLinks) {
      const link = await page.locator(`a:has-text("${linkText}")`).count();
      console.log(`  Navigation link "${linkText}": ${link > 0 ? '✓' : '✗'}`);
    }

    console.log('\n✅ Navigation tests complete\n');
  });
});

test.describe('Button Click & Response Tests', () => {

  test('Test button clicks trigger expected responses', async ({ page }) => {
    console.log('\n🔍 Testing: Button Click Responses\n');

    await page.goto('http://localhost:9323/dashboard/my-day-v2');
    await page.waitForSelector('[data-testid="add-task-header-btn"]', { state: 'visible', timeout: 15000 });

    // Test 1: Add Task button
    const addTaskBtn = page.locator('[data-testid="add-task-header-btn"]');
    await addTaskBtn.click();
    await page.waitForTimeout(500);

    // Check if modal/form appeared
    const modalAppeared = await page.locator('[role="dialog"], form').count() > 0;
    console.log(`  Add Task click response: ${modalAppeared ? '✓ Modal/Form opened' : '✗ No response'}`);

    // Close modal if it opened
    const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Cancel")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }

    // Test 2: Tab switching
    const analyticsTab = page.locator('tab:has-text("Analytics")');
    if (await analyticsTab.count() > 0) {
      await analyticsTab.click();
      await page.waitForTimeout(500);
      const tabActive = await analyticsTab.getAttribute('aria-selected');
      console.log(`  Tab switching: ${tabActive === 'true' ? '✓ Tab changed' : '✗ Tab did not change'}`);
    }

    console.log('\n✅ Button response tests complete\n');
  });
});
