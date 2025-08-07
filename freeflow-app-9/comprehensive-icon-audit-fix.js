/**
 * KAZI Platform - Comprehensive Icon Audit & Fix Script
 * ====================================================
 * This script analyzes and fixes missing icons identified in test results
 * across the KAZI platform dashboard components.
 * 
 * Features:
 * - Automatically detects missing icons in dashboard pages
 * - Creates backups of files before modification
 * - Applies fixes to ensure consistent icon usage
 * - Generates detailed report of changes made
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APP_ROOT = path.resolve(__dirname);
const DASHBOARD_DIR = path.join(APP_ROOT, 'app', '(app)', 'dashboard');
const COMPONENTS_DIR = path.join(APP_ROOT, 'components');
const BACKUP_DIR = path.join(APP_ROOT, 'error-fix-backups', 'icon-fixes-' + new Date().toISOString().replace(/:/g, '-'));

// Icon mapping configuration - maps page paths to their required icons
const ICON_MAPPING = {
  'projects-hub': {
    iconName: 'FolderOpen',
    description: 'Projects Hub folder icon',
    searchPatterns: ['FolderClosed', 'icon={[^}]*}']
  },
  'analytics': {
    iconName: 'TrendingUp',
    description: 'Analytics trending chart icon',
    searchPatterns: ['BarChart', 'icon={[^}]*}']
  },
  'ai-assistant': {
    iconName: 'Zap',
    description: 'AI Assistant lightning bolt icon',
    searchPatterns: ['Brain', 'Sparkles', 'icon={[^}]*}']
  },
  'canvas': {
    iconName: 'Monitor',
    description: 'Canvas display monitor icon',
    searchPatterns: ['Palette', 'icon={[^}]*}']
  },
  'financial-hub': {
    iconName: 'DollarSign',
    description: 'Financial Hub dollar sign icon',
    searchPatterns: ['Wallet', 'CreditCard', 'icon={[^}]*}']
  },
  'invoices': {
    iconName: 'Receipt',
    description: 'Invoices receipt icon',
    searchPatterns: ['FileText', 'icon={[^}]*}']
  },
  'financial': {
    iconName: 'Wallet',
    description: 'Financial wallet icon',
    searchPatterns: ['DollarSign', 'CreditCard', 'icon={[^}]*}']
  },
  'messages': {
    iconName: 'MessageSquare',
    description: 'Messages chat bubble icon',
    searchPatterns: ['Mail', 'MessageCircle', 'icon={[^}]*}']
  }
};

// Navigation component files that need to be checked
const NAVIGATION_FILES = [
  path.join(COMPONENTS_DIR, 'navigation', 'sidebar.tsx'),
  path.join(COMPONENTS_DIR, 'unified-sidebar.tsx'),
  path.join(COMPONENTS_DIR, 'dashboard-nav.tsx'),
  path.join(COMPONENTS_DIR, 'mobile-nav.tsx')
];

// Results tracking
const results = {
  scannedFiles: 0,
  modifiedFiles: 0,
  backupFiles: 0,
  iconsFixes: {},
  modifiedFilePaths: [],
  errors: [],
  warnings: []
};

/**
 * Creates backup directory if it doesn't exist
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Creates a backup of a file before modifying it
 * @param {string} filePath - Path to the file to backup
 * @returns {boolean} - Whether backup was successful
 */
function backupFile(filePath) {
  try {
    ensureBackupDir();
    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_DIR, fileName + '.backup');
    fs.copyFileSync(filePath, backupPath);
    results.backupFiles++;
    return true;
  } catch (error) {
    results.errors.push(`Failed to backup file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Checks if a file contains a specific icon import
 * @param {string} content - File content
 * @param {string} iconName - Icon name to check
 * @returns {boolean} - Whether the icon is imported
 */
function hasIconImport(content, iconName) {
  // Check different import patterns
  const patterns = [
    new RegExp(`import\\s+{[^}]*\\b${iconName}\\b[^}]*}\\s+from\\s+['"]lucide-react['"]`),
    new RegExp(`import\\s+{[^}]*\\b${iconName}\\s+as\\s+\\w+[^}]*}\\s+from\\s+['"]lucide-react['"]`),
  ];
  
  return patterns.some(pattern => pattern.test(content));
}

