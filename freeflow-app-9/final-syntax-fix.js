const fs = require('fs');
const path = require('path');

console.log('🔧 Final syntax fix - targeting specific issues...\n');

function fixImportStatements(content) {
  // Fix double quotes in import statements
  let fixed = content.replace(/from\s+['"][^'"]*['"]['"]['"]/g, match => {
    // Extract the clean import path
    const cleanMatch = match.replace(/['"]+/g, "'");
    return cleanMatch.replace(/''/, "'");
  });

  // Fix specific patterns
  fixed = fixed.replace(/['"]next\/server['"]'['"]?/g, "'next/server'");
  fixed = fixed.replace(/['"]@\/lib\/supabase\/server['"]'['"]?/g, "'@/lib/supabase/server'");
  fixed = fixed.replace(/['"]next\/headers['"]'['"]?/g, "'next/headers'");
  fixed = fixed.replace(/['"]openai['"]'['"]?/g, "'openai'");
  
  // Fix NextResponse.json issues
  fixed = fixed.replace(/NextResponse\.json\('\s*{/g, 'NextResponse.json({');
  
  // Fix object properties with trailing quotes
  fixed = fixed.replace(/(\w+):\s*([^,}]+),'/g, '$1: $2,');
  fixed = fixed.replace(/([^,{]\s*),'/g, '$1,');
  
  return fixed;
}

function fixSpecificFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  content = fixImportStatements(content);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Fix all problematic API files
function findAndFixApiFiles(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
      fixedCount += findAndFixApiFiles(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixSpecificFile(filePath)) {
        console.log(`✅ Fixed import statements in: ${filePath}`);
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

const totalFixed = findAndFixApiFiles('app/api');

console.log(`\n🎉 Fixed import statements in ${totalFixed} files!`);
console.log('Syntax errors should now be resolved for real this time.'); 