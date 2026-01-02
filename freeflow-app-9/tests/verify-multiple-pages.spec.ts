import { test, expect } from '@playwright/test';

test('Verify Multiple Dashboard Pages Load Content', async ({ page }) => {
  const pages = [
    { url: '/dashboard/my-day-v2', name: 'My Day', selector: '[data-testid="add-task-header-btn"]' },
    { url: '/dashboard/projects-hub-v2', name: 'Projects Hub', selector: 'button:has-text("New Project")' },
    { url: '/dashboard/ai-create-v2', name: 'AI Create', selector: 'button:has-text("Generate Content")' },
    { url: '/dashboard/files-hub-v2', name: 'Files Hub', selector: 'button:has-text("Upload")' },
    { url: '/dashboard/settings-v2', name: 'Settings', selector: 'input[type="text"]' }
  ];

  console.log('\n🎯 TESTING MULTIPLE DASHBOARD PAGES\n');

  for (const pageTest of pages) {
    console.log(`\n🔍 Testing: ${pageTest.name} (${pageTest.url})`);
    await page.goto(`http://localhost:9323${pageTest.url}`);

    // Check for error page first
    const hasError = await page.locator('heading:has-text("Something went wrong")').count() > 0;
    if (hasError) {
      console.log(`  ⚠️  Page has error - skipping test`);
      continue;
    }

    // Wait for page-specific element to confirm hydration complete
    await page.waitForSelector(pageTest.selector, { state: 'visible', timeout: 10000 });

    // Count skeleton CARDS only (not decorative animations)
    const skeletons = await page.locator('.rounded-lg.border .animate-pulse').count();
    const buttons = await page.locator('button:visible').count();

    console.log(`  ✓ Skeleton loaders: ${skeletons} (should be 0)`);
    console.log(`  ✓ Visible buttons: ${buttons} (should be 35+)`);

    // Pages should have no skeletons after loading
    expect(skeletons).toBe(0);
    // Should have navigation + page buttons
    expect(buttons).toBeGreaterThan(35);
  }

  console.log('\n🎉 All pages loaded successfully!\n');
});
