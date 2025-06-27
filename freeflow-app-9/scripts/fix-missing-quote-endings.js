#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing Missing Quote Endings');

// Find all TypeScript and TSX files
const files = glob.sync('**/*.{ts,tsx}', { 
  ignore: ['node_modules/**', '.next/**', 'scripts/**'],
  cwd: process.cwd()
});

let totalFixed = 0;
let filesModified = 0;

const patterns = [
  // Fix use client directives
  { pattern: /^'use client$/gm, replacement: "'use client'" },
  { pattern: /^"use client$/gm, replacement: '"use client"' },
  
  // Fix import statements
  { pattern: /^import\s+([^'"\n]+)\s+from\s+'([^'\n]+)$/gm, replacement: "import $1 from '$2'" },
  { pattern: /^import\s+([^'"\n]+)\s+from\s+"([^"\n]+)$/gm, replacement: 'import $1 from "$2"' },
  
  // Fix export statements
  { pattern: /^export\s+([^'"\n]+)\s+from\s+'([^'\n]+)$/gm, replacement: "export $1 from '$2'" },
  { pattern: /^export\s+([^'"\n]+)\s+from\s+"([^"\n]+)$/gm, replacement: 'export $1 from "$2"' },
  
  // Fix specific string patterns
  { pattern: /purpose:\s*'([^'\n]+)$/gm, replacement: "purpose: '$1'" },
  { pattern: /layout:\s*'([^'\n]+)$/gm, replacement: "layout: '$1'" },
  
  // Fix destructured imports
  { pattern: /}\s+from\s+'([^'\n]+)$/gm, replacement: "} from '$1'" },
  { pattern: /}\s+from\s+"([^"\n]+)$/gm, replacement: '} from "$1"' },
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fixCount = 0;
  
  patterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      modified = true;
      fixCount += matches.length;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalFixed += fixCount;
    console.log(`✅ Fixed ${fixCount} quote issues in: ${file}`);
  }
});

console.log(`\n🎯 Quote Ending Fixes Complete:`);
console.log(`   📄 Files modified: ${filesModified}`);
console.log(`   🔧 Total fixes applied: ${totalFixed}`);
console.log(`\n🚀 Import statements should now be properly quoted!`); 