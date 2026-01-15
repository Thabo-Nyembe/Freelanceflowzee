import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
]

const pages = [
  '/v2/dashboard/analytics',
  '/(app)/dashboard/overview-v2',
]

test.describe('Simple Visual Verification', () => {
  for (const viewport of viewports) {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const page of pages) {
      test(`${page} on ${viewport.name} - No horizontal scroll`, async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')

        const scrollWidth = await browserPage.evaluate(() => document.documentElement.scrollWidth)
        const clientWidth = await browserPage.evaluate(() => document.documentElement.clientWidth)

        console.log(`${page} on ${viewport.name}: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`)

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5) // Allow 5px tolerance
      })
    }
  }
})
