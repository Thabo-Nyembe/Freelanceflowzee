#!/usr/bin/env node

/**
 * Core Web Vitals Checker for FreeflowZee
 * Validates performance metrics against production standards
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTI: 3800, // Time to Interactive (ms)
  TBT: 200,  // Total Blocking Time (ms)
  SI: 3400   // Speed Index (ms)
};

// Performance budget for bundle sizes
const BUNDLE_BUDGET = {
  firstLoadJS: 130 * 1024, // 130KB
  totalJS: 250 * 1024,     // 250KB
  css: 50 * 1024,          // 50KB
  images: 500 * 1024       // 500KB
};

class WebVitalsChecker {
  constructor() {
    this.results = {
      vitals: {},
      bundle: {},
      lighthouse: {},
      passed: true,
      errors: []
    };
  }

  async checkBundleSize() {
    console.log('🔍 Checking bundle sizes...');
    
    try {
      // Check if .next/analyze exists
      const analyzePath = path.join(process.cwd(), '.next', 'analyze');
      if (!fs.existsSync(analyzePath)) {
        console.log('📦 Running bundle analysis...');
        execSync('npm run analyze', { stdio: 'inherit' });
      }

      // Read build manifest
      const manifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Calculate first load JS size
        const firstLoadJS = this.calculateFirstLoadJS(manifest);
        this.results.bundle.firstLoadJS = firstLoadJS;
        
        if (firstLoadJS > BUNDLE_BUDGET.firstLoadJS) {
          this.results.passed = false;
          this.results.errors.push(`First Load JS (${Math.round(firstLoadJS/1024)}KB) exceeds budget (${BUNDLE_BUDGET.firstLoadJS/1024}KB)`);
        }
        
        console.log(`✅ First Load JS: ${Math.round(firstLoadJS/1024)}KB (Budget: ${BUNDLE_BUDGET.firstLoadJS/1024}KB)`);
      }
    } catch (error) {
      console.error('❌ Bundle size check failed:', error.message);
      this.results.errors.push(`Bundle analysis failed: ${error.message}`);
    }
  }

  calculateFirstLoadJS(manifest) {
    let totalSize = 0;
    
    // Add main chunks
    if (manifest.pages && manifest.pages['/']) {
      manifest.pages['/'].forEach(chunk => {
        if (chunk.endsWith('.js')) {
          const chunkPath = path.join(process.cwd(), '.next', 'static', chunk);
          if (fs.existsSync(chunkPath)) {
            totalSize += fs.statSync(chunkPath).size;
          }
        }
      });
    }
    
    return totalSize;
  }

  async runLighthouse() {
    console.log('🚀 Running Lighthouse audit...');
    
    try {
      // Start the server
      console.log('📡 Starting production server...');
      const serverProcess = execSync('npm run start:production &', { stdio: 'pipe' });
      
      // Wait for server to start
      await this.waitForServer('http://localhost:3000', 30000);
      
      // Run Lighthouse
      const lighthouseCmd = `lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-results.json --chrome-flags="--headless --no-sandbox"`;
      execSync(lighthouseCmd, { stdio: 'inherit' });
      
      // Parse results
      if (fs.existsSync('./lighthouse-results.json')) {
        const results = JSON.parse(fs.readFileSync('./lighthouse-results.json', 'utf8'));
        this.parseLighthouseResults(results);
      }
      
      // Kill server
      execSync('pkill -f "next start"', { stdio: 'ignore' });
      
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error.message);
      this.results.errors.push(`Lighthouse audit failed: ${error.message}`);
    }
  }

  parseLighthouseResults(results) {
    const audits = results.audits;
    
    // Core Web Vitals
    this.results.vitals.LCP = audits['largest-contentful-paint']?.numericValue || 0;
    this.results.vitals.FID = audits['max-potential-fid']?.numericValue || 0;
    this.results.vitals.CLS = audits['cumulative-layout-shift']?.numericValue || 0;
    this.results.vitals.FCP = audits['first-contentful-paint']?.numericValue || 0;
    this.results.vitals.TTI = audits['interactive']?.numericValue || 0;
    this.results.vitals.TBT = audits['total-blocking-time']?.numericValue || 0;
    this.results.vitals.SI = audits['speed-index']?.numericValue || 0;
    
    // Lighthouse scores
    this.results.lighthouse.performance = results.categories.performance.score * 100;
    this.results.lighthouse.accessibility = results.categories.accessibility.score * 100;
    this.results.lighthouse.bestPractices = results.categories['best-practices'].score * 100;
    this.results.lighthouse.seo = results.categories.seo.score * 100;
    
    // Check thresholds
    this.checkVitalsThresholds();
  }

  checkVitalsThresholds() {
    console.log('\n📊 Core Web Vitals Results:');
    
    Object.entries(THRESHOLDS).forEach(([metric, threshold]) => {
      const value = this.results.vitals[metric];
      const passed = value <= threshold;
      const status = passed ? '✅' : '❌';
      
      if (metric === 'CLS') {
        console.log(`${status} ${metric}: ${value.toFixed(3)} (Threshold: ${threshold})`);
      } else {
        console.log(`${status} ${metric}: ${Math.round(value)}ms (Threshold: ${threshold}ms)`);
      }
      
      if (!passed) {
        this.results.passed = false;
        this.results.errors.push(`${metric} (${Math.round(value)}) exceeds threshold (${threshold})`);
      }
    });
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
    console.log('\n📋 Performance Report:');
    console.log('='.repeat(50));
    
    // Lighthouse Scores
    if (Object.keys(this.results.lighthouse).length > 0) {
      console.log('\n🏆 Lighthouse Scores:');
      Object.entries(this.results.lighthouse).forEach(([category, score]) => {
        const status = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
        console.log(`${status} ${category}: ${Math.round(score)}/100`);
      });
    }
    
    // Bundle Analysis
    if (this.results.bundle.firstLoadJS) {
      console.log('\n📦 Bundle Analysis:');
      console.log(`First Load JS: ${Math.round(this.results.bundle.firstLoadJS/1024)}KB`);
    }
    
    // Overall Status
    console.log('\n🎯 Overall Status:');
    if (this.results.passed) {
      console.log('✅ All performance checks passed!');
      console.log('🚀 Ready for production deployment');
    } else {
      console.log('❌ Performance issues detected:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
      console.log('\n🔧 Please address these issues before production deployment');
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'web-vitals-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return this.results.passed;
  }

  async run() {
    console.log('🔍 FreeflowZee Web Vitals Checker');
    console.log('='.repeat(50));
    
    try {
      // Build the application first
      console.log('🏗️ Building application...');
      execSync('npm run build:production', { stdio: 'inherit' });
      
      // Check bundle sizes
      await this.checkBundleSize();
      
      // Run Lighthouse audit
      await this.runLighthouse();
      
      // Generate report
      const passed = this.generateReport();
      
      process.exit(passed ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Web Vitals check failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new WebVitalsChecker();
  checker.run();
}

module.exports = WebVitalsChecker; 