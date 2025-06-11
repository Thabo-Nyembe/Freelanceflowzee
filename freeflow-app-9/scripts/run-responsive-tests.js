#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Comprehensive Responsive Testing Script
 * Uses Context7 patterns and Playwright for thorough UI/UX testing
 */

const VIEWPORT_CATEGORIES = {
  desktop: ['desktop-chrome-1920', 'desktop-chrome-1366', 'desktop-firefox', 'desktop-webkit', 'ultrawide-desktop'],
  tablet: ['tablet-ipad-pro', 'tablet-surface-pro', 'tablet-ipad', 'tablet-android', 'tablet-portrait'],
  mobile: ['mobile-iphone-14-pro-max', 'mobile-pixel-7-pro', 'mobile-iphone-13', 'mobile-samsung-galaxy', 'mobile-iphone-se', 'mobile-small-android']
};

const TEST_SUITES = {
  responsive: 'tests/e2e/responsive-ui-ux.spec.ts',
  dashboard: 'tests/e2e/dashboard.spec.ts',
  payment: 'tests/e2e/payment.spec.ts'
};

class ResponsiveTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      byViewport: {},
      issues: []
    };
    this.outputDir = 'test-results/responsive';
  }

  async init() {
    // Ensure output directories exist
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir('test-results/screenshots', { recursive: true });
    
    console.log('🚀 Starting Comprehensive Responsive UI/UX Testing');
    console.log('📱 Testing across:', Object.keys(VIEWPORT_CATEGORIES).join(', '));
    console.log('🔍 Viewport configurations:', Object.values(VIEWPORT_CATEGORIES).flat().length);
  }

  async runTestSuite(suiteName, projects = null) {
    console.log(`\n📋 Running ${suiteName} test suite...`);
    
    const projectArgs = projects ? ['--project', ...projects] : [];
    const testFile = TEST_SUITES[suiteName] || suiteName;
    
    return new Promise((resolve) => {
      const testProcess = spawn('npx', [
        'playwright', 'test',
        testFile,
        '--reporter=json',
        `--output-dir=${this.outputDir}/${suiteName}`,
        ...projectArgs
      ], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      testProcess.on('close', (code) => {
        resolve({ code, stdout, stderr, suiteName });
      });
    });
  }

  async analyzeResults(testResult) {
    const { code, stdout, stderr, suiteName } = testResult;
    
    try {
      // Parse JSON output if available
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);
        await this.processTestResults(results, suiteName);
      }
    } catch (error) {
      console.error(`❌ Error parsing results for ${suiteName}:`, error.message);
    }

    // Log summary
    const status = code === 0 ? '✅' : '❌';
    console.log(`${status} ${suiteName} suite completed (exit code: ${code})`);
    
    if (stderr) {
      console.log('⚠️  Warnings/Errors:');
      console.log(stderr.substring(0, 500));
    }
  }

  async processTestResults(results, suiteName) {
    for (const suite of results.suites || []) {
      for (const test of suite.tests || []) {
        const projectName = test.projectName || 'unknown';
        
        if (!this.results.byViewport[projectName]) {
          this.results.byViewport[projectName] = {
            passed: 0,
            failed: 0,
            issues: []
          };
        }

        switch (test.outcome) {
          case 'passed':
            this.results.passed++;
            this.results.byViewport[projectName].passed++;
            break;
          case 'failed':
            this.results.failed++;
            this.results.byViewport[projectName].failed++;
            this.results.byViewport[projectName].issues.push({
              test: test.title,
              error: test.results?.[0]?.error?.message || 'Unknown error'
            });
            break;
          case 'skipped':
            this.results.skipped++;
            break;
        }
      }
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.passed + this.results.failed + this.results.skipped,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: this.results.passed / (this.results.passed + this.results.failed) * 100
      },
      viewports: this.results.byViewport,
      recommendations: await this.generateRecommendations()
    };

    // Save detailed JSON report
    await fs.writeFile(
      path.join(this.outputDir, 'responsive-test-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdownReport = await this.generateMarkdownReport(report);
    await fs.writeFile(
      path.join(this.outputDir, 'RESPONSIVE_TEST_REPORT.md'),
      markdownReport
    );

    return report;
  }

  async generateRecommendations() {
    const recommendations = [];
    
    // Analyze viewport performance
    const viewportIssues = Object.entries(this.results.byViewport)
      .filter(([_, data]) => data.failed > 0)
      .map(([viewport, data]) => ({ viewport, ...data }));

    if (viewportIssues.length > 0) {
      recommendations.push({
        category: 'Viewport Issues',
        priority: 'high',
        description: `${viewportIssues.length} viewport(s) have failing tests`,
        action: 'Review responsive design implementation for affected viewports',
        viewports: viewportIssues.map(v => v.viewport)
      });
    }

    // Check mobile-specific issues
    const mobileViewports = Object.keys(this.results.byViewport)
      .filter(vp => vp.includes('mobile'));
    const mobileFails = mobileViewports
      .reduce((acc, vp) => acc + (this.results.byViewport[vp]?.failed || 0), 0);

    if (mobileFails > 0) {
      recommendations.push({
        category: 'Mobile UX',
        priority: 'high',
        description: `${mobileFails} mobile test failures detected`,
        action: 'Focus on mobile-first design principles and touch target sizing',
        affectedViewports: mobileViewports.filter(vp => 
          this.results.byViewport[vp]?.failed > 0
        )
      });
    }

    // Check desktop issues
    const desktopViewports = Object.keys(this.results.byViewport)
      .filter(vp => vp.includes('desktop'));
    const desktopFails = desktopViewports
      .reduce((acc, vp) => acc + (this.results.byViewport[vp]?.failed || 0), 0);

    if (desktopFails > 0) {
      recommendations.push({
        category: 'Desktop Layout',
        priority: 'medium',
        description: `${desktopFails} desktop test failures detected`,
        action: 'Review grid layouts and component spacing for larger screens',
        affectedViewports: desktopViewports.filter(vp => 
          this.results.byViewport[vp]?.failed > 0
        )
      });
    }

    return recommendations;
  }

  async generateMarkdownReport(report) {
    const { summary, viewports, recommendations } = report;
    
    return `# 📱 Responsive UI/UX Test Report

Generated: ${new Date(report.timestamp).toLocaleString()}

## 📊 Test Summary

- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed} ✅
- **Failed**: ${summary.failed} ❌
- **Skipped**: ${summary.skipped} ⏭️
- **Success Rate**: ${summary.successRate.toFixed(1)}%

## 🖥️ Viewport Results

${Object.entries(viewports).map(([viewport, data]) => {
  const total = data.passed + data.failed;
  const rate = total > 0 ? (data.passed / total * 100).toFixed(1) : '0';
  const status = data.failed === 0 ? '✅' : '❌';
  
  return `### ${viewport} ${status}
- **Passed**: ${data.passed}
- **Failed**: ${data.failed}
- **Success Rate**: ${rate}%

${data.issues.length > 0 ? 
  `**Issues:**\n${data.issues.map(issue => `- ${issue.test}: ${issue.error}`).join('\n')}\n` : 
  '**No issues detected** ✅\n'
}`;
}).join('\n')}

## 🎯 Recommendations

${recommendations.length > 0 ? 
  recommendations.map(rec => `### ${rec.category} (${rec.priority} priority)
${rec.description}

**Action**: ${rec.action}

${rec.viewports ? `**Affected Viewports**: ${rec.viewports.join(', ')}` : ''}
${rec.affectedViewports ? `**Affected Viewports**: ${rec.affectedViewports.join(', ')}` : ''}
`).join('\n') : 
  '**No specific recommendations** - All tests passing! 🎉'
}

## 🖼️ Screenshots

Visual regression screenshots have been saved to \`test-results/screenshots/\` for manual review.

## 📋 Next Steps

1. Review any failing tests and their specific error messages
2. Check screenshot differences for visual regressions
3. Implement recommended fixes for responsive design issues
4. Re-run tests to verify fixes

---
*Report generated by FreeflowZee Responsive Testing Suite*
`;
  }

  async run() {
    await this.init();

    // Run responsive tests on all viewports
    console.log('\n🎯 Phase 1: Comprehensive Responsive Testing');
    await this.analyzeResults(await this.runTestSuite('responsive'));

    // Run dashboard tests on key viewports
    console.log('\n🎯 Phase 2: Dashboard Responsive Testing');
    const keyViewports = ['desktop-chrome-1920', 'tablet-ipad', 'mobile-iphone-13'];
    if (fs.access(TEST_SUITES.dashboard).catch(() => false)) {
      await this.analyzeResults(await this.runTestSuite('dashboard', keyViewports));
    }

    // Generate comprehensive report
    console.log('\n📊 Generating comprehensive test report...');
    const report = await this.generateReport();

    // Display summary
    console.log('\n🎉 Responsive Testing Complete!');
    console.log(`📊 Success Rate: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏭️ Skipped: ${report.summary.skipped}`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n🎯 ${report.recommendations.length} recommendation(s) generated`);
      console.log('📋 See RESPONSIVE_TEST_REPORT.md for detailed analysis');
    }

    console.log(`\n📁 Results saved to: ${this.outputDir}/`);
    
    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  }
}

// CLI execution
if (require.main === module) {
  const runner = new ResponsiveTestRunner();
  runner.run().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = ResponsiveTestRunner; 