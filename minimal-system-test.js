#!/usr/bin/env node
/**
 * KAZI Platform - Minimal System Test
 * 
 * This script performs minimal testing of core dashboard pages to identify
 * which components are causing 500 Internal Server Error issues.
 * 
 * Usage: node minimal-system-test.js
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  serverPort: 3333,
  serverStartTimeout: 10000, // 10 seconds
  requestTimeout: 5000, // 5 seconds per request
  coreRoutes: [
    '/',
    '/dashboard',
    '/dashboard/projects-hub',
    '/dashboard/my-day',
    '/dashboard/financial-hub',
    '/dashboard/files-hub',
    '/dashboard/messages',
    '/dashboard/analytics',
    '/dashboard/client-zone',
    '/dashboard/settings'
  ],
  navigationComponents: [
    'components/unified-sidebar.tsx',
    'components/navigation/sidebar.tsx'
  ],
  outputFile: 'system-test-results.json'
};

// Utility functions
const log = (message, type = 'info') => {
  const prefix = {
    info: '📋 INFO:    ',
    success: '✅ SUCCESS: ',
    warning: '⚠️ WARNING: ',
    error: '❌ ERROR:   '
  }[type] || '        ';
  
  console.log(`${prefix} ${message}`);
};

// Test a specific route
const testRoute = (route) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = `http://localhost:${CONFIG.serverPort}${route}`;
    
    const req = http.get(url, (res) => {
      const endTime = Date.now();
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
          success: res.statusCode === 200,
          error: res.statusCode !== 200 ? `HTTP ${res.statusCode}` : null,
          contentLength: data.length
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        route,
        statusCode: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(CONFIG.requestTimeout, () => {
      req.abort();
      resolve({
        route,
        statusCode: 0,
        responseTime: CONFIG.requestTimeout,
        success: false,
        error: 'Request timed out'
      });
    });
  });
};

// Check if navigation components exist and are valid
const checkNavigationComponents = () => {
  const results = [];
  
  for (const component of CONFIG.navigationComponents) {
    try {
      const content = fs.readFileSync(component, 'utf8');
      const isValid = content.includes('export function') || content.includes('export default');
      
      results.push({
        component,
        exists: true,
        isValid,
        size: content.length,
        error: isValid ? null : 'Component does not export a function or default'
      });
    } catch (error) {
      results.push({
        component,
        exists: false,
        isValid: false,
        size: 0,
        error: error.message
      });
    }
  }
  
  return results;
};

// Start Next.js development server
const startDevServer = () => {
  return new Promise((resolve, reject) => {
    log(`Starting Next.js development server on port ${CONFIG.serverPort}...`);
    
    const server = spawn('npx', ['next', 'dev', '-p', CONFIG.serverPort], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let serverStarted = false;
    
    const onData = (data) => {
      const text = data.toString();
      output += text;
      
      if (text.includes('ready') && !serverStarted) {
        serverStarted = true;
        log('Next.js server started successfully', 'success');
        resolve(server);
      }
    };
    
    server.stdout.on('data', onData);
    server.stderr.on('data', onData);
    
    // Set timeout for server start
    setTimeout(() => {
      if (!serverStarted) {
        server.kill();
        reject(new Error(`Server failed to start within ${CONFIG.serverStartTimeout}ms. Output: ${output}`));
      }
    }, CONFIG.serverStartTimeout);
    
    // Handle server exit
    server.on('exit', (code) => {
      if (!serverStarted) {
        reject(new Error(`Server exited with code ${code} before starting. Output: ${output}`));
      }
    });
  });
};

// Main test function
const runTests = async () => {
  log('KAZI Platform - Minimal System Test', 'info');
  log('----------------------------------', 'info');
  
  // Check navigation components
  log('Checking navigation components...');
  const navigationResults = checkNavigationComponents();
  
  const validComponents = navigationResults.filter(r => r.isValid).length;
  log(`Found ${validComponents}/${navigationResults.length} valid navigation components`, 
      validComponents === navigationResults.length ? 'success' : 'warning');
  
  // Start server
  let server;
  try {
    server = await startDevServer();
  } catch (error) {
    log(`Failed to start Next.js server: ${error.message}`, 'error');
    return {
      success: false,
      navigationComponents: navigationResults,
      routes: [],
      error: error.message
    };
  }
  
  // Test routes
  log(`Testing ${CONFIG.coreRoutes.length} core routes...`);
  const routeResults = [];
  
  for (const route of CONFIG.coreRoutes) {
    log(`Testing route: ${route}`);
    const result = await testRoute(route);
    routeResults.push(result);
    
    if (result.success) {
      log(`Route ${route}: ${result.statusCode} OK (${result.responseTime}ms)`, 'success');
    } else {
      log(`Route ${route}: ${result.error} (${result.responseTime}ms)`, 'error');
    }
  }
  
  // Kill server
  if (server) {
    server.kill();
    log('Server stopped');
  }
  
  // Analyze results
  const successfulRoutes = routeResults.filter(r => r.success).length;
  const failedRoutes = routeResults.filter(r => !r.success).length;
  
  log('\n----------------------------------', 'info');
  log('TEST RESULTS SUMMARY', 'info');
  log('----------------------------------', 'info');
  log(`Navigation Components: ${validComponents}/${navigationResults.length} valid`);
  log(`Core Routes: ${successfulRoutes}/${routeResults.length} successful`);
  
  if (failedRoutes > 0) {
    log(`Failed Routes: ${failedRoutes}`, 'error');
    const failedRoutesList = routeResults
      .filter(r => !r.success)
      .map(r => `  - ${r.route}: ${r.error}`)
      .join('\n');
    console.log(failedRoutesList);
  }
  
  // Determine if navigation is the issue
  const navigationIssue = validComponents < navigationResults.length;
  const routingIssue = failedRoutes > 0;
  
  if (navigationIssue && routingIssue) {
    log('\nDIAGNOSIS: Both navigation components and routing have issues', 'warning');
  } else if (navigationIssue) {
    log('\nDIAGNOSIS: Navigation components have issues but routes are working', 'warning');
  } else if (routingIssue) {
    log('\nDIAGNOSIS: Navigation components are valid but routes are failing', 'warning');
  } else {
    log('\nDIAGNOSIS: System appears to be working correctly', 'success');
  }
  
  // Save results to file
  const results = {
    timestamp: new Date().toISOString(),
    navigationComponents: navigationResults,
    routes: routeResults,
    summary: {
      validComponents,
      totalComponents: navigationResults.length,
      successfulRoutes,
      totalRoutes: routeResults.length,
      navigationIssue,
      routingIssue
    }
  };
  
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));
  log(`Results saved to ${CONFIG.outputFile}`, 'success');
  
  return results;
};

// Execute tests
runTests().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
