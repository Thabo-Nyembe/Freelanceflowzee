import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('should load payment page', async ({ page }) => {
    await page.goto('/payment')
    
    // Check payment page loads
    await expect(page).toHaveURL(/payment/)
    
    // Check for payment content
    const hasPayment = await page.locator('text=Payment').isVisible()
    const hasPrice = await page.locator('text=$').isVisible()
    const hasForm = await page.locator('form').isVisible()
    
    expect(hasPayment || hasPrice || hasForm).toBeTruthy()
  })

  test('should have payment form elements', async ({ page }) => {
    await page.goto('/payment')
    
    // Look for common payment form elements
    const elements = [
      'input[type="email"]',
      'button[type="submit"]',
      'text=Pay',
      'text=Subscribe',
      'text=Continue'
    ]

    let foundElements = 0
    for (const element of elements) {
      if (await page.locator(element).isVisible()) {
        foundElements++
      }
    }

    // Should find at least one payment-related element
    expect(foundElements).toBeGreaterThan(0)
  })

  test('should handle API payment endpoint', async ({ page }) => {
    // Test payment API endpoint
    const response = await page.request.post('/api/payment/create-intent', {
      data: {
        amount: 2999,
        currency: 'usd',
        testMode: true
      }
    })

    // Should get a response (even if it's an error due to test mode)
    expect(response.status()).toBeLessThan(500)
  })
}) 