import { test, expect } from '@playwright/test'

const V2_PAGES = [
  '3d-modeling-v2', 'access-logs-v2', 'activity-logs-v2', 'add-ons-v2', 'admin-v2',
  'ai-assistant-v2', 'ai-create-v2', 'alerts-v2', 'allocation-v2', 'analytics-v2',
  'announcements-v2', 'api-keys-v2', 'api-v2', 'app-store-v2', 'assets-v2',
  'audit-logs-v2', 'audio-studio-v2', 'bookings-v2', 'broadcasts-v2', 'budgets-v2',
  'bugs-v2', 'calendar-v2', 'canvas-v2', 'certifications-v2', 'changelog-v2',
  'clients-v2', 'cloud-storage-v2', 'collaboration-v2', 'community-v2', 'compliance-v2',
  'content-v2', 'contracts-v2', 'courses-v2', 'crm-v2', 'customer-support-v2',
  'customers-v2', 'data-export-v2', 'deployments-v2', 'desktop-app-v2',
  'email-marketing-v2', 'employees-v2', 'escrow-v2', 'events-v2', 'expenses-v2',
  'extensions-v2', 'faq-v2', 'features-v2', 'feedback-v2', 'files-hub-v2', 'files-v2',
  'financial-v2', 'forms-v2', 'gallery-v2', 'growth-hub-v2', 'health-score-v2',
  'help-docs-v2', 'integrations-v2', 'inventory-v2', 'invoicing-v2',
  'kazi-automations-v2', 'kazi-workflows-v2', 'knowledge-base-v2', 'logs-v2',
  'logistics-v2', 'marketplace-v2', 'messages-v2', 'milestones-v2', 'mobile-app-v2',
  'monitoring-v2', 'my-day-v2', 'notifications-v2', 'onboarding-v2', 'orders-v2',
  'overview-v2', 'payroll-v2', 'performance-v2', 'permissions-v2', 'plugins-v2',
  'pricing-v2', 'products-v2', 'profile-v2', 'projects-hub-v2', 'projects-v2',
  'qa-v2', 'recruitment-v2', 'registrations-v2', 'release-notes-v2', 'releases-v2',
  'renewals-v2', 'reports-v2', 'resources-v2', 'security-audit-v2', 'security-v2',
  'seo-v2', 'settings-v2', 'shipping-v2', 'social-media-v2', 'stock-v2',
  'support-tickets-v2', 'surveys-v2', 'tasks-v2', 'team-hub-v2', 'templates-v2',
  'third-party-integrations-v2', 'tickets-v2', 'time-tracking-v2', 'training-v2',
  'user-management-v2', 'video-studio-v2', 'vulnerability-scan-v2', 'webhooks-v2',
  'webinars-v2', 'workflow-builder-v2', 'workflows-v2',
]

const PUBLIC_PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
]

test.describe('Screenshot All Pages', () => {
  test.setTimeout(600000)

  test('Screenshot all pages with visible browser', async ({ page }) => {
    const errors: { page: string; error: string }[] = []
    const passed: string[] = []

    console.log('\n=== PUBLIC PAGES ===')
    for (const pageInfo of PUBLIC_PAGES) {
      try {
        await page.goto('http://localhost:9323' + pageInfo.path, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        })
        await page.waitForTimeout(1500)
        await page.screenshot({
          path: 'test-results/screenshots/public-' + pageInfo.name.toLowerCase().replace(/\s/g, '-') + '.png',
          fullPage: true
        })
        passed.push(pageInfo.name)
        console.log('✅ ' + pageInfo.name)
      } catch (error: any) {
        errors.push({ page: pageInfo.name, error: error.message?.slice(0, 100) || 'Unknown' })
        console.log('❌ ' + pageInfo.name + ': ' + (error.message?.slice(0, 60) || 'Unknown'))
      }
    }

    console.log('\n=== V2 DASHBOARD PAGES ===')
    for (const pageName of V2_PAGES) {
      try {
        await page.goto('http://localhost:9323/dashboard/' + pageName, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        })
        await page.waitForTimeout(1000)

        await page.screenshot({
          path: 'test-results/screenshots/v2-' + pageName + '.png',
          fullPage: false
        })

        passed.push(pageName)
        console.log('✅ ' + pageName)
      } catch (error: any) {
        errors.push({ page: pageName, error: error.message?.slice(0, 100) || 'Unknown' })
        console.log('❌ ' + pageName + ': ' + (error.message?.slice(0, 60) || 'Unknown'))
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log('✅ Passed: ' + passed.length)
    console.log('❌ Errors: ' + errors.length)

    if (errors.length > 0) {
      console.log('\n❌ PAGES WITH ERRORS:')
      errors.forEach(e => console.log('  - ' + e.page + ': ' + e.error))
    }

    expect(passed.length).toBeGreaterThan(0)
  })
})
