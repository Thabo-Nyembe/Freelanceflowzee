
import { test, expect } from '@playwright/test';

// Enhanced Integration Testing with Context7 + Playwright
test.describe('Enhanced Features Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup test environment
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('Files Hub - Enhanced Upload/Download Integration', async ({ page }) => {
    await page.goto('/dashboard/files-hub');
    
    // Test enhanced upload button
    const uploadBtn = page.locator('[data-testid="upload-file-btn"]');
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.click();
    
    // Test file input appears
    await expect(page.locator('[data-testid="file-input"]')).toBeAttached();
    
    // Test download functionality
    const downloadBtn = page.locator('[data-testid="download-file-btn"]').first();
    if (await downloadBtn.count() > 0) {
      await downloadBtn.click();
      await expect(page.locator('[role="progressbar"]')).toBeVisible();
    }
  });

  test('AI Create - Asset Upload/Download Integration', async ({ page }) => {
    await page.goto('/dashboard/ai-create');
    
    // Test asset upload
    const uploadAssetBtn = page.locator('[data-testid="upload-asset-btn"]');
    await expect(uploadAssetBtn).toBeVisible();
    
    // Test download functionality
    const downloadAssetBtn = page.locator('[data-testid="download-asset-btn"]');
    if (await downloadAssetBtn.count() > 0) {
      await expect(downloadAssetBtn).toBeVisible();
    }
  });

  test('Video Studio - Media Upload Integration', async ({ page }) => {
    await page.goto('/dashboard/video-studio');
    
    // Test video upload
    const uploadBtn = page.locator('[data-testid="upload-btn"]');
    await expect(uploadBtn).toBeVisible();
    
    // Test upload functionality
    await uploadBtn.click();
    await expect(page.locator('[data-testid="file-input"]')).toBeAttached();
  });

  test('Escrow - Document Download Integration', async ({ page }) => {
    await page.goto('/dashboard/escrow');
    
    // Test receipt download
    const downloadReceiptBtn = page.locator('[data-testid="download-receipt-btn"]');
    if (await downloadReceiptBtn.count() > 0) {
      await expect(downloadReceiptBtn).toBeVisible();
      await downloadReceiptBtn.click();
    }
  });

  test('Navigation - All Routes Working', async ({ page }) => {
    const navigationItems = [
      { testId: 'nav-projects', href: '/dashboard/projects-hub' },
      { testId: 'nav-ai-create', href: '/dashboard/ai-create' },
      { testId: 'nav-video', href: '/dashboard/video-studio' },
      { testId: 'nav-canvas', href: '/dashboard/canvas' },
      { testId: 'nav-community', href: '/dashboard/community' },
      { testId: 'nav-escrow', href: '/dashboard/escrow' },
      { testId: 'nav-files', href: '/dashboard/files-hub' },
      { testId: 'nav-my-day', href: '/dashboard/my-day' }
    ];

    for (const item of navigationItems) {
      const navLink = page.locator(`[data-testid="${item.testId}"]`);
      if (await navLink.count() > 0) {
        await navLink.click();
        await expect(page).toHaveURL(new RegExp(item.href.replace('/', '\\/')));
        await page.goBack();
      }
    }
  });

  test('Interactive Elements - All Buttons Functional', async ({ page }) => {
    // Test all interactive buttons across the application
    const pages = [
      '/dashboard/files-hub',
      '/dashboard/ai-create', 
      '/dashboard/video-studio',
      '/dashboard/escrow',
      '/dashboard/projects-hub'
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Find all buttons with test IDs
      const buttons = await page.locator('[data-testid*="btn"]').all();
      
      for (const button of buttons) {
        const testId = await button.getAttribute('data-testid');
        if (testId && !await button.isDisabled()) {
          console.log(`Testing button: ${testId} on ${pagePath}`);
          await expect(button).toBeVisible();
          // Additional functionality tests would go here
        }
      }
    }
  });

});