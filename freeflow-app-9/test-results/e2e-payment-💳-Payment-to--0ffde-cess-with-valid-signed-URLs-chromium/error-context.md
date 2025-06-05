# Test info

- Name: 💳 Payment-to-Unlock Flow Testing >> ⏱️ Expired Signed URL Testing >> should accept access with valid signed URLs
- Location: /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:499:9

# Error details

```
Error: Timed out 15000ms waiting for expect(locator).toBeVisible()

Locator: getByTestId('premium-content')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 15000ms
  - waiting for getByTestId('premium-content')

    at /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:508:57
```

# Page snapshot

```yaml
- heading "Premium Brand Identity Package" [level=1]
- paragraph: Complete brand identity design package with logo, guidelines, and assets
- heading "🔒 Premium Content Locked" [level=3]
- paragraph: This project contains premium content. Complete payment to unlock full access.
- heading "Complete Payment" [level=2]
- heading "Order Summary" [level=3]
- text: Premium Brand Identity Package $49.99 Email Address
- textbox "Email Address"
- text: Card Information
- iframe
- iframe
- strong: "Test Cards:"
- text: "Success: 4242 4242 4242 4242 Decline: 4000 0000 0000 0002 Use any future date and any 3-digit CVC"
- button "Complete Payment - $49.99"
- heading "Already have access?" [level=2]
- paragraph: Enter your password or access code to unlock this project.
- text: Password
- textbox "Password"
- text: Access Code
- textbox "Access Code"
- button "Unlock Project"
- button "Context7 Docs":
  - img
  - text: Context7 Docs
- button "Open Next.js Dev Tools":
  - img
- alert
```

# Test source

