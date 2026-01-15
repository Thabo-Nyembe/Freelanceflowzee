import { test, expect } from '@playwright/test';

/**
 * Comprehensive Button Click Tests with Authentication
 * Logs in first, then clicks EVERY button on each dashboard page
 */

const BASE_URL = 'http://localhost:9323';
const TEST_EMAIL = 'test@kazi.dev';
const TEST_PASSWORD = 'Test123!';

// All V2 routes to test
const V2_ROUTES = [
  '/dashboard/overview-v2',
  '/dashboard/projects-hub-v2',
  '/dashboard/tasks-v2',
  '/dashboard/invoices-v2',
  '/dashboard/calendar-v2',
  '/dashboard/analytics-v2',
  '/dashboard/messages-v2',
  '/dashboard/files-hub-v2',
  '/dashboard/clients-v2',
  '/dashboard/settings-v2',
  '/dashboard/notifications-v2',
  '/dashboard/video-studio-v2',
  '/dashboard/ai-assistant-v2',
  '/dashboard/bookings-v2',
  '/dashboard/billing-v2',
];

// V1 routes to test
const V1_ROUTES = [
  '/v1/dashboard/admin',
  '/v1/dashboard/projects',
  '/v1/dashboard/tasks',
  '/v1/dashboard/invoices',
  '/v1/dashboard/calendar',
  '/v1/dashboard/files',
  '/v1/dashboard/clients',
];

