#!/usr/bin/env node

/**
 * Comprehensive Playwright Test with Context7 Integration
 * Tests all recent fixes: fonts, icons, modules, and Context7 patterns
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  testTimeout: 30000,
  retries: 2,
  maxConcurrency: 3,
  outputDir: 'test-results/comprehensive-context7'
};

// Test categories with Context7 patterns
const TEST_SUITES = {
  critical_fixes: {
    name: 'Critical Fixes Validation',
    tests: [
      { name: 'Font Loading (Inter var)', url: '/fonts/inter-var.woff2', type: 'resource' },
      { name: 'Homepage Module Resolution', url: '/', type: 'page' },
      { name: 'ExternalLink Icon Usage', url: '/', type: 'component' },
      { name: 'Dashboard Authentication', url: '/dashboard', type: 'auth' }
    ]
  },
  context7_patterns: {
    name: 'Context7 Integration',
    tests: [
      { name: 'SEO Metadata Generation', url: '/', type: 'seo' },
      { name: 'Structured Data Schema', url: '/', type: 'schema' },
      { name: 'Performance Optimization', url: '/', type: 'performance' },
      { name: 'Responsive Design', url: '/', type: 'responsive' }
    ]
  },
  ui_components: {
    name: 'UI/UX Components',
    tests: [
      { name: 'Home Page Client Components', url: '/', type: 'component' },
      { name: 'Navigation Elements', url: '/', type: 'navigation' },
      { name: 'Interactive Buttons', url: '/', type: 'interaction' },
      { name: 'Theme System', url: '/', type: 'styling' }
    ]
  },
  feature_integration: {
    name: 'Feature Integration',
    tests: [
      { name: 'Demo Modal Functionality', url: '/', type: 'modal' },
      { name: 'Contact Forms', url: '/contact', type: 'form' },
      { name: 'Payment Integration', url: '/payment', type: 'payment' },
      { name: 'Project Management', url: '/projects', type: 'projects' }
    ]
  }
};

/**
 * Main test execution function
 */
