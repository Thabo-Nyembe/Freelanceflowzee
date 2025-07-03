import { test, expect } from '@playwright/test';

test.describe('FreeflowZee Payment System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/payment');
  });

  test.describe('Payment Flow', () => {
    test('should display pricing tiers correctly', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Pricing Plans' })).toBeVisible();
      
      // Check Standard tier
      await expect(page.getByText('Standard Plan')).toBeVisible();
      await expect(page.getByText('$299')).toBeVisible();
      
      // Check Extended tier
      await expect(page.getByText('Extended Plan')).toBeVisible();
      await expect(page.getByText('$599')).toBeVisible();
    });

    test('should process successful payment', async ({ page }) => {
      // Select plan
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      
      // Fill payment form
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('123');
      
      // Submit payment
      await page.getByRole('button', { name: 'Pay Now' }).click();
      
      // Verify success
      await expect(page.getByText('Payment Successful')).toBeVisible();
      await expect(page.getByText('Thank you for your purchase')).toBeVisible();
    });

    test('should handle card decline', async ({ page }) => {
      // Select plan
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      
      // Fill payment form with declined card
      await page.getByLabel('Card number').fill('4000 0000 0000 0002');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('123');
      
      // Submit payment
      await page.getByRole('button', { name: 'Pay Now' }).click();
      
      // Verify decline message
      await expect(page.getByText('Your card was declined')).toBeVisible();
      await expect(page.getByText('Please try a different card')).toBeVisible();
    });
  });

  test.describe('Payment Validation', () => {
    test('should validate card number format', async ({ page }) => {
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      
      // Invalid card number
      await page.getByLabel('Card number').fill('1234');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('123');
      
      await expect(page.getByText('Invalid card number')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Pay Now' })).toBeDisabled();
    });

    test('should validate expiry date', async ({ page }) => {
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      
      // Past expiry date
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByLabel('Expiry date').fill('12/20');
      await page.getByLabel('CVC').fill('123');
      
      await expect(page.getByText('Card expired')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Pay Now' })).toBeDisabled();
    });

    test('should validate CVC', async ({ page }) => {
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      
      // Invalid CVC
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('1');
      
      await expect(page.getByText('Invalid CVC')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Pay Now' })).toBeDisabled();
    });
  });

  test.describe('Payment Receipt', () => {
    test('should display detailed receipt after successful payment', async ({ page }) => {
      // Complete successful payment
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('123');
      await page.getByRole('button', { name: 'Pay Now' }).click();
      
      // Verify receipt details
      await expect(page.getByText('Payment Receipt')).toBeVisible();
      await expect(page.getByText('Standard Plan')).toBeVisible();
      await expect(page.getByText('$299.00')).toBeVisible();
      await expect(page.getByText(/Transaction ID:/)).toBeVisible();
      await expect(page.getByText(/Date:/)).toBeVisible();
    });

    test('should allow downloading receipt as PDF', async ({ page }) => {
      // Complete successful payment
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('123');
      await page.getByRole('button', { name: 'Pay Now' }).click();
      
      // Click download receipt
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download Receipt' }).click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toMatch(/receipt.*\.pdf$/);
    });
  });

  test.describe('Payment Error Handling', () => {
    test('should handle network errors during payment', async ({ page }) => {
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      
      // Simulate network error
      await page.route('**/api/payment/**', route => route.abort());
      
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('123');
      await page.getByRole('button', { name: 'Pay Now' }).click();
      
      await expect(page.getByText('Payment failed')).toBeVisible();
      await expect(page.getByText('Please try again')).toBeVisible();
    });

    test('should handle Stripe API errors', async ({ page }) => {
      await page.getByRole('button', { name: 'Select Standard Plan' }).click();
      
      // Simulate Stripe error
      await page.route('**/api/payment/**', route => 
        route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: {
              type: 'StripeCardError',
              message: 'Your card has insufficient funds.'
            }
          })
        })
      );
      
      await page.getByLabel('Card number').fill('4242 4242 4242 4242');
      await page.getByLabel('Expiry date').fill('12/25');
      await page.getByLabel('CVC').fill('123');
      await page.getByRole('button', { name: 'Pay Now' }).click();
      
      await expect(page.getByText('Your card has insufficient funds')).toBeVisible();
    });
  });
}); 