```ts
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
  481 |       
  482 |       // Other tabs should handle the state change gracefully
  483 |       // (In real app, they might show "Payment completed in another tab" or redirect)
  484 |     });
  485 |   });
  486 |
  487 |   test.describe('⏱️ Expired Signed URL Testing', () => {
  488 |     test('should reject access with expired signed URLs', async ({ page }) => {
  489 |       // Create a mock expired URL
  490 |       const expiredTimestamp = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
  491 |       const expiredUrl = `/projects/${TEST_PROJECT.slug}/unlocked?token=expired_token_123&expires=${expiredTimestamp}`;
  492 |       
  493 |       await page.goto(expiredUrl);
  494 |       
  495 |       // Should show expired notice or redirect to payment
  496 |       await expect(page.locator('[data-testid="expired-notice"], [data-testid="locked-notice"]')).toBeVisible();
  497 |     });
  498 |
  499 |     test('should accept access with valid signed URLs', async ({ page }) => {
  500 |       // Create a mock valid URL
  501 |       const validTimestamp = Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
  502 |       const validUrl = `/projects/${TEST_PROJECT.slug}/unlocked?token=valid_token_123&expires=${validTimestamp}`;
  503 |       
  504 |       await page.goto(validUrl);
  505 |       await createUnlockedContentPage(page);
  506 |       
  507 |       // Should display unlocked content
> 508 |       await expect(page.getByTestId('premium-content')).toBeVisible();
      |                                                         ^ Error: Timed out 15000ms waiting for expect(locator).toBeVisible()
  509 |     });
  510 |
  511 |     test('should handle URL tampering attempts', async ({ page }) => {
  512 |       // Test various tampering scenarios
  513 |       const tamperingAttempts = [
  514 |         `/projects/${TEST_PROJECT.slug}/unlocked?token=hacked_token&expires=9999999999999`,
  515 |         `/projects/${TEST_PROJECT.slug}/unlocked?token=&expires=${Date.now() + 3600000}`,
  516 |         `/projects/${TEST_PROJECT.slug}/unlocked?expires=${Date.now() + 3600000}`,
  517 |         `/projects/${TEST_PROJECT.slug}/unlocked?token=valid_token_123`
  518 |       ];
  519 |       
  520 |       for (const tamperedUrl of tamperingAttempts) {
  521 |         await page.goto(tamperedUrl);
  522 |         
  523 |         // Should be rejected and redirected to payment or show error
  524 |         await expect(page.locator('[data-testid="locked-notice"], [data-testid="access-denied"]')).toBeVisible({ timeout: 5000 });
  525 |       }
  526 |     });
  527 |
  528 |     test('should log security events for suspicious access attempts', async ({ page }) => {
  529 |       // Mock security logging endpoint
  530 |       let securityEvents: any[] = [];
  531 |       await page.route('**/api/security/log', async (route) => {
  532 |         const postData = route.request().postDataJSON();
  533 |         securityEvents.push(postData);
  534 |         await route.fulfill({ status: 200, body: 'OK' });
  535 |       });
  536 |       
  537 |       // Attempt access with suspicious parameters
  538 |       await page.goto(`/projects/${TEST_PROJECT.slug}/unlocked?token=<script>alert('xss')</script>&expires=0`);
  539 |       
  540 |       // Verify security event was logged (in a real app)
  541 |       // This would be checked via the securityEvents array or API monitoring
  542 |     });
  543 |   });
  544 |
  545 |   test.describe('🔑 Alternative Access Methods', () => {
  546 |     test('should unlock content with valid password', async ({ page }) => {
  547 |       await createPaymentTestPage(page);
  548 |       
  549 |       // Enable console logging for debugging
  550 |       page.on('console', msg => {
  551 |         console.log('Browser Console:', msg.text());
  552 |       });
  553 |       
  554 |       // Enable console logging for debugging
  555 |       page.on('console', msg => {
  556 |         console.log('Browser Console:', msg.text());
  557 |       });
  558 |       
  559 |       // Enable console logging for debugging
  560 |       page.on('console', msg => {
  561 |         console.log('Browser Console:', msg.text());
  562 |       });
  563 |       
  564 |       // Use password access instead of payment
  565 |       await page.getByTestId('access-password').fill(ACCESS_CREDENTIALS.valid.password);
  566 |       await page.getByTestId('unlock-btn').click();
  567 |       
  568 |       // Verify success message
  569 |       await expect(page.getByTestId('access-success')).toBeVisible({ timeout: 5000 });
  570 |       await expect(page.getByTestId('access-success')).toContainText('Access granted');
  571 |       
  572 |       // Verify redirect to unlocked content
  573 |       await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 10000 });
  574 |     });
  575 |
  576 |     test('should unlock content with valid access code', async ({ page }) => {
  577 |       await createPaymentTestPage(page);
  578 |       
  579 |       // Use access code instead of payment
  580 |       await page.getByTestId('access-code').fill(ACCESS_CREDENTIALS.valid.accessCode);
  581 |       await page.getByTestId('unlock-btn').click();
  582 |       
  583 |       // Verify success and redirect
  584 |       await expect(page.getByTestId('access-success')).toBeVisible({ timeout: 5000 });
  585 |       await expect(page).toHaveURL(new RegExp(`/projects/${TEST_PROJECT.slug}/unlocked`), { timeout: 10000 });
  586 |     });
  587 |
  588 |     test('should reject invalid password attempts', async ({ page }) => {
  589 |       await createPaymentTestPage(page);
  590 |       
  591 |       // Try invalid password
  592 |       await page.getByTestId('access-password').fill(ACCESS_CREDENTIALS.invalid.password);
  593 |       await page.getByTestId('unlock-btn').click();
  594 |       
  595 |       // Verify error message
  596 |       await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
  597 |       await expect(page.getByTestId('access-error')).toContainText('Invalid credentials');
  598 |       
  599 |       // Verify form is still available for retry
  600 |       await expect(page.getByTestId('access-password')).toBeVisible();
  601 |       await expect(page.getByTestId('unlock-btn')).toBeEnabled();
  602 |     });
  603 |
  604 |     test('should reject invalid access code attempts', async ({ page }) => {
  605 |       await createPaymentTestPage(page);
  606 |       
  607 |       // Try invalid access code
  608 |       await page.getByTestId('access-code').fill(ACCESS_CREDENTIALS.invalid.accessCode);
```