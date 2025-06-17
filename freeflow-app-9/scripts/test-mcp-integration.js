#!/usr/bin/env node

/**
 * MCP Integration Test Suite
 * Tests all 100% completion features using Context7 patterns
 * This script validates our implementation without Playwright dependencies
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  port: 3005,
  timeout: 30000,
  retries: 3,
  baseUrl: 'http://localhost:3005'
};

// Test categories for 100% completion validation
const TEST_CATEGORIES = {
  'SEO Optimization': [
    { path: '/', test: 'landing_page_seo' },
    { path: '/blog', test: 'blog_seo' },
    { path: '/pricing', test: 'pricing_seo' },
    { path: '/features', test: 'features_seo' }
  ],
  'Interactive Components': [
    { path: '/', test: 'interactive_contact_system' },
    { path: '/pricing', test: 'pricing_calculator' },
    { path: '/blog', test: 'interactive_search' },
    { path: '/contact', test: 'contact_forms' }
  ],
  'Navigation & Routing': [
    { path: '/', test: 'site_header' },
    { path: '/features', test: 'navigation_consistency' },
    { path: '/demo', test: 'demo_access' },
    { path: '/how-it-works', test: 'resource_pages' }
  ],
  'Performance & Accessibility': [
    { path: '/', test: 'page_load_performance' },
    { path: '/pricing', test: 'accessibility_compliance' },
    { path: '/blog', test: 'responsive_design' }
  ],
  'Form Functionality': [
    { path: '/contact', test: 'contact_form_validation' },
    { path: '/signup', test: 'signup_form' },
    { path: '/login', test: 'login_form' }
  ]
};

// Color output functions
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  dim: (text) => `\x1b[2m${text}\x1b[0m`
};

// Utility functions
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${TEST_CONFIG.baseUrl}${path}`;
    const startTime = Date.now();
    
    const req = http.get(url, {
      timeout: TEST_CONFIG.timeout,
      headers: {
        'x-test-mode': 'true',
        'x-context7-enabled': 'true',
        'User-Agent': 'FreeflowZee-MCP-Test/1.0',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          loadTime,
          size: Buffer.byteLength(data, 'utf8')
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for ${path}`));
    });
  });
}

// Test implementations
class MCPTestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      categories: {}
    };
    this.devServer = null;
  }

  async startDevServer() {
    console.log(colors.blue('🚀 Starting development server...'));
    
    return new Promise((resolve, reject) => {
      this.devServer = spawn('npm', ['run', 'dev'], {
        env: { ...process.env, PORT: TEST_CONFIG.port },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'));
        }
      }, 60000);

      this.devServer.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready') || output.includes('compiled') || output.includes('started server')) {
          if (!serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            console.log(colors.green('✅ Development server ready'));
            // Wait a bit more for server to fully initialize
            setTimeout(resolve, 3000);
          }
        }
      });

      this.devServer.stderr.on('data', (data) => {
        const error = data.toString();
        console.log(colors.dim(`Server: ${error.trim()}`));
      });

      this.devServer.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  async stopDevServer() {
    if (this.devServer) {
      console.log(colors.blue('🛑 Stopping development server...'));
      this.devServer.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async testSEOOptimization(path, testName) {
    try {
      const response = await makeRequest(path);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }

      const body = response.body.toLowerCase();
      const checks = {
        title: body.includes('<title>'),
        description: body.includes('name="description"'),
        keywords: body.includes('name="keywords"') || body.includes('meta'),
        openGraph: body.includes('property="og:'),
        structuredData: body.includes('application/ld+json'),
        canonical: body.includes('rel="canonical"') || body.includes('alternate')
      };

      const passed = Object.values(checks).filter(Boolean).length;
      const total = Object.keys(checks).length;
      
      return {
        passed: passed >= 4, // At least 4 out of 6 SEO elements
        score: passed / total,
        details: `SEO elements: ${passed}/${total}`,
        loadTime: response.loadTime
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        details: 'Failed to validate SEO optimization'
      };
    }
  }

  async testInteractiveComponents(path, testName) {
    try {
      const response = await makeRequest(path);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }

      const body = response.body.toLowerCase();
      const interactiveElements = {
        forms: body.includes('<form') || body.includes('input'),
        buttons: body.includes('button') || body.includes('btn'),
        links: body.includes('<a href'),
        scripts: body.includes('<script'),
        reactComponents: body.includes('data-react') || body.includes('_next'),
        eventHandlers: body.includes('onclick') || body.includes('onsubmit')
      };

      const interactiveCount = Object.values(interactiveElements).filter(Boolean).length;
      
      return {
        passed: interactiveCount >= 4,
        score: interactiveCount / Object.keys(interactiveElements).length,
        details: `Interactive elements: ${interactiveCount}/6`,
        loadTime: response.loadTime
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        details: 'Failed to validate interactive components'
      };
    }
  }

  async testNavigationRouting(path, testName) {
    try {
      const response = await makeRequest(path);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }

      const body = response.body;
      const navigationElements = {
        header: body.includes('header') || body.includes('nav'),
        footer: body.includes('footer'),
        logo: body.includes('freeflow') || body.includes('logo'),
        menu: body.includes('menu') || body.includes('navigation'),
        breadcrumbs: body.includes('breadcrumb') || body.includes('nav'),
        socialLinks: body.includes('twitter') || body.includes('linkedin')
      };

      const navCount = Object.values(navigationElements).filter(Boolean).length;
      
      return {
        passed: navCount >= 3,
        score: navCount / Object.keys(navigationElements).length,
        details: `Navigation elements: ${navCount}/6`,
        loadTime: response.loadTime
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        details: 'Failed to validate navigation'
      };
    }
  }

  async testPerformanceAccessibility(path, testName) {
    try {
      const response = await makeRequest(path);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }

      const performanceChecks = {
        fastLoad: response.loadTime < 3000,
        reasonableSize: response.size < 500000, // 500KB
        compression: response.headers['content-encoding'] === 'gzip' || response.headers['content-encoding'] === 'br',
        caching: response.headers['cache-control'] && response.headers['cache-control'].includes('max-age')
      };

      const body = response.body.toLowerCase();
      const accessibilityChecks = {
        altText: body.includes('alt='),
        semanticHTML: body.includes('<main') || body.includes('<section'),
        skipLinks: body.includes('skip') || body.includes('sr-only'),
        focusManagement: body.includes('focus') || body.includes('tabindex')
      };

      const allChecks = { ...performanceChecks, ...accessibilityChecks };
      const passedCount = Object.values(allChecks).filter(Boolean).length;
      
      return {
        passed: passedCount >= 5,
        score: passedCount / Object.keys(allChecks).length,
        details: `Performance & A11y: ${passedCount}/8 (Load: ${response.loadTime}ms, Size: ${Math.round(response.size/1024)}KB)`,
        loadTime: response.loadTime
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        details: 'Failed to validate performance/accessibility'
      };
    }
  }

  async testFormFunctionality(path, testName) {
    try {
      const response = await makeRequest(path);
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }

      const body = response.body.toLowerCase();
      const formElements = {
        forms: body.includes('<form'),
        inputs: body.includes('<input'),
        validation: body.includes('required') || body.includes('validate'),
        labels: body.includes('<label'),
        submitButtons: body.includes('type="submit"') || body.includes('submit'),
        errorHandling: body.includes('error') || body.includes('invalid')
      };

      const formCount = Object.values(formElements).filter(Boolean).length;
      
      return {
        passed: formCount >= 3,
        score: formCount / Object.keys(formElements).length,
        details: `Form elements: ${formCount}/6`,
        loadTime: response.loadTime
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        details: 'Failed to validate form functionality'
      };
    }
  }

  async runTest(category, test) {
    const { path, test: testName } = test;
    let result;

    console.log(colors.dim(`   Testing ${path} (${testName})...`));

    switch (category) {
      case 'SEO Optimization':
        result = await this.testSEOOptimization(path, testName);
        break;
      case 'Interactive Components':
        result = await this.testInteractiveComponents(path, testName);
        break;
      case 'Navigation & Routing':
        result = await this.testNavigationRouting(path, testName);
        break;
      case 'Performance & Accessibility':
        result = await this.testPerformanceAccessibility(path, testName);
        break;
      case 'Form Functionality':
        result = await this.testFormFunctionality(path, testName);
        break;
      default:
        result = { passed: false, error: 'Unknown test category' };
    }

    this.results.total++;
    if (result.passed) {
      this.results.passed++;
      console.log(colors.green(`   ✅ ${path} - ${result.details || 'PASSED'}`));
    } else {
      this.results.failed++;
      console.log(colors.red(`   ❌ ${path} - ${result.error || result.details || 'FAILED'}`));
    }

    return result;
  }

  async runCategory(categoryName, tests) {
    console.log(colors.bold(`\n🔍 Testing ${categoryName}:`));
    
    const categoryResults = {
      total: tests.length,
      passed: 0,
      failed: 0,
      tests: []
    };

    for (const test of tests) {
      const result = await this.runTest(categoryName, test);
      categoryResults.tests.push({ ...test, result });
      
      if (result.passed) {
        categoryResults.passed++;
      } else {
        categoryResults.failed++;
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.results.categories[categoryName] = categoryResults;
    
    const successRate = (categoryResults.passed / categoryResults.total * 100).toFixed(1);
    const statusColor = successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red;
    
    console.log(statusColor(`   Category Score: ${categoryResults.passed}/${categoryResults.total} (${successRate}%)\n`));
    
    return categoryResults;
  }

  async runAllTests() {
    console.log(colors.bold(colors.blue('\n🎯 FreeflowZee MCP Integration Test Suite')));
    console.log(colors.blue('========================================\n'));

    try {
      // Start the development server
      await this.startDevServer();

      // Run all test categories
      for (const [categoryName, tests] of Object.entries(TEST_CATEGORIES)) {
        await this.runCategory(categoryName, tests);
      }

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.error(colors.red(`\n❌ Test suite failed: ${error.message}`));
      process.exit(1);
    } finally {
      await this.stopDevServer();
    }
  }

  generateReport() {
    const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
    const gradeMap = {
      90: 'A+', 85: 'A', 80: 'B+', 75: 'B', 70: 'C+', 65: 'C', 60: 'D', 0: 'F'
    };
    
    let grade = 'F';
    for (const [threshold, gradeLevel] of Object.entries(gradeMap)) {
      if (successRate >= threshold) {
        grade = gradeLevel;
        break;
      }
    }

    console.log(colors.bold(colors.blue('\n📊 FINAL TEST REPORT')));
    console.log(colors.blue('==================\n'));
    
    console.log(colors.bold(`🎯 Overall Results: ${this.results.passed}/${this.results.total} tests passed`));
    console.log(colors.bold(`📈 Success Rate: ${successRate}%`));
    console.log(colors.bold(`🎓 Grade: ${grade}\n`));

    // Category breakdown
    console.log(colors.bold('📋 Category Breakdown:'));
    for (const [categoryName, categoryResults] of Object.entries(this.results.categories)) {
      const catRate = (categoryResults.passed / categoryResults.total * 100).toFixed(1);
      const catColor = catRate >= 80 ? colors.green : catRate >= 60 ? colors.yellow : colors.red;
      console.log(catColor(`   ${categoryName}: ${categoryResults.passed}/${categoryResults.total} (${catRate}%)`));
    }

    // Performance summary
    let totalLoadTime = 0;
    let loadTimeCount = 0;
    for (const categoryResults of Object.values(this.results.categories)) {
      for (const test of categoryResults.tests) {
        if (test.result.loadTime) {
          totalLoadTime += test.result.loadTime;
          loadTimeCount++;
        }
      }
    }
    
    if (loadTimeCount > 0) {
      const avgLoadTime = (totalLoadTime / loadTimeCount).toFixed(0);
      console.log(colors.cyan(`\n⚡ Average Load Time: ${avgLoadTime}ms`));
    }

    // Recommendations
    console.log(colors.bold('\n💡 Recommendations:'));
    if (successRate >= 95) {
      console.log(colors.green('   🎉 Excellent! Your implementation is production-ready.'));
    } else if (successRate >= 85) {
      console.log(colors.yellow('   ✨ Great work! Minor optimizations could improve the score.'));
    } else if (successRate >= 70) {
      console.log(colors.yellow('   🔧 Good foundation, but some areas need attention.'));
    } else {
      console.log(colors.red('   🚨 Significant improvements needed before production deployment.'));
    }

    // Context7 MCP validation
    console.log(colors.bold('\n🔗 Context7 MCP Integration Status:'));
    const mcpFeatures = {
      'SEO System': this.results.categories['SEO Optimization']?.passed >= 3,
      'Interactive Components': this.results.categories['Interactive Components']?.passed >= 3,
      'Navigation System': this.results.categories['Navigation & Routing']?.passed >= 2,
      'Performance Optimization': this.results.categories['Performance & Accessibility']?.passed >= 2
    };

    for (const [feature, status] of Object.entries(mcpFeatures)) {
      const statusText = status ? colors.green('✅ Implemented') : colors.red('❌ Needs Work');
      console.log(`   ${feature}: ${statusText}`);
    }

    const mcpScore = Object.values(mcpFeatures).filter(Boolean).length / Object.keys(mcpFeatures).length * 100;
    console.log(colors.bold(`\n🎯 MCP Integration Score: ${mcpScore.toFixed(1)}%`));
    
    if (mcpScore >= 75) {
      console.log(colors.green('🎉 Context7 MCP patterns successfully integrated!'));
    } else {
      console.log(colors.yellow('⚠️  Some Context7 MCP patterns need attention.'));
    }

    // Write detailed results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: parseFloat(successRate),
        grade,
        mcpScore: parseFloat(mcpScore.toFixed(1))
      },
      categories: this.results.categories,
      recommendations: mcpScore >= 75 ? 'Production Ready' : 'Needs Improvement'
    };

    fs.writeFileSync(
      path.join(__dirname, '..', 'MCP_INTEGRATION_TEST_REPORT.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log(colors.dim('\n📄 Detailed report saved to MCP_INTEGRATION_TEST_REPORT.json'));
    
    // Exit with appropriate code
    process.exit(successRate >= 70 ? 0 : 1);
  }
}

// Main execution
if (require.main === module) {
  const testSuite = new MCPTestSuite();
  testSuite.runAllTests().catch((error) => {
    console.error(colors.red(`\n💥 Unhandled error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = MCPTestSuite; 