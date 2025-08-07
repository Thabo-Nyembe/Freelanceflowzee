#!/usr/bin/env node
/**
 * KAZI Platform - Emergency System Recovery Script
 * 
 * This script diagnoses and fixes critical 500 Internal Server Error issues
 * affecting the KAZI platform after navigation component changes.
 * 
 * Usage: node emergency-system-recovery.js [options]
 * Options:
 *   --analyze-only: Only analyze issues without making changes
 *   --rollback: Immediately roll back navigation component changes
 *   --fix: Attempt automatic fixes for common issues
 *   --verbose: Show detailed logs
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

// Configuration
const CONFIG = {
  componentsDir: './components',
  navigationDir: './components/navigation',
  appDir: './app',
  backupDir: './recovery-backups',
  criticalComponents: [
    'components/unified-sidebar.tsx',
    'components/navigation/sidebar.tsx'
  ],
  dashboardPages: [
    'app/(app)/dashboard/page.tsx',
    'app/(app)/dashboard/layout.tsx',
    'app/(app)/dashboard/dashboard-layout-client.tsx'
  ],
  testRoutes: [
    '/dashboard',
    '/dashboard/projects-hub',
    '/dashboard/ai-assistant',
    '/dashboard/video-studio'
  ]
};

// Command line arguments
const args = process.argv.slice(2);
const ANALYZE_ONLY = args.includes('--analyze-only');
const ROLLBACK = args.includes('--rollback');
const FIX = args.includes('--fix');
const VERBOSE = args.includes('--verbose');

// Utility functions
const log = (message, type = 'info') => {
  const prefix = {
    info: '📋 INFO:    ',
    success: '✅ SUCCESS: ',
    warning: '⚠️ WARNING: ',
    error: '❌ ERROR:   ',
    critical: '🚨 CRITICAL:'
  }[type] || '        ';
  
  console.log(`${prefix} ${message}`);
};

const logVerbose = (message) => {
  if (VERBOSE) {
    console.log(`        ${message}`);
  }
};

const createBackup = (filePath) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  const backupDir = CONFIG.backupDir;
  
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

const restoreBackup = (backupPath, targetPath) => {
  try {
    fs.copyFileSync(backupPath, targetPath);
    log(`Restored ${targetPath} from backup`, 'success');
    return true;
  } catch (err) {
    log(`Failed to restore backup for ${targetPath}: ${err.message}`, 'error');
    return false;
  }
};

// Analysis functions
const checkBuildStatus = async () => {
  log('Checking build status...');
  
  try {
    // Run a type check without full build
    execSync('npx tsc --noEmit', { stdio: VERBOSE ? 'inherit' : 'pipe' });
    log('TypeScript compilation check passed', 'success');
  } catch (error) {
    log('TypeScript compilation check failed', 'error');
    logVerbose(error.toString());
    return {
      status: 'failed',
      error: error.toString(),
      typeErrors: true
    };
  }
  
  try {
    // Try a development build which is faster
    execSync('npx next build --no-lint', { stdio: VERBOSE ? 'inherit' : 'pipe' });
    log('Next.js build successful', 'success');
    return {
      status: 'success',
      buildErrors: false
    };
  } catch (error) {
    log('Next.js build failed', 'error');
    logVerbose(error.toString());
    return {
      status: 'failed',
      error: error.toString(),
      buildErrors: true
    };
  }
};

const checkComponentErrors = async (componentPath) => {
  log(`Analyzing component: ${componentPath}`);
  
  if (!fs.existsSync(componentPath)) {
    log(`Component file not found: ${componentPath}`, 'error');
    return {
      status: 'error',
      message: 'File not found',
      componentPath
    };
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for common issues
  const issues = [];
  
  // Check for icon imports
  const iconImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
  if (iconImportMatch) {
    const importedIcons = iconImportMatch[1].split(',').map(i => i.trim());
    logVerbose(`Found ${importedIcons.length} icon imports`);
    
    // Check if icons are used
    importedIcons.forEach(icon => {
      const iconName = icon.trim();
      if (!content.includes(`<${iconName}`)) {
        issues.push({
          type: 'unused-import',
          message: `Unused icon import: ${iconName}`,
          severity: 'warning'
        });
      }
    });
  } else {
    if (content.includes('lucide-react')) {
      issues.push({
        type: 'malformed-import',
        message: 'Potentially malformed icon import from lucide-react',
        severity: 'error'
      });
    }
  }
  
  // Check for icon usage without import
  const iconUsageRegex = /<([A-Z][a-zA-Z0-9]*)\s+/g;
  let match;
  const usedComponents = new Set();
  
  while ((match = iconUsageRegex.exec(content)) !== null) {
    usedComponents.add(match[1]);
  }
  
  // Check for item.icon usage
  if (content.includes('item.icon')) {
    logVerbose('Component uses dynamic icons via item.icon');
  }
  
  // Check for TypeScript interface issues
  if (content.includes('interface') && content.includes('unknown')) {
    logVerbose('Component uses "unknown" type - checking for potential issues');
    
    if (content.includes('icon: unknown') && content.includes('<item.icon')) {
      issues.push({
        type: 'type-safety',
        message: 'Using item.icon with unknown type may cause rendering issues',
        severity: 'warning',
        suggestion: 'Consider using React.ComponentType<any> or React.ElementType instead of unknown'
      });
    }
  }
  
  return {
    status: issues.length > 0 ? 'issues-found' : 'ok',
    issues,
    componentPath
  };
};

const testPageLoading = async (route) => {
  log(`Testing route: ${route}`);
  
  return new Promise((resolve) => {
    const server = spawn('npx', ['next', 'dev', '-p', '3333'], {
      stdio: 'pipe'
    });
    
    let serverOutput = '';
    let serverStarted = false;
    let testCompleted = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      
      if (output.includes('ready') && !serverStarted) {
        serverStarted = true;
        logVerbose('Development server started');
        
        // Wait a bit for the server to be fully ready
        setTimeout(() => {
          try {
            const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3333${route}`);
            const statusCode = result.toString().trim();
            
            if (statusCode === '200') {
              log(`Route ${route} loaded successfully (200 OK)`, 'success');
              resolve({
                route,
                status: 'success',
                statusCode: 200
              });
            } else {
              log(`Route ${route} failed with status code ${statusCode}`, 'error');
              resolve({
                route,
                status: 'error',
                statusCode: parseInt(statusCode, 10),
                error: `HTTP ${statusCode}`
              });
            }
          } catch (error) {
            log(`Failed to test route ${route}: ${error.message}`, 'error');
            resolve({
              route,
              status: 'error',
              error: error.message
            });
          } finally {
            testCompleted = true;
            server.kill();
          }
        }, 5000);
      }
    });
    
    server.stderr.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      
      if (output.includes('Error') && !testCompleted) {
        log(`Server error when testing ${route}: ${output}`, 'error');
        testCompleted = true;
        server.kill();
        resolve({
          route,
          status: 'error',
          error: output
        });
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!testCompleted) {
        log(`Test for route ${route} timed out`, 'warning');
        server.kill();
        resolve({
          route,
          status: 'timeout',
          error: 'Test timed out'
        });
      }
    }, 30000);
  });
};

const findMissingIconImports = (content) => {
  // Extract all icon components being used
  const iconUsageRegex = /<([A-Z][a-zA-Z0-9]*)\s+/g;
  const usedIcons = new Set();
  let match;
  
  while ((match = iconUsageRegex.exec(content)) !== null) {
    usedIcons.add(match[1]);
  }
  
  // Extract imported icons
  const iconImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
  const importedIcons = new Set();
  
  if (iconImportMatch) {
    iconImportMatch[1].split(',').map(i => i.trim()).forEach(icon => {
      importedIcons.add(icon);
    });
  }
  
  // Find icons used but not imported
  const missingIcons = [...usedIcons].filter(icon => {
    // Skip if it's likely not an icon (components usually start with uppercase)
    if (!/^[A-Z]/.test(icon)) return false;
    
    // Skip common React components
    if (['Fragment', 'Suspense', 'ErrorBoundary'].includes(icon)) return false;
    
    return !importedIcons.has(icon);
  });
  
  return missingIcons;
};

const fixIconImports = (filePath) => {
  log(`Attempting to fix icon imports in ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const missingIcons = findMissingIconImports(content);
    
    if (missingIcons.length === 0) {
      log(`No missing icon imports found in ${filePath}`, 'success');
      return { status: 'success', fixed: false };
    }
    
    log(`Found ${missingIcons.length} missing icon imports: ${missingIcons.join(', ')}`, 'warning');
    
    // Create backup
    createBackup(filePath);
    
    // Fix the imports
    let updatedContent = content;
    
    // Check if there's already a lucide-react import
    const iconImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
    
    if (iconImportMatch) {
      // Add to existing import
      const currentImport = iconImportMatch[0];
      const importContent = iconImportMatch[1];
      const newImportContent = importContent + ', ' + missingIcons.join(', ');
      const newImport = currentImport.replace(importContent, newImportContent);
      
      updatedContent = content.replace(currentImport, newImport);
    } else {
      // Add new import statement
      const importStatement = `import { ${missingIcons.join(', ')} } from 'lucide-react'`;
      
      // Find a good place to insert the import
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Try to find the last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        }
      }
      
      lines.splice(insertIndex, 0, importStatement);
      updatedContent = lines.join('\n');
    }
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    log(`Fixed missing icon imports in ${filePath}`, 'success');
    
    return {
      status: 'success',
      fixed: true,
      missingIcons
    };
  } catch (err) {
    log(`Failed to fix icon imports in ${filePath}: ${err.message}`, 'error');
    return {
      status: 'error',
      error: err.message
    };
  }
};

const rollbackNavigationChanges = async () => {
  log('Rolling back navigation component changes...', 'warning');
  
  const backupDir = CONFIG.backupDir;
  if (!fs.existsSync(backupDir)) {
    log(`No backup directory found at ${backupDir}`, 'error');
    return false;
  }
  
  // Find the most recent backups for each critical component
  const backups = fs.readdirSync(backupDir);
  const latestBackups = {};
  
  CONFIG.criticalComponents.forEach(component => {
    const componentName = path.basename(component);
    const componentBackups = backups.filter(b => b.startsWith(componentName + '.'));
    
    if (componentBackups.length > 0) {
      // Sort by timestamp (descending)
      componentBackups.sort().reverse();
      latestBackups[component] = path.join(backupDir, componentBackups[0]);
    }
  });
  
  if (Object.keys(latestBackups).length === 0) {
    log('No backups found for critical components', 'error');
    return false;
  }
  
  // Restore backups
  let success = true;
  for (const [component, backup] of Object.entries(latestBackups)) {
    const result = restoreBackup(backup, component);
    if (!result) {
      success = false;
    }
  }
  
  return success;
};

const generateErrorReport = (results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '');
  const reportPath = `emergency-recovery-report-${timestamp}.json`;
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
    log(`Error report generated: ${reportPath}`, 'success');
    return reportPath;
  } catch (err) {
    log(`Failed to generate error report: ${err.message}`, 'error');
    return null;
  }
};

// Main execution function
const main = async () => {
  log('KAZI Platform - Emergency System Recovery Script', 'info');
  log('------------------------------------------------', 'info');
  
  // Create results object to track all findings
  const results = {
    timestamp: new Date().toISOString(),
    buildStatus: null,
    componentAnalysis: {},
    routeTests: {},
    fixes: [],
    recommendations: []
  };
  
  // If immediate rollback is requested
  if (ROLLBACK) {
    log('Immediate rollback requested', 'warning');
    const rollbackSuccess = await rollbackNavigationChanges();
    
    if (rollbackSuccess) {
      log('Navigation components successfully rolled back to previous version', 'success');
      results.recommendations.push({
        priority: 'high',
        message: 'Navigation components were rolled back to previous working version'
      });
    } else {
      log('Failed to roll back navigation components', 'critical');
      results.recommendations.push({
        priority: 'critical',
        message: 'Automatic rollback failed - manual intervention required'
      });
    }
    
    generateErrorReport(results);
    return;
  }
  
  // 1. Check build status
  results.buildStatus = await checkBuildStatus();
  
  // 2. Analyze critical components
  for (const component of CONFIG.criticalComponents) {
    results.componentAnalysis[component] = await checkComponentErrors(component);
  }
  
  // 3. Test specific routes if not in analyze-only mode
  if (!ANALYZE_ONLY) {
    log('Testing critical routes...');
    
    for (const route of CONFIG.testRoutes) {
      results.routeTests[route] = await testPageLoading(route);
    }
  }
  
  // 4. Attempt fixes if requested
  if (FIX) {
    log('Attempting to fix identified issues...');
    
    // Fix missing icon imports
    for (const component of CONFIG.criticalComponents) {
      if (results.componentAnalysis[component]?.issues?.some(i => i.type === 'malformed-import')) {
        const fixResult = fixIconImports(component);
        results.fixes.push({
          component,
          fixType: 'icon-imports',
          result: fixResult
        });
      }
    }
    
    // Re-check build after fixes
    log('Re-checking build after applying fixes...');
    results.buildStatusAfterFix = await checkBuildStatus();
  }
  
  // 5. Generate recommendations
  const criticalIssues = Object.values(results.componentAnalysis)
    .flatMap(analysis => analysis.issues || [])
    .filter(issue => issue.severity === 'error' || issue.severity === 'critical');
  
  const routeErrors = Object.values(results.routeTests)
    .filter(test => test.status === 'error');
  
  if (criticalIssues.length > 0) {
    results.recommendations.push({
      priority: 'critical',
      message: `Found ${criticalIssues.length} critical component issues that need immediate attention`
    });
  }
  
  if (routeErrors.length > 0) {
    results.recommendations.push({
      priority: 'critical',
      message: `${routeErrors.length}/${CONFIG.testRoutes.length} routes are returning errors`
    });
  }
  
  if (results.buildStatus.status === 'failed') {
    results.recommendations.push({
      priority: 'high',
      message: 'Build is failing - consider rolling back recent changes'
    });
  }
  
  // 6. Generate report
  const reportPath = generateErrorReport(results);
  
  // 7. Print summary
  log('\n------------------------------------------------', 'info');
  log('RECOVERY SUMMARY', 'info');
  log('------------------------------------------------', 'info');
  
  log(`Build Status: ${results.buildStatus.status === 'success' ? 'SUCCESS ✅' : 'FAILED ❌'}`);
  
  const componentIssueCount = Object.values(results.componentAnalysis)
    .reduce((count, analysis) => count + (analysis.issues?.length || 0), 0);
  
  log(`Component Issues: ${componentIssueCount === 0 ? 'None ✅' : `${componentIssueCount} issues found ❌`}`);
  
  if (!ANALYZE_ONLY) {
    const routeSuccessCount = Object.values(results.routeTests)
      .filter(test => test.status === 'success').length;
    
    log(`Route Tests: ${routeSuccessCount}/${CONFIG.testRoutes.length} successful`);
  }
  
  log('\nRECOMMENDATIONS:');
  results.recommendations.forEach(rec => {
    const prefix = rec.priority === 'critical' ? '🚨' : rec.priority === 'high' ? '⚠️' : 'ℹ️';
    log(`${prefix} ${rec.message}`);
  });
  
  if (componentIssueCount > 0 || (results.buildStatus.status === 'failed')) {
    log('\nRECOVERY ACTIONS:');
    log('1. To roll back navigation changes: node emergency-system-recovery.js --rollback');
    log('2. To attempt automatic fixes: node emergency-system-recovery.js --fix');
    log(`3. Review detailed report: ${reportPath}`);
  }
};

// Execute main function
main().catch(error => {
  log(`Unhandled error in recovery script: ${error.message}`, 'critical');
  console.error(error);
  process.exit(1);
});
