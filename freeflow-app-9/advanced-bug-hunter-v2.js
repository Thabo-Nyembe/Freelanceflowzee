#!/usr/bin/env node

/**
 * Advanced Bug Hunter V2
 * Deep performance, security, and optimization analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Advanced Bug Hunter V2 - Deep Analysis Started...\n');

const advancedIssues = [];
const optimizations = [];
const securityFindings = [];

// Performance Analysis
function analyzePerformance() {
  console.log('⚡ Running Performance Analysis...');
  
  const performanceIssues = [];
  
  // Check for large bundle imports
  const checkBundleImports = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];
      
      // Check for entire library imports
      const heavyImports = [
        /import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]/g,
        /import\s+.*\s+from\s+['"]moment['"]/g,
        /import\s+.*\s+from\s+['"]@material-ui\/core['"]/g,
        /import\s+.*\s+from\s+['"]antd['"]/g
      ];
      
      heavyImports.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            file: filePath,
            type: 'heavy-import',
            issue: `Heavy library import detected: ${matches[0]}`,
            suggestion: 'Use tree-shaking or specific imports'
          });
        }
      });
      
      // Check for non-lazy component imports
      if (content.includes('import') && filePath.includes('app/') && !content.includes('dynamic')) {
        const componentImports = content.match(/import\s+\w+\s+from\s+['"]@\/components\/[^'"]+['"]/g);
        if (componentImports && componentImports.length > 5) {
          issues.push({
            file: filePath,
            type: 'non-lazy-imports',
            issue: `${componentImports.length} component imports without lazy loading`,
            suggestion: 'Consider using dynamic imports for large components'
          });
        }
      }
      
      // Check for missing React.memo
      if (content.includes('export function') || content.includes('export const')) {
        const hasPropsInterface = content.includes('Props');
        const hasMemo = content.includes('React.memo') || content.includes('memo(');
        
        if (hasPropsInterface && !hasMemo && content.length > 1000) {
          issues.push({
            file: filePath,
            type: 'missing-memo',
            issue: 'Large component without React.memo optimization',
            suggestion: 'Wrap component with React.memo for better performance'
          });
        }
      }
      
      return issues;
    } catch (error) {
      return [];
    }
  };
  
  // Scan component files
  const scanComponents = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.next', 'dist'].includes(entry.name)) {
          scanComponents(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          const issues = checkBundleImports(fullPath);
          performanceIssues.push(...issues);
        }
      });
    } catch (error) {
      console.log(`Cannot scan ${dir}: ${error.message}`);
    }
  };
  
  scanComponents(path.join(__dirname, 'components'));
  scanComponents(path.join(__dirname, 'app'));
  
  console.log(`   Found ${performanceIssues.length} performance issues`);
  return performanceIssues;
}

// Memory Leak Detection
function analyzeMemoryLeaks() {
  console.log('🧠 Analyzing Memory Leaks...');
  
  const memoryIssues = [];
  
  const checkMemoryLeaks = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];
      
      // Check for missing cleanup in useEffect
      const useEffectPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}/g;
      const useEffectMatches = content.match(useEffectPattern);
      
      if (useEffectMatches) {
        useEffectMatches.forEach(effect => {
          // Check for event listeners without cleanup
          if (effect.includes('addEventListener') && !effect.includes('removeEventListener')) {
            issues.push({
              file: filePath,
              type: 'event-listener-leak',
              issue: 'Event listener added without cleanup',
              suggestion: 'Add removeEventListener in useEffect cleanup'
            });
          }
          
          // Check for intervals/timeouts without cleanup
          if ((effect.includes('setInterval') || effect.includes('setTimeout')) && 
              !effect.includes('clearInterval') && !effect.includes('clearTimeout')) {
            issues.push({
              file: filePath,
              type: 'timer-leak',
              issue: 'Timer created without cleanup',
              suggestion: 'Clear timers in useEffect cleanup function'
            });
          }
          
          // Check for subscriptions without cleanup
          if (effect.includes('subscribe') && !effect.includes('unsubscribe')) {
            issues.push({
              file: filePath,
              type: 'subscription-leak',
              issue: 'Subscription created without cleanup',
              suggestion: 'Add unsubscribe in useEffect cleanup'
            });
          }
        });
      }
      
      // Check for missing dependency arrays
      const useEffectNoDeps = /useEffect\s*\([^,)]+\s*\)/g;
      if (content.match(useEffectNoDeps)) {
        issues.push({
          file: filePath,
          type: 'missing-deps',
          issue: 'useEffect without dependency array',
          suggestion: 'Add dependency array to prevent infinite re-renders'
        });
      }
      
      return issues;
    } catch (error) {
      return [];
    }
  };
  
  // Scan for memory leaks
  const scanForLeaks = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.next'].includes(entry.name)) {
          scanForLeaks(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          const issues = checkMemoryLeaks(fullPath);
          memoryIssues.push(...issues);
        }
      });
    } catch (error) {
      console.log(`Cannot scan ${dir}: ${error.message}`);
    }
  };
  
  scanForLeaks(__dirname);
  
  console.log(`   Found ${memoryIssues.length} potential memory leaks`);
  return memoryIssues;
}

// Security Vulnerability Scan
function analyzeSecurity() {
  console.log('🔒 Running Security Analysis...');
  
  const securityIssues = [];
  
  const checkSecurity = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];
      
      // Check for potential XSS vulnerabilities
      if (content.includes('dangerouslySetInnerHTML')) {
        issues.push({
          file: filePath,
          type: 'xss-risk',
          severity: 'high',
          issue: 'dangerouslySetInnerHTML usage detected',
          suggestion: 'Sanitize HTML content or use safer alternatives'
        });
      }
      
      // Check for hardcoded secrets
      const secretPatterns = [
        /(?:password|pwd|secret|key|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
        /sk_live_[a-zA-Z0-9]{24,}/g, // Stripe live keys
        /pk_live_[a-zA-Z0-9]{24,}/g, // Stripe public keys
        /AIza[0-9A-Za-z\\-_]{35}/g, // Google API keys
      ];
      
      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            file: filePath,
            type: 'hardcoded-secret',
            severity: 'critical',
            issue: `Potential hardcoded secret: ${matches[0].substring(0, 20)}...`,
            suggestion: 'Move secrets to environment variables'
          });
        }
      });
      
      // Check for eval usage
      if (content.includes('eval(')) {
        issues.push({
          file: filePath,
          type: 'eval-usage',
          severity: 'high',
          issue: 'eval() usage detected',
          suggestion: 'Avoid eval() - use safer alternatives'
        });
      }
      
      // Check for localStorage without encryption
      if (content.includes('localStorage.setItem') && content.includes('token')) {
        issues.push({
          file: filePath,
          type: 'insecure-storage',
          severity: 'medium',
          issue: 'Sensitive data stored in localStorage',
          suggestion: 'Consider encrypting sensitive data before storage'
        });
      }
      
      return issues;
    } catch (error) {
      return [];
    }
  };
  
  // Scan all files for security issues
  const scanSecurity = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.next'].includes(entry.name)) {
          scanSecurity(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
          const issues = checkSecurity(fullPath);
          securityIssues.push(...issues);
        }
      });
    } catch (error) {
      console.log(`Cannot scan ${dir}: ${error.message}`);
    }
  };
  
  scanSecurity(__dirname);
  
  console.log(`   Found ${securityIssues.length} security issues`);
  return securityIssues;
}

// Bundle Size Analysis
function analyzeBundleSize() {
  console.log('📦 Analyzing Bundle Size...');
  
  const bundleIssues = [];
  
  try {
    // Check package.json for heavy dependencies
    const packagePath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Known heavy packages
      const heavyPackages = {
        'moment': 'Consider using date-fns or dayjs (smaller alternatives)',
        'lodash': 'Use lodash-es or specific function imports',
        'rxjs': 'Tree-shake unused operators',
        '@material-ui/core': 'Use specific component imports',
        'antd': 'Use specific component imports',
        'three': 'Consider code splitting for 3D components'
      };
      
      Object.entries(heavyPackages).forEach(([pkg, suggestion]) => {
        if (dependencies[pkg]) {
          bundleIssues.push({
            type: 'heavy-dependency',
            package: pkg,
            issue: `Heavy package detected: ${pkg}`,
            suggestion
          });
        }
      });
    }
    
    // Check for duplicate dependencies
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      // This would require more complex analysis, simplified for now
      bundleIssues.push({
        type: 'bundle-analysis',
        issue: 'Run npm ls to check for duplicate dependencies',
        suggestion: 'Use npm dedupe to remove duplicate packages'
      });
    }
    
  } catch (error) {
    console.log(`Bundle analysis error: ${error.message}`);
  }
  
  console.log(`   Found ${bundleIssues.length} bundle optimization opportunities`);
  return bundleIssues;
}

// Accessibility Analysis
function analyzeAccessibility() {
  console.log('♿ Analyzing Accessibility...');
  
  const a11yIssues = [];
  
  const checkA11y = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];
      
      // Check for missing alt text
      if (content.includes('<img') && !content.includes('alt=')) {
        issues.push({
          file: filePath,
          type: 'missing-alt',
          issue: 'Image without alt text',
          suggestion: 'Add descriptive alt text for screen readers'
        });
      }
      
      // Check for missing aria-labels on interactive elements
      const interactiveElements = content.match(/<button[^>]*>/g);
      if (interactiveElements) {
        interactiveElements.forEach(element => {
          if (!element.includes('aria-label') && !element.includes('title')) {
            issues.push({
              file: filePath,
              type: 'missing-aria-label',
              issue: 'Interactive element without accessible label',
              suggestion: 'Add aria-label or title for screen readers'
            });
          }
        });
      }
      
      // Check for missing form labels
      if (content.includes('<input') && !content.includes('<label')) {
        issues.push({
          file: filePath,
          type: 'missing-form-label',
          issue: 'Form input without associated label',
          suggestion: 'Add proper form labels for accessibility'
        });
      }
      
      // Check for poor color contrast indicators
      if (content.includes('text-gray-400') || content.includes('text-light')) {
        issues.push({
          file: filePath,
          type: 'color-contrast',
          issue: 'Potentially low color contrast detected',
          suggestion: 'Verify color contrast meets WCAG standards'
        });
      }
      
      return issues;
    } catch (error) {
      return [];
    }
  };
  
  // Scan components for accessibility issues
  const scanA11y = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.next'].includes(entry.name)) {
          scanA11y(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
          const issues = checkA11y(fullPath);
          a11yIssues.push(...issues);
        }
      });
    } catch (error) {
      console.log(`Cannot scan ${dir}: ${error.message}`);
    }
  };
  
  scanA11y(__dirname);
  
  console.log(`   Found ${a11yIssues.length} accessibility issues`);
  return a11yIssues;
}

// Cross-browser Compatibility
function analyzeCrossBrowser() {
  console.log('🌐 Analyzing Cross-browser Compatibility...');
  
  const compatIssues = [];
  
  const checkCompatibility = (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];
      
      // Check for modern JS features that might need polyfills
      const modernFeatures = [
        { pattern: /Object\.fromEntries/g, feature: 'Object.fromEntries', ie: false },
        { pattern: /\.replaceAll\(/g, feature: 'String.replaceAll', ie: false },
        { pattern: /BigInt\(/g, feature: 'BigInt', ie: false },
        { pattern: /\?\?/g, feature: 'Nullish coalescing', ie: false },
        { pattern: /\?\./g, feature: 'Optional chaining', ie: false }
      ];
      
      modernFeatures.forEach(({ pattern, feature, ie }) => {
        if (content.match(pattern)) {
          issues.push({
            file: filePath,
            type: 'browser-compatibility',
            feature,
            issue: `Modern feature ${feature} detected`,
            suggestion: ie ? 'Consider polyfill for IE support' : 'Ensure target browsers support this feature'
          });
        }
      });
      
      // Check for CSS features that might need prefixes
      if (content.includes('backdrop-filter') || content.includes('mask-image')) {
        issues.push({
          file: filePath,
          type: 'css-compatibility',
          issue: 'Advanced CSS features detected',
          suggestion: 'Verify browser support and consider fallbacks'
        });
      }
      
      return issues;
    } catch (error) {
      return [];
    }
  };
  
  // Scan for compatibility issues
  const scanCompatibility = (dir) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.next'].includes(entry.name)) {
          scanCompatibility(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css')) {
          const issues = checkCompatibility(fullPath);
          compatIssues.push(...issues);
        }
      });
    } catch (error) {
      console.log(`Cannot scan ${dir}: ${error.message}`);
    }
  };
  
  scanCompatibility(__dirname);
  
  console.log(`   Found ${compatIssues.length} compatibility considerations`);
  return compatIssues;
}

// Main analysis runner
async function runAdvancedAnalysis() {
  console.log('🔥 Running Comprehensive Advanced Analysis...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    performance: analyzePerformance(),
    memoryLeaks: analyzeMemoryLeaks(),
    security: analyzeSecurity(),
    bundleSize: analyzeBundleSize(),
    accessibility: analyzeAccessibility(),
    crossBrowser: analyzeCrossBrowser()
  };
  
  // Calculate totals
  const totalIssues = Object.values(results).reduce((sum, category) => {
    return sum + (Array.isArray(category) ? category.length : 0);
  }, 0);
  
  console.log('\n📊 Advanced Analysis Summary:');
  console.log(`Performance Issues: ${results.performance.length}`);
  console.log(`Memory Leak Risks: ${results.memoryLeaks.length}`);
  console.log(`Security Issues: ${results.security.length}`);
  console.log(`Bundle Optimizations: ${results.bundleSize.length}`);
  console.log(`Accessibility Issues: ${results.accessibility.length}`);
  console.log(`Compatibility Notes: ${results.crossBrowser.length}`);
  console.log(`Total Advanced Issues: ${totalIssues}`);
  
  // Show critical security issues
  const criticalSecurity = results.security.filter(issue => issue.severity === 'critical');
  if (criticalSecurity.length > 0) {
    console.log('\n🚨 CRITICAL Security Issues:');
    criticalSecurity.forEach(issue => {
      console.log(`   • ${issue.issue} (${issue.file})`);
    });
  }
  
  // Show top performance issues
  const heavyImports = results.performance.filter(issue => issue.type === 'heavy-import');
  if (heavyImports.length > 0) {
    console.log('\n⚡ Top Performance Issues:');
    heavyImports.slice(0, 5).forEach(issue => {
      console.log(`   • ${issue.issue}`);
    });
  }
  
  // Save comprehensive report
  results.summary = {
    totalIssues,
    criticalSecurity: criticalSecurity.length,
    highPriorityPerformance: heavyImports.length,
    memoryLeakRisks: results.memoryLeaks.length,
    accessibilityGaps: results.accessibility.length
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'advanced-analysis-report.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ Advanced Analysis Complete!');
  console.log('📄 Detailed report saved to: advanced-analysis-report.json');
  
  return results;
}

// Run the advanced analysis
runAdvancedAnalysis().catch(console.error);