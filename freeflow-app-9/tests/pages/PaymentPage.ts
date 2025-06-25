import { Page, expect } from '@playwright/test';

export class PaymentPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/payment');
  }

  async verifyPaymentForm() {
    await expect(this.page.locator('[data-testid="payment-form"]')).toBeVisible();
    return {
      cardNumber: await this.page.locator('[data-testid="card-number"]'),
      cardExpiry: await this.page.locator('[data-testid="card-expiry"]'),
      cardCvc: await this.page.locator('[data-testid="card-cvc"]'),
      submitButton: await this.page.locator('[data-testid="submit-payment"]')
    };
  }

  async testCardValidation(cardNumber: string) {
    await this.page.fill('[data-testid="card-number"]', cardNumber);
    await this.page.click('[data-testid="submit-payment"]');
    return await this.page.locator('[data-testid="card-error"]').textContent();
  }

  async verifyPaymentMethods() {
    await expect(this.page.locator('[data-testid="payment-methods"]')).toBeVisible();
    return await this.page.locator('[data-testid="payment-method-option"]').all();
  }

  async payWithCreditCard(cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }) {
    await this.page.fill('[data-testid="card-number"]', cardDetails.number);
    await this.page.fill('[data-testid="card-expiry"]', cardDetails.expiry);
    await this.page.fill('[data-testid="card-cvc"]', cardDetails.cvc);
    await this.page.fill('[data-testid="cardholder-name"]', cardDetails.name);
    await this.page.click('[data-testid="submit-payment"]');
  }

  async testValidCard() {
    await this.payWithCreditCard({
      number: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User'
    });
    return await this.page.locator('[data-testid="success-message"]').textContent();
  }

  async testInvalidCard() {
    await this.payWithCreditCard({
      number: '4000000000000002',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User'
    });
    return await this.page.locator('[data-testid="error-message"]').textContent();
  }

  async getOrderSummary() {
    await expect(this.page.locator('[data-testid="order-summary"]')).toBeVisible();
    return {
      total: await this.page.locator('[data-testid="order-total"]').textContent(),
      items: await this.page.locator('[data-testid="order-item"]').all()
    };
  }

  async checkAccessibility() {
    const form = await this.page.locator('form');
    const inputs = await this.page.locator('input').all();
    const labels = await this.page.locator('label').all();
    
    return {
      form,
      inputs,
      labels,
      hasRequiredFields: await this.page.locator('[required]').count() > 0
    };
  }

  async measurePaymentLoadTime() {
    const startTime = Date.now();
    await this.goto();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async cancelPayment() {
    await this.page.click('[data-testid="cancel-payment"]');
  }

  async goBack() {
    await this.page.click('[data-testid="back-button"]');
  }
} 