# Test info

- Name: 💳 Payment-to-Unlock Flow Testing >> 💳 Stripe Payment Integration >> should handle authentication required scenarios
- Location: /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:358:9

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: getByTestId('payment-result')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for getByTestId('payment-result')

    at /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:380:56
```

# Page snapshot

```yaml
- heading "🎉 Content Unlocked!" [level=2]
- paragraph: You now have full access to Premium Brand Identity Package
- heading "Premium Brand Identity Package" [level=1]
- text: Premium Content
- paragraph: Complete brand identity design package with logo, guidelines, and assets
- heading "📁 Project Files" [level=2]
- link "AI Logo Package Vector files, PNG, SVG Download":
  - /url: "#"
- link "📖 Brand Guidelines PDF, 24 pages Download":
  - /url: "#"
- link "🎨 Mockups & Templates PSD, Figma files Download":
  - /url: "#"
- heading "✨ Exclusive Content" [level=2]
- paragraph: This is premium content only available after payment or valid access credentials.
- text: High-resolution logo files (300 DPI) Complete brand guidelines document Color palettes and typography specifications Application mockups and examples Source files and working documents
- heading "💡 Pro Tip" [level=3]
- paragraph: All files are production-ready and include detailed usage instructions. Perfect for immediate implementation or further customization.
- heading "📞 Support & Contact" [level=2]
- heading "Need Help?" [level=3]
- paragraph: Our team is here to help you make the most of your premium content.
- button "Contact Support"
- heading "License Information" [level=3]
- paragraph: Commercial use allowed. Full rights included with purchase. Reselling or redistribution prohibited.
- button "Context7 Docs":
  - img
  - text: Context7 Docs
- button "Open Next.js Dev Tools":
  - img
