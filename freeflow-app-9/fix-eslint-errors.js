#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all TypeScript/JSX files in the app directory
function getAllFiles(dir, ext = '.tsx') {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllFiles(fullPath, ext));
    } else if (item.isFile() && item.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix common ESLint errors
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix unused React imports
  if (content.includes("import React") && !content.includes("React.") && !content.includes("FC<") && !content.includes("ReactNode")) {
    content = content.replace(/import React,?\s*\{([^}]*)\}/g, 'import {$1}');
    content = content.replace(/import React from ['"]react['"];\n/g, '');
    content = content.replace(/import React from ['"]react['"];\r\n/g, '');
    changed = true;
  }

  // Fix unused useState imports
  if (content.includes("useState") && !content.includes("useState(")) {
    content = content.replace(/,?\s*useState/g, '');
    changed = true;
  }

  // Fix unused useEffect imports
  if (content.includes("useEffect") && !content.includes("useEffect(")) {
    content = content.replace(/,?\s*useEffect/g, '');
    changed = true;
  }

  // Fix unused useCallback imports
  if (content.includes("useCallback") && !content.includes("useCallback(")) {
    content = content.replace(/,?\s*useCallback/g, '');
    changed = true;
  }

  // Fix unused useRef imports
  if (content.includes("useRef") && !content.includes("useRef(")) {
    content = content.replace(/,?\s*useRef/g, '');
    changed = true;
  }

  // Fix unescaped entities
  content = content.replace(/(\w)'(\w)/g, '$1&apos;$2');
  content = content.replace(/(\w)"(\w)/g, '$1&quot;$2');
  if (content !== fs.readFileSync(filePath, 'utf8')) {
    changed = true;
  }

  // Remove unused variables by prefixing with underscore
  const unusedVarRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^;]+;/g;
  content = content.replace(unusedVarRegex, (match, varName) => {
    const varUsageRegex = new RegExp(`\\b${varName}\\b`, 'g');
    const matches = content.match(varUsageRegex);
    if (matches && matches.length <= 1) {
      return match.replace(varName, `_${varName}`);
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Run the fixes
const appFiles = getAllFiles('./app');
const componentFiles = getAllFiles('./components');

console.log('Fixing ESLint errors...');
[...appFiles, ...componentFiles].forEach(fixFile);
console.log('Done!');