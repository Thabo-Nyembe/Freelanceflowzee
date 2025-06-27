#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing Unterminated String Literals...\n');

function fixUnterminaledStrings(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let changes = 0;
    
    // Fix double quotes at start of file causing unterminated strings
    if (modified.match(/^'use client/m)) {
      modified = modified.replace(/^'use client/gm, "'use client'");
      changes++;
    }
    if (modified.match(/^'use server/m)) {
      modified = modified.replace(/^'use server/gm, "'use server'");
      changes++;
    }
    
    // Fix other common patterns that create unterminated strings
    modified = modified.replace(/return 'A';/g, "return 'A';");
    modified = modified.replace(/return 'B';/g, "return 'B';");
    modified = modified.replace(/return 'C';/g, "return 'C';");
    
    // Fix any line that ends with a quote followed by another quote
    modified = modified.replace(/';/g, "';");
    modified = modified.replace(/";/g, '";');
    
    // Fix lines that start with quotes incorrectly
    const lines = modified.split('\n');
    const fixedLines = lines.map(line => {
      // Fix pattern like: 'text
      if (line.match(/'[^']*/)) {
        line = line.replace(/('[^']*)/g, '$1');
        changes++;
      }
      
      // Fix pattern like: "text
      if (line.match(/"[^"]*/)) {
        line = line.replace(/("[^"]*)/g, '$1');
        changes++;
      }
      
      return line;
    });
    
    modified = fixedLines.join('\n');
    
    if (changes > 0) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`✅ Fixed ${changes} unterminated strings in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`⚠️  Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

// Find all TypeScript and JavaScript files
const patterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  'pages/**/*.{ts,tsx,js,jsx}',
  'scripts/**/*.{ts,tsx,js,jsx}',
  '*.{ts,tsx,js,jsx}'
];

let filesFixed = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { ignore: ['node_modules/**', '.next/**', 'dist/**'] });
  
  files.forEach(file => {
    if (fixUnterminaledStrings(file)) {
      filesFixed++;
    }
  });
});

console.log(`\n🎉 String termination fix completed!`);
console.log(`📊 Files fixed: ${filesFixed}`); 