- alert
```

# Test source

```ts
  280 |     test('should complete successful payment with valid card', async ({ page }) => {
  281 |       await createPaymentTestPage(page);
  282 |       
  283 |       // Fill out payment form
  284 |       await page.getByTestId('email-input').fill(TEST_USER.email);
  285 |       
  286 |       // Enable console logging to see test mode detection
  287 |       page.on('console', msg => {
  288 |         if (msg.text().includes('🧪 Payment Debug')) {
  289 |           console.log('Browser Console:', msg.text());
  290 |         }
  291 |       });
  292 |       
  293 |       // Set test mode flag explicitly
  294 |       await page.evaluate(() => {
  295 |         (window as any).isPlaywrightTest = true;
  296 |       });
  297 |       
  298 |       // Simulate successful payment
  299 |       await page.getByTestId('submit-payment-btn').click();
  300 |       
  301 |       // Verify payment processing state
  302 |       await expect(page.getByTestId('submit-payment-btn')).toHaveText('Processing...');
  303 |       await expect(page.getByTestId('submit-payment-btn')).toBeDisabled();
  304 |       
  305 |       // Wait for payment success
  306 |       await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
  307 |       await expect(page.getByTestId('payment-success')).toContainText('Payment successful');
  308 |       
  309 |       // Verify redirect to unlocked content
  310 |       await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 15000 });
  311 |     });
  312 |
  313 |     test('should handle payment failure with declined card', async ({ page }) => {
  314 |       await createPaymentTestPage(page);
  315 |       
  316 |       // Fill form with email
  317 |       await page.getByTestId('email-input').fill(TEST_USER.email);
  318 |       
  319 |       // Set test mode and mock decline flags
  320 |       await page.evaluate(() => {
  321 |         (window as any).isPlaywrightTest = true;
  322 |         (window as any).mockStripeDecline = true;
  323 |       });
  324 |       
  325 |       // Mock a complete card element to bypass validation
  326 |       await page.evaluate(() => {
  327 |         // Override the CardElement to simulate it being complete
  328 |         if (window.stripe && window.elements) {
  329 |           const originalGetElement = window.elements.getElement;
  330 |           window.elements.getElement = () => ({
  331 |             mount: () => {},
  332 |             unmount: () => {},
  333 |             on: () => {},
  334 |             off: () => {},
  335 |             update: () => {},
  336 |             focus: () => {},
  337 |             blur: () => {},
  338 |             clear: () => {},
  339 |             destroy: () => {},
  340 |             // Mock that the element is complete and valid
  341 |             _complete: true,
  342 |             _error: null
  343 |           });
  344 |         }
  345 |       });
  346 |       
  347 |       await page.getByTestId('submit-payment-btn').click();
  348 |       
  349 |       // Wait for and verify error message (test mode should show decline message)
  350 |       await expect(page.getByTestId('card-errors')).toBeVisible({ timeout: 10000 });
  351 |       await expect(page.getByTestId('card-errors')).toContainText('Your card was declined.');
  352 |       
  353 |       // Verify button is re-enabled for retry
  354 |       await expect(page.getByTestId('submit-payment-btn')).toBeEnabled();
  355 |       await expect(page.getByTestId('submit-payment-btn')).toContainText('Complete Payment');
  356 |     });
  357 |
  358 |     test('should handle authentication required scenarios', async ({ page }) => {
  359 |       await createPaymentTestPage(page);
  360 |       
  361 |       await page.getByTestId('email-input').fill(TEST_USER.email);
  362 |       
  363 |       // Mock 3D Secure authentication required
  364 |       await page.route('**/api/payment/confirm', async (route) => {
  365 |         await route.fulfill({
  366 |           status: 200,
  367 |           contentType: 'application/json',
  368 |           body: JSON.stringify({
  369 |             status: 'requires_action',
  370 |             clientSecret: 'pi_test_auth_secret',
  371 |             requiresAction: true
  372 |           })
  373 |         });
  374 |       });
  375 |       
  376 |       await page.getByTestId('submit-payment-btn').click();
  377 |       
  378 |       // In a real scenario, this would trigger 3D Secure modal
  379 |       // For testing, we verify the authentication flow is initiated
> 380 |       await expect(page.getByTestId('payment-result')).toBeVisible({ timeout: 10000 });
      |                                                        ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  381 |     });
  382 |
  383 |     test('should validate required payment form fields', async ({ page }) => {
  384 |       await createPaymentTestPage(page);
  385 |       
  386 |       // Try to submit without email
  387 |       await page.getByTestId('submit-payment-btn').click();
  388 |       
  389 |       // Check HTML5 validation
  390 |       const emailInput = page.getByTestId('email-input');
  391 |       const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  392 |       expect(validationMessage).toBeTruthy();
  393 |       
  394 |       // Fill email and verify it's accepted
  395 |       await emailInput.fill(TEST_USER.email);
  396 |       const updatedValidationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  397 |       expect(updatedValidationMessage).toBe('');
  398 |     });
  399 |   });
  400 |
  401 |   test.describe('🔓 Content Unlocking After Payment', () => {
  402 |     test('should unlock and display premium content after successful payment', async ({ page }) => {
  403 |       // Start with payment page
  404 |       await createPaymentTestPage(page);
  405 |       
  406 |       // Complete payment
  407 |       await page.getByTestId('email-input').fill(TEST_USER.email);
  408 |       await page.getByTestId('submit-payment-btn').click();
  409 |       
  410 |       // Wait for redirect to unlocked content
  411 |       await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 15000 });
  412 |       
  413 |       // Create and verify unlocked content page
  414 |       await createUnlockedContentPage(page);
  415 |       
  416 |       // Verify success message and premium content
  417 |       await expect(page.getByTestId('unlock-success')).toBeVisible();
  418 |       await expect(page.getByTestId('unlock-success')).toContainText('Content Unlocked!');
  419 |       
  420 |       // Verify premium content is accessible
  421 |       await expect(page.getByTestId('premium-content')).toBeVisible();
  422 |       await expect(page.getByTestId('premium-badge')).toBeVisible();
  423 |       
  424 |       // Verify download links are present
  425 |       await expect(page.getByTestId('download-logo')).toBeVisible();
  426 |       await expect(page.getByTestId('download-guidelines')).toBeVisible();
  427 |       await expect(page.getByTestId('download-mockups')).toBeVisible();
  428 |       
  429 |       // Verify exclusive content is shown
  430 |       await expect(page.getByTestId('exclusive-content')).toBeVisible();
  431 |       await expect(page.getByTestId('exclusive-content')).toContainText('premium content only available after payment');
  432 |     });
  433 |
  434 |     test('should maintain access across browser sessions after payment', async ({ page, context }) => {
  435 |       // Simulate payment completion and set access token in storage
  436 |       await page.goto('/');
  437 |       await page.evaluate((projectId) => {
  438 |         localStorage.setItem(`project_access_${projectId}`, JSON.stringify({
  439 |           accessToken: 'access_token_123',
  440 |           expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  441 |           projectId: projectId
  442 |         }));
  443 |       }, TEST_PROJECT.id);
  444 |       
  445 |       // Navigate to unlocked content
  446 |       await createUnlockedContentPage(page);
  447 |       
  448 |       // Verify content is accessible
  449 |       await expect(page.getByTestId('premium-content')).toBeVisible();
  450 |       
  451 |       // Open new tab to simulate session continuity
  452 |       const newPage = await context.newPage();
  453 |       await newPage.goto(`/projects/${TEST_PROJECT.slug}/unlocked`);
  454 |       
  455 |       // Should still have access
  456 |       await expect(newPage.getByTestId('premium-content')).toBeVisible();
  457 |     });
  458 |
  459 |     test('should handle concurrent access attempts gracefully', async ({ page, context }) => {
  460 |       // Open multiple tabs and attempt payment simultaneously
  461 |       const page2 = await context.newPage();
  462 |       const page3 = await context.newPage();
  463 |       
  464 |       // All tabs start payment flow
  465 |       await Promise.all([
  466 |         createPaymentTestPage(page),
  467 |         createPaymentTestPage(page2), 
  468 |         createPaymentTestPage(page3)
  469 |       ]);
  470 |       
  471 |       // Fill forms in all tabs
  472 |       await Promise.all([
  473 |         page.getByTestId('email-input').fill(TEST_USER.email),
  474 |         page2.getByTestId('email-input').fill(TEST_USER.email),
  475 |         page3.getByTestId('email-input').fill(TEST_USER.email)
  476 |       ]);
  477 |       
  478 |       // Submit payment from first tab
  479 |       await page.getByTestId('submit-payment-btn').click();
  480 |       await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
```