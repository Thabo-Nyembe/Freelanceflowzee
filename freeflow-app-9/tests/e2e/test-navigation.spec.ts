import { test, expect } from '@playwright/test'

test.describe('Navigation and Button Tests', () => {
  test('should navigate to all header links', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Check landing page loads
    await expect(page).toHaveTitle(/FreeflowZee/)
    
    // Test header navigation
    await page.click('text=Features')
    await page.waitForURL('**/features')
    await expect(page.locator('h1')).toContainText('Features')
    
    await page.goBack()
    
    // Test pricing navigation
    await page.click('text=Pricing')
    await page.waitForURL('**/pricing')
    await expect(page.locator('h1')).toContainText('Pricing')
    
    await page.goBack()
    
    // Test demo button functionality
    await page.click('[data-testid="hero-cta-demo"]')
    // Check if demo modal opens or demo page loads
    await page.waitForTimeout(1000)
    
    console.log('✅ Basic navigation tests passed')
  })

  test('should test footer subscribe functionality', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Test newsletter subscription
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.fill('test@example.com')
    
    const subscribeButton = page.locator('button:has-text("Subscribe")').first()
    await subscribeButton.click()
    
    // Wait for success message
    await page.waitForTimeout(2000)
    
    console.log('✅ Footer subscribe functionality tested')
  })

  test('should test all footer links', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Test a few key footer links
    const footerLinks = [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Terms of Service', url: '/terms' },
      { text: 'Contact Us', url: '/contact' },
      { text: 'Careers', url: '/careers' }
    ]
    
    for (const link of footerLinks) {
      await page.click(`text=${link.text}`)
      await page.waitForURL(`**${link.url}`)
      await page.goBack()
      await page.waitForTimeout(500)
    }
    
    console.log('✅ Footer links working correctly')
  })
}) 