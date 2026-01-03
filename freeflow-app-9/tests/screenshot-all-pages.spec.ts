import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

// All V2 Dashboard Pages
const v2Pages = [
  '3d-modeling-v2', 'access-logs-v2', 'activity-logs-v2', 'add-ons-v2', 'admin-v2',
  'ai-assistant-v2', 'ai-create-v2', 'ai-design-v2', 'alerts-v2', 'allocation-v2',
  'analytics-v2', 'announcements-v2', 'api-keys-v2', 'api-v2', 'app-store-v2',
  'assets-v2', 'audio-studio-v2', 'audit-logs-v2', 'audit-v2', 'automation-v2',
  'automations-v2', 'backups-v2', 'billing-v2', 'bookings-v2', 'broadcasts-v2',
  'budgets-v2', 'bugs-v2', 'builds-v2', 'calendar-v2', 'campaigns-v2',
  'canvas-v2', 'capacity-v2', 'certifications-v2', 'changelog-v2', 'chat-v2',
  'ci-cd-v2', 'clients-v2', 'cloud-storage-v2', 'collaboration-v2', 'community-v2',
  'compliance-v2', 'component-library-v2', 'connectors-v2', 'content-studio-v2', 'content-v2',
  'contracts-v2', 'courses-v2', 'crm-v2', 'customer-success-v2', 'customer-support-v2',
  'customers-v2', 'data-export-v2', 'dependencies-v2', 'deployments-v2', 'desktop-app-v2',
  'docs-v2', 'documentation-v2', 'documents-v2', 'email-marketing-v2', 'employees-v2',
  'escrow-v2', 'events-v2', 'expenses-v2', 'extensions-v2', 'faq-v2',
  'features-v2', 'feedback-v2', 'files-hub-v2', 'financial-v2', 'forms-v2',
  'gallery-v2', 'growth-hub-v2', 'health-score-v2', 'help-center-v2', 'help-docs-v2',
  'integrations-marketplace-v2', 'integrations-v2', 'inventory-v2', 'investor-metrics-v2', 'invoices-v2',
  'invoicing-v2', 'knowledge-articles-v2', 'knowledge-base-v2', 'lead-generation-v2', 'learning-v2',
  'logistics-v2', 'logs-v2', 'maintenance-v2', 'marketing-v2', 'marketplace-v2',
  'media-library-v2', 'messages-v2', 'messaging-v2', 'milestones-v2', 'mobile-app-v2',
  'monitoring-v2', 'motion-graphics-v2', 'my-day-v2', 'notifications-v2', 'onboarding-v2',
  'orders-v2', 'overview-v2', 'payroll-v2', 'performance-analytics-v2', 'performance-v2',
  'permissions-v2', 'plugins-v2', 'polls-v2', 'pricing-v2', 'products-v2',
  'profile-v2', 'projects-hub-v2', 'qa-v2', 'recruitment-v2', 'registrations-v2',
  'release-notes-v2', 'releases-v2', 'renewals-v2', 'reporting-v2', 'reports-v2',
  'resources-v2', 'roadmap-v2', 'roles-v2', 'sales-v2', 'security-audit-v2',
  'security-v2', 'seo-v2', 'settings-v2', 'shipping-v2', 'social-media-v2',
  'sprints-v2', 'stock-v2', 'support-tickets-v2', 'support-v2', 'surveys-v2',
  'system-insights-v2', 'team-hub-v2', 'team-management-v2', 'templates-v2', 'testing-v2',
  'theme-store-v2', 'third-party-integrations-v2', 'tickets-v2', 'time-tracking-v2', 'training-v2',
  'transactions-v2', 'tutorials-v2', 'user-management-v2', 'video-studio-v2', 'vulnerability-scan-v2',
  'warehouse-v2', 'webhooks-v2', 'webinars-v2', 'widget-library-v2', 'workflow-builder-v2',
  'workflows-v2'
];

test.describe('Screenshot All Pages', () => {
  test('Take screenshots of all V2 pages', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes

    const errors: string[] = [];

    for (let i = 0; i < v2Pages.length; i++) {
      const pageName = v2Pages[i];
      const num = String(i + 1).padStart(3, '0');

      try {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Check for error message
        const errorText = await page.locator('text=/Error:|Unknown error/i').first().textContent().catch(() => null);

        if (errorText) {
          errors.push(`${pageName}: ${errorText}`);
          console.log(`⚠️  ${num}. ${pageName} - ERROR`);
        } else {
          console.log(`✅ ${num}. ${pageName}`);
        }

        await page.screenshot({
          path: `test-results/pages/${num}-${pageName}.png`,
          fullPage: false // Just viewport for speed
        });
      } catch (error) {
        errors.push(`${pageName}: TIMEOUT/FAILED`);
        console.log(`❌ ${num}. ${pageName} - FAILED`);
      }
    }

    console.log('\n\n=== SUMMARY ===');
    console.log(`Total: ${v2Pages.length} pages`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nPages with errors:');
      errors.forEach(e => console.log(`  - ${e}`));
    }
  });
});
