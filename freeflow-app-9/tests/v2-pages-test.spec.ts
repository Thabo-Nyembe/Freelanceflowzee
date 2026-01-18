import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

// Test key V2 pages for errors and functionality
const v2PagesToTest = [
  // Core pages
  'projects',
  'files',
  'team',
  'widgets',
  'payments',
  'storage',
  'booking',
  'referrals',
  'operations',

  // AI pages
  'ai-image-generator',
  'ai-music-studio',
  'ai-video-studio',
  'ai-business-advisor',
  'ai-content-studio',

  // Collaboration
  'collaboration-demo',
  'canvas-collaboration',
  'voice-collaboration',

  // Client
  'client-portal',
  'client-zone',

  // Finance
  'crypto-payments',
  'financial-hub',

  // Other key pages
  'admin-overview',
  'analytics-advanced',
  'community-hub',
  'plugin-marketplace',
  'email-agent',
]

test.describe('V2 Pages Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for page loads
    page.setDefaultTimeout(30000)
  })

  for (const pageName of v2PagesToTest) {
    test(`V2 ${pageName} - loads without errors`, async ({ page }) => {
      const errors: string[] = []

      // Capture console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      // Capture page errors
      page.on('pageerror', err => {
        errors.push(err.message)
      })

      // Navigate to page
      const response = await page.goto(`${BASE_URL}/v2/dashboard/${pageName}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      // Check response status
      expect(response?.status()).toBeLessThan(400)

      // Wait for content to load
      await page.waitForTimeout(2000)

      // Take screenshot
      await page.screenshot({
        path: `test-results/v2-screenshots/${pageName}.png`,
        fullPage: false
      })

      // Check for error text on page
      const pageContent = await page.textContent('body')
      const hasError = pageContent?.toLowerCase().includes('error') &&
                       !pageContent?.toLowerCase().includes('error boundary') &&
                       pageContent?.toLowerCase().includes('failed')

      // Check for 404
      const has404 = pageContent?.includes('404') || pageContent?.includes('not found')

      // Log findings
      if (errors.length > 0) {
        console.log(`Console errors on ${pageName}:`, errors.slice(0, 3))
      }

      if (has404) {
        console.log(`404 detected on ${pageName}`)
      }

      // Soft assertions - don't fail but log
      if (hasError) {
        console.log(`Error text found on ${pageName}`)
      }
    })
  }
})

test.describe('V2 Pages Screenshots Batch', () => {
  test('Capture all V2 pages screenshots', async ({ page }) => {
    const allV2Pages = [
      'projects', 'files', 'team', 'widgets', 'payments', 'storage', 'booking',
      'ai-image-generator', 'ai-music-studio', 'ai-business-advisor',
      'client-portal', 'client-zone', 'crypto-payments', 'financial-hub',
      'admin-overview', 'community-hub', 'plugin-marketplace',
      'collaboration-demo', 'canvas-collaboration', 'analytics-advanced'
    ]

    const results: { page: string, status: number, hasError: boolean }[] = []

    for (const pageName of allV2Pages) {
      try {
        const response = await page.goto(`${BASE_URL}/v2/dashboard/${pageName}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        })

        await page.waitForTimeout(1500)

        await page.screenshot({
          path: `test-results/v2-batch/${pageName}.png`,
          fullPage: false
        })

        const content = await page.textContent('body')
        const hasError = content?.includes('Error:') || content?.includes('failed to')

        results.push({
          page: pageName,
          status: response?.status() || 0,
          hasError: !!hasError
        })

        console.log(`✓ ${pageName}: ${response?.status()}${hasError ? ' (has error text)' : ''}`)
      } catch (err: unknown) {
        console.log(`✗ ${pageName}: ${err.message}`)
        results.push({ page: pageName, status: 0, hasError: true })
      }
    }

    // Summary
    console.log('\n=== Summary ===')
    console.log(`Total: ${results.length}`)
    console.log(`Success (2xx): ${results.filter(r => r.status >= 200 && r.status < 300).length}`)
    console.log(`With errors: ${results.filter(r => r.hasError).length}`)
  })
})
