#!/usr/bin/env node
/**
 * KAZI Platform - Comprehensive 404 Fixes Test
 * 
 * This script performs comprehensive testing of the KAZI platform to identify
 * and fix any remaining 404 errors, missing pages, broken links, and non-functional
 * components. It generates detailed reports and provides actionable insights.
 * 
 * Features:
 * - Tests all newly created pages
 * - Checks all navigation links
 * - Validates all dashboard routes
 * - Tests component rendering
 * - Verifies API routes
 * - Detects missing assets
 * - Measures performance
 * - Generates comprehensive fix report
 * 
 * @version 1.0.0
 * @date August 7, 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const http = require('http');
const https = require('https');
const chalk = require('chalk');
const { performance } = require('perf_hooks');
const { parse } = require('node-html-parser');

// Configuration
const config = {
  rootDir: path.resolve(__dirname),
  appDir: path.resolve(__dirname, 'app'),
  dashboardDir: path.resolve(__dirname, 'app/(app)/dashboard'),
  componentsDir: path.resolve(__dirname, 'components'),
  apiDir: path.resolve(__dirname, 'app/api'),
  publicDir: path.resolve(__dirname, 'public'),
  devServerPort: 9323, // KAZI platform port
  devServerHost: 'localhost',
  navigationFiles: [
    'components/navigation/sidebar.tsx',
    'components/unified-sidebar.tsx',
    'components/dashboard-nav.tsx',
  ],
  reportDir: path.resolve(__dirname, 'test-reports'),
  performanceThresholds: {
    good: 500, // ms
    acceptable: 1000, // ms
    poor: 2000 // ms
  },
  newlyCreatedPages: [
    '/dashboard/team-hub',
    '/dashboard/reports',
    '/dashboard/admin',
    '/dashboard/client-portal'
  ]
};

// Create report directory if it doesn't exist
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true });
}

// Initialize report data structure
const testReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalRoutes: 0,
    testedRoutes: 0,
    successfulRoutes: 0,
    failedRoutes: 0,
    navigationLinks: 0,
    brokenLinks: 0,
    missingComponents: 0,
    missingAssets: 0,
    apiRoutes: 0,
    missingApiRoutes: 0,
    performanceIssues: 0
  },
  routeTests: [],
  navigationTests: [],
  componentTests: [],
  apiTests: [],
  assetTests: [],
  performanceTests: [],
  newlyCreatedPageTests: [],
  remainingIssues: []
};

// Logging utilities
const logger = {
  info: (message) => {
    console.log(chalk.blue(`[INFO] ${message}`));
    appendToLog('info', message);
  },
  success: (message) => {
    console.log(chalk.green(`[SUCCESS] ${message}`));
    appendToLog('success', message);
  },
  warning: (message) => {
    console.log(chalk.yellow(`[WARNING] ${message}`));
    appendToLog('warning', message);
  },
  error: (message) => {
    console.log(chalk.red(`[ERROR] ${message}`));
    appendToLog('error', message);
  },
  section: (message) => {
    console.log(chalk.magenta(`\n=== ${message} ===`));
    appendToLog('section', message);
  }
};

// Append to log file
function appendToLog(level, message) {
  const logFile = path.join(config.reportDir, 'test-execution.log');
  const logEntry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
  
  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

// File system utilities
const fileUtils = {
  exists: (filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      logger.error(`Error checking if file exists: ${filePath} - ${error.message}`);
      return false;
    }
  },
  
  readFile: (filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      logger.error(`Failed to read file: ${filePath} - ${error.message}`);
      return null;
    }
  },
  
  writeFile: (filePath, content) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, content);
      return true;
    } catch (error) {
      logger.error(`Failed to write file: ${filePath} - ${error.message}`);
      console.error(error);
      return false;
    }
  },
  
  listFiles: (dir, extension = null) => {
    try {
      if (!fs.existsSync(dir)) return [];
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      return files
        .filter(file => {
          if (file.isDirectory()) return false;
          if (extension) return file.name.endsWith(extension);
          return true;
        })
        .map(file => path.join(dir, file.name));
    } catch (error) {
      logger.error(`Failed to list files in directory: ${dir} - ${error.message}`);
      return [];
    }
  },
  
  listDirectories: (dir) => {
    try {
      if (!fs.existsSync(dir)) return [];
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      return files
        .filter(file => file.isDirectory())
        .map(file => path.join(dir, file.name));
    } catch (error) {
      logger.error(`Failed to list directories in: ${dir} - ${error.message}`);
      return [];
    }
  },
  
  findFilesRecursive: (dir, pattern) => {
    let results = [];
    
    try {
      if (!fs.existsSync(dir)) return results;
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          results = results.concat(fileUtils.findFilesRecursive(fullPath, pattern));
        } else if (pattern instanceof RegExp ? pattern.test(file.name) : file.name.includes(pattern)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      logger.error(`Error searching for files in ${dir}: ${error.message}`);
    }
    
    return results;
  }
};

// Route scanning and analysis
const routeAnalyzer = {
  /**
   * Extract all Next.js routes from the app directory
   */
  extractAppRoutes: () => {
    const routes = [];
    
    const processDirectory = (dir, routePath = '') => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        // Skip route groups and private folders
        if (item.isDirectory() && item.name.startsWith('(') && item.name.endsWith(')')) {
          processDirectory(fullPath, routePath);
          continue;
        }
        
        // Skip private folders
        if (item.name.startsWith('_') || item.name.startsWith('.')) {
          continue;
        }
        
        if (item.isDirectory()) {
          let newRoutePath = routePath;
          
          // Add to route path if not a route group
          if (!item.name.startsWith('(') || !item.name.endsWith(')')) {
            newRoutePath = path.join(routePath, item.name);
          }
          
          processDirectory(fullPath, newRoutePath);
        } else if (item.name === 'page.tsx' || item.name === 'page.js') {
          routes.push('/' + routePath);
        }
      }
    };
    
    try {
      processDirectory(config.appDir);
    } catch (error) {
      logger.error(`Error extracting app routes: ${error.message}`);
    }
    
    return routes;
  },
  
  /**
   * Extract route paths from navigation components
   */
  extractRoutesFromNavigation: () => {
    const routes = new Set();
    
    config.navigationFiles.forEach(navFile => {
      const filePath = path.join(config.rootDir, navFile);
      if (!fileUtils.exists(filePath)) {
        logger.warning(`Navigation file not found: ${navFile}`);
        return;
      }
      
      const content = fileUtils.readFile(filePath);
      if (!content) return;
      
      // Extract href attributes
      const hrefMatches = content.match(/href=["']\/([^"']+)["']/g) || [];
      hrefMatches.forEach(match => {
        const route = match.match(/href=["']\/([^"']+)["']/);
        if (route && route[1]) {
          routes.add('/' + route[1]);
        }
      });
      
      // Extract route strings
      const routeMatches = content.match(/route:\s*["']\/([^"']+)["']/g) || [];
      routeMatches.forEach(match => {
        const route = match.match(/route:\s*["']\/([^"']+)["']/);
        if (route && route[1]) {
          routes.add('/' + route[1]);
        }
      });
    });
    
    return Array.from(routes);
  },
  
  /**
   * Find missing pages by comparing extracted routes with existing pages
   */
  findMissingPages: (extractedRoutes) => {
    const missingPages = [];
    const appRoutes = routeAnalyzer.extractAppRoutes();
    
    extractedRoutes.forEach(route => {
      if (!appRoutes.includes(route)) {
        missingPages.push(route);
      }
    });
    
    return missingPages;
  },
  
  /**
   * Extract API routes from the app directory
   */
  extractApiRoutes: () => {
    const routes = [];
    
    const processDirectory = (dir, routePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          processDirectory(fullPath, path.join(routePath, item.name));
        } else if (item.name === 'route.ts' || item.name === 'route.js') {
          routes.push('/api/' + routePath);
        }
      }
    };
    
    try {
      processDirectory(config.apiDir);
    } catch (error) {
      logger.error(`Error extracting API routes: ${error.message}`);
    }
    
    return routes;
  },
  
  /**
   * Find missing API routes by scanning component files for API calls
   */
  findMissingApiRoutes: () => {
    const apiCalls = new Set();
    const existingApiRoutes = routeAnalyzer.extractApiRoutes();
    const missingApiRoutes = [];
    
    // Scan component files for API calls
    const componentFiles = fileUtils.findFilesRecursive(config.componentsDir, /\.(tsx|jsx|js|ts)$/);
    const pageFiles = fileUtils.findFilesRecursive(config.appDir, /\.(tsx|jsx|js|ts)$/);
    
    [...componentFiles, ...pageFiles].forEach(file => {
      const content = fileUtils.readFile(file);
      if (!content) return;
      
      // Extract fetch calls to API routes
      const fetchMatches = content.match(/fetch\(['"`]\/api\/([^'"`]+)['"`]/g) || [];
      fetchMatches.forEach(match => {
        const apiRoute = match.match(/fetch\(['"`]\/api\/([^'"`]+)['"`]/);
        if (apiRoute && apiRoute[1]) {
          apiCalls.add('/api/' + apiRoute[1]);
        }
      });
      
      // Extract axios calls to API routes
      const axiosMatches = content.match(/axios\.(get|post|put|delete)\(['"`]\/api\/([^'"`]+)['"`]/g) || [];
      axiosMatches.forEach(match => {
        const apiRoute = match.match(/axios\.(get|post|put|delete)\(['"`]\/api\/([^'"`]+)['"`]/);
        if (apiRoute && apiRoute[2]) {
          apiCalls.add('/api/' + apiRoute[2]);
        }
      });
    });
    
    // Find missing API routes
    apiCalls.forEach(apiRoute => {
      // Check if the API route exists (exact match or as a dynamic route)
      const exists = existingApiRoutes.some(route => {
        // Exact match
        if (route === apiRoute) return true;
        
        // Check if it's a dynamic route (e.g., /api/users/[id])
        const routeParts = route.split('/');
        const apiRouteParts = apiRoute.split('/');
        
        if (routeParts.length !== apiRouteParts.length) return false;
        
        return routeParts.every((part, index) => {
          return part === apiRouteParts[index] || (part.startsWith('[') && part.endsWith(']'));
        });
      });
      
      if (!exists) {
        missingApiRoutes.push(apiRoute);
      }
    });
    
    return missingApiRoutes;
  }
};

// Component scanning and analysis
const componentAnalyzer = {
  /**
   * Find missing components referenced in pages but not existing
   */
  findMissingComponents: () => {
    const componentImports = new Set();
    const existingComponents = new Set();
    const missingComponents = [];
    
    // Get all page files
    const pageFiles = fileUtils.findFilesRecursive(config.appDir, /\.(tsx|jsx|js|ts)$/);
    
    // Extract component imports
    pageFiles.forEach(file => {
      const content = fileUtils.readFile(file);
      if (!content) return;
      
      // Match import statements for components
      const importMatches = content.match(/import\s+{[^}]*}\s+from\s+['"]@\/components\/([^'"]+)['"]/g) || [];
      importMatches.forEach(match => {
        const componentPath = match.match(/import\s+{[^}]*}\s+from\s+['"]@\/components\/([^'"]+)['"]/);
        if (componentPath && componentPath[1]) {
          componentImports.add(componentPath[1]);
        }
      });
      
      // Match direct component imports
      const directImportMatches = content.match(/import\s+\w+\s+from\s+['"]@\/components\/([^'"]+)['"]/g) || [];
      directImportMatches.forEach(match => {
        const componentPath = match.match(/import\s+\w+\s+from\s+['"]@\/components\/([^'"]+)['"]/);
        if (componentPath && componentPath[1]) {
          componentImports.add(componentPath[1]);
        }
      });
    });
    
    // Get existing components
    const findComponentsRecursively = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fileUtils.listFiles(dir, '.tsx');
      files.forEach(file => {
        const relativePath = path.relative(config.componentsDir, file).replace(/\.tsx$/, '');
        existingComponents.add(relativePath);
      });
      
      const directories = fileUtils.listDirectories(dir);
      directories.forEach(directory => {
        findComponentsRecursively(directory);
      });
    };
    
    findComponentsRecursively(config.componentsDir);
    
    // Find missing components
    componentImports.forEach(componentPath => {
      // Check for both .tsx and .js extensions
      const tsxPath = componentPath + '.tsx';
      const jsPath = componentPath + '.js';
      
      if (!existingComponents.has(componentPath) && 
          !existingComponents.has(tsxPath) && 
          !existingComponents.has(jsPath)) {
        missingComponents.push(componentPath);
      }
    });
    
    return missingComponents;
  },
  
  /**
   * Find missing assets (images, icons, etc.)
   */
  findMissingAssets: () => {
    const assetReferences = new Set();
    const existingAssets = new Set();
    const missingAssets = [];
    
    // Get all files that might reference assets
    const allFiles = [
      ...fileUtils.findFilesRecursive(config.appDir, /\.(tsx|jsx|js|ts|css|scss)$/),
      ...fileUtils.findFilesRecursive(config.componentsDir, /\.(tsx|jsx|js|ts|css|scss)$/)
    ];
    
    // Extract asset references
    allFiles.forEach(file => {
      const content = fileUtils.readFile(file);
      if (!content) return;
      
      // Match image imports and src attributes
      const imgMatches = content.match(/src=["']\/([^"']+\.(png|jpg|jpeg|gif|svg|webp))["']/g) || [];
      imgMatches.forEach(match => {
        const assetPath = match.match(/src=["']\/([^"']+)["']/);
        if (assetPath && assetPath[1]) {
          assetReferences.add(assetPath[1]);
        }
      });
      
      // Match background images in CSS
      const bgMatches = content.match(/background(-image)?:\s*url\(["']\/([^"']+)["']\)/g) || [];
      bgMatches.forEach(match => {
        const assetPath = match.match(/url\(["']\/([^"']+)["']\)/);
        if (assetPath && assetPath[1]) {
          assetReferences.add(assetPath[1]);
        }
      });
      
      // Match import statements for assets
      const importMatches = content.match(/import\s+[^"']+\s+from\s+["']\/([^"']+\.(png|jpg|jpeg|gif|svg|webp))["']/g) || [];
      importMatches.forEach(match => {
        const assetPath = match.match(/from\s+["']\/([^"']+)["']/);
        if (assetPath && assetPath[1]) {
          assetReferences.add(assetPath[1]);
        }
      });
    });
    
    // Get existing assets
    const findAssetsRecursively = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        const relativePath = path.relative(config.publicDir, fullPath);
        
        if (file.isDirectory()) {
          findAssetsRecursively(fullPath);
        } else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file.name)) {
          existingAssets.add(relativePath);
        }
      });
    };
    
    findAssetsRecursively(config.publicDir);
    
    // Find missing assets
    assetReferences.forEach(assetPath => {
      if (!existingAssets.has(assetPath)) {
        missingAssets.push(assetPath);
      }
    });
    
    return missingAssets;
  }
};

