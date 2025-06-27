import type { Page, Locator } from &apos;@playwright/test&apos;;

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
    this.paymentForm = page.locator(&apos;[data-testid=&quot;payment-form&quot;]&apos;);
    this.cardNumberInput = page.getByLabel(&apos;Card number&apos;);
    this.expiryDateInput = page.getByLabel(&apos;Expiry date&apos;);
    this.cvcInput = page.getByLabel(&apos;CVC&apos;);
    this.cardholderNameInput = page.getByLabel(&apos;Cardholder name&apos;);
    this.billingAddressSection = page.locator(&apos;[data-testid=&quot;billing-address&quot;]&apos;);
    this.countrySelect = page.getByLabel(&apos;Country&apos;);
    this.postalCodeInput = page.getByLabel(&apos;Postal code&apos;);

    // Payment buttons
    this.payButton = page.getByRole(&apos;button&apos;, { name: &apos;Pay Now&apos; });
    this.cancelButton = page.getByRole(&apos;button&apos;, { name: &apos;Cancel&apos; });
    this.backButton = page.getByRole(&apos;button&apos;, { name: &apos;Back&apos; });

    // Payment methods
    this.creditCardTab = page.getByRole(&apos;tab&apos;, { name: &apos;Credit Card&apos; });
    this.paypalButton = page.getByRole(&apos;button&apos;, { name: &apos;PayPal&apos; });
    this.applePayButton = page.getByRole(&apos;button&apos;, { name: &apos;Apple Pay&apos; });
    this.googlePayButton = page.getByRole(&apos;button&apos;, { name: &apos;Google Pay&apos; });
    this.bankTransferOption = page.getByRole(&apos;radio&apos;, { name: &apos;Bank Transfer&apos; });

    // Order summary
    this.orderSummary = page.locator(&apos;[data-testid=&quot;order-summary&quot;]&apos;);
    this.itemsList = page.locator(&apos;[data-testid=&quot;items-list&quot;]&apos;);
    this.subtotalAmount = page.locator(&apos;[data-testid=&quot;subtotal&quot;]&apos;);
    this.taxAmount = page.locator(&apos;[data-testid=&quot;tax&quot;]&apos;);
    this.totalAmount = page.locator(&apos;[data-testid=&quot;total&quot;]&apos;);
    this.discountSection = page.locator(&apos;[data-testid=&quot;discount-section&quot;]&apos;);
    this.couponInput = page.getByLabel(&apos;Coupon code&apos;);
    this.applyCouponButton = page.getByRole(&apos;button&apos;, { name: &apos;Apply&apos; });

    // Success/Error states
    this.successMessage = page.locator(&apos;[data-testid=&quot;success-message&quot;]&apos;);
    this.errorMessage = page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;);
    this.processingSpinner = page.locator(&apos;[data-testid=&quot;processing-spinner&quot;]&apos;);
    this.paymentStatusIcon = page.locator(&apos;[data-testid=&quot;payment-status&quot;]&apos;);

    // Security elements
    this.securePaymentBadge = page.locator(&apos;[data-testid=&quot;secure-payment&quot;]&apos;);
    this.sslCertificate = page.locator(&apos;[data-testid=&quot;ssl-certificate&quot;]&apos;);
    this.cardSecurityInfo = page.locator(&apos;[data-testid=&quot;card-security&quot;]&apos;);
  }

  async goto() {
    await this.page.goto(&apos;/payment&apos;);
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    await this.paymentForm.waitFor({ state: &apos;visible&apos; });
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
    const items = await this.itemsList.locator(&apos;[data-testid=&quot;order-item&quot;]&apos;).all();
    const itemData = [];
    
    for (const item of items) {
      const name = await item.locator(&apos;[data-testid=&quot;item-name&quot;]&apos;).textContent();
      const price = await item.locator(&apos;[data-testid=&quot;item-price&quot;]&apos;).textContent();
      const quantity = await item.locator(&apos;[data-testid=&quot;item-quantity&quot;]&apos;).textContent();
      
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
    await this.processingSpinner.waitFor({ state: &apos;visible&apos; });
    // Wait for processing to complete
    await this.processingSpinner.waitFor({ state: &apos;hidden&apos;, timeout: 30000 });
  }

  async waitForPaymentSuccess() {
    await this.successMessage.waitFor({ state: &apos;visible&apos; });
    return await this.successMessage.textContent();
  }

  async waitForPaymentError() {
    await this.errorMessage.waitFor({ state: &apos;visible&apos; });
    return await this.errorMessage.textContent();
  }

  async getPaymentStatus() {
    if (await this.successMessage.isVisible()) {
      return { status: &apos;success&apos;, message: await this.successMessage.textContent() };
    }
    
    if (await this.errorMessage.isVisible()) {
      return { status: &apos;error&apos;, message: await this.errorMessage.textContent() };
    }
    
    if (await this.processingSpinner.isVisible()) {
      return { status: &apos;processing&apos;, message: &apos;Payment is being processed...&apos; };
    }
    
    return { status: &apos;pending&apos;, message: &apos;Ready for payment&apos; };
  }

  // Form validation
  async testCardValidation(cardNumber: string) {
    await this.cardNumberInput.fill(cardNumber);
    await this.cardNumberInput.blur();
    
    const validation = this.page.locator(&apos;[data-testid=&quot;card-validation&quot;]&apos;);
    if (await validation.isVisible()) {
      return await validation.textContent();
    }
    return null;
  }

  async isPayButtonEnabled() {
    return await this.payButton.isEnabled();
  }

  async areRequiredFieldsFilled() {
    const cardFilled = await this.cardNumberInput.inputValue() !== '&apos;;
    const expiryFilled = await this.expiryDateInput.inputValue() !== '&apos;;
    const cvcFilled = await this.cvcInput.inputValue() !== '&apos;;
    const nameFilled = await this.cardholderNameInput.inputValue() !== '&apos;;
    
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
      number: &apos;4000000000000002&apos;, // Declined card
      expiry: &apos;12/28&apos;,
      cvc: &apos;123&apos;,
      name: &apos;Test User&apos;
    });
    
    return await this.waitForPaymentError();
  }

  async testExpiredCard() {
    await this.payWithCreditCard({
      number: &apos;4000000000000069&apos;, // Expired card
      expiry: &apos;12/20&apos;,
      cvc: &apos;123&apos;,
      name: &apos;Test User&apos;
    });
    
    return await this.waitForPaymentError();
  }

  async testInsufficientFunds() {
    await this.payWithCreditCard({
      number: &apos;4000000000009995&apos;, // Insufficient funds
      expiry: &apos;12/28&apos;,
      cvc: &apos;123&apos;,
      name: &apos;Test User&apos;
    });
    
    return await this.waitForPaymentError();
  }

  async testValidCard() {
    await this.payWithCreditCard({
      number: &apos;4242424242424242&apos;, // Valid test card
      expiry: &apos;12/28&apos;,
      cvc: &apos;123&apos;,
      name: &apos;Test User&apos;,
      country: &apos;US&apos;,
      postalCode: &apos;12345&apos;
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
    const isHTTPS = url.startsWith(&apos;https://&apos;);
    
    // Check for security badges
    const securityFeatures = await this.verifySecurityFeatures();
    
    // Check for input sanitization
    const xssTest = &apos;<script>alert(&quot;XSS&quot;)</script>&apos;;
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
    await this.page.waitForURL(&apos;**/dashboard&apos;);
  }

  async goBack() {
    await this.backButton.click();
  }

  // Accessibility testing
  async checkAccessibility() {
    // Check for proper labels
    const inputs = await this.paymentForm.locator(&apos;input&apos;).all();
    const inputsWithoutLabels = [];
    
    for (const input of inputs) {
      const id = await input.getAttribute(&apos;id&apos;);
      const ariaLabel = await input.getAttribute(&apos;aria-label&apos;);
      const label = this.page.locator(`label[for=&quot;${id}&quot;]`);
      
      if (!ariaLabel && !(await label.isVisible())) {
        inputsWithoutLabels.push(id);
      }
    }
    
    // Check for keyboard navigation
    await this.cardNumberInput.focus();
    await this.page.keyboard.press(&apos;Tab&apos;);
    const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    
    return {
      inputsWithoutLabels,
      keyboardNavigation: focusedElement === &apos;INPUT&apos;
    };
  }
} 