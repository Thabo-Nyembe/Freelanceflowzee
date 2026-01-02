import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:9323';

// Showcase users for investor demo
const showcaseUsers = [
  {
    email: 'sarah@techstartup.io',
    password: 'Demo2025!',
    name: 'Sarah Mitchell',
    role: 'Startup Founder',
    tier: 'new-user'
  },
  {
    email: 'marcus@designstudio.co',
    password: 'Demo2025!',
    name: 'Marcus Johnson',
    role: 'Design Agency Owner',
    tier: 'power-user'
  },
  {
    email: 'alex@freeflow.io',
    password: 'Demo2025!',
    name: 'Alexandra Chen',
    role: 'Platform Admin',
    tier: 'admin'
  }
];

// All V2 dashboard pages to test (156 total pages)
const allPages = [
  // Core Dashboard
  { path: '/dashboard/overview-v2', name: 'Overview', description: 'Central dashboard hub' },
  { path: '/dashboard/my-day-v2', name: 'My Day', description: 'Daily task planning' },
  { path: '/dashboard/projects-hub-v2', name: 'Projects Hub', description: 'Project management' },
  { path: '/dashboard/profile-v2', name: 'Profile', description: 'User profile' },
  { path: '/dashboard/settings-v2', name: 'Settings', description: 'User settings' },
  { path: '/dashboard/notifications-v2', name: 'Notifications', description: 'Alerts' },

  // AI & Creative
  { path: '/dashboard/ai-create-v2', name: 'AI Create', description: 'AI content generation' },
  { path: '/dashboard/ai-assistant-v2', name: 'AI Assistant', description: 'AI helper' },
  { path: '/dashboard/ai-design-v2', name: 'AI Design', description: 'AI design tools' },
  { path: '/dashboard/video-studio-v2', name: 'Video Studio', description: 'Video editing' },
  { path: '/dashboard/audio-studio-v2', name: 'Audio Studio', description: 'Audio production' },
  { path: '/dashboard/canvas-v2', name: 'Canvas', description: 'Design canvas' },
  { path: '/dashboard/content-studio-v2', name: 'Content Studio', description: 'Content creation' },
  { path: '/dashboard/motion-graphics-v2', name: 'Motion Graphics', description: 'Animation' },
  { path: '/dashboard/3d-modeling-v2', name: '3D Modeling', description: '3D design' },
  { path: '/dashboard/media-library-v2', name: 'Media Library', description: 'Media assets' },
  { path: '/dashboard/gallery-v2', name: 'Gallery', description: 'Image gallery' },

  // Communication
  { path: '/dashboard/messages-v2', name: 'Messages', description: 'Communication' },
  { path: '/dashboard/chat-v2', name: 'Chat', description: 'Real-time chat' },
  { path: '/dashboard/messaging-v2', name: 'Messaging', description: 'Message center' },
  { path: '/dashboard/community-v2', name: 'Community', description: 'Networking' },
  { path: '/dashboard/broadcasts-v2', name: 'Broadcasts', description: 'Announcements' },
  { path: '/dashboard/announcements-v2', name: 'Announcements', description: 'News' },

  // Calendar & Events
  { path: '/dashboard/calendar-v2', name: 'Calendar', description: 'Scheduling' },
  { path: '/dashboard/events-v2', name: 'Events', description: 'Event management' },
  { path: '/dashboard/bookings-v2', name: 'Bookings', description: 'Appointments' },
  { path: '/dashboard/webinars-v2', name: 'Webinars', description: 'Online events' },

  // Finance
  { path: '/dashboard/financial-v2', name: 'Financial', description: 'Finance overview' },
  { path: '/dashboard/invoices-v2', name: 'Invoices', description: 'Billing' },
  { path: '/dashboard/invoicing-v2', name: 'Invoicing', description: 'Invoice management' },
  { path: '/dashboard/billing-v2', name: 'Billing', description: 'Payment processing' },
  { path: '/dashboard/expenses-v2', name: 'Expenses', description: 'Expense tracking' },
  { path: '/dashboard/budgets-v2', name: 'Budgets', description: 'Budget management' },
  { path: '/dashboard/payroll-v2', name: 'Payroll', description: 'Salary management' },
  { path: '/dashboard/transactions-v2', name: 'Transactions', description: 'Financial records' },
  { path: '/dashboard/escrow-v2', name: 'Escrow', description: 'Secure payments' },
  { path: '/dashboard/pricing-v2', name: 'Pricing', description: 'Pricing management' },

  // CRM & Clients
  { path: '/dashboard/clients-v2', name: 'Clients', description: 'Client management' },
  { path: '/dashboard/customers-v2', name: 'Customers', description: 'Customer database' },
  { path: '/dashboard/crm-v2', name: 'CRM', description: 'Customer relationships' },
  { path: '/dashboard/lead-generation-v2', name: 'Lead Generation', description: 'Leads' },
  { path: '/dashboard/sales-v2', name: 'Sales', description: 'Sales pipeline' },
  { path: '/dashboard/customer-success-v2', name: 'Customer Success', description: 'Success tracking' },
  { path: '/dashboard/customer-support-v2', name: 'Customer Support', description: 'Support center' },
  { path: '/dashboard/contracts-v2', name: 'Contracts', description: 'Contract management' },
  { path: '/dashboard/renewals-v2', name: 'Renewals', description: 'Subscription renewals' },

  // Analytics & Reports
  { path: '/dashboard/analytics-v2', name: 'Analytics', description: 'Business intelligence' },
  { path: '/dashboard/reports-v2', name: 'Reports', description: 'Reporting' },
  { path: '/dashboard/reporting-v2', name: 'Reporting', description: 'Report builder' },
  { path: '/dashboard/investor-metrics-v2', name: 'Investor Metrics', description: 'Investor data' },
  { path: '/dashboard/performance-v2', name: 'Performance', description: 'Performance metrics' },
  { path: '/dashboard/performance-analytics-v2', name: 'Performance Analytics', description: 'Deep analysis' },
  { path: '/dashboard/health-score-v2', name: 'Health Score', description: 'System health' },
  { path: '/dashboard/system-insights-v2', name: 'System Insights', description: 'System analytics' },

  // Files & Storage
  { path: '/dashboard/files-hub-v2', name: 'Files Hub', description: 'File management' },
  { path: '/dashboard/cloud-storage-v2', name: 'Cloud Storage', description: 'Cloud files' },
  { path: '/dashboard/documents-v2', name: 'Documents', description: 'Document management' },
  { path: '/dashboard/assets-v2', name: 'Assets', description: 'Digital assets' },
  { path: '/dashboard/backups-v2', name: 'Backups', description: 'Data backups' },
  { path: '/dashboard/data-export-v2', name: 'Data Export', description: 'Export data' },

  // Team & HR
  { path: '/dashboard/team-hub-v2', name: 'Team Hub', description: 'Team center' },
  { path: '/dashboard/team-management-v2', name: 'Team Management', description: 'Team admin' },
  { path: '/dashboard/employees-v2', name: 'Employees', description: 'Employee directory' },
  { path: '/dashboard/recruitment-v2', name: 'Recruitment', description: 'Hiring' },
  { path: '/dashboard/training-v2', name: 'Training', description: 'Employee training' },
  { path: '/dashboard/onboarding-v2', name: 'Onboarding', description: 'New employee setup' },
  { path: '/dashboard/capacity-v2', name: 'Capacity', description: 'Resource capacity' },
  { path: '/dashboard/allocation-v2', name: 'Allocation', description: 'Resource allocation' },
  { path: '/dashboard/time-tracking-v2', name: 'Time Tracking', description: 'Time management' },

  // Support & Help
  { path: '/dashboard/support-v2', name: 'Support', description: 'Support center' },
  { path: '/dashboard/support-tickets-v2', name: 'Support Tickets', description: 'Ticket management' },
  { path: '/dashboard/tickets-v2', name: 'Tickets', description: 'Issue tracking' },
  { path: '/dashboard/help-center-v2', name: 'Help Center', description: 'Help resources' },
  { path: '/dashboard/help-docs-v2', name: 'Help Docs', description: 'Documentation' },
  { path: '/dashboard/faq-v2', name: 'FAQ', description: 'Frequently asked' },
  { path: '/dashboard/knowledge-base-v2', name: 'Knowledge Base', description: 'Knowledge center' },
  { path: '/dashboard/knowledge-articles-v2', name: 'Knowledge Articles', description: 'Articles' },
  { path: '/dashboard/tutorials-v2', name: 'Tutorials', description: 'How-to guides' },

  // Content & Marketing
  { path: '/dashboard/content-v2', name: 'Content', description: 'Content management' },
  { path: '/dashboard/marketing-v2', name: 'Marketing', description: 'Marketing hub' },
  { path: '/dashboard/campaigns-v2', name: 'Campaigns', description: 'Campaign management' },
  { path: '/dashboard/email-marketing-v2', name: 'Email Marketing', description: 'Email campaigns' },
  { path: '/dashboard/social-media-v2', name: 'Social Media', description: 'Social management' },
  { path: '/dashboard/seo-v2', name: 'SEO', description: 'Search optimization' },
  { path: '/dashboard/growth-hub-v2', name: 'Growth Hub', description: 'Growth center' },
  { path: '/dashboard/polls-v2', name: 'Polls', description: 'User polls' },
  { path: '/dashboard/surveys-v2', name: 'Surveys', description: 'Survey builder' },
  { path: '/dashboard/feedback-v2', name: 'Feedback', description: 'User feedback' },

  // Development
  { path: '/dashboard/api-v2', name: 'API', description: 'API management' },
  { path: '/dashboard/api-keys-v2', name: 'API Keys', description: 'API credentials' },
  { path: '/dashboard/webhooks-v2', name: 'Webhooks', description: 'Webhook config' },
  { path: '/dashboard/deployments-v2', name: 'Deployments', description: 'Deploy management' },
  { path: '/dashboard/ci-cd-v2', name: 'CI/CD', description: 'Continuous integration' },
  { path: '/dashboard/builds-v2', name: 'Builds', description: 'Build management' },
  { path: '/dashboard/testing-v2', name: 'Testing', description: 'Test suites' },
  { path: '/dashboard/qa-v2', name: 'QA', description: 'Quality assurance' },
  { path: '/dashboard/bugs-v2', name: 'Bugs', description: 'Bug tracking' },
  { path: '/dashboard/releases-v2', name: 'Releases', description: 'Release management' },
  { path: '/dashboard/release-notes-v2', name: 'Release Notes', description: 'Changelog' },
  { path: '/dashboard/changelog-v2', name: 'Changelog', description: 'Version history' },
  { path: '/dashboard/roadmap-v2', name: 'Roadmap', description: 'Product roadmap' },
  { path: '/dashboard/milestones-v2', name: 'Milestones', description: 'Project milestones' },
  { path: '/dashboard/sprints-v2', name: 'Sprints', description: 'Sprint planning' },
  { path: '/dashboard/dependencies-v2', name: 'Dependencies', description: 'Package deps' },
  { path: '/dashboard/component-library-v2', name: 'Component Library', description: 'UI components' },

  // Security & Admin
  { path: '/dashboard/admin-v2', name: 'Admin', description: 'Admin panel' },
  { path: '/dashboard/security-v2', name: 'Security', description: 'Security settings' },
  { path: '/dashboard/security-audit-v2', name: 'Security Audit', description: 'Security review' },
  { path: '/dashboard/vulnerability-scan-v2', name: 'Vulnerability Scan', description: 'Vuln scanning' },
  { path: '/dashboard/audit-v2', name: 'Audit', description: 'Audit log' },
  { path: '/dashboard/audit-logs-v2', name: 'Audit Logs', description: 'Log viewer' },
  { path: '/dashboard/access-logs-v2', name: 'Access Logs', description: 'Access history' },
  { path: '/dashboard/activity-logs-v2', name: 'Activity Logs', description: 'Activity history' },
  { path: '/dashboard/logs-v2', name: 'Logs', description: 'System logs' },
  { path: '/dashboard/monitoring-v2', name: 'Monitoring', description: 'System monitoring' },
  { path: '/dashboard/alerts-v2', name: 'Alerts', description: 'System alerts' },
  { path: '/dashboard/permissions-v2', name: 'Permissions', description: 'Access control' },
  { path: '/dashboard/roles-v2', name: 'Roles', description: 'Role management' },
  { path: '/dashboard/user-management-v2', name: 'User Management', description: 'User admin' },
  { path: '/dashboard/compliance-v2', name: 'Compliance', description: 'Regulatory' },
  { path: '/dashboard/maintenance-v2', name: 'Maintenance', description: 'System maintenance' },

  // Integrations & Apps
  { path: '/dashboard/integrations-v2', name: 'Integrations', description: 'Connect apps' },
  { path: '/dashboard/integrations-marketplace-v2', name: 'Integrations Marketplace', description: 'Integration store' },
  { path: '/dashboard/third-party-integrations-v2', name: 'Third Party Integrations', description: 'External apps' },
  { path: '/dashboard/connectors-v2', name: 'Connectors', description: 'Data connectors' },
  { path: '/dashboard/plugins-v2', name: 'Plugins', description: 'Plugin management' },
  { path: '/dashboard/extensions-v2', name: 'Extensions', description: 'Browser extensions' },
  { path: '/dashboard/add-ons-v2', name: 'Add-ons', description: 'Additional features' },
  { path: '/dashboard/app-store-v2', name: 'App Store', description: 'App marketplace' },
  { path: '/dashboard/marketplace-v2', name: 'Marketplace', description: 'General marketplace' },
  { path: '/dashboard/theme-store-v2', name: 'Theme Store', description: 'Theme marketplace' },
  { path: '/dashboard/widget-library-v2', name: 'Widget Library', description: 'UI widgets' },

  // Automation & Workflows
  { path: '/dashboard/automation-v2', name: 'Automation', description: 'Process automation' },
  { path: '/dashboard/automations-v2', name: 'Automations', description: 'Auto workflows' },
  { path: '/dashboard/workflows-v2', name: 'Workflows', description: 'Workflow builder' },
  { path: '/dashboard/workflow-builder-v2', name: 'Workflow Builder', description: 'Visual builder' },

  // Apps
  { path: '/dashboard/desktop-app-v2', name: 'Desktop App', description: 'Desktop version' },
  { path: '/dashboard/mobile-app-v2', name: 'Mobile App', description: 'Mobile version' },

  // E-commerce & Inventory
  { path: '/dashboard/products-v2', name: 'Products', description: 'Product catalog' },
  { path: '/dashboard/orders-v2', name: 'Orders', description: 'Order management' },
  { path: '/dashboard/inventory-v2', name: 'Inventory', description: 'Stock management' },
  { path: '/dashboard/stock-v2', name: 'Stock', description: 'Stock levels' },
  { path: '/dashboard/warehouse-v2', name: 'Warehouse', description: 'Warehouse mgmt' },
  { path: '/dashboard/shipping-v2', name: 'Shipping', description: 'Shipping tracking' },
  { path: '/dashboard/logistics-v2', name: 'Logistics', description: 'Logistics mgmt' },

  // Documentation & Learning
  { path: '/dashboard/docs-v2', name: 'Docs', description: 'Documentation' },
  { path: '/dashboard/documentation-v2', name: 'Documentation', description: 'Full docs' },
  { path: '/dashboard/learning-v2', name: 'Learning', description: 'Learning center' },
  { path: '/dashboard/courses-v2', name: 'Courses', description: 'Online courses' },
  { path: '/dashboard/certifications-v2', name: 'Certifications', description: 'Certificates' },

  // Other
  { path: '/dashboard/templates-v2', name: 'Templates', description: 'Template library' },
  { path: '/dashboard/forms-v2', name: 'Forms', description: 'Form builder' },
  { path: '/dashboard/registrations-v2', name: 'Registrations', description: 'User registrations' },
  { path: '/dashboard/features-v2', name: 'Features', description: 'Feature flags' },
  { path: '/dashboard/resources-v2', name: 'Resources', description: 'Resource center' },
];

