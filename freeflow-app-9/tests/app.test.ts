import { test } from './fixtures/test-fixtures';
import { expect } from '@playwright/test';

test.describe('Application Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await expect(page).toHaveTitle(/Freeflow/);
  });

  test('dashboard loads successfully', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const elements = await dashboardPage.verifyDashboardLoaded();
    
    await expect(elements.sidebar).toBeVisible();
    await expect(elements.header).toBeVisible();
    await expect(elements.mainContent).toBeVisible();
  });

  test('landing page sections render correctly', async ({ landingPage }) => {
    await landingPage.goto();
    
    const heroElements = await landingPage.verifyHeroSection();
    await expect(heroElements.title).toBeVisible();
    await expect(heroElements.subtitle).toBeVisible();
    await expect(heroElements.cta).toBeVisible();

    const featuresElements = await landingPage.verifyFeaturesSection();
    await expect(featuresElements.title).toBeVisible();
    expect(featuresElements.cards.length).toBeGreaterThan(0);

    const pricingElements = await landingPage.verifyPricingSection();
    await expect(pricingElements.title).toBeVisible();
    expect(pricingElements.plans.length).toBeGreaterThan(0);
  });

  test('payment form works correctly', async ({ paymentPage }) => {
    await paymentPage.goto();
    
    const formElements = await paymentPage.verifyPaymentForm();
    await expect(formElements.cardNumber).toBeVisible();
    await expect(formElements.cardExpiry).toBeVisible();
    await expect(formElements.cardCvc).toBeVisible();
    await expect(formElements.submitButton).toBeVisible();

    // Test card validation
    const errorMessage = await paymentPage.testCardValidation('4242');
    expect(errorMessage).toBeTruthy();

    // Test successful payment
    const successMessage = await paymentPage.testValidCard();
    expect(successMessage).toBeTruthy();
  });

  test('projects hub renders correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/projects');
    
    // Check if the projects hub title is visible
    await expect(page.locator('text=Projects Hub')).toBeVisible();
    
    // Check if the create project button exists
    await expect(page.locator('[data-testid="create-project-btn"]')).toBeVisible();
    
    // Check if the import project button exists
    await expect(page.locator('[data-testid="import-project-btn"]')).toBeVisible();
    
    // Check if the quick start button exists
    await expect(page.locator('[data-testid="quick-start-btn"]')).toBeVisible();
  });
}); 