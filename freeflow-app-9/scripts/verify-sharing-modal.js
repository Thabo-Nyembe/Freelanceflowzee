const { chromium } = require('playwright');

async function verifySharedModal() {
  console.log('🚀 Starting Enhanced Community Hub Sharing Modal Verification...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    
    console.log('📱 Navigating to community page...');
    await page.goto('http://localhost:3000/dashboard/community');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Looking for share buttons...');
    
    // Wait for share buttons to be visible
    await page.waitForSelector('[data-testid= "share-btn"]', { timeout: 10000 });
    
    const shareButtons = await page.locator('[data-testid= "share-btn"]').count();
    console.log(`✅ Found ${shareButtons} share buttons`);
    
    if (shareButtons === 0) {
      throw new Error('No share buttons found on the page');
    }
    
    console.log('📱 Clicking first share button...');
    await page.locator('[data-testid= "share-btn"]').first().click();
    
    // Wait for modal to appear
    console.log('⏳ Waiting for sharing modal to appear...');
    await page.waitForSelector('.fixed.inset-0.bg-black.bg-opacity-50', { timeout: 5000 });
    
    console.log('✅ Sharing modal opened successfully!');
    
    // Check for modal content
    const modalContent = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').innerHTML();
    
    const hasShareText = modalContent.includes('Share');
    const hasSocialButtons = modalContent.includes('Facebook') || modalContent.includes('Twitter');
    const hasCopyLink = modalContent.includes('Copy');
    
    console.log('📋 Modal Content Check:');
    console.log(`   - Has share text: ${hasShareText ? '✅' : '❌'}`);
    console.log(`   - Has social buttons: ${hasSocialButtons ? '✅' : '❌'}`);
    console.log(`   - Has copy link: ${hasCopyLink ? '✅' : '❌'}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/sharing-modal-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to test-results/sharing-modal-screenshot.png');
    
    // Test close functionality
    console.log('🔒 Testing modal close...');
    const closeButton = page.locator('button').filter({ hasText: /×/ }).or(page.locator('button:has(svg)'));
    await closeButton.first().click();
    
    // Wait for modal to disappear
    await page.waitForSelector('.fixed.inset-0.bg-black.bg-opacity-50', { state: 'hidden', timeout: 3000 });
    console.log('✅ Modal closed successfully!');
    
    console.log('\n🎉 All sharing modal functionality verified successfully!');
    
    return {
      success: true,
      shareButtonsFound: shareButtons,
      modalOpened: true,
      modalContent: {
        hasShareText,
        hasSocialButtons,
        hasCopyLink
      },
      modalClosed: true
    };
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    
    if (page) {
      // Take error screenshot
      try {
        await page.screenshot({ path: 'test-results/sharing-modal-error.png', fullPage: true });
        console.log('📸 Error screenshot saved to test-results/sharing-modal-error.png');
      } catch (screenshotError) {
        console.log('Could not take error screenshot');
      }
    }
    
    return {
      success: false,
      error: error.message
    };
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function runVerification() {
  // Create test-results directory if it doesn't exist
  const fs = require('fs');
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
  }
  
  const result = await verifySharedModal();
  
  if (result.success) {
    console.log('\n✅ Enhanced Community Hub sharing modal integration is working correctly!');
    console.log('\n📊 Summary:');
    console.log(`   - Share buttons found: ${result.shareButtonsFound}`);
    console.log(`   - Modal opens: ${result.modalOpened ? '✅' : '❌'}`);
    console.log(`   - Modal content complete: ${JSON.stringify(result.modalContent)}`);
    console.log(`   - Modal closes: ${result.modalClosed ? '✅' : '❌'}`);
  } else {
    console.log('\n❌ Verification failed. Please check the error details above.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runVerification();
}

module.exports = { verifySharedModal, runVerification }; 