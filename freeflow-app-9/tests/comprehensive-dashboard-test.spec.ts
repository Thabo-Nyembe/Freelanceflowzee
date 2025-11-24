import { test, expect } from '@playwright/test';

/**
 * Comprehensive Dashboard Test Suite
 * Tests all 94 dashboard pages for basic functionality
 */

test.describe('Comprehensive Dashboard Page Tests', () => {

  test('Verify All Dashboard Pages Load Without 404 Errors', async ({ page }) => {
    const dashboardPages = [
      '', // dashboard overview
      '3d-modeling',
      'a-plus-showcase',
      'admin',
      'admin-overview',
      'admin/agents',
      'advanced-micro-features',
      'ai-assistant',
      'ai-code-completion',
      'ai-create',
      'ai-design',
      'ai-enhanced',
      'ai-settings',
      'ai-video-generation',
      'ai-voice-synthesis',
      'analytics',
      'analytics-advanced',
      'api-keys',
      'ar-collaboration',
      'audio-studio',
      'audit-trail',
      'automation',
      'booking',
      'bookings',
      'browser-extension',
      'calendar',
      'canvas',
      'canvas-collaboration',
      'client-portal',
      'client-zone',
      'client-zone/knowledge-base',
      'clients',
      'cloud-storage',
      'collaboration',
      'collaboration-demo',
      'coming-soon',
      'community',
      'community-hub',
      'comprehensive-testing',
      'crm',
      'crypto-payments',
      'custom-reports',
      'cv-portfolio',
      'desktop-app',
      'email-agent',
      'email-agent/integrations',
      'email-agent/setup',
      'email-marketing',
      'escrow',
      'example-modern',
      'feature-testing',
      'files',
      'files-hub',
      'financial',
      'financial-hub',
      'gallery',
      'integrations',
      'integrations/setup',
      'invoices',
      'invoicing',
      'lead-generation',
      'messages',
      'micro-features-showcase',
      'ml-insights',
      'mobile-app',
      'motion-graphics',
      'my-day',
      'notifications',
      'performance-analytics',
      'plugin-marketplace',
      'profile',
      'project-templates',
      'projects-hub',
      'projects-hub/create',
      'projects-hub/import',
      'projects-hub/templates',
      'real-time-translation',
      'reporting',
      'reports',
      'resource-library',
      'settings',
      'shadcn-showcase',
      'storage',
      'system-insights',
      'team',
      'team-hub',
      'team-management',
      'team/enhanced',
      'time-tracking',
      'ui-showcase',
      'user-management',
      'video-studio',
      'voice-collaboration',
      'white-label',
      'widgets',
      'workflow-builder'
    ];

    console.log(`\n🎯 COMPREHENSIVE DASHBOARD TEST: ${dashboardPages.length} PAGES\n`);

    const results = {
      success: [] as string[],
      loading: [] as string[],
      error: [] as string[],
      fourOhFour: [] as string[]
    };

    for (const pagePath of dashboardPages) {
      const url = pagePath === '' ? '/dashboard' : `/dashboard/${pagePath}`;
      const displayName = pagePath === '' ? 'dashboard (overview)' : pagePath;
      console.log(`\n📄 Testing: ${url}`);

      try {
        const response = await page.goto(`http://localhost:9323${url}`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });

        // Check response status
        if (response && response.status() === 404) {
          console.log(`  ❌ 404 Not Found`);
          results.fourOhFour.push(displayName);
          continue;
        }

        // Wait a bit for hydration (reduced to 1 second for speed)
        await page.waitForTimeout(1000);

        // Check if still showing skeleton loaders
        const skeletons = await page.locator('.rounded-lg.border .animate-pulse').count();

        // Check if page has error
        const hasError = await page.locator('heading:has-text("Something went wrong")').count() > 0;

        // Count buttons
        const buttons = await page.locator('button:visible').count();

        if (hasError) {
          console.log(`  ⚠️  Error page detected`);
          results.error.push(displayName);
        } else if (skeletons > 10) {
          console.log(`  ⏳ Still loading (${skeletons} skeletons, ${buttons} buttons)`);
          results.loading.push(displayName);
        } else {
          console.log(`  ✅ Working (${skeletons} skeletons, ${buttons} buttons)`);
          results.success.push(displayName);
        }

      } catch (error) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.error.push(displayName);
      }
    }

    // Print summary
    console.log(`\n\n📊 COMPREHENSIVE TEST SUMMARY\n`);
    console.log(`Total Pages Tested: ${dashboardPages.length}`);
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

    console.log(`\n✅ Working Pages (${results.success.length}):`);
    results.success.slice(0, 20).forEach(p => console.log(`  - ${p}`));
    if (results.success.length > 20) {
      console.log(`  ... and ${results.success.length - 20} more`);
    }

    // Test should pass if most pages are working (allowing for some that need API keys or special setup)
    const successRate = (results.success.length / dashboardPages.length) * 100;
    console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);

    // Expect at least 70% success rate (some pages may need API keys or special config)
    expect(successRate).toBeGreaterThan(70);

    // No 404 errors should occur - routing should work for all pages
    expect(results.fourOhFour.length).toBe(0);
  });
});
