import { test } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

// Key pages to screenshot
const pagesToScreenshot = [
  'upgrades-showcase',
  'clients',
  'reports',
  'support-tickets',
  'projects',
  'files',
  'team',
  'ai-music-studio',
  'ai-business-advisor',
  'calendar',
  'analytics',
]

test.describe.configure({ mode: 'serial' })

test.describe('V2 Screenshot Capture', () => {
  for (const pageName of pagesToScreenshot) {
    test(`Screenshot: ${pageName}`, async ({ page }) => {
      await page.goto(`${BASE_URL}/v2/dashboard/${pageName}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Wait for page to fully render
      await page.waitForTimeout(2000)

      // Take screenshot
      await page.screenshot({
        path: `test-results/v2-verification/${pageName}.png`,
        fullPage: false
      })

      console.log(`✓ Screenshot captured: ${pageName}`)
    })
  }
})
