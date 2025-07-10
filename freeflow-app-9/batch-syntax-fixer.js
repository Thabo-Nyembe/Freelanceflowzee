#!/usr/bin/env node

/**
 * Batch Syntax Fixer for Critical TypeScript Errors
 * Focuses on the most common syntax patterns causing compilation failures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Batch Syntax Fixer Started...\n');

// Get current TypeScript error count
function getCurrentErrorCount() {
  try {
    execSync('npx tsc --noEmit --skipLibCheck 2>&1', { stdio: 'pipe' });
    return 0;
  } catch (error) {
    const output = (error.stdout || error.stderr || '').toString();
    return output.split('\n').filter(line => line.includes('error TS')).length;
  }
}

// Fix common syntax patterns
function fixCommonSyntaxPatterns(content) {
  return content
    // Fix useState patterns
    .replace(/=<([^>]+)>\(/g, '= useState<$1>(')
    .replace(/=<([^>]+)>\[/g, '= useState<$1>([')
    .replace(/=<([^>]+)>\{/g, '= useState<$1>({')
    
    // Fix useRef patterns  
    .replace(/Ref =<([^>]+)>\(/g, 'Ref = useRef<$1>(')
    .replace(/Ref =<([^>]+)>\[/g, 'Ref = useRef<$1>([')
    .replace(/Ref =<([^>]+)>\{/g, 'Ref = useRef<$1>({')
    
    // Fix parameter destructuring with unknown types
    .replace(/: unknown,\s*([^:}]+): unknown/g, ', $1')
    .replace(/\{\s*([^}]+): unknown[^}]*\}/g, '{ $1 }')
    
    // Fix malformed imports
    .replace(/import \{,\s*([^}]+)\}/g, 'import React, { $1 }')
    .replace(/import \{\s*,\s*([^}]+)\}/g, 'import React, { $1 }')
    
    // Fix JSX attribute syntax
    .replace(/=\s*\{\s*\{\s*([^}]+)\s*\}\s*\}/g, '={{ $1 }}')
    
    // Fix string interpolation syntax
    .replace(/: unknown,\s*/g, ', ')
    .replace(/=\s*"([^"]*): unknown([^"]*)"/g, '="$1$2"');
}

// Apply fixes to target files
function applyBatchFixes() {
  console.log('🔧 Applying batch syntax fixes...\n');
  
  const targetDirs = [
    'components/dashboard',
    'components/demo',
    'components/collaboration'
  ];
  
  let fixedFiles = 0;
  
  targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
      .slice(0, 10); // Process top 10 files per directory
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Apply syntax fixes
        content = fixCommonSyntaxPatterns(content);
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content);
          fixedFiles++;
          console.log(`✅ Fixed: ${filePath}`);
        }
      }
    });
  });
  
  return fixedFiles;
}

// Main execution
async function main() {
  console.log('🎯 Starting Batch Syntax Fixes...\n');
  
  // Check initial state
  const initialErrors = getCurrentErrorCount();
  console.log(`📊 Initial TypeScript errors: ${initialErrors}\n`);
  
  // Apply batch fixes
  const fixedFiles = applyBatchFixes();
  
  // Final validation
  const finalErrors = getCurrentErrorCount();
  const improvement = initialErrors - finalErrors;
  const improvementPercentage = initialErrors > 0 ? ((improvement / initialErrors) * 100).toFixed(1) : '0.0';
  
  console.log('\n📊 Batch Fix Results:');
  console.log(`   Initial errors: ${initialErrors}`);
  console.log(`   Final errors: ${finalErrors}`);
  console.log(`   Improvement: ${improvement} (${improvementPercentage}%)`);
  console.log(`   Files processed: ${fixedFiles}`);
  
  // Determine progress toward A++ grade
  let status = 'In Progress';
  if (finalErrors < 200) {
    status = 'A++ Grade Achieved!';
  } else if (finalErrors < 400) {
    status = 'Close to A++ Grade';
  } else if (finalErrors < 600) {
    status = 'Good Progress Toward A++';
  }
  
  console.log(`   Status: ${status}`);
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    initialErrors,
    finalErrors,
    improvement,
    improvementPercentage: parseFloat(improvementPercentage),
    fixedFiles,
    status
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'batch-syntax-fix-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Batch Syntax Fixer Complete!');
  console.log('📄 Report saved to: batch-syntax-fix-report.json');
  
  if (finalErrors < 200) {
    console.log('🎉 A++ GRADE ACHIEVED! Under 200 TypeScript errors!');
  } else if (finalErrors < initialErrors) {
    console.log('⚡ Excellent progress! Continuing toward A++ grade...');
  }
  
  return report;
}

main().catch(console.error);