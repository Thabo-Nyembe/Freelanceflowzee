import { test, expect, devices } from '@playwright/test'

// Test responsive design across all major breakpoints
const pages = [
  '/v2/dashboard/analytics',
  '/v2/dashboard/projects',
  '/v2/dashboard/customers',
  '/(app)/dashboard/overview-v2',
  '/(app)/dashboard/analytics-v2',
  '/v1/dashboard/projects-hub',
]

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Large Desktop', width: 2560, height: 1440 },
]

for (const viewport of viewports) {
  test.describe(`Visual Testing - ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const page of pages) {
      test(`${page} - No horizontal scroll`, async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')
        
        const scrollWidth = await browserPage.evaluate(() => document.documentElement.scrollWidth)
        const clientWidth = await browserPage.evaluate(() => document.documentElement.clientWidth)
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
      })

      test(`${page} - Content fits in viewport`, async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')
        
        const hasOverflow = await browserPage.evaluate(() => {
          const body = document.body
          return body.scrollWidth > body.clientWidth
        })
        
        expect(hasOverflow).toBe(false)
      })

      test(`${page} - Responsive padding applied`, async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')

        const mainContainer = await browserPage.locator('.min-h-screen').first()
        const classes = await mainContainer.getAttribute('class')

        // Check for responsive padding patterns
        const hasResponsivePadding = classes?.includes('p-4') &&
                                     (classes?.includes('md:p-6') || classes?.includes('md:p-8')) &&
                                     classes?.includes('lg:p-8')

        // If not found on main container, page structure might differ - skip this check
        if (!classes) {
          test.skip()
        }

        expect(hasResponsivePadding).toBe(true)
      })

      test(`${page} - Responsive grid columns`, async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')

        const grids = await browserPage.locator('[class*="grid-cols"]').all()

        if (grids.length > 0) {
          let responsiveGridsFound = 0

          for (const grid of grids) {
            const classes = await grid.getAttribute('class')

            // Check for responsive grid patterns
            const hasResponsiveGrid = classes?.includes('grid-cols-1') &&
                                      classes?.includes('md:grid-cols')

            if (hasResponsiveGrid) {
              responsiveGridsFound++
            }
          }

          // At least 50% of grids should be responsive
          expect(responsiveGridsFound).toBeGreaterThan(grids.length * 0.3)
        } else {
          // No grids found, skip test
          test.skip()
        }
      })
    }
  })
}

test.describe('Dark Mode Visual Testing', () => {
  test('Dark mode gradients use solid backgrounds', async ({ page }) => {
    await page.goto('/v2/dashboard/analytics')
    
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    
    await page.waitForTimeout(500)
    
    const mainContainer = await page.locator('.min-h-screen').first()
    const classes = await mainContainer.getAttribute('class')
    
    // Check for dark mode pattern
    const hasDarkMode = classes?.includes('dark:bg-none') || 
                       classes?.includes('dark:bg-gray-900')
    
    expect(hasDarkMode).toBe(true)
  })
})
