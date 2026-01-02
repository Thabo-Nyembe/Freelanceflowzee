import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:9323';

// Test user
const testUser = {
  email: 'sarah@techstartup.io',
  password: 'Demo2025!',
  name: 'Sarah Mitchell'
};

// ALL 228 dashboard pages
const allPages = [
  { path: '/dashboard', name: 'Dashboard Home' },
  { path: '/dashboard/3d-modeling-v2', name: '3D Modeling' },
  { path: '/dashboard/a-plus-showcase', name: 'A Plus Showcase' },
  { path: '/dashboard/access-logs-v2', name: 'Access Logs' },
  { path: '/dashboard/activity-logs-v2', name: 'Activity Logs' },
  { path: '/dashboard/add-ons-v2', name: 'Add Ons' },
  { path: '/dashboard/admin-overview', name: 'Admin Overview' },
  { path: '/dashboard/admin-overview/analytics', name: 'Admin - Analytics' },
  { path: '/dashboard/admin-overview/automation', name: 'Admin - Automation' },
  { path: '/dashboard/admin-overview/crm', name: 'Admin - CRM' },
  { path: '/dashboard/admin-overview/invoicing', name: 'Admin - Invoicing' },
  { path: '/dashboard/admin-overview/marketing', name: 'Admin - Marketing' },
  { path: '/dashboard/admin-overview/operations', name: 'Admin - Operations' },
  { path: '/dashboard/admin-v2', name: 'Admin' },
  { path: '/dashboard/advanced-features-demo', name: 'Advanced Features Demo' },
  { path: '/dashboard/advanced-micro-features', name: 'Advanced Micro Features' },
  { path: '/dashboard/ai-assistant-v2', name: 'AI Assistant' },
  { path: '/dashboard/ai-business-advisor', name: 'AI Business Advisor' },
  { path: '/dashboard/ai-code-completion', name: 'AI Code Completion' },
  { path: '/dashboard/ai-content-studio', name: 'AI Content Studio' },
  { path: '/dashboard/ai-create-v2', name: 'AI Create' },
  { path: '/dashboard/ai-design-v2', name: 'AI Design' },
  { path: '/dashboard/ai-enhanced', name: 'AI Enhanced' },
  { path: '/dashboard/ai-image-generator', name: 'AI Image Generator' },
  { path: '/dashboard/ai-music-studio', name: 'AI Music Studio' },
  { path: '/dashboard/ai-settings', name: 'AI Settings' },
  { path: '/dashboard/ai-video-generation', name: 'AI Video Generation' },
  { path: '/dashboard/ai-video-studio', name: 'AI Video Studio' },
  { path: '/dashboard/ai-voice-synthesis', name: 'AI Voice Synthesis' },
  { path: '/dashboard/alerts-v2', name: 'Alerts' },
  { path: '/dashboard/allocation-v2', name: 'Allocation' },
  { path: '/dashboard/analytics-advanced', name: 'Analytics Advanced' },
  { path: '/dashboard/analytics-v2', name: 'Analytics' },
  { path: '/dashboard/announcements-v2', name: 'Announcements' },
  { path: '/dashboard/api-keys-v2', name: 'API Keys' },
  { path: '/dashboard/api-v2', name: 'API' },
  { path: '/dashboard/app-store-v2', name: 'App Store' },
  { path: '/dashboard/ar-collaboration', name: 'AR Collaboration' },
  { path: '/dashboard/assets-v2', name: 'Assets' },
  { path: '/dashboard/audio-studio-v2', name: 'Audio Studio' },
  { path: '/dashboard/audit-logs-v2', name: 'Audit Logs' },
  { path: '/dashboard/audit-trail', name: 'Audit Trail' },
  { path: '/dashboard/audit-v2', name: 'Audit' },
  { path: '/dashboard/automation-v2', name: 'Automation' },
  { path: '/dashboard/automations-v2', name: 'Automations' },
  { path: '/dashboard/backups-v2', name: 'Backups' },
  { path: '/dashboard/billing-v2', name: 'Billing' },
  { path: '/dashboard/booking', name: 'Booking' },
  { path: '/dashboard/bookings-v2', name: 'Bookings' },
  { path: '/dashboard/broadcasts-v2', name: 'Broadcasts' },
  { path: '/dashboard/browser-extension', name: 'Browser Extension' },
  { path: '/dashboard/budgets-v2', name: 'Budgets' },
  { path: '/dashboard/bugs-v2', name: 'Bugs' },
  { path: '/dashboard/builds-v2', name: 'Builds' },
  { path: '/dashboard/calendar-v2', name: 'Calendar' },
  { path: '/dashboard/campaigns-v2', name: 'Campaigns' },
  { path: '/dashboard/canvas-collaboration', name: 'Canvas Collaboration' },
  { path: '/dashboard/canvas-v2', name: 'Canvas' },
  { path: '/dashboard/capacity-v2', name: 'Capacity' },
  { path: '/dashboard/certifications-v2', name: 'Certifications' },
  { path: '/dashboard/changelog-v2', name: 'Changelog' },
  { path: '/dashboard/chat-v2', name: 'Chat' },
  { path: '/dashboard/ci-cd-v2', name: 'CI/CD' },
  { path: '/dashboard/client-portal', name: 'Client Portal' },
  { path: '/dashboard/client-zone', name: 'Client Zone' },
  { path: '/dashboard/client-zone/ai-collaborate', name: 'Client Zone - AI Collaborate' },
  { path: '/dashboard/client-zone/analytics', name: 'Client Zone - Analytics' },
  { path: '/dashboard/client-zone/calendar', name: 'Client Zone - Calendar' },
  { path: '/dashboard/client-zone/feedback', name: 'Client Zone - Feedback' },
  { path: '/dashboard/client-zone/files', name: 'Client Zone - Files' },
  { path: '/dashboard/client-zone/gallery', name: 'Client Zone - Gallery' },
  { path: '/dashboard/client-zone/invoices', name: 'Client Zone - Invoices' },
  { path: '/dashboard/client-zone/knowledge-base', name: 'Client Zone - Knowledge Base' },
  { path: '/dashboard/client-zone/messages', name: 'Client Zone - Messages' },
  { path: '/dashboard/client-zone/payments', name: 'Client Zone - Payments' },
  { path: '/dashboard/client-zone/projects', name: 'Client Zone - Projects' },
  { path: '/dashboard/client-zone/referrals', name: 'Client Zone - Referrals' },
  { path: '/dashboard/client-zone/settings', name: 'Client Zone - Settings' },
  { path: '/dashboard/client-zone/value-dashboard', name: 'Client Zone - Value Dashboard' },
  { path: '/dashboard/clients-v2', name: 'Clients' },
  { path: '/dashboard/cloud-storage-v2', name: 'Cloud Storage' },
  { path: '/dashboard/collaboration-demo', name: 'Collaboration Demo' },
  { path: '/dashboard/collaboration-v2', name: 'Collaboration' },
  { path: '/dashboard/coming-soon', name: 'Coming Soon' },
  { path: '/dashboard/community-hub', name: 'Community Hub' },
  { path: '/dashboard/community-v2', name: 'Community' },
  { path: '/dashboard/compliance-v2', name: 'Compliance' },
  { path: '/dashboard/component-library-v2', name: 'Component Library' },
  { path: '/dashboard/comprehensive-testing', name: 'Comprehensive Testing' },
  { path: '/dashboard/connectors-v2', name: 'Connectors' },
  { path: '/dashboard/content-studio-v2', name: 'Content Studio' },
  { path: '/dashboard/content-v2', name: 'Content' },
  { path: '/dashboard/contracts-v2', name: 'Contracts' },
  { path: '/dashboard/courses-v2', name: 'Courses' },
  { path: '/dashboard/crm-v2', name: 'CRM' },
  { path: '/dashboard/crypto-payments', name: 'Crypto Payments' },
  { path: '/dashboard/custom-reports', name: 'Custom Reports' },
  { path: '/dashboard/customer-success-v2', name: 'Customer Success' },
  { path: '/dashboard/customer-support-v2', name: 'Customer Support' },
  { path: '/dashboard/customers-v2', name: 'Customers' },
  { path: '/dashboard/cv-portfolio', name: 'CV Portfolio' },
  { path: '/dashboard/data-export-v2', name: 'Data Export' },
  { path: '/dashboard/dependencies-v2', name: 'Dependencies' },
  { path: '/dashboard/deployments-v2', name: 'Deployments' },
  { path: '/dashboard/desktop-app-v2', name: 'Desktop App' },
  { path: '/dashboard/docs-v2', name: 'Docs' },
  { path: '/dashboard/documentation-v2', name: 'Documentation' },
  { path: '/dashboard/documents-v2', name: 'Documents' },
  { path: '/dashboard/email-agent', name: 'Email Agent' },
  { path: '/dashboard/email-agent/integrations', name: 'Email Agent - Integrations' },
  { path: '/dashboard/email-agent/setup', name: 'Email Agent - Setup' },
  { path: '/dashboard/email-marketing-v2', name: 'Email Marketing' },
  { path: '/dashboard/employees-v2', name: 'Employees' },
  { path: '/dashboard/escrow-v2', name: 'Escrow' },
  { path: '/dashboard/events-v2', name: 'Events' },
  { path: '/dashboard/example-modern', name: 'Example Modern' },
  { path: '/dashboard/expenses-v2', name: 'Expenses' },
  { path: '/dashboard/extensions-v2', name: 'Extensions' },
  { path: '/dashboard/faq-v2', name: 'FAQ' },
  { path: '/dashboard/feature-testing', name: 'Feature Testing' },
  { path: '/dashboard/features-v2', name: 'Features' },
  { path: '/dashboard/feedback-v2', name: 'Feedback' },
  { path: '/dashboard/files', name: 'Files' },
  { path: '/dashboard/files-hub-v2', name: 'Files Hub' },
  { path: '/dashboard/financial-hub', name: 'Financial Hub' },
  { path: '/dashboard/financial-v2', name: 'Financial' },
  { path: '/dashboard/forms-v2', name: 'Forms' },
  { path: '/dashboard/gallery-v2', name: 'Gallery' },
  { path: '/dashboard/growth-hub-v2', name: 'Growth Hub' },
  { path: '/dashboard/health-score-v2', name: 'Health Score' },
  { path: '/dashboard/help-center-v2', name: 'Help Center' },
  { path: '/dashboard/help-docs-v2', name: 'Help Docs' },
  { path: '/dashboard/integrations-marketplace-v2', name: 'Integrations Marketplace' },
  { path: '/dashboard/integrations-v2', name: 'Integrations' },
  { path: '/dashboard/inventory-v2', name: 'Inventory' },
  { path: '/dashboard/investor-metrics-v2', name: 'Investor Metrics' },
  { path: '/dashboard/invoices-v2', name: 'Invoices' },
  { path: '/dashboard/invoicing-v2', name: 'Invoicing' },
  { path: '/dashboard/knowledge-articles-v2', name: 'Knowledge Articles' },
  { path: '/dashboard/knowledge-base-v2', name: 'Knowledge Base' },
  { path: '/dashboard/lead-generation-v2', name: 'Lead Generation' },
  { path: '/dashboard/learning-v2', name: 'Learning' },
  { path: '/dashboard/logistics-v2', name: 'Logistics' },
  { path: '/dashboard/logs-v2', name: 'Logs' },
  { path: '/dashboard/maintenance-v2', name: 'Maintenance' },
  { path: '/dashboard/marketing-v2', name: 'Marketing' },
  { path: '/dashboard/marketplace-v2', name: 'Marketplace' },
  { path: '/dashboard/media-library-v2', name: 'Media Library' },
  { path: '/dashboard/messages-v2', name: 'Messages' },
  { path: '/dashboard/messaging-v2', name: 'Messaging' },
  { path: '/dashboard/micro-features-showcase', name: 'Micro Features Showcase' },
  { path: '/dashboard/milestones-v2', name: 'Milestones' },
  { path: '/dashboard/ml-insights', name: 'ML Insights' },
  { path: '/dashboard/mobile-app-v2', name: 'Mobile App' },
  { path: '/dashboard/monitoring-v2', name: 'Monitoring' },
  { path: '/dashboard/motion-graphics-v2', name: 'Motion Graphics' },
  { path: '/dashboard/my-day-v2', name: 'My Day' },
  { path: '/dashboard/notifications-v2', name: 'Notifications' },
  { path: '/dashboard/onboarding-v2', name: 'Onboarding' },
  { path: '/dashboard/orders-v2', name: 'Orders' },
  { path: '/dashboard/overview-v2', name: 'Overview' },
  { path: '/dashboard/payroll-v2', name: 'Payroll' },
  { path: '/dashboard/performance-analytics-v2', name: 'Performance Analytics' },
  { path: '/dashboard/performance-v2', name: 'Performance' },
  { path: '/dashboard/permissions-v2', name: 'Permissions' },
  { path: '/dashboard/plugin-marketplace', name: 'Plugin Marketplace' },
  { path: '/dashboard/plugins-v2', name: 'Plugins' },
  { path: '/dashboard/polls-v2', name: 'Polls' },
  { path: '/dashboard/pricing-v2', name: 'Pricing' },
  { path: '/dashboard/products-v2', name: 'Products' },
  { path: '/dashboard/profile-v2', name: 'Profile' },
  { path: '/dashboard/project-templates', name: 'Project Templates' },
  { path: '/dashboard/projects-hub-v2', name: 'Projects Hub' },
  { path: '/dashboard/qa-v2', name: 'QA' },
  { path: '/dashboard/real-time-translation', name: 'Real Time Translation' },
  { path: '/dashboard/recruitment-v2', name: 'Recruitment' },
  { path: '/dashboard/registrations-v2', name: 'Registrations' },
  { path: '/dashboard/release-notes-v2', name: 'Release Notes' },
  { path: '/dashboard/releases-v2', name: 'Releases' },
  { path: '/dashboard/renewals-v2', name: 'Renewals' },
  { path: '/dashboard/reporting-v2', name: 'Reporting' },
  { path: '/dashboard/reports-v2', name: 'Reports' },
  { path: '/dashboard/resource-library', name: 'Resource Library' },
  { path: '/dashboard/resources-v2', name: 'Resources' },
  { path: '/dashboard/roadmap-v2', name: 'Roadmap' },
  { path: '/dashboard/roles-v2', name: 'Roles' },
  { path: '/dashboard/sales-v2', name: 'Sales' },
  { path: '/dashboard/security-audit-v2', name: 'Security Audit' },
  { path: '/dashboard/security-v2', name: 'Security' },
  { path: '/dashboard/seo-v2', name: 'SEO' },
  { path: '/dashboard/settings-v2', name: 'Settings' },
  { path: '/dashboard/shadcn-showcase', name: 'Shadcn Showcase' },
  { path: '/dashboard/shipping-v2', name: 'Shipping' },
  { path: '/dashboard/social-media-v2', name: 'Social Media' },
  { path: '/dashboard/sprints-v2', name: 'Sprints' },
  { path: '/dashboard/stock-v2', name: 'Stock' },
  { path: '/dashboard/storage', name: 'Storage' },
  { path: '/dashboard/support-tickets-v2', name: 'Support Tickets' },
  { path: '/dashboard/support-v2', name: 'Support' },
  { path: '/dashboard/surveys-v2', name: 'Surveys' },
  { path: '/dashboard/system-insights-v2', name: 'System Insights' },
  { path: '/dashboard/team', name: 'Team' },
  { path: '/dashboard/team-hub-v2', name: 'Team Hub' },
  { path: '/dashboard/team-management-v2', name: 'Team Management' },
  { path: '/dashboard/team/enhanced', name: 'Team - Enhanced' },
  { path: '/dashboard/templates-v2', name: 'Templates' },
  { path: '/dashboard/testing-v2', name: 'Testing' },
  { path: '/dashboard/theme-store-v2', name: 'Theme Store' },
  { path: '/dashboard/third-party-integrations-v2', name: 'Third Party Integrations' },
  { path: '/dashboard/tickets-v2', name: 'Tickets' },
  { path: '/dashboard/time-tracking-v2', name: 'Time Tracking' },
  { path: '/dashboard/training-v2', name: 'Training' },
  { path: '/dashboard/transactions-v2', name: 'Transactions' },
  { path: '/dashboard/tutorials-v2', name: 'Tutorials' },
  { path: '/dashboard/ui-showcase', name: 'UI Showcase' },
  { path: '/dashboard/upgrades-showcase', name: 'Upgrades Showcase' },
  { path: '/dashboard/user-management-v2', name: 'User Management' },
  { path: '/dashboard/video-studio-v2', name: 'Video Studio' },
  { path: '/dashboard/voice-collaboration', name: 'Voice Collaboration' },
  { path: '/dashboard/vulnerability-scan-v2', name: 'Vulnerability Scan' },
  { path: '/dashboard/warehouse-v2', name: 'Warehouse' },
  { path: '/dashboard/webhooks-v2', name: 'Webhooks' },
  { path: '/dashboard/webinars-v2', name: 'Webinars' },
  { path: '/dashboard/white-label', name: 'White Label' },
  { path: '/dashboard/widget-library-v2', name: 'Widget Library' },
  { path: '/dashboard/widgets', name: 'Widgets' },
  { path: '/dashboard/workflow-builder-v2', name: 'Workflow Builder' },
  { path: '/dashboard/workflows-v2', name: 'Workflows' },
];

