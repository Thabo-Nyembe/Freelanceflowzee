#!/usr/bin/env node

/**
 * Final Route Validation Script
 * Verifies all 303 dashboard routes return proper HTTP status codes
 */

import http from 'http';
import fs from 'fs';

const BASE_URL = 'http://localhost:9323';
const BATCH_FILES = ['batch-aa', 'batch-ab', 'batch-ac', 'batch-ad', 'batch-ae'];

const results = {
  working: [],
  errors: [],
  total: 0,
  timestamp: new Date().toISOString()
};

async function testRoute(route) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9323,
      path: `/dashboard/${route}`,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        route,
        status: res.statusCode,
        url: `${BASE_URL}/dashboard/${route}`
      });
    });

    req.on('error', (err) => {
      resolve({
        route,
        status: 'ERROR',
        error: err.message,
        url: `${BASE_URL}/dashboard/${route}`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        route,
        status: 'TIMEOUT',
        url: `${BASE_URL}/dashboard/${route}`
      });
    });

    req.end();
  });
}

async function loadRoutesFromBatch(batchFile) {
  const content = fs.readFileSync(batchFile, 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

async function main() {
  console.log('='.repeat(80));
  console.log('FINAL DASHBOARD ROUTES VALIDATION');
  console.log('='.repeat(80));
  console.log('');

  // Load all routes
  const allRoutes = [];
  for (const batchFile of BATCH_FILES) {
    const routes = await loadRoutesFromBatch(batchFile);
    allRoutes.push(...routes);
    console.log(`✓ Loaded ${routes.length} routes from ${batchFile}`);
  }

  results.total = allRoutes.length;
  console.log('');
  console.log(`Total routes to validate: ${results.total}`);
  console.log('');
  console.log('Testing routes...');
  console.log('-'.repeat(80));

  // Test all routes
  for (let i = 0; i < allRoutes.length; i++) {
    const route = allRoutes[i];
    const result = await testRoute(route);

    // Status codes that indicate the page exists:
    // 200 = OK (page loaded)
    // 307 = Temporary Redirect (to login - page exists but requires auth)
    // 302 = Redirect (to login)
    const pageExists = [200, 307, 302].includes(result.status);

    if (pageExists) {
      results.working.push(result);
      console.log(`✅ [${i + 1}/${allRoutes.length}] ${route}: ${result.status}`);
    } else {
      results.errors.push(result);
      console.log(`❌ [${i + 1}/${allRoutes.length}] ${route}: ${result.status}`);
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('-'.repeat(80));
  console.log('');
  console.log('='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Total routes tested:     ${results.total}`);
  console.log(`✅ Working routes:       ${results.working.length} (${(results.working.length / results.total * 100).toFixed(1)}%)`);
  console.log(`❌ Error routes:         ${results.errors.length} (${(results.errors.length / results.total * 100).toFixed(1)}%)`);
  console.log('');

  if (results.errors.length > 0) {
    console.log('ERROR DETAILS:');
    console.log('-'.repeat(80));
    results.errors.forEach(err => {
      console.log(`  ❌ ${err.route}`);
      console.log(`     Status: ${err.status}`);
      console.log(`     URL: ${err.url}`);
      if (err.error) {
        console.log(`     Error: ${err.error}`);
      }
      console.log('');
    });
  }

  // Save detailed results
  const reportPath = '/Users/thabonyembe/Documents/freeflow-app-9/final-route-validation.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Detailed report saved: ${reportPath}`);

  // Generate markdown summary
  let md = '# Final Dashboard Routes Validation\n\n';
  md += `**Date:** ${new Date().toLocaleString()}\n\n`;
  md += '## Summary\n\n';
  md += `- Total routes: ${results.total}\n`;
  md += `- ✅ Working: ${results.working.length} (${(results.working.length / results.total * 100).toFixed(1)}%)\n`;
  md += `- ❌ Errors: ${results.errors.length} (${(results.errors.length / results.total * 100).toFixed(1)}%)\n\n`;

  if (results.errors.length > 0) {
    md += '## Routes with Errors\n\n';
    results.errors.forEach(err => {
      md += `- **${err.route}**\n`;
      md += `  - Status: ${err.status}\n`;
      md += `  - URL: ${err.url}\n`;
      if (err.error) {
        md += `  - Error: ${err.error}\n`;
      }
      md += '\n';
    });
  } else {
    md += '## ✅ All Routes Working!\n\n';
    md += 'All dashboard routes are accessible and returning valid HTTP status codes.\n\n';
    md += '**Status codes observed:**\n';
    md += '- `200` - Page loaded successfully\n';
    md += '- `307` - Redirect to login (page exists, requires authentication)\n';
    md += '- `302` - Redirect to login\n\n';
  }

  md += '---\n\n';
  md += `*Report generated on ${new Date().toLocaleString()}*\n`;

  const mdPath = '/Users/thabonyembe/Documents/freeflow-app-9/FINAL_ROUTE_VALIDATION.md';
  fs.writeFileSync(mdPath, md);
  console.log(`Markdown report saved: ${mdPath}`);

  console.log('='.repeat(80));

  // Exit with appropriate code
  process.exit(results.errors.length > 0 ? 1 : 0);
}

main().catch(console.error);