interface PageTestResult {
  pageName: string;
  pageUrl: string;
  loaded: boolean;
  authenticated: boolean;
  errors: string[];
  consoleErrors: string[];
  buttonsFound: number;
  buttonsClicked: number;
  inputsFound: number;
  tabsFound: number;
  tabsClicked: number;
  modalsOpened: number;
  dropdownsFound: number;
  screenshot: string;
}

interface UserTestResult {
  user: string;
  email: string;
  role: string;
  loginSuccess: boolean;
  pagesLoaded: number;
  totalErrors: number;
  pages: PageTestResult[];
}

async function setupScreenshotDir(userTier: string) {
  const dir = path.join(process.cwd(), 'test-results', 'interactive-demo', userTier);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function loginUser(page: Page, user: typeof showcaseUsers[0]): Promise<boolean> {
  console.log(`\n🔐 Logging in as ${user.name} (${user.email})...`);

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], #email').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password').first();

    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);

    // Click submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for redirect to dashboard
    try {
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      console.log(`✅ Login successful for ${user.name}`);
      await page.waitForTimeout(2000); // Let dashboard load
      return true;
    } catch {
      // Check if we're on dashboard anyway
      if (page.url().includes('/dashboard')) {
        console.log(`✅ Login successful for ${user.name} (already on dashboard)`);
        return true;
      }
      console.log(`⚠️ Login redirect timeout for ${user.name}`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ Login failed for ${user.name}: ${error.message}`);
    return false;
  }
}

async function testPageInteractions(
  page: Page,
  pageInfo: typeof allPages[0],
  screenshotDir: string,
  isAuthenticated: boolean
): Promise<PageTestResult> {
  const result: PageTestResult = {
    pageName: pageInfo.name,
    pageUrl: pageInfo.path,
    loaded: false,
    authenticated: isAuthenticated,
    errors: [],
    consoleErrors: [],
    buttonsFound: 0,
    buttonsClicked: 0,
    inputsFound: 0,
    tabsFound: 0,
    tabsClicked: 0,
    modalsOpened: 0,
    dropdownsFound: 0,
    screenshot: ''
  };

  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('next-auth') && !text.includes('favicon')) {
        result.consoleErrors.push(text.substring(0, 200));
      }
    }
  };

  const errorHandler = (error: any) => {
    result.errors.push(error.message.substring(0, 200));
  };

  page.on('console', consoleHandler);
  page.on('pageerror', errorHandler);

  try {
    console.log(`\n📄 Testing: ${pageInfo.name} - ${pageInfo.description}`);

    // Navigate to page
    const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    if (!response || response.status() === 404) {
      result.errors.push(`Page returned ${response?.status() || 'no response'}`);
      page.off('console', consoleHandler);
      page.off('pageerror', errorHandler);
      return result;
    }

    // Check if redirected to login (not authenticated)
    if (page.url().includes('/login')) {
      result.errors.push('Redirected to login - not authenticated');
      page.off('console', consoleHandler);
      page.off('pageerror', errorHandler);
      return result;
    }

    result.loaded = true;
    await page.waitForTimeout(2000);

    // Take initial screenshot
    const initialScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-01-initial.png`);
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    result.screenshot = initialScreenshot;

    // ========== COUNT AND INTERACT WITH ELEMENTS ==========

    // Count buttons
    const allButtons = await page.locator('button:visible').all();
    result.buttonsFound = allButtons.length;

    // Count tabs
    result.tabsFound = await page.locator('[role="tab"]:visible').count();

    // Count inputs
    result.inputsFound = await page.locator('input:visible:not([type="hidden"]), textarea:visible').count();

    // Count dropdowns
    result.dropdownsFound = await page.locator('[role="combobox"]:visible, select:visible').count();

    console.log(`   📊 Found: ${result.buttonsFound} buttons, ${result.tabsFound} tabs, ${result.inputsFound} inputs`);

    // ========== TEST TABS ==========
    const tabs = page.locator('[role="tab"]:visible');
    const tabCount = await tabs.count();

    for (let i = 0; i < Math.min(tabCount, 6); i++) {
      try {
        // Check if page is still valid
        if (page.isClosed()) {
          console.log(`   ⚠️ Page closed, stopping tab tests`);
          break;
        }

        const tab = tabs.nth(i);
        const tabText = await tab.textContent().catch(() => `tab-${i}`);

        if (!page.url().includes(pageInfo.path)) {
          await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
          break;
        }

        console.log(`   📑 Tab: ${(tabText || '').substring(0, 20)}...`);
        await tab.click({ timeout: 2000, force: true }).catch(() => {});
        result.tabsClicked++;
        await page.waitForTimeout(400);

        // Screenshot each tab
        if (!page.isClosed()) {
          const tabScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-tab-${i + 1}.png`);
          await page.screenshot({ path: tabScreenshot }).catch(() => {});
        }

      } catch (tabError: any) {
        console.log(`   ⚠️ Tab error: ${tabError.message?.substring(0, 50) || 'unknown'}`);
      }
    }

    // ========== TEST BUTTONS ==========
    const skipPatterns = [
      'delete', 'remove', 'logout', 'sign out', 'sign in', 'login',
      'cancel', 'close', 'submit', 'dismiss', 'exit', 'back',
      'navigate', 'redirect', 'menu', 'dropdown', 'toggle',
      // Dashboard navigation buttons that would leave the page
      'ai creative', 'collaboration', 'storage', 'business', 'admin',
      'creative studio', 'settings', 'customize', 'notification',
      'calendar', 'messages', 'clients', 'projects', 'files',
      'analytics', 'video', 'community', 'profile', 'invoic',
      'financial', 'my day', 'overview', 'marketplace', 'help',
      'go to', 'view all', 'see all', 'open', 'launch', 'start'
    ];

    // Re-query buttons to get fresh references
    const buttonsToTest = await page.locator('button:visible').all();
    const maxButtons = Math.min(buttonsToTest.length, 10);

    for (let i = 0; i < maxButtons; i++) {
      try {
        // Check if page is still valid
        if (page.isClosed()) {
          console.log(`   ⚠️ Page closed, stopping button tests`);
          break;
        }

        // Re-query buttons fresh each iteration to avoid stale references
        const freshButtons = await page.locator('button:visible').all();
        if (i >= freshButtons.length) break;

        const button = freshButtons[i];
        const buttonText = (await button.textContent().catch(() => '')) || '';
        const ariaLabel = (await button.getAttribute('aria-label').catch(() => '')) || '';
        const buttonId = buttonText.trim() || ariaLabel || `button-${i}`;
        const lowerText = buttonId.toLowerCase();

        if (skipPatterns.some(p => lowerText.includes(p))) {
          console.log(`   ⏭️ Skipping: ${buttonId.substring(0, 20)}`);
          continue;
        }

        const isDisabled = await button.isDisabled().catch(() => true);
        if (isDisabled) continue;

        // Check we're still on the right page
        if (!page.url().includes(pageInfo.path)) {
          console.log(`   ⚠️ Navigation detected, returning...`);
          await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
          break;
        }

        console.log(`   🖱️ Button: ${buttonId.substring(0, 25)}...`);

        // Click with navigation handling
        await Promise.race([
          button.click({ timeout: 2000, force: true }),
          page.waitForTimeout(2000)
        ]).catch(() => {});

        result.buttonsClicked++;
        await page.waitForTimeout(300);

        // Check if page navigated away
        if (page.isClosed() || !page.url().includes(pageInfo.path)) {
          console.log(`   ⚠️ Page changed after click, navigating back...`);
          if (!page.isClosed()) {
            await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
          }
          break;
        }

        // Check for modal
        const modal = page.locator('[role="dialog"]:visible').first();
        if (await modal.isVisible().catch(() => false)) {
          result.modalsOpened++;
          console.log(`   📋 Modal opened!`);

          const modalScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-modal-${result.modalsOpened}.png`);
          await page.screenshot({ path: modalScreenshot }).catch(() => {});

          await page.keyboard.press('Escape');
          await page.waitForTimeout(200);
        }

      } catch (buttonError: any) {
        console.log(`   ⚠️ Button error: ${buttonError.message?.substring(0, 50) || 'unknown'}`);
        // Try to recover by navigating back
        if (!page.isClosed()) {
          await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
        }
      }
    }

    // ========== TEST INPUTS ==========
    if (!page.isClosed()) {
      const inputs = page.locator('input:visible:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]), textarea:visible');
      const inputCount = await inputs.count().catch(() => 0);

      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        try {
          if (page.isClosed()) break;

          const input = inputs.nth(i);
          const placeholder = await input.getAttribute('placeholder').catch(() => '');
          console.log(`   ✏️ Input: ${(placeholder || 'field').substring(0, 20)}...`);

          await input.click().catch(() => {});
          await input.fill('Test input').catch(() => {});
          await page.waitForTimeout(200);
        } catch {
          // Continue
        }
      }
    }

    // ========== FINAL SCREENSHOT ==========
    if (!page.isClosed()) {
      if (!page.url().includes(pageInfo.path)) {
        await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(1000);
      }

      const finalScreenshot = path.join(screenshotDir, `${pageInfo.name.replace(/\s+/g, '-')}-99-final.png`);
      await page.screenshot({ path: finalScreenshot, fullPage: true }).catch(() => {});
    }

    // Summary
    console.log(`   ✅ Done: ${result.buttonsClicked} buttons, ${result.tabsClicked} tabs, ${result.modalsOpened} modals`);

    if (result.errors.length > 0 || result.consoleErrors.length > 0) {
      console.log(`   ⚠️ Errors: ${result.errors.length + result.consoleErrors.length}`);
    }

  } catch (error: any) {
    result.errors.push(`Page test failed: ${error.message}`);
    console.log(`   ❌ Failed: ${error.message}`);
  }

  page.off('console', consoleHandler);
  page.off('pageerror', errorHandler);

  return result;
}

