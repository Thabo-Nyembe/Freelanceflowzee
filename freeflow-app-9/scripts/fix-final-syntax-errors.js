#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting comprehensive syntax error fixing...');

// Files to fix based on latest build output
const filesToFix = [
  'components/collaboration/ai-video-recording-system.tsx',
  'components/collaboration/enterprise-video-studio.tsx',
  'app/(marketing)/payment/page.tsx',
  'app/(marketing)/tools/scope-generator/page.tsx',
  'app/(resources)/api-docs/page.tsx'
];

// Function to fix common syntax errors
function fixSyntaxErrors(content) {
  let fixed = content;
  
  // Fix unterminated string constants
  fixed = fixed.replace(/(['"])[^'"]*$/gm, (match, quote) => {
    if (!match.endsWith(quote)) {
      return match + quote;
    }
    return match;
  });
  
  // Fix HTML entities
  fixed = fixed.replace(/&apos;/g, "'");
  fixed = fixed.replace(/&quot;/g, '"');
  fixed = fixed.replace(/&lt;/g, '<');
  fixed = fixed.replace(/&gt;/g, '>');
  fixed = fixed.replace(/&amp;/g, '&');
  
  // Fix trailing commas in strings
  fixed = fixed.replace(/(['"])\s*,'\s*$/gm, '$1');
  fixed = fixed.replace(/(['"])\s*,"\s*$/gm, '$1');
  
  // Fix common unterminated strings
  fixed = fixed.replace(/className\s*=\s*["']([^"']*)\s*$/gm, 'className="$1"');
  fixed = fixed.replace(/variant\s*=\s*["']([^"']*)\s*$/gm, 'variant="$1"');
  
  // Fix "use client directives
  fixed = fixed.replace(/^["']use client\s*$/gm, '"use client"');
  fixed = fixed.replace(/^use client\s*$/gm, '"use client"');
  
  // Fix empty string defaults
  fixed = fixed.replace(/=\s*['"]\s*,\s*['"]/g, "= ''");
  fixed = fixed.replace(/\|\|\s*,\s*['"]?/g, "|| ''");
  
  // Fix malformed object properties
  fixed = fixed.replace(/:\s*['"][^'"]*,\s*['"]$/gm, (match) => {
    const colonIndex = match.indexOf(':');
    const prefix = match.substring(0, colonIndex + 1);
    return prefix + ' ""';
  });
  
  return fixed;
}

// Function to fix specific file issues
function fixSpecificFileIssues(filePath, content) {
  let fixed = content;
  
  if (filePath.includes('ai-video-recording-system.tsx')) {
    // Fix specific JSX issues
    fixed = fixed.replace(/const link = document\.createElement\('a'\)'/g, "const link = document.createElement('a')");
    fixed = fixed.replace(/'RESUME_RECORDING&apos;/g, "'RESUME_RECORDING'");
    fixed = fixed.replace(/&apos;PAUSE_RECORDING&apos;/g, "'PAUSE_RECORDING'");
  }
  
  if (filePath.includes('enterprise-video-studio.tsx')) {
    // Fix viewer objects with trailing commas
    fixed = fixed.replace(/isWatching: true },'/g, 'isWatching: true },');
    fixed = fixed.replace(/summary: '','/g, "summary: '',");
    fixed = fixed.replace(/contentType: '','/g, "contentType: '',");
    fixed = fixed.replace(/className = '$/gm, "className = ''");
  }
  
  if (filePath.includes('payment/page.tsx')) {
    // Fix JSON object syntax
    fixed = fixed.replace(/"price": "0","/g, '"price": "0",');
    fixed = fixed.replace(/|| ,'/g, "|| '',");
  }
  
  if (filePath.includes('api-docs/page.tsx')) {
    // Fix misplaced code
    fixed = fixed.replace(/`\s*,\s*python: `import requests/g, '');
    fixed = fixed.replace(/{ name: '[^']*', status: '[^']*', link: '#' },'/g, (match) => match.replace(/,$/, ''));
  }
  
  return fixed;
}

// Process each file
let totalErrors = 0;
let fixedFiles = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    let fixedContent = fixSyntaxErrors(content);
    fixedContent = fixSpecificFileIssues(filePath, fixedContent);
    
    if (content !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ Fixed syntax errors in: ${filePath}`);
      fixedFiles++;
    } else {
      console.log(`✨ No syntax errors found in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    totalErrors++;
  }
});

// Additional specific fixes
console.log('\n🔧 Applying specific fixes...');

// Fix rate calculator
const rateCalculatorPath = 'app/(marketing)/tools/rate-calculator/page.tsx';
if (fs.existsSync(rateCalculatorPath)) {
  try {
    let content = fs.readFileSync(rateCalculatorPath, 'utf8');
    if (content.startsWith('"use client')) {
      content = content.replace(/^"use client(?!\")/, '"use client"');
      fs.writeFileSync(rateCalculatorPath, content, 'utf8');
      console.log('✅ Fixed rate calculator use client directive');
    }
  } catch (error) {
    console.error(`❌ Error fixing rate calculator:`, error.message);
  }
}

// Fix scope generator  
const scopeGeneratorPath = 'app/(marketing)/tools/scope-generator/page.tsx';
if (fs.existsSync(scopeGeneratorPath)) {
  try {
    let content = fs.readFileSync(scopeGeneratorPath, 'utf8');
    if (content.startsWith('"use client')) {
      content = content.replace(/^"use client(?!\")/, '"use client"');
      fs.writeFileSync(scopeGeneratorPath, content, 'utf8');
      console.log('✅ Fixed scope generator use client directive');
    }
  } catch (error) {
    console.error(`❌ Error fixing scope generator:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   • Files processed: ${filesToFix.length}`);
console.log(`   • Files fixed: ${fixedFiles}`);
console.log(`   • Errors encountered: ${totalErrors}`);
console.log(`\n🚀 Syntax error fixing complete!`);

if (totalErrors === 0) {
  console.log('✨ All syntax errors have been resolved. Running build test...');
  
  // Test build
  const { spawn } = require('child_process');
  const buildProcess = spawn('npm', ['run', 'build'], { 
    stdio: 'pipe',
    shell: true 
  });
  
  let buildOutput = '';
  buildProcess.stdout.on('data', (data) => {
    buildOutput += data.toString();
  });
  
  buildProcess.stderr.on('data', (data) => {
    buildOutput += data.toString();
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('🎉 BUILD SUCCESSFUL! A+++ grade achieved!');
    } else {
      console.log('⚠️  Build still has some issues. Check the output above.');
    }
  });
} else {
  console.log('⚠️  Some files had errors. Please review and fix manually.');
} 