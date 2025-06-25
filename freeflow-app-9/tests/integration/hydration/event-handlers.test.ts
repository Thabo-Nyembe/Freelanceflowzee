import { test, expect } from '@playwright/test'
import { 
  waitForHydration,
  checkEventHandlers,
  simulateUserInteraction
} from '@/tests/utils/hydration-test-utils'

test.describe('Event Handlers During Hydration', () => {
  test('should maintain event handler functionality after hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    await waitForHydration(page)

    // Check event handlers
    const handlerIssues = await checkEventHandlers(page)
    expect(handlerIssues).toHaveLength(0)

    // Test button click handler
    await page.click('[data-testid="create-project-button"]')
    const dialogVisible = await page.isVisible('[data-testid="create-project-dialog"]')
    expect(dialogVisible).toBe(true)
  })

  test('should handle form submissions correctly after hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    await waitForHydration(page)

    // Open create project dialog
    await page.click('[data-testid="create-project-button"]')

    // Fill form
    await page.fill('[data-testid="project-title-input"]', 'Test Project')
    await page.fill('[data-testid="project-description-input"]', 'Test Description')

    // Submit form
    await page.click('[data-testid="submit-project-button"]')

    // Verify form submission worked
    const successMessage = await page.textContent('[data-testid="success-message"]')
    expect(successMessage).toContain('Project created successfully')
  })

  test('should preserve event handler context after hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    await waitForHydration(page)

    // Set up context monitoring
    await page.evaluate(() => {
      window._contextLost = false
      window._originalThis = null

      // Monitor a button's click handler
      const button = document.querySelector('[data-testid="create-project-button"]')
      if (button) {
        const originalClick = button.onclick
        // @ts-ignore
        button.onclick = function(...args) {
          // @ts-ignore
          window._contextLost = this !== window._originalThis
          // @ts-ignore
          if (!window._originalThis) window._originalThis = this
          return originalClick?.apply(this, args)
        }
      }
    })

    // Click button before hydration
    await page.click('[data-testid="create-project-button"]')
    
    // Wait for hydration
    await waitForHydration(page)

    // Click button after hydration
    await page.click('[data-testid="create-project-button"]')

    // Check if context was preserved
    const contextLost = await page.evaluate(() => window._contextLost)
    expect(contextLost).toBe(false)
  })
}) 