interface PageResult {
  name: string;
  path: string;
  loaded: boolean;
  status: number;
  errors: string[];
  consoleErrors: string[];
  buttons: number;
  tabs: number;
}

async function login(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    await page.locator('input[type="email"]').first().fill(testUser.email);
    await page.locator('input[type="password"]').first().fill(testUser.password);
    await page.locator('button[type="submit"]').first().click();

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    console.log('✅ Login successful');
    return true;
  } catch {
    console.log('❌ Login failed');
    return false;
  }
}

async function testPage(page: Page, pageInfo: typeof allPages[0]): Promise<PageResult> {
  const result: PageResult = {
    name: pageInfo.name,
    path: pageInfo.path,
    loaded: false,
    status: 0,
    errors: [],
    consoleErrors: [],
    buttons: 0,
    tabs: 0
  };

  // Capture console errors
  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('next-auth') && !text.includes('favicon')) {
        result.consoleErrors.push(text.substring(0, 150));
      }
    }
  };

  page.on('console', consoleHandler);

  try {
    const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    result.status = response?.status() || 0;
    result.loaded = result.status === 200;

    if (result.loaded && !page.url().includes('/login')) {
      await page.waitForTimeout(1000);

      // Count elements
      result.buttons = await page.locator('button:visible').count();
      result.tabs = await page.locator('[role="tab"]:visible').count();

      // Click first 3 tabs
      const tabs = page.locator('[role="tab"]:visible');
      for (let i = 0; i < Math.min(await tabs.count(), 3); i++) {
        await tabs.nth(i).click({ timeout: 1000, force: true }).catch(() => {});
        await page.waitForTimeout(200);
      }

      // Click first 3 safe buttons
      const skipPatterns = ['delete', 'remove', 'logout', 'sign', 'cancel', 'close'];
      const buttons = await page.locator('button:visible').all();
      let clicked = 0;
      for (const btn of buttons) {
        if (clicked >= 3) break;
        const text = ((await btn.textContent()) || '').toLowerCase();
        if (!skipPatterns.some(p => text.includes(p))) {
          await btn.click({ timeout: 1000, force: true }).catch(() => {});
          await page.waitForTimeout(200);
          clicked++;
        }
      }
    } else if (page.url().includes('/login')) {
      result.errors.push('Redirected to login');
    }

  } catch (error: any) {
    result.errors.push(error.message.substring(0, 100));
  }

  page.off('console', consoleHandler);
  return result;
}

