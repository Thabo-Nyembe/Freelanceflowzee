#!/usr/bin/env node

/**
 * 🎯 MASTER INDIVIDUAL TAB TESTER
 * 
 * Master script to run all individual tab testing scripts and consolidate results
 * using Context7 MCP best practices and Playwright automation.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Test scripts configuration
const TEST_SCRIPTS = [
  {
    name: 'Projects Hub',
    script: 'test-projects-hub-tabs.js',
    reportFile: 'projects-hub-test-report.json',
    emoji: '📊'
  },
  {
    name: 'Video Studio',
    script: 'test-video-studio-tabs.js',
    reportFile: 'video-studio-test-report.json',
    emoji: '🎬'
  },
  {
    name: 'Community Hub',
    script: 'test-community-hub-tabs.js',
    reportFile: 'community-hub-test-report.json',
    emoji: '👥'
  },
  {
    name: 'AI Assistant',
    script: 'test-ai-assistant-tabs.js',
    reportFile: 'ai-assistant-test-report.json',
    emoji: '🤖'
  },
  {
    name: 'My Day Today',
    script: 'test-my-day-tabs.js',
    reportFile: 'my-day-test-report.json',
    emoji: '📅'
  },
  {
    name: 'Files & Escrow',
    script: 'test-files-escrow-tabs.js',
    reportFile: 'files-escrow-test-report.json',
    emoji: '📁💰'
  }
];

class MasterTabTester {
  constructor() {
    this.results = {
      totalScripts: TEST_SCRIPTS.length,
      completedScripts: 0,
      failedScripts: 0,
      overallResults: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warningTests: 0
      },
      scriptResults: [],
      startTime: new Date(),
      endTime: null
    };
  }

  async runScript(scriptConfig) {
    console.log(`\n${scriptConfig.emoji} Running ${scriptConfig.name} tests...`);
    console.log('=' .repeat(50));

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, scriptConfig.script);
      const child = spawn('node', [scriptPath, '--debug'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${scriptConfig.name} tests completed successfully`);
          resolve({ success: true, code });
        } else {
          console.log(`❌ ${scriptConfig.name} tests failed with code ${code}`);
          resolve({ success: false, code });
        }
      });

      child.on('error', (error) => {
        console.error(`💥 Error running ${scriptConfig.name}:`, error);
        reject(error);
      });
    });
  }

  async loadReportFile(reportFile) {
    try {
      const reportPath = path.join(process.cwd(), reportFile);
      const reportData = await fs.readFile(reportPath, 'utf8');
      return JSON.parse(reportData);
    } catch (error) {
      console.warn(`⚠️  Could not load report file ${reportFile}:`, error.message);
      return null;
    }
  }

  async consolidateResults() {
    console.log('\n📊 Consolidating all test results...');
    
    for (const scriptConfig of TEST_SCRIPTS) {
      const report = await this.loadReportFile(scriptConfig.reportFile);
      
      if (report) {
        // Extract the first property from the report (different scripts have different keys)
        const reportKey = Object.keys(report)[0];
        const scriptResult = report[reportKey];
        
        if (scriptResult && scriptResult.summary) {
          this.results.overallResults.totalTests += scriptResult.summary.total || 0;
          this.results.overallResults.passedTests += scriptResult.summary.passed || 0;
          this.results.overallResults.failedTests += scriptResult.summary.failed || 0;
          
          // Calculate warnings (total - passed - failed)
          const warnings = (scriptResult.summary.total || 0) - 
                          (scriptResult.summary.passed || 0) - 
                          (scriptResult.summary.failed || 0);
          this.results.overallResults.warningTests += Math.max(0, warnings);
        }

        this.results.scriptResults.push({
          name: scriptConfig.name,
          emoji: scriptConfig.emoji,
          summary: scriptResult ? scriptResult.summary : null,
          details: scriptResult ? scriptResult.details : null,
          screenshots: scriptResult ? scriptResult.screenshots : []
        });
      } else {
        this.results.failedScripts++;
        this.results.scriptResults.push({
          name: scriptConfig.name,
          emoji: scriptConfig.emoji,
          summary: { total: 0, passed: 0, failed: 0, passRate: 0 },
          details: [],
          screenshots: [],
          error: 'Report file not found or could not be parsed'
        });
      }
    }
  }

  generateConsolidatedReport() {
    this.results.endTime = new Date();
    const duration = Math.round((this.results.endTime - this.results.startTime) / 1000);
    const overallPassRate = this.results.overallResults.totalTests > 0 
      ? Math.round((this.results.overallResults.passedTests / this.results.overallResults.totalTests) * 100)
      : 0;

    console.log('\n🎉 CONSOLIDATED TEST REPORT');
    console.log('=' .repeat(70));
    console.log(`⏱️  Total Duration: ${duration} seconds`);
    console.log(`📝 Scripts Run: ${this.results.completedScripts}/${this.results.totalScripts}`);
    console.log(`💯 Overall Pass Rate: ${overallPassRate}%`);
    console.log(`✅ Total Passed: ${this.results.overallResults.passedTests}`);
    console.log(`❌ Total Failed: ${this.results.overallResults.failedTests}`);
    console.log(`⚠️  Total Warnings: ${this.results.overallResults.warningTests}`);
    console.log(`🧮 Total Tests: ${this.results.overallResults.totalTests}`);

    console.log('\n📋 SCRIPT BREAKDOWN:');
    console.log('-' .repeat(70));
    
    this.results.scriptResults.forEach(result => {
      const passRate = result.summary && result.summary.total > 0 
        ? Math.round((result.summary.passed / result.summary.total) * 100)
        : 0;
      
      console.log(`${result.emoji} ${result.name}:`);
      console.log(`   ✅ ${result.summary?.passed || 0}/${result.summary?.total || 0} (${passRate}%)`);
      console.log(`   📸 Screenshots: ${result.screenshots?.length || 0}`);
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
      console.log('');
    });

    // Performance Analysis
    console.log('📈 PERFORMANCE ANALYSIS:');
    console.log('-' .repeat(70));
    
    const bestPerforming = this.results.scriptResults
      .filter(r => r.summary && r.summary.total > 0)
      .sort((a, b) => (b.summary.passed / b.summary.total) - (a.summary.passed / a.summary.total))
      .slice(0, 3);

    if (bestPerforming.length > 0) {
      console.log('🏆 Best Performing Scripts:');
      bestPerforming.forEach((result, index) => {
        const passRate = Math.round((result.summary.passed / result.summary.total) * 100);
        console.log(`   ${index + 1}. ${result.emoji} ${result.name}: ${passRate}%`);
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-' .repeat(70));
    
    if (overallPassRate >= 80) {
      console.log('🎊 Excellent! Most interactive elements are working well.');
      console.log('🔧 Focus on fixing the remaining failed tests for 100% success.');
    } else if (overallPassRate >= 60) {
      console.log('👍 Good progress! Continue fixing failed tests.');
      console.log('🎯 Priority: Address scripts with lowest pass rates first.');
    } else {
      console.log('⚠️  Significant issues detected. Review failed tests carefully.');
      console.log('🚨 Priority: Fix fundamental navigation and button issues.');
    }

    if (this.results.failedScripts > 0) {
      console.log(`❌ ${this.results.failedScripts} script(s) failed to run - check for syntax errors.`);
    }

    return {
      summary: {
        duration: duration,
        scriptsRun: this.results.completedScripts,
        totalScripts: this.results.totalScripts,
        overallPassRate: overallPassRate,
        totalTests: this.results.overallResults.totalTests,
        passedTests: this.results.overallResults.passedTests,
        failedTests: this.results.overallResults.failedTests,
        warningTests: this.results.overallResults.warningTests
      },
      results: this.results.scriptResults,
      recommendations: {
        status: overallPassRate >= 80 ? 'excellent' : overallPassRate >= 60 ? 'good' : 'needs-improvement',
        passRate: overallPassRate,
        failedScripts: this.results.failedScripts
      },
      timestamp: this.results.endTime.toISOString()
    };
  }

  async run() {
    console.log('🚀 Starting Individual Tab Tests...');
    console.log(`📊 Will run ${TEST_SCRIPTS.length} testing scripts`);
    console.log('⏱️  Estimated time: 10-15 minutes\n');

    // Run each script sequentially
    for (const scriptConfig of TEST_SCRIPTS) {
      try {
        const result = await this.runScript(scriptConfig);
        
        if (result.success) {
          this.results.completedScripts++;
        } else {
          this.results.failedScripts++;
        }
        
        // Wait a bit between scripts to avoid resource conflicts
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`💥 Critical error running ${scriptConfig.name}:`, error);
        this.results.failedScripts++;
      }
    }

    // Consolidate and generate final report
    await this.consolidateResults();
    const finalReport = this.generateConsolidatedReport();
    
    // Save consolidated report
    await fs.writeFile(
      'consolidated-tab-test-report.json',
      JSON.stringify(finalReport, null, 2)
    );

    // Save markdown report
    await this.generateMarkdownReport(finalReport);
    
    console.log('\n🎉 All individual tab tests completed!');
    console.log('📄 Consolidated report saved to: consolidated-tab-test-report.json');
    console.log('📝 Markdown report saved to: TAB_TESTING_SUMMARY.md');
  }

  async generateMarkdownReport(report) {
    const markdown = `# 🎯 Individual Tab Testing Summary

## 📊 Overall Results

- **Duration**: ${report.summary.duration} seconds
- **Scripts Run**: ${report.summary.scriptsRun}/${report.summary.totalScripts}
- **Overall Pass Rate**: ${report.summary.overallPassRate}%
- **Total Tests**: ${report.summary.totalTests}
- **Passed**: ${report.summary.passedTests} ✅
- **Failed**: ${report.summary.failedTests} ❌
- **Warnings**: ${report.summary.warningTests} ⚠️

## 📋 Script Results

${report.results.map(result => {
  const passRate = result.summary && result.summary.total > 0 
    ? Math.round((result.summary.passed / result.summary.total) * 100)
    : 0;
  
  return `### ${result.emoji} ${result.name}

- **Pass Rate**: ${passRate}%
- **Tests**: ${result.summary?.passed || 0}/${result.summary?.total || 0}
- **Screenshots**: ${result.screenshots?.length || 0}
${result.error ? `- **Error**: ${result.error}` : ''}
`;
}).join('\n')}

## 💡 Recommendations

**Status**: ${report.recommendations.status.toUpperCase()}

${report.recommendations.passRate >= 80 
  ? '🎊 Excellent! Most interactive elements are working well.'
  : report.recommendations.passRate >= 60
  ? '👍 Good progress! Continue fixing failed tests.'
  : '⚠️ Significant issues detected. Review failed tests carefully.'
}

## 📈 Next Steps

1. Review individual test reports for detailed failure analysis
2. Fix failing tests starting with lowest pass rates
3. Verify screenshot evidence for visual confirmation
4. Re-run tests after fixes to confirm improvements

---
Generated on ${new Date().toISOString()}
`;

    await fs.writeFile('TAB_TESTING_SUMMARY.md', markdown);
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new MasterTabTester();
  tester.run().catch(console.error);
}

module.exports = MasterTabTester; 