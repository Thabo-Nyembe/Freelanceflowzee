#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive syntax fix for AI API files...\n');

// List of files with syntax errors from the build output
const problematicFiles = [
  'app/api/ai/analyze/route.ts',
  'app/api/ai/chat/route.ts',
  'app/api/ai/component-recommendations/route.ts',
  'app/api/ai/create/route.ts',
  'app/api/ai/design-analysis/route.ts'
];

function fixSyntaxErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Fix unterminated string constants - pattern: '}' or ')' + '
  // This commonly happens when there's an extra quote at the end
  const patterns = [
    // Fix unterminated strings like: if (!session) {'
    { regex: /if\s*\([^)]+\)\s*\{\s*'/g, replacement: (match) => match.replace(/'/g, '') },
    
    // Fix unterminated strings like: } catch (error) {'
    { regex: /\}\s*catch\s*\([^)]*\)\s*\{\s*'/g, replacement: (match) => match.replace(/'/g, '') },
    
    // Fix unterminated strings like: console.error('message', e)'
    { regex: /console\.error\([^)]+\)'/g, replacement: (match) => match.replace(/'/g, '') },
    
    // Fix unterminated strings like: action: string'
    { regex: /:\s*string'/g, replacement: ': string' },
    
    // Fix unterminated strings like: from 'next/server';'
    { regex: /from\s+['"][^'"]+['"];'/g, replacement: (match) => match.replace(/;'/, ';') },
    
    // Fix unterminated object properties like: {'
    { regex: /=\s*\{\s*'/g, replacement: '= {' },
    
    // Fix unterminated strings like: 'gpt-4o-mini': {'
    { regex: /'[^']+'\s*:\s*\{\s*'/g, replacement: (match) => match.replace(/'/g, "'").replace(": {'", ": {") },
    
    // Fix general unterminated strings at end of lines
    { regex: /'\s*$/gm, replacement: '' }
  ];

  patterns.forEach(({ regex, replacement }) => {
    const originalContent = content;
    content = content.replace(regex, replacement);
    if (content !== originalContent) {
      fixed = true;
    }
  });

  // Additional specific fixes for object literals and arrays
  // Fix unterminated object/array declarations
  content = content.replace(/\[\s*'/g, '[');
  content = content.replace(/\{\s*'/g, '{');
  
  if (fixed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed syntax errors in: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No syntax errors found in: ${filePath}`);
    return false;
  }
}

let totalFixed = 0;

problematicFiles.forEach(file => {
  if (fixSyntaxErrors(file)) {
    totalFixed++;
  }
});

console.log(`\n🎉 Fixed syntax errors in ${totalFixed} files!`);
console.log('Build should now succeed.'); 