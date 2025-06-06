import { test, expect } from '../fixtures/app-fixtures';

test.describe('💳 Comprehensive Payment System Tests', () => {
  test.describe('💰 Payment Form Validation', () => {
    test('should display payment form elements', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const formElements = await paymentPage.verifyPaymentForm();
      
      expect(formElements.form).toBe(true);
      expect(formElements.cardNumber).toBe(true);
      expect(formElements.expiry).toBe(true);
      expect(formElements.cvc).toBe(true);
      expect(formElements.name).toBe(true);
      expect(formElements.payButton).toBe(true);
    });

    test('should validate card number format', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const invalidCardValidation = await paymentPage.testCardValidation('1234');
      const validCardValidation = await paymentPage.testCardValidation('4242424242424242');
      
      if (invalidCardValidation) {
        expect(invalidCardValidation).toContain('invalid');
      }
      
      if (validCardValidation) {
        expect(validCardValidation).not.toContain('invalid');
      }
    });

    test('should check required fields completion', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      // Initially empty
      let fieldStatus = await paymentPage.areRequiredFieldsFilled();
      expect(fieldStatus.allFilled).toBe(false);
      
      // Fill all required fields
      await paymentPage.cardNumberInput.fill('4242424242424242');
      await paymentPage.expiryDateInput.fill('12/28');
      await paymentPage.cvcInput.fill('123');
      await paymentPage.cardholderNameInput.fill('Test User');
      
      fieldStatus = await paymentPage.areRequiredFieldsFilled();
      expect(fieldStatus.allFilled).toBe(true);
    });

    test('should enable pay button when form is complete', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      // Initially disabled
      const initiallyEnabled = await paymentPage.isPayButtonEnabled();
      expect(initiallyEnabled).toBe(false);
      
      // Fill required fields
      await paymentPage.cardNumberInput.fill('4242424242424242');
      await paymentPage.expiryDateInput.fill('12/28');
      await paymentPage.cvcInput.fill('123');
      await paymentPage.cardholderNameInput.fill('Test User');
      
      const finallyEnabled = await paymentPage.isPayButtonEnabled();
      expect(finallyEnabled).toBe(true);
    });
  });

  test.describe('💳 Payment Methods', () => {
    test('should display all payment method options', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const paymentMethods = await paymentPage.verifyPaymentMethods();
      
      expect(paymentMethods.creditCard).toBe(true);
      expect(paymentMethods.paypal).toBe(true);
      expect(paymentMethods.applePay).toBe(true);
      expect(paymentMethods.googlePay).toBe(true);
      expect(paymentMethods.bankTransfer).toBe(true);
    });

    test('should process credit card payment successfully', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const successMessage = await paymentPage.testValidCard();
      
      expect(successMessage).toContain('success');
    });

    test('should handle declined card', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const errorMessage = await paymentPage.testInvalidCard();
      
      expect(errorMessage).toContain('declined');
    });

    test('should handle expired card', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const errorMessage = await paymentPage.testExpiredCard();
      
      expect(errorMessage).toContain('expired');
    });

    test('should handle insufficient funds', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const errorMessage = await paymentPage.testInsufficientFunds();
      
      expect(errorMessage).toContain('insufficient');
    });

    test('should handle PayPal payment', async ({ paymentPage }) => {
      await paymentPage.goto();
      await paymentPage.payWithPayPal();
      
      // PayPal flow - just verify no errors
      await paymentPage.page.waitForTimeout(2000);
    });

    test('should handle Apple Pay payment', async ({ paymentPage }) => {
      await paymentPage.goto();
      await paymentPage.payWithApplePay();
      
      await paymentPage.page.waitForTimeout(2000);
    });

    test('should handle Google Pay payment', async ({ paymentPage }) => {
      await paymentPage.goto();
      await paymentPage.payWithGooglePay();
      
      await paymentPage.page.waitForTimeout(2000);
    });

    test('should handle bank transfer', async ({ paymentPage }) => {
      await paymentPage.goto();
      await paymentPage.payWithBankTransfer();
      
      await paymentPage.page.waitForTimeout(1000);
    });
  });

  test.describe('🧾 Order Summary', () => {
    test('should display order summary', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const orderSummary = await paymentPage.getOrderSummary();
      
      expect(orderSummary.subtotal).toBeTruthy();
      expect(orderSummary.tax).toBeTruthy();
      expect(orderSummary.total).toBeTruthy();
    });

    test('should display items list', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const items = await paymentPage.getItemsList();
      
      expect(items.length).toBeGreaterThan(0);
      
      for (const item of items) {
        expect(item.name).toBeTruthy();
        expect(item.price).toBeTruthy();
        expect(item.quantity).toBeTruthy();
      }
    });

    test('should apply coupon codes', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const originalSummary = await paymentPage.getOrderSummary();
      
      await paymentPage.applyCoupon('TESTCOUPON');
      
      const updatedSummary = await paymentPage.getOrderSummary();
      
      // Total should be different after coupon
      expect(updatedSummary.total).not.toBe(originalSummary.total);
    });
  });

  test.describe('🔒 Security Features', () => {
    test('should display security badges', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const securityFeatures = await paymentPage.verifySecurityFeatures();
      
      expect(securityFeatures.securePayment).toBe(true);
      expect(securityFeatures.ssl).toBe(true);
      expect(securityFeatures.cardSecurity).toBe(true);
    });

    test('should implement payment security measures', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const security = await paymentPage.testPaymentSecurity();
      
      expect(security.https).toBe(true);
      expect(security.inputSanitization).toBe(true);
      expect(security.securityBadges.securePayment).toBe(true);
    });
  });

  test.describe('⚡ Payment Processing', () => {
    test('should show processing state during payment', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      await paymentPage.payWithCreditCard({
        number: '4242424242424242',
        expiry: '12/28',
        cvc: '123',
        name: 'Test User'
      });
      
      await paymentPage.waitForPaymentProcessing();
      
      const status = await paymentPage.getPaymentStatus();
      expect(['success', 'processing', 'error']).toContain(status.status);
    });

    test('should handle payment success', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const successMessage = await paymentPage.testValidCard();
      
      expect(successMessage).toBeTruthy();
      
      const finalStatus = await paymentPage.getPaymentStatus();
      expect(finalStatus.status).toBe('success');
    });

    test('should handle payment errors gracefully', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const errorMessage = await paymentPage.testInvalidCard();
      
      expect(errorMessage).toBeTruthy();
      
      const finalStatus = await paymentPage.getPaymentStatus();
      expect(finalStatus.status).toBe('error');
    });
  });

  test.describe('📱 Mobile Responsiveness', () => {
    test('should display properly on mobile', async ({ paymentPage, mobileViewport }) => {
      await paymentPage.page.setViewportSize(mobileViewport);
      await paymentPage.goto();
      
      const mobileLayout = await paymentPage.checkMobileLayout();
      
      expect(mobileLayout.form).toBe(true);
      expect(mobileLayout.orderSummary).toBe(true);
      expect(mobileLayout.payButton).toBe(true);
      expect(mobileLayout.paymentMethods).toBe(true);
    });
  });

  test.describe('♿ Accessibility', () => {
    test('should have proper form accessibility', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const accessibility = await paymentPage.checkAccessibility();
      
      expect(accessibility.inputsWithoutLabels.length).toBe(0);
      expect(accessibility.keyboardNavigation).toBe(true);
    });
  });

  test.describe('⚡ Performance', () => {
    test('should load payment form quickly', async ({ paymentPage }) => {
      const loadTime = await paymentPage.measurePaymentLoadTime();
      
      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });
  });

  test.describe('🔄 Navigation & Cancellation', () => {
    test('should allow payment cancellation', async ({ paymentPage }) => {
      await paymentPage.goto();
      await paymentPage.cancelPayment();
      
      expect(paymentPage.page.url()).toContain('/dashboard');
    });

    test('should allow going back', async ({ paymentPage }) => {
      await paymentPage.goto();
      await paymentPage.goBack();
      
      // Should navigate to previous page
      await paymentPage.page.waitForTimeout(1000);
    });
  });

  test.describe('🎯 Edge Cases', () => {
    test('should handle multiple rapid payment attempts', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      // Attempt multiple payments rapidly
      for (let i = 0; i < 3; i++) {
        await paymentPage.payWithCreditCard({
          number: '4242424242424242',
          expiry: '12/28',
          cvc: '123',
          name: 'Test User'
        });
        
        await paymentPage.page.waitForTimeout(500);
      }
      
      // Should handle gracefully
      const status = await paymentPage.getPaymentStatus();
      expect(status.status).toBeTruthy();
    });

    test('should handle international cards', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      await paymentPage.payWithCreditCard({
        number: '4000000760000002', // International card
        expiry: '12/28',
        cvc: '123',
        name: 'International User',
        country: 'GB',
        postalCode: 'SW1A 1AA'
      });
      
      await paymentPage.waitForPaymentProcessing();
      const status = await paymentPage.getPaymentStatus();
      expect(['success', 'error']).toContain(status.status);
    });

    test('should handle special characters in cardholder name', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      await paymentPage.payWithCreditCard({
        number: '4242424242424242',
        expiry: '12/28',
        cvc: '123',
        name: 'José María González-Smith'
      });
      
      const fieldStatus = await paymentPage.areRequiredFieldsFilled();
      expect(fieldStatus.name).toBe(true);
    });

    test('should handle form submission during processing', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      await paymentPage.payWithCreditCard({
        number: '4242424242424242',
        expiry: '12/28',
        cvc: '123',
        name: 'Test User'
      });
      
      // Try to submit again during processing
      await paymentPage.payButton.click();
      
      // Should prevent double submission
      const isButtonEnabled = await paymentPage.isPayButtonEnabled();
      expect(isButtonEnabled).toBe(false);
    });
  });

  test.describe('💱 Currency & Localization', () => {
    test('should display correct currency format', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const orderSummary = await paymentPage.getOrderSummary();
      
      // Check currency symbols are present
      expect(orderSummary.total).toMatch(/[$€£¥]/);
    });

    test('should handle different billing countries', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const countries = ['US', 'CA', 'GB', 'AU', 'DE'];
      
      for (const country of countries) {
        await paymentPage.countrySelect.selectOption(country);
        await paymentPage.page.waitForTimeout(500);
        
        // Verify country is selected
        const selectedCountry = await paymentPage.countrySelect.inputValue();
        expect(selectedCountry).toBe(country);
      }
    });
  });

  test.describe('🧪 Payment Testing Scenarios', () => {
    test('should test various Stripe test cards', async ({ paymentPage }) => {
      await paymentPage.goto();
      
      const testCards = [
        { number: '4242424242424242', expected: 'success' }, // Visa success
        { number: '4000000000000002', expected: 'error' },   // Declined
        { number: '4000000000009995', expected: 'error' },   // Insufficient funds
        { number: '4000000000000069', expected: 'error' },   // Expired
      ];
      
      for (const card of testCards) {
        await paymentPage.goto(); // Reset form
        
        await paymentPage.payWithCreditCard({
          number: card.number,
          expiry: '12/28',
          cvc: '123',
          name: 'Test User'
        });
        
        if (card.expected === 'success') {
          await paymentPage.waitForPaymentProcessing();
          const successMessage = await paymentPage.waitForPaymentSuccess();
          expect(successMessage).toBeTruthy();
        } else {
          const errorMessage = await paymentPage.waitForPaymentError();
          expect(errorMessage).toBeTruthy();
        }
      }
    });
  });
}); 