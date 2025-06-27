#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Comprehensive Quote Fix - Restoring all JavaScript/TypeScript quotes...\n');

function fixFileQuotes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if no entity issues
    if (!content.includes(') && !content.includes('"')) {
      return false;
    }
    
    let modified = content;
    let changes = 0;
    
    // Fix import/require statements first (most critical)
    const originalModified = modified;
    
    // Fix 'use client' and 'use server' directives
    modified = modified.replace(/'use client'/g, "'use client'");
    modified = modified.replace(/"use client"/g, '"use client"');
    modified = modified.replace(/'use server'/g, "'use server'");
    modified = modified.replace(/"use server"/g, '"use server"');
    
    // Fix require() statements
    modified = modified.replace(/require\('([^']*?)'\)/g, "require('$1')");
    modified = modified.replace(/require\("([^"]*?)"\)/g, 'require("$1")');
    
    // Fix import statements - various patterns
    modified = modified.replace(/import\s+([^&]*?)from\s+'([^']*?)'/g, "import $1from '$2'");
    modified = modified.replace(/import\s+([^&]*?)from\s+"([^"]*?)"/g, 'import $1from "$2"');
    modified = modified.replace(/import\s+'([^']*?)'/g, "import '$1'");
    modified = modified.replace(/import\s+"([^"]*?)"/g, 'import "$1"');
    
    // Fix dynamic imports
    modified = modified.replace(/import\('([^']*?)'\)/g, "import('$1')");
    modified = modified.replace(/import\("([^"]*?)"\)/g, 'import("$1")');
    
    // Fix export statements
    modified = modified.replace(/from\s+'([^']*?)'/g, "from '$1'");
    modified = modified.replace(/from\s+"([^"]*?)"/g, 'from "$1"');
    
    // Fix object property access with quotes
    modified = modified.replace(/\['([^']*?)'\]/g, "['$1']");
    modified = modified.replace(/\["([^"]*?)"\]/g, '["$1"]');
    
    // Fix string literals in variable assignments
    modified = modified.replace(/=\s*'([^']*?)'/g, "= '$1'");
    modified = modified.replace(/=\s*"([^"]*?)"/g, '= "$1"');
    
    // Fix function calls with string parameters
    modified = modified.replace(/\('([^']*?)'/g, "('$1'");
    modified = modified.replace(/\("([^"]*?)"/g, '("$1"');
    modified = modified.replace(/,\s*'([^']*?)'/g, ", '$1'");
    modified = modified.replace(/,\s*"([^"]*?)"/g, ', "$1"');
    
    // Fix array elements
    modified = modified.replace(/\[\s*'([^']*?)'/g, "['$1'");
    modified = modified.replace(/\[\s*"([^"]*?)"/g, '["$1"');
    
    // Fix comments that might contain entities
    modified = modified.replace(/\/\/.*?'.*?$/gm, (match) => {
      return match.replace(/'/g, "'").replace(/"/g, '"');
    });
    modified = modified.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      return match.replace(/'/g, "'").replace(/"/g, '"');
    });
    
    // Fix template literals
    modified = modified.replace(/`([^`]*?)'([^`]*?)`/g, "`$1'$2`");
    modified = modified.replace(/`([^`]*?)"([^`]*?)`/g, '`$1"$2`');
    
    // Fix any remaining standalone entities that are clearly meant to be quotes
    // But be careful not to touch JSX content
    const lines = modified.split('\n');
    const fixedLines = lines.map(line => {
      // Skip lines that look like JSX content
      if (line.includes('<') && line.includes('>') && !line.trim().startsWith('//')) {
        return line;
      }
      
      // Fix remaining entities in non-JSX lines
      if (line.includes(') || line.includes('"')) {
        return line.replace(/'/g, "'").replace(/"/g, '"');
      }
      
      return line;
    });
    
    modified = fixedLines.join('\n');
    
    if (modified !== originalModified) {
      changes = (content.match(/'/g) || []).length + (content.match(/"/g) || []).length;
    }
    
    if (changes > 0) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`✅ Fixed ${changes} quote entities in: ${filePath}`);
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

let totalFixed = 0;
let filesFixed = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { ignore: ['node_modules/**', '.next/**', 'dist/**'] });
  
  files.forEach(file => {
    if (fixFileQuotes(file)) {
      filesFixed++;
    }
  });
});

console.log(`\n🎉 Quote fix completed!`);
console.log(`📊 Files processed: ${filesFixed}`);
console.log(`✨ All import/export statements should now be properly quoted`); 