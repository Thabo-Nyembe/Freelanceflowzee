#!/usr/bin/env node
/**
 * KAZI Bundle Size Analysis Script
 *
 * This script analyzes the project's bundle size and identifies optimization opportunities.
 * Run with: node scripts/analyze-bundle.js
 *
 * For visual bundle analysis, run: npm run analyze
 */

const fs = require('fs');
const path = require('path');

// Heavy dependencies to watch (estimated gzipped sizes in KB)
const HEAVY_DEPENDENCIES = {
  // Large libraries (>50KB gzipped)
  'framer-motion': { size: '~95KB', alternative: 'Consider lazy loading or use CSS animations for simple cases' },
  '@react-pdf/renderer': { size: '~300KB', alternative: 'Lazy load only when needed for PDF generation' },
  'recharts': { size: '~150KB', alternative: 'Use individual chart imports or lightweight-charts' },
  'xlsx': { size: '~400KB', alternative: 'Lazy load for export features only' },
  '@blocknote/core': { size: '~200KB', alternative: 'Lazy load editor component' },
  '@blocknote/react': { size: '~50KB', alternative: 'Bundle with @blocknote/core' },
  'puppeteer-core': { size: '~2MB', alternative: 'Server-side only, ensure not bundled client-side' },
  'jspdf': { size: '~300KB', alternative: 'Lazy load for PDF generation' },
  'wavesurfer.js': { size: '~80KB', alternative: 'Lazy load for audio features' },
  'socket.io-client': { size: '~60KB', alternative: 'Use WebSocket API directly for simpler cases' },
  'openai': { size: '~100KB', alternative: 'Server-side only API calls' },
  '@aws-sdk/client-s3': { size: '~200KB', alternative: 'Server-side only, use presigned URLs' },

  // Medium libraries (20-50KB gzipped)
  'lucide-react': { size: '~depends', alternative: 'Import icons individually, not as * import' },
  'date-fns': { size: '~20KB', alternative: 'Already using, good tree-shaking support' },
  '@tanstack/react-query': { size: '~40KB', alternative: 'Essential for data fetching, keep as-is' },
  'react-hook-form': { size: '~25KB', alternative: 'Essential for forms, keep as-is' },
  'zod': { size: '~15KB', alternative: 'Essential for validation, keep as-is' },
};

// Files with potential large lucide-react imports
const LARGE_ICON_IMPORT_THRESHOLD = 10;

function analyzePackageJson() {
  console.log('\n=== KAZI Bundle Size Analysis ===\n');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  console.log('1. HEAVY DEPENDENCIES DETECTED:\n');
  console.log('   Dependencies that may significantly impact bundle size:\n');

  const detectedHeavy = [];

  for (const [dep, info] of Object.entries(HEAVY_DEPENDENCIES)) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      detectedHeavy.push({ name: dep, ...info });
      console.log(`   - ${dep} (${info.size})`);
      console.log(`     Optimization: ${info.alternative}\n`);
    }
  }

  return detectedHeavy;
}

function findLargeIconImports() {
  console.log('\n2. LARGE ICON IMPORTS:\n');
  console.log('   Files importing many icons from lucide-react (potential tree-shaking issues):\n');

  const srcDirs = ['app', 'components', 'lib'];
  const iconImportPattern = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  const findings = [];

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          let match;

          while ((match = iconImportPattern.exec(content)) !== null) {
            const icons = match[1].split(',').map(s => s.trim()).filter(Boolean);

            if (icons.length >= LARGE_ICON_IMPORT_THRESHOLD) {
              findings.push({
                file: fullPath,
                iconCount: icons.length,
                icons: icons.slice(0, 5).join(', ') + (icons.length > 5 ? '...' : '')
              });
            }
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    }
  }

  srcDirs.forEach(dir => scanDir(path.join(process.cwd(), dir)));

  // Sort by icon count descending
  findings.sort((a, b) => b.iconCount - a.iconCount);

  if (findings.length > 0) {
    findings.forEach(f => {
      const relativePath = path.relative(process.cwd(), f.file);
      console.log(`   - ${relativePath}`);
      console.log(`     Icons imported: ${f.iconCount}`);
      console.log(`     Sample: ${f.icons}\n`);
    });
  } else {
    console.log('   No files found with excessive icon imports.\n');
  }

  return findings;
}

