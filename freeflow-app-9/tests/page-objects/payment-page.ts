import type { Page, Locator } from '@playwright/test';

export class PaymentPage {
  readonly page: Page;
  
  // Payment form elements
  readonly paymentForm: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryDateInput: Locator;
  readonly cvcInput: Locator;
  readonly cardholderNameInput: Locator;
  readonly billingAddressSection: Locator;
  readonly countrySelect: Locator;
  readonly postalCodeInput: Locator;

  // Payment buttons
  readonly payButton: Locator;
  readonly cancelButton: Locator;
  readonly backButton: Locator;

  // Payment methods
  readonly creditCardTab: Locator;
  readonly paypalButton: Locator;
  readonly applePayButton: Locator;
  readonly googlePayButton: Locator;
  readonly bankTransferOption: Locator;

  // Order summary
  readonly orderSummary: Locator;
  readonly itemsList: Locator;
  readonly subtotalAmount: Locator;
  readonly taxAmount: Locator;
  readonly totalAmount: Locator;
  readonly discountSection: Locator;
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;

  // Success/Error states
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly processingSpinner: Locator;
  readonly paymentStatusIcon: Locator;

  // Security elements
  readonly securePaymentBadge: Locator;
  readonly sslCertificate: Locator;
  readonly cardSecurityInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Payment form elements
    this.paymentForm = page.locator('[data-testid="payment-form"]');
    this.cardNumberInput = page.getByLabel('Card number');
    this.expiryDateInput = page.getByLabel('Expiry date');
    this.cvcInput = page.getByLabel('CVC');
    this.cardholderNameInput = page.getByLabel('Cardholder name');
    this.billingAddressSection = page.locator('[data-testid="billing-address"]');
    this.countrySelect = page.getByLabel('Country');
    this.postalCodeInput = page.getByLabel('Postal code');

    // Payment buttons
    this.payButton = page.getByRole('button', { name: 'Pay Now' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.backButton = page.getByRole('button', { name: 'Back' });

    // Payment methods
    this.creditCardTab = page.getByRole('tab', { name: 'Credit Card' });
    this.paypalButton = page.getByRole('button', { name: 'PayPal' });
    this.applePayButton = page.getByRole('button', { name: 'Apple Pay' });
    this.googlePayButton = page.getByRole('button', { name: 'Google Pay' });
    this.bankTransferOption = page.getByRole('radio', { name: 'Bank Transfer' });

    // Order summary
    this.orderSummary = page.locator('[data-testid="order-summary"]');
    this.itemsList = page.locator('[data-testid="items-list"]');
    this.subtotalAmount = page.locator('[data-testid="subtotal"]');
    this.taxAmount = page.locator('[data-testid="tax"]');
    this.totalAmount = page.locator('[data-testid="total"]');
    this.discountSection = page.locator('[data-testid="discount-section"]');
    this.couponInput = page.getByLabel('Coupon code');
    this.applyCouponButton = page.getByRole('button', { name: 'Apply' });

    // Success/Error states
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.processingSpinner = page.locator('[data-testid="processing-spinner"]');
    this.paymentStatusIcon = page.locator('[data-testid="payment-status"]');

    // Security elements
    this.securePaymentBadge = page.locator('[data-testid="secure-payment"]');
    this.sslCertificate = page.locator('[data-testid="ssl-certificate"]');
    this.cardSecurityInfo = page.locator('[data-testid="card-security"]');
  }

  async goto() {
    await this.page.goto('/payment');
    await this.page.waitForLoadState('networkidle');
    await this.paymentForm.waitFor({ state: 'visible' });
  }

  // Payment methods
  async payWithCreditCard(cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
    country?: string;
    postalCode?: string;
  }) {
    await this.creditCardTab.click();
    await this.cardNumberInput.fill(cardDetails.number);
    await this.expiryDateInput.fill(cardDetails.expiry);
    await this.cvcInput.fill(cardDetails.cvc);
    await this.cardholderNameInput.fill(cardDetails.name);
    
    if (cardDetails.country) {
      await this.countrySelect.selectOption(cardDetails.country);
    }
    
    if (cardDetails.postalCode) {
      await this.postalCodeInput.fill(cardDetails.postalCode);
    }
    
    await this.payButton.click();
  }

  async payWithPayPal() {
    await this.paypalButton.click();
    // Handle PayPal redirect/popup
    await this.page.waitForTimeout(2000);
  }

  async payWithApplePay() {
    await this.applePayButton.click();
    // Handle Apple Pay flow
    await this.page.waitForTimeout(2000);
  }

  async payWithGooglePay() {
    await this.googlePayButton.click();
    // Handle Google Pay flow
    await this.page.waitForTimeout(2000);
  }

  async payWithBankTransfer() {
    await this.bankTransferOption.click();
    await this.payButton.click();
  }

  // Order management
  async applyCoupon(couponCode: string) {
    await this.couponInput.fill(couponCode);
    await this.applyCouponButton.click();
    await this.page.waitForTimeout(1000); // Wait for price update
  }

  async getOrderSummary() {
    return {
      subtotal: await this.subtotalAmount.textContent(),
      tax: await this.taxAmount.textContent(),
      total: await this.totalAmount.textContent()
    };
  }

  async getItemsList() {
    const items = await this.itemsList.locator('[data-testid="order-item"]').all();
    const itemData = [];
    
    for (const item of items) {
      const name = await item.locator('[data-testid="item-name"]').textContent();
      const price = await item.locator('[data-testid="item-price"]').textContent();
      const quantity = await item.locator('[data-testid="item-quantity"]').textContent();
      
      itemData.push({ name, price, quantity });
    }
    
    return itemData;
  }

