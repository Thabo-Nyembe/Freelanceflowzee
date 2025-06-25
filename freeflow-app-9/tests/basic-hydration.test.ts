import { test, expect } from '@playwright/test'

test.describe('Basic Hydration Tests', () => {
  test('should load dashboard without hydration errors', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for hydration
    await page.waitForFunction(() => {
      return document.documentElement.hasAttribute('data-hydrated')
    }, { timeout: 5000 })
    
    // Check for hydration errors
    const errors = await page.evaluate(() => {
      const errors: string[] = []
      document.querySelectorAll('[data-hydration-error]').forEach(el => {
        const error = el.getAttribute('data-hydration-error')
        if (error) errors.push(error)
      })
      return errors
    })
    
    expect(errors).toHaveLength(0, 'Should have no hydration errors')
  })

  test('should handle navigation without hydration issues', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Navigate to projects hub
    await page.click('text=Projects Hub')
    await page.waitForURL('**/dashboard/projects-hub')
    
    // Check for expected content
    await expect(page.locator('text=Projects Hub')).toBeVisible()
    await expect(page.locator('text=Create Project')).toBeVisible()
  })
}) 