#!/usr/bin/env node

/**
 * Comprehensive Bug Hunter
 * Advanced bug detection and analysis system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting Comprehensive Bug Hunt...\n');

const bugs = [];
const warnings = [];
const fixes = [];

// Bug detection patterns
const bugPatterns = {
  // TypeScript/JavaScript errors
  syntaxErrors: [
    /SyntaxError/g,
    /TypeError/g,
    /ReferenceError/g,
    /Cannot read property/g,
    /Cannot read properties/g,
    /is not defined/g,
    /Expected/g,
    /Unexpected token/g
  ],
  
  // React/Next.js specific issues
  reactErrors: [
    /Hydration failed/g,
    /Text content does not match/g,
    /useEffect.*missing dependencies/g,
    /Hook.*cannot be called/g,
    /Each child.*should have a unique "key"/g,
    /Cannot update a component/g,
    /Warning: Failed prop type/g
  ],
  
  // Import/Export issues
  importErrors: [
    /Module not found/g,
    /Cannot resolve module/g,
    /Export.*does not exist/g,
    /Import.*does not exist/g,
    /Circular dependency/g
  ],
  
  // Performance issues
  performanceIssues: [
    /Warning.*performance/g,
    /Slow component/g,
    /Memory leak/g,
    /setState.*on unmounted component/g
  ],
  
  // Security issues
  securityIssues: [
    /dangerouslySetInnerHTML/g,
    /eval\(/g,
    /document\.write/g,
    /innerHTML.*=/g,
    /href.*javascript:/g
  ]
};

// File analysis function
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(__dirname, filePath);
    const fileIssues = [];
    
    // Check for syntax patterns
    Object.entries(bugPatterns).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          fileIssues.push({
            file: relativePath,
            category,
            pattern: pattern.source,
            matches: matches.length,
            severity: getSeverity(category)
          });
        }
      });
    });
    
    // Check for specific code issues
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for TODO/FIXME comments
      if (line.includes('TODO') || line.includes('FIXME') || line.includes('XXX')) {
        fileIssues.push({
          file: relativePath,
          line: lineNumber,
          category: 'todo',
          issue: line.trim(),
          severity: 'low'
        });
      }
      
      // Check for console statements in production code
      if (line.includes('console.log') || line.includes('console.error')) {
        fileIssues.push({
          file: relativePath,
          line: lineNumber,
          category: 'console',
          issue: 'Console statement found',
          severity: 'medium'
        });
      }
      
      // Check for hardcoded URLs
      if (line.includes('http://') || line.includes('https://')) {
        const urlMatch = line.match(/(https?:\/\/[^\s'"]+)/);
        if (urlMatch && !urlMatch[1].includes('localhost')) {
          fileIssues.push({
            file: relativePath,
            line: lineNumber,
            category: 'hardcoded-url',
            issue: `Hardcoded URL: ${urlMatch[1]}`,
            severity: 'medium'
          });
        }
      }
      
      // Check for missing error handling
      if (line.includes('await ') && !content.includes('try') && !content.includes('catch')) {
        fileIssues.push({
          file: relativePath,
          line: lineNumber,
          category: 'error-handling',
          issue: 'Async operation without error handling',
          severity: 'high'
        });
      }
    });
    
    return fileIssues;
    
  } catch (error) {
    return [{
      file: filePath,
      category: 'file-error',
      issue: `Cannot analyze file: ${error.message}`,
      severity: 'high'
    }];
  }
}

function getSeverity(category) {
  const severityMap = {
    syntaxErrors: 'critical',
    reactErrors: 'high',
    importErrors: 'high',
    performanceIssues: 'medium',
    securityIssues: 'critical'
  };
  return severityMap[category] || 'low';
}

// Scan all relevant files
function scanFiles() {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const excludePaths = ['node_modules', '.next', 'dist', 'build'];
  
  function walkDir(dir) {
    const files = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !excludePaths.includes(entry.name)) {
          files.push(...walkDir(fullPath));
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      console.log(`Cannot scan directory ${dir}: ${error.message}`);
    }
    
    return files;
  }
  
  return walkDir(__dirname);
}

// Check TypeScript compilation
function checkTypeScript() {
  console.log('🔍 Checking TypeScript compilation...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return [];
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.message;
    console.log('❌ TypeScript compilation errors found');
    
    // Parse TypeScript errors
    const errors = output.split('\n').filter(line => line.includes('error TS'));
    return errors.map(error => ({
      category: 'typescript',
      issue: error.trim(),
      severity: 'high'
    }));
  }
}

// Check Next.js specific issues
function checkNextJS() {
  console.log('🔍 Checking Next.js configuration...');
  const issues = [];
  
  // Check next.config.js
  const nextConfigPath = path.join(__dirname, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const config = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check for common issues
    if (!config.includes('experimental')) {
      issues.push({
        file: 'next.config.js',
        category: 'nextjs-config',
        issue: 'Missing experimental configuration',
        severity: 'low'
      });
    }
  }
  
  // Check for proper page structure
  const appDir = path.join(__dirname, 'app');
  if (fs.existsSync(appDir)) {
    const layoutPath = path.join(appDir, 'layout.tsx');
    if (!fs.existsSync(layoutPath)) {
      issues.push({
        file: 'app/layout.tsx',
        category: 'nextjs-structure',
        issue: 'Missing root layout file',
        severity: 'critical'
      });
    }
  }
  
  return issues;
}

// Check dependencies
function checkDependencies() {
  console.log('🔍 Checking dependencies...');
  const issues = [];
  
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for security vulnerabilities
    try {
      const auditOutput = execSync('npm audit --audit-level=high --json', { stdio: 'pipe' });
      const auditData = JSON.parse(auditOutput.toString());
      
      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([pkg, vuln]) => {
          issues.push({
            category: 'security',
            issue: `Security vulnerability in ${pkg}: ${vuln.title}`,
            severity: vuln.severity
          });
        });
      }
    } catch (error) {
      // npm audit might fail, but we continue
    }
    
    // Check for missing peer dependencies
    const peerDepsPath = path.join(__dirname, 'node_modules/.pnpm');
    if (fs.existsSync(peerDepsPath)) {
      // Check for common peer dependency issues
      const commonPeerDeps = ['react', 'react-dom', 'next'];
      commonPeerDeps.forEach(dep => {
        if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
          issues.push({
            category: 'dependencies',
            issue: `Missing peer dependency: ${dep}`,
            severity: 'medium'
          });
        }
      });
    }
    
  } catch (error) {
    issues.push({
      category: 'dependencies',
      issue: `Cannot check dependencies: ${error.message}`,
      severity: 'medium'
    });
  }
  
  return issues;
}

// Check environment variables
function checkEnvironment() {
  console.log('🔍 Checking environment variables...');
  const issues = [];
  
  const envFiles = ['.env', '.env.local', '.env.example'];
  const envVars = new Set();
  
  envFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key] = line.split('=');
          envVars.add(key.trim());
        }
      });
    }
  });
  
  // Check for required environment variables
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (!envVars.has(varName) && !process.env[varName]) {
      issues.push({
        category: 'environment',
        issue: `Missing required environment variable: ${varName}`,
        severity: 'high'
      });
    }
  });
  
  return issues;
}

// Main analysis
async function runAnalysis() {
  console.log('🚀 Starting comprehensive bug analysis...\n');
  
  // 1. Scan all files
  console.log('📁 Scanning files...');
  const files = scanFiles();
  console.log(`Found ${files.length} files to analyze\n`);
  
  let allIssues = [];
  
  // 2. Analyze each file
  files.slice(0, 50).forEach(file => { // Limit to first 50 files for performance
    const issues = analyzeFile(file);
    allIssues.push(...issues);
  });
  
  // 3. Check TypeScript
  const tsIssues = checkTypeScript();
  allIssues.push(...tsIssues);
  
  // 4. Check Next.js
  const nextIssues = checkNextJS();
  allIssues.push(...nextIssues);
  
  // 5. Check dependencies
  const depIssues = checkDependencies();
  allIssues.push(...depIssues);
  
  // 6. Check environment
  const envIssues = checkEnvironment();
  allIssues.push(...envIssues);
  
  // Categorize issues
  const critical = allIssues.filter(i => i.severity === 'critical');
  const high = allIssues.filter(i => i.severity === 'high');
  const medium = allIssues.filter(i => i.severity === 'medium');
  const low = allIssues.filter(i => i.severity === 'low');
  
  console.log('\n📊 Bug Analysis Summary:');
  console.log(`Critical: ${critical.length}`);
  console.log(`High: ${high.length}`);
  console.log(`Medium: ${medium.length}`);
  console.log(`Low: ${low.length}`);
  console.log(`Total: ${allIssues.length}`);
  
  // Show top issues
  console.log('\n🔥 Top Critical Issues:');
  critical.slice(0, 10).forEach(issue => {
    console.log(`  • ${issue.issue || issue.pattern} (${issue.file || 'Unknown'})`);
  });
  
  console.log('\n⚠️  Top High Priority Issues:');
  high.slice(0, 10).forEach(issue => {
    console.log(`  • ${issue.issue || issue.pattern} (${issue.file || 'Unknown'})`);
  });
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      totalIssues: allIssues.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length
    },
    issues: allIssues
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'comprehensive-bug-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Comprehensive bug analysis complete!');
  console.log('📄 Detailed report saved to: comprehensive-bug-report.json');
  
  return allIssues;
}

// Run the analysis
runAnalysis().catch(console.error);