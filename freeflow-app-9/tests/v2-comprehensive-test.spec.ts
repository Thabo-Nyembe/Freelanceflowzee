import { test } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

// Comprehensive list of V2 pages to test (50 pages)
const v2Pages = [
  // Core Business
  'projects', 'files', 'team', 'widgets', 'payments', 'storage', 'booking', 'referrals', 'operations',

  // AI Features
  'ai-image-generator', 'ai-music-studio', 'ai-video-studio', 'ai-business-advisor',
  'ai-content-studio', 'ai-code-completion', 'ai-collaborate', 'ai-enhanced', 'ai-settings',

  // Collaboration
  'collaboration-demo', 'canvas-collaboration', 'voice-collaboration', 'ar-collaboration',

  // Client & Portal
  'client-portal', 'client-zone', 'cv-portfolio',

  // Finance
  'crypto-payments', 'financial-hub',

  // Admin & Analytics
  'admin-overview', 'analytics-advanced', 'audit-trail',

  // Communication
  'community-hub', 'email-agent',

  // Marketplace & Extensions
  'plugin-marketplace', 'browser-extension',

  // Templates & Resources
  'project-templates', 'resource-library',

  // Showcase & Demo
  'a-plus-showcase', 'advanced-features-demo', 'ui-showcase', 'shadcn-showcase',
  'micro-features-showcase', 'upgrades-showcase', 'comprehensive-testing',

  // Other Features
  'ml-insights', 'real-time-translation', 'white-label', 'value-dashboard', 'setup', 'coming-soon'
]

test.describe('V2 Comprehensive Page Testing', () => {
  test('Test 50 V2 pages for errors', async ({ page }) => {
    const results: { page: string, status: number, hasError: boolean, errorText?: string }[] = []

    for (const pageName of v2Pages) {
      try {
        const response = await page.goto(`${BASE_URL}/v2/dashboard/${pageName}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        })

        await page.waitForTimeout(1500)

        // Take screenshot
        await page.screenshot({
          path: `test-results/v2-comprehensive/${pageName}.png`,
          fullPage: false
        })

        const content = await page.textContent('body')
        const hasError = content?.includes('Error:') ||
                        content?.includes('Something went wrong') ||
                        content?.includes('Build Error') ||
                        content?.includes('failed to')

        const status = response?.status() || 0

        results.push({
          page: pageName,
          status,
          hasError: status >= 400 || !!hasError,
          errorText: hasError ? 'Error detected on page' : undefined
        })

        const statusIcon = status === 200 && !hasError ? '✓' : '✗'
        console.log(`${statusIcon} ${pageName}: ${status}${hasError ? ' (error on page)' : ''}`)
      } catch (err: any) {
        console.log(`✗ ${pageName}: TIMEOUT/ERROR - ${err.message?.slice(0, 50)}`)
        results.push({ page: pageName, status: 0, hasError: true, errorText: err.message })
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('V2 COMPREHENSIVE TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total pages tested: ${results.length}`)
    console.log(`Passing (200, no errors): ${results.filter(r => r.status === 200 && !r.hasError).length}`)
    console.log(`Server errors (5xx): ${results.filter(r => r.status >= 500).length}`)
    console.log(`Client errors (4xx): ${results.filter(r => r.status >= 400 && r.status < 500).length}`)
    console.log(`With page errors: ${results.filter(r => r.hasError).length}`)

    // List failures
    const failures = results.filter(r => r.status !== 200 || r.hasError)
    if (failures.length > 0) {
      console.log('\nFailed pages:')
      failures.forEach(f => console.log(`  - ${f.page}: ${f.status} ${f.errorText || ''}`))
    }

    console.log('='.repeat(60))
  })
})
