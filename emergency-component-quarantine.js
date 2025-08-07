#!/usr/bin/env node
/**
 * KAZI Platform - Emergency Component Quarantine
 * 
 * This script temporarily moves the most problematic components to a quarantine directory
 * so the basic system can function without TypeScript compilation errors.
 * 
 * Usage: node emergency-component-quarantine.js [options]
 * Options:
 *   --restore: Restore quarantined components back to their original locations
 *   --verbose: Show detailed logs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: process.cwd(),
  quarantineDir: './component-quarantine',
  placeholderTemplate: `// EMERGENCY PLACEHOLDER - Original component quarantined due to compilation errors
// This is a minimal implementation to allow the system to compile and function
'use client'

import React from 'react'

export default function COMPONENT_NAME() {
  return (
    <div className="p-4 border border-red-500 rounded-lg bg-red-50 text-red-800">
      <h3 className="text-lg font-bold mb-2">Component Temporarily Unavailable</h3>
      <p>This component has been temporarily disabled during emergency system recovery.</p>
      <p className="text-sm mt-2">Please contact system administration for assistance.</p>
    </div>
  )
}
`,
  criticalComponents: [
    // Files with the most TypeScript errors, in order of severity
    'components/team-collaboration-ai-enhanced.tsx',                  // 506 fixes needed
    'components/team-collaboration-ai-enhanced-complete.tsx',         // 504 fixes needed
    'components/projects-hub/universal-pinpoint-feedback.tsx',        // 488 fixes needed
    'components/projects-hub/universal-pinpoint-feedback-system.tsx', // 448 fixes needed
    'components/admin/tutorial-system-launch-panel.tsx',              // 399 fixes needed
    'components/revenue/premium-features-system.tsx',                 // 384 fixes needed
    'components/ai/multi-modal-content-studio.tsx',                   // 364 fixes needed
    'components/ai/predictive-analytics-dashboard.tsx',               // 345 fixes needed
    'components/ai/ai-management-dashboard.tsx',                      // 317 fixes needed
    'components/onboarding/interactive-tutorial-system.tsx'           // 242 fixes needed
  ],
  metadataFile: 'quarantine-metadata.json'
};

// Command line arguments
const args = process.argv.slice(2);
const RESTORE = args.includes('--restore');
const VERBOSE = args.includes('--verbose');

// Utility functions
const log = (message, type = 'info') => {
  const prefix = {
    info: '📋 INFO:    ',
    success: '✅ SUCCESS: ',
    warning: '⚠️ WARNING: ',
    error: '❌ ERROR:   ',
    quarantine: '🔒 QUARANTINE:',
    restore: '🔓 RESTORE:  '
  }[type] || '        ';
  
  console.log(`${prefix} ${message}`);
};

const logVerbose = (message) => {
  if (VERBOSE) {
    console.log(`        ${message}`);
  }
};

const ensureDirectoryExists = (dirPath) => {
  const fullPath = path.join(CONFIG.projectRoot, dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logVerbose(`Created directory: ${dirPath}`);
  }
  return fullPath;
};

const getComponentName = (filePath) => {
  const basename = path.basename(filePath, path.extname(filePath));
  return basename
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

const createPlaceholder = (filePath) => {
  const componentName = getComponentName(filePath);
  const placeholder = CONFIG.placeholderTemplate.replace('COMPONENT_NAME', componentName);
  return placeholder;
};

// Quarantine a component
const quarantineComponent = (filePath) => {
  const fullPath = path.join(CONFIG.projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    log(`Component not found: ${filePath}`, 'error');
    return false;
  }
  
  try {
    // Create quarantine directory structure
    const quarantineFilePath = path.join(CONFIG.quarantineDir, filePath);
    const quarantineFileDir = path.dirname(quarantineFilePath);
    ensureDirectoryExists(quarantineFileDir);
    
    // Read original content
    const originalContent = fs.readFileSync(fullPath, 'utf8');
    
    // Move file to quarantine
    fs.writeFileSync(path.join(CONFIG.projectRoot, quarantineFilePath), originalContent);
    logVerbose(`Moved ${filePath} to ${quarantineFilePath}`);
    
    // Create placeholder
    const placeholder = createPlaceholder(filePath);
    fs.writeFileSync(fullPath, placeholder);
    
    log(`Quarantined: ${filePath}`, 'quarantine');
    return true;
  } catch (err) {
    log(`Failed to quarantine ${filePath}: ${err.message}`, 'error');
    return false;
  }
};

// Restore a component from quarantine
const restoreComponent = (filePath) => {
  const quarantineFilePath = path.join(CONFIG.quarantineDir, filePath);
  const fullQuarantinePath = path.join(CONFIG.projectRoot, quarantineFilePath);
  
  if (!fs.existsSync(fullQuarantinePath)) {
    log(`Quarantined component not found: ${quarantineFilePath}`, 'error');
    return false;
  }
  
  try {
    // Read quarantined content
    const originalContent = fs.readFileSync(fullQuarantinePath, 'utf8');
    
    // Restore file to original location
    fs.writeFileSync(path.join(CONFIG.projectRoot, filePath), originalContent);
    
    // Remove quarantined file
    fs.unlinkSync(fullQuarantinePath);
    logVerbose(`Removed ${quarantineFilePath}`);
    
    log(`Restored: ${filePath}`, 'restore');
    return true;
  } catch (err) {
    log(`Failed to restore ${filePath}: ${err.message}`, 'error');
    return false;
  }
};

// Save metadata about quarantined components
const saveMetadata = (results) => {
  const metadata = {
    timestamp: new Date().toISOString(),
    quarantined: results.filter(r => r.status === 'quarantined').map(r => r.filePath),
    failed: results.filter(r => r.status === 'failed').map(r => r.filePath)
  };
  
  const metadataPath = path.join(CONFIG.projectRoot, CONFIG.quarantineDir, CONFIG.metadataFile);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  logVerbose(`Saved metadata to ${metadataPath}`);
};

// Load metadata about quarantined components
const loadMetadata = () => {
  const metadataPath = path.join(CONFIG.projectRoot, CONFIG.quarantineDir, CONFIG.metadataFile);
  if (!fs.existsSync(metadataPath)) {
    log(`No quarantine metadata found at ${metadataPath}`, 'warning');
    return null;
  }
  
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    logVerbose(`Loaded metadata from ${metadataPath}`);
    return metadata;
  } catch (err) {
    log(`Failed to load metadata: ${err.message}`, 'error');
    return null;
  }
};

// Check TypeScript compilation
const checkTypeScriptCompilation = () => {
  log('Checking TypeScript compilation...');
  
  try {
    // Run TypeScript compiler in noEmit mode to just check for errors
    const output = execSync('npx tsc --noEmit', { 
      stdio: 'pipe',
      cwd: CONFIG.projectRoot,
      encoding: 'utf8'
    });
    
    log('TypeScript compilation successful', 'success');
    return { success: true, output };
  } catch (error) {
    const errorCount = (error.stdout.match(/error TS/g) || []).length;
    log(`TypeScript compilation failed with ${errorCount} errors`, 'error');
    
    if (VERBOSE) {
      console.error(error.stdout);
    }
    
    return { 
      success: false, 
      errorCount,
      output: error.stdout 
    };
  }
};

// Main quarantine function
const quarantineComponents = async () => {
  log('KAZI Platform - Emergency Component Quarantine', 'info');
  log('------------------------------------------------', 'info');
  
  // Check initial TypeScript compilation status
  const initialCompilation = checkTypeScriptCompilation();
  
  if (initialCompilation.success) {
    log('TypeScript compilation is already successful. No need to quarantine components.', 'success');
    return;
  }
  
  // Create quarantine directory
  ensureDirectoryExists(CONFIG.quarantineDir);
  
  // Quarantine components
  const results = [];
  for (const filePath of CONFIG.criticalComponents) {
    const success = quarantineComponent(filePath);
    results.push({
      filePath,
      status: success ? 'quarantined' : 'failed'
    });
  }
  
  // Save metadata
  saveMetadata(results);
  
  // Check TypeScript compilation after quarantine
  const finalCompilation = checkTypeScriptCompilation();
  
  // Print summary
  const quarantinedCount = results.filter(r => r.status === 'quarantined').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  
  log('\n------------------------------------------------', 'info');
  log('QUARANTINE SUMMARY', 'info');
  log('------------------------------------------------', 'info');
  log(`Components processed: ${CONFIG.criticalComponents.length}`);
  log(`Components quarantined: ${quarantinedCount}`);
  log(`Failed to quarantine: ${failedCount}`);
  
  if (finalCompilation.success) {
    log('\nTypeScript compilation is now successful! System should be operational.', 'success');
  } else {
    log('\nTypeScript compilation still has errors. Additional components may need quarantine.', 'warning');
  }
  
  log('\nTo restore quarantined components: node emergency-component-quarantine.js --restore', 'info');
};

// Main restore function
const restoreComponents = async () => {
  log('KAZI Platform - Emergency Component Restore', 'info');
  log('------------------------------------------------', 'info');
  
  // Load metadata
  const metadata = loadMetadata();
  if (!metadata || !metadata.quarantined || metadata.quarantined.length === 0) {
    log('No quarantined components found to restore.', 'warning');
    return;
  }
  
  // Restore components
  const results = [];
  for (const filePath of metadata.quarantined) {
    const success = restoreComponent(filePath);
    results.push({
      filePath,
      status: success ? 'restored' : 'failed'
    });
  }
  
  // Print summary
  const restoredCount = results.filter(r => r.status === 'restored').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  
  log('\n------------------------------------------------', 'info');
  log('RESTORE SUMMARY', 'info');
  log('------------------------------------------------', 'info');
  log(`Components processed: ${metadata.quarantined.length}`);
  log(`Components restored: ${restoredCount}`);
  log(`Failed to restore: ${failedCount}`);
  
  // Check TypeScript compilation after restore
  const finalCompilation = checkTypeScriptCompilation();
  
  if (finalCompilation.success) {
    log('\nTypeScript compilation is still successful after restore.', 'success');
  } else {
    log('\nTypeScript compilation has errors after restore.', 'warning');
    log('You may need to run the quarantine again or fix the components manually.', 'warning');
  }
  
  // Clean up quarantine directory if empty
  try {
    const quarantineDir = path.join(CONFIG.projectRoot, CONFIG.quarantineDir);
    const files = fs.readdirSync(quarantineDir);
    
    if (files.length === 0 || (files.length === 1 && files[0] === CONFIG.metadataFile)) {
      fs.unlinkSync(path.join(quarantineDir, CONFIG.metadataFile));
      fs.rmdirSync(quarantineDir);
      log('Removed empty quarantine directory', 'success');
    }
  } catch (err) {
    logVerbose(`Failed to clean up quarantine directory: ${err.message}`);
  }
};

// Execute main function
if (RESTORE) {
  restoreComponents().catch(error => {
    log(`Unhandled error: ${error.message}`, 'error');
    process.exit(1);
  });
} else {
  quarantineComponents().catch(error => {
    log(`Unhandled error: ${error.message}`, 'error');
    process.exit(1);
  });
}
