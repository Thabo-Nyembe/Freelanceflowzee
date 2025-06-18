#!/usr/bin/env node

/**
 * Comprehensive Test Script for All Recent Fixes
 * Tests: Font loading, ExternalLink icons, home-page-client module, and Context7 patterns
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: 'test-results/comprehensive-fixes'
};

async function main() {
  console.log('🎭 Starting Comprehensive Fix Validation Tests');
  console.log(`🌐 Testing: ${CONFIG.baseUrl}`);
  
  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  
  const results = {
    critical_fixes: await testCriticalFixes(),
    ui_components: await testUIComponents(),
    context7_patterns: await testContext7Patterns(),
    performance: await testPerformance()
  };
  
  // Generate report
  await generateReport(results);
  
  const totalTests = Object.values(results).reduce((sum, category) => sum + category.total, 0);
  const passedTests = Object.values(results).reduce((sum, category) => sum + category.passed, 0);
  const failedTests = totalTests - passedTests;
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${totalTests}`);
  console.log(`📄 Report: ${CONFIG.outputDir}/report.json`);
  
  if (failedTests > 0) {
    console.log('\n❌ Some tests failed. Check the detailed report.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
  }
}

/**
 * Test critical fixes: fonts, icons, modules
 */
async function testCriticalFixes() {
  console.log('\n🔧 Testing Critical Fixes...');
  
  const tests = [
    { name: 'Font Loading (Inter var)', test: () => testFontLoading() },
    { name: 'Homepage Module Resolution', test: () => testHomepageModule() },
    { name: 'ExternalLink Icon Usage', test: () => testExternalLinkIcon() },
    { name: 'Dashboard Authentication', test: () => testDashboardAuth() }
  ];
  
  return await runTestSuite(tests, 'Critical Fixes');
}

/**
 * Test UI components and styling
 */
async function testUIComponents() {
  console.log('\n🎨 Testing UI Components...');
  
  const tests = [
    { name: 'Luxury White/Purple Theme', test: () => testThemeSystem() },
    { name: 'Navigation Elements', test: () => testNavigation() },
    { name: 'Interactive Buttons', test: () => testButtons() },
    { name: 'Responsive Design', test: () => testResponsive() }
  ];
  
  return await runTestSuite(tests, 'UI Components');
}

/**
 * Test Context7 patterns
 */
async function testContext7Patterns() {
  console.log('\n🧠 Testing Context7 Patterns...');
  
  const tests = [
    { name: 'SEO Metadata', test: () => testSEOMetadata() },
    { name: 'Structured Data', test: () => testStructuredData() },
    { name: 'Progressive Enhancement', test: () => testProgressiveEnhancement() },
    { name: 'Web Vitals', test: () => testWebVitals() }
  ];
  
  return await runTestSuite(tests, 'Context7 Patterns');
}

/**
 * Test performance metrics
 */
async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  const tests = [
    { name: 'Page Load Speed', test: () => testPageLoadSpeed() },
    { name: 'Asset Optimization', test: () => testAssetOptimization() },
    { name: 'Core Web Vitals', test: () => testCoreWebVitals() },
    { name: 'Bundle Size', test: () => testBundleSize() }
  ];
  
  return await runTestSuite(tests, 'Performance');
}

/**
 * Run a test suite
 */
