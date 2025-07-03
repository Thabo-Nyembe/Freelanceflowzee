import { test, expect } from '@playwright/test';

test.describe('FreeflowZee UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
  });

  test.describe('Dashboard Navigation', () => {
    test('should display all 8 main tabs', async ({ page }) => {
      const tabs = [
        'Overview',
        'Projects Hub',
        'AI Create',
        'Video Studio',
        'Escrow',
        'Files Hub',
        'Community',
        'My Day Today'
      ];

      for (const tab of tabs) {
        await expect(page.getByRole('tab', { name: tab })).toBeVisible();
      }
    });

    test('should switch between tabs correctly', async ({ page }) => {
      // Test Overview tab
      await page.getByRole('tab', { name: 'Overview' }).click();
      await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();

      // Test Projects Hub tab
      await page.getByRole('tab', { name: 'Projects Hub' }).click();
      await expect(page.getByRole('heading', { name: 'Projects Hub' })).toBeVisible();

      // Test AI Create tab
      await page.getByRole('tab', { name: 'AI Create' }).click();
      await expect(page.getByRole('heading', { name: 'AI Create Studio' })).toBeVisible();
    });
  });

  test.describe('Universal Pinpoint Feedback System', () => {
    test('should support multi-media commenting', async ({ page }) => {
      await page.getByRole('tab', { name: 'Projects Hub' }).click();
      await page.getByRole('button', { name: 'Add Comment' }).click();
      
      // Test text comment
      await page.getByLabel('Comment').fill('Test comment');
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByText('Test comment')).toBeVisible();

      // Test voice note
      await page.getByRole('button', { name: 'Record Voice Note' }).click();
      await expect(page.getByText('Recording...')).toBeVisible();
    });

    test('should support AI analysis', async ({ page }) => {
      await page.getByRole('tab', { name: 'Projects Hub' }).click();
      await page.getByRole('button', { name: 'AI Analysis' }).click();
      await expect(page.getByText('Analyzing feedback...')).toBeVisible();
    });
  });

  test.describe('Enhanced Community Hub', () => {
    test('should display Creator Marketplace', async ({ page }) => {
      await page.getByRole('tab', { name: 'Community' }).click();
      await expect(page.getByRole('heading', { name: 'Creator Marketplace' })).toBeVisible();
      await expect(page.getByText('Active Creators')).toBeVisible();
    });

    test('should show Social Wall', async ({ page }) => {
      await page.getByRole('tab', { name: 'Community' }).click();
      await page.getByRole('tab', { name: 'Social Wall' }).click();
      await expect(page.getByRole('feed')).toBeVisible();
    });
  });

  test.describe('My Day Today', () => {
    test('should display AI-generated planning', async ({ page }) => {
      await page.getByRole('tab', { name: 'My Day Today' }).click();
      await expect(page.getByText('Daily Schedule')).toBeVisible();
      await expect(page.getByText('AI Insights')).toBeVisible();
    });

    test('should track progress', async ({ page }) => {
      await page.getByRole('tab', { name: 'My Day Today' }).click();
      await expect(page.getByText('Progress Tracking')).toBeVisible();
      await expect(page.getByRole('progressbar')).toBeVisible();
    });
  });

  test.describe('Files Hub', () => {
    test('should support file uploads', async ({ page }) => {
      await page.getByRole('tab', { name: 'Files Hub' }).click();
      await expect(page.getByRole('button', { name: 'Upload Files' })).toBeVisible();
    });

    test('should display storage analytics', async ({ page }) => {
      await page.getByRole('tab', { name: 'Files Hub' }).click();
      await expect(page.getByText('Storage Usage')).toBeVisible();
      await expect(page.getByText('Cost Optimization')).toBeVisible();
    });
  });

  test.describe('Escrow System', () => {
    test('should display active deposits', async ({ page }) => {
      await page.getByRole('tab', { name: 'Escrow' }).click();
      await expect(page.getByText('Active Deposits')).toBeVisible();
      await expect(page.getByText('Total Escrow Value')).toBeVisible();
    });

    test('should show milestone tracking', async ({ page }) => {
      await page.getByRole('tab', { name: 'Escrow' }).click();
      await expect(page.getByText('Project Milestones')).toBeVisible();
      await expect(page.getByRole('progressbar')).toBeVisible();
    });
  });
}); 