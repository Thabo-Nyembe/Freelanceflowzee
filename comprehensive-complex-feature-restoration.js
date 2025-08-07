#!/usr/bin/env node
/**
 * comprehensive-complex-feature-restoration.js
 * 
 * A comprehensive tool to identify and fix syntax corruption in complex components
 * throughout the KAZI application, focusing on doubled quotes and other syntax issues.
 * 
 * This script systematically restores enterprise-grade functionality that may have been
 * simplified during previous bug fixes.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const { execSync } = require('child_process');
const readline = require('readline');

// Convert fs functions to promise-based
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

// Configuration
const CONFIG = {
  rootDir: process.argv[2] || 'freeflow-app-9',
  backupDir: 'freeflow-app-9-backups',
  componentsDir: 'components',
  appDir: 'app',
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  complexComponentMinLines: 500,
  complexComponentPatterns: [
    'ai', 'collaboration', 'dashboard', 'studio', 'enhanced', 
    'predictive', 'analytics', 'management', 'workflow', 'multi-modal',
    'video', 'feedback', 'recording', 'team', 'universal'
  ],
  syntaxCorruptionPatterns: [
    '"use client";"',
    /import.*from.*";"/g,
    /className="[^"]*";"/g,
    /variant="[^"]*";"/g,
    /size="[^"]*";"/g,
    /placeholder="[^"]*";"/g,
    /title="[^"]*";"/g,
    /description="[^"]*";"/g,
    /id="[^"]*";"/g,
    /name="[^"]*";"/g,
    /type="[^"]*";"/g,
    /value="[^"]*";"/g,
    /href="[^"]*";"/g,
    /src="[^"]*";"/g,
    /alt="[^"]*";"/g,
    /role="[^"]*";"/g,
    /aria-label="[^"]*";"/g,
    /aria-labelledby="[^"]*";"/g,
    /aria-describedby="[^"]*";"/g,
    /data-[^=]*="[^"]*";"/g,
    /"[^"]*";"/g,
  ],
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  reportFile: 'complex-feature-restoration-report.md',
  validateAfterFix: true,
  maxConcurrentFiles: 10,
};

// Logging utilities
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const logger = {
  debug: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.debug) {
      console.log(`${COLORS.dim}[DEBUG]${COLORS.reset} ${message}`);
    }
  },
  info: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.info) {
      console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${message}`);
    }
  },
  warn: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.warn) {
      console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${message}`);
    }
  },
  error: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.error) {
      console.log(`${COLORS.red}[ERROR]${COLORS.reset} ${message}`);
    }
  },
  success: (message) => {
    if (LOG_LEVELS[CONFIG.logLevel] <= LOG_LEVELS.info) {
      console.log(`${COLORS.green}[SUCCESS]${COLORS.reset} ${message}`);
    }
  },
};

// Statistics tracking
const stats = {
  filesScanned: 0,
  filesIdentified: 0,
  filesFixed: 0,
  filesFailed: 0,
  backupsCreated: 0,
  syntaxErrorsFixed: 0,
  complexComponentsRestored: 0,
  startTime: Date.now(),
  endTime: null,
  errors: [],
  fixedFiles: [],
  identifiedFiles: [],
};

/**
 * Recursively walks a directory and returns all files with specified extensions
 * @param {string} dir - Directory to walk
 * @param {string[]} extensions - File extensions to include
 * @returns {Promise<string[]>} - Array of file paths
 */
async function walkDirectory(dir, extensions) {
  const files = [];
  
  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .git directories
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          await walk(fullPath);
        }
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Checks if a file is a complex component based on size and patterns
 * @param {string} filePath - Path to the file
 * @param {string} content - Content of the file
 * @returns {Promise<{isComplex: boolean, reason: string}>} - Whether the file is complex and why
 */
