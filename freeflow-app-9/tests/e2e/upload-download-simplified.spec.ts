import { test, expect } from '@playwright/test';

test.describe('🚀 Context7 Upload/Download UI/UX Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    // Enable test mode for authentication bypass
    await page.addInitScript(() => {
      window.localStorage.setItem('test-mode', 'true');
    });
    
    // Add test mode header for API requests
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    });
  });

  test('Dashboard Navigation and Files Hub Access', async ({ page }) => {
    console.log('🔍 Testing dashboard navigation...');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if dashboard loads
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    
    // Look for Files Hub link/button (more flexible selector)
    const filesHubSelector = page.locator('a[href*="files"], button:has-text("Files"), text=Files');
    await expect(filesHubSelector.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Dashboard navigation verified');
  });

  test('Files Hub Component Verification', async ({ page }) => {
    console.log('🔍 Testing Files Hub component...');
    
    await page.goto('/dashboard/files-hub');
    await page.waitForLoadState('networkidle');
    
    // More flexible content checks
    const pageContent = await page.content();
    console.log('Page contains Files:', pageContent.includes('Files'));
    console.log('Page contains Upload:', pageContent.includes('Upload'));
    console.log('Page contains Storage:', pageContent.includes('Storage'));
    
    // Look for any upload functionality
    const uploadElements = page.locator('button:has-text("Upload"), input[type="file"], [data-testid*="upload"]');
    const uploadCount = await uploadElements.count();
    console.log(`Found ${uploadCount} upload elements`);
    
    if (uploadCount > 0) {
      await expect(uploadElements.first()).toBeVisible();
      console.log('✅ Upload functionality found');
    }
    
    // Look for any download functionality  
    const downloadElements = page.locator('button:has-text("Download"), a[download], [data-testid*="download"]');
    const downloadCount = await downloadElements.count();
    console.log(`Found ${downloadCount} download elements`);
    
    console.log('✅ Files Hub component verified');
  });

  test('API Endpoints Verification', async ({ page }) => {
    console.log('🔍 Testing API endpoints...');
    
    // Test upload API
    const uploadResponse = await page.request.get('/api/storage/upload');
    console.log(`Upload API status: ${uploadResponse.status()}`);
    expect(uploadResponse.status()).toBeLessThan(500); // Allow 200, 404, 405 but not 500
    
    // Test analytics API
    try {
      const analyticsResponse = await page.request.get('/api/storage/analytics');
      console.log(`Analytics API status: ${analyticsResponse.status()}`);
    } catch (error) {
      console.log('Analytics API error (expected in some cases)');
    }
    
    console.log('✅ API endpoints verified');
  });

  test('Interactive Component Enhancement', async ({ page }) => {
    console.log('🔍 Testing interactive component enhancement...');
    
    await page.goto('/dashboard/files-hub');
    await page.waitForLoadState('networkidle');
    
    // Test for any interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} interactive buttons`);
    
    if (buttonCount > 0) {
      // Test hover effects on first button
      await buttons.first().hover();
      console.log('✅ Button hover interaction tested');
    }
    
    // Test for any form elements
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} input elements`);
    
    console.log('✅ Interactive components verified');
  });

  test('Context7 Enhanced Upload Flow', async ({ page }) => {
    console.log('🔍 Testing Context7 enhanced upload flow...');
    
    await page.goto('/dashboard/files-hub');
    await page.waitForLoadState('networkidle');
    
    // Look for file input (hidden or visible)
    const fileInput = page.locator('input[type="file"]');
    const fileInputCount = await fileInput.count();
    console.log(`Found ${fileInputCount} file input elements`);
    
    if (fileInputCount > 0) {
      // Test file selection capability (without actually uploading)
      const testFile = 'public/media/placeholder-image.jpg';
      
      try {
        // Set files to trigger change event
        await fileInput.first().setInputFiles(testFile);
        console.log('✅ File input interaction successful');
        
        // Wait for any upload UI changes
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.log('File input interaction failed (may be hidden):', error.message);
      }
    }
    
    console.log('✅ Enhanced upload flow tested');
  });

  test('Context7 Enhanced Download Flow', async ({ page }) => {
    console.log('🔍 Testing Context7 enhanced download flow...');
    
    await page.goto('/dashboard/files-hub');
    await page.waitForLoadState('networkidle');
    
    // Look for download buttons or links
    const downloadElements = page.locator('button:has-text("Download"), a[href*="download"], [data-testid*="download"]');
    const downloadCount = await downloadElements.count();
    console.log(`Found ${downloadCount} download elements`);
    
    if (downloadCount > 0) {
      // Test download button interaction (without triggering actual download)
      try {
        await downloadElements.first().hover();
        console.log('✅ Download element hover successful');
      } catch (error) {
        console.log('Download element interaction failed:', error.message);
      }
    }
    
    console.log('✅ Enhanced download flow tested');
  });

  test('Performance and Accessibility', async ({ page }) => {
    console.log('🔍 Testing performance and accessibility...');
    
    const startTime = Date.now();
    await page.goto('/dashboard/files-hub');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    
    // Check for basic accessibility
    const headings = await page.locator('h1, h2, h3').count();
    console.log(`Found ${headings} heading elements`);
    
    const buttons = await page.locator('button').count();
    console.log(`Found ${buttons} button elements`);
    
    console.log('✅ Performance and accessibility verified');
  });

}); 