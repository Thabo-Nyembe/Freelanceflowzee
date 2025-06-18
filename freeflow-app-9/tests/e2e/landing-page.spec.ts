import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/FreeflowZee/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText(/Create, Share & Get Paid/)
    
    // Check navigation
    await expect(page.locator('nav')).toBeVisible()
    
    // Check CTA buttons
    await expect(page.locator('text=Creator Login')).toBeVisible()
    await expect(page.locator('text=Watch Demo')).toBeVisible()
    await expect(page.locator('text=View Projects')).toBeVisible()
  })

  test('should navigate to demo page', async ({ page }) => {
    await page.goto('/')
    
    // Click demo button
    await page.click('text=Watch Demo')
    
    // Should open demo modal or navigate to demo
    await page.waitForTimeout(1000)
    
    // Check for demo content
    const hasModal = await page.locator('[role="dialog"]').isVisible()
    const hasDemo = await page.locator('text=Demo').isVisible()
    
    expect(hasModal || hasDemo).toBeTruthy()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test features link
    await page.click('text=Features')
    await page.waitForURL('**/features')
    await expect(page).toHaveURL(/features/)
    
    // Go back to home
    await page.goto('/')
    
    // Test pricing link
    await page.click('text=Pricing')
    await page.waitForURL('**/pricing')
    await expect(page).toHaveURL(/pricing/)
  })
}) 