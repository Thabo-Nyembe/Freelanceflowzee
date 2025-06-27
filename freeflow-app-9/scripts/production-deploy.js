#!/usr/bin/env node

/**
 * Production Deployment Script for FreeflowZee
 * Implements Next.js Production Checklist
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

class ProductionDeployer {
  constructor() {
    this.checks = {
      environment: false,
      security: false,
      build: false,
      tests: false,
      performance: false,
      accessibility: false
    };
    
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅','
      warning: '⚠️',
      error: '❌','
      progress: '🔄'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkEnvironment() {
    this.log('Checking environment configuration...', 'progress');
    
    try {
      // Check required environment variables
      const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY', 'WASABI_ACCESS_KEY_ID', 'WASABI_SECRET_ACCESS_KEY',
        'WASABI_BUCKET_NAME'];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        this.errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
        return false;
      }
      
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);'
      
      if (majorVersion < 18) {
        this.errors.push(`Node.js version ${nodeVersion} is not supported. Minimum version: 18.x`);
        return false;
      }
      
      // Check package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (!packageJson.scripts['build:production']) {
        this.warnings.push('Missing build:production script in package.json');
      }
      
      this.checks.environment = true;
      this.log('Environment configuration check passed', 'success');
      return true;
      
    } catch (error) {
      this.errors.push(`Environment check failed: ${error.message}`);
      return false;
    }
  }

  async runSecurityAudit() {
    this.log('Running security audit...', 'progress');
    
    try {
      // Run npm audit
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      
      // Check for known vulnerabilities
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata.vulnerabilities.total > 0) {
        const { high, critical } = audit.metadata.vulnerabilities;
        if (high > 0 || critical > 0) {
          this.errors.push(`Security vulnerabilities found: ${critical} critical, ${high} high`);
          return false;
        }
        
        if (audit.metadata.vulnerabilities.moderate > 0) {
          this.warnings.push(`${audit.metadata.vulnerabilities.moderate} moderate vulnerabilities found`);
        }
      }
      
      this.checks.security = true;
      this.log('Security audit passed', 'success');
      return true;
      
    } catch (error) {
      this.errors.push(`Security audit failed: ${error.message}`);
      return false;
    }
  }

  async buildApplication() {
    this.log('Building application for production...', 'progress');
    
    try {
      // Clean previous builds
      if (fs.existsSync('.next')) {
        execSync('rm -rf .next', { stdio: 'pipe' });
      }
      
      // Run production build
      execSync('npm run build:production', { stdio: 'inherit' });
      
      // Check build output
      if (!fs.existsSync('.next')) {
        this.errors.push('Build output directory (.next) not found');
        return false;
      }
      
      // Check for build errors
      const buildManifest = path.join('.next', 'build-manifest.json');
      if (!fs.existsSync(buildManifest)) {
        this.errors.push('Build manifest not found - build may have failed');
        return false;
      }
      
      // Analyze bundle size
      const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
      const bundleSize = this.calculateBundleSize(manifest);
      
      if (bundleSize > 130 * 1024) { // 130KB threshold
        this.warnings.push(`Bundle size (${Math.round(bundleSize/1024)}KB) exceeds recommended 130KB`);
      }
      
      this.checks.build = true;
      this.log('Application build completed successfully', 'success');
      return true;
      
    } catch (error) {
      this.errors.push(`Build failed: ${error.message}`);
      return false;
    }
  }

  calculateBundleSize(manifest) {
    let totalSize = 0;
    
    if (manifest.pages && manifest.pages['/']) {'
      manifest.pages['/'].forEach(chunk => {'
        if (chunk.endsWith('.js')) {
          const chunkPath = path.join('.next', 'static', chunk);
          if (fs.existsSync(chunkPath)) {
            totalSize += fs.statSync(chunkPath).size;
          }
        }
      });
    }
    
    return totalSize;
  }

  async runTests() {
    this.log('Running test suite...', 'progress');
    
    try {
      // Run smoke tests
      execSync('npm run test:smoke', { stdio: 'inherit' });
      
      // Run critical E2E tests
      execSync('npm run test:e2e -- --grep "@critical"', { stdio: 'inherit' });
      
      this.checks.tests = true;
      this.log('Test suite passed', 'success');
      return true;
      
    } catch (error) {
      this.errors.push(`Tests failed: ${error.message}`);
      return false;
    }
  }

  async checkPerformance() {
    this.log('Checking performance metrics...', 'progress');
    
    try {
      // Start server for testing
      const serverProcess = spawn('npm', ['run', 'start:production'], {
        detached: true,
        stdio: 'pipe'
      });
      
      // Wait for server to start
      await this.waitForServer('http://localhost:3000', 30000);
      
      // Run Lighthouse audit
      const lighthouseCmd = `lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-production.json --chrome-flags= "--headless --no-sandbox"`;
      execSync(lighthouseCmd, { stdio: 'pipe' });
      
      // Parse results
      if (fs.existsSync('./lighthouse-production.json')) {
        const results = JSON.parse(fs.readFileSync('./lighthouse-production.json', 'utf8'));
        const performance = results.categories.performance.score * 100;
        
        if (performance < 90) {
          this.warnings.push(`Performance score (${Math.round(performance)}) below recommended 90`);
        }
        
        // Check Core Web Vitals
        const lcp = results.audits['largest-contentful-paint']?.numericValue || 0;
        const cls = results.audits['cumulative-layout-shift']?.numericValue || 0;
        
        if (lcp > 2500) {
          this.warnings.push(`LCP (${Math.round(lcp)}ms) exceeds 2.5s threshold`);
        }
        
        if (cls > 0.1) {
          this.warnings.push(`CLS (${cls.toFixed(3)}) exceeds 0.1 threshold`);
        }
      }
      
      // Kill server
      process.kill(-serverProcess.pid);
      
      this.checks.performance = true;
      this.log('Performance check completed', 'success');
      return true;
      
    } catch (error) {
      this.warnings.push(`Performance check failed: ${error.message}`);
      return true; // Non-blocking
    }
  }

  async checkAccessibility() {
    this.log('Checking accessibility compliance...', 'progress');
    
    try {
      // Run accessibility tests
      execSync('npm run test:accessibility', { stdio: 'inherit' });
      
      this.checks.accessibility = true;
      this.log('Accessibility check passed', 'success');
      return true;
      
    } catch (error) {
      this.warnings.push(`Accessibility check failed: ${error.message}`);
      return true; // Non-blocking
    }
  }

  async waitForServer(url, timeout = 30000) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) return;
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Server did not start within ${timeout}ms`);
  }

  generateReport() {
    this.log('Generating deployment report...', 'progress');
    
    const report = {
      timestamp: new Date().toISOString(),
      checks: this.checks,
      errors: this.errors,
      warnings: this.warnings,
      passed: this.errors.length === 0,
      ready: Object.values(this.checks).every(check => check)
    };
    
    // Save report
    fs.writeFileSync('production-deployment-report.json', JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('\n' + '='.repeat(60));'
    console.log('🚀 PRODUCTION DEPLOYMENT REPORT');
    console.log('='.repeat(60));'
    
    console.log('\n📋 Checks Summary: ');
    Object.entries(this.checks).forEach(([check, passed]) => {
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${check.charAt(0).toUpperCase() + check.slice(1)}`);
    });
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings: ');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    console.log('\n🎯 Overall Status:');
    if (report.ready && report.passed) {
      console.log('✅ Ready for production deployment!');
      console.log('🚀 All checks passed successfully');
    } else if (report.ready && !report.passed) {
      console.log('⚠️ Ready with warnings');
      console.log('🔧 Consider addressing warnings before deployment');
    } else {
      console.log('❌ Not ready for production');
      console.log('🛠️ Please fix errors before deployment');
    }
    
    return report;
  }

  async deploy() {
    this.log('Starting production deployment process...', 'progress');
    
    try {
      // Run all checks
      await this.checkEnvironment();
      await this.runSecurityAudit();
      await this.buildApplication();
      await this.runTests();
      await this.checkPerformance();
      await this.checkAccessibility();
      
      // Generate report
      const report = this.generateReport();
      
      if (report.passed && report.ready) {
        this.log('Production deployment checks completed successfully!', 'success');
        return true;
      } else {
        this.log('Production deployment checks failed', 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`Deployment process failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const deployer = new ProductionDeployer();
  deployer.deploy().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = ProductionDeployer; 