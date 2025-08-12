#!/usr/bin/env node
/**
 * KAZI Platform - Simple 404 Test
 * 
 * This script performs basic testing of the KAZI platform to verify
 * that newly created pages and navigation routes are accessible.
 * It uses only built-in Node.js modules and provides clear pass/fail results.
 * 
 * @version 1.0.0
 * @date August 7, 2025
 */

const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const config = {
  devServerHost: 'localhost',
  devServerPort: 9323, // KAZI platform port
  testRoutes: [
    // Newly created pages
    '/dashboard/team-hub',
    '/dashboard/reports',
    '/dashboard/admin',
    '/dashboard/client-portal',
    
    // Main dashboard
    '/dashboard',
    
    // Basic navigation routes
    '/dashboard/projects-hub',
    '/dashboard/files-hub',
    '/dashboard/canvas',
    '/dashboard/messages',
    '/dashboard/settings',
    '/dashboard/profile',
    '/dashboard/financial-hub',
    '/dashboard/clients',
    '/' // Home page
  ],
  timeout: 5000 // 5 second timeout
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results
const testResults = {
  timestamp: new Date().toISOString(),
  serverRunning: false,
  totalTests: config.testRoutes.length,
  passedTests: 0,
  failedTests: 0,
  results: []
};

/**
 * Test if a route is accessible
 */
function testRoute(route) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const options = {
      hostname: config.devServerHost,
      port: config.devServerPort,
      path: route,
      method: 'GET',
      timeout: config.timeout,
      headers: {
        'User-Agent': 'KAZI-Simple-Test/1.0'
      }
    };
    
    const req = http.request(options, (res) => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          route,
          statusCode: res.statusCode,
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 400,
          contentLength: data.length
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        route,
        statusCode: 0,
        responseTime: performance.now() - startTime,
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.abort();
      resolve({
        route,
        statusCode: 0,
        responseTime: performance.now() - startTime,
        success: false,
        error: 'Request timed out'
      });
    });
    
    req.end();
  });
}

/**
 * Print a section header
 */
function printSection(title) {
  console.log(`\n${colors.bright}${colors.magenta}=== ${title} ===${colors.reset}`);
}

/**
 * Print a success message
 */
function printSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Print an error message
 */
function printError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

/**
 * Print an info message
 */
function printInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

/**
 * Print a warning message
 */
function printWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

/**
 * Print the test summary
 */
function printSummary() {
  printSection('Test Summary');
  
  console.log(`${colors.bright}Total Routes Tested:${colors.reset} ${testResults.totalTests}`);
  console.log(`${colors.green}Passed Tests:${colors.reset} ${testResults.passedTests}`);
  console.log(`${colors.red}Failed Tests:${colors.reset} ${testResults.failedTests}`);
  
  const successRate = testResults.totalTests > 0 
    ? Math.round((testResults.passedTests / testResults.totalTests) * 100) 
    : 0;
  
  if (successRate === 100) {
    printSuccess(`All tests passed successfully! (${successRate}%)`);
  } else if (successRate >= 80) {
    printWarning(`Most tests passed. Success rate: ${successRate}%`);
  } else {
    printError(`Many tests failed. Success rate: ${successRate}%`);
  }
  
  // Print details for failed tests
  if (testResults.failedTests > 0) {
    printSection('Failed Tests');
    
    testResults.results
      .filter(result => !result.success)
      .forEach(result => {
        printError(`${result.route} - ${result.statusCode || 'Failed'} (${Math.round(result.responseTime)}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      });
  }
}

/**
 * Main test execution function
 */
async function runTests() {
  console.log(`${colors.bright}KAZI Platform - Simple 404 Test${colors.reset}`);
  console.log(`Testing server at http://${config.devServerHost}:${config.devServerPort}`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
  
  try {
    // Check if dev server is running
    printSection('Checking Server Status');
    
    try {
      const homeResult = await testRoute('/');
      
      if (homeResult.success) {
        testResults.serverRunning = true;
        printSuccess('Development server is running');
      } else {
        testResults.serverRunning = false;
        printError('Development server is not responding correctly');
        printError(`Status code: ${homeResult.statusCode}`);
        if (homeResult.error) {
          printError(`Error: ${homeResult.error}`);
        }
      }
    } catch (error) {
      testResults.serverRunning = false;
      printError(`Failed to connect to development server: ${error.message}`);
      printError(`Make sure the server is running at http://${config.devServerHost}:${config.devServerPort}`);
      process.exit(1);
    }
    
    if (!testResults.serverRunning) {
      printError('Cannot continue testing as the server is not running.');
      process.exit(1);
    }
    
    // Test all routes
    printSection('Testing Routes');
    printInfo(`Testing ${config.testRoutes.length} routes...`);
    
    // Test routes sequentially to avoid overwhelming the server
    for (const route of config.testRoutes) {
      const result = await testRoute(route);
      testResults.results.push(result);
      
      if (result.success) {
        testResults.passedTests++;
        printSuccess(`${route} - ${result.statusCode} (${Math.round(result.responseTime)}ms)`);
      } else {
        testResults.failedTests++;
        printError(`${route} - ${result.statusCode || 'Failed'} (${Math.round(result.responseTime)}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    }
    
    // Print summary
    printSummary();
    
    // Exit with appropriate code
    if (testResults.failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    printError(`Test execution failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests();
