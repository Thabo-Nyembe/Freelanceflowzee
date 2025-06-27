#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Final String Literal Fix - Fixing Complex Cases...\n');

function fixComplexStringIssues(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let changes = 0;
    
    // Fix specific patterns that create unterminated strings
    
    // Fix: 'use client' followed by double quote
    if (modified.includes("'use client'\"")) {
      modified = modified.replace(/'use client'\"/g, "'use client'");
      changes++;
    }
    
    // Fix: 'use server' followed by double quote  
    if (modified.includes("'use server'\"")) {
      modified = modified.replace(/'use server'\"/g, "'use server'");
      changes++;
    }
    
    // Fix lines starting with 'use client' that have issues
    modified = modified.replace(/^'use client'[^'\n]+$/gm, "'use client'");
    
    // Fix lines starting with 'use server' that have issues
    modified = modified.replace(/^'use server'[^'\n]+$/gm, "'use server'");
    
    // Fix standalone quotes at line beginning 
    const lines = modified.split('\n');
    const fixedLines = lines.map((line, index) => {
      const originalLine = line;
      
      // Fix: line starting with quote but missing closing quote
      if (line.match(/^'[^']*$/)) {
        // If it's a 'use client' or 'use server' line
        if (line.startsWith("'use client") || line.startsWith("'use server")) {
          if (line.includes("'use client")) {
            line = "'use client'";
          } else if (line.includes("'use server")) {
            line = "'use server'";
          }
        }
      }
      
      // Fix: line starting with quote and having extra content
      if (line.match(/^'use client'./)) {
        line = "'use client'";
      }
      if (line.match(/^'use server'./)) {
        line = "'use server'";
      }
      
      // Count changes
      if (line !== originalLine) {
        changes++;
      }
      
      return line;
    });
    
    modified = fixedLines.join('\n');
    
    if (changes > 0) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`✅ Fixed ${changes} complex string issues in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`⚠️  Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

// Focus on files that still have issues based on linter output
const problematicFiles = [
  'app/(marketing)/demo/layout.tsx',
  'app/(marketing)/features/page.tsx',
  'app/(marketing)/payment/page.tsx',
  'app/(marketing)/payment/payment-client.tsx',
  'app/(marketing)/tools/rate-calculator/page.tsx',
  'app/(marketing)/tools/scope-generator/page.tsx',
  'app/(resources)/api-docs/page.tsx',
  'app/api/ai/chat/route.ts',
  'app/api/ai/create/route.ts',
  'app/components/ai/ai-assistant.tsx',
  'app/components/ai/ai-create.tsx',
  'app/components/community/create-post-form.tsx',
  'app/components/hubs/community-hub.tsx',
  'app/demo-features/page.tsx',
  'app/home-page-client.tsx',
  'app/layout.tsx',
  'app/lib/services/ai-service.ts',
  'app/page.tsx',
  'app/projects/actions.ts',
  'pages/share/[fileId].tsx',
  'components/HydrationErrorBoundary.tsx'
];

// Also search for all files with unterminated strings
const patterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  'pages/**/*.{ts,tsx,js,jsx}'
];

let filesFixed = 0;

// Fix specific problematic files first
problematicFiles.forEach(file => {
  if (fs.existsSync(file)) {
    if (fixComplexStringIssues(file)) {
      filesFixed++;
    }
  }
});

// Then search for any remaining files with issues
patterns.forEach(pattern => {
  const files = glob.sync(pattern, { ignore: ['node_modules/**', '.next/**', 'dist/**'] });
  
  files.forEach(file => {
    if (!problematicFiles.includes(file)) {
      if (fixComplexStringIssues(file)) {
        filesFixed++;
      }
    }
  });
});

console.log(`\n🎉 Final string fix completed!`);
console.log(`📊 Files fixed: ${filesFixed}`); 