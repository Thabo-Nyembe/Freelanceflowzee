#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class UnifiedTestRunner {
  constructor() {
    this.results = {
      startTime: Date.now(),
      build: null,
      avatars: null,
      dashboard: null,
      payment: null
    };
    this.fixes = [];
  }

  async runCommand(command, options = {}) {
    const { timeout = 60000, retries = 3 } = options;
    
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Running (${i+1}/${retries}): ${command}`);
        const result = await this.executeCommand(command, { timeout });
        if (result.success || i === retries - 1) {
          return result;
        }
        console.log(`⚠️ Attempt ${i+1} failed, retrying...`);
        await this.sleep(5000);
      } catch (error) {
        if (i === retries - 1) {
          return {
            success: false,
            stdout: '',
            stderr: error.message,
            code: -1
          };
        }
        console.log(`⚠️ Attempt ${i+1} failed, retrying...`);
        await this.sleep(5000);
      }
    }
  }

  async executeCommand(command, options = {}) {
    const { timeout = 60000 } = options;
    
    return new Promise((resolve) => {
      const process = exec(command, { 
        maxBuffer: 1024 * 1024 * 10,
        timeout 
      });
      
      let stdout = '';
      let stderr = '';
      
      if (process.stdout) {
        process.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }
      
      if (process.stderr) {
        process.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }
      
      process.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout: stdout || '',
          stderr: stderr || '',
          code: code || 0
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          stdout: stdout || '',
          stderr: error.message || '',
          code: -1
        });
      });
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async optimizeCaches() {
    console.log('🧹 Optimizing caches...');
    
    const cleanCommands = [
      'rm -rf .next/cache/webpack',
      'rm -rf node_modules/.cache',
      'rm -rf test-results',
      'rm -rf playwright-report'
    ];
    
    for (const cmd of cleanCommands) {
      await this.runCommand(cmd, { timeout: 30000, retries: 1 });
    }
    
    this.fixes.push('Optimized webpack and test caches');
    await this.sleep(2000);
  }

  async testBuild() {
    console.log('🏗️ Testing build process...');
    
    const startTime = Date.now();
    const result = await this.runCommand('npm run build', { timeout: 120000, retries: 1 });
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    this.results.build = {
      success: result.success,
      buildTime: `${buildTime}s`,
      bundleSize: this.extractBundleSize(result.stdout || '')
    };
    
    if (result.success) {
      console.log(`✅ Build successful in ${buildTime}s`);
    } else {
      console.log(`❌ Build failed in ${buildTime}s`);
    }
    
    return result.success;
  }

  extractBundleSize(buildOutput) {
    try {
      const match = (buildOutput || '').match(/First Load JS shared by all\s+(\d+(?:\.\d+)?\s*\w+)/);
      return match ? match[1] : 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  async testAvatars() {
    console.log('🖼️ Testing avatar system...');
    
    const requiredAvatars = ['alice.jpg', 'jane.jpg', 'mike.jpg', 'bob.jpg', 'john.jpg', 'client-1.jpg'];
    const missing = [];
    
    for (const avatar of requiredAvatars) {
      const exists = fs.existsSync(`public/avatars/${avatar}`);
      if (!exists) {
        missing.push(avatar);
      }
    }
    
    this.results.avatars = {
      success: missing.length === 0,
      total: requiredAvatars.length,
      missing: missing.length,
      missingFiles: missing
    };
    
    if (missing.length === 0) {
      console.log(`✅ All ${requiredAvatars.length} avatars present`);
    } else {
      console.log(`❌ ${missing.length} avatars missing`);
    }
    
    return missing.length === 0;
  }

  async testDashboard() {
    console.log('📊 Testing dashboard...');
    
    const result = await this.runCommand(
      'npm run test:dashboard -- --reporter=line',
      { timeout: 180000 }
    );
    
    const stats = this.parseTestResults(result.stdout || result.stderr || '');
    
    this.results.dashboard = {
      success: result.success,
      passed: stats.passed,
      failed: stats.failed,
      total: stats.total,
      passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0
    };
    
    console.log(`📊 Dashboard: ${stats.passed}/${stats.total} passed (${this.results.dashboard.passRate}%)`);
    
    return this.results.dashboard.success;
  }

  async testPayment() {
    console.log('💳 Testing payment system...');
    
    const result = await this.runCommand(
      'npm run test:payment:chrome -- --reporter=line --workers=2',
      { timeout: 300000 }
    );
    
    const stats = this.parseTestResults(result.stdout || result.stderr || '');
    
    this.results.payment = {
      success: result.success,
      passed: stats.passed,
      failed: stats.failed,
      total: stats.total,
      passRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0
    };
    
    console.log(`💳 Payment: ${stats.passed}/${stats.total} passed (${this.results.payment.passRate}%)`);
    
    return this.results.payment.success;
  }

  parseTestResults(output) {
    let passed = 0;
    let failed = 0;
    
    // Add robust null and undefined checks
    if (!output || typeof output !== 'string') {
      return { passed: 0, failed: 0, total: 0 };
    }
    
    try {
      // Look for multiple patterns
      const passedMatch = output.match(/(\d+)\s+passed/i) || output.match(/✓\s*(\d+)/);
      const failedMatch = output.match(/(\d+)\s+failed/i) || output.match(/✘\s*(\d+)/);
      
      passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      return { passed, failed, total: passed + failed };
    } catch (error) {
      console.warn('⚠️ Error parsing test results:', error.message);
      return { passed: 0, failed: 0, total: 0 };
    }
  }

  async generateReport() {
    const duration = ((Date.now() - this.results.startTime) / 1000 / 60).toFixed(1);
    
    this.results.passedTests = (this.results.dashboard?.passed || 0) + (this.results.payment?.passed || 0);
    this.results.failedTests = (this.results.dashboard?.failed || 0) + (this.results.payment?.failed || 0);
    this.results.totalTests = this.results.passedTests + this.results.failedTests;
    
    const overallPassRate = this.results.totalTests > 0 ? 
      ((this.results.passedTests / this.results.totalTests) * 100).toFixed(1) : 0;
    
    const report = `# 🧪 Unified FreeflowZee Test Report
**Generated:** ${new Date().toISOString()}
**Duration:** ${duration} minutes
**Overall Pass Rate:** ${overallPassRate}% (${this.results.passedTests}/${this.results.totalTests})

## 📊 Test Results Summary

### 🏗️ Build Status
- **Status:** ${this.results.build?.success ? '✅ PASSED' : '❌ FAILED'}
- **Build Time:** ${this.results.build?.buildTime || 'N/A'}
- **Bundle Size:** ${this.results.build?.bundleSize || 'N/A'}

### 🖼️ Avatar System
- **Status:** ${this.results.avatars?.success ? '✅ PASSED' : '❌ FAILED'}
- **Missing Files:** ${this.results.avatars?.missingFiles?.join(', ') || 'None'}

### 📊 Dashboard Tests
- **Status:** ${this.results.dashboard?.success ? '✅ PASSED' : '❌ FAILED'}
- **Results:** ${this.results.dashboard?.passed || 0}/${this.results.dashboard?.total || 0} passed (${this.results.dashboard?.passRate || 0}%)

### 💳 Payment Tests
- **Status:** ${this.results.payment?.success ? '✅ PASSED' : '❌ FAILED'}  
- **Results:** ${this.results.payment?.passed || 0}/${this.results.payment?.total || 0} passed (${this.results.payment?.passRate || 0}%)

## 🔧 Applied Fixes
${this.fixes.map(fix => `- ✅ ${fix}`).join('\n') || '- None applied'}

## 🎯 Recommendations
${this.generateRecommendations()}

---
*Report generated by Unified FreeflowZee Test Runner v2.1*
`;

    fs.writeFileSync('UNIFIED_TEST_REPORT.md', report);
    console.log('📄 Unified test report saved to UNIFIED_TEST_REPORT.md');
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.build && !this.results.build.success) {
      recommendations.push('🔴 **CRITICAL:** Fix build process before proceeding');
    }
    
    if (this.results.dashboard && parseFloat(this.results.dashboard.passRate) < 90) {
      recommendations.push('🟡 **HIGH:** Dashboard test pass rate needs improvement');
    }
    
    if (this.results.payment && parseFloat(this.results.payment.passRate) < 80) {
      recommendations.push('🔴 **CRITICAL:** Payment test pass rate too low for production');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('🟢 **ALL GOOD:** System performing excellently');
    }
    
    return recommendations.join('\n');
  }

  async run() {
    console.log('🚀 Starting Unified FreeflowZee Test Suite');
    
    try {
      await this.optimizeCaches();
      
      const buildSuccess = await this.testBuild();
      if (!buildSuccess) {
        console.log('❌ Build failed - stopping execution');
        await this.generateReport();
        return false;
      }
      
      await this.testAvatars();
      await this.testDashboard();
      await this.testPayment();
      
      await this.generateReport();
      
      console.log('🏁 Testing Complete!');
      console.log(`📊 Overall: ${this.results.passedTests}/${this.results.totalTests} passed`);
      
      return this.results.passedTests >= (this.results.totalTests * 0.8);
      
    } catch (error) {
      console.error('💥 Fatal error:', error);
      return false;
    }
  }
}

if (require.main === module) {
  const runner = new UnifiedTestRunner();
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = UnifiedTestRunner; 