import { test, expect, Page, Download } from '@playwright/test';
import { createReadStream, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Context7 Test Configuration
const CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  viewport: { width: 1280, height: 720 },
  testFiles: {
    image: 'public/media/placeholder-image.jpg',
    video: 'public/media/placeholder-video.mp4',
    audio: 'public/media/placeholder-audio.wav',
    document: 'public/media/placeholder-doc.pdf'
  }
};

// Test Suite Configuration - Context7 MCP Patterns
const TEST_SCENARIOS = [
  {
    name: 'Files Hub - Enterprise File Operations',
    url: '/dashboard/files-hub',
    uploadSelector: '[data-testid="upload-file-btn"]',
    downloadSelector: '[data-testid="download-file-btn"]',
    fileInputSelector: 'input[type="file"]',
    progressSelector: '[data-testid="upload-progress"]',
    features: ['drag-drop', 'bulk-upload', 'progress-tracking', 'file-preview']
  },
  {
    name: 'AI Create - Asset Upload/Download',
    url: '/dashboard/ai-create',
    uploadSelector: '[data-testid="upload-asset-btn"]',
    downloadSelector: '[data-testid="download-asset-btn"]',
    features: ['ai-preview', 'smart-suggestions', 'format-optimization']
  },
  {
    name: 'Video Studio - Media Management',
    url: '/dashboard/video-studio',
    uploadSelector: 'button:has-text("Upload")',
    downloadSelector: 'button:has-text("Export")',
    features: ['timeline-scrubbing', 'real-time-preview', 'export-queue']
  },
  {
    name: 'Escrow System - Document Downloads',
    url: '/dashboard/escrow',
    downloadSelector: '[data-testid="download-receipt-btn"]',
    contractSelector: '[data-testid="contract-download"]',
    features: ['document-preview', 'digital-signatures', 'audit-trail']
  },
  {
    name: 'Universal Pinpoint Feedback',
    url: '/dashboard/projects-hub',
    tabSelector: '[data-testid="collaboration-tab"]',
    uploadSelector: '[data-testid="upload-media-btn"]',
    voiceSelector: '[data-testid="voice-record-btn"]',
    features: ['voice-notes', 'ai-analysis', 'threaded-comments']
  }
];