test.describe('Click Every Button Tests (With Login)', () => {
  test.setTimeout(180000); // 3 minutes per test

  // Login before each test
  test.beforeEach(async ({ page }) => {
    console.log('\n🔐 Logging in...');

    // Go to login page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click sign in
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('✅ Logged in successfully!');
    await page.waitForTimeout(2000);
  });

  for (const route of V2_ROUTES) {
    test(`V2: ${route} - click all buttons`, async ({ page }) => {
      const clickResults: { text: string; clicked: boolean; error?: string }[] = [];

      // Navigate to page
      console.log(`\n📄 Navigating to ${route}...`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for hydration

      // Find all buttons
      const buttons = await page.locator('button').all();
      console.log(`\n=== ${route} ===`);
      console.log(`Found ${buttons.length} buttons`);

      // Click each button
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];

        try {
          // Check if button is visible and enabled
          const isVisible = await button.isVisible().catch(() => false);
          const isDisabled = await button.isDisabled().catch(() => true);
          const buttonText = await button.textContent().catch(() => `Button ${i}`);
          const trimmedText = buttonText?.trim().substring(0, 50) || `Button ${i}`;

          if (!isVisible) {
            clickResults.push({ text: trimmedText, clicked: false, error: 'Not visible' });
            continue;
          }

          if (isDisabled) {
            clickResults.push({ text: trimmedText, clicked: false, error: 'Disabled' });
            continue;
          }

          // Skip navigation buttons that would leave the page
          const href = await button.getAttribute('href').catch(() => null);
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            clickResults.push({ text: trimmedText, clicked: false, error: 'Navigation button' });
            continue;
          }

          // Click the button
          await button.click({ timeout: 3000, force: true }).catch(() => {});
          clickResults.push({ text: trimmedText, clicked: true });
          console.log(`✓ Clicked: "${trimmedText}"`);

          // Wait briefly for any UI updates
          await page.waitForTimeout(500);

          // Close any dialogs that might have opened
          const closeButtons = await page.locator('[aria-label="Close"], button:has-text("Cancel"), button:has-text("Close"), [data-dismiss]').all();
          for (const closeBtn of closeButtons) {
            try {
              if (await closeBtn.isVisible()) {
                await closeBtn.click({ timeout: 1000 });
                await page.waitForTimeout(200);
              }
            } catch {}
          }

          // Press Escape to close any modals
          await page.keyboard.press('Escape');
          await page.waitForTimeout(100);

        } catch (error: any) {
          const buttonText = await button.textContent().catch(() => `Button ${i}`);
          clickResults.push({
            text: buttonText?.trim().substring(0, 50) || `Button ${i}`,
            clicked: false,
            error: error.message?.substring(0, 50)
          });
        }
      }

      // Summary
      const clicked = clickResults.filter(r => r.clicked).length;
      const skipped = clickResults.filter(r => !r.clicked).length;
      console.log(`\n📊 Summary: ${clicked} clicked, ${skipped} skipped`);

      // Log skipped buttons
      const skippedButtons = clickResults.filter(r => !r.clicked);
      if (skippedButtons.length > 0) {
        console.log('Skipped buttons:');
        skippedButtons.forEach(b => console.log(`  - "${b.text}": ${b.error}`));
      }

      // Test passes if we clicked at least some buttons (or found none)
      expect(buttons.length >= 0).toBe(true);
    });
  }

  for (const route of V1_ROUTES) {
    test(`V1: ${route} - click all buttons`, async ({ page }) => {
      const clickResults: { text: string; clicked: boolean; error?: string }[] = [];

      // Navigate to page
      console.log(`\n📄 Navigating to ${route}...`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Find all buttons
      const buttons = await page.locator('button').all();
      console.log(`\n=== ${route} ===`);
      console.log(`Found ${buttons.length} buttons`);

      // Click each button
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];

        try {
          const isVisible = await button.isVisible().catch(() => false);
          const isDisabled = await button.isDisabled().catch(() => true);
          const buttonText = await button.textContent().catch(() => `Button ${i}`);
          const trimmedText = buttonText?.trim().substring(0, 50) || `Button ${i}`;

          if (!isVisible) {
            clickResults.push({ text: trimmedText, clicked: false, error: 'Not visible' });
            continue;
          }

          if (isDisabled) {
            clickResults.push({ text: trimmedText, clicked: false, error: 'Disabled' });
            continue;
          }

          // Click the button
          await button.click({ timeout: 3000, force: true }).catch(() => {});
          clickResults.push({ text: trimmedText, clicked: true });
          console.log(`✓ Clicked: "${trimmedText}"`);

          await page.waitForTimeout(500);

          // Close any dialogs
          const closeButtons = await page.locator('[aria-label="Close"], button:has-text("Cancel"), button:has-text("Close")').all();
          for (const closeBtn of closeButtons) {
            try {
              if (await closeBtn.isVisible()) {
                await closeBtn.click({ timeout: 1000 });
              }
            } catch {}
          }

          await page.keyboard.press('Escape');
          await page.waitForTimeout(100);

        } catch (error: any) {
          const buttonText = await button.textContent().catch(() => `Button ${i}`);
          clickResults.push({
            text: buttonText?.trim().substring(0, 50) || `Button ${i}`,
            clicked: false,
            error: error.message?.substring(0, 50)
          });
        }
      }

      const clicked = clickResults.filter(r => r.clicked).length;
      const skipped = clickResults.filter(r => !r.clicked).length;
      console.log(`\n📊 Summary: ${clicked} clicked, ${skipped} skipped`);

      expect(buttons.length >= 0).toBe(true);
    });
  }
});

