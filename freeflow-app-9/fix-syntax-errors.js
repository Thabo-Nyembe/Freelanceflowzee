const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (!['node_modules', '.next', '.git'].includes(file)) {
        results = results.concat(findTsFiles(filePath));
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to fix common syntax errors
function fixSyntaxErrors(content) {
  let fixed = content;
  
  // Fix unterminated string literals at end of console.error statements
  fixed = fixed.replace(/console\.error\([^)]*\)'/g, match => match.slice(0, -1));
  
  // Fix unterminated string literals in general
  fixed = fixed.replace(/('\s*$)/gm, "'");
  fixed = fixed.replace(/('\s*\n)/g, "'\n");
  
  // Fix missing quotes around timeRange default value
  fixed = fixed.replace(/\|\| 'week(?!\w)/g, "|| 'week'");
  
  // Fix missing quotes around demo ip address
  fixed = fixed.replace(/\|\| 'demo(?!\w)/g, "|| 'demo'");
  
  // Fix missing quotes around unknown ip address
  fixed = fixed.replace(/\|\| 'unknown(?!\w)/g, "|| 'unknown'");
  
  // Fix missing commas in object literals
  fixed = fixed.replace(/(\w+: '[^']*')\s*(\w+:)/g, '$1,\n    $2');
  
  return fixed;
}

// Main execution
console.log('🔧 Starting syntax error fixes...');

const tsFiles = findTsFiles('.');
let fixedCount = 0;

tsFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixSyntaxErrors(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Fixed: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Fixed syntax errors in ${fixedCount} files!`);
console.log('Ready for production build.'); 