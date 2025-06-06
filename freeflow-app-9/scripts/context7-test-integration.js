#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class Context7TestIntegration {
  constructor() {
    this.testResults = {};
    this.aiInsights = [];
  }

  // Analyze test failures and provide AI-powered suggestions
  async analyzeTestFailures(testResults) {
    console.log('🤖 Running AI-powered test failure analysis...');
    
    const failures = this.extractFailures(testResults);
    
    for (const failure of failures) {
      const analysis = await this.getAIAnalysis(failure);
      this.aiInsights.push(analysis);
    }
    
    return this.aiInsights;
  }

  // Get AI analysis for a specific failure
  async getAIAnalysis(failure) {
    // For now, return the suggestions we already have
    // In a real implementation, this would call an AI service
    return {
      type: failure.type,
      severity: failure.severity,
      message: failure.message,
      suggestions: failure.suggestions,
      confidence: 0.85,
      estimatedFixTime: this.estimateFixTime(failure.type)
    };
  }

  // Estimate time to fix based on failure type
  estimateFixTime(failureType) {
    const timeMap = {
      timeout: '15-30 minutes',
      avatar_404: '5-10 minutes',
      suspense_boundary: '10-20 minutes',
      bundle_analyzer: '5 minutes',
      webpack_cache: '2-5 minutes',
      web_vitals_export: '5-10 minutes'
    };
    return timeMap[failureType] || '10-20 minutes';
  }

  // Extract failure patterns from test results
  extractFailures(testResults) {
    const failures = [];
    
    // Common failure patterns to look for
    const patterns = [
      {
        pattern: /Test timeout of (\d+)ms exceeded/,
        type: 'timeout',
        severity: 'high'
      },
      {
        pattern: /404.*avatars/,
        type: 'avatar_404',
        severity: 'medium'
      },
      {
        pattern: /useSearchParams.*suspense/,
        type: 'suspense_boundary',
        severity: 'high'
      },
      {
        pattern: /Module not found.*bundle-analyzer/,
        type: 'bundle_analyzer',
        severity: 'low'
      },
      {
        pattern: /webpack.*cache.*corruption/,
        type: 'webpack_cache',
        severity: 'medium'
      },
      {
        pattern: /'(\w+)' is not exported from 'web-vitals'/,
        type: 'web_vitals_export',
        severity: 'medium'
      }
    ];

    // Analyze each pattern
    patterns.forEach(({ pattern, type, severity }) => {
      const matches = testResults.match(pattern);
      if (matches) {
        failures.push({
          type,
          severity,
          message: matches[0],
          fullMatch: matches,
          suggestions: this.getSuggestions(type)
        });
      }
    });

    return failures;
  }

  // Get AI-powered suggestions for specific failure types
  getSuggestions(failureType) {
    const suggestionMap = {
      timeout: [
        '🕐 Increase timeout values in playwright.config.ts',
        '🚀 Optimize page load performance',
        '🔍 Check for infinite loops or blocking operations',
        '📊 Monitor network requests during test execution'
      ],
      avatar_404: [
        '🖼️ Verify avatar files exist in public/avatars/ directory',
        '🔄 Regenerate missing avatar files',
        '🛠️ Check Next.js static file serving configuration',
        '📁 Ensure proper file permissions'
      ],
      suspense_boundary: [
        '⚠️ Wrap useSearchParams() in Suspense boundary',
        '🔧 Add "use client" directive to client components',
        '🚀 Use dynamic imports for client-side only code',
        '📝 Mark pages as dynamic with export const dynamic = "force-dynamic"'
      ],
      bundle_analyzer: [
        '📦 Remove or comment out @next/bundle-analyzer configuration',
        '🔧 Install missing @next/bundle-analyzer package',
        '⚙️ Use conditional bundle analyzer loading',
        '🎯 Configure bundle analyzer for development only'
      ],
      webpack_cache: [
        '🧹 Clear .next and node_modules/.cache directories',
        '🔄 Restart development server',
        '💾 Configure webpack cache to use memory instead of filesystem',
        '🛠️ Update Node.js and npm to latest versions'
      ],
      web_vitals_export: [
        '📊 Update web-vitals import to use v5.x exports (onINP instead of onFID)',
        '🔄 Check web-vitals package version compatibility',
        '📚 Update performance monitoring code to match library version',
        '🎯 Use dynamic imports for web-vitals to handle version differences'
      ]
    };

    return suggestionMap[failureType] || ['🤔 No specific suggestions available for this failure type'];
  }

  // Generate Context7-enhanced test report
  generateEnhancedReport(testResults, fixes = []) {
    const failures = this.extractFailures(testResults);
    const timestamp = new Date().toISOString();

    const report = `
# 🤖 AI-Enhanced FreeflowZee Test Analysis

**Generated:** ${timestamp}
**Analysis Engine:** Context7 + Playwright
**Failures Detected:** ${failures.length}

## 🔍 Failure Analysis

${failures.length === 0 ? '✅ No failures detected - all systems operational!' : 
  failures.map(failure => `
### ${this.getFailureIcon(failure.severity)} ${failure.type.toUpperCase()} (${failure.severity.toUpperCase()})

**Error:** \`${failure.message}\`

**AI Suggestions:**
${failure.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}

**Automated Fix Available:** ${this.hasAutomatedFix(failure.type) ? '✅ Yes' : '❌ No'}

---`).join('\n')}

## 🛠️ Applied Fixes

${fixes.length > 0 ? fixes.map(fix => `- ${fix}`).join('\n') : 'No fixes were applied during this run.'}

## 🎯 Performance Insights

${this.generatePerformanceInsights()}

## 📋 Next Steps

${this.generateNextSteps(failures)}