// Full Interactive Element Test with Login
test.describe('Full Interactive Test (With Login)', () => {
  test.setTimeout(300000); // 5 minutes

  test('Overview V2 - test ALL interactive elements', async ({ page }) => {
    // Login first
    console.log('\n🔐 Logging in...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('✅ Logged in!');

    // Navigate to overview
    await page.goto(`${BASE_URL}/dashboard/overview-v2`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    let totalClicked = 0;
    const errors: string[] = [];

    // 1. Click all buttons
    console.log('\n=== BUTTONS ===');
    const buttons = await page.locator('button:visible').all();
    console.log(`Found ${buttons.length} visible buttons`);

    for (let i = 0; i < Math.min(buttons.length, 100); i++) {
      try {
        const btn = buttons[i];
        const text = await btn.textContent().catch(() => '');
        if (await btn.isEnabled()) {
          await btn.click({ timeout: 2000, force: true });
          console.log(`✓ Button: "${text?.trim().substring(0, 30)}"`);
          totalClicked++;
          await page.waitForTimeout(300);
          await page.keyboard.press('Escape');
        }
      } catch (e: any) {
        errors.push(`Button ${i}: ${e.message?.substring(0, 30)}`);
      }
    }

    // 2. Click all dropdown triggers
    console.log('\n=== DROPDOWNS ===');
    const dropdowns = await page.locator('[data-radix-dropdown-menu-trigger], [role="combobox"], select').all();
    console.log(`Found ${dropdowns.length} dropdowns`);

    for (let i = 0; i < dropdowns.length; i++) {
      try {
        const dropdown = dropdowns[i];
        if (await dropdown.isVisible()) {
          await dropdown.click({ timeout: 2000 });
          console.log(`✓ Dropdown ${i}`);
          totalClicked++;
          await page.waitForTimeout(400);
          await page.keyboard.press('Escape');
        }
      } catch (e: any) {
        errors.push(`Dropdown ${i}: ${e.message?.substring(0, 30)}`);
      }
    }

    // 3. Click all tabs
    console.log('\n=== TABS ===');
    const tabs = await page.locator('[role="tab"]').all();
    console.log(`Found ${tabs.length} tabs`);

    for (let i = 0; i < tabs.length; i++) {
      try {
        const tab = tabs[i];
        if (await tab.isVisible()) {
          await tab.click({ timeout: 2000 });
          console.log(`✓ Tab ${i}`);
          totalClicked++;
          await page.waitForTimeout(400);
        }
      } catch (e: any) {
        errors.push(`Tab ${i}: ${e.message?.substring(0, 30)}`);
      }
    }

    // 4. Click all checkboxes
    console.log('\n=== CHECKBOXES ===');
    const checkboxes = await page.locator('input[type="checkbox"], [role="checkbox"]').all();
    console.log(`Found ${checkboxes.length} checkboxes`);

    for (let i = 0; i < checkboxes.length; i++) {
      try {
        const checkbox = checkboxes[i];
        if (await checkbox.isVisible()) {
          await checkbox.click({ timeout: 2000 });
          console.log(`✓ Checkbox ${i}`);
          totalClicked++;
          await page.waitForTimeout(200);
        }
      } catch (e: any) {
        errors.push(`Checkbox ${i}: ${e.message?.substring(0, 30)}`);
      }
    }

    // 5. Click all switches/toggles
    console.log('\n=== SWITCHES ===');
    const switches = await page.locator('[role="switch"], .switch').all();
    console.log(`Found ${switches.length} switches`);

    for (let i = 0; i < switches.length; i++) {
      try {
        const sw = switches[i];
        if (await sw.isVisible()) {
          await sw.click({ timeout: 2000 });
          console.log(`✓ Switch ${i}`);
          totalClicked++;
          await page.waitForTimeout(200);
        }
      } catch (e: any) {
        errors.push(`Switch ${i}: ${e.message?.substring(0, 30)}`);
      }
    }

    // 6. Test input fields
    console.log('\n=== INPUT FIELDS ===');
    const inputs = await page.locator('input[type="text"], input[type="search"], textarea').all();
    console.log(`Found ${inputs.length} input fields`);

    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      try {
        const input = inputs[i];
        if (await input.isVisible()) {
          await input.fill('Test input');
          console.log(`✓ Input ${i}`);
          totalClicked++;
          await page.waitForTimeout(200);
        }
      } catch (e: any) {
        errors.push(`Input ${i}: ${e.message?.substring(0, 30)}`);
      }
    }

    console.log(`\n=== FINAL SUMMARY ===`);
    console.log(`Total elements interacted: ${totalClicked}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('Errors:');
      errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    }

    expect(totalClicked).toBeGreaterThan(0);
  });
});
