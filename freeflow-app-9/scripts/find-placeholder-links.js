#!/usr/bin/env node

/**
 * find-placeholder-links.js
 * 
 * A script to identify placeholder links in the KAZI codebase and suggest replacements.
 * Searches for common placeholder patterns like href="#", href: '#', href="javascript:void(0)", etc.
 * 
 * Usage: node scripts/find-placeholder-links.js
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readline = require('readline');

// Convert callback-based functions to Promise-based
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Configuration
const config = {
  directories: ['app', 'components'],
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  patterns: [
    { regex: /href="#"/g, description: 'Empty hash link' },
    { regex: /href:\s*['"]#['"]/g, description: 'Object property empty hash' },
    { regex: /href="javascript:void\(0\)"/g, description: 'JavaScript void link' },
    { regex: /href=""/g, description: 'Empty href attribute' },
    { regex: /href={\s*['"]#['"]\s*}/g, description: 'JSX empty hash link' },
    { regex: /to="#"/g, description: 'React Router empty link' }
  ],
  priorityFiles: [
    'app/page.tsx',
    'app/layout.tsx',
    'app/(app)/dashboard/page.tsx',
    'components/ui/navigation.tsx',
    'components/ui/sidebar.tsx'
  ]
};

// Result storage
const results = {
  totalFiles: 0,
  totalPlaceholders: 0,
  fileResults: [],
  summary: {
    byPattern: {},
    byDirectory: {},
    byExtension: {}
  }
};

/**
 * Recursively walk directories and process files
 */
async function walkDirectories(dir) {
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = await stat(fullPath);
    
    // Skip node_modules and .next directories
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') {
      continue;
    }
    
    if (stats.isDirectory()) {
      await walkDirectories(fullPath);
    } else if (stats.isFile() && config.extensions.includes(path.extname(fullPath))) {
      await processFile(fullPath);
    }
  }
}

/**
 * Process a single file to find placeholder links
 */
