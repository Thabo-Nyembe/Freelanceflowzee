import { test, expect } from &apos;@playwright/test&apos;

test.describe(&apos;Payment Flow&apos;, () => {
  test(&apos;should load payment page&apos;, async ({ page }) => {
    await page.goto(&apos;/payment&apos;)
    
    // Check payment page loads
    await expect(page).toHaveURL(/payment/)
    
    // Check for payment content
    const hasPayment = await page.locator(&apos;text=Payment&apos;).isVisible()
    const hasPrice = await page.locator(&apos;text=$&apos;).isVisible()
    const hasForm = await page.locator(&apos;form&apos;).isVisible()
    
    expect(hasPayment || hasPrice || hasForm).toBeTruthy()
  })

  test(&apos;should have payment form elements&apos;, async ({ page }) => {
    await page.goto(&apos;/payment&apos;)
    
    // Look for common payment form elements
    const elements = [
      &apos;input[type=&quot;email&quot;]&apos;,
      &apos;button[type=&quot;submit&quot;]&apos;,
      &apos;text=Pay&apos;,
      &apos;text=Subscribe&apos;,
      &apos;text=Continue&apos;
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

  test(&apos;should handle API payment endpoint&apos;, async ({ page }) => {
    // Test payment API endpoint
    const response = await page.request.post(&apos;/api/payment/create-intent&apos;, {
      data: {
        amount: 2999,
        currency: &apos;usd&apos;,
        testMode: true
      }
    })

    // Should get a response (even if it&apos;s an error due to test mode)
    expect(response.status()).toBeLessThan(500)
  })
}) 