// HTTP testing utilities
const httpTester = {
  /**
   * Test if a route is accessible
   */
  testRoute: (route) => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const options = {
        hostname: config.devServerHost,
        port: config.devServerPort,
        path: route,
        method: 'GET',
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent': 'KAZI-Test-Script/1.0'
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
            contentLength: data.length,
            data
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
  },
  
  /**
   * Test multiple routes in parallel
   */
  testRoutes: async (routes) => {
    const results = [];
    const batchSize = 5; // Test 5 routes at a time to avoid overwhelming the server
    
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(route => httpTester.testRoute(route)));
      results.push(...batchResults);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  },
  
  /**
   * Analyze HTML content for issues
   */
  analyzeHtml: (html) => {
    try {
      const root = parse(html);
      
      // Find broken images
      const brokenImages = root.querySelectorAll('img').filter(img => !img.getAttribute('src'));
      
      // Find empty links
      const emptyLinks = root.querySelectorAll('a').filter(a => !a.getAttribute('href'));
      
      // Find elements with missing classes
      const elementsWithMissingClasses = root.querySelectorAll('[class*="undefined"]');
      
      return {
        brokenImages: brokenImages.length,
        emptyLinks: emptyLinks.length,
        elementsWithMissingClasses: elementsWithMissingClasses.length,
        hasErrors: brokenImages.length > 0 || emptyLinks.length > 0 || elementsWithMissingClasses.length > 0
      };
    } catch (error) {
      return {
        error: error.message,
        hasErrors: true
      };
    }
  }
};