test.describe('Full Platform Test - 228 Pages', () => {
  test('Test all dashboard pages', async ({ page, context }) => {
    test.setTimeout(3600000); // 1 hour for all pages

    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('\n' + '='.repeat(70));
    console.log('🚀 FULL PLATFORM TEST - 228 PAGES');
    console.log('='.repeat(70) + '\n');

    // Login first
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);

    const cookies = await context.cookies();
    const results: PageResult[] = [];
    let currentPage = page;
    let pagesLoaded = 0;
    let totalErrors = 0;

    // Test each page
    for (let i = 0; i < allPages.length; i++) {
      const pageInfo = allPages[i];
      console.log(`[${i + 1}/${allPages.length}] Testing: ${pageInfo.name}`);

      // Recover if page closed
      if (currentPage.isClosed()) {
        currentPage = await context.newPage();
        await currentPage.setViewportSize({ width: 1920, height: 1080 });
      }

      const result = await testPage(currentPage, pageInfo);
      results.push(result);

      if (result.loaded) pagesLoaded++;
      totalErrors += result.errors.length + result.consoleErrors.length;

      const status = result.loaded ? '✅' : '❌';
      const errorCount = result.errors.length + result.consoleErrors.length;
      console.log(`   ${status} ${result.buttons} buttons, ${result.tabs} tabs, ${errorCount} errors`);

      // Brief wait between pages
      await currentPage.waitForTimeout(100).catch(() => {});
    }

    // Generate summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Pages loaded: ${pagesLoaded}/${allPages.length}`);
    console.log(`❌ Total errors: ${totalErrors}`);

    // Save results
    const resultsPath = path.join(process.cwd(), 'test-results', 'full-platform-results.json');
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify({
      summary: { pagesLoaded, totalPages: allPages.length, totalErrors },
      pages: results
    }, null, 2));
    console.log(`📄 Results saved to: ${resultsPath}`);

    // Generate error report
    const pagesWithErrors = results.filter(r => r.errors.length > 0 || r.consoleErrors.length > 0);
    if (pagesWithErrors.length > 0) {
      console.log('\n📋 Pages with errors:');
      for (const p of pagesWithErrors.slice(0, 20)) {
        console.log(`   - ${p.name}: ${[...p.errors, ...p.consoleErrors].join(', ').substring(0, 80)}`);
      }
    }

    expect(pagesLoaded).toBeGreaterThan(allPages.length * 0.7);
  });
});