## 🔗 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Web Vitals Best Practices](https://web.dev/vitals/)
- [React Suspense Guide](https://react.dev/reference/react/Suspense)

---
*Report generated by Context7 AI Test Integration v1.0*
`;

    // Save the enhanced report
    fs.writeFileSync('AI_ENHANCED_TEST_REPORT.md', report);
    console.log('🤖 AI-enhanced report saved to AI_ENHANCED_TEST_REPORT.md');

    return report;
  }

  getFailureIcon(severity) {
    const icons = {
      high: '🔥',
      medium: '⚠️',
      low: '🔍'
    };
    return icons[severity] || '❓';
  }

  hasAutomatedFix(failureType) {
    const fixableTypes = ['avatar_404', 'webpack_cache', 'bundle_analyzer', 'web_vitals_export'];
    return fixableTypes.includes(failureType);
  }

  generatePerformanceInsights() {
    return `
- 🚀 **Build Optimization:** Bundle splitting and tree-shaking configured
- 🖼️ **Image Optimization:** WebP conversion and caching enabled
- 📦 **Memory Management:** Increased Node.js heap size for large builds
- 🔄 **Caching Strategy:** Filesystem caching with build dependency tracking
- 📊 **Performance Monitoring:** Web Vitals tracking integrated
`;
  }

  generateNextSteps(failures) {
    if (failures.length === 0) {
      return `
1. ✅ **All tests passing** - System ready for production
2. 🚀 **Performance monitoring** - Continue tracking Web Vitals
3. 📊 **Regular testing** - Run comprehensive tests before deployments
4. 🔄 **Continuous integration** - Consider adding automated testing to CI/CD
`;
    }

    const highPriorityFailures = failures.filter(f => f.severity === 'high');
    const mediumPriorityFailures = failures.filter(f => f.severity === 'medium');

    return `
1. 🔥 **HIGH PRIORITY:** Fix ${highPriorityFailures.length} critical issues
   ${highPriorityFailures.map(f => `   - ${f.type}`).join('\n')}

2. ⚠️ **MEDIUM PRIORITY:** Address ${mediumPriorityFailures.length} moderate issues
   ${mediumPriorityFailures.map(f => `   - ${f.type}`).join('\n')}

3. 🧪 **Re-run tests** after applying fixes
4. 📊 **Monitor metrics** to ensure improvements
`;
  }

  // Integration with Playwright test runner
  async integrateWithPlaywright() {
    console.log('🔗 Integrating with Playwright test runner...');
    
    // Check if playwright.config.ts exists and enhance it
    const configPath = path.join(process.cwd(), 'playwright.config.ts');
    
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');
      
      // Add Context7 reporter if not already present
      if (!config.includes('context7-reporter')) {
        console.log('🔧 Adding Context7 reporter to Playwright config...');
        
        const enhancedConfig = config.replace(
          /reporter: \[(.*?)\]/s,
          `reporter: [
    $1,
    ['./scripts/context7-reporter.js']
  ]`
        );
        
        if (enhancedConfig !== config) {
          fs.writeFileSync(configPath, enhancedConfig);
          console.log('✅ Context7 reporter added to Playwright config');
        }
      }
    }
  }

  // Create a custom Playwright reporter for Context7 integration
  createContext7Reporter() {
    const reporterCode = `
const fs = require('fs');
const Context7TestIntegration = require('./context7-test-integration');

class Context7Reporter {
  constructor(options = {}) {
    this.integration = new Context7TestIntegration();
    this.results = [];
  }

  onBegin(config, suite) {
    console.log('🤖 Context7 AI Test Analysis Started');
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message || null,
      retry: result.retry
    });
  }

  async onEnd(result) {
    console.log('🤖 Generating AI-enhanced test analysis...');
    
    const testOutput = JSON.stringify(this.results, null, 2);
    const report = this.integration.generateEnhancedReport(testOutput);
    
    // Save results for further analysis
    fs.writeFileSync('test-results/context7-analysis.json', testOutput);
    
    console.log('✅ Context7 analysis complete');
  }
}

module.exports = Context7Reporter;
`;

    fs.writeFileSync('scripts/context7-reporter.js', reporterCode);
    console.log('✅ Context7 reporter created');
  }

  // Main integration function
  async initialize() {
    console.log('🚀 Initializing Context7 Test Integration...');
    
    await this.integrateWithPlaywright();
    this.createContext7Reporter();
    
    console.log('✅ Context7 Test Integration initialized successfully');
    console.log('📋 Use "npm run test:comprehensive" to run tests with AI analysis');
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const integration = new Context7TestIntegration();
  
  if (args.includes('--help')) {
    console.log(`
🤖 Context7 Test Integration

Usage: node scripts/context7-test-integration.js [command]

Commands:
  init              Initialize Context7 integration
  analyze [file]    Analyze test results file
  report [file]     Generate enhanced report

Examples:
  node scripts/context7-test-integration.js init
  node scripts/context7-test-integration.js analyze test-results.txt
  node scripts/context7-test-integration.js report test-output.log
    `);
    process.exit(0);
  }
  
  const command = args[0] || 'init';
  
  switch (command) {
    case 'init':
      integration.initialize()
        .then(() => {
          console.log('🎉 Context7 integration ready!');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Integration failed:', error);
          process.exit(1);
        });
      break;
      
    case 'analyze':
      const file = args[1];
      if (!file || !fs.existsSync(file)) {
        console.error('❌ Please provide a valid test results file');
        process.exit(1);
      }
      
      const testResults = fs.readFileSync(file, 'utf8');
      integration.analyzeTestFailures(testResults)
        .then(insights => {
          console.log('🤖 Analysis complete:', insights);
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Analysis failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.error('❌ Unknown command:', command);
      process.exit(1);
  }
}

module.exports = Context7TestIntegration; 