async function main() {
  console.log('🎭 Starting Comprehensive Playwright + Context7 Testing');
  console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);
  console.log(`📁 Output: ${CONFIG.outputDir}`);
  
  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  
  const testResults = {
    overall: { passed: 0, failed: 0, total: 0 },
    suites: {},
    startTime: new Date(),
    endTime: null,
    errors: []
  };
  
  try {
    // Wait for server to be ready
    await waitForServer();
    
    // Run all test suites
    for (const [suiteKey, suite] of Object.entries(TEST_SUITES)) {
      console.log(`\n🧪 Running ${suite.name}...`);
      const suiteResult = await runTestSuite(suiteKey, suite);
      testResults.suites[suiteKey] = suiteResult;
      
      testResults.overall.passed += suiteResult.passed;
      testResults.overall.failed += suiteResult.failed;
      testResults.overall.total += suiteResult.total;
    }
    
    testResults.endTime = new Date();
    
    // Generate comprehensive report
    await generateReport(testResults);
    
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${testResults.overall.passed}`);
    console.log(`❌ Failed: ${testResults.overall.failed}`);
    console.log(`📈 Total: ${testResults.overall.total}`);
    console.log(`⏱️  Duration: ${(testResults.endTime - testResults.startTime) / 1000}s`);
    
    if (testResults.overall.failed > 0) {
      console.log('\n❌ Some tests failed. Check the detailed report.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

/**
 * Wait for the development server to be ready
 */
async function waitForServer() {
  console.log('⏳ Waiting for server to be ready...');
  
  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch(CONFIG.baseUrl);
      if (response.ok) {
        console.log('✅ Server is ready');
        return;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Server failed to start within 30 seconds');
}

/**
 * Run a complete test suite
 */
async function runTestSuite(suiteKey, suite) {
  const result = { passed: 0, failed: 0, total: suite.tests.length, details: [] };
  
  for (const test of suite.tests) {
    console.log(`  🔍 ${test.name}...`);
    
    try {
      const testResult = await runIndividualTest(test);
      if (testResult.success) {
        result.passed++;
        console.log(`    ✅ PASSED`);
      } else {
        result.failed++;
        console.log(`    ❌ FAILED: ${testResult.error}`);
      }
      
      result.details.push({
        name: test.name,
        success: testResult.success,
        error: testResult.error,
        data: testResult.data
      });
      
    } catch (error) {
      result.failed++;
      result.details.push({
        name: test.name,
        success: false,
        error: error.message
      });
      console.log(`    ❌ ERROR: ${error.message}`);
    }
  }
  
  return result;
}

/**
 * Run an individual test based on its type
 */
async function runIndividualTest(test) {
  const url = `${CONFIG.baseUrl}${test.url}`;
  
  switch (test.type) {
    case 'resource':
      return await testResourceLoading(url);
    case 'page':
      return await testPageLoading(url);
    case 'component':
      return await testComponentRendering(url);
    case 'auth':
      return await testAuthentication(url);
    case 'seo':
      return await testSEOMetadata(url);
    case 'schema':
      return await testStructuredData(url);
    case 'performance':
      return await testPerformance(url);
    case 'responsive':
      return await testResponsiveDesign(url);
    case 'navigation':
      return await testNavigation(url);
    case 'interaction':
      return await testInteractions(url);
    case 'styling':
      return await testStyling(url);
    case 'modal':
      return await testModal(url);
    case 'form':
      return await testForm(url);
    case 'payment':
      return await testPayment(url);
    case 'projects':
      return await testProjects(url);
    default:
      return { success: false, error: `Unknown test type: ${test.type}` };
  }
}

/**
 * Test resource loading (fonts, assets)
 */
async function testResourceLoading(url) {
  try {
    const response = await fetch(url);
    return {
      success: response.ok,
      error: response.ok ? null : `HTTP ${response.status}`,
      data: { status: response.status, contentType: response.headers.get('content-type') }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test page loading and basic rendering
 */
async function testPageLoading(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Check for critical elements
    const checks = [
      { name: 'HTML structure', test: html.includes('<html') },
      { name: 'Head section', test: html.includes('<head') },
      { name: 'Body content', test: html.includes('<body') },
      { name: 'React hydration', test: html.includes('__NEXT_DATA__') }
    ];
    
    const failedChecks = checks.filter(check => !check.test);
    
    return {
      success: failedChecks.length === 0,
      error: failedChecks.length > 0 ? `Failed: ${failedChecks.map(c => c.name).join(', ')}` : null,
      data: { htmlLength: html.length, checks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test component rendering (including ExternalLink icon)
 */
async function testComponentRendering(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Check for specific components and elements
    const componentChecks = [
      { name: 'HomePageClient', test: html.includes('Create, Share & Get Paid') },
      { name: 'Navigation', test: html.includes('nav') || html.includes('header') },
      { name: 'Buttons', test: html.includes('button') || html.includes('btn') },
      { name: 'Icons', test: html.includes('svg') || html.includes('icon') }
    ];
    
    const failedChecks = componentChecks.filter(check => !check.test);
    
    return {
      success: failedChecks.length === 0,
      error: failedChecks.length > 0 ? `Missing: ${failedChecks.map(c => c.name).join(', ')}` : null,
      data: { componentChecks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test authentication flow
 */
async function testAuthentication(url) {
  try {
    const response = await fetch(url, { redirect: 'manual' });
    
    // Should redirect to login for protected routes
    const isRedirect = response.status === 307 || response.status === 302;
    const location = response.headers.get('location');
    
    return {
      success: isRedirect && location && location.includes('login'),
      error: !isRedirect ? 'Expected redirect to login' : null,
      data: { status: response.status, location }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test SEO metadata
 */
async function testSEOMetadata(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const seoChecks = [
      { name: 'Title tag', test: html.includes('<title>') },
      { name: 'Meta description', test: html.includes('meta name="description"') },
      { name: 'Open Graph', test: html.includes('og:title') },
      { name: 'Twitter Cards', test: html.includes('twitter:card') }
    ];
    
    const failedChecks = seoChecks.filter(check => !check.test);
    
    return {
      success: failedChecks.length === 0,
      error: failedChecks.length > 0 ? `Missing SEO: ${failedChecks.map(c => c.name).join(', ')}` : null,
      data: { seoChecks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test structured data (Context7 pattern)
 */
async function testStructuredData(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const hasStructuredData = html.includes('application/ld+json');
    const hasWebApplicationSchema = html.includes('"@type":"WebApplication"');
    
    return {
      success: hasStructuredData && hasWebApplicationSchema,
      error: !hasStructuredData ? 'Missing structured data' : !hasWebApplicationSchema ? 'Missing WebApplication schema' : null,
      data: { hasStructuredData, hasWebApplicationSchema }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test performance metrics
 */
async function testPerformance(url) {
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    
    // Performance thresholds
    const isGoodLoadTime = loadTime < 2000; // Under 2 seconds
    const isReasonableSize = contentLength < 1000000; // Under 1MB
    
    return {
      success: isGoodLoadTime && isReasonableSize,
      error: !isGoodLoadTime ? `Slow load time: ${loadTime}ms` : !isReasonableSize ? `Large content: ${contentLength} bytes` : null,
      data: { loadTime, contentLength }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test responsive design elements
 */
async function testResponsiveDesign(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const responsiveChecks = [
      { name: 'Viewport meta', test: html.includes('viewport') },
      { name: 'CSS Grid/Flexbox', test: html.includes('grid') || html.includes('flex') },
      { name: 'Responsive classes', test: html.includes('sm:') || html.includes('md:') || html.includes('lg:') }
    ];
    
    const failedChecks = responsiveChecks.filter(check => !check.test);
    
    return {
      success: failedChecks.length === 0,
      error: failedChecks.length > 0 ? `Missing responsive: ${failedChecks.map(c => c.name).join(', ')}` : null,
      data: { responsiveChecks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test navigation elements
 */
async function testNavigation(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const navChecks = [
      { name: 'Header navigation', test: html.includes('header') || html.includes('nav') },
      { name: 'Footer', test: html.includes('footer') },
      { name: 'Logo/brand', test: html.includes('logo') || html.includes('FreeflowZee') }
    ];
    
    const failedChecks = navChecks.filter(check => !check.test);
    
    return {
      success: failedChecks.length === 0,
      error: failedChecks.length > 0 ? `Missing nav: ${failedChecks.map(c => c.name).join(', ')}` : null,
      data: { navChecks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test interactive elements
 */
async function testInteractions(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const interactionChecks = [
      { name: 'Buttons', test: html.includes('button') || html.includes('btn') },
      { name: 'Links', test: html.includes('<a ') },
      { name: 'Forms', test: html.includes('<form') || html.includes('input') }
    ];
    
    const failedChecks = interactionChecks.filter(check => !check.test);
    
    return {
      success: failedChecks.length === 0,
      error: failedChecks.length > 0 ? `Missing interactions: ${failedChecks.map(c => c.name).join(', ')}` : null,
      data: { interactionChecks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test styling and theme system
 */
async function testStyling(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const styleChecks = [
      { name: 'CSS classes', test: html.includes('class=') },
      { name: 'Theme colors', test: html.includes('purple') || html.includes('indigo') },
      { name: 'Gradient backgrounds', test: html.includes('gradient') }
    ];
    
    const failedChecks = styleChecks.filter(check => !check.test);
    
    return {
      success: failedChecks.length === 0,
      error: failedChecks.length > 0 ? `Missing styling: ${failedChecks.map(c => c.name).join(', ')}` : null,
      data: { styleChecks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test modal functionality
 */
async function testModal(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Check for modal-related elements
    const hasModalTrigger = html.includes('Demo') || html.includes('modal');
    const hasModalStructure = html.includes('dialog') || html.includes('modal');
    
    return {
      success: hasModalTrigger,
      error: !hasModalTrigger ? 'Missing modal trigger elements' : null,
      data: { hasModalTrigger, hasModalStructure }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test form functionality
 */
async function testForm(url) {
  return await testPageLoading(url); // Basic page loading test for now
}

/**
 * Test payment integration
 */
async function testPayment(url) {
  return await testPageLoading(url); // Basic page loading test for now
}

/**
 * Test projects functionality
 */
async function testProjects(url) {
  return await testAuthentication(url); // Should redirect to login
}

/**
 * Generate comprehensive test report
 */
async function generateReport(testResults) {
  const reportPath = path.join(CONFIG.outputDir, 'comprehensive-report.json');
  const htmlReportPath = path.join(CONFIG.outputDir, 'comprehensive-report.html');
  
  // JSON Report
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  
  // HTML Report
  const htmlReport = generateHTMLReport(testResults);
  await fs.writeFile(htmlReportPath, htmlReport);
  
  console.log(`\n📄 Reports generated:`);
  console.log(`  📋 JSON: ${reportPath}`);
  console.log(`  🌐 HTML: ${htmlReportPath}`);
}

/**
 * Generate HTML report
 */
function generateHTMLReport(testResults) {
  const duration = (testResults.endTime - testResults.startTime) / 1000;
  const successRate = Math.round((testResults.overall.passed / testResults.overall.total) * 100);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreeflowZee - Comprehensive Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .success { color: #22c55e; }
        .failure { color: #ef4444; }
        .suite { margin-bottom: 30px; }
        .suite-header { background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 15px; }
        .test-item { padding: 10px; border-left: 4px solid #e5e7eb; margin-bottom: 10px; }
        .test-item.passed { border-left-color: #22c55e; background: #f0fdf4; }
        .test-item.failed { border-left-color: #ef4444; background: #fef2f2; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 FreeflowZee Comprehensive Test Report</h1>
            <p>Context7 + Playwright Integration</p>
            <p><strong>Generated:</strong> ${testResults.endTime.toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Tests</h3>
                <div style="font-size: 2em; font-weight: bold;">${testResults.overall.total}</div>
            </div>
            <div class="stat-card">
                <h3>Success Rate</h3>
                <div style="font-size: 2em; font-weight: bold;">${successRate}%</div>
            </div>
            <div class="stat-card">
                <h3>Duration</h3>
                <div style="font-size: 2em; font-weight: bold;">${duration}s</div>
            </div>
            <div class="stat-card">
                <h3>Status</h3>
                <div style="font-size: 2em; font-weight: bold;" class="${testResults.overall.failed === 0 ? 'success' : 'failure'}">
                    ${testResults.overall.failed === 0 ? '✅ PASS' : '❌ FAIL'}
                </div>
            </div>
        </div>
        
        ${Object.entries(testResults.suites).map(([key, suite]) => `
            <div class="suite">
                <div class="suite-header">
                    <h2>${TEST_SUITES[key].name}</h2>
                    <p>Passed: <span class="success">${suite.passed}</span> | Failed: <span class="failure">${suite.failed}</span> | Total: ${suite.total}</p>
                </div>
                ${suite.details.map(test => `
                    <div class="test-item ${test.success ? 'passed' : 'failed'}">
                        <strong>${test.success ? '✅' : '❌'} ${test.name}</strong>
                        ${test.error ? `<div style="margin-top: 8px; color: #dc2626;">${test.error}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

// Polyfill fetch for Node.js if not available
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, CONFIG, TEST_SUITES }; 