function generateReport(allResults: UserTestResult[]): string {
  let report = '# KAZI Platform - Authenticated Interactive Test Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;

  // Overall Summary
  report += '## Overall Summary\n\n';
  report += `| User | Role | Login | Pages Loaded | Errors |\n`;
  report += `|------|------|-------|--------------|--------|\n`;

  for (const userResult of allResults) {
    const loginStatus = userResult.loginSuccess ? '✅' : '❌';
    report += `| ${userResult.user} | ${userResult.role} | ${loginStatus} | ${userResult.pagesLoaded}/${userResult.pages.length} | ${userResult.totalErrors} |\n`;
  }
  report += '\n';

  // Per-user details
  for (const userResult of allResults) {
    report += `## ${userResult.user} (${userResult.role})\n\n`;
    report += `**Email:** ${userResult.email}\n`;
    report += `**Login:** ${userResult.loginSuccess ? 'Success' : 'Failed'}\n\n`;

    if (!userResult.loginSuccess) {
      report += `> Login failed - pages not tested\n\n`;
      continue;
    }

    report += `| Page | Status | Buttons | Tabs | Modals | Errors |\n`;
    report += `|------|--------|---------|------|--------|--------|\n`;

    for (const page of userResult.pages) {
      const status = page.loaded && page.errors.length === 0 && page.consoleErrors.length === 0 ? '✅' :
                     page.loaded ? '⚠️' : '❌';
      const errors = page.errors.length + page.consoleErrors.length;
      report += `| ${page.pageName} | ${status} | ${page.buttonsClicked}/${page.buttonsFound} | ${page.tabsClicked}/${page.tabsFound} | ${page.modalsOpened} | ${errors} |\n`;
    }
    report += '\n';

    // List errors
    const pagesWithErrors = userResult.pages.filter(p => p.errors.length > 0 || p.consoleErrors.length > 0);
    if (pagesWithErrors.length > 0) {
      report += `### Errors Found\n\n`;
      for (const page of pagesWithErrors) {
        report += `**${page.pageName}:**\n`;
        [...page.errors, ...page.consoleErrors].forEach(e => {
          report += `- \`${e.substring(0, 100)}\`\n`;
        });
        report += '\n';
      }
    }
  }

  return report;
}

