#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Targeted syntax fix for remaining issues...\n');

const problematicFiles = [
  'app/api/ai/analyze/route.ts',
  'app/api/ai/chat/route.ts',
  'app/api/ai/component-recommendations/route.ts',
  'app/api/ai/create/route.ts',
  'app/api/ai/design-analysis/route.ts'
];

function fixTargetedSyntaxErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // More precise patterns for the specific errors seen
  const fixes = [
    // Fix import statements missing closing quotes
    { 
      regex: /from\s+(['"])[^'"]*$/gm, 
      replacement: (match, quote) => match + quote 
    },
    
    // Fix import statements like: import ... from 'module (missing closing quote)
    { 
      regex: /from\s+(['"])([^'"]+)$/gm, 
      replacement: (match, quote, moduleName) => `from ${quote}${moduleName}${quote}` 
    },
    
    // Fix string arrays missing quotes like: [color-grading', ...
    { 
      regex: /\[([^'"\[\]]+)'/g, 
      replacement: (match, content) => `['${content}'` 
    },
    
    // Fix string union types missing closing quotes like: 'high' | 'medium' | 'low
    { 
      regex: /'([^']+)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)(?!')/g, 
      replacement: "'$1' | '$2' | '$3'" 
    },
    
    // Fix console.error missing quotes like: console.error(Failed to parse...
    { 
      regex: /console\.error\(([^'"][^,)]+),/g, 
      replacement: "console.error('$1'," 
    },
    
    // Fix string arrays with missing quotes at start like: [Show me pricing...
    { 
      regex: /\[([A-Z][^'"\]]+)'/g, 
      replacement: "['$1'" 
    },
    
    // Fix array items missing quotes like: [Implement real-time analytics'
    { 
      regex: /\[([^'"\]]+)'/g, 
      replacement: "['$1'" 
    },
    
    // Fix string arrays with mixed quotes like: [accessibility', 'performance'...
    { 
      regex: /\[([a-z-]+)'/g, 
      replacement: "['$1'" 
    },
    
    // Fix unterminated strings in object properties
    { 
      regex: /size:\s*'([^']+)$/gm, 
      replacement: "size: '$1'" 
    }
  ];

  fixes.forEach(({ regex, replacement }) => {
    const originalContent = content;
    content = content.replace(regex, replacement);
    if (content !== originalContent) {
      fixed = true;
    }
  });

  if (fixed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed targeted syntax errors in: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No additional syntax errors found in: ${filePath}`);
    return false;
  }
}

let totalFixed = 0;

problematicFiles.forEach(file => {
  if (fixTargetedSyntaxErrors(file)) {
    totalFixed++;
  }
});

console.log(`\n🎉 Fixed targeted syntax errors in ${totalFixed} files!`);
console.log('Build should now succeed with clean imports and strings.'); 