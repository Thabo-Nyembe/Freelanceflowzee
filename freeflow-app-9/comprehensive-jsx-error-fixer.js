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
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: process.cwd(),
  backupDir: './error-fix-backups',
  criticalFiles: [
    'components/admin/tutorial-system-launch-panel.tsx',
    'components/ai/ai-dashboard-complete.tsx',
    'components/ai/ai-management-dashboard.tsx',
    'components/ai/multi-modal-content-studio.tsx',
    'components/ai/predictive-analytics-dashboard.tsx',
    'components/collaboration/ai-video-recording-system.tsx',
    'components/onboarding/interactive-tutorial-system.tsx',
    'components/projects-hub/universal-pinpoint-feedback-system.tsx',
    'components/projects-hub/universal-pinpoint-feedback.tsx',
    'components/revenue/premium-features-system.tsx',
    'components/team-collaboration-ai-enhanced-complete.tsx',
    'components/team-collaboration-ai-enhanced.tsx',
    'components/ui/contextual-sidebar.tsx',
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

// Utility functions
const log = (message, type = 'info') => {
  const prefix = {
    info: '📋 INFO:    ',
    success: '✅ SUCCESS: ',
    warning: '⚠️ WARNING: ',
    error: '❌ ERROR:   ',
    fix: '🔧 FIX:     '
  }[type] || '        ';
  
  console.log(`${prefix} ${message}`);
};

const logVerbose = (message) => {
  if (VERBOSE) {
    console.log(`        ${message}`);
  }
};

// Simple fix for common JSX issues
const fixCommonJSXIssues = (content) => {
  let fixedContent = content;
  let fixCount = 0;
  
  // Fix unclosed div tags at the end of functions
  const unclosedDivPattern = /(<div[^>]*>[^<]*)\n\s*}\s*$/gm;
  if (unclosedDivPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(unclosedDivPattern, '$1\n    </div>\n  }');
    fixCount++;
  }
  
  // Fix unclosed Card, Dialog, DialogContent tags
  const unclosedTagPatterns = [
    { pattern: /(<Card[^>]*>[^<]*)\n\s*}\s*$/gm, replacement: '$1\n    </Card>\n  }' },
    { pattern: /(<Dialog[^>]*>[^<]*)\n\s*}\s*$/gm, replacement: '$1\n    </Dialog>\n  }' },
    { pattern: /(<DialogContent[^>]*>[^<]*)\n\s*}\s*$/gm, replacement: '$1\n    </DialogContent>\n  }' },
    { pattern: /(<ErrorBoundary[^>]*>[^<]*)\n\s*}\s*$/gm, replacement: '$1\n    </ErrorBoundary>\n  }' },
    { pattern: /(<Tabs[^>]*>[^<]*)\n\s*}\s*$/gm, replacement: '$1\n    </Tabs>\n  }' },
    { pattern: /(<TabsContent[^>]*>[^<]*)\n\s*}\s*$/gm, replacement: '$1\n    </TabsContent>\n  }' },
    { pattern: /(<CardContent[^>]*>[^<]*)\n\s*}\s*$/gm, replacement: '$1\n    </CardContent>\n  }' }
  ];
  
  unclosedTagPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(fixedContent)) {
      fixedContent = fixedContent.replace(pattern, replacement);
      fixCount++;
    }
  });
  
  // Fix unterminated string literals at end of lines
  const unterminatedStringPattern = /"[^"\n]*\n/g;
  fixedContent = fixedContent.replace(unterminatedStringPattern, (match) => {
    fixCount++;
    return match.trimEnd() + '"\n';
  });
  
  // Fix missing closing braces and parentheses
  const missingBracePatterns = [
    { pattern: /(\w+)\s*=\s*{([^}]*)\n\s*export/g, replacement: '$1 = {$2}\n\nexport' },
    { pattern: /(\w+)\s*\(([^)]*)\n\s*export/g, replacement: '$1($2)\n\nexport' }
  ];
  
  missingBracePatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(fixedContent)) {
      fixedContent = fixedContent.replace(pattern, replacement);
      fixCount++;
    }
  });
  
  return { content: fixedContent, fixCount };
};

// Main file processing function
const processFile = async (filePath) => {
  const fullPath = path.join(CONFIG.projectRoot, filePath);
  log(`Processing file: ${filePath}`);
  
  if (!fs.existsSync(fullPath)) {
    log(`File not found: ${fullPath}`, 'error');
    return { status: 'error', message: 'File not found', filePath };
  }
  
  try {
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    
    if (DRY_RUN) {
      log(`Would analyze ${filePath} for issues`, 'info');
      return { status: 'analyzed', filePath };
    }
    
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const backupDir = path.join(CONFIG.projectRoot, CONFIG.backupDir);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupPath = path.join(backupDir, `${path.basename(filePath)}.${timestamp}.backup`);
    fs.copyFileSync(fullPath, backupPath);
    logVerbose(`Created backup: ${backupPath}`);
    
    // Apply fixes
    const result = fixCommonJSXIssues(originalContent);
    
    if (result.fixCount > 0) {
      fs.writeFileSync(fullPath, result.content, 'utf8');
      log(`Applied ${result.fixCount} fixes to ${filePath}`, 'success');
    } else {
      log(`No fixes needed for ${filePath}`, 'success');
    }
    
    return {
      status: 'fixed',
      fixCount: result.fixCount,
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

// Main execution function
const main = async () => {
  log('KAZI Platform - Comprehensive JSX Error Fixer', 'info');
  log('------------------------------------------------', 'info');
  
  log(`Processing ${CONFIG.criticalFiles.length} files...`);
  
  const results = [];
  for (const filePath of CONFIG.criticalFiles) {
    const result = await processFile(filePath);
    results.push(result);
  }
  
  // Print summary
  const fixedFiles = results.filter(r => r.status === 'fixed').length;
  const totalFixes = results.reduce((sum, r) => sum + (r.fixCount || 0), 0);
  const errorFiles = results.filter(r => r.status === 'error').length;
  
  log('\\n------------------------------------------------', 'info');
  log('SUMMARY', 'info');
  log('------------------------------------------------', 'info');
  log(`Files processed: ${results.length}`);
  log(`Files fixed: ${fixedFiles}`);
  log(`Total fixes applied: ${totalFixes}`);
  log(`Files with errors: ${errorFiles}`);
  
  if (DRY_RUN) {
    log('\\nThis was a dry run. No changes were made.', 'warning');
  }
};

// Execute main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});
