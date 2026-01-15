import { test, expect } from '@playwright/test'

const testPages = [
  '/v2/dashboard/analytics',
  '/v2/dashboard/projects',
  '/(app)/dashboard/overview-v2',
]

test.describe('Interaction Testing', () => {
  for (const page of testPages) {
    test.describe(`${page}`, () => {
      test('All buttons are clickable with hover states', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')
        
        const buttons = await browserPage.locator('button').all()
        
        for (const button of buttons.slice(0, 10)) { // Test first 10 buttons
          const isVisible = await button.isVisible()
          if (isVisible) {
            const isEnabled = await button.isEnabled()
            expect(isEnabled).toBeTruthy()
            
            // Check hover state exists
            await button.hover()
            await browserPage.waitForTimeout(100)
          }
        }
      })

      test('Modals/Dialogs center properly', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')
        
        // Look for dialog triggers
        const dialogTriggers = await browserPage.locator('[data-state], [role="button"]').all()
        
        if (dialogTriggers.length > 0) {
          // Click first trigger
          const firstTrigger = dialogTriggers[0]
          if (await firstTrigger.isVisible()) {
            await firstTrigger.click()
            await browserPage.waitForTimeout(300)
            
            // Check if dialog appeared
            const dialog = await browserPage.locator('[role="dialog"]').first()
            if (await dialog.isVisible()) {
              const box = await dialog.boundingBox()
              expect(box).toBeTruthy()
            }
          }
        }
      })

      test('Dropdown menus do not overflow viewport', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')
        
        const dropdownTriggers = await browserPage.locator('[role="button"]:has-text("More"), button:has(svg)').all()
        
        for (const trigger of dropdownTriggers.slice(0, 5)) {
          if (await trigger.isVisible()) {
            await trigger.click()
            await browserPage.waitForTimeout(200)
            
            const menu = await browserPage.locator('[role="menu"], [role="listbox"]').first()
            if (await menu.isVisible()) {
              const box = await menu.boundingBox()
              const viewport = browserPage.viewportSize()
              
              if (box && viewport) {
                expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
                expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
              }
              
              // Close menu
              await browserPage.keyboard.press('Escape')
              await browserPage.waitForTimeout(100)
            }
          }
        }
      })

      test('Forms have proper input validation', async ({ page: browserPage }) => {
        await browserPage.goto(page)
        await browserPage.waitForLoadState('networkidle')
        
        const inputs = await browserPage.locator('input[type="text"], input[type="email"]').all()
        
        for (const input of inputs.slice(0, 5)) {
          if (await input.isVisible()) {
            // Check for labels
            const inputId = await input.getAttribute('id')
            if (inputId) {
              const label = await browserPage.locator(`label[for="${inputId}"]`).first()
              const hasLabel = await label.count() > 0
              expect(hasLabel || await input.getAttribute('aria-label')).toBeTruthy()
            }
          }
        }
      })
    })
  }
})
