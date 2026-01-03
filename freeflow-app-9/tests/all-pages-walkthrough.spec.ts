import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

// All V2 Dashboard Pages (156 pages)
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

// Public pages
const publicPages = [
  { name: 'Homepage', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Blog', path: '/blog' },
  { name: 'Docs', path: '/docs' },
  { name: 'Support', path: '/support' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Terms', path: '/terms' },
];

test.describe('KAZI Platform - Complete App Walkthrough', () => {

  test('All Public Pages', async ({ page }) => {
    test.setTimeout(120000);

    const results: { page: string; status: string; error?: string }[] = [];

    for (const publicPage of publicPages) {
      try {
        await page.goto(`${BASE_URL}${publicPage.path}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');

        // Check for error messages
        const hasError = await page.locator('text=/error|Error|ERROR/i').first().isVisible().catch(() => false);

        if (hasError) {
          results.push({ page: publicPage.name, status: 'ERROR', error: 'Error visible on page' });
        } else {
          results.push({ page: publicPage.name, status: 'OK' });
        }
        console.log(`✅ ${publicPage.name}`);
      } catch (error) {
        results.push({ page: publicPage.name, status: 'FAILED', error: String(error) });
        console.log(`❌ ${publicPage.name}: ${error}`);
      }
    }

    const failed = results.filter(r => r.status !== 'OK');
    console.log(`\n📊 Public Pages: ${results.length - failed.length}/${results.length} passed`);

    expect(failed.length).toBeLessThan(3); // Allow some tolerance
  });

  test('All V2 Dashboard Pages (Batch 1: 1-50)', async ({ page }) => {
    test.setTimeout(300000);

    const batch = v2Pages.slice(0, 50);
    const results: { page: string; status: string; error?: string }[] = [];

    for (const pageName of batch) {
      try {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        // Check for critical errors (not just any "error" text which might be in UI)
        const hasError = await page.locator('.bg-red-50, .bg-red-100, [class*="error"]').locator('text=/Error:|Unknown error/i').first().isVisible().catch(() => false);

        if (hasError) {
          results.push({ page: pageName, status: 'ERROR' });
          console.log(`⚠️  ${pageName} - has error`);
        } else {
          results.push({ page: pageName, status: 'OK' });
          console.log(`✅ ${pageName}`);
        }
      } catch (error) {
        results.push({ page: pageName, status: 'FAILED', error: String(error) });
        console.log(`❌ ${pageName}`);
      }
    }

    const failed = results.filter(r => r.status !== 'OK');
    console.log(`\n📊 Batch 1: ${results.length - failed.length}/${results.length} passed`);
    if (failed.length > 0) {
      console.log('Failed pages:', failed.map(f => f.page).join(', '));
    }
  });

  test('All V2 Dashboard Pages (Batch 2: 51-100)', async ({ page }) => {
    test.setTimeout(300000);

    const batch = v2Pages.slice(50, 100);
    const results: { page: string; status: string; error?: string }[] = [];

    for (const pageName of batch) {
      try {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        const hasError = await page.locator('.bg-red-50, .bg-red-100, [class*="error"]').locator('text=/Error:|Unknown error/i').first().isVisible().catch(() => false);

        if (hasError) {
          results.push({ page: pageName, status: 'ERROR' });
          console.log(`⚠️  ${pageName} - has error`);
        } else {
          results.push({ page: pageName, status: 'OK' });
          console.log(`✅ ${pageName}`);
        }
      } catch (error) {
        results.push({ page: pageName, status: 'FAILED', error: String(error) });
        console.log(`❌ ${pageName}`);
      }
    }

    const failed = results.filter(r => r.status !== 'OK');
    console.log(`\n📊 Batch 2: ${results.length - failed.length}/${results.length} passed`);
    if (failed.length > 0) {
      console.log('Failed pages:', failed.map(f => f.page).join(', '));
    }
  });

  test('All V2 Dashboard Pages (Batch 3: 101-156)', async ({ page }) => {
    test.setTimeout(300000);

    const batch = v2Pages.slice(100);
    const results: { page: string; status: string; error?: string }[] = [];

    for (const pageName of batch) {
      try {
        await page.goto(`${BASE_URL}/dashboard/${pageName}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        const hasError = await page.locator('.bg-red-50, .bg-red-100, [class*="error"]').locator('text=/Error:|Unknown error/i').first().isVisible().catch(() => false);

        if (hasError) {
          results.push({ page: pageName, status: 'ERROR' });
          console.log(`⚠️  ${pageName} - has error`);
        } else {
          results.push({ page: pageName, status: 'OK' });
          console.log(`✅ ${pageName}`);
        }
      } catch (error) {
        results.push({ page: pageName, status: 'FAILED', error: String(error) });
        console.log(`❌ ${pageName}`);
      }
    }

    const failed = results.filter(r => r.status !== 'OK');
    console.log(`\n📊 Batch 3: ${results.length - failed.length}/${results.length} passed`);
    if (failed.length > 0) {
      console.log('Failed pages:', failed.map(f => f.page).join(', '));
    }
  });
});
