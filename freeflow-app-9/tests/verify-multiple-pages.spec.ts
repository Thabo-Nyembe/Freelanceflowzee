import { test, expect } from '@playwright/test';

test('Verify Multiple Dashboard Pages Load Content', async ({ page }) => {
  const pages = [
    { url: '/dashboard/my-day', name: 'My Day' },
    { url: '/dashboard/projects-hub', name: 'Projects Hub' },
    { url: '/dashboard/ai-create', name: 'AI Create' },
    { url: '/dashboard/files-hub', name: 'Files Hub' },
    { url: '/dashboard/settings', name: 'Settings' }
  ];

  console.log('\n🎯 TESTING MULTIPLE DASHBOARD PAGES\n');

  for (const pageTest of pages) {
    console.log(`\n🔍 Testing: ${pageTest.name} (${pageTest.url})`);
    await page.goto(`http://localhost:9323${pageTest.url}`);
    await page.waitForTimeout(3000); // Wait for hydration + loading completion

    const skeletons = await page.locator('[class*="animate-pulse"]').count();
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
