#!/usr/bin/env node

/**
 * Logger Migration Script
 * 
 * Automates migration of console statements to centralized logger
 * 
 * Usage:
 *   node scripts/migrate-logger.js analyze <file>
 *   node scripts/migrate-logger.js migrate <file> <feature-name>
 *   node scripts/migrate-logger.js stats
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Analyze a file for console statements
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`Error: File not found: ${filePath}`, 'red');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const consoleStatements = [];
  
  lines.forEach((line, index) => {
    if (line.match(/console\.(log|error|warn|info|debug)/)) {
      consoleStatements.push({
        lineNumber: index + 1,
        line: line.trim(),
        type: line.match(/console\.(log|error|warn|info|debug)/)[1]
      });
    }
  });

  log('\n📊 Analysis Results:', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`File: ${filePath}`, 'bright');
  log(`Total lines: ${lines.length}`);
  log(`Console statements: ${consoleStatements.length}`, 'yellow');
  
  if (consoleStatements.length > 0) {
    log('\n📝 Console Statement Breakdown:', 'cyan');
    const breakdown = consoleStatements.reduce((acc, stmt) => {
      acc[stmt.type] = (acc[stmt.type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(breakdown).forEach(([type, count]) => {
      log(`  console.${type}: ${count}`, 'yellow');
    });
    
    log('\n📍 First 10 occurrences:', 'cyan');
    consoleStatements.slice(0, 10).forEach(stmt => {
      log(`  Line ${stmt.lineNumber}: ${stmt.line.substring(0, 80)}`, 'blue');
    });
    
    if (consoleStatements.length > 10) {
      log(`  ... and ${consoleStatements.length - 10} more`, 'blue');
    }
  } else {
    log('\n✅ No console statements found!', 'green');
  }

  // Check if logger is already imported
  const hasLoggerImport = content.includes("import { createFeatureLogger }") ||
                         content.includes("import { logger }");
  
  log('\n🔍 Logger Status:', 'cyan');
  if (hasLoggerImport) {
    log('  ✅ Logger already imported', 'green');
  } else {
    log('  ⚠️  Logger not imported - migration needed', 'yellow');
  }

  return {
    total: consoleStatements.length,
    hasLogger: hasLoggerImport,
    statements: consoleStatements
  };
}

// Get migration suggestions for common patterns
function getMigrationSuggestion(line) {
  // Error logging
  if (line.includes('console.error')) {
    return {
      level: 'error',
      example: "logger.error('Operation failed', { error })"
    };
  }
  
  // Warning logging
  if (line.includes('console.warn')) {
    return {
      level: 'warn',
      example: "logger.warn('Warning message', { context })"
    };
  }
  
  // Debug/verbose logging
  if (line.match(/console\.log.*🔍|DEBUG|debug/i)) {
    return {
      level: 'debug',
      example: "logger.debug('Debug info', { details })"
    };
  }
  
  // User actions/important events
  if (line.match(/console\.log.*✅|SUCCESS|Completed|Added/i)) {
    return {
      level: 'info',
      example: "logger.info('Action completed', { result })"
    };
  }
  
  // Default to info
  return {
    level: 'info',
    example: "logger.info('Message', { context })"
  };
}

// Show migration guide for a file
function showMigrationGuide(filePath, featureName) {
  const analysis = analyzeFile(filePath);
  
  if (analysis.total === 0) {
    log('\n✅ No migration needed - file is clean!', 'green');
    return;
  }

  log('\n📚 Migration Guide:', 'magenta');
  log('='.repeat(60), 'magenta');
  
  if (!analysis.hasLogger) {
    log('\n1️⃣  Add logger import at the top:', 'cyan');
    log(`
import { createSimpleLogger } from '@/lib/simple-logger'

// Initialize logger
const logger = createSimpleLogger('${featureName}')
`, 'blue');
  }

  log('\n2️⃣  Example Migrations:', 'cyan');
  
  // Show examples for each type
  const exampleStatements = analysis.statements.slice(0, 5);
  exampleStatements.forEach((stmt, idx) => {
    const suggestion = getMigrationSuggestion(stmt.line);
    
    log(`\nExample ${idx + 1} (Line ${stmt.lineNumber}):`, 'yellow');
    log(`  Before: ${stmt.line}`, 'red');
    log(`  After:  ${suggestion.example}`, 'green');
    log(`  Level:  ${suggestion.level}`, 'blue');
  });

  log('\n3️⃣  Migration Pattern:', 'cyan');
  log(`
// Before:
console.log('📊 Loading data...')
console.log('✅ Data loaded:', data.length, 'items')
console.error('❌ Failed:', error)

// After:
logger.info('Loading data')
logger.info('Data loaded', { count: data.length })
logger.error('Operation failed', { error })
`, 'blue');

  log('\n4️⃣  Estimated Effort:', 'cyan');
  const estimatedMinutes = Math.ceil(analysis.total / 10) * 5;
  log(`  ${analysis.total} statements × ~30 seconds each = ${estimatedMinutes} minutes`, 'yellow');
  
  log('\n💡 Tips:', 'cyan');
  log('  • Start with error handling (console.error → logger.error)', 'blue');
  log('  • Then migrate user actions (console.log with ✅)', 'blue');
  log('  • Finally migrate debug info (verbose console.log)', 'blue');
  log('  • Use structured context objects for better logging', 'blue');
  log('  • Remove emojis from log messages', 'blue');
}

// Get statistics across all dashboard pages
function getStats() {
  const dashboardPath = path.join(process.cwd(), 'app/(app)/dashboard');
  
  if (!fs.existsSync(dashboardPath)) {
    log('Error: Dashboard directory not found', 'red');
    process.exit(1);
  }

  log('\n📊 Platform Logger Migration Statistics:', 'cyan');
  log('='.repeat(60), 'cyan');

  const stats = {
    totalFiles: 0,
    totalStatements: 0,
    filesWithLogger: 0,
    fileStats: []
  };

  // Recursively find all page.tsx files
  function findPages(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findPages(filePath);
      } else if (file === 'page.tsx') {
        const content = fs.readFileSync(filePath, 'utf8');
        const consoleCount = (content.match(/console\.(log|error|warn|info|debug)/g) || []).length;
        const hasLogger = content.includes('createFeatureLogger') || content.includes('import { logger }');
        
        stats.totalFiles++;
        stats.totalStatements += consoleCount;
        if (hasLogger) stats.filesWithLogger++;
        
        stats.fileStats.push({
          path: filePath.replace(process.cwd() + '/', ''),
          consoleCount,
          hasLogger,
          lines: content.split('\n').length
        });
      }
    });
  }

  findPages(dashboardPath);

  // Sort by console count
  stats.fileStats.sort((a, b) => b.consoleCount - a.consoleCount);

  log(`\nTotal Files: ${stats.totalFiles}`);
  log(`Total Console Statements: ${stats.totalStatements}`, 'yellow');
  log(`Files with Logger: ${stats.filesWithLogger}`, 'green');
  log(`Files Remaining: ${stats.totalFiles - stats.filesWithLogger}`, 'red');
  
  const percentage = ((stats.filesWithLogger / stats.totalFiles) * 100).toFixed(1);
  log(`Migration Progress: ${percentage}%`, 'cyan');

  log('\n🔥 Top 15 Pages by Console Statements:', 'magenta');
  stats.fileStats.slice(0, 15).forEach((file, idx) => {
    const status = file.hasLogger ? '✅' : '⚠️';
    const color = file.hasLogger ? 'green' : 'yellow';
    const fileName = path.basename(path.dirname(file.path));
    log(`  ${idx + 1}. ${status} ${fileName.padEnd(25)} - ${file.consoleCount} statements (${file.lines} lines)`, color);
  });

  log('\n📈 Migration Estimates:', 'cyan');
  const remainingStatements = stats.fileStats
    .filter(f => !f.hasLogger)
    .reduce((sum, f) => sum + f.consoleCount, 0);
  
  const estimatedHours = Math.ceil(remainingStatements / 120); // ~120 statements per hour
  log(`  Remaining statements: ${remainingStatements}`);
  log(`  Estimated effort: ${estimatedHours} hours`, 'yellow');
  log(`  Avg per file: ${Math.ceil(remainingStatements / (stats.totalFiles - stats.filesWithLogger))} statements`);
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  log('\n🔄 Logger Migration Tool', 'bright');
  
  if (!command || command === 'help') {
    log('\nUsage:', 'cyan');
    log('  node scripts/migrate-logger.js analyze <file>   - Analyze a file');
    log('  node scripts/migrate-logger.js migrate <file> <name> - Get migration guide');
    log('  node scripts/migrate-logger.js stats            - Platform statistics');
    log('  node scripts/migrate-logger.js help             - Show this help\n');
    return;
  }

  switch (command) {
    case 'analyze':
      if (!args[1]) {
        log('Error: Please provide a file path', 'red');
        log('Usage: node scripts/migrate-logger.js analyze <file>', 'yellow');
        process.exit(1);
      }
      analyzeFile(args[1]);
      break;

    case 'migrate':
      if (!args[1] || !args[2]) {
        log('Error: Please provide file path and feature name', 'red');
        log('Usage: node scripts/migrate-logger.js migrate <file> <feature-name>', 'yellow');
        process.exit(1);
      }
      showMigrationGuide(args[1], args[2]);
      break;

    case 'stats':
      getStats();
      break;

    default:
      log(`Error: Unknown command: ${command}`, 'red');
      log('Run with "help" to see available commands', 'yellow');
      process.exit(1);
  }
}

main();
