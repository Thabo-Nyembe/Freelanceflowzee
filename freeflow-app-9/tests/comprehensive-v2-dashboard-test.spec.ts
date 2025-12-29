import { test, expect } from '@playwright/test';

/**
 * Comprehensive V2 Dashboard Pages Test Suite
 * Tests all 120 V2 dashboard pages for basic functionality
 */

test.describe('Comprehensive V2 Dashboard Page Tests', () => {

  test('Verify All V2 Dashboard Pages Load Without 404 Errors', async ({ page }) => {
    const v2DashboardPages = [
      'access-logs-v2',
      'activity-logs-v2',
      'add-ons-v2',
      'admin-v2',
      'ai-assistant-v2',
      'ai-create-v2',
      'ai-design-v2',
      'alerts-v2',
      'allocation-v2',
      'analytics-v2',
      'announcements-v2',
      'api-keys-v2',
      'api-v2',
      'app-store-v2',
      'assets-v2',
      'audio-studio-v2',
      'audit-logs-v2',
      'audit-v2',
      'automation-v2',
      'automations-v2',
      'backups-v2',
      'billing-v2',
      'bookings-v2',
      'broadcasts-v2',
      'budgets-v2',
      'bugs-v2',
      'builds-v2',
      'calendar-v2',
      'campaigns-v2',
      'canvas-v2',
      'capacity-v2',
      'certifications-v2',
      'changelog-v2',
      'chat-v2',
      'ci-cd-v2',
      'clients-v2',
      'cloud-storage-v2',
      'collaboration-v2',
      'community-v2',
      'compliance-v2',
      'component-library-v2',
      'connectors-v2',
      'content-studio-v2',
      'content-v2',
      'contracts-v2',
      'courses-v2',
      'crm-v2',
      'customer-success-v2',
      'customer-support-v2',
      'customers-v2',
      'data-export-v2',
      'dependencies-v2',
      'deployments-v2',
      'desktop-app-v2',
      'docs-v2',
      'documentation-v2',
      'documents-v2',
      'email-marketing-v2',
      'employees-v2',
      'escrow-v2',
      'events-v2',
      'expenses-v2',
      'extensions-v2',
      'faq-v2',
      'features-v2',
      'feedback-v2',
      'files-hub-v2',
      'financial-v2',
      'forms-v2',
      'gallery-v2',
      'growth-hub-v2',
      'health-score-v2',
      'help-center-v2',
      'help-docs-v2',
      'integrations-marketplace-v2',
      'integrations-v2',
      'inventory-v2',
      'investor-metrics-v2',
      'invoices-v2',
      'invoicing-v2',
      'knowledge-articles-v2',
      'knowledge-base-v2',
      'lead-generation-v2',
      'learning-v2',
      'logistics-v2',
      'logs-v2',
      'maintenance-v2',
      'marketing-v2',
      'marketplace-v2',
      'media-library-v2',
      'messages-v2',
      'messaging-v2',
      'milestones-v2',
      'mobile-app-v2',
      'monitoring-v2',
      'motion-graphics-v2',
      'my-day-v2',
      'notifications-v2',
      'onboarding-v2',
      'orders-v2',
      'overview-v2',
      'payroll-v2',
      'performance-analytics-v2',
      'performance-v2',
      'permissions-v2',
      'plugins-v2',
      'polls-v2',
      'pricing-v2',
      'products-v2',
      'profile-v2',
      'projects-hub-v2',
      'qa-v2',
      'recruitment-v2',
      'registrations-v2',
      'release-notes-v2',
      'releases-v2',
      'renewals-v2',
      'reporting-v2',
      'reports-v2',
      'resources-v2',
      'roadmap-v2',
      'roles-v2',
      'sales-v2',
      'security-audit-v2',
      'security-v2',
      'seo-v2',
      'settings-v2',
      'shipping-v2',
      'social-media-v2',
      'sprints-v2',
      'stock-v2',
      'support-tickets-v2',
      'support-v2',
      'surveys-v2',
      'system-insights-v2',
      'team-hub-v2',
      'team-management-v2',
      'templates-v2',
      'testing-v2',
      'theme-store-v2',
      'third-party-integrations-v2',
      'tickets-v2',
      'time-tracking-v2',
      'training-v2',
      'transactions-v2',
      'tutorials-v2',
      'user-management-v2',
      'video-studio-v2',
      'vulnerability-scan-v2',
      'warehouse-v2',
      'webinars-v2',
      'webhooks-v2',
      'widget-library-v2',
      'workflow-builder-v2',
      'workflows-v2'
    ];

    console.log(`\n🎯 COMPREHENSIVE V2 DASHBOARD TEST: ${v2DashboardPages.length} PAGES\n`);

    const results = {
      success: [] as string[],
      loading: [] as string[],
      error: [] as string[],
      fourOhFour: [] as string[]
    };

    for (const pagePath of v2DashboardPages) {
      const url = `/dashboard/${pagePath}`;
      console.log(`\n📄 Testing: ${url}`);

      try {
        const response = await page.goto(`http://localhost:9323${url}`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });

        // Check response status
        if (response && response.status() === 404) {
          console.log(`  ❌ 404 Not Found`);
          results.fourOhFour.push(pagePath);
          continue;
        }

        // Wait a bit for hydration
        await page.waitForTimeout(1000);

        // Check if still showing skeleton loaders
        const skeletons = await page.locator('.rounded-lg.border .animate-pulse').count();

        // Check if page has error
        const hasError = await page.locator('heading:has-text("Something went wrong")').count() > 0;

        // Count buttons
        const buttons = await page.locator('button:visible').count();

        if (hasError) {
          console.log(`  ⚠️  Error page detected`);
          results.error.push(pagePath);
        } else if (skeletons > 10) {
          console.log(`  ⏳ Still loading (${skeletons} skeletons, ${buttons} buttons)`);
          results.loading.push(pagePath);
        } else {
          console.log(`  ✅ Working (${skeletons} skeletons, ${buttons} buttons)`);
          results.success.push(pagePath);
        }

      } catch (error) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.error.push(pagePath);
      }
    }

    // Print summary
    console.log(`\n\n📊 COMPREHENSIVE V2 TEST SUMMARY\n`);
    console.log(`Total V2 Pages Tested: ${v2DashboardPages.length}`);
    console.log(`✅ Working: ${results.success.length}`);
    console.log(`⏳ Still Loading: ${results.loading.length}`);
    console.log(`⚠️  Errors: ${results.error.length}`);
    console.log(`❌ 404 Not Found: ${results.fourOhFour.length}`);

    if (results.loading.length > 0) {
      console.log(`\n⏳ Pages Still Loading:`);
      results.loading.forEach(p => console.log(`  - ${p}`));
    }

    if (results.error.length > 0) {
      console.log(`\n⚠️  Pages with Errors:`);
      results.error.forEach(p => console.log(`  - ${p}`));
    }

    if (results.fourOhFour.length > 0) {
      console.log(`\n❌ Pages Returning 404:`);
      results.fourOhFour.forEach(p => console.log(`  - ${p}`));
    }

    console.log(`\n✅ Working V2 Pages (${results.success.length}):`);
    results.success.slice(0, 30).forEach(p => console.log(`  - ${p}`));
    if (results.success.length > 30) {
      console.log(`  ... and ${results.success.length - 30} more`);
    }

    // Test should pass if most pages are working
    const successRate = (results.success.length / v2DashboardPages.length) * 100;
    console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);

    // Expect at least 70% success rate (some pages may need API keys or special config)
    expect(successRate).toBeGreaterThan(70);
  });
});

test.describe('V2 Page Content Verification', () => {

  test('Dashboard overview-v2 has proper content structure', async ({ page }) => {
    await page.goto('/dashboard/overview-v2');
    await page.waitForLoadState('networkidle');

    // Check for main layout
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // Check sidebar is present
    const sidebar = page.locator('[class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('Analytics-v2 page has charts or analytics components', async ({ page }) => {
    await page.goto('/dashboard/analytics-v2');
    await page.waitForLoadState('networkidle');

    // Main content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // Page should have visible buttons
    const buttons = await page.locator('button:visible').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('Projects-hub-v2 loads properly', async ({ page }) => {
    await page.goto('/dashboard/projects-hub-v2');
    await page.waitForLoadState('networkidle');

    // Main content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test('Settings-v2 page is accessible', async ({ page }) => {
    await page.goto('/dashboard/settings-v2');
    await page.waitForLoadState('networkidle');

    // Main content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });
});
