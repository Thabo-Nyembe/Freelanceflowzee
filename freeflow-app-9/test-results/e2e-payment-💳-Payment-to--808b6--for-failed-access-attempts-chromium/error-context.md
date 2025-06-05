# Test info

- Name: 💳 Payment-to-Unlock Flow Testing >> 🔑 Alternative Access Methods >> should handle rate limiting for failed access attempts
- Location: /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:627:9

# Error details

```
Error: expect(received).toMatch(expected)

Expected pattern: /(rate limit|too many attempts|temporarily disabled)/
Received string:  "invalid credentials"
    at /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:644:40
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
- strong: "Test Cards:"
- text: "Success: 4242 4242 4242 4242 Decline: 4000 0000 0000 0002 Use any future date and any 3-digit CVC"
- button "Complete Payment - $49.99"
- heading "Already have access?" [level=2]
- paragraph: Enter your password or access code to unlock this project.
- text: Password
- textbox "Password": another-wrong-password
- text: Access Code
- textbox "Access Code"
- text: Invalid credentials
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
  609 |       await page.getByTestId('unlock-btn').click();
  610 |       
  611 |       // Verify error message
  612 |       await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
  613 |       await expect(page.getByTestId('access-error')).toContainText('Invalid credentials');
  614 |     });
  615 |
  616 |     test('should require either password or access code', async ({ page }) => {
  617 |       await createPaymentTestPage(page);
  618 |       
  619 |       // Try to submit without any credentials
  620 |       await page.getByTestId('unlock-btn').click();
  621 |       
  622 |       // Verify validation message
  623 |       await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
  624 |       await expect(page.getByTestId('access-error')).toContainText('Please enter either a password or access code');
  625 |     });
  626 |
  627 |     test('should handle rate limiting for failed access attempts', async ({ page }) => {
  628 |       await createPaymentTestPage(page);
  629 |       
  630 |       // Simulate multiple failed attempts
  631 |       for (let i = 0; i < 5; i++) {
  632 |         await page.getByTestId('access-password').fill(`wrong-password-${i}`);
  633 |         await page.getByTestId('unlock-btn').click();
  634 |         await expect(page.getByTestId('access-error')).toBeVisible({ timeout: 5000 });
  635 |         await page.getByTestId('access-password').clear();
  636 |       }
  637 |       
  638 |       // After multiple failures, should show rate limiting
  639 |       await page.getByTestId('access-password').fill('another-wrong-password');
  640 |       await page.getByTestId('unlock-btn').click();
  641 |       
  642 |       // Should show rate limit message or disable form temporarily
  643 |       const errorText = await page.getByTestId('access-error').textContent();
> 644 |       expect(errorText?.toLowerCase()).toMatch(/(rate limit|too many attempts|temporarily disabled)/);
      |                                        ^ Error: expect(received).toMatch(expected)
  645 |     });
  646 |   });
  647 |
  648 |   test.describe('📱 Mobile Payment Experience', () => {
  649 |     test('should handle mobile payment flow correctly', async ({ page, browserName }) => {
  650 |       // Set mobile viewport
  651 |       await page.setViewportSize({ width: 375, height: 667 });
  652 |       
  653 |       await createPaymentTestPage(page);
  654 |       
  655 |       // Verify mobile-optimized layout
  656 |       await expect(page.getByTestId('payment-form')).toBeVisible();
  657 |       
  658 |       // Test touch interactions (use click for compatibility)
  659 |       if (browserName === 'webkit' || browserName === 'chromium') {
  660 |         // Use click instead of tap for better compatibility
  661 |         await page.getByTestId('email-input').click();
  662 |         await page.getByTestId('email-input').fill(TEST_USER.email);
  663 |         
  664 |         // Complete mobile payment
  665 |         await page.getByTestId('submit-payment-btn').click();
  666 |         await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
  667 |       } else {
  668 |         // For other browsers, use regular click
  669 |         await page.getByTestId('email-input').click();
  670 |         await page.getByTestId('email-input').fill(TEST_USER.email);
  671 |         
  672 |         await page.getByTestId('submit-payment-btn').click();
  673 |         await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
  674 |       }
  675 |     });
  676 |
  677 |     test('should handle mobile keyboard interactions', async ({ page }) => {
  678 |       await page.setViewportSize({ width: 375, height: 667 });
  679 |       await createPaymentTestPage(page);
  680 |       
  681 |       // Test email input with mobile keyboard
  682 |       await page.getByTestId('email-input').focus();
  683 |       await page.keyboard.type(TEST_USER.email);
  684 |       
  685 |       // Verify email validation on mobile
  686 |       await expect(page.getByTestId('email-input')).toHaveValue(TEST_USER.email);
  687 |     });
  688 |   });
  689 |
  690 |   test.describe('🔄 Error Recovery and Retry Logic', () => {
  691 |     test('should allow payment retry after network failure', async ({ page }) => {
  692 |       await createPaymentTestPage(page);
  693 |       
  694 |       // Simulate network failure
  695 |       await page.route('**/api/payment/**', async (route) => {
  696 |         await route.abort('failed');
  697 |       });
  698 |       
  699 |       await page.getByTestId('email-input').fill(TEST_USER.email);
  700 |       await page.getByTestId('submit-payment-btn').click();
  701 |       
  702 |       // Wait for error state
  703 |       await expect(page.getByTestId('card-errors')).toBeVisible({ timeout: 10000 });
  704 |       
  705 |       // Remove network failure and retry
  706 |       await page.unroute('**/api/payment/**');
  707 |       await setupPaymentAPIMocking(page);
  708 |       
  709 |       await page.getByTestId('submit-payment-btn').click();
  710 |       await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
  711 |     });
  712 |
  713 |     test('should handle session timeout gracefully', async ({ page }) => {
  714 |       await createPaymentTestPage(page);
  715 |       
  716 |       // Simulate session timeout
  717 |       await page.route('**/api/payment/**', async (route) => {
  718 |         await route.fulfill({
  719 |           status: 401,
  720 |           contentType: 'application/json',
  721 |           body: JSON.stringify({ error: 'Session expired' })
  722 |         });
  723 |       });
  724 |       
  725 |       await page.getByTestId('email-input').fill(TEST_USER.email);
  726 |       await page.getByTestId('submit-payment-btn').click();
  727 |       
  728 |       // Should redirect to login or show session expired message
  729 |       await expect(page.locator('text=Session expired, text=Please log in')).toBeVisible({ timeout: 10000 });
  730 |     });
  731 |   });
  732 | });
  733 |
  734 | // Performance and Load Testing
  735 | test.describe('⚡ Payment Performance Testing', () => {
  736 |   test('should complete payment flow within acceptable time limits', async ({ page }) => {
  737 |     const startTime = Date.now();
  738 |     
  739 |     await setupPaymentAPIMocking(page);
  740 |     await createPaymentTestPage(page);
  741 |     
  742 |     await page.getByTestId('email-input').fill(TEST_USER.email);
  743 |     await page.getByTestId('submit-payment-btn').click();
  744 |     
```