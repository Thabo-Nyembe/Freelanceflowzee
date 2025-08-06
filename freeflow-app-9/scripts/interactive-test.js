#!/usr/bin/env node

/**
 * KAZI Platform - Interactive Test Script
 * 
 * This script performs comprehensive testing of all routes and interactivity
 * of the KAZI platform, including dashboard features, navigation, API endpoints,
 * and icon rendering.
 * 
 * Usage: node scripts/interactive-test.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { JSDOM } = require('jsdom');
const chalk = require('chalk');

// Configuration
const BASE_URL = 'http://localhost:9323';
const REPORT_PATH = path.join(__dirname, '..', 'interactive-test-results.json');
const TIMEOUT = 10000; // 10 seconds timeout for requests
const USER_AGENT = 'KAZI-Interactive-Test/1.0';

// Color configuration for console output
const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  header: chalk.cyan.bold,
  subheader: chalk.magenta,
  highlight: chalk.bold.white.bgBlue
};

// Dashboard routes organized by category (from the features list)
const dashboardRoutes = {
  core: [
    { path: '/dashboard/my-day', name: 'My Day', expectedIcons: ['Calendar'] },
    { path: '/dashboard/projects-hub', name: 'Projects Hub', expectedIcons: ['FolderOpen'] },
    { path: '/dashboard/analytics', name: 'Analytics', expectedIcons: ['TrendingUp'] },
    { path: '/dashboard/time-tracking', name: 'Time Tracking', expectedIcons: ['Clock'] }
  ],
  ai: [
    { path: '/dashboard/ai-create', name: 'AI Create', expectedIcons: ['Brain'] },
    { path: '/dashboard/ai-design', name: 'AI Design', expectedIcons: ['Palette'] },
    { path: '/dashboard/ai-assistant', name: 'AI Assistant', expectedIcons: ['Zap'] },
    { path: '/dashboard/ai-enhanced', name: 'AI Enhanced', expectedIcons: ['Star'] }
  ],
  creative: [
    { path: '/dashboard/video-studio', name: 'Video Studio', expectedIcons: ['Video'] },
    { path: '/dashboard/canvas', name: 'Canvas', expectedIcons: ['Monitor'] },
    { path: '/dashboard/canvas-collaboration', name: 'Canvas Collaboration', expectedIcons: ['Users'] },
    { path: '/dashboard/gallery', name: 'Gallery', expectedIcons: ['Image'] },
    { path: '/dashboard/cv-portfolio', name: 'CV & Portfolio', expectedIcons: ['User'] }
  ],
  business: [
    { path: '/dashboard/financial-hub', name: 'Financial Hub', expectedIcons: ['DollarSign'] },
    { path: '/dashboard/financial', name: 'Financial', expectedIcons: ['Wallet'] },
    { path: '/dashboard/invoices', name: 'Invoices', expectedIcons: ['Receipt'] },
    { path: '/dashboard/escrow', name: 'Escrow', expectedIcons: ['Shield'] },
    { path: '/dashboard/bookings', name: 'Bookings', expectedIcons: ['Calendar'] },
    { path: '/dashboard/booking', name: 'Booking', expectedIcons: ['Calendar'] }
  ],
  communication: [
    { path: '/dashboard/messages', name: 'Messages', expectedIcons: ['MessageSquare'] },
    { path: '/dashboard/collaboration', name: 'Collaboration', expectedIcons: ['Users'] },
    { path: '/dashboard/team-hub', name: 'Team Hub', expectedIcons: ['Building'] },
    { path: '/dashboard/team', name: 'Team', expectedIcons: ['Users'] },
    { path: '/dashboard/client-zone', name: 'Client Zone', expectedIcons: ['UserCheck'] },
    { path: '/dashboard/clients', name: 'Clients', expectedIcons: ['Users'] }
  ],
  storage: [
    { path: '/dashboard/files-hub', name: 'Files Hub', expectedIcons: ['FileText'] },
    { path: '/dashboard/files', name: 'Files', expectedIcons: ['Archive'] },
    { path: '/dashboard/cloud-storage', name: 'Cloud Storage', expectedIcons: ['Cloud'] },
    { path: '/dashboard/storage', name: 'Storage', expectedIcons: ['Archive'] }
  ],
  productivity: [
    { path: '/dashboard/workflow-builder', name: 'Workflow Builder', expectedIcons: ['GitBranch'] },
    { path: '/dashboard/notifications', name: 'Notifications', expectedIcons: ['Bell'] },
    { path: '/dashboard/calendar', name: 'Calendar', expectedIcons: ['Calendar'] }
  ],
  community: [
    { path: '/dashboard/community-hub', name: 'Community Hub', expectedIcons: ['Globe'] },
    { path: '/dashboard/community', name: 'Community', expectedIcons: ['Globe'] }
  ],
  settings: [
    { path: '/dashboard/settings', name: 'Settings', expectedIcons: ['Settings'] },
    { path: '/dashboard/profile', name: 'Profile', expectedIcons: ['User'] }
  ],
  advanced: [
    { path: '/dashboard/team-management', name: 'Team Management', expectedIcons: ['Users'] },
    { path: '/dashboard/project-templates', name: 'Project Templates', expectedIcons: ['FileText'] },
    { path: '/dashboard/client-portal', name: 'Client Portal', expectedIcons: ['UserCheck'] },
    { path: '/dashboard/resource-library', name: 'Resource Library', expectedIcons: ['Archive'] },
    { path: '/dashboard/performance-analytics', name: 'Performance Analytics', expectedIcons: ['TrendingUp'] }
  ]
};

// Main navigation routes
const mainRoutes = [
  { path: '/', name: 'Landing Page' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
  { path: '/features', name: 'Features' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/blog', name: 'Blog' },
  { path: '/docs', name: 'Documentation' },
  { path: '/community', name: 'Community' },
  { path: '/contact', name: 'Contact' },
  { path: '/demo-features', name: 'Demo Features' }
];

// API endpoints
const apiEndpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/mock/analytics-dashboard', name: 'Analytics Dashboard' },
  { path: '/api/mock/projects', name: 'Projects' },
  { path: '/api/mock/users', name: 'Users' },
  { path: '/api/mock/files', name: 'Files' },
  { path: '/api/mock/posts', name: 'Posts' },
  { path: '/api/mock/analytics-events', name: 'Analytics Events' },
  { path: '/api/mock/analytics-insights', name: 'Analytics Insights' },
  { path: '/api/bookings/time-slots', name: 'Booking Time Slots' },
  { path: '/api/collaboration/enhanced', name: 'Enhanced Collaboration' },
  { path: '/api/collaboration/real-time', name: 'Real-time Collaboration' },
  { path: '/api/collaboration/universal-feedback', name: 'Universal Feedback' }
];

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  routes: {
    dashboard: [],
    main: [],
    api: []
  },
  iconTests: [],
  navigationTests: [],
  brokenLinks: [],
  performance: {},
  errors: []
};

/**
 * Makes an HTTP request to the specified URL and returns the response
 * @param {string} url - The URL to request
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @returns {Promise<Object>} - The response object
 */