  // Validation and verification
  async verifyPaymentForm() {
    return {
      form: await this.paymentForm.isVisible(),
      cardNumber: await this.cardNumberInput.isVisible(),
      expiry: await this.expiryDateInput.isVisible(),
      cvc: await this.cvcInput.isVisible(),
      name: await this.cardholderNameInput.isVisible(),
      payButton: await this.payButton.isVisible()
    };
  }

  async verifyPaymentMethods() {
    return {
      creditCard: await this.creditCardTab.isVisible(),
      paypal: await this.paypalButton.isVisible(),
      applePay: await this.applePayButton.isVisible(),
      googlePay: await this.googlePayButton.isVisible(),
      bankTransfer: await this.bankTransferOption.isVisible()
    };
  }

  async verifySecurityFeatures() {
    return {
      securePayment: await this.securePaymentBadge.isVisible(),
      ssl: await this.sslCertificate.isVisible(),
      cardSecurity: await this.cardSecurityInfo.isVisible()
    };
  }

  // Payment status handling
  async waitForPaymentProcessing() {
    await this.processingSpinner.waitFor({ state: 'visible' });
    // Wait for processing to complete
    await this.processingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
  }

  async waitForPaymentSuccess() {
    await this.successMessage.waitFor({ state: 'visible' });
    return await this.successMessage.textContent();
  }

  async waitForPaymentError() {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.textContent();
  }

  async getPaymentStatus() {
    if (await this.successMessage.isVisible()) {
      return { status: 'success', message: await this.successMessage.textContent() };
    }
    
    if (await this.errorMessage.isVisible()) {
      return { status: 'error', message: await this.errorMessage.textContent() };
    }
    
    if (await this.processingSpinner.isVisible()) {
      return { status: 'processing', message: 'Payment is being processed...' };
    }
    
    return { status: 'pending', message: 'Ready for payment' };
  }

  // Form validation
  async testCardValidation(cardNumber: string) {
    await this.cardNumberInput.fill(cardNumber);
    await this.cardNumberInput.blur();
    
    const validation = this.page.locator('[data-testid="card-validation"]');
    if (await validation.isVisible()) {
      return await validation.textContent();
    }
    return null;
  }

  async isPayButtonEnabled() {
    return await this.payButton.isEnabled();
  }

  async areRequiredFieldsFilled() {
    const cardFilled = await this.cardNumberInput.inputValue() !== '';
    const expiryFilled = await this.expiryDateInput.inputValue() !== '';
    const cvcFilled = await this.cvcInput.inputValue() !== '';
    const nameFilled = await this.cardholderNameInput.inputValue() !== '';
    
    return {
      card: cardFilled,
      expiry: expiryFilled,
      cvc: cvcFilled,
      name: nameFilled,
      allFilled: cardFilled && expiryFilled && cvcFilled && nameFilled
    };
  }

  // Edge cases and testing
  async testInvalidCard() {
    await this.payWithCreditCard({
      number: '4000000000000002', // Declined card
      expiry: '12/28',
      cvc: '123',
      name: 'Test User'
    });
    
    return await this.waitForPaymentError();
  }

  async testExpiredCard() {
    await this.payWithCreditCard({
      number: '4000000000000069', // Expired card
      expiry: '12/20',
      cvc: '123',
      name: 'Test User'
    });
    
    return await this.waitForPaymentError();
  }

  async testInsufficientFunds() {
    await this.payWithCreditCard({
      number: '4000000000009995', // Insufficient funds
      expiry: '12/28',
      cvc: '123',
      name: 'Test User'
    });
    
    return await this.waitForPaymentError();
  }

  async testValidCard() {
    await this.payWithCreditCard({
      number: '4242424242424242', // Valid test card
      expiry: '12/28',
      cvc: '123',
      name: 'Test User',
      country: 'US',
      postalCode: '12345'
    });
    
    await this.waitForPaymentProcessing();
    return await this.waitForPaymentSuccess();
  }

  // Mobile and responsiveness
  async checkMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 812 });
    await this.page.waitForTimeout(500);
    
    return {
      form: await this.paymentForm.isVisible(),
      orderSummary: await this.orderSummary.isVisible(),
      payButton: await this.payButton.isVisible(),
      paymentMethods: await this.creditCardTab.isVisible()
    };
  }

  // Performance testing
  async measurePaymentLoadTime() {
    const startTime = Date.now();
    await this.goto();
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Security testing
  async testPaymentSecurity() {
    // Check for HTTPS
    const url = this.page.url();
    const isHTTPS = url.startsWith('https://');
    
    // Check for security badges
    const securityFeatures = await this.verifySecurityFeatures();
    
    // Check for input sanitization
    const xssTest = '<script>alert("XSS")</script>';
    await this.cardholderNameInput.fill(xssTest);
    const sanitizedValue = await this.cardholderNameInput.inputValue();
    
    return {
      https: isHTTPS,
      securityBadges: securityFeatures,
      inputSanitization: sanitizedValue !== xssTest
    };
  }

  // Cancel and navigation
  async cancelPayment() {
    await this.cancelButton.click();
    await this.page.waitForURL('**/dashboard');
  }

  async goBack() {
    await this.backButton.click();
  }

  // Accessibility testing
  async checkAccessibility() {
    // Check for proper labels
    const inputs = await this.paymentForm.locator('input').all();
    const inputsWithoutLabels = [];
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const label = this.page.locator(`label[for="${id}"]`);
      
      if (!ariaLabel && !(await label.isVisible())) {
        inputsWithoutLabels.push(id);
      }
    }
    
    // Check for keyboard navigation
    await this.cardNumberInput.focus();
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    
    return {
      inputsWithoutLabels,
      keyboardNavigation: focusedElement === 'INPUT'
    };
  }
} 