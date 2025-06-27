#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing JavaScript/TypeScript Quote Entities...\n');

function fixJsQuotes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if no entity issues
    if (!content.includes(') && !content.includes('"')) {
      return false;
    }
    
    let modified = content;
    
    // Fix require() statements
    modified = modified.replace(/require\('([^']+)'\)/g, "require('$1')");
    modified = modified.replace(/require\("([^"]+)"\)/g, 'require("$1")');
    
    // Fix import statements
    modified = modified.replace(/import\s+([^&]+)'([^']+)'/g, "import $1'$2'");
    modified = modified.replace(/import\s+([^&]+)"([^"]+)"/g, 'import $1"$2"');
    modified = modified.replace(/from\s+'([^']+)'/g, "from '$1'");
    modified = modified.replace(/from\s+"([^"]+)"/g, 'from "$1"');
    
    // Fix module.exports
    modified = modified.replace(/module\.exports\s*=\s*'([^']+)'/g, "module.exports = '$1'");
    modified = modified.replace(/module\.exports\s*=\s*"([^"]+)"/g, 'module.exports = "$1"');
    
    // Fix process.env comparisons
    modified = modified.replace(/process\.env\.[A-Z_]+\s*===\s*'([^']+)'/g, "process.env.$& === '$1'");
    modified = modified.replace(/process\.env\.[A-Z_]+\s*===\s*"([^"]+)"/g, 'process.env.$& === "$1"');
    
    // Fix object property strings (but not JSX attributes)
    modified = modified.replace(/:\s*'([^']+)'/g, ": '$1'");
    modified = modified.replace(/:\s*"([^"]+)"/g, ': "$1"');
    
    // Fix array elements
    modified = modified.replace(/\[\s*'([^']+)'\s*\]/g, "['$1']");
    modified = modified.replace(/\[\s*"([^"]+)"\s*\]/g, '["$1"]');
    
    // Fix function parameters and arguments
    modified = modified.replace(/\(\s*'([^']+)'\s*\)/g, "('$1')");
    modified = modified.replace(/\(\s*"([^"]+)"\s*\)/g, '("$1")');
    
    // Fix path.resolve and similar
    modified = modified.replace(/path\.(resolve|join)\([^)]*'([^']+)'[^)]*\)/g, (match, method, pathStr) => {
      return match.replace(/'/g, "'");
    });
    
    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`✅ Fixed quotes in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`⚠️  Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

// Focus on config files and scripts first
const criticalFiles = [
  'next.config.js',
  'next.config.production.js',
  'tailwind.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'jest.config.js',
  'jest.setup.js',
  'playwright.config.js',
  'playwright.config.ts',
  'vitest.config.ts'
];

// Fix critical files first
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fixJsQuotes(file);
  }
});

// Fix all script files
if (fs.existsSync('scripts')) {
  const scriptFiles = fs.readdirSync('scripts')
    .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
    .map(file => path.join('scripts', file));
  
  scriptFiles.forEach(fixJsQuotes);
}

console.log('\n🎉 JavaScript quote fix complete!');
console.log('🚀 Try running "npm run lint" again...'); 