async function makeRequest(url, method = 'GET') {
  try {
    const response = await axios({
      method,
      url,
      timeout: TIMEOUT,
      headers: {
        'User-Agent': USER_AGENT
      },
      validateStatus: () => true // Don't throw on error status codes
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      success: response.status >= 200 && response.status < 300
    };
  } catch (error) {
    return {
      status: 0,
      statusText: error.message,
      data: null,
      headers: {},
      success: false,
      error: error.message
    };
  }
}

/**
 * Tests a single route and returns the result
 * @param {string} path - The path to test
 * @param {string} name - The name of the route
 * @param {Array<string>} [expectedIcons] - Expected icons on the page
 * @returns {Promise<Object>} - The test result
 */
async function testRoute(path, name, expectedIcons = []) {
  console.log(colors.info(`Testing route: ${path} (${name})`));
  
  const url = `${BASE_URL}${path}`;
  const startTime = Date.now();
  const response = await makeRequest(url);
  const endTime = Date.now();
  const loadTime = endTime - startTime;
  
  const result = {
    path,
    name,
    status: response.status,
    success: response.success,
    loadTime,
    timestamp: new Date().toISOString()
  };
  
  if (!response.success) {
    result.error = response.statusText;
    console.log(colors.error(`✗ ${name} (${path}) - Status: ${response.status} - ${response.statusText}`));
    testResults.summary.failed++;
  } else {
    console.log(colors.success(`✓ ${name} (${path}) - Status: ${response.status} - Load time: ${loadTime}ms`));
    testResults.summary.passed++;
    
    // Check for icons if HTML response and expectedIcons provided
    if (expectedIcons && expectedIcons.length > 0 && response.data && typeof response.data === 'string') {
      const iconResults = checkIconsInHTML(response.data, expectedIcons);
      result.iconTest = iconResults;
      
      if (iconResults.missingIcons.length > 0) {
        console.log(colors.warning(`⚠ Missing icons in ${name}: ${iconResults.missingIcons.join(', ')}`));
        testResults.summary.warnings++;
      } else {
        console.log(colors.success(`✓ All expected icons found in ${name}`));
      }
      
      testResults.iconTests.push({
        path,
        name,
        ...iconResults
      });
    }
    
    // Check for broken links
    if (response.data && typeof response.data === 'string') {
      const brokenLinks = checkBrokenLinks(response.data, path);
      result.brokenLinks = brokenLinks;
      
      if (brokenLinks.length > 0) {
        console.log(colors.warning(`⚠ Found ${brokenLinks.length} potentially broken links in ${name}`));
        testResults.summary.warnings++;
        testResults.brokenLinks.push({
          path,
          name,
          links: brokenLinks
        });
      }
    }
  }
  
  testResults.summary.total++;
  return result;
}

/**
 * Checks if expected icons are present in HTML
 * @param {string} html - The HTML content
 * @param {Array<string>} expectedIcons - Expected icon names
 * @returns {Object} - Results of the icon check
 */
function checkIconsInHTML(html, expectedIcons) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const foundIcons = [];
    const missingIcons = [];
    
    // Look for SVG elements that might be icons
    const svgElements = document.querySelectorAll('svg');
    
    // For each expected icon, check if it's in the HTML
    expectedIcons.forEach(iconName => {
      // Different ways an icon might be represented
      const patterns = [
        `lucide-${iconName.toLowerCase()}`, // class name pattern
        `data-icon="${iconName.toLowerCase()}"`, // data attribute pattern
        `aria-label="${iconName}"`, // aria label pattern
        `class="h-[0-9]+ w-[0-9]+"` // generic icon size pattern
      ];
      
      let found = false;
      
      // Check if any SVG matches our patterns
      for (const svg of svgElements) {
        const outerHTML = svg.outerHTML;
        if (patterns.some(pattern => new RegExp(pattern).test(outerHTML))) {
          found = true;
          break;
        }
      }
      
      // Also check for icon class names in the HTML
      if (!found) {
        const iconClassRegex = new RegExp(`(${iconName}|lucide-${iconName.toLowerCase()})`, 'i');
        if (iconClassRegex.test(html)) {
          found = true;
        }
      }
      
      if (found) {
        foundIcons.push(iconName);
      } else {
        missingIcons.push(iconName);
      }
    });
    
    return {
      foundIcons,
      missingIcons,
      allFound: missingIcons.length === 0
    };
  } catch (error) {
    return {
      foundIcons: [],
      missingIcons: expectedIcons,
      allFound: false,
      error: error.message
    };
  }
}

