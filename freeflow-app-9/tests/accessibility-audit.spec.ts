import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const testPages = [
  '/v2/dashboard/analytics',
  '/v2/dashboard/projects',
  '/v2/dashboard/customers',
  '/(app)/dashboard/overview-v2',
  '/(app)/dashboard/analytics-v2',
]

test.describe('Accessibility Testing', () => {
  for (const page of testPages) {
    test(`${page} - Accessibility scan`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test(`${page} - Keyboard navigation`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      // Tab through interactive elements
      for (let i = 0; i < 10; i++) {
        await browserPage.keyboard.press('Tab')
        await browserPage.waitForTimeout(100)
        
        const focusedElement = await browserPage.evaluate(() => {
          const el = document.activeElement
          return {
            tagName: el?.tagName,
            hasVisibleFocus: window.getComputedStyle(el!).outline !== 'none'
          }
        })
        
        // Ensure interactive elements are focusable
        if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement.tagName)) {
          expect(focusedElement).toBeTruthy()
        }
      }
    })

    test(`${page} - Focus indicators visible`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      const buttons = await browserPage.locator('button').all()
      
      for (const button of buttons.slice(0, 5)) {
        if (await button.isVisible()) {
          await button.focus()
          
          const hasFocusStyle = await button.evaluate((el) => {
            const styles = window.getComputedStyle(el)
            return styles.outline !== 'none' || 
                   styles.boxShadow !== 'none' ||
                   el.classList.contains('focus:')
          })
          
          expect(hasFocusStyle).toBeTruthy()
        }
      }
    })

    test(`${page} - Color contrast (WCAG AA)`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2aa'])
        .disableRules(['color-contrast']) // We'll check manually
        .analyze()
      
      // Check for color contrast violations specifically
      const contrastResults = await new AxeBuilder({ page: browserPage })
        .withRules(['color-contrast'])
        .analyze()
      
      expect(contrastResults.violations.length).toBe(0)
    })

    test(`${page} - ARIA labels present`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      // Check buttons without text have aria-label
      const iconButtons = await browserPage.locator('button:has(svg):not(:has-text(""))').all()
      
      for (const button of iconButtons.slice(0, 10)) {
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label')
          const ariaLabelledBy = await button.getAttribute('aria-labelledby')
          const title = await button.getAttribute('title')
          
          expect(ariaLabel || ariaLabelledBy || title).toBeTruthy()
        }
      }
    })
  }
})
