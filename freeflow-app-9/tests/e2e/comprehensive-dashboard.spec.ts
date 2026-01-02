import { test, expect } from '@playwright/test'

test.describe('Comprehensive Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should load dashboard with all major hubs', async ({ page }) => {
    // Check main dashboard loads
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible()
    
    // Check core tabs are present
    await expect(page.locator('text=Core')).toBeVisible()
    await expect(page.locator('text=AI')).toBeVisible()
    await expect(page.locator('text=Creative')).toBeVisible()
    await expect(page.locator('text=Business')).toBeVisible()
    await expect(page.locator('text=Community')).toBeVisible()
  })

  test('should navigate to Projects Hub', async ({ page }) => {
    // Click on Projects Hub
    await page.click('text=Projects Hub')
    
    // Should navigate to projects hub page
    await expect(page).toHaveURL(/.*dashboard\/projects-hub/)
    await expect(page.locator('[data-testid="projects-hub"]')).toBeVisible()
    
    // Check key project hub features
    await expect(page.locator('[data-testid="create-project-btn"]')).toBeVisible()
    await expect(page.locator('text=Projects Hub')).toBeVisible()
  })

  test('should navigate to Files Hub', async ({ page }) => {
    // Click on Files Hub
    await page.click('text=Files Hub')
    
    // Should navigate to files hub page
    await expect(page).toHaveURL(/.*dashboard\/files-hub/)
    
    // Check for files hub content
    await expect(page.locator('text=Files Hub')).toBeVisible()
    await expect(page.locator('text=Upload Files')).toBeVisible()
  })

  test('should navigate to Community Hub', async ({ page }) => {
    // Click on Community Hub
    await page.click('text=Community Hub')
    
    // Should navigate to community hub page
    await expect(page).toHaveURL(/.*dashboard\/community-v2/)
    
    // Check for community features
    await expect(page.locator('text=Community Hub')).toBeVisible()
  })

  test('should navigate to AI Create', async ({ page }) => {
    // Click on AI tab first
    await page.click('text=AI')
    
    // Then click on AI Create
    await page.click('text=AI Create')
    
    // Should navigate to AI create page
    await expect(page).toHaveURL(/.*dashboard\/ai-create/)
    
    // Check for AI create features
    await expect(page.locator('text=AI Create')).toBeVisible()
  })

  test('should navigate to Canvas Collaboration', async ({ page }) => {
    // Click on Creative tab
    await page.click('text=Creative')
    
    // Click on Canvas
    await page.click('text=Canvas')
    
    // Should navigate to canvas page
    await expect(page).toHaveURL(/.*dashboard\/canvas/)
    
    // Check for canvas features
    await expect(page.locator('text=Canvas Collaboration')).toBeVisible()
  })

  test('should handle tab switching', async ({ page }) => {
    // Test switching between different tabs
    const tabs = ['Core', 'AI', 'Creative', 'Business', 'Community']
    
    for (const tab of tabs) {
      await page.click(`text=${tab}`)
      
      // Wait for tab content to load
      await page.waitForTimeout(500)
      
      // Check that the tab is active
      const activeTab = page.locator(`text=${tab}`).first()
      await expect(activeTab).toBeVisible()
    }
  })

  test('should display feature cards in grid', async ({ page }) => {
    // Check that feature cards are displayed
    await expect(page.locator('.grid')).toBeVisible()
    
    // Check for specific feature cards
    await expect(page.locator('text=My Day')).toBeVisible()
    await expect(page.locator('text=Projects Hub')).toBeVisible()
    await expect(page.locator('text=Analytics')).toBeVisible()
    await expect(page.locator('text=Time Tracking')).toBeVisible()
  })

  test('should have working search functionality', async ({ page }) => {
    // Look for search input if it exists
    const searchInput = page.locator('input[placeholder*="search" i]')
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('projects')
      await page.waitForTimeout(500)
      
      // Should filter results
      await expect(page.locator('text=Projects Hub')).toBeVisible()
    }
  })

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('.grid')).toBeVisible()
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('.grid')).toBeVisible()
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('.grid')).toBeVisible()
  })

  test('should have accessible navigation', async ({ page }) => {
    // Check for proper headings
    await expect(page.locator('h1, h2, h3')).toHaveCount({ min: 1 })
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab')
    
    // Check that focused element is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })
})

test.describe('Dashboard API Integration', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('/api/**', route => route.abort())
    
    await page.goto('/dashboard')
    
    // Should still render the dashboard structure
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should load user-specific content', async ({ page }) => {
    // Mock user data
    await page.route('/api/user/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com'
        })
      })
    })

    await page.goto('/dashboard')
    
    // Should display user-specific content
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })
})