async function isComplexComponent(filePath, content) {
  // Check file size (line count)
  const lineCount = content.split('\n').length;
  
  // Check if file contains complex component patterns
  const fileName = path.basename(filePath).toLowerCase();
  const matchesPattern = CONFIG.complexComponentPatterns.some(pattern => 
    fileName.includes(pattern) || content.toLowerCase().includes(pattern)
  );
  
  // Check for syntax corruption patterns
  const hasSyntaxCorruption = CONFIG.syntaxCorruptionPatterns.some(pattern => {
    if (typeof pattern === 'string') {
      return content.includes(pattern);
    } else if (pattern instanceof RegExp) {
      return pattern.test(content);
    }
    return false;
  });
  
  // Check for React component patterns
  const isReactComponent = content.includes('import React') || 
                          content.includes('from "react"') || 
                          content.includes('function') && content.includes('return') && 
                          (content.includes('JSX') || content.includes('<div') || content.includes('<>'));
  
  // Determine if this is a complex component
  let isComplex = false;
  let reason = '';
  
  if (lineCount >= CONFIG.complexComponentMinLines) {
    isComplex = true;
    reason = `Large component (${lineCount} lines)`;
  } else if (hasSyntaxCorruption && isReactComponent) {
    isComplex = true;
    reason = 'Contains syntax corruption patterns';
  } else if (matchesPattern && isReactComponent && lineCount > 100) {
    isComplex = true;
    reason = `Matches complex component pattern and is substantial (${lineCount} lines)`;
  }
  
  return { isComplex, reason };
}

/**
 * Creates a backup of a file before modifying it
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - Path to the backup file
 */
async function createBackup(filePath) {
  const relativePath = path.relative(CONFIG.rootDir, filePath);
  const backupPath = path.join(CONFIG.rootDir, CONFIG.backupDir, relativePath);
  const backupDir = path.dirname(backupPath);
  
  // Create backup directory if it doesn't exist
  await mkdir(backupDir, { recursive: true });
  
  // Copy file to backup location
  const content = await readFile(filePath, 'utf8');
  await writeFile(backupPath, content, 'utf8');
  
  stats.backupsCreated++;
  logger.debug(`Created backup: ${backupPath}`);
  
  return backupPath;
}

/**
 * Fixes syntax corruption in a file
 * @param {string} content - Content of the file
 * @returns {{fixed: string, count: number}} - Fixed content and number of fixes
 */
function fixSyntaxCorruption(content) {
  let fixed = content;
  let count = 0;
  
  // Fix "use client";" pattern
  if (fixed.includes('"use client";"')) {
    fixed = fixed.replace('"use client";"', '"use client"');
    count++;
  }
  
  // Fix import statements with doubled quotes
  const importRegex = /import\s+.*\s+from\s+(['"])(.+)\1;['"](\s*)/g;
  fixed = fixed.replace(importRegex, (match, quote, path, spacing) => {
    count++;
    return `import ${match.split('from')[0]} from ${quote}${path}${quote}${spacing}`;
  });
  
  // Fix JSX attributes with doubled quotes
  const jsxAttributeRegex = /(\w+)=(['"])([^'"]*)\2;(['"])/g;
  fixed = fixed.replace(jsxAttributeRegex, (match, attr, quote, value, endQuote) => {
    count++;
    return `${attr}=${quote}${value}${quote}`;
  });
  
  // Fix string literals with doubled quotes
  const stringLiteralRegex = /(['"])([^'"]*)\1;(['"])/g;
  fixed = fixed.replace(stringLiteralRegex, (match, startQuote, content, endQuote) => {
    count++;
    return `${startQuote}${content}${startQuote}`;
  });
  
  // Fix object keys with doubled quotes
  const objectKeyRegex = /(\w+):\s*(['"])([^'"]*)\2;(['"])/g;
  fixed = fixed.replace(objectKeyRegex, (match, key, quote, value, endQuote) => {
    count++;
    return `${key}: ${quote}${value}${quote}`;
  });
  
  // Fix array elements with doubled quotes
  const arrayElementRegex = /\[\s*(['"])([^'"]*)\1;(['"])\s*\]/g;
  fixed = fixed.replace(arrayElementRegex, (match, startQuote, content, endQuote) => {
    count++;
    return `[${startQuote}${content}${startQuote}]`;
  });
  
  // Fix template literals with doubled quotes
  const templateLiteralRegex = /`([^`]*)`;\s*`/g;
  fixed = fixed.replace(templateLiteralRegex, (match, content) => {
    count++;
    return `\`${content}\``;
  });
  
  // Fix any remaining doubled quotes pattern (general case)
  const generalDoubledQuotesRegex = /(['"])([^'"]*)\1;(['"])/g;
  fixed = fixed.replace(generalDoubledQuotesRegex, (match, startQuote, content, endQuote) => {
    count++;
    return `${startQuote}${content}${startQuote}`;
  });
  
  return { fixed, count };
}

