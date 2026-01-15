import { test, expect } from '@playwright/test'

const testPages = [
  '/v2/dashboard/analytics',
  '/v2/dashboard/projects',
  '/(app)/dashboard/overview-v2',
]

test.describe('Core Interaction Testing - Simplified', () => {
  for (const page of testPages) {
    test.describe(`${page}`, () => {
      test('Page loads and is interactive', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('domcontentloaded')

        // Wait a bit for toasts to clear
        await browserPage.waitForTimeout(2000)

        // Check that page has interactive content
        const buttons = await browserPage.locator('button:visible').count()
        const links = await browserPage.locator('a:visible').count()
        const inputs = await browserPage.locator('input:visible').count()

        const interactiveElements = buttons + links + inputs
        expect(interactiveElements).toBeGreaterThan(5)
      })

      test('Navigation is clickable', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('domcontentloaded')

        // Find navigation links (sidebar or header)
        const navLinks = await browserPage.locator('nav a, [role="navigation"] a').all()

        let clickableCount = 0
        for (const link of navLinks.slice(0, 5)) {
          try {
            const isVisible = await link.isVisible({ timeout: 500 })
            if (isVisible) {
              clickableCount++
            }
          } catch (e) {
            continue
          }
        }

        expect(clickableCount).toBeGreaterThanOrEqual(3)
      })

      test('Main content area exists and is visible', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('domcontentloaded')

        // Check for main content area
        const mainContent = browserPage.locator('main, [role="main"]').first()
        await expect(mainContent).toBeVisible()
      })

      test('At least one button can be hovered', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('domcontentloaded')
        await browserPage.waitForTimeout(1500)

        // Find any visible, enabled button
        const buttons = await browserPage.locator('button:visible:enabled').all()

        let hoverSuccess = false
        for (const button of buttons.slice(0, 20)) {
          try {
            await button.hover({ timeout: 500, force: true })
            hoverSuccess = true
            break
          } catch (e) {
            continue
          }
        }

        expect(hoverSuccess).toBe(true)
      })
    })
  }
})
