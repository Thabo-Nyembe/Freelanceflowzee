#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Comprehensive error fixing patterns
const ERROR_PATTERNS = [
  // Fix HTML entities
  {
    pattern: /&apos;/g,
    replacement: "'",
    description: "Fix HTML entity apostrophes"
  },
  {
    pattern: /&quot;/g,
    replacement: '"',
    description: "Fix HTML entity quotes"
  },
  {
    pattern: /&gt;/g,
    replacement: '>',
    description: "Fix HTML entity greater than"
  },
  {
    pattern: /&lt;/g,
    replacement: '<',
    description: "Fix HTML entity less than"
  },
  
  // Fix unterminated strings
  {
    pattern: /useState\(''\)'/g,
    replacement: "useState('')",
    description: "Fix unterminated useState strings"
  },
  {
    pattern: /setState\(''\)'/g,
    replacement: "setState('')",
    description: "Fix unterminated setState strings"
  },
  
  // Fix className spacing
  {
    pattern: /className= "/g,
    replacement: 'className="',
    description: "Fix className spacing"
  },
  {
    pattern: /className={`([^`]*)\$\{post\.bookmarked \? 'text-yellow-500&apos; : '&apos;'}/g,
    replacement: 'className={`$1${post.bookmarked ? "text-yellow-500" : ""}`',
    description: "Fix complex className template literals"
  },
  
  // Fix broken JSX expressions
  {
    pattern: /}\}>'$/gm,
    replacement: '}">',
    description: "Fix broken JSX closing tags"
  },
  
  // Fix type definitions with HTML entities
  {
    pattern: /<&apos;([^&]*?)&apos;/g,
    replacement: "<'$1'",
    description: "Fix type definitions with HTML entities"
  }
];

// Files that need fixing based on build errors
const FILES_TO_FIX = [
  'components/community/enhanced-community-hub.tsx',
  'components/ui/progress.tsx',
  'components/ui/tabs.tsx', 
  'components/ui/toast.tsx',
  'app/(app)/dashboard/my-day/page.tsx'
];

// Specific file fixes
const SPECIFIC_FIXES = {
  'components/community/enhanced-community-hub.tsx': {
    // Replace the entire broken section with working implementation
    searchReplace: [
      {
        search: /alert\('Comments section opened!'\);\s*}}\s*>\s*<MessageCircle className= "w-5 h-5" \/>\s*<span>\{post\.comments\}<\/span>\s*<\/button>/gs,
        replace: `alert('Comments section opened!');
                }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>`
      },
      {
        search: /button className=\{`text-gray-600 hover:text-yellow-500 transition-colors \$\{post\.bookmarked \? 'text-yellow-500&apos; : '&apos;'\}`\}>/g,
        replace: 'button className={`text-gray-600 hover:text-yellow-500 transition-colors ${post.bookmarked ? "text-yellow-500" : ""}`}>'
      },
      {
        search: /<Bookmark className=\{`w-5 h-5 \$\{post\.bookmarked \? 'fill-current&apos; : '&apos;'\}`\} \/>/g,
        replace: '<Bookmark className={`w-5 h-5 ${post.bookmarked ? "fill-current" : ""}`} />'
      }
    ]
  },
  
  'app/(app)/dashboard/my-day/page.tsx': {
    // Fix the state variable declarations
    searchReplace: [
      {
        search: /const \[newTaskTitle, setNewTaskTitle\] = useState\(''\)'/g,
        replace: "const [newTaskTitle, setNewTaskTitle] = useState('')"
      },
      {
        search: /const \[newTaskDescription, setNewTaskDescription\] = useState\(''\)'/g,
        replace: "const [newTaskDescription, setNewTaskDescription] = useState('')"
      },
      {
        search: /useState<&apos;low&apos; \| &apos;medium&apos; \| &apos;high&apos; \| &apos;urgent&apos;>\('medium'\)/g,
        replace: "useState<'low' | 'medium' | 'high' | 'urgent'>('medium')"
      }
    ]
  }
};

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changes = 0;

  // Apply general patterns
  ERROR_PATTERNS.forEach(pattern => {
    const beforeLength = content.length;
    content = content.replace(pattern.pattern, pattern.replacement);
    if (content.length !== beforeLength) {
      changes++;
      console.log(`  ✅ Applied: ${pattern.description}`);
    }
  });

  // Apply specific file fixes
  if (SPECIFIC_FIXES[filePath]) {
    const fixes = SPECIFIC_FIXES[filePath];
    if (fixes.searchReplace) {
      fixes.searchReplace.forEach(fix => {
        const beforeLength = content.length;
        content = content.replace(fix.search, fix.replace);
        if (content.length !== beforeLength) {
          changes++;
          console.log(`  ✅ Applied specific fix for ${filePath}`);
        }
      });
    }
  }

  // Write back if changes were made
  if (changes > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${changes} issues in ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No fixes needed for ${filePath}`);
    return false;
  }
}

// Main execution
console.log('🚀 Starting comprehensive build error fix...\n');

let totalFilesFixed = 0;
let totalIssuesFixed = 0;

FILES_TO_FIX.forEach(filePath => {
  console.log(`\n🔧 Processing: ${filePath}`);
  if (fixFile(filePath)) {
    totalFilesFixed++;
  }
});

// Create missing components if needed
const missingComponents = [
  'components/ui/card.tsx',
  'components/ui/avatar.tsx', 
  'components/ui/badge.tsx'
];

missingComponents.forEach(componentPath => {
  const fullPath = path.join(process.cwd(), componentPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`\n📝 Creating missing component: ${componentPath}`);
    // This would create basic component implementations
    // For now, just log that they're missing
    console.log(`⚠️  Component missing: ${componentPath}`);
  }
});

console.log(`\n🎉 Build error fix complete!`);
console.log(`📊 Files processed: ${FILES_TO_FIX.length}`);
console.log(`✅ Files fixed: ${totalFilesFixed}`);
console.log(`\n🧪 Run 'npm run build' to verify fixes...\n`); 