test.describe('Authenticated Interactive Demo', () => {

  for (const user of showcaseUsers) {
    test(`${user.name} (${user.role}) - Full Platform Test`, async ({ page, context }) => {
      test.setTimeout(1800000); // 30 minutes per user (156 pages)

      await page.setViewportSize({ width: 1920, height: 1080 });

      const screenshotDir = await setupScreenshotDir(user.tier);
      const results: PageTestResult[] = [];

      console.log('\n' + '='.repeat(70));
      console.log(`🚀 TESTING AS: ${user.name} (${user.role})`);
      console.log('='.repeat(70));

      // Login
      const loginSuccess = await loginUser(page, user);

      if (!loginSuccess) {
        console.log(`❌ Skipping tests for ${user.name} - login failed`);
        expect(loginSuccess).toBe(true);
        return;
      }

      // Get session cookies for reuse
      const cookies = await context.cookies();

      // Test each page
      let currentPage = page;
      for (const pageInfo of allPages) {
        try {
          // Check if we need to create a new page
          if (currentPage.isClosed()) {
            console.log(`   🔄 Recreating page (previous was closed)...`);
            currentPage = await context.newPage();
            await currentPage.setViewportSize({ width: 1920, height: 1080 });
            await context.addCookies(cookies);
          }

          const result = await testPageInteractions(currentPage, pageInfo, screenshotDir, loginSuccess);
          results.push(result);
          await currentPage.waitForTimeout(300).catch(() => {});
        } catch (error: any) {
          console.log(`⚠️ Error testing ${pageInfo.name}: ${error.message}`);
          results.push({
            pageName: pageInfo.name,
            pageUrl: pageInfo.path,
            loaded: false,
            authenticated: loginSuccess,
            errors: [error.message],
            consoleErrors: [],
            buttonsFound: 0,
            buttonsClicked: 0,
            inputsFound: 0,
            tabsFound: 0,
            tabsClicked: 0,
            modalsOpened: 0,
            dropdownsFound: 0,
            screenshot: ''
          });

          // Try to recover with a new page
          if (currentPage.isClosed()) {
            try {
              currentPage = await context.newPage();
              await currentPage.setViewportSize({ width: 1920, height: 1080 });
            } catch {
              console.log(`   ❌ Could not create new page`);
            }
          }
        }
      }

      // Save user results
      const userResult: UserTestResult = {
        user: user.name,
        email: user.email,
        role: user.role,
        loginSuccess,
        pagesLoaded: results.filter(r => r.loaded).length,
        totalErrors: results.reduce((sum, r) => sum + r.errors.length + r.consoleErrors.length, 0),
        pages: results
      };

      const jsonPath = path.join(screenshotDir, 'results.json');
      fs.writeFileSync(jsonPath, JSON.stringify(userResult, null, 2));

      // Summary
      console.log('\n' + '='.repeat(70));
      console.log(`📊 SUMMARY FOR ${user.name}`);
      console.log('='.repeat(70));
      console.log(`✅ Pages loaded: ${userResult.pagesLoaded}/${results.length}`);
      console.log(`🔘 Total buttons clicked: ${results.reduce((sum, r) => sum + r.buttonsClicked, 0)}`);
      console.log(`📑 Total tabs clicked: ${results.reduce((sum, r) => sum + r.tabsClicked, 0)}`);
      console.log(`📋 Total modals opened: ${results.reduce((sum, r) => sum + r.modalsOpened, 0)}`);
      console.log(`❌ Total errors: ${userResult.totalErrors}`);
      console.log(`📸 Screenshots saved to: ${screenshotDir}`);

      // Test passes if most pages loaded
      expect(userResult.pagesLoaded).toBeGreaterThan(results.length * 0.5);
    });
  }

  test('Generate Combined Report', async ({ }) => {
    // This test runs after all user tests and combines their results
    const allResults: UserTestResult[] = [];

    for (const user of showcaseUsers) {
      const jsonPath = path.join(process.cwd(), 'test-results', 'interactive-demo', user.tier, 'results.json');
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        allResults.push(data);
      }
    }

    if (allResults.length > 0) {
      const report = generateReport(allResults);
      const reportPath = path.join(process.cwd(), 'test-results', 'interactive-demo-report.md');
      fs.writeFileSync(reportPath, report);
      console.log(`\n📄 Combined report saved to: ${reportPath}`);
    }
  });
});
