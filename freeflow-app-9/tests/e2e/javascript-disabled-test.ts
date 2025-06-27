import { test, expect } from '@playwright/test

test.describe('JavaScript Disabled Tests', () => {
  test.use({ javaScriptEnabled: false })

  test('should show JavaScript disabled warning', async ({ page }) => {
    await page.goto('/')
    
    // Check if noscript content is present
    const noscriptContent = await page.getByTestId('js-disabled-fallback')
    await expect(noscriptContent).toBeVisible()
    
    // Check if warning message is correct
    const warningMessage = await page.getByText('Please enable JavaScript in your browser')
    await expect(warningMessage).toBeVisible()
  })

  test('should show static content without JavaScript', async ({ page }) => {
    await page.goto('/')
    
    // Check if main content is still accessible
    const mainContent = await page.getByTestId('main-content')
    await expect(mainContent).toBeVisible()
    
    // Check if static navigation links are present
    const navLinks = await page.$$('nav a')
    expect(navLinks.length).toBeGreaterThan(0)
    
    // Check if static text content is visible
    const staticContent = await page.getByText('Create, Share & Get Paid Like a Pro')
    await expect(staticContent).toBeVisible()
  })

  test('should handle form submissions gracefully', async ({ page }) => {
    await page.goto('/contact')
    
    // Check if form is present
    const form = await page.getByTestId('contact-form')
    await expect(form).toBeVisible()
    
    // Check if form has proper action attribute for non-JS submission
    const formAction = await form.getAttribute('action')
    expect(formAction).toBeTruthy()
    
    // Check if form has method attribute
    const formMethod = await form.getAttribute('method')
    expect(formMethod).toBe('post')
  })

  test('should show proper fallback UI for interactive features', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check if fallback message is shown for interactive features
    const fallbackMessage = await page.getByText('This feature requires JavaScript')
    await expect(fallbackMessage).toBeVisible()
    
    // Check if static alternatives are provided
    const staticAlternatives = await page.getByTestId('static-alternatives')
    await expect(staticAlternatives).toBeVisible()
  })

  test('should maintain accessibility without JavaScript', async ({ page }) => {
    await page.goto('/')
    
    // Check if ARIA attributes are properly set
    const mainRegion = await page.locator('[role="main"]')
    await expect(mainRegion).toBeVisible()
    
    // Check if navigation is properly marked
    const navigation = await page.locator('[role="navigation"]')
    await expect(navigation).toBeVisible()
    
    // Check if headings are properly structured
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })
}) 