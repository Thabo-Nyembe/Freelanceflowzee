import { test } from &apos;./fixtures/test-fixtures&apos;;
import { expect } from &apos;@playwright/test&apos;;

test.describe(&apos;Application Tests&apos;, () => {
  test(&apos;homepage loads successfully&apos;, async ({ page }) => {
    await page.goto(&apos;http://localhost:3001&apos;);
    await expect(page).toHaveTitle(/Freeflow/);
  });

  test(&apos;dashboard loads successfully&apos;, async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const elements = await dashboardPage.verifyDashboardLoaded();
    
    await expect(elements.sidebar).toBeVisible();
    await expect(elements.header).toBeVisible();
    await expect(elements.mainContent).toBeVisible();
  });

  test(&apos;landing page sections render correctly&apos;, async ({ landingPage }) => {
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

  test(&apos;payment form works correctly&apos;, async ({ paymentPage }) => {
    await paymentPage.goto();
    
    const formElements = await paymentPage.verifyPaymentForm();
    await expect(formElements.cardNumber).toBeVisible();
    await expect(formElements.cardExpiry).toBeVisible();
    await expect(formElements.cardCvc).toBeVisible();
    await expect(formElements.submitButton).toBeVisible();

    // Test card validation
    const errorMessage = await paymentPage.testCardValidation(&apos;4242&apos;);
    expect(errorMessage).toBeTruthy();

    // Test successful payment
    const successMessage = await paymentPage.testValidCard();
    expect(successMessage).toBeTruthy();
  });

  test(&apos;projects hub renders correctly&apos;, async ({ page }) => {
    await page.goto(&apos;http://localhost:3001/projects&apos;);
    
    // Check if the projects hub title is visible
    await expect(page.locator(&apos;text=Projects Hub&apos;)).toBeVisible();
    
    // Check if the create project button exists
    await expect(page.locator(&apos;[data-testid=&quot;create-project-btn&quot;]&apos;)).toBeVisible();
    
    // Check if the import project button exists
    await expect(page.locator(&apos;[data-testid=&quot;import-project-btn&quot;]&apos;)).toBeVisible();
    
    // Check if the quick start button exists
    await expect(page.locator(&apos;[data-testid=&quot;quick-start-btn&quot;]&apos;)).toBeVisible();
  });
}); 