async function processFile(filePath) {
  try {
    results.totalFiles++;
    
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const fileResult = {
      filePath,
      placeholders: [],
      isPriority: config.priorityFiles.includes(filePath) || 
                  config.priorityFiles.some(p => filePath.includes(p))
    };
    
    // Track if this file has any placeholders
    let hasPlaceholders = false;
    
    // Process each line
    lines.forEach((line, lineIndex) => {
      for (const pattern of config.patterns) {
        const matches = [...line.matchAll(pattern.regex)];
        
        if (matches.length > 0) {
          hasPlaceholders = true;
          results.totalPlaceholders += matches.length;
          
          // Update pattern summary
          results.summary.byPattern[pattern.description] = 
            (results.summary.byPattern[pattern.description] || 0) + matches.length;
          
          // Update directory summary
          const directory = path.dirname(filePath).split(path.sep)[0];
          results.summary.byDirectory[directory] = 
            (results.summary.byDirectory[directory] || 0) + matches.length;
          
          // Update extension summary
          const extension = path.extname(filePath);
          results.summary.byExtension[extension] = 
            (results.summary.byExtension[extension] || 0) + matches.length;
          
          // Add each match to the file's results
          matches.forEach(match => {
            const replacement = suggestReplacement(filePath, line, match[0]);
            fileResult.placeholders.push({
              lineNumber: lineIndex + 1,
              line: line.trim(),
              pattern: pattern.description,
              match: match[0],
              replacement
            });
          });
        }
      }
    });
    
    if (hasPlaceholders) {
      results.fileResults.push(fileResult);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * Suggest a replacement based on context
 */
function suggestReplacement(filePath, line, match) {
  // Extract component/page name from file path
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileDir = path.dirname(filePath).split(path.sep);
  const isInDashboard = filePath.includes('dashboard');
  const isInApp = filePath.includes('app/');
  
  // Check for common UI components
  if (line.includes('Button') || line.includes('button')) {
    if (line.includes('onClick')) {
      return 'Use onClick handler without href';
    }
    
    if (line.toLowerCase().includes('dashboard')) {
      return 'href="/dashboard"';
    }
    
    if (line.toLowerCase().includes('profile')) {
      return 'href="/dashboard/profile"';
    }
  }
  
  // Check for navigation links
  if (line.includes('Link') || line.includes('NavLink')) {
    if (isInDashboard) {
      return `href="/dashboard/${fileName.toLowerCase()}"`;
    }
    
    if (isInApp) {
      const section = fileDir[fileDir.length - 1];
      if (section !== 'app') {
        return `href="/${section}"`;
      }
    }
  }
  
  // Check for common page types
  if (fileName.toLowerCase().includes('settings')) {
    return 'href="/dashboard/settings"';
  }
  
  if (fileName.toLowerCase().includes('profile')) {
    return 'href="/dashboard/profile"';
  }
  
  if (line.toLowerCase().includes('docs') || line.toLowerCase().includes('documentation')) {
    return 'href="/docs"';
  }
  
  if (line.toLowerCase().includes('contact')) {
    return 'href="/contact"';
  }
  
  if (line.toLowerCase().includes('about')) {
    return 'href="/about"';
  }
  
  if (line.toLowerCase().includes('login') || line.toLowerCase().includes('sign in')) {
    return 'href="/login"';
  }
  
  if (line.toLowerCase().includes('signup') || line.toLowerCase().includes('register')) {
    return 'href="/signup"';
  }
  
  // Default suggestion
  return 'href="/dashboard" or appropriate route';
}

/**
 * Format and print the results
 */
function printResults() {
  console.log('\n');
  console.log(`${colors.bright}${colors.cyan}=====================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   KAZI PLACEHOLDER LINKS REPORT    ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}=====================================${colors.reset}`);
  console.log('\n');
  
  console.log(`${colors.bright}SUMMARY:${colors.reset}`);
  console.log(`${colors.gray}• Scanned:${colors.reset} ${results.totalFiles} files`);
  console.log(`${colors.gray}• Found:${colors.reset} ${results.totalPlaceholders} placeholder links`);
  console.log(`${colors.gray}• Files with issues:${colors.reset} ${results.fileResults.length}`);
  console.log('\n');
  
  // Sort results by priority and number of placeholders
  const sortedResults = [...results.fileResults].sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return b.placeholders.length - a.placeholders.length;
  });
  
  // Print detailed results
  console.log(`${colors.bright}DETAILED FINDINGS:${colors.reset}`);
  sortedResults.forEach((fileResult, index) => {
    console.log('\n');
    console.log(`${colors.bright}${colors.blue}FILE ${index + 1}:${colors.reset} ${fileResult.filePath} ${fileResult.isPriority ? `${colors.red}[HIGH PRIORITY]${colors.reset}` : ''}`);
    console.log(`${colors.gray}Found ${fileResult.placeholders.length} placeholder(s)${colors.reset}`);
    console.log('-------------------------------------');
    
    fileResult.placeholders.forEach((placeholder, i) => {
      console.log(`${colors.yellow}Issue ${i + 1}:${colors.reset} Line ${placeholder.lineNumber} - ${placeholder.pattern}`);
      console.log(`${colors.gray}Code:${colors.reset} ${placeholder.line}`);
      console.log(`${colors.gray}Match:${colors.reset} ${placeholder.match}`);
      console.log(`${colors.green}Suggestion:${colors.reset} Replace with ${placeholder.replacement}`);
      console.log('');
    });
  });
  
  // Print pattern summary
  console.log(`${colors.bright}PATTERN SUMMARY:${colors.reset}`);
  Object.entries(results.summary.byPattern).forEach(([pattern, count]) => {
    console.log(`${colors.gray}• ${pattern}:${colors.reset} ${count} occurrences`);
  });
  console.log('\n');
  
  // Print directory summary
  console.log(`${colors.bright}DIRECTORY SUMMARY:${colors.reset}`);
  Object.entries(results.summary.byDirectory).forEach(([dir, count]) => {
    console.log(`${colors.gray}• ${dir}:${colors.reset} ${count} occurrences`);
  });
  console.log('\n');
  
  // Print extension summary
  console.log(`${colors.bright}FILE TYPE SUMMARY:${colors.reset}`);
  Object.entries(results.summary.byExtension).forEach(([ext, count]) => {
    console.log(`${colors.gray}• ${ext}:${colors.reset} ${count} occurrences`);
  });
  console.log('\n');
  
  // Print next steps
  console.log(`${colors.bright}${colors.cyan}NEXT STEPS:${colors.reset}`);
  console.log(`1. Fix high priority files first (marked with [HIGH PRIORITY])`);
  console.log(`2. Replace placeholder links with appropriate routes`);
  console.log(`3. Run this script again to verify all placeholders are fixed`);
  console.log(`4. Run build to ensure no broken links remain`);
  console.log('\n');
}

/**
 * Main execution function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}KAZI Placeholder Links Scanner${colors.reset}`);
  console.log(`Scanning directories: ${config.directories.join(', ')}`);
  console.log(`Looking for file types: ${config.extensions.join(', ')}`);
  console.log('Please wait...\n');
  
  try {
    // Process each configured directory
    for (const dir of config.directories) {
      await walkDirectories(dir);
    }
    
    // Print the results
    printResults();
    
    // Exit with error code if placeholders found
    if (results.totalPlaceholders > 0) {
      process.exit(1);
    } else {
      console.log(`${colors.bright}${colors.green}✓ No placeholder links found!${colors.reset}`);
      process.exit(0);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Start the script
main();