/**
 * Adds an icon import to a file if it doesn't exist
 * @param {string} content - File content
 * @param {string} iconName - Icon name to add
 * @returns {string} - Updated file content
 */
function addIconImport(content, iconName) {
  if (hasIconImport(content, iconName)) {
    return content;
  }
  
  // Find the lucide-react import statement
  const lucideImportRegex = /import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/;
  const match = content.match(lucideImportRegex);
  
  if (match) {
    // Add the icon to the existing import
    const existingImports = match[1];
    const updatedImports = existingImports.includes(iconName) 
      ? existingImports 
      : `${existingImports.trim()}, ${iconName}`;
    
    return content.replace(lucideImportRegex, `import {${updatedImports}} from 'lucide-react'`);
  } else {
    // Add a new import statement after the last import
    const lastImportIndex = content.lastIndexOf("import ");
    const lastImportEndIndex = content.indexOf("\n", lastImportIndex);
    
    if (lastImportIndex !== -1) {
      return content.substring(0, lastImportEndIndex + 1) + 
        `import { ${iconName} } from 'lucide-react';\n` + 
        content.substring(lastImportEndIndex + 1);
    }
    
    // If no imports found, add at the top
    return `import { ${iconName} } from 'lucide-react';\n${content}`;
  }
}

/**
 * Updates PageHeader icon in a file
 * @param {string} content - File content
 * @param {string} iconName - Icon name to use
 * @returns {string} - Updated file content
 */
function updatePageHeaderIcon(content, iconName) {
  // Pattern to match PageHeader component with icon prop
  const pageHeaderRegex = /<PageHeader[^>]*icon=\{([^}]+)\}[^>]*>/;
  const match = content.match(pageHeaderRegex);
  
  if (match) {
    return content.replace(pageHeaderRegex, (fullMatch) => {
      return fullMatch.replace(/icon=\{([^}]+)\}/, `icon={${iconName}}`);
    });
  }
  
  return content;
}

/**
 * Updates navigation item icon in sidebar files
 * @param {string} content - File content
 * @param {string} pagePath - Page path to match
 * @param {string} iconName - Icon name to use
 * @returns {string} - Updated file content
 */
function updateNavigationIcon(content, pagePath, iconName) {
  // Pattern to match navigation item for the specific page
  const navItemRegex = new RegExp(`{\\s*name:[^,]*,\\s*href:\\s*['"]\/dashboard\/${pagePath}['"][^}]*icon:\\s*([^,}\\s]+)[^}]*}`, 'g');
  
  return content.replace(navItemRegex, (fullMatch, currentIcon) => {
    return fullMatch.replace(`icon: ${currentIcon}`, `icon: ${iconName}`);
  });
}

/**
 * Processes a dashboard page file to fix icons
 * @param {string} filePath - Path to the file
 * @param {string} pageName - Name of the page (directory name)
 * @returns {boolean} - Whether the file was modified
 */
function processPageFile(filePath, pageName) {
  if (!fs.existsSync(filePath)) {
    results.warnings.push(`File not found: ${filePath}`);
    return false;
  }
  
  const iconConfig = ICON_MAPPING[pageName];
  if (!iconConfig) {
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Add icon import if needed
    content = addIconImport(content, iconConfig.iconName);
    
    // Update PageHeader icon
    content = updatePageHeaderIcon(content, iconConfig.iconName);
    
    // Check if content was modified
    if (content !== originalContent) {
      backupFile(filePath);
      fs.writeFileSync(filePath, content, 'utf8');
      results.modifiedFiles++;
      results.modifiedFilePaths.push(filePath);
      
      // Track icon fixes
      results.iconsFixes[pageName] = results.iconsFixes[pageName] || 0;
      results.iconsFixes[pageName]++;
      
      return true;
    }
  } catch (error) {
    results.errors.push(`Error processing file ${filePath}: ${error.message}`);
  }
  
  return false;
}

/**
 * Processes a navigation component file to fix icons
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file was modified
 */