/**
 * Checks for potentially broken links in HTML
 * @param {string} html - The HTML content
 * @param {string} currentPath - The current path
 * @returns {Array<Object>} - List of potentially broken links
 */
function checkBrokenLinks(html, currentPath) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const links = document.querySelectorAll('a');
    const brokenLinks = [];
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip if no href, or it's a hash, javascript:, mailto:, tel:, etc.
      if (!href || href === '#' || href.startsWith('javascript:') || 
          href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      // Skip external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return;
      }
      
      // Skip anchor links on the same page
      if (href.startsWith('#')) {
        return;
      }
      
      // Add to list of links to check
      brokenLinks.push({
        href,
        text: link.textContent.trim(),
        fromPath: currentPath
      });
    });
    
    return brokenLinks;
  } catch (error) {
    return [];
  }
}

/**
 * Tests navigation between pages
 * @param {string} fromPath - The starting path
 * @param {string} toPath - The destination path
 * @returns {Promise<Object>} - The test result
 */
async function testNavigation(fromPath, toPath) {
  console.log(colors.info(`Testing navigation: ${fromPath} → ${toPath}`));
  
  // For a more comprehensive test, we would use Puppeteer or Playwright
  // to actually click links and navigate, but for this script we'll
  // just check that both pages load and the from page contains a link to the to page
  
  const fromUrl = `${BASE_URL}${fromPath}`;
  const fromResponse = await makeRequest(fromUrl);
  
  if (!fromResponse.success) {
    console.log(colors.error(`✗ Navigation test failed - Source page ${fromPath} not available`));
    return {
      fromPath,
      toPath,
      success: false,
      error: `Source page not available: ${fromResponse.statusText}`
    };
  }
  
  const toUrl = `${BASE_URL}${toPath}`;
  const toResponse = await makeRequest(toUrl);
  
  if (!toResponse.success) {
    console.log(colors.error(`✗ Navigation test failed - Destination page ${toPath} not available`));
    return {
      fromPath,
      toPath,
      success: false,
      error: `Destination page not available: ${toResponse.statusText}`
    };
  }
  
  // Check if the from page contains a link to the to page
  let linkFound = false;
  if (fromResponse.data && typeof fromResponse.data === 'string') {
    const dom = new JSDOM(fromResponse.data);
    const document = dom.window.document;
    const links = document.querySelectorAll('a');
    
    for (const link of links) {
      const href = link.getAttribute('href');
      if (href === toPath || href === toUrl) {
        linkFound = true;
        break;
      }
    }
  }
  
  const result = {
    fromPath,
    toPath,
    success: true,
    linkFound
  };
  
  if (!linkFound) {
    console.log(colors.warning(`⚠ Navigation test partial - No direct link found from ${fromPath} to ${toPath}`));
    testResults.summary.warnings++;
  } else {
    console.log(colors.success(`✓ Navigation test passed - ${fromPath} → ${toPath}`));
  }
  
  testResults.navigationTests.push(result);
  return result;
}