async function runTestSuite(tests, suiteName) {
  const results = { passed: 0, failed: 0, total: tests.length, details: [] };
  
  for (const test of tests) {
    try {
      console.log(`  🔍 ${test.name}...`);
      const result = await test.test();
      
      if (result.success) {
        results.passed++;
        console.log(`    ✅ PASSED`);
      } else {
        results.failed++;
        console.log(`    ❌ FAILED: ${result.error}`);
      }
      
      results.details.push({
        name: test.name,
        success: result.success,
        error: result.error,
        data: result.data
      });
      
    } catch (error) {
      results.failed++;
      results.details.push({
        name: test.name,
        success: false,
        error: error.message
      });
      console.log(`    ❌ ERROR: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Test font loading
 */
async function testFontLoading() {
  try {
    const response = await fetch(`${CONFIG.baseUrl}/fonts/inter-var.woff2`);
    return {
      success: response.ok && response.headers.get('content-type')?.includes('font'),
      error: response.ok ? null : `HTTP ${response.status}`,
      data: { status: response.status, contentType: response.headers.get('content-type') }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test homepage module resolution
 */
async function testHomepageModule() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const hasHomePageClient = html.includes('Create, Share & Get Paid') || html.includes('FreeflowZee');
    const hasProperStructure = html.includes('<html') && html.includes('__NEXT_DATA__');
    
    return {
      success: response.ok && hasHomePageClient && hasProperStructure,
      error: !response.ok ? `HTTP ${response.status}` : !hasHomePageClient ? 'Missing HomePageClient content' : !hasProperStructure ? 'Missing React structure' : null,
      data: { hasHomePageClient, hasProperStructure }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test ExternalLink icon usage
 */
async function testExternalLinkIcon() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    // Check for SVG icons and external link patterns
    const hasIcons = html.includes('<svg') || html.includes('icon');
    const hasExternalLinks = html.includes('target="_blank"') || html.includes('external');
    
    return {
      success: response.ok && hasIcons,
      error: !response.ok ? `HTTP ${response.status}` : !hasIcons ? 'Missing icon elements' : null,
      data: { hasIcons, hasExternalLinks }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test dashboard authentication
 */
async function testDashboardAuth() {
  try {
    const response = await fetch(`${CONFIG.baseUrl}/dashboard`, { redirect: 'manual' });
    
    const isRedirect = [301, 302, 307, 308].includes(response.status);
    const location = response.headers.get('location');
    
    return {
      success: isRedirect && location && (location.includes('login') || location.includes('auth')),
      error: !isRedirect ? 'Expected redirect for protected route' : !location ? 'Missing redirect location' : null,
      data: { status: response.status, location }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test theme system
 */
async function testThemeSystem() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const themeChecks = [
      html.includes('purple') || html.includes('indigo'),
      html.includes('gradient'),
      html.includes('theme-') || html.includes('bg-white'),
      !html.includes('background: black') && !html.includes('bg-black')
    ];
    
    const passedChecks = themeChecks.filter(Boolean).length;
    
    return {
      success: passedChecks >= 3,
      error: passedChecks < 3 ? 'Theme system not fully applied' : null,
      data: { passedChecks, totalChecks: themeChecks.length }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test navigation
 */
async function testNavigation() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const navElements = [
      html.includes('<nav') || html.includes('header'),
      html.includes('logo') || html.includes('FreeflowZee'),
      html.includes('<a ') || html.includes('href=')
    ];
    
    const passedElements = navElements.filter(Boolean).length;
    
    return {
      success: passedElements >= 2,
      error: passedElements < 2 ? 'Navigation elements missing' : null,
      data: { passedElements, totalElements: navElements.length }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test buttons
 */
async function testButtons() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const hasButtons = html.includes('<button') || html.includes('btn');
    const hasInteractiveElements = html.includes('click') || html.includes('hover');
    
    return {
      success: hasButtons,
      error: !hasButtons ? 'Missing button elements' : null,
      data: { hasButtons, hasInteractiveElements }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test responsive design
 */
async function testResponsive() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const responsiveChecks = [
      html.includes('viewport'),
      html.includes('sm:') || html.includes('md:') || html.includes('lg:'),
      html.includes('grid') || html.includes('flex')
    ];
    
    const passedChecks = responsiveChecks.filter(Boolean).length;
    
    return {
      success: passedChecks >= 2,
      error: passedChecks < 2 ? 'Responsive design patterns missing' : null,
      data: { passedChecks, totalChecks: responsiveChecks.length }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test SEO metadata
 */
async function testSEOMetadata() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const seoElements = [
      html.includes('<title>'),
      html.includes('meta name="description"'),
      html.includes('og:title') || html.includes('og:description'),
      html.includes('twitter:card')
    ];
    
    const passedElements = seoElements.filter(Boolean).length;
    
    return {
      success: passedElements >= 3,
      error: passedElements < 3 ? 'SEO metadata incomplete' : null,
      data: { passedElements, totalElements: seoElements.length }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test structured data
 */
async function testStructuredData() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const hasStructuredData = html.includes('application/ld+json');
    const hasSchemaOrg = html.includes('"@type"') && html.includes('"@context"');
    
    return {
      success: hasStructuredData && hasSchemaOrg,
      error: !hasStructuredData ? 'Missing structured data' : !hasSchemaOrg ? 'Invalid schema.org markup' : null,
      data: { hasStructuredData, hasSchemaOrg }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test progressive enhancement
 */
async function testProgressiveEnhancement() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const hasNoscriptFallback = html.includes('<noscript>');
    const hasServerRendering = html.includes('__NEXT_DATA__');
    const hasStaticContent = html.length > 5000; // Reasonable amount of server-rendered content
    
    return {
      success: hasServerRendering && hasStaticContent,
      error: !hasServerRendering ? 'Missing server-side rendering' : !hasStaticContent ? 'Insufficient static content' : null,
      data: { hasNoscriptFallback, hasServerRendering, contentLength: html.length }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test web vitals basics
 */
async function testWebVitals() {
  try {
    const startTime = Date.now();
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    const contentSize = html.length;
    
    const isGoodLoadTime = loadTime < 3000; // Under 3 seconds
    const isReasonableSize = contentSize < 2000000; // Under 2MB
    
    return {
      success: isGoodLoadTime && isReasonableSize,
      error: !isGoodLoadTime ? `Slow load time: ${loadTime}ms` : !isReasonableSize ? `Large content: ${contentSize} bytes` : null,
      data: { loadTime, contentSize }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test page load speed
 */
async function testPageLoadSpeed() {
  try {
    const startTime = Date.now();
    const response = await fetch(CONFIG.baseUrl);
    await response.text();
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    const isGood = loadTime < 2000; // Under 2 seconds
    
    return {
      success: isGood,
      error: !isGood ? `Load time too slow: ${loadTime}ms` : null,
      data: { loadTime }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test asset optimization
 */
async function testAssetOptimization() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const hasCompression = response.headers.get('content-encoding') === 'gzip' || response.headers.get('content-encoding') === 'br';
    const hasCaching = response.headers.get('cache-control') !== null;
    const hasOptimizedImages = html.includes('webp') || html.includes('avif');
    
    return {
      success: hasCaching, // At least caching should be present
      error: !hasCaching ? 'Missing cache headers' : null,
      data: { hasCompression, hasCaching, hasOptimizedImages }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test core web vitals
 */
async function testCoreWebVitals() {
  // This is a simplified test - real CWV would need lighthouse or similar
  return await testPageLoadSpeed();
}

/**
 * Test bundle size (basic check)
 */
async function testBundleSize() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    const scriptTags = (html.match(/<script[^>]*src=/g) || []).length;
    const styleTags = (html.match(/<link[^>]*stylesheet/g) || []).length;
    
    const isReasonable = scriptTags < 20 && styleTags < 10; // Reasonable limits
    
    return {
      success: isReasonable,
      error: !isReasonable ? `Too many assets: ${scriptTags} scripts, ${styleTags} styles` : null,
      data: { scriptTags, styleTags }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate test report
 */
async function generateReport(results) {
  const reportPath = path.join(CONFIG.outputDir, 'report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: Object.values(results).reduce((sum, cat) => sum + cat.total, 0),
      passed: Object.values(results).reduce((sum, cat) => sum + cat.passed, 0),
      failed: Object.values(results).reduce((sum, cat) => sum + cat.failed, 0)
    },
    categories: results
  };
  
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 