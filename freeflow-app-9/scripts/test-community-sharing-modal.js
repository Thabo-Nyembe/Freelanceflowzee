const { test, expect } = require('@playwright/test');

test.describe('Enhanced Community Hub Sharing Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to community page
    await page.goto('http://localhost:3000/dashboard/community');
    await page.waitForLoadState('networkidle');
  });

  test('should display share button on posts', async ({ page }) => {
    console.log('🔍 Testing share button visibility...');
    
    // Look for share buttons in posts
    const shareButtons = page.locator('[data-testid="share-btn"]');
    
    // Wait for at least one share button to be visible
    await expect(shareButtons.first()).toBeVisible({ timeout: 10000 });
    
    const count = await shareButtons.count();
    console.log(`✅ Found ${count} share buttons`);
    
    expect(count).toBeGreaterThan(0);
  });

  test('should open sharing modal when share button is clicked', async ({ page }) => {
    console.log('🔍 Testing sharing modal functionality...');
    
    // Wait for share button and click it
    const shareButton = page.locator('[data-testid="share-btn"]').first();
    await shareButton.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('📱 Clicking share button...');
    await shareButton.click();
    
    // Check if sharing modal opens
    const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Sharing modal opened successfully');
    
    // Check for modal content
    await expect(page.locator('text=Share post')).toBeVisible();
    await expect(page.locator('text=Share on social media')).toBeVisible();
    await expect(page.locator('text=Copy link')).toBeVisible();
  });

  test('should close sharing modal when X is clicked', async ({ page }) => {
    console.log('🔍 Testing modal close functionality...');
    
    // Open modal
    const shareButton = page.locator('[data-testid="share-btn"]').first();
    await shareButton.click();
    
    // Wait for modal to open
    const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    await expect(modal).toBeVisible();
    
    // Click close button
    const closeButton = page.locator('button').filter({ hasText: /×/ }).or(page.locator('[aria-label="Close"]'));
    await closeButton.click();
    
    // Check if modal is closed
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    
    console.log('✅ Modal closed successfully');
  });

  test('should have functional social media sharing buttons', async ({ page }) => {
    console.log('🔍 Testing social media sharing buttons...');
    
    // Open modal
    const shareButton = page.locator('[data-testid="share-btn"]').first();
    await shareButton.click();
    
    // Wait for modal to open
    await expect(page.locator('.fixed.inset-0.bg-black.bg-opacity-50')).toBeVisible();
    
    // Check for social media buttons
    const socialButtons = [
      'Facebook',
      'Twitter', 
      'LinkedIn',
      'Instagram',
      'Email'
    ];
    
    for (const social of socialButtons) {
      const button = page.locator(`text=${social}`);
      await expect(button).toBeVisible();
      console.log(`✅ ${social} button found`);
    }
  });

  test('should copy link to clipboard', async ({ page }) => {
    console.log('🔍 Testing copy link functionality...');
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
    
    // Open modal
    const shareButton = page.locator('[data-testid="share-btn"]').first();
    await shareButton.click();
    
    // Wait for modal to open
    await expect(page.locator('.fixed.inset-0.bg-black.bg-opacity-50')).toBeVisible();
    
    // Click copy link button
    const copyButton = page.locator('button').filter({ hasText: /Copy/ }).or(page.locator('[aria-label*="Copy"]'));
    await copyButton.click();
    
    // Check for success message or state change
    await expect(page.locator('text=Copied!')).toBeVisible({ timeout: 3000 });
    
    console.log('✅ Link copied successfully');
  });

  test('should display post information in modal', async ({ page }) => {
    console.log('🔍 Testing post information display...');
    
    // Open modal
    const shareButton = page.locator('[data-testid="share-btn"]').first();
    await shareButton.click();
    
    // Wait for modal to open
    const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    await expect(modal).toBeVisible();
    
    // Check if modal contains post information
    const hasTitle = await page.locator('h3').count() > 0;
    const hasUrl = await page.locator('text=/http.*community.*post/').count() > 0;
    
    if (hasTitle) console.log('✅ Post title displayed in modal');
    if (hasUrl) console.log('✅ Post URL displayed in modal');
    
    expect(hasTitle || hasUrl).toBe(true);
  });
});

async function runTests() {
  console.log('🚀 Starting Enhanced Community Hub Sharing Modal Tests...\n');
  
  try {
    const { execSync } = require('child_process');
    
    // Run the tests
    const result = execSync('npx playwright test scripts/test-community-sharing-modal.js --headed', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    console.log(result);
    console.log('\n✅ All sharing modal tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    
    if (error.stdout) {
      console.log('\n📋 Test Output:');
      console.log(error.stdout);
    }
    
    if (error.stderr) {
      console.log('\n🚨 Error Output:');
      console.log(error.stderr);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 