/**
 * Runs all tests and generates a report
 */
async function runTests() {
  const startTime = Date.now();
  
  console.log(colors.header('='.repeat(80)));
  console.log(colors.header('KAZI PLATFORM INTERACTIVE TEST'));
  console.log(colors.header('='.repeat(80)));
  console.log(`Testing server at: ${colors.highlight(BASE_URL)}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(colors.header('='.repeat(80)));
  
  // Check if server is running
  try {
    console.log(colors.info('Checking if server is running...'));
    const healthCheck = await makeRequest(`${BASE_URL}/api/health`);
    
    if (!healthCheck.success) {
      console.log(colors.error(`✗ Server is not responding at ${BASE_URL}`));
      console.log(colors.error('Make sure the server is running on port 9323'));
      process.exit(1);
    }
    
    console.log(colors.success(`✓ Server is running at ${BASE_URL}`));
  } catch (error) {
    console.log(colors.error(`✗ Server check failed: ${error.message}`));
    console.log(colors.error('Make sure the server is running on port 9323'));
    process.exit(1);
  }
  
  // Test main routes
  console.log(colors.subheader('\nTesting Main Navigation Routes:'));
  console.log(colors.subheader('-'.repeat(40)));
  
  for (const route of mainRoutes) {
    const result = await testRoute(route.path, route.name);
    testResults.routes.main.push(result);
  }
  
  // Test dashboard routes
  console.log(colors.subheader('\nTesting Dashboard Routes:'));
  console.log(colors.subheader('-'.repeat(40)));
  
  for (const category in dashboardRoutes) {
    console.log(colors.subheader(`\n${category.toUpperCase()} Category:`));
    
    for (const route of dashboardRoutes[category]) {
      const result = await testRoute(route.path, route.name, route.expectedIcons);
      testResults.routes.dashboard.push(result);
    }
  }
  
  // Test API endpoints
  console.log(colors.subheader('\nTesting API Endpoints:'));
  console.log(colors.subheader('-'.repeat(40)));
  
  for (const endpoint of apiEndpoints) {
    const result = await testRoute(endpoint.path, endpoint.name);
    testResults.routes.api.push(result);
  }
  
  // Test navigation between key pages
  console.log(colors.subheader('\nTesting Navigation Between Pages:'));
  console.log(colors.subheader('-'.repeat(40)));
  
  // Test navigation from landing to dashboard
  await testNavigation('/', '/dashboard');
  
  // Test navigation between dashboard categories
  const dashboardCategories = Object.keys(dashboardRoutes);
  for (let i = 0; i < dashboardCategories.length - 1; i++) {
    const fromCategory = dashboardCategories[i];
    const toCategory = dashboardCategories[i + 1];
    
    if (dashboardRoutes[fromCategory].length > 0 && dashboardRoutes[toCategory].length > 0) {
      await testNavigation(
        dashboardRoutes[fromCategory][0].path,
        dashboardRoutes[toCategory][0].path
      );
    }
  }
  
  // Test navigation from dashboard to main pages
  await testNavigation('/dashboard', '/');
  await testNavigation('/dashboard', '/settings');
  
  // Generate summary
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  testResults.performance = {
    totalTime,
    averageResponseTime: testResults.routes.dashboard
      .concat(testResults.routes.main)
      .concat(testResults.routes.api)
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.loadTime, 0) / testResults.summary.total
  };
  
  // Print summary
  console.log(colors.header('\n='.repeat(80)));
  console.log(colors.header('TEST SUMMARY'));
  console.log(colors.header('='.repeat(80)));
  console.log(`Total tests: ${testResults.summary.total}`);
  console.log(`Passed: ${colors.success(testResults.summary.passed)}`);
  console.log(`Failed: ${colors.error(testResults.summary.failed)}`);
  console.log(`Warnings: ${colors.warning(testResults.summary.warnings)}`);
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Average response time: ${Math.round(testResults.performance.averageResponseTime)}ms`);
  
  // Save report to file
  fs.writeFileSync(REPORT_PATH, JSON.stringify(testResults, null, 2));
  console.log(colors.info(`\nDetailed report saved to: ${REPORT_PATH}`));
  
  // Final status
  if (testResults.summary.failed > 0) {
    console.log(colors.error('\n❌ Tests completed with failures'));
    process.exit(1);
  } else if (testResults.summary.warnings > 0) {
    console.log(colors.warning('\n⚠️ Tests completed with warnings'));
    process.exit(0);
  } else {
    console.log(colors.success('\n✅ All tests passed successfully'));
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(colors.error(`Unhandled error: ${error.message}`));
  console.error(error.stack);
  process.exit(1);
});
