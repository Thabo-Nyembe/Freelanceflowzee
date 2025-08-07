#!/usr/bin/env node
/**
 * KAZI Platform - Comprehensive JSX Error Fixer
 * 
 * This script automatically fixes common JSX and TypeScript errors:
 * - Unclosed JSX tags (div, Dialog, Card, etc.)
 * - Unterminated string literals
 * - Malformed JSX syntax
 * - TypeScript compilation errors
 * 
 * Usage: node comprehensive-jsx-error-fixer.js [options]
 * Options:
 *   --dry-run: Only analyze issues without making changes
 *   --verbose: Show detailed logs
 *   --file=path/to/file.tsx: Fix a specific file only
 *   --no-backup: Skip creating backups (not recommended)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: process.cwd(),
  backupDir: './error-fix-backups',
  fixLogFile: './jsx-error-fix-report.json',
  criticalFiles: [
    // Admin components
    'components/admin/tutorial-system-launch-panel.tsx',
    
    // AI components
    'components/ai/ai-dashboard-complete.tsx',
    'components/ai/ai-management-dashboard.tsx',
    'components/ai/multi-modal-content-studio.tsx',
    'components/ai/predictive-analytics-dashboard.tsx',
    
    // Collaboration components
    'components/collaboration/ai-video-recording-system.tsx',
    
    // Onboarding components
    'components/onboarding/interactive-tutorial-system.tsx',
    
    // Project hub components
    'components/projects-hub/universal-pinpoint-feedback-system.tsx',
    'components/projects-hub/universal-pinpoint-feedback.tsx',
    
    // Revenue components
    'components/revenue/premium-features-system.tsx',
    
    // Team collaboration components
    'components/team-collaboration-ai-enhanced-complete.tsx',
    'components/team-collaboration-ai-enhanced.tsx',
    
    // UI components
    'components/ui/contextual-sidebar.tsx',
    
    // Library files
    'lib/ai/ai-gateway.ts',
    'lib/ai/multi-modal-ai-system.ts',
    'lib/ai/predictive-analytics-system.ts',
    'lib/ai/smart-collaboration-ai.ts',
    'lib/analytics-enhanced.ts',
    'lib/internationalization.ts',
    'lib/security-audit.ts',
    'lib/sla-monitoring.ts'
  ]
};

// Command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');
const NO_BACKUP = args.includes('--no-backup');
const SPECIFIC_FILE = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

// Utility functions
const log = (message, type = 'info') => {
  const prefix = {
    info: '📋 INFO:    ',
    success: '✅ SUCCESS: ',
    warning: '⚠️ WARNING: ',
    error: '❌ ERROR:   ',
    critical: '🚨 CRITICAL:',
    fix: '🔧 FIX:     '
  }[type] || '        ';
  
  console.log(`${prefix} ${message}`);
};

const logVerbose = (message) => {
  if (VERBOSE) {
    console.log(`        ${message}`);
  }
};

const createBackup = (filePath) => {
  if (NO_BACKUP) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  const backupDir = path.join(CONFIG.projectRoot, CONFIG.backupDir);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const fileName = path.basename(filePath);
  const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);
  
  try {
    fs.copyFileSync(filePath, backupPath);
    logVerbose(`Created backup: ${backupPath}`);
    return backupPath;
  } catch (err) {
    log(`Failed to create backup for ${filePath}: ${err.message}`, 'error');
    return null;
  }
};

// Error detection and fixing functions
const findUnclosedJSXTags = (content) => {
  const lines = content.split('\n');
  const tagStack = [];
  const unclosedTags = [];
  const selfClosingTags = new Set(['img', 'input', 'br', 'hr', 'meta', 'link']);
  
  // Regular expressions for JSX tags
  const openTagRegex = /<([A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?:\s+[^>]*)?>/g;
  const closeTagRegex = /<\/([A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)>/g;
  const selfClosingTagRegex = /<([A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?:\s+[^>]*)?\/>/g;
  const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments
    const lineWithoutComments = line.replace(commentRegex, '');
    
    // Find all self-closing tags and ignore them
    const selfClosingMatches = [...lineWithoutComments.matchAll(selfClosingTagRegex)];
    
    // Find all opening tags
    const openMatches = [...lineWithoutComments.matchAll(openTagRegex)];
    
    // Filter out self-closing tags from open matches
    const filteredOpenMatches = openMatches.filter(match => {
      const fullTag = match[0];
      // Check if this is actually a self-closing tag
      return !fullTag.endsWith('/>') && !selfClosingTags.has(match[1].toLowerCase());
    });
    
    // Find all closing tags
    const closeMatches = [...lineWithoutComments.matchAll(closeTagRegex)];
    
    // Process opening tags
    for (const match of filteredOpenMatches) {
      const tagName = match[1];
      tagStack.push({ tagName, lineNum: i + 1, colNum: match.index + 1 });
    }
    
    // Process closing tags
    for (const match of closeMatches) {
      const tagName = match[1];
      
      // Find matching opening tag
      const lastIndex = tagStack.length - 1;
      if (lastIndex >= 0 && tagStack[lastIndex].tagName === tagName) {
        // Matching tag found, pop it from stack
        tagStack.pop();
      } else {
        // No matching opening tag, or wrong order
        let matchingIndex = -1;
        for (let j = lastIndex; j >= 0; j--) {
          if (tagStack[j].tagName === tagName) {
            matchingIndex = j;
            break;
          }
        }
        
        if (matchingIndex >= 0) {
          // Found matching tag but with other unclosed tags in between
          for (let j = lastIndex; j >= matchingIndex; j--) {
            unclosedTags.push({
              tagName: tagStack[j].tagName,
              lineNum: tagStack[j].lineNum,
              colNum: tagStack[j].colNum,
              closingLineNum: i + 1,
              closingColNum: match.index + 1
            });
          }
          // Remove all tags up to and including the matching one
          tagStack.splice(matchingIndex);
        }
      }
    }
  }
  
  // Any tags left in the stack are unclosed
  for (const tag of tagStack) {
    unclosedTags.push({
      tagName: tag.tagName,
      lineNum: tag.lineNum,
      colNum: tag.colNum,
      closingLineNum: lines.length,
      closingColNum: lines[lines.length - 1].length + 1
    });
  }
  
  return unclosedTags;
};

const findUnterminatedStringLiterals = (content) => {
  const lines = content.split('\n');
  const unterminatedStrings = [];
  let inString = false;
  let stringStart = { line: -1, col: -1 };
  let stringDelimiter = '';
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : '';
      
      // Check for string delimiters
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          // Start of string
          inString = true;
          stringStart = { line: i + 1, col: j + 1 };
          stringDelimiter = char;
        } else if (char === stringDelimiter) {
          // End of string
          inString = false;
          stringDelimiter = '';
        }
      }
    }
    
    // If we're still in a string at the end of a line and it's not a template literal
    if (inString && stringDelimiter !== '`') {
      unterminatedStrings.push({
        lineNum: stringStart.line,
        colNum: stringStart.col,
        delimiter: stringDelimiter
      });
      
      // Reset for next line
      inString = false;
      stringDelimiter = '';
    }
  }
  
  // If we're still in a string at the end of the file
  if (inString) {
    unterminatedStrings.push({
      lineNum: stringStart.line,
      colNum: stringStart.col,
      delimiter: stringDelimiter
    });
  }
  
  return unterminatedStrings;
};

const findMalformedJSX = (content) => {
  const issues = [];
  const lines = content.split('\n');
  
  // Regular expressions for common JSX issues
  const invalidCharRegex = /[<>]/g;
  const jsxExpressionRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
  
  // Check each line for potential issues
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines that are clearly not JSX
    if (!line.includes('<') && !line.includes('>')) continue;
    
    // Extract JSX expressions to avoid checking inside them
    const jsxExpressions = [];
    let processedLine = line.replace(jsxExpressionRegex, match => {
      jsxExpressions.push(match);
      return `__JSX_EXPR_${jsxExpressions.length - 1}__`;
    });
    
    // Check for unescaped < and > in text content
    let match;
    while ((match = invalidCharRegex.exec(processedLine)) !== null) {
      // Check if this is part of a tag or an unescaped character
      const beforeChar = processedLine.substring(0, match.index).trim();
      const afterChar = processedLine.substring(match.index + 1).trim();
      
      const isOpeningTag = match[0] === '<' && /^[A-Za-z0-9_$]/.test(afterChar);
      const isClosingTag = match[0] === '<' && afterChar.startsWith('/');
      const isTagEnd = match[0] === '>' && /[A-Za-z0-9_$"'\/]$/.test(beforeChar);
      
      if (!isOpeningTag && !isClosingTag && !isTagEnd) {
        issues.push({
          type: 'unescaped-char',
          lineNum: i + 1,
          colNum: match.index + 1,
          char: match[0]
        });
      }
    }
    
    // Restore JSX expressions and check for malformed ones
    processedLine = line;
    for (let j = 0; j < jsxExpressions.length; j++) {
      const expr = jsxExpressions[j];
      
      // Check for incomplete expressions
      if ((expr.match(/\{/g) || []).length !== (expr.match(/\}/g) || []).length) {
        const startIndex = line.indexOf(expr);
        issues.push({
          type: 'incomplete-expression',
          lineNum: i + 1,
          colNum: startIndex + 1,
          expression: expr
        });
      }
    }
  }
  
  return issues;
};

const fixUnclosedJSXTags = (content, unclosedTags) => {
  const lines = content.split('\n');
  let fixCount = 0;
  
  // Sort unclosed tags in reverse order of closing position
  // This ensures we insert closing tags from bottom to top, which won't affect line numbers
  unclosedTags.sort((a, b) => {
    if (a.closingLineNum !== b.closingLineNum) {
      return b.closingLineNum - a.closingLineNum;
    }
    return b.closingColNum - a.closingColNum;
  });
  
  // Insert closing tags
  for (const tag of unclosedTags) {
    const lineIndex = tag.closingLineNum - 1;
    const line = lines[lineIndex];
    
    // Calculate indentation based on the line
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';
    
    // Insert closing tag at the appropriate position
    const closingTag = `</${tag.tagName}>`;
    
    if (lineIndex >= lines.length) {
      // Add to the end of the file
      lines.push(`${indent}${closingTag}`);
    } else {
      const colIndex = Math.min(tag.closingColNum, line.length);
      const newLine = line.substring(0, colIndex) + closingTag + line.substring(colIndex);
      lines[lineIndex] = newLine;
    }
    
    fixCount++;
    log(`Added closing tag </${tag.tagName}> at line ${tag.closingLineNum}, column ${tag.closingColNum}`, 'fix');
  }
  
  return { content: lines.join('\n'), fixCount };
};

const fixUnterminatedStringLiterals = (content, unterminatedStrings) => {
  const lines = content.split('\n');
  let fixCount = 0;
  
  // Fix unterminated strings
  for (const issue of unterminatedStrings) {
    const lineIndex = issue.lineNum - 1;
    if (lineIndex < lines.length) {
      const line = lines[lineIndex];
      lines[lineIndex] = line + issue.delimiter;
      fixCount++;
      log(`Fixed unterminated string at line ${issue.lineNum}, column ${issue.colNum}`, 'fix');
    }
  }
  
  return { content: lines.join('\n'), fixCount };
};

const fixMalformedJSX = (content, issues) => {
  const lines = content.split('\n');
  let fixCount = 0;
  
  // Fix malformed JSX
  for (const issue of issues) {
    const lineIndex = issue.lineNum - 1;
    if (lineIndex < lines.length) {
      const line = lines[lineIndex];
      
      if (issue.type === 'unescaped-char') {
        const escapedChar = issue.char === '<' ? '&lt;' : '&gt;';
        lines[lineIndex] = line.substring(0, issue.colNum - 1) + escapedChar + line.substring(issue.colNum);
        fixCount++;
        log(`Escaped character '${issue.char}' at line ${issue.lineNum}, column ${issue.colNum}`, 'fix');
      } else if (issue.type === 'incomplete-expression') {
        // Simple fix for incomplete expressions - add missing closing brace
        if ((issue.expression.match(/\{/g) || []).length > (issue.expression.match(/\}/g) || []).length) {
          lines[lineIndex] = line + '}';
          fixCount++;
          log(`Added missing '}' at line ${issue.lineNum}`, 'fix');
        }
      }
    }
  }
  
  return { content: lines.join('\n'), fixCount };
};

// Special case fixes for known patterns
const applySpecialCaseFixes = (content, filePath) => {
  let fixedContent = content;
  let fixCount = 0;
  
  // Fix for contextual-sidebar.tsx specific issues
  if (filePath.includes('contextual-sidebar.tsx')) {
    // Fix unescaped angle brackets in JSX
    const pattern1 = /(\w+)\s*>\s*(\w+)/g;
    fixedContent = fixedContent.replace(pattern1, (match, p1, p2) => {
      fixCount++;
      log(`Fixed unescaped angle bracket in contextual-sidebar.tsx: "${match}" -> "${p1} &gt; ${p2}"`, 'fix');
      return `${p1} &gt; ${p2}`;
    });
    
    // Fix malformed JSX curly braces
    const pattern2 = /([^{])}([^}])/g;
    fixedContent = fixedContent.replace(pattern2, (match, p1, p2) => {
      fixCount++;
      log(`Fixed malformed JSX curly brace in contextual-sidebar.tsx: "${match}" -> "${p1}&rbrace;${p2}"`, 'fix');
      return `${p1}&rbrace;${p2}`;
    });
  }
  
  // Fix for internationalization.ts specific issues
  if (filePath.includes('internationalization.ts')) {
    // Fix malformed TypeScript syntax
    fixedContent = fixedContent.replace(/\/\/\s*simple passthrough/g, '// simple passthrough');
    
    // Fix specific syntax errors in internationalization.ts
    const brokenPatterns = [
      { pattern: /(\w+)\s*>\s*(\w+)/g, replacement: '$1 > $2' },
      { pattern: /(\w+)\s*:\s*([^,;]+)([^\s,;])/g, replacement: '$1: $2$3;' },
      { pattern: /export\s+const\s+(\w+)\s*=\s*{([^}]*)}/g, replacement: 'export const $1 = {$2};' }
    ];
    
    brokenPatterns.forEach(({ pattern, replacement }) => {
      const matches = fixedContent.match(pattern);
      if (matches && matches.length > 0) {
        fixedContent = fixedContent.replace(pattern, replacement);
        fixCount += matches.length;
        log(`Fixed ${matches.length} syntax errors in internationalization.ts using pattern replacement`, 'fix');
      }
    });
    
    // Handle unterminated regex literals
    if (fixedContent.includes('Unterminated regular expression literal')) {
      fixedContent = fixedContent.replace(/\/([^\/\n]+)$/gm, '/$1/');
      fixCount++;
      log(`Fixed unterminated regex literal in internationalization.ts`, 'fix');
    }
  }
  
  // Fix for AI component files
  if (filePath.includes('/ai/')) {
    // Fix common missing closing brackets
    const aiPatterns = [
      { pattern: /(\w+)\s*=\s*{([^}]*)\n/g, replacement: '$1 = {$2}\n' },
      { pattern: /(\w+)\s*\(\s*([^)]*)\n/g, replacement: '$1($2)\n' }
    ];
    
    aiPatterns.forEach(({ pattern, replacement }) => {
      const matches = fixedContent.match(pattern);
      if (matches && matches.length > 0) {
        fixedContent = fixedContent.replace(pattern, replacement);
        fixCount += matches.length;
        log(`Fixed ${matches.length} missing brackets in ${path.basename(filePath)}`, 'fix');
      }
    });
  }
  
  return { content: fixedContent, fixCount };
};

// Main file processing function
const processFile = async (filePath) => {
  const fullPath = path.join(CONFIG.projectRoot, filePath);
  log(`Processing file: ${filePath}`);
  
  if (!fs.existsSync(fullPath)) {
    log(`File not found: ${fullPath}`, 'error');
    return {
      status: 'error',
      message: 'File not found',
      filePath
    };
  }
  
  try {
    // Read file content
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    
    // Find issues
    const unclosedTags = findUnclosedJSXTags(originalContent);
    const unterminatedStrings = findUnterminatedStringLiterals(originalContent);
    const malformedJSX = findMalformedJSX(originalContent);
    
    // Log found issues
    if (unclosedTags.length > 0) {
      log(`Found ${unclosedTags.length} unclosed JSX tags`, 'warning');
      unclosedTags.forEach(tag => {
        logVerbose(`Unclosed <${tag.tagName}> at line ${tag.lineNum}, column ${tag.colNum}`);
      });
    }
    
    if (unterminatedStrings.length > 0) {
      log(`Found ${unterminatedStrings.length} unterminated string literals`, 'warning');
      unterminatedStrings.forEach(str => {
        logVerbose(`Unterminated string at line ${str.lineNum}, column ${str.colNum}`);
      });
    }
    
    if (malformedJSX.length > 0) {
      log(`Found ${malformedJSX.length} malformed JSX issues`, 'warning');
      malformedJSX.forEach(issue => {
        logVerbose(`${issue.type} at line ${issue.lineNum}, column ${issue.colNum}`);
      });
    }
    
    // Skip fixing if in dry run mode
    if (DRY_RUN) {
      return {
        status: 'analyzed',
        issues: {
          unclosedTags: unclosedTags.length,
          unterminatedStrings: unterminatedStrings.length,
          malformedJSX: malformedJSX.length
        },
        filePath
      };
    }
    
    // Create backup before making changes
    const backupPath = createBackup(fullPath);
    
    // Apply fixes
    let content = originalContent;
    let totalFixCount = 0;
    
    // Fix unclosed tags
    if (unclosedTags.length > 0) {
      const result = fixUnclosedJSXTags(content, unclosedTags);
      content = result.content;
      totalFixCount += result.fixCount;
    }
    
    // Fix unterminated strings
    if (unterminatedStrings.length > 0) {
      const result = fixUnterminatedStringLiterals(content, unterminatedStrings);
      content = result.content;
      totalFixCount += result.fixCount;
    }
    
    // Fix malformed JSX
    if (malformedJSX.length > 0) {
      const result = fixMalformedJSX(content, malformedJSX);
      content = result.content;
      totalFixCount += result.fixCount;
    }
    
    // Apply special case fixes
    const specialCaseResult = applySpecialCaseFixes(content, filePath);
    content = specialCaseResult.content;
    totalFixCount += specialCaseResult.fixCount;
    
    // Only write the file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      log(`Applied ${totalFixCount} fixes to ${filePath}`, 'success');
    } else {
      log(`No changes needed for ${filePath}`, 'success');
    }
    
    return {
      status: 'fixed',
      fixCount: totalFixCount,
      backupPath,
      filePath
    };
  } catch (err) {
    log(`Error processing ${filePath}: ${err.message}`, 'error');
    return {
      status: 'error',
      error: err.message,
      filePath
    };
  }
};

// Check TypeScript compilation
const checkTypeScriptCompilation = () => {
  log('Checking TypeScript compilation...');
  
  try {
    // Run TypeScript compiler in noEmit mode to just check for errors
    execSync('npx tsc --noEmit', { 
      stdio: VERBOSE ? 'inherit' : 'pipe',
      cwd: CONFIG.projectRoot
    });
    log('TypeScript compilation successful', 'success');
    return { success: true };
  } catch (error) {
    log('TypeScript compilation failed', 'error');
    if (VERBOSE) {
      console.error(error.toString());
    }
    return { 
      success: false, 
      error: error.toString() 
    };
  }
};

// Generate report
const generateReport = (results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  const reportPath = path.join(CONFIG.projectRoot, CONFIG.fixLogFile);
  
  const report = {
    timestamp,
    results,
    summary: {
      totalFiles: results.length,
      fixedFiles: results.filter(r => r.status === 'fixed').length,
      totalFixes: results.reduce((sum, r) => sum + (r.fixCount || 0), 0),
      errors: results.filter(r => r.status === 'error').length
    }
  };
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    log(`Report generated: ${reportPath}`, 'success');
    return reportPath;
  } catch (err) {
    log(`Failed to generate report: ${err.message}`, 'error');
    return null;
  }
};

// Main execution function
const main = async () => {
  log('KAZI Platform - Comprehensive JSX Error Fixer', 'info');
  log('------------------------------------------------', 'info');
  
  // Check initial TypeScript compilation status
  const initialCompilation = checkTypeScriptCompilation();
  
  if (initialCompilation.success && !DRY_RUN) {
    log('No TypeScript errors found. Nothing to fix.', 'success');
    return;
  }
  
  // Determine which files to process
  const filesToProcess = SPECIFIC_FILE 
    ? [SPECIFIC_FILE] 
    : CONFIG.criticalFiles;
  
  log(`Processing ${filesToProcess.length} files...`);
  
  // Process each file
  const results = [];
  for (const filePath of filesToProcess) {
    const result = await processFile(filePath);
    results.push(result);
  }
  
  // Generate report
  if (!DRY_RUN) {
    generateReport(results);
  }
  
  // Check TypeScript compilation after fixes
  if (!DRY_RUN) {
    const finalCompilation = checkTypeScriptCompilation();
    
    if (finalCompilation.success) {
      log('All TypeScript errors fixed successfully!', 'success');
    } else {
      log('Some TypeScript errors still remain after fixes', 'warning');
      log('You may need to run the fixer again or fix remaining issues manually', 'warning');
    }
  }
  
  // Print summary
  const fixedFiles = results.filter(r => r.status === 'fixed').length;
  const totalFixes = results.reduce((sum, r) => sum + (r.fixCount || 0), 0);
  const errorFiles = results.filter(r => r.status === 'error').length;
  
  log('\n------------------------------------------------', 'info');
  log('SUMMARY', 'info');
  log('------------------------------------------------', 'info');
  log(`Files processed: ${results.length}`);
  log(`Files fixed: ${fixedFiles}`);
  log(`Total fixes applied: ${totalFixes}`);
  log(`Files with errors: ${errorFiles}`);
  
  if (DRY_RUN) {
    log('\nThis was a dry run. No changes were made.', 'warning');
    log('Run without --dry-run to apply fixes', 'warning');
  }
};

// Execute main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'critical');
  console.error(error);
  process.exit(1);
});
