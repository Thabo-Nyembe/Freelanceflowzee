import { Page, expect } from &apos;@playwright/test&apos;;

export class PaymentPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(&apos;/payment&apos;);
  }

  async verifyPaymentForm() {
    await expect(this.page.locator(&apos;[data-testid=&quot;payment-form&quot;]&apos;)).toBeVisible();
    return {
      cardNumber: await this.page.locator(&apos;[data-testid=&quot;card-number&quot;]&apos;),
      cardExpiry: await this.page.locator(&apos;[data-testid=&quot;card-expiry&quot;]&apos;),
      cardCvc: await this.page.locator(&apos;[data-testid=&quot;card-cvc&quot;]&apos;),
      submitButton: await this.page.locator(&apos;[data-testid=&quot;submit-payment&quot;]&apos;)
    };
  }

  async testCardValidation(cardNumber: string) {
    await this.page.fill(&apos;[data-testid=&quot;card-number&quot;]&apos;, cardNumber);
    await this.page.click(&apos;[data-testid=&quot;submit-payment&quot;]&apos;);
    return await this.page.locator(&apos;[data-testid=&quot;card-error&quot;]&apos;).textContent();
  }

  async verifyPaymentMethods() {
    await expect(this.page.locator(&apos;[data-testid=&quot;payment-methods&quot;]&apos;)).toBeVisible();
    return await this.page.locator(&apos;[data-testid=&quot;payment-method-option&quot;]&apos;).all();
  }

  async payWithCreditCard(cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }) {
    await this.page.fill(&apos;[data-testid=&quot;card-number&quot;]&apos;, cardDetails.number);
    await this.page.fill(&apos;[data-testid=&quot;card-expiry&quot;]&apos;, cardDetails.expiry);
    await this.page.fill(&apos;[data-testid=&quot;card-cvc&quot;]&apos;, cardDetails.cvc);
    await this.page.fill(&apos;[data-testid=&quot;cardholder-name&quot;]&apos;, cardDetails.name);
    await this.page.click(&apos;[data-testid=&quot;submit-payment&quot;]&apos;);
  }

  async testValidCard() {
    await this.payWithCreditCard({
      number: &apos;4242424242424242&apos;,
      expiry: &apos;12/25&apos;,
      cvc: &apos;123&apos;,
      name: &apos;Test User&apos;
    });
    return await this.page.locator(&apos;[data-testid=&quot;success-message&quot;]&apos;).textContent();
  }

  async testInvalidCard() {
    await this.payWithCreditCard({
      number: &apos;4000000000000002&apos;,
      expiry: &apos;12/25&apos;,
      cvc: &apos;123&apos;,
      name: &apos;Test User&apos;
    });
    return await this.page.locator(&apos;[data-testid=&quot;error-message&quot;]&apos;).textContent();
  }

  async getOrderSummary() {
    await expect(this.page.locator(&apos;[data-testid=&quot;order-summary&quot;]&apos;)).toBeVisible();
    return {
      total: await this.page.locator(&apos;[data-testid=&quot;order-total&quot;]&apos;).textContent(),
      items: await this.page.locator(&apos;[data-testid=&quot;order-item&quot;]&apos;).all()
    };
  }

  async checkAccessibility() {
    const form = await this.page.locator(&apos;form&apos;);
    const inputs = await this.page.locator(&apos;input&apos;).all();
    const labels = await this.page.locator(&apos;label&apos;).all();
    
    return {
      form,
      inputs,
      labels,
      hasRequiredFields: await this.page.locator(&apos;[required]&apos;).count() > 0
    };
  }

  async measurePaymentLoadTime() {
    const startTime = Date.now();
    await this.goto();
    await this.page.waitForLoadState(&apos;networkidle&apos;);
    return Date.now() - startTime;
  }

  async cancelPayment() {
    await this.page.click(&apos;[data-testid=&quot;cancel-payment&quot;]&apos;);
  }

  async goBack() {
    await this.page.click(&apos;[data-testid=&quot;back-button&quot;]&apos;);
  }
} 