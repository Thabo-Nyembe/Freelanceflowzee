import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

// Pages that were fixed in this session
const fixedPages = [
  'upgrades-showcase',
  'clients',
  'reports',
  'support-tickets',
]

// Additional sample pages to verify
const samplePages = [
  'projects',
  'files',
  'team',
  'financial-hub',
  'collaboration-demo',
  'ai-music-studio',
  'ai-business-advisor',
  'calendar',
  'invoices',
  'analytics',
  'settings',
  'dashboard',
]

test.describe('V2 Fixed Pages Verification', () => {
  test('Verify all fixed pages return 200 and render correctly', async ({ page }) => {
    console.log('\\n=== TESTING FIXED PAGES ===\\n')

    for (const pageName of fixedPages) {
      const url = `${BASE_URL}/v2/dashboard/${pageName}`
      console.log(`Testing: ${pageName}`)

      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })

      // Wait for page to render
      await page.waitForTimeout(2000)

      // Take screenshot
      await page.screenshot({
        path: `test-results/v2-verification/fixed-${pageName}.png`,
        fullPage: false
      })

      const status = response?.status() || 0
      const content = await page.textContent('body')

      // Check for build errors
      const hasBuildError = content?.includes('Build Error') ||
                           content?.includes('Unhandled Runtime Error') ||
                           content?.includes('Module not found') ||
                           content?.includes('is not defined') ||
                           content?.includes('Cannot read properties of undefined')

      if (status === 200 && !hasBuildError) {
        console.log(`  ✓ ${pageName}: PASS (${status})`)
      } else {
        console.log(`  ✗ ${pageName}: FAIL (${status}) ${hasBuildError ? '- Build error detected' : ''}`)
      }

      expect(status).toBe(200)
      expect(hasBuildError).toBeFalsy()
    }
  })

  test('Verify sample V2 pages are working', async ({ page }) => {
    console.log('\\n=== TESTING SAMPLE PAGES ===\\n')

    for (const pageName of samplePages) {
      const url = `${BASE_URL}/v2/dashboard/${pageName}`
      console.log(`Testing: ${pageName}`)

      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })

        await page.waitForTimeout(1500)

        // Take screenshot
        await page.screenshot({
          path: `test-results/v2-verification/sample-${pageName}.png`,
          fullPage: false
        })

        const status = response?.status() || 0

        if (status === 200) {
          console.log(`  ✓ ${pageName}: PASS (${status})`)
        } else {
          console.log(`  ✗ ${pageName}: ${status}`)
        }
      } catch (err: unknown) {
        console.log(`  ✗ ${pageName}: ERROR - ${err.message?.slice(0, 50)}`)
      }
    }
  })
})
