#!/usr/bin/env node

/**
 * 🎯 COMPREHENSIVE UPLOAD/DOWNLOAD FUNCTIONALITY TEST
 * 
 * This script systematically tests every upload and download button across
 * the FreeflowZee application using Context7 MCP best practices and 
 * Playwright automation. It validates file operations, API integrations,
 * and user interactions.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Test configuration based on Context7 best practices
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  viewport: { width: 1280, height: 720 },
  testMode: true,
  uploadTestFiles: {
    image: 'public/media/placeholder-image.jpg',
    video: 'public/media/placeholder-video.mp4',
    audio: 'public/media/placeholder-audio.wav',
    document: 'public/media/placeholder-doc.pdf'
  }
};

// Test scenarios from Context7 documentation
const TEST_SCENARIOS = [
  {
    name: 'Files Hub Upload/Download',
    url: '/dashboard/files-hub',
    uploadBtn: 'button[data-testid= "upload-file-btn"]',
    downloadBtn: 'button[data-testid= "download-file-btn"]',
    fileInput: 'input[type= "file"]',
    description: 'Main file management hub with multi-cloud storage'
  },
  {
    name: 'Projects Hub File Operations',
    url: '/dashboard/projects-hub',
    uploadBtn: 'button:has-text("Upload")',
    downloadBtn: 'button:has(svg[data-testid= "Download"])',
    description: 'Project-specific file uploads and downloads'
  },
  {
    name: 'Gallery Downloads',
    url: '/dashboard/gallery',
    downloadBtn: 'button:has(svg[data-testid= "Download"])',
    description: 'Client gallery file downloads'
  },
  {
    name: 'Invoices PDF Download',
    url: '/dashboard/invoices',
    downloadBtn: 'button:has-text("Download")',
    description: 'Invoice PDF generation and download'
  },
  {
    name: 'Analytics Reports Download',
    url: '/dashboard/analytics',
    downloadBtn: 'button:has-text("Export")',
    description: 'Analytics data export functionality'
  },
  {
    name: 'Client Zone Downloads',
    url: '/dashboard/client-zone',
    downloadBtn: 'button:has(svg[data-testid= "Download"])',
    description: 'Client access file downloads'
  },
  {
    name: 'AI Create Asset Downloads',
    url: '/dashboard/ai-create',
    downloadBtn: 'button:has-text("Download")',
    description: 'AI-generated asset downloads'
  },
  {
    name: 'Video Studio Export',
    url: '/dashboard/video-studio',
    downloadBtn: 'button:has-text("Export")',
    description: 'Video project export functionality'
  }
];

// Enhanced test results tracking
class TestReporter {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      scenarios: [],
      startTime: new Date(),
      endTime: null
    };
  }

  addResult(scenario, status, details = {}) {
    this.results.total++;
    if (status === 'passed') {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
    
    this.results.scenarios.push({
      name: scenario,
      status,
      timestamp: new Date(),
      ...details
    });
  }

  generateReport() {
    this.results.endTime = new Date();
    const duration = this.results.endTime - this.results.startTime;
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);

    console.log('\n' + '='.repeat(80));'
    console.log('🎯 COMPREHENSIVE UPLOAD/DOWNLOAD TEST RESULTS');
    console.log('='.repeat(80));'
    console.log(`\n📊 SUMMARY:`);
    console.log(`   • Total Tests: ${this.results.total}`);
    console.log(`   • Passed: ${this.results.passed} ✅`);
    console.log(`   • Failed: ${this.results.failed} ❌`);
    console.log(`   • Success Rate: ${successRate}%`);
    console.log(`   • Duration: ${(duration / 1000).toFixed(2)}s`);

    console.log(`\n📝 DETAILED RESULTS:`);
    this.results.scenarios.forEach((result, index) => {
      const status = result.status === 'passed' ? '✅' : '❌';
      console.log(`   ${index + 1}. ${result.name} ${status}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
      if (result.uploadTime) {
        console.log(`      Upload Time: ${result.uploadTime}ms`);
      }
      if (result.downloadTime) {
        console.log(`      Download Time: ${result.downloadTime}ms`);
      }
    });

    console.log('\n' + '='.repeat(80));'
    return this.results;
  }
}

// Enhanced file operations using Context7 patterns
class FileOperationTester {
  constructor(page) {
    this.page = page;
  }

  async testUpload(uploadBtn, fileInput, testFile) {
    const startTime = Date.now();
    try {
      // Click upload button to trigger file input
      await this.page.click(uploadBtn);
      
      // Set file input
      await this.page.setInputFiles(fileInput, testFile);
      
      // Wait for upload to complete (look for success indicators)
      await this.page.waitForSelector('text=uploaded successfully', { timeout: 10000 });
      
      const endTime = Date.now();
      return {
        success: true,
        uploadTime: endTime - startTime,
        fileSize: (await fs.stat(testFile)).size
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        uploadTime: Date.now() - startTime
      };
    }
  }

  async testDownload(downloadBtn) {
    const startTime = Date.now();
    try {
      // Set up download event listener
      const downloadPromise = this.page.waitForEvent('download', { timeout: 10000 });
      
      // Click download button
      await this.page.click(downloadBtn);
      
      // Wait for download to start
      const download = await downloadPromise;
      
      const endTime = Date.now();
      return {
        success: true,
        downloadTime: endTime - startTime,
        filename: download.suggestedFilename(),
        url: download.url()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        downloadTime: Date.now() - startTime
      };
    }
  }

  async testAPIEndpoint(endpoint, method = 'GET') {
    try {
      const response = await this.page.request[method.toLowerCase()](endpoint);
      return {
        success: response.ok(),
        status: response.status(),
        statusText: response.statusText()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Enhanced authentication using Context7 patterns
async function authenticateUser(page) {
  try {
    console.log('🔐 Authenticating user...');
    
    // Check if already authenticated
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`, { waitUntil: 'networkidle' });
      await page.waitForSelector('h1', { timeout: 5000 });
      console.log('✅ Already authenticated');
      return true;
    } catch {
      // Need to login
    }

    // Go to login page
    await page.goto(`${TEST_CONFIG.baseUrl}/login`);
    
    // Fill login form (test mode bypass)
    await page.fill('input[type= "email"]', 'test@example.com');
    await page.fill('input[type= "password"]', 'password');
    
    // Submit form
    await page.click('button[type= "submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }
}

// Enhanced Context7 test runner
async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Upload/Download Test Suite');
  console.log('Using Context7 MCP best practices with Playwright automation\n');

  const reporter = new TestReporter();
  let browser, context, page;

  try {
    // Launch browser with Context7 recommended settings
    browser = await chromium.launch({
      headless: false, // Visual debugging
      slowMo: 100,    // Slower for observation
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });

    context = await browser.newContext({
      viewport: TEST_CONFIG.viewport,
      extraHTTPHeaders: {
        'X-Test-Mode': 'true' // Enable test mode
      },
      permissions: ['downloads']
    });

    page = await context.newPage();
    const fileTester = new FileOperationTester(page);

    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`💬 Console Error: ${msg.text()}`);
      }
    });

    // Authenticate user
    const authSuccess = await authenticateUser(page);
    if (!authSuccess) {
      throw new Error('Authentication failed - cannot proceed with tests');
    }

    // Test 1: API Endpoints
    console.log('\n📡 Testing API Endpoints...');
    const apiTests = [
      { endpoint: '/api/storage/upload', method: 'POST' },
      { endpoint: '/api/storage/download', method: 'GET' },
      { endpoint: '/api/projects', method: 'GET' },
      { endpoint: '/api/analytics/dashboard', method: 'GET' }
    ];

    for (const apiTest of apiTests) {
      const result = await fileTester.testAPIEndpoint(
        `${TEST_CONFIG.baseUrl}${apiTest.endpoint}`,
        apiTest.method
      );
      
      reporter.addResult(
        `API ${apiTest.method} ${apiTest.endpoint}`,
        result.success ? 'passed' : 'failed',
        { error: result.error, status: result.status }
      );
    }

    // Test 2: Upload/Download Scenarios
    console.log('\n📁 Testing Upload/Download Scenarios...');
    
    for (const scenario of TEST_SCENARIOS) {
      console.log(`\n🔍 Testing: ${scenario.name}`);
      
      try {
        // Navigate to scenario page
        await page.goto(`${TEST_CONFIG.baseUrl}${scenario.url}`, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });

        // Wait for page to stabilize
        await page.waitForTimeout(2000);

        // Test upload if scenario supports it
        if (scenario.uploadBtn && scenario.fileInput) {
          console.log('   📤 Testing upload...');
          
          const uploadResult = await fileTester.testUpload(
            scenario.uploadBtn,
            scenario.fileInput,
            TEST_CONFIG.uploadTestFiles.image
          );

          reporter.addResult(
            `${scenario.name} - Upload`,
            uploadResult.success ? 'passed' : 'failed',
            uploadResult
          );
        }

        // Test download
        if (scenario.downloadBtn) {
          console.log('   📥 Testing download...');
          
          // First check if download button exists
          const downloadBtnExists = await page.locator(scenario.downloadBtn).count() > 0;
          
          if (downloadBtnExists) {
            const downloadResult = await fileTester.testDownload(scenario.downloadBtn);
            
            reporter.addResult(
              `${scenario.name} - Download`,
              downloadResult.success ? 'passed' : 'failed',
              downloadResult
            );
          } else {
            reporter.addResult(
              `${scenario.name} - Download`, 'failed',
              { error: 'Download button not found' }
            );
          }
        }

        console.log(`   ✅ ${scenario.name} completed`);

      } catch (error) {
        console.log(`   ❌ ${scenario.name} failed: ${error.message}`);
        reporter.addResult(
          scenario.name, 'failed',
          { error: error.message }
        );
      }
    }

    // Test 3: Bulk Operations
    console.log('\n📦 Testing Bulk Operations...');
    
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/files-hub`);
      
      // Test multiple file selection
      const fileItems = page.locator('[data-testid= "file-item"]');
      const fileCount = await fileItems.count();
      
      if (fileCount > 0) {
        // Select multiple files
        for (let i = 0; i < Math.min(3, fileCount); i++) {
          await fileItems.nth(i).click();
        }
        
        // Test bulk download
        const bulkDownloadBtn = page.locator('button:has-text("Download Selected")');
        const bulkDownloadExists = await bulkDownloadBtn.count() > 0;
        
        if (bulkDownloadExists) {
          await bulkDownloadBtn.click();
          reporter.addResult('Bulk Download', 'passed');
        } else {
          reporter.addResult('Bulk Download', 'failed', { error: 'Bulk download not available' });
        }
      }
    } catch (error) {
      reporter.addResult('Bulk Operations', 'failed', { error: error.message });
    }

    // Test 4: File Type Validation
    console.log('\n🔍 Testing File Type Validation...');
    
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/files-hub`);
      
      // Test different file types
      const fileTypes = Object.entries(TEST_CONFIG.uploadTestFiles);
      
      for (const [type, filePath] of fileTypes) {
        try {
          const uploadResult = await fileTester.testUpload(
            'button[data-testid= "upload-file-btn"]', 'input[type= "file"]',
            filePath
          );
          
          reporter.addResult(
            `File Type Validation - ${type}`,
            uploadResult.success ? 'passed' : 'failed',
            uploadResult
          );
        } catch (error) {
          reporter.addResult(
            `File Type Validation - ${type}`, 'failed',
            { error: error.message }
          );
        }
      }
    } catch (error) {
      console.log(`File type validation failed: ${error.message}`);
    }

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    reporter.addResult('Test Suite Execution', 'failed', { error: error.message });
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
  }

  // Generate and display final report
  const finalReport = reporter.generateReport();
  
  // Save report to file
  const reportPath = path.join(__dirname, '..', 'test-reports', `upload-download-test-${Date.now()}.json`);
  try {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(finalReport, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`⚠️  Could not save report: ${error.message}`);
  }

  // Return success/failure for CI
  return finalReport.failed === 0;
}

// Execute test suite
if (require.main === module) {
  runComprehensiveTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveTest, TEST_SCENARIOS, TEST_CONFIG }; 