/**
 * Validates a file after fixing
 * @param {string} filePath - Path to the file
 * @returns {Promise<{valid: boolean, errors: string[]}>} - Validation result
 */
async function validateFile(filePath) {
  try {
    // Use TypeScript compiler to validate syntax (if available)
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      try {
        execSync(`npx tsc --noEmit --jsx react ${filePath}`, { stdio: 'pipe' });
        return { valid: true, errors: [] };
      } catch (error) {
        return { 
          valid: false, 
          errors: [error.message || 'TypeScript validation failed'] 
        };
      }
    }
    
    // For non-TypeScript files, just check if it's valid JavaScript
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      try {
        // Simple syntax check using Node.js
        const content = await readFile(filePath, 'utf8');
        new Function(content); // This will throw if syntax is invalid
        return { valid: true, errors: [] };
      } catch (error) {
        return { 
          valid: false, 
          errors: [error.message || 'JavaScript validation failed'] 
        };
      }
    }
    
    // Default case - assume valid
    return { valid: true, errors: [] };
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Validation error: ${error.message || 'Unknown error'}`] 
    };
  }
}

/**
 * Processes a single file
 * @param {string} filePath - Path to the file
 * @returns {Promise<{fixed: boolean, reason: string, fixCount: number}>} - Processing result
 */
async function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    // Read file content
    const content = await readFile(filePath, 'utf8');
    
    // Check if this is a complex component
    const { isComplex, reason } = await isComplexComponent(filePath, content);
    
    if (!isComplex) {
      logger.debug(`Skipping non-complex file: ${filePath}`);
      return { fixed: false, reason: 'Not a complex component', fixCount: 0 };
    }
    
    // Add to identified files
    stats.filesIdentified++;
    stats.identifiedFiles.push({ path: filePath, reason });
    
    logger.info(`Identified complex component: ${filePath} (${reason})`);
    
    // Create backup
    await createBackup(filePath);
    
    // Fix syntax corruption
    const { fixed, count } = fixSyntaxCorruption(content);
    
    if (count > 0) {
      // Write fixed content back to file
      await writeFile(filePath, fixed, 'utf8');
      
      // Validate the fixed file
      if (CONFIG.validateAfterFix) {
        const { valid, errors } = await validateFile(filePath);
        
        if (!valid) {
          logger.error(`Validation failed for ${filePath}: ${errors.join(', ')}`);
          stats.filesFailed++;
          stats.errors.push({ path: filePath, errors });
          
          // Restore from backup
          const backupPath = path.join(CONFIG.backupDir, path.relative(CONFIG.rootDir, filePath));
          const backupContent = await readFile(backupPath, 'utf8');
          await writeFile(filePath, backupContent, 'utf8');
          
          return { fixed: false, reason: 'Validation failed', fixCount: 0 };
        }
      }
      
      stats.filesFixed++;
      stats.syntaxErrorsFixed += count;
      stats.fixedFiles.push({ path: filePath, fixCount: count });
      
      logger.success(`Fixed ${count} syntax errors in ${filePath}`);
      return { fixed: true, reason, fixCount: count };
    } else {
      logger.info(`No syntax errors found in ${filePath}`);
      return { fixed: false, reason: 'No syntax errors found', fixCount: 0 };
    }
  } catch (error) {
    logger.error(`Error processing file ${filePath}: ${error.message}`);
    stats.errors.push({ path: filePath, error: error.message });
    return { fixed: false, reason: `Error: ${error.message}`, fixCount: 0 };
  }
}

/**
 * Generates a detailed report of the restoration process
 * @returns {Promise<void>}
 */
async function generateReport() {
  const duration = (stats.endTime - stats.startTime) / 1000; // in seconds
  
  const report = [
    '# Complex Feature Restoration Report',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Duration:** ${duration.toFixed(2)} seconds`,
    '',
    '## Summary',
    '',
    `- **Files Scanned:** ${stats.filesScanned}`,
    `- **Complex Components Identified:** ${stats.filesIdentified}`,
    `- **Files Fixed:** ${stats.filesFixed}`,
    `- **Files Failed:** ${stats.filesFailed}`,
    `- **Backups Created:** ${stats.backupsCreated}`,
    `- **Syntax Errors Fixed:** ${stats.syntaxErrorsFixed}`,
    '',
    '## Identified Complex Components',
    '',
  ];
  
  // Add identified files
  stats.identifiedFiles.forEach(file => {
    report.push(`- **${file.path}**: ${file.reason}`);
  });
  
  report.push('', '## Fixed Files', '');
  
  // Add fixed files
  stats.fixedFiles.forEach(file => {
    report.push(`- **${file.path}**: Fixed ${file.fixCount} syntax errors`);
  });
  
  report.push('', '## Errors', '');
  
  // Add errors
  if (stats.errors.length > 0) {
    stats.errors.forEach(error => {
      report.push(`- **${error.path}**: ${error.error || error.errors.join(', ')}`);
    });
  } else {
    report.push('No errors occurred during the restoration process.');
  }
  
  // Write report to file
  await writeFile(CONFIG.reportFile, report.join('\n'), 'utf8');
  logger.info(`Report generated: ${CONFIG.reportFile}`);
}

