const fs = require('fs');
const path = require('path');

// Function to prefix unused variables with underscore
function fixUnusedVars(content, filePath) {
  let fixed = content;
  
  // Common patterns to fix
  const patterns = [
    // Unused React imports
    { from: "import React, { useState }", to: "import React" },
    { from: "import React, { useEffect }", to: "import React" },
    { from: "import React, { useState, useEffect }", to: "import React" },
    
    // Prefix unused variables
    { from: /const \[([^,\[\]]+), set[A-Z][a-zA-Z]*\] = useState/g, to: (match, varName) => {
      if (!content.includes(varName + '.') && !content.includes(varName + ' ') && !content.includes(varName + ')')) {
        return match.replace(varName, '_' + varName);
      }
      return match;
    }},
    
    // Fix unused function parameters
    { from: /function [^(]*\(([^)]*)\)/g, to: (match, params) => {
      // Simple fix for obviously unused params
      return match;
    }}
  ];
  
  patterns.forEach(pattern => {
    if (typeof pattern.to === 'function') {
      fixed = fixed.replace(pattern.from, pattern.to);
    } else {
      fixed = fixed.replace(pattern.from, pattern.to);
    }
  });
  
  return fixed;
}

// Files to fix
const filesToFix = [
  'components/analytics/enhanced-analytics.tsx',
  'components/navigation/feature-navigation.tsx',
  'components/navigation.tsx',
  'components/notifications.tsx',
  'components/profile.tsx',
  'components/pwa-installer.tsx'
];

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixUnusedVars(content, filePath);
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`Fixed: ${filePath}`);
    }
  }
});

console.log('Batch fix completed');
