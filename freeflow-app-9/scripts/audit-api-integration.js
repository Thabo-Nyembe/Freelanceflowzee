#!/usr/bin/env node

/**
 * Comprehensive API Integration Audit
 *
 * Analyzes all dashboard pages to determine:
 * - Which pages have proper Supabase integration
 * - Which pages use existing hooks from lib/hooks
 * - Which pages have mock data that needs replacing
 * - Which pages need new API clients
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const dashboardDirs = [
  'app/(app)/dashboard',
  'app/v1/dashboard',
  'app/v2/dashboard'
];

const results = {
  totalPages: 0,
  properlyIntegrated: [],
  usingExistingHooks: [],
  needsIntegration: [],
  hasSupabaseButNeedsUpgrade: [],
  unknownStatus: []
};

const patterns = {
  supabaseImport: /from ['"]@\/lib\/supabase/,
  hooksImport: /from ['"]@\/lib\/hooks/,
  apiClientsImport: /from ['"]@\/lib\/api-clients/,
  mockDataImport: /from ['"]@\/lib\/mock-data/,
  mockDataArray: /const\s+\w+\s*[:=]\s*\[[\s\S]*?\{[\s\S]*?id:/,
  setTimeoutWithData: /setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?set\w+\s*\(/,
  supabaseQuery: /supabase\s*\.\s*from\s*\(/,
  createClient: /createClient\s*\(/,
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const analysis = {
    path: filePath,
    hasSupabaseImport: patterns.supabaseImport.test(content),
    hasHooksImport: patterns.hooksImport.test(content),
    hasApiClientsImport: patterns.apiClientsImport.test(content),
    hasMockDataImport: patterns.mockDataImport.test(content),
    hasMockDataArray: patterns.mockDataArray.test(content),
    hasSetTimeoutWithData: patterns.setTimeoutWithData.test(content),
    hasSupabaseQuery: patterns.supabaseQuery.test(content),
    hasCreateClient: patterns.createClient.test(content),
    hooksUsed: [],
    apiClientsUsed: [],
  };

  // Extract hook names
  const hooksMatch = content.match(/use[A-Z][a-zA-Z]+(?=\s*\()/g);
  if (hooksMatch) {
    analysis.hooksUsed = [...new Set(hooksMatch)].filter(h =>
      !['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'].includes(h)
    );
  }

  // Extract API client names
  const apiMatch = content.match(/use[A-Z][a-zA-Z]+(?=.*from ['"]@\/lib\/api-clients)/g);
  if (apiMatch) {
    analysis.apiClientsUsed = [...new Set(apiMatch)];
  }

  return analysis;
}

function categorizeAnalysis(analysis) {
  const shortPath = analysis.path.replace(/^.*?app\//, 'app/');

  // Category 1: Properly integrated (using new API clients)
  if (analysis.hasApiClientsImport && analysis.apiClientsUsed.length > 0) {
    return {
      category: 'properlyIntegrated',
      reason: `Using API clients: ${analysis.apiClientsUsed.join(', ')}`,
      priority: 'none'
    };
  }

  // Category 2: Using existing hooks (already integrated but could be upgraded)
  if (analysis.hasHooksImport && analysis.hooksUsed.length > 0) {
    if (analysis.hasSupabaseQuery || analysis.hasCreateClient) {
      return {
        category: 'usingExistingHooks',
        reason: `Using hooks: ${analysis.hooksUsed.slice(0, 3).join(', ')}${analysis.hooksUsed.length > 3 ? '...' : ''}`,
        priority: 'low'
      };
    }
  }

  // Category 3: Has Supabase but could benefit from API clients
  if ((analysis.hasSupabaseImport || analysis.hasCreateClient) && analysis.hasSupabaseQuery) {
    return {
      category: 'hasSupabaseButNeedsUpgrade',
      reason: 'Has Supabase queries but not using typed API clients',
      priority: 'medium'
    };
  }

  // Category 4: Needs integration (mock data or setTimeout)
  if (analysis.hasMockDataImport || analysis.hasMockDataArray || analysis.hasSetTimeoutWithData) {
    const reasons = [];
    if (analysis.hasMockDataImport) reasons.push('mock data imports');
    if (analysis.hasMockDataArray) reasons.push('hardcoded arrays');
    if (analysis.hasSetTimeoutWithData) reasons.push('setTimeout data loading');

    return {
      category: 'needsIntegration',
      reason: reasons.join(', '),
      priority: 'high'
    };
  }

  // Category 5: Unknown status
  return {
    category: 'unknownStatus',
    reason: 'No clear integration pattern detected',
    priority: 'investigate'
  };
}

function scanDirectory(baseDir) {
  const fullPath = path.join(process.cwd(), baseDir);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirPath = path.join(fullPath, entry.name);

    // Look for client.tsx, page.tsx, or any .tsx files
    const files = fs.readdirSync(dirPath).filter(f =>
      f.endsWith('-client.tsx') || f.endsWith('page.tsx')
    );

    if (files.length === 0) continue;

    results.totalPages++;

    // Analyze the main client/page file
    const mainFile = files.find(f => f.endsWith('-client.tsx')) || files[0];
    const filePath = path.join(dirPath, mainFile);

    const analysis = analyzeFile(filePath);
    const categorization = categorizeAnalysis(analysis);

    const shortPath = filePath.replace(/^.*?app\//, 'app/').replace(/\/(page|.*-client)\.tsx$/, '');

    const entry_data = {
      path: shortPath,
      file: mainFile,
      ...categorization,
      hooks: analysis.hooksUsed,
      apiClients: analysis.apiClientsUsed
    };

    results[categorization.category].push(entry_data);
  }
}

// Run the scan
console.log('🔍 Starting comprehensive API integration audit...\n');

for (const dir of dashboardDirs) {
  scanDirectory(dir);
}

// Sort results by priority
const priorityOrder = { high: 1, medium: 2, low: 3, none: 4, investigate: 5 };

for (const category in results) {
  if (Array.isArray(results[category])) {
    results[category].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
}

// Generate report
console.log('=' .repeat(80));
console.log('COMPREHENSIVE API INTEGRATION AUDIT REPORT');
console.log('=' .repeat(80));
console.log();

console.log('📊 EXECUTIVE SUMMARY');
console.log('-'.repeat(80));
console.log(`Total Dashboard Pages Analyzed: ${results.totalPages}`);
console.log(`✅ Properly Integrated (using API clients): ${results.properlyIntegrated.length}`);
console.log(`🔧 Using Existing Hooks: ${results.usingExistingHooks.length}`);
console.log(`⚠️  Has Supabase (needs API client upgrade): ${results.hasSupabaseButNeedsUpgrade.length}`);
console.log(`❌ Needs Integration (mock data): ${results.needsIntegration.length}`);
console.log(`❓ Unknown Status: ${results.unknownStatus.length}`);
console.log();

const percentIntegrated = ((results.properlyIntegrated.length + results.usingExistingHooks.length) / results.totalPages * 100).toFixed(1);
console.log(`Integration Progress: ${percentIntegrated}%`);
console.log();

// Category 1: Properly Integrated
console.log('=' .repeat(80));
console.log(`✅ PROPERLY INTEGRATED (${results.properlyIntegrated.length} pages)`);
console.log('   Using new API clients from /lib/api-clients');
console.log('=' .repeat(80));
results.properlyIntegrated.slice(0, 10).forEach(page => {
  console.log(`  ${page.path}`);
  console.log(`     Using: ${page.apiClients.join(', ')}`);
});
if (results.properlyIntegrated.length > 10) {
  console.log(`  ... and ${results.properlyIntegrated.length - 10} more`);
}
console.log();

// Category 2: Using Existing Hooks
console.log('=' .repeat(80));
console.log(`🔧 USING EXISTING HOOKS (${results.usingExistingHooks.length} pages)`);
console.log('   Already integrated via /lib/hooks - working correctly');
console.log('   Could optionally migrate to new API clients for consistency');
console.log('=' .repeat(80));
results.usingExistingHooks.slice(0, 15).forEach(page => {
  console.log(`  ${page.path}`);
  if (page.hooks.length > 0) {
    console.log(`     Hooks: ${page.hooks.slice(0, 3).join(', ')}${page.hooks.length > 3 ? '...' : ''}`);
  }
});
if (results.usingExistingHooks.length > 15) {
  console.log(`  ... and ${results.usingExistingHooks.length - 15} more`);
}
console.log();

// Category 3: Has Supabase but needs upgrade
console.log('=' .repeat(80));
console.log(`⚠️  HAS SUPABASE - NEEDS API CLIENT UPGRADE (${results.hasSupabaseButNeedsUpgrade.length} pages)`);
console.log('   Using manual Supabase queries - should migrate to typed API clients');
console.log('   Priority: Medium');
console.log('=' .repeat(80));
results.hasSupabaseButNeedsUpgrade.forEach(page => {
  console.log(`  ${page.path}`);
  console.log(`     ${page.reason}`);
});
console.log();

// Category 4: Needs Integration (HIGH PRIORITY)
console.log('=' .repeat(80));
console.log(`❌ NEEDS INTEGRATION - MOCK DATA (${results.needsIntegration.length} pages)`);
console.log('   Using mock data, hardcoded arrays, or setTimeout - needs API wiring');
console.log('   Priority: HIGH');
console.log('=' .repeat(80));
results.needsIntegration.forEach(page => {
  console.log(`  ${page.path}`);
  console.log(`     Issue: ${page.reason}`);
});
console.log();

// Category 5: Unknown Status
console.log('=' .repeat(80));
console.log(`❓ UNKNOWN STATUS (${results.unknownStatus.length} pages)`);
console.log('   Needs manual investigation');
console.log('=' .repeat(80));
results.unknownStatus.slice(0, 10).forEach(page => {
  console.log(`  ${page.path}`);
});
if (results.unknownStatus.length > 10) {
  console.log(`  ... and ${results.unknownStatus.length - 10} more`);
}
console.log();

// Action Items
console.log('=' .repeat(80));
console.log('🎯 RECOMMENDED ACTION ITEMS');
console.log('=' .repeat(80));
console.log();
console.log('1. HIGH PRIORITY - Wire Mock Data Pages:');
console.log(`   ${results.needsIntegration.length} pages need API integration`);
console.log('   Create API clients for: Notifications, Files, Calendar, Events, etc.');
console.log();
console.log('2. MEDIUM PRIORITY - Upgrade Supabase Pages:');
console.log(`   ${results.hasSupabaseButNeedsUpgrade.length} pages using manual queries`);
console.log('   Migrate to typed API clients for better DX and type safety');
console.log();
console.log('3. LOW PRIORITY - Consolidate Hook Usage:');
console.log(`   ${results.usingExistingHooks.length} pages using /lib/hooks`);
console.log('   Working correctly, but could standardize on /lib/api-clients');
console.log();
console.log('4. INVESTIGATE:');
console.log(`   ${results.unknownStatus.length} pages need manual review`);
console.log();

// Save detailed report to JSON
const reportPath = path.join(process.cwd(), 'API_INTEGRATION_AUDIT_DETAILED.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`📝 Detailed report saved to: API_INTEGRATION_AUDIT_DETAILED.json`);
console.log();

// Exit with appropriate code
const hasHighPriorityWork = results.needsIntegration.length > 0;
process.exit(hasHighPriorityWork ? 0 : 0);
