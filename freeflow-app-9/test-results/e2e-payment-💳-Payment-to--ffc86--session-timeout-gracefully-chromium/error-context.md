# Test info

- Name: 💳 Payment-to-Unlock Flow Testing >> 🔄 Error Recovery and Retry Logic >> should handle session timeout gracefully
- Location: /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:713:9

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=Session expired, text=Please log in')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('text=Session expired, text=Please log in')

    at /Users/thabonyembe/Documents/freeflow-app-9/tests/e2e/payment.spec.ts:729:78
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
- textbox "Email Address": test.buyer@example.com
- text: Card Information
- iframe
- iframe
- strong: "Test Cards:"
- text: "Success: 4242 4242 4242 4242 Decline: 4000 0000 0000 0002 Use any future date and any 3-digit CVC Session expired"
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
  644 |       expect(errorText?.toLowerCase()).toMatch(/(rate limit|too many attempts|temporarily disabled)/);
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
> 729 |       await expect(page.locator('text=Session expired, text=Please log in')).toBeVisible({ timeout: 10000 });
      |                                                                              ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
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
  745 |     await expect(page.getByTestId('payment-success')).toBeVisible({ timeout: 10000 });
  746 |     
  747 |     const totalTime = Date.now() - startTime;
  748 |     expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds
  749 |   });
  750 |
  751 |   test('should handle multiple concurrent payment attempts', async ({ page, context }) => {
  752 |     // This would typically test payment system's ability to handle load
  753 |     // In a real scenario, you might use multiple browser contexts or workers
  754 |     const promises = [];
  755 |     
  756 |     for (let i = 0; i < 3; i++) {
  757 |       const newPage = await context.newPage();
  758 |       promises.push(
  759 |         setupPaymentAPIMocking(newPage)
  760 |           .then(() => createPaymentTestPage(newPage))
  761 |           .then(() => newPage.getByTestId('email-input').fill(`user${i}@example.com`))
  762 |           .then(() => newPage.getByTestId('submit-payment-btn').click())
  763 |           .then(() => expect(newPage.getByTestId('payment-success')).toBeVisible({ timeout: 15000 }))
  764 |       );
  765 |     }
  766 |     
  767 |     // All payments should succeed
  768 |     await Promise.all(promises);
  769 |   });
  770 | }); 
```