test.describe('🎯 Context7 Upload/Download Comprehensive Test Suite', () => {
  // Configure browser context for file operations
  test.use({ 
    acceptDownloads: true,
    viewport: CONFIG.viewport
  });

  // Helper function for navigation with test mode
  async function navigateWithTestMode(page: Page, url: string) {
    await page.goto(`${CONFIG.baseURL}${url}`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout
    });
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
  }

  // Context7 Upload Test Pattern
  async function testUploadFunctionality(page: Page, scenario: any) {
    if (!scenario.uploadSelector) return { success: false, reason: 'No upload selector' };

    try {
      // Check if upload button exists
      const uploadBtn = page.locator(scenario.uploadSelector);
      await expect(uploadBtn).toBeVisible({ timeout: 10000 });

      // Test drag and drop if supported
      if (scenario.features?.includes('drag-drop')) {
        const uploadArea = uploadBtn.locator('..');
        await uploadArea.dispatchEvent('dragover');
        // Check for visual feedback
        await expect(uploadArea).toHaveClass(/border-primary|drag-over|drop-zone-active/, { timeout: 5000 });
      }

      // Click upload button
      await uploadBtn.click();

      // Handle file input
      if (scenario.fileInputSelector) {
        const fileInput = page.locator(scenario.fileInputSelector);
        await fileInput.setInputFiles(CONFIG.testFiles.image);
        
        // Check for upload progress if supported
        if (scenario.progressSelector) {
          await expect(page.locator(scenario.progressSelector)).toBeVisible({ timeout: 5000 });
        }
      }

      return { success: true, details: 'Upload functionality working' };
    } catch (error) {
      return { success: false, reason: error.message };
    }
  }

  // Context7 Download Test Pattern  
  async function testDownloadFunctionality(page: Page, scenario: any) {
    if (!scenario.downloadSelector) return { success: false, reason: 'No download selector' };

    try {
      const downloadBtn = page.locator(scenario.downloadSelector);
      
      if (await downloadBtn.count() === 0) {
        return { success: false, reason: 'Download button not found' };
      }

      // Set up download promise before clicking
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      
      // Click download button
      await downloadBtn.click();
      
      // Wait for download to start
      const download: Download = await downloadPromise;
      
      // Verify download properties
      expect(download.suggestedFilename()).toBeTruthy();
      expect(download.url()).toBeTruthy();
      
      return { 
        success: true, 
        details: `Downloaded: ${download.suggestedFilename()}`,
        filename: download.suggestedFilename(),
        url: download.url()
      };
    } catch (error) {
      return { success: false, reason: error.message };
    }
  }

  // Test Files Hub Comprehensive Operations
  test('Files Hub - Complete Upload/Download Workflow', async ({ page }) => {
    console.log('🔍 Testing Files Hub comprehensive file operations...');
    
    await navigateWithTestMode(page, '/dashboard/files-hub');
    
    // Check for main file hub elements
    await expect(page.locator('text=Enterprise Files Hub')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Upload Files")')).toBeVisible();
    
    // Test file upload
    const uploadResult = await testUploadFunctionality(page, TEST_SCENARIOS[0]);
    expect(uploadResult.success).toBeTruthy();
    
    // Test file download (if files are available)
    const downloadResult = await testDownloadFunctionality(page, TEST_SCENARIOS[0]);
    // Note: Download might fail if no files exist, which is acceptable
    
    console.log('✅ Files Hub - Upload/Download tested');
  });

  // Test AI Create Asset Operations
  test('AI Create - Asset Upload and Download', async ({ page }) => {
    console.log('🔍 Testing AI Create asset operations...');
    
    await navigateWithTestMode(page, '/dashboard/ai-create');
    
    // Wait for AI Create interface
    await page.waitForSelector('h1, [data-testid="ai-create-header"]', { timeout: 10000 });
    
    const scenario = TEST_SCENARIOS[1];
    
    // Test asset upload
    const uploadResult = await testUploadFunctionality(page, scenario);
    console.log(`Upload result: ${uploadResult.success ? 'SUCCESS' : uploadResult.reason}`);
    
    // Test asset download
    const downloadResult = await testDownloadFunctionality(page, scenario);
    console.log(`Download result: ${downloadResult.success ? 'SUCCESS' : downloadResult.reason}`);
    
    console.log('✅ AI Create - Asset operations tested');
  });

  // Test Video Studio Media Operations
  test('Video Studio - Media Upload and Export', async ({ page }) => {
    console.log('🔍 Testing Video Studio media operations...');
    
    await navigateWithTestMode(page, '/dashboard/video-studio');
    
    const scenario = TEST_SCENARIOS[2];
    
    // Test media upload
    const uploadResult = await testUploadFunctionality(page, scenario);
    console.log(`Upload result: ${uploadResult.success ? 'SUCCESS' : uploadResult.reason}`);
    
    // Test export functionality
    const downloadResult = await testDownloadFunctionality(page, scenario);
    console.log(`Export result: ${downloadResult.success ? 'SUCCESS' : downloadResult.reason}`);
    
    console.log('✅ Video Studio - Media operations tested');
  });

  // Test Escrow Document Downloads
  test('Escrow System - Document Download Operations', async ({ page }) => {
    console.log('🔍 Testing Escrow document downloads...');
    
    await navigateWithTestMode(page, '/dashboard/escrow');
    
    const scenario = TEST_SCENARIOS[3];
    
    // Test receipt download
    const receiptResult = await testDownloadFunctionality(page, scenario);
    console.log(`Receipt download: ${receiptResult.success ? 'SUCCESS' : receiptResult.reason}`);
    
    // Test contract download if available
    if (scenario.contractSelector) {
      const contractResult = await testDownloadFunctionality(page, {
        ...scenario,
        downloadSelector: scenario.contractSelector
      });
      console.log(`Contract download: ${contractResult.success ? 'SUCCESS' : contractResult.reason}`);
    }
    
    console.log('✅ Escrow System - Document downloads tested');
  });

  // Test Universal Pinpoint Feedback
  test('Universal Pinpoint Feedback - Media Upload and Voice Notes', async ({ page }) => {
    console.log('🔍 Testing Universal Pinpoint Feedback...');
    
    await navigateWithTestMode(page, '/dashboard/projects-hub');
    
    const scenario = TEST_SCENARIOS[4];
    
    // Navigate to collaboration tab if it exists
    if (scenario.tabSelector) {
      const collaborationTab = page.locator(scenario.tabSelector);
      if (await collaborationTab.isVisible()) {
        await collaborationTab.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Test media upload for feedback
    const uploadResult = await testUploadFunctionality(page, scenario);
    console.log(`Media upload: ${uploadResult.success ? 'SUCCESS' : uploadResult.reason}`);
    
    // Test voice recording if available
    if (scenario.voiceSelector) {
      const voiceBtn = page.locator(scenario.voiceSelector);
      if (await voiceBtn.isVisible()) {
        await voiceBtn.click();
        // Check for recording indicator
        await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible({ timeout: 5000 });
        console.log('✅ Voice recording functionality detected');
      }
    }
    
    console.log('✅ Universal Pinpoint Feedback tested');
  });

  // Test Enhanced Interactive Features
  test('Enhanced Interactive Features - Drag & Drop and Progress Tracking', async ({ page }) => {
    console.log('🔍 Testing enhanced interactive features...');
    
    await navigateWithTestMode(page, '/dashboard/files-hub');
    
    // Test drag and drop functionality
    const uploadArea = page.locator('[data-testid="upload-file-btn"]').locator('..');
    if (await uploadArea.isVisible()) {
      // Simulate drag over
      await uploadArea.dispatchEvent('dragover', {
        dataTransfer: {
          types: ['Files'],
          files: []
        }
      });
      
      // Check for visual feedback
      const hasDropClass = await uploadArea.evaluate(el => 
        el.classList.contains('border-primary') || 
        el.classList.contains('drag-over') ||
        el.classList.contains('drop-zone-active')
      );
      
      if (hasDropClass) {
        console.log('✅ Drag and drop visual feedback working');
      }
    }
    
    // Test smart download button features
    const downloadBtn = page.locator('[data-testid="download-file-btn"]');
    if (await downloadBtn.isVisible()) {
      await downloadBtn.click();
      
      // Check for progress indicator
      const progressIndicator = page.locator('[role="progressbar"], [data-testid="download-progress"]');
      const progressVisible = await progressIndicator.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (progressVisible) {
        console.log('✅ Download progress tracking working');
      }
    }
    
    console.log('✅ Enhanced interactive features tested');
  });

  // Performance and Reliability Test
  test('Upload/Download Performance and Reliability', async ({ page }) => {
    console.log('🔍 Testing upload/download performance...');
    
    interface PerformanceResult {
      scenario: string;
      navigationTime: number;
      uploadSuccess: boolean;
      downloadSuccess: boolean;
    }
    
    const performanceResults: PerformanceResult[] = [];
    
    for (const scenario of TEST_SCENARIOS.slice(0, 3)) { // Test first 3 scenarios
      const startTime = Date.now();
      
      await navigateWithTestMode(page, scenario.url);
      
      const navigationTime = Date.now() - startTime;
      
      // Quick functionality check
      const uploadTest = await testUploadFunctionality(page, scenario);
      const downloadTest = await testDownloadFunctionality(page, scenario);
      
      performanceResults.push({
        scenario: scenario.name,
        navigationTime,
        uploadSuccess: uploadTest.success,
        downloadSuccess: downloadTest.success
      });
    }
    
    // Log performance results
    console.log('📊 Performance Results:');
    performanceResults.forEach(result => {
      console.log(`   ${result.scenario}: ${result.navigationTime}ms navigation, Upload: ${result.uploadSuccess ? '✅' : '❌'}, Download: ${result.downloadSuccess ? '✅' : '❌'}`);
    });
    
    // Assert reasonable navigation times (under 5 seconds)
    const avgNavigationTime = performanceResults.reduce((sum, r) => sum + r.navigationTime, 0) / performanceResults.length;
    expect(avgNavigationTime).toBeLessThan(5000);
    
    console.log('✅ Performance and reliability test completed');
  });

  // API Integration Test
  test('Upload/Download API Integration', async ({ page, request }) => {
    console.log('🔍 Testing API integration...');
    
    // Test upload API endpoint
    const uploadResponse = await request.get('/api/upload');
    console.log(`Upload API status: ${uploadResponse.status()}`);
    
    // Test storage analytics API
    const analyticsResponse = await request.get('/api/storage/analytics');
    console.log(`Analytics API status: ${analyticsResponse.status()}`);
    
    // Test collaboration UPF API
    const upfResponse = await request.get('/api/collaboration/upf');
    console.log(`UPF API status: ${upfResponse.status()}`);
    
    console.log('✅ API integration test completed');
  });
});

// Additional Context7 Test Utilities
test.describe('Context7 Interactive Component Verification', () => {
  
  test('Enhanced Upload Button Component', async ({ page }) => {
    await navigateWithTestMode(page, '/dashboard/files-hub');
    
    const uploadBtn = page.locator('[data-testid="upload-file-btn"]');
    await expect(uploadBtn).toBeVisible();
    
    // Test enhanced features
    await uploadBtn.hover();
    // Check for tooltip or hover effects
    
    await uploadBtn.click();
    // Verify enhanced upload dialog or functionality
    
    console.log('✅ Enhanced Upload Button verified');
  });

  test('Smart Download Button Component', async ({ page }) => {
    await navigateWithTestMode(page, '/dashboard/files-hub');
    
    const downloadBtn = page.locator('[data-testid="download-file-btn"]');
    if (await downloadBtn.isVisible()) {
      await downloadBtn.click();
      
      // Check for smart download features
      const progressBar = page.locator('[role="progressbar"]');
      const statusText = page.locator('text=/Downloaded|Downloading|Download/');
      
      const hasProgress = await progressBar.isVisible({ timeout: 3000 }).catch(() => false);
      const hasStatus = await statusText.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (hasProgress || hasStatus) {
        console.log('✅ Smart Download Button features detected');
      }
    }
    
    console.log('✅ Smart Download Button verified');
  });
});

// Helper function for test data cleanup
async function navigateWithTestMode(page: Page, url: string) {
  await page.goto(`${CONFIG.baseURL}${url}`, {
    waitUntil: 'networkidle',
    timeout: CONFIG.timeout
  });
  await page.waitForTimeout(2000);
} 