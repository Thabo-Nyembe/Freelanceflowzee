import { test, expect } from '@playwright/test';
import { test as baseTest } from './test-config';

test.describe('FreeflowZee Escrow System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.getByRole('tab', { name: 'Escrow' }).click();
  });

  test.describe('Escrow Overview', () => {
    test('should display escrow balance and stats', async ({ page }) => {
      // Verify escrow overview
      await expect(page.getByTestId('total-escrow-value')).toBeVisible();
      await expect(page.getByTestId('active-deposits')).toBeVisible();
      await expect(page.getByTestId('completed-transactions')).toBeVisible();
      
      // Verify specific values
      await expect(page.getByTestId('total-escrow-value')).toContainText('$13,500');
      await expect(page.getByTestId('active-deposits')).toContainText('2');
    });

    test('should display project milestones', async ({ page }) => {
      // Verify milestone list
      const milestones = await page.getByTestId('milestone-item').all();
      expect(milestones.length).toBeGreaterThan(0);
      
      // Verify milestone details
      const firstMilestone = milestones[0];
      await expect(firstMilestone.getByTestId('milestone-name')).toBeVisible();
      await expect(firstMilestone.getByTestId('milestone-amount')).toBeVisible();
      await expect(firstMilestone.getByTestId('milestone-status')).toBeVisible();
    });
  });

  test.describe('Payment Processing', () => {
    test('should process escrow deposit', async ({ page }) => {
      // Click deposit button
      await page.getByRole('button', { name: 'New Deposit' }).click();
      
      // Fill deposit form
      await page.getByLabel('Amount').fill('1000');
      await page.getByLabel('Project').selectOption('Brand Identity Design');
      await page.getByLabel('Milestone').selectOption('Logo Design');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Complete payment
      await page.getByTestId('card-number').fill('4242424242424242');
      await page.getByTestId('card-expiry').fill('1230');
      await page.getByTestId('card-cvc').fill('123');
      await page.getByRole('button', { name: 'Pay' }).click();
      
      // Verify success
      await expect(page.getByText('Payment Successful')).toBeVisible();
      await expect(page.getByText('$1,000 deposited')).toBeVisible();
    });

    test('should handle failed payments', async ({ page }) => {
      await page.getByRole('button', { name: 'New Deposit' }).click();
      
      // Fill deposit form with invalid card
      await page.getByLabel('Amount').fill('1000');
      await page.getByLabel('Project').selectOption('Brand Identity Design');
      await page.getByTestId('card-number').fill('4000000000000002');
      await page.getByTestId('card-expiry').fill('1230');
      await page.getByTestId('card-cvc').fill('123');
      await page.getByRole('button', { name: 'Pay' }).click();
      
      // Verify error message
      await expect(page.getByText('Payment Failed')).toBeVisible();
      await expect(page.getByText('Card declined')).toBeVisible();
    });
  });

  test.describe('Milestone Management', () => {
    test('should release milestone payment', async ({ page }) => {
      // Select completed milestone
      const completedMilestone = page.getByTestId('milestone-item')
        .filter({ hasText: 'completed' })
        .first();
      
      // Release payment
      await completedMilestone.getByRole('button', { name: 'Release Payment' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      
      // Verify release
      await expect(page.getByText('Payment Released')).toBeVisible();
      await expect(completedMilestone.getByText('Released')).toBeVisible();
    });

    test('should request milestone review', async ({ page }) => {
      // Select in-progress milestone
      const inProgressMilestone = page.getByTestId('milestone-item')
        .filter({ hasText: 'in_progress' })
        .first();
      
      // Request review
      await inProgressMilestone.getByRole('button', { name: 'Request Review' }).click();
      await page.getByLabel('Review Notes').fill('Ready for client review');
      await page.getByRole('button', { name: 'Submit' }).click();
      
      // Verify request sent
      await expect(page.getByText('Review Requested')).toBeVisible();
      await expect(inProgressMilestone.getByText('Pending Review')).toBeVisible();
    });
  });

  test.describe('Dispute Resolution', () => {
    test('should open dispute', async ({ page }) => {
      // Select milestone
      const milestone = page.getByTestId('milestone-item').first();
      await milestone.getByRole('button', { name: 'More Actions' }).click();
      await page.getByRole('menuitem', { name: 'Open Dispute' }).click();
      
      // Fill dispute form
      await page.getByLabel('Reason').selectOption('quality');
      await page.getByLabel('Description').fill('Work does not match requirements');
      await page.setInputFiles('input[type="file"]', 'test-data/evidence.pdf');
      await page.getByRole('button', { name: 'Submit' }).click();
      
      // Verify dispute opened
      await expect(page.getByText('Dispute Opened')).toBeVisible();
      await expect(milestone.getByText('In Dispute')).toBeVisible();
    });

    test('should respond to dispute', async ({ page }) => {
      // Find disputed milestone
      const disputedMilestone = page.getByTestId('milestone-item')
        .filter({ hasText: 'In Dispute' })
        .first();
      
      // Submit response
      await disputedMilestone.getByRole('button', { name: 'Respond' }).click();
      await page.getByLabel('Response').fill('Work meets all requirements');
      await page.setInputFiles('input[type="file"]', 'test-data/response.pdf');
      await page.getByRole('button', { name: 'Submit' }).click();
      
      // Verify response submitted
      await expect(page.getByText('Response Submitted')).toBeVisible();
    });
  });

  test.describe('Transaction History', () => {
    test('should display transaction list', async ({ page }) => {
      await page.getByRole('tab', { name: 'History' }).click();
      
      // Verify transaction elements
      const transactions = await page.getByTestId('transaction-item').all();
      expect(transactions.length).toBeGreaterThan(0);
      
      // Verify transaction details
      const firstTransaction = transactions[0];
      await expect(firstTransaction.getByTestId('transaction-amount')).toBeVisible();
      await expect(firstTransaction.getByTestId('transaction-date')).toBeVisible();
      await expect(firstTransaction.getByTestId('transaction-status')).toBeVisible();
    });

    test('should filter transactions', async ({ page }) => {
      await page.getByRole('tab', { name: 'History' }).click();
      
      // Apply filters
      await page.getByRole('button', { name: 'Filter' }).click();
      await page.getByLabel('Status').selectOption('completed');
      await page.getByRole('button', { name: 'Apply' }).click();
      
      // Verify filtered results
      const transactions = await page.getByTestId('transaction-item').all();
      for (const transaction of transactions) {
        await expect(transaction.getByTestId('transaction-status'))
          .toHaveText('Completed');
      }
    });
  });

  test.describe('Security Features', () => {
    test('should require 2FA for large transactions', async ({ page }) => {
      await page.getByRole('button', { name: 'New Deposit' }).click();
      
      // Attempt large deposit
      await page.getByLabel('Amount').fill('10000');
      await page.getByLabel('Project').selectOption('Brand Identity Design');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Verify 2FA prompt
      await expect(page.getByText('2FA Required')).toBeVisible();
      await expect(page.getByLabel('Authentication Code')).toBeVisible();
    });

    test('should validate withdrawal limits', async ({ page }) => {
      await page.getByRole('button', { name: 'Withdraw' }).click();
      
      // Attempt withdrawal above limit
      await page.getByLabel('Amount').fill('50000');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Verify limit message
      await expect(page.getByText('Exceeds withdrawal limit')).toBeVisible();
      await expect(page.getByText('24-hour limit: $25,000')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/escrow/**', route => route.abort());
      
      await page.getByRole('button', { name: 'New Deposit' }).click();
      
      // Verify error message
      await expect(page.getByText('Connection Error')).toBeVisible();
      await expect(page.getByText('Please try again')).toBeVisible();
    });

    test('should handle insufficient funds', async ({ page }) => {
      await page.getByRole('button', { name: 'New Deposit' }).click();
      
      // Use test card for insufficient funds
      await page.getByLabel('Amount').fill('1000');
      await page.getByLabel('Project').selectOption('Brand Identity Design');
      await page.getByTestId('card-number').fill('4000000000009995');
      await page.getByTestId('card-expiry').fill('1230');
      await page.getByTestId('card-cvc').fill('123');
      await page.getByRole('button', { name: 'Pay' }).click();
      
      // Verify error message
      await expect(page.getByText('Insufficient Funds')).toBeVisible();
    });
  });
});