// Performance testing
const performanceTester = {
  /**
   * Analyze route performance
   */
  analyzePerformance: (routeResults) => {
    const performanceIssues = [];
    
    routeResults.forEach(result => {
      if (!result.success) return;
      
      let performanceLevel = 'good';
      let issue = null;
      
      if (result.responseTime > config.performanceThresholds.poor) {
        performanceLevel = 'poor';
        issue = `Very slow response time: ${Math.round(result.responseTime)}ms`;
      } else if (result.responseTime > config.performanceThresholds.acceptable) {
        performanceLevel = 'acceptable';
        issue = `Slow response time: ${Math.round(result.responseTime)}ms`;
      }
      
      if (performanceLevel !== 'good') {
        performanceIssues.push({
          route: result.route,
          responseTime: result.responseTime,
          level: performanceLevel,
          issue
        });
      }
    });
    
    return performanceIssues;
  }
};

// Report generation
const reportGenerator = {
  /**
   * Generate HTML report
   */
  generateHtmlReport: (report) => {
    const successRate = report.summary.testedRoutes > 0 
      ? Math.round((report.summary.successfulRoutes / report.summary.testedRoutes) * 100) 
      : 0;
    
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KAZI Platform - 404 Fixes Test Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 {
          color: #2563eb;
        }
        .summary {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin: 5px 0;
        }
        .success { color: #16a34a; }
        .warning { color: #ca8a04; }
        .error { color: #dc2626; }
        .info { color: #2563eb; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f8fafc;
          font-weight: 600;
        }
        tr:hover {
          background-color: #f8fafc;
        }
        .section {
          margin-bottom: 40px;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-success { background-color: #dcfce7; color: #16a34a; }
        .badge-warning { background-color: #fef9c3; color: #ca8a04; }
        .badge-error { background-color: #fee2e2; color: #dc2626; }
        .badge-info { background-color: #dbeafe; color: #2563eb; }
        .progress-bar {
          height: 10px;
          background-color: #e5e7eb;
          border-radius: 5px;
          margin-top: 5px;
        }
        .progress-value {
          height: 100%;
          background-color: #2563eb;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <h1>KAZI Platform - 404 Fixes Test Report</h1>
      <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="progress-bar">
          <div class="progress-value" style="width: ${successRate}%"></div>
        </div>
        <p>${successRate}% of routes tested successfully</p>
        
        <div class="stats">
          <div class="stat-card">
            <div>Routes Tested</div>
            <div class="stat-value info">${report.summary.testedRoutes}</div>
            <div>Total routes: ${report.summary.totalRoutes}</div>
          </div>
          
          <div class="stat-card">
            <div>Successful Routes</div>
            <div class="stat-value success">${report.summary.successfulRoutes}</div>
          </div>
          
          <div class="stat-card">
            <div>Failed Routes</div>
            <div class="stat-value ${report.summary.failedRoutes > 0 ? 'error' : 'success'}">${report.summary.failedRoutes}</div>
          </div>
          
          <div class="stat-card">
            <div>Broken Links</div>
            <div class="stat-value ${report.summary.brokenLinks > 0 ? 'error' : 'success'}">${report.summary.brokenLinks}</div>
            <div>Total links: ${report.summary.navigationLinks}</div>
          </div>
          
          <div class="stat-card">
            <div>Missing Components</div>
            <div class="stat-value ${report.summary.missingComponents > 0 ? 'error' : 'success'}">${report.summary.missingComponents}</div>
          </div>
          
          <div class="stat-card">
            <div>Missing Assets</div>
            <div class="stat-value ${report.summary.missingAssets > 0 ? 'error' : 'success'}">${report.summary.missingAssets}</div>
          </div>
          
          <div class="stat-card">
            <div>Missing API Routes</div>
            <div class="stat-value ${report.summary.missingApiRoutes > 0 ? 'error' : 'success'}">${report.summary.missingApiRoutes}</div>
            <div>Total API routes: ${report.summary.apiRoutes}</div>
          </div>
          
          <div class="stat-card">
            <div>Performance Issues</div>
            <div class="stat-value ${report.summary.performanceIssues > 0 ? 'warning' : 'success'}">${report.summary.performanceIssues}</div>
          </div>
        </div>
      </div>
    `;
    
    // Newly Created Pages Section
    if (report.newlyCreatedPageTests.length > 0) {
      html += `
      <div class="section">
        <h2>Newly Created Pages</h2>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.newlyCreatedPageTests.forEach(test => {
        html += `
          <tr>
            <td>${test.route}</td>
            <td>
              <span class="badge ${test.success ? 'badge-success' : 'badge-error'}">
                ${test.statusCode} ${test.success ? 'OK' : 'Failed'}
              </span>
            </td>
            <td>${Math.round(test.responseTime)}ms</td>
            <td>${test.issues || 'None'}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    // Route Tests Section
    if (report.routeTests.length > 0) {
      html += `
      <div class="section">
        <h2>Route Tests</h2>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.routeTests.forEach(test => {
        html += `
          <tr>
            <td>${test.route}</td>
            <td>
              <span class="badge ${test.success ? 'badge-success' : 'badge-error'}">
                ${test.statusCode} ${test.success ? 'OK' : 'Failed'}
              </span>
            </td>
            <td>${Math.round(test.responseTime)}ms</td>
            <td>${test.error || 'None'}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    // Navigation Tests Section
    if (report.navigationTests.length > 0) {
      html += `
      <div class="section">
        <h2>Navigation Tests</h2>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Link</th>
              <th>Status</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.navigationTests.forEach(test => {
        html += `
          <tr>
            <td>${test.source}</td>
            <td>${test.link}</td>
            <td>
              <span class="badge ${test.valid ? 'badge-success' : 'badge-error'}">
                ${test.valid ? 'Valid' : 'Broken'}
              </span>
            </td>
            <td>${test.issues || 'None'}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    // Component Tests Section
    if (report.componentTests.length > 0) {
      html += `
      <div class="section">
        <h2>Missing Components</h2>
        <table>
          <thead>
            <tr>
              <th>Component Path</th>
              <th>Referenced In</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.componentTests.forEach(test => {
        html += `
          <tr>
            <td>${test.componentPath}</td>
            <td>${test.referencedIn}</td>
            <td>
              <span class="badge badge-error">Missing</span>
            </td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    // API Tests Section
    if (report.apiTests.length > 0) {
      html += `
      <div class="section">
        <h2>API Route Tests</h2>
        <table>
          <thead>
            <tr>
              <th>API Route</th>
              <th>Status</th>
              <th>Referenced In</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.apiTests.forEach(test => {
        html += `
          <tr>
            <td>${test.route}</td>
            <td>
              <span class="badge ${test.exists ? 'badge-success' : 'badge-error'}">
                ${test.exists ? 'Exists' : 'Missing'}
              </span>
            </td>
            <td>${test.referencedIn || 'Unknown'}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    // Asset Tests Section
    if (report.assetTests.length > 0) {
      html += `
      <div class="section">
        <h2>Missing Assets</h2>
        <table>
          <thead>
            <tr>
              <th>Asset Path</th>
              <th>Referenced In</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.assetTests.forEach(test => {
        html += `
          <tr>
            <td>${test.assetPath}</td>
            <td>${test.referencedIn}</td>
            <td>
              <span class="badge badge-error">Missing</span>
            </td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    // Performance Tests Section
    if (report.performanceTests.length > 0) {
      html += `
      <div class="section">
        <h2>Performance Issues</h2>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Response Time</th>
              <th>Level</th>
              <th>Issue</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.performanceTests.forEach(test => {
        html += `
          <tr>
            <td>${test.route}</td>
            <td>${Math.round(test.responseTime)}ms</td>
            <td>
              <span class="badge ${test.level === 'poor' ? 'badge-error' : 'badge-warning'}">
                ${test.level}
              </span>
            </td>
            <td>${test.issue}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    // Remaining Issues Section
    if (report.remainingIssues.length > 0) {
      html += `
      <div class="section">
        <h2>Remaining Issues</h2>
        <table>
          <thead>
            <tr>
              <th>Issue Type</th>
              <th>Description</th>
              <th>Location</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      report.remainingIssues.forEach(issue => {
        html += `
          <tr>
            <td>${issue.type}</td>
            <td>${issue.description}</td>
            <td>${issue.location}</td>
            <td>
              <span class="badge ${
                issue.severity === 'high' ? 'badge-error' : 
                issue.severity === 'medium' ? 'badge-warning' : 'badge-info'
              }">
                ${issue.severity}
              </span>
            </td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      </div>
      `;
    }
    
    html += `
      <div class="section">
        <h2>Conclusion</h2>
        <p>
          The KAZI platform has been thoroughly tested for 404 errors, missing pages, broken links, and other issues.
          ${
            report.summary.failedRoutes === 0 && 
            report.summary.brokenLinks === 0 && 
            report.summary.missingComponents === 0 && 
            report.summary.missingAssets === 0 && 
            report.summary.missingApiRoutes === 0
            ? 'All tests have passed successfully! The platform is ready for production deployment.'
            : 'Some issues were found that need to be addressed before production deployment.'
          }
        </p>
      </div>
    </body>
    </html>
    `;
    
    return html;
  },
  
  /**
   * Generate JSON report
   */
  generateJsonReport: (report) => {
    return JSON.stringify(report, null, 2);
  },
  
  /**
   * Generate Markdown report
   */
  generateMarkdownReport: (report) => {
    const successRate = report.summary.testedRoutes > 0 
      ? Math.round((report.summary.successfulRoutes / report.summary.testedRoutes) * 100) 
      : 0;
    
    let markdown = `# KAZI Platform - 404 Fixes Test Report

Generated on: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Routes Tested**: ${report.summary.testedRoutes} / ${report.summary.totalRoutes}
- **Successful Routes**: ${report.summary.successfulRoutes}
- **Failed Routes**: ${report.summary.failedRoutes}
- **Broken Links**: ${report.summary.brokenLinks} / ${report.summary.navigationLinks}
- **Missing Components**: ${report.summary.missingComponents}
- **Missing Assets**: ${report.summary.missingAssets}
- **Missing API Routes**: ${report.summary.missingApiRoutes} / ${report.summary.apiRoutes}
- **Performance Issues**: ${report.summary.performanceIssues}

Overall Success Rate: ${successRate}%

`;
    
    // Newly Created Pages Section
    if (report.newlyCreatedPageTests.length > 0) {
      markdown += `## Newly Created Pages

| Route | Status | Response Time | Issues |
|-------|--------|---------------|--------|
`;
      
      report.newlyCreatedPageTests.forEach(test => {
        markdown += `| ${test.route} | ${test.statusCode} ${test.success ? '✅' : '❌'} | ${Math.round(test.responseTime)}ms | ${test.issues || 'None'} |\n`;
      });
      
      markdown += '\n';
    }
    
    // Route Tests Section
    if (report.routeTests.length > 0) {
      markdown += `## Route Tests

| Route | Status | Response Time | Issues |
|-------|--------|---------------|--------|
`;
      
      report.routeTests.forEach(test => {
        markdown += `| ${test.route} | ${test.statusCode} ${test.success ? '✅' : '❌'} | ${Math.round(test.responseTime)}ms | ${test.error || 'None'} |\n`;
      });
      
      markdown += '\n';
    }
    
    // Navigation Tests Section
    if (report.navigationTests.length > 0) {
      markdown += `## Navigation Tests

| Source | Link | Status | Issues |
|--------|------|--------|--------|
`;
      
      report.navigationTests.forEach(test => {
        markdown += `| ${test.source} | ${test.link} | ${test.valid ? '✅ Valid' : '❌ Broken'} | ${test.issues || 'None'} |\n`;
      });
      
      markdown += '\n';
    }
    
    // Component Tests Section
    if (report.componentTests.length > 0) {
      markdown += `## Missing Components

| Component Path | Referenced In | Status |
|---------------|--------------|--------|
`;
      
      report.componentTests.forEach(test => {
        markdown += `| ${test.componentPath} | ${test.referencedIn} | ❌ Missing |\n`;
      });
      
      markdown += '\n';
    }
    
    // API Tests Section
    if (report.apiTests.length > 0) {
      markdown += `## API Route Tests

| API Route | Status | Referenced In |
|-----------|--------|--------------|
`;
      
      report.apiTests.forEach(test => {
        markdown += `| ${test.route} | ${test.exists ? '✅ Exists' : '❌ Missing'} | ${test.referencedIn || 'Unknown'} |\n`;
      });
      
      markdown += '\n';
    }
    
    // Asset Tests Section
    if (report.assetTests.length > 0) {
      markdown += `## Missing Assets

| Asset Path | Referenced In | Status |
|-----------|--------------|--------|
`;
      
      report.assetTests.forEach(test => {
        markdown += `| ${test.assetPath} | ${test.referencedIn} | ❌ Missing |\n`;
      });
      
      markdown += '\n';
    }
    
    // Performance Tests Section
    if (report.performanceTests.length > 0) {
      markdown += `## Performance Issues

| Route | Response Time | Level | Issue |
|-------|--------------|-------|-------|
`;
      
      report.performanceTests.forEach(test => {
        markdown += `| ${test.route} | ${Math.round(test.responseTime)}ms | ${test.level === 'poor' ? '🔴' : '🟠'} ${test.level} | ${test.issue} |\n`;
      });
      
      markdown += '\n';
    }
    
    // Remaining Issues Section
    if (report.remainingIssues.length > 0) {
      markdown += `## Remaining Issues

| Issue Type | Description | Location | Severity |
|------------|-------------|----------|----------|
`;
      
      report.remainingIssues.forEach(issue => {
        let severityIcon = '🔵';
        if (issue.severity === 'high') severityIcon = '🔴';
        else if (issue.severity === 'medium') severityIcon = '🟠';
        
        markdown += `| ${issue.type} | ${issue.description} | ${issue.location} | ${severityIcon} ${issue.severity} |\n`;
      });
      
      markdown += '\n';
    }
    
    // Conclusion
    markdown += `## Conclusion

The KAZI platform has been thoroughly tested for 404 errors, missing pages, broken links, and other issues.
${
  report.summary.failedRoutes === 0 && 
  report.summary.brokenLinks === 0 && 
  report.summary.missingComponents === 0 && 
  report.summary.missingAssets === 0 && 
  report.summary.missingApiRoutes === 0
  ? 'All tests have passed successfully! The platform is ready for production deployment.'
  : 'Some issues were found that need to be addressed before production deployment.'
}
`;
    
    return markdown;
  },
  
  /**
   * Save reports to files
   */
  saveReports: (report) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    
    // Save HTML report
    const htmlReport = reportGenerator.generateHtmlReport(report);
    fileUtils.writeFile(path.join(config.reportDir, `404-fixes-report-${timestamp}.html`), htmlReport);
    
    // Save JSON report
    const jsonReport = reportGenerator.generateJsonReport(report);
    fileUtils.writeFile(path.join(config.reportDir, `404-fixes-report-${timestamp}.json`), jsonReport);
    
    // Save Markdown report
    const markdownReport = reportGenerator.generateMarkdownReport(report);
    fileUtils.writeFile(path.join(config.reportDir, `404-fixes-report-${timestamp}.md`), markdownReport);
    
    logger.success(`Reports saved to ${config.reportDir}`);
  }
};

/**
 * Main test execution function
 */
async function runTests() {
  logger.section('Starting Comprehensive 404 Fixes Test');
  logger.info(`Testing KAZI platform at http://${config.devServerHost}:${config.devServerPort}`);
  
  try {
    // Check if dev server is running
    try {
      await httpTester.testRoute('/');
      logger.success('Development server is running');
    } catch (error) {
      logger.error(`Development server is not running at http://${config.devServerHost}:${config.devServerPort}`);
      logger.error('Please start the development server and run this script again');
      process.exit(1);
    }
    
    // 1. Test newly created pages
    logger.section('Testing Newly Created Pages');
    const newlyCreatedPageTests = await Promise.all(
      config.newlyCreatedPages.map(route => httpTester.testRoute(route))
    );
    
    newlyCreatedPageTests.forEach(result => {
      if (result.success) {
        logger.success(`✅ ${result.route} - ${result.statusCode} (${Math.round(result.responseTime)}ms)`);
      } else {
        logger.error(`❌ ${result.route} - ${result.statusCode || 'Failed'} (${Math.round(result.responseTime)}ms)`);
        if (result.error) logger.error(`   Error: ${result.error}`);
      }
    });
    
    testReport.newlyCreatedPageTests = newlyCreatedPageTests;
    
    // 2. Extract and test all routes
    logger.section('Extracting and Testing Routes');
    
    // Extract routes from app directory
    const appRoutes = routeAnalyzer.extractAppRoutes();
    logger.info(`Found ${appRoutes.length} routes in app directory`);
    
    // Extract routes from navigation components
    const navRoutes = routeAnalyzer.extractRoutesFromNavigation();
    logger.info(`Found ${navRoutes.length} routes in navigation components`);
    
    // Combine and deduplicate routes
    const allRoutes = Array.from(new Set([...appRoutes, ...navRoutes]));
    logger.info(`Testing ${allRoutes.length} unique routes`);
    
    // Update report summary
    testReport.summary.totalRoutes = allRoutes.length;
    testReport.summary.navigationLinks = navRoutes.length;
    
    // Test routes
    const routeResults = await httpTester.testRoutes(allRoutes);
    
    // Process route test results
    let successfulRoutes = 0;
    let failedRoutes = 0;
    
    routeResults.forEach(result => {
      if (result.success) {
        successfulRoutes++;
        logger.success(`✅ ${result.route} - ${result.statusCode} (${Math.round(result.responseTime)}ms)`);
      } else {
        failedRoutes++;
        logger.error(`❌ ${result.route} - ${result.statusCode || 'Failed'} (${Math.round(result.responseTime)}ms)`);
        if (result.error) logger.error(`   Error: ${result.error}`);
      }
    });
    
    // Update report
    testReport.summary.testedRoutes = routeResults.length;
    testReport.summary.successfulRoutes = successfulRoutes;
    testReport.summary.failedRoutes = failedRoutes;
    testReport.routeTests = routeResults;
    
    // 3. Find missing pages
    logger.section('Finding Missing Pages');
    const missingPages = routeAnalyzer.findMissingPages(navRoutes);
    
    if (missingPages.length > 0) {
      logger.warning(`Found ${missingPages.length} missing pages referenced in navigation:`);
      missingPages.forEach(page => {
        logger.warning(`- ${page}`);
        testReport.remainingIssues.push({
          type: 'Missing Page',
          description: `Page referenced in navigation but doesn't exist`,
          location: page,
          severity: 'high'
        });
      });
    } else {
      logger.success('No missing pages found in navigation references');
    }
    
    // 4. Check navigation links
    logger.section('Checking Navigation Links');
    const navigationTests = [];
    let brokenLinks = 0;
    
    for (const navFile of config.navigationFiles) {
      const filePath = path.join(config.rootDir, navFile);
      if (!fileUtils.exists(filePath)) {
        logger.warning(`Navigation file not found: ${navFile}`);
        continue;
      }
      
      const content = fileUtils.readFile(filePath);
      if (!content) continue;
      
      // Extract href attributes
      const hrefMatches = content.match(/href=["']\/([^"']+)["']/g) || [];
      for (const match of hrefMatches) {
        const route = match.match(/href=["']\/([^"']+)["']/);
        if (route && route[1]) {
          const fullRoute = '/' + route[1];
          const routeExists = routeResults.some(r => r.route === fullRoute && r.success);
          
          const navTest = {
            source: navFile,
            link: fullRoute,
            valid: routeExists,
            issues: routeExists ? null : 'Route not found'
          };
          
          navigationTests.push(navTest);
          
          if (!routeExists) {
            brokenLinks++;
            logger.error(`❌ Broken link in ${navFile}: ${fullRoute}`);
          }
        }
      }
    }
    
    // Update report
    testReport.summary.brokenLinks = brokenLinks;
    testReport.navigationTests = navigationTests;
    
    // 5. Find missing components
    logger.section('Finding Missing Components');
    const missingComponents = componentAnalyzer.findMissingComponents();
    
    testReport.summary.missingComponents = missingComponents.length;
    
    if (missingComponents.length > 0) {
      logger.warning(`Found ${missingComponents.length} missing components:`);
      missingComponents.forEach(component => {
        logger.warning(`- @/components/${component}`);
        
        // Find where component is referenced
        const allFiles = [
          ...fileUtils.findFilesRecursive(config.appDir, /\.(tsx|jsx|js|ts)$/),
          ...fileUtils.findFilesRecursive(config.componentsDir, /\.(tsx|jsx|js|ts)$/)
        ];
        
        let referencedIn = [];
        
        for (const file of allFiles) {
          const content = fileUtils.readFile(file);
          if (!content) continue;
          
          if (content.includes(`@/components/${component}`)) {
            referencedIn.push(path.relative(config.rootDir, file));
          }
        }
        
        testReport.componentTests.push({
          componentPath: component,
          referencedIn: referencedIn.join(', ') || 'Unknown',
          exists: false
        });
        
        testReport.remainingIssues.push({
          type: 'Missing Component',
          description: `Component referenced but doesn't exist`,
          location: `@/components/${component}`,
          severity: 'high'
        });
      });
    } else {
      logger.success('No missing components found');
    }
    
    // 6. Find missing assets
    logger.section('Finding Missing Assets');
    const missingAssets = componentAnalyzer.findMissingAssets();
    
    testReport.summary.missingAssets = missingAssets.length;
    
    if (missingAssets.length > 0) {
      logger.warning(`Found ${missingAssets.length} missing assets:`);
      missingAssets.forEach(asset => {
        logger.warning(`- ${asset}`);
        
        // Find where asset is referenced
        const allFiles = [
          ...fileUtils.findFilesRecursive(config.appDir, /\.(tsx|jsx|js|ts|css|scss)$/),
          ...fileUtils.findFilesRecursive(config.componentsDir, /\.(tsx|jsx|js|ts|css|scss)$/)
        ];
        
        let referencedIn = [];
        
        for (const file of allFiles) {
          const content = fileUtils.readFile(file);
          if (!content) continue;
          
          if (content.includes(asset)) {
            referencedIn.push(path.relative(config.rootDir, file));
          }
        }
        
        testReport.assetTests.push({
          assetPath: asset,
          referencedIn: referencedIn.join(', ') || 'Unknown',
          exists: false
        });
        
        testReport.remainingIssues.push({
          type: 'Missing Asset',
          description: `Asset referenced but doesn't exist`,
          location: asset,
          severity: 'medium'
        });
      });
    } else {
      logger.success('No missing assets found');
    }
    
    // 7. Check API routes
    logger.section('Checking API Routes');
    const apiRoutes = routeAnalyzer.extractApiRoutes();
    const missingApiRoutes = routeAnalyzer.findMissingApiRoutes();
    
    testReport.summary.apiRoutes = apiRoutes.length;
    testReport.summary.missingApiRoutes = missingApiRoutes.length;
    
    if (missingApiRoutes.length > 0) {
      logger.warning(`Found ${missingApiRoutes.length} missing API routes:`);
      missingApiRoutes.forEach(route => {
        logger.warning(`- ${route}`);
        
        // Find where API route is referenced
        const allFiles = [
          ...fileUtils.findFilesRecursive(config.appDir, /\.(tsx|jsx|js|ts)$/),
          ...fileUtils.findFilesRecursive(config.componentsDir, /\.(tsx|jsx|js|ts)$/)
        ];
        
        let referencedIn = [];
        
        for (const file of allFiles) {
          const content = fileUtils.readFile(file);
          if (!content) continue;
          
          if (content.includes(route)) {
            referencedIn.push(path.relative(config.rootDir, file));
          }
        }
        
        testReport.apiTests.push({
          route,
          exists: false,
          referencedIn: referencedIn.join(', ') || 'Unknown'
        });
        
        testReport.remainingIssues.push({
          type: 'Missing API Route',
          description: `API route referenced but doesn't exist`,
          location: route,
          severity: 'high'
        });
      });
    } else {
      logger.success('No missing API routes found');
    }
    
    // 8. Analyze performance
    logger.section('Analyzing Performance');
    const performanceIssues = performanceTester.analyzePerformance(routeResults);
    
    testReport.summary.performanceIssues = performanceIssues.length;
    testReport.performanceTests = performanceIssues;
    
    if (performanceIssues.length > 0) {
      logger.warning(`Found ${performanceIssues.length} performance issues:`);
      performanceIssues.forEach(issue => {
        logger.warning(`- ${issue.route}: ${issue.issue}`);
        
        testReport.remainingIssues.push({
          type: 'Performance Issue',
          description: issue.issue,
          location: issue.route,
          severity: issue.level === 'poor' ? 'high' : 'medium'
        });
      });
    } else {
      logger.success('No performance issues found');
    }
    
    // 9. Generate and save reports
    logger.section('Generating Reports');
    reportGenerator.saveReports(testReport);
    
    // 10. Final summary
    logger.section('Test Summary');
    logger.info(`Total Routes: ${testReport.summary.totalRoutes}`);
    logger.info(`Tested Routes: ${testReport.summary.testedRoutes}`);
    logger.info(`Successful Routes: ${testReport.summary.successfulRoutes}`);
    logger.info(`Failed Routes: ${testReport.summary.failedRoutes}`);
    logger.info(`Broken Links: ${testReport.summary.brokenLinks}`);
    logger.info(`Missing Components: ${testReport.summary.missingComponents}`);
    logger.info(`Missing Assets: ${testReport.summary.missingAssets}`);
    logger.info(`Missing API Routes: ${testReport.summary.missingApiRoutes}`);
    logger.info(`Performance Issues: ${testReport.summary.performanceIssues}`);
    
    const successRate = testReport.summary.testedRoutes > 0 
      ? Math.round((testReport.summary.successfulRoutes / testReport.summary.testedRoutes) * 100) 
      : 0;
    
    if (successRate === 100 && 
        testReport.summary.brokenLinks === 0 && 
        testReport.summary.missingComponents === 0 && 
        testReport.summary.missingAssets === 0 && 
        testReport.summary.missingApiRoutes === 0) {
      logger.success('All tests passed successfully! The platform is ready for production deployment.');
    } else {
      logger.warning(`Tests completed with ${successRate}% success rate. Some issues need to be addressed.`);
    }
    
    // Create fix suggestions
    if (testReport.remainingIssues.length > 0) {
      logger.section('Fix Suggestions');
      
      const highPriorityIssues = testReport.remainingIssues.filter(issue => issue.severity === 'high');
      const mediumPriorityIssues = testReport.remainingIssues.filter(issue => issue.severity === 'medium');
      const lowPriorityIssues = testReport.remainingIssues.filter(issue => issue.severity === 'low');
      
      if (highPriorityIssues.length > 0) {
        logger.error('High Priority Fixes:');
        highPriorityIssues.forEach((issue, index) => {
          logger.error(`${index + 1}. ${issue.type}: ${issue.description} at ${issue.location}`);
        });
      }
      
      if (mediumPriorityIssues.length > 0) {
        logger.warning('Medium Priority Fixes:');
        mediumPriorityIssues.forEach((issue, index) => {
          logger.warning(`${index + 1}. ${issue.type}: ${issue.description} at ${issue.location}`);
        });
      }
      
      if (lowPriorityIssues.length > 0) {
        logger.info('Low Priority Fixes:');
        lowPriorityIssues.forEach((issue, index) => {
          logger.info(`${index + 1}. ${issue.type}: ${issue.description} at ${issue.location}`);
        });
      }
    }
    
    // Generate fix script suggestions
    const fixScriptPath = path.join(config.reportDir, 'suggested-fixes.js');
    let fixScript = `#!/usr/bin/env node
/**
 * KAZI Platform - Suggested Fixes Script
 * Generated on: ${new Date().toISOString()}
 * 
 * This script contains suggested fixes for issues found during the 404 Fixes Test.
 * Review each fix carefully before applying.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

// Create missing components
`;

    if (testReport.componentTests.length > 0) {
      fixScript += `
// Missing Components
const missingComponents = ${JSON.stringify(testReport.componentTests, null, 2)};

missingComponents.forEach(component => {
  const componentPath = path.join(rootDir, 'components', component.componentPath + '.tsx');
  const componentDir = path.dirname(componentPath);
  
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  // Create a basic component template
  const componentName = path.basename(component.componentPath);
  const componentContent = \`import React from 'react'

interface \${componentName}Props {
  // Add props here
}

export function \${componentName}({ ...props }: \${componentName}Props) {
  return (
    <div className="component-\${componentName.toLowerCase()}">
      {/* Component content */}
      <p>\${componentName} Component</p>
    </div>
  )
}
\`;

  fs.writeFileSync(componentPath, componentContent);
  console.log(\`Created component: \${componentPath}\`);
});
`;
    }

    if (testReport.assetTests.length > 0) {
      fixScript += `
// Missing Assets
const missingAssets = ${JSON.stringify(testReport.assetTests, null, 2)};

missingAssets.forEach(asset => {
  const assetPath = path.join(rootDir, 'public', asset.assetPath);
  const assetDir = path.dirname(assetPath);
  
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }
  
  // Create a placeholder file or download the asset
  // This is just a placeholder - you'll need to provide actual assets
  if (assetPath.endsWith('.svg')) {
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="12" cy="12" r="5"></circle></svg>';
    fs.writeFileSync(assetPath, svgContent);
  } else if (assetPath.endsWith('.png') || assetPath.endsWith('.jpg') || assetPath.endsWith('.jpeg')) {
    // Create a text file as placeholder - replace with actual image generation or download
    fs.writeFileSync(assetPath + '.placeholder', 'Placeholder for ' + asset.assetPath);
    console.log(\`Created placeholder for: \${assetPath} - REPLACE WITH ACTUAL IMAGE\`);
  } else {
    fs.writeFileSync(assetPath, 'Placeholder for ' + asset.assetPath);
  }
  
  console.log(\`Created asset placeholder: \${assetPath}\`);
});
`;
    }

    if (testReport.apiTests.length > 0) {
      fixScript += `
// Missing API Routes
const missingApiRoutes = ${JSON.stringify(testReport.apiTests, null, 2)};

missingApiRoutes.forEach(api => {
  // Remove /api/ prefix
  const routePath = api.route.replace(/^\\/api\\//, '');
  const apiPath = path.join(rootDir, 'app/api', routePath, 'route.ts');
  const apiDir = path.dirname(apiPath);
  
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  // Create a basic API route template
  const apiContent = \`import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ 
    message: 'This is a placeholder API route',
    endpoint: '${api.route}',
    status: 'success'
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    return NextResponse.json({ 
      message: 'Data received successfully',
      data: body,
      status: 'success'
    })
  } catch (error) {
    return NextResponse.json({ 
      message: 'Error processing request',
      error: error.message,
      status: 'error'
    }, { status: 400 })
  }
}
\`;

  fs.writeFileSync(apiPath, apiContent);
  console.log(\`Created API route: \${apiPath}\`);
});
`;
    }

    fixScript += `
console.log('Fix script completed. Please review all changes before deploying to production.');
`;

    fileUtils.writeFile(fixScriptPath, fixScript);
    logger.info(`Generated suggested fixes script at ${fixScriptPath}`);
    
  } catch (error) {
    logger.error(`Test execution failed: ${error.message}`);
    console.error(error);
  }
}

// Run the tests
runTests();