/**
 * Displays a progress bar in the console
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {number} barLength - Length of the progress bar
 */
function showProgressBar(current, total, barLength = 40) {
  const progress = Math.min(Math.floor((current / total) * barLength), barLength);
  const emptyProgress = barLength - progress;
  
  const progressBar = '█'.repeat(progress) + '░'.repeat(emptyProgress);
  const percentage = Math.floor((current / total) * 100);
  
  process.stdout.write(`\r${COLORS.cyan}[${progressBar}] ${percentage}% (${current}/${total})${COLORS.reset}`);
  
  if (current === total) {
    process.stdout.write('\n');
  }
}

/**
 * Main function to run the restoration process
 */
async function main() {
  try {
    logger.info(`Starting complex feature restoration in ${CONFIG.rootDir}`);
    
    // Create backup directory if it doesn't exist
    await mkdir(CONFIG.backupDir, { recursive: true });
    
    // Get all files with specified extensions
    const componentFiles = await walkDirectory(path.join(CONFIG.rootDir, CONFIG.componentsDir), CONFIG.extensions);
    const appFiles = await walkDirectory(path.join(CONFIG.rootDir, CONFIG.appDir), CONFIG.extensions);
    const allFiles = [...componentFiles, ...appFiles];
    
    logger.info(`Found ${allFiles.length} files to scan`);
    
    // Process files with progress bar
    let processed = 0;
    
    // Process files in batches to avoid overwhelming the system
    const batchSize = CONFIG.maxConcurrentFiles;
    
    for (let i = 0; i < allFiles.length; i += batchSize) {
      const batch = allFiles.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(processFile));
      
      processed += batch.length;
      showProgressBar(processed, allFiles.length);
    }
    
    // Update stats and generate report
    stats.endTime = Date.now();
    await generateReport();
    
    // Print final summary
    logger.success('\nRestoration process completed!');
    logger.info(`Files scanned: ${stats.filesScanned}`);
    logger.info(`Complex components identified: ${stats.filesIdentified}`);
    logger.info(`Files fixed: ${stats.filesFixed}`);
    logger.info(`Syntax errors fixed: ${stats.syntaxErrorsFixed}`);
    logger.info(`Files failed: ${stats.filesFailed}`);
    logger.info(`See ${CONFIG.reportFile} for detailed report`);
    
    if (stats.errors.length > 0) {
      logger.warn(`Encountered ${stats.errors.length} errors during restoration`);
    }
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  logger.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