function checkDynamicImports() {
  console.log('\n3. DYNAMIC IMPORT ANALYSIS:\n');

  const dynamicImportsFile = path.join(process.cwd(), 'lib/dynamic-imports.ts');

  if (fs.existsSync(dynamicImportsFile)) {
    console.log('   lib/dynamic-imports.ts exists with lazy-loaded components.\n');
  } else {
    console.log('   Consider creating lib/dynamic-imports.ts for centralized lazy loading.\n');
  }

  // Count dynamic imports in the codebase
  let dynamicImportCount = 0;
  const srcDirs = ['app', 'components'];

  function countDynamicImports(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        countDynamicImports(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.match(/dynamic\s*\(/g);
          if (matches) {
            dynamicImportCount += matches.length;
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    }
  }

  srcDirs.forEach(dir => countDynamicImports(path.join(process.cwd(), dir)));

  console.log(`   Found ${dynamicImportCount} dynamic imports in the codebase.\n`);

  return dynamicImportCount;
}

function generateRecommendations(heavyDeps, iconFindings, dynamicCount) {
  console.log('\n4. OPTIMIZATION RECOMMENDATIONS:\n');

  const recommendations = [];

  // Heavy deps recommendations
  if (heavyDeps.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Heavy Dependencies',
      action: 'Review and lazy load heavy dependencies',
      details: `Found ${heavyDeps.length} heavy dependencies. Consider dynamic imports for: ${heavyDeps.slice(0, 3).map(d => d.name).join(', ')}`
    });
  }

  // Icon imports recommendations
  if (iconFindings.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Icon Imports',
      action: 'Optimize lucide-react imports',
      details: `${iconFindings.length} files import ${LARGE_ICON_IMPORT_THRESHOLD}+ icons. Consider icon component wrapper or selective imports.`
    });
  }

  // Dynamic imports recommendations
  if (dynamicCount < 20) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Code Splitting',
      action: 'Increase use of dynamic imports',
      details: 'Consider lazy loading more components, especially for dashboard features and modals.'
    });
  }

  // General recommendations
  recommendations.push({
    priority: 'LOW',
    category: 'Tree Shaking',
    action: 'Verify tree shaking is working',
    details: 'Run "npm run analyze" to visualize bundle and identify unused code.'
  });

  recommendations.push({
    priority: 'LOW',
    category: 'Image Optimization',
    action: 'Use next/image for all images',
    details: 'Ensure all images use next/image component for automatic optimization.'
  });

  recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. [${rec.priority}] ${rec.category}`);
    console.log(`      Action: ${rec.action}`);
    console.log(`      Details: ${rec.details}\n`);
  });

  return recommendations;
}

function printNextSteps() {
  console.log('\n5. NEXT STEPS:\n');
  console.log('   a) Run visual bundle analysis:');
  console.log('      npm run analyze\n');
  console.log('   b) Check bundle sizes in .next/analyze after build\n');
  console.log('   c) Review specific large chunks in the generated report\n');
  console.log('   d) Implement lazy loading for heavy components\n');
  console.log('   e) Consider module federation for micro-frontends\n');
}

// Main execution
function main() {
  try {
    const heavyDeps = analyzePackageJson();
    const iconFindings = findLargeIconImports();
    const dynamicCount = checkDynamicImports();
    generateRecommendations(heavyDeps, iconFindings, dynamicCount);
    printNextSteps();

    console.log('\n=== Analysis Complete ===\n');
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

main();