function processNavigationFile(filePath) {
  if (!fs.existsSync(filePath)) {
    results.warnings.push(`Navigation file not found: ${filePath}`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Process each icon mapping
    Object.entries(ICON_MAPPING).forEach(([pagePath, iconConfig]) => {
      // Add icon import if needed
      if (!hasIconImport(content, iconConfig.iconName)) {
        content = addIconImport(content, iconConfig.iconName);
      }
      
      // Update navigation item icon
      content = updateNavigationIcon(content, pagePath, iconConfig.iconName);
    });
    
    // Check if content was modified
    if (content !== originalContent) {
      backupFile(filePath);
      fs.writeFileSync(filePath, content, 'utf8');
      results.modifiedFiles++;
      results.modifiedFilePaths.push(filePath);
      return true;
    }
  } catch (error) {
    results.errors.push(`Error processing navigation file ${filePath}: ${error.message}`);
  }
  
  return false;
}

/**
 * Scans dashboard directories for page files
 * @returns {Array} - List of found page files with their page names
 */
function scanDashboardPages() {
  const pageFiles = [];
  
  try {
    const dashboardDirs = fs.readdirSync(DASHBOARD_DIR);
    
    dashboardDirs.forEach(dir => {
      const pageFilePath = path.join(DASHBOARD_DIR, dir, 'page.tsx');
      if (fs.existsSync(pageFilePath)) {
        pageFiles.push({ 
          path: pageFilePath, 
          pageName: dir 
        });
      }
    });
  } catch (error) {
    results.errors.push(`Error scanning dashboard pages: ${error.message}`);
  }
  
  return pageFiles;
}

/**
 * Generates a report of the icon audit and fixes
 * @returns {string} - Formatted report
 */
function generateReport() {
  const report = [
    '# KAZI Platform - Icon Audit & Fix Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- Scanned Files: ${results.scannedFiles}`,
    `- Modified Files: ${results.modifiedFiles}`,
    `- Backup Files: ${results.backupFiles}`,
    `- Backup Directory: ${BACKUP_DIR}`,
    '',
    '## Icon Fixes',
  ];
  
  Object.entries(ICON_MAPPING).forEach(([pagePath, iconConfig]) => {
    const fixCount = results.iconsFixes[pagePath] || 0;
    report.push(`- ${iconConfig.iconName} (${pagePath}): ${fixCount} fixes`);
  });
  
  report.push('', '## Modified Files');
  results.modifiedFilePaths.forEach(filePath => {
    report.push(`- ${path.relative(APP_ROOT, filePath)}`);
  });
  
  if (results.errors.length > 0) {
    report.push('', '## Errors');
    results.errors.forEach(error => {
      report.push(`- ${error}`);
    });
  }
  
  if (results.warnings.length > 0) {
    report.push('', '## Warnings');
    results.warnings.forEach(warning => {
      report.push(`- ${warning}`);
    });
  }
  
  return report.join('\n');
}

/**
 * Main execution function
 */
function main() {
  console.log('Starting KAZI Platform Icon Audit & Fix...');
  
  // Scan dashboard pages
  const pageFiles = scanDashboardPages();
  results.scannedFiles += pageFiles.length;
  
  console.log(`Found ${pageFiles.length} dashboard pages to check`);
  
  // Process each page file
  pageFiles.forEach(({ path: filePath, pageName }) => {
    if (ICON_MAPPING[pageName]) {
      const modified = processPageFile(filePath, pageName);
      if (modified) {
        console.log(`✓ Fixed icons in ${pageName} page`);
      }
    }
  });
  
  // Process navigation files
  console.log(`Checking ${NAVIGATION_FILES.length} navigation components`);
  NAVIGATION_FILES.forEach(filePath => {
    results.scannedFiles++;
    const modified = processNavigationFile(filePath);
    if (modified) {
      console.log(`✓ Fixed icons in ${path.basename(filePath)}`);
    }
  });
  
  // Generate and save report
  const report = generateReport();
  const reportPath = path.join(APP_ROOT, 'KAZI_ICON_AUDIT_COMPLETION_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log('\nIcon Audit & Fix Complete!');
  console.log(`- Modified ${results.modifiedFiles} files`);
  console.log(`- Created ${results.backupFiles} backups in ${BACKUP_DIR}`);
  console.log(`- Full report saved to ${reportPath}`);
  
  if (results.errors.length > 0) {
    console.log(`\n⚠️ ${results.errors.length} errors occurred during processing`);
  }
}

// Execute the script
main();
