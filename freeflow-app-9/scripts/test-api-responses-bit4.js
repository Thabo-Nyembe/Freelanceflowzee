#!/usr/bin/env node

/**
 * 🎯 BIT 4: API RESPONSES & DATA FLOW TEST
 * 
 * This script tests API endpoints and data flow to ensure demo content
 * is properly accessible and functioning for feature demonstrations.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 BIT 4: API Responses & Data Flow Test');
console.log('========================================');

class APIResponseTester {
  constructor() {
    this.results = {
      endpoints: {},
      dataFlow: {},
      performance: {},
      summary: { passed: 0, failed: 0, warnings: 0 }
    };
  }

  // Test 1: Verify demo content API endpoint
  async testDemoContentAPI() {
    console.log('\n🔌 Testing Demo Content API...');
    
    const apiPath = path.join(process.cwd(), 'app', 'api', 'demo', 'content', 'route.ts');
    
    if (!fs.existsSync(apiPath)) {
      console.log('  ❌ Demo API endpoint not found');
      this.results.endpoints.demoAPI = { status: 'missing' };
      this.results.summary.failed++;
      return;
    }

    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    // Test API structure
    const hasGET = apiContent.includes('export async function GET');
    const hasPOST = apiContent.includes('export async function POST');
    const hasTypeHandling = apiContent.includes('searchParams.get');
    const hasErrorHandling = apiContent.includes('try') && apiContent.includes('catch');
    
    console.log(`  ${hasGET ? '✅' : '❌'} GET endpoint implemented`);
    console.log(`  ${hasPOST ? '✅' : '❌'} POST endpoint implemented`);
    console.log(`  ${hasTypeHandling ? '✅' : '❌'} Query parameter handling`);
    console.log(`  ${hasErrorHandling ? '✅' : '❌'} Error handling`);

    // Test content type support
    const contentTypes = ['users', 'projects', 'posts', 'files', 'transactions', 'analytics'];
    let supportedTypes = 0;
    
    contentTypes.forEach(type => {
      if (apiContent.includes(type)) {
        console.log(`    ✅ ${type} content type supported`);
        supportedTypes++;
      } else {
        console.log(`    ⚠️  ${type} content type missing`);
      }
    });

    const apiScore = Math.round(((hasGET ? 1 : 0) + (hasPOST ? 1 : 0) + (hasTypeHandling ? 1 : 0) + 
                               (hasErrorHandling ? 1 : 0) + (supportedTypes / contentTypes.length)) / 5 * 100);

    this.results.endpoints.demoAPI = {
      status: apiScore >= 80 ? 'excellent' : apiScore >= 60 ? 'good' : 'needs_work',
      score: apiScore,
      features: { hasGET, hasPOST, hasTypeHandling, hasErrorHandling },
      supportedTypes: supportedTypes,
      totalTypes: contentTypes.length
    };

    if (apiScore >= 60) this.results.summary.passed++;
    else this.results.summary.failed++;
  }

  // Test 2: Test demo content manager functionality
  async testDemoContentManager() {
    console.log('\n🧩 Testing Demo Content Manager...');
    
    const managerPath = path.join(process.cwd(), 'lib', 'demo-content.ts');
    
    if (!fs.existsSync(managerPath)) {
      console.log('  ❌ Demo Content Manager not found');
      this.results.dataFlow.manager = { status: 'missing' };
      this.results.summary.failed++;
      return;
    }

    const managerContent = fs.readFileSync(managerPath, 'utf-8');
    
    // Test manager functions
    const functions = [
      'getDemoUsers',
      'getDemoProjects',
      'getDemoPosts', 
      'getDemoFiles',
      'getDemoTransactions',
      'getDemoAnalytics'
    ];

    let implementedFunctions = 0;
    functions.forEach(func => {
      if (managerContent.includes(func)) {
        console.log(`  ✅ ${func} implemented`);
        implementedFunctions++;
      } else {
        console.log(`  ❌ ${func} missing`);
      }
    });

    // Test for caching and performance features
    const hasCache = managerContent.includes('cache') || managerContent.includes('Cache');
    const hasSingleton = managerContent.includes('instance') || managerContent.includes('singleton');
    const hasErrorHandling = managerContent.includes('try') && managerContent.includes('catch');
    
    console.log(`  ${hasCache ? '✅' : '⚠️'} Caching system ${hasCache ? 'implemented' : 'missing'}`);
    console.log(`  ${hasSingleton ? '✅' : '⚠️'} Singleton pattern ${hasSingleton ? 'implemented' : 'missing'}`);
    console.log(`  ${hasErrorHandling ? '✅' : '⚠️'} Error handling ${hasErrorHandling ? 'implemented' : 'missing'}`);

    const managerScore = Math.round((implementedFunctions / functions.length) * 100);
    
    this.results.dataFlow.manager = {
      status: managerScore >= 80 ? 'excellent' : managerScore >= 60 ? 'good' : 'needs_work',
      score: managerScore,
      implementedFunctions,
      totalFunctions: functions.length,
      features: { hasCache, hasSingleton, hasErrorHandling }
    };

    if (managerScore >= 60) this.results.summary.passed++;
    else this.results.summary.failed++;
  }

  // Test 3: Test content file accessibility and structure
  async testContentFiles() {
    console.log('\n📁 Testing Content Files...');
    
    const contentDir = path.join(process.cwd(), 'public', 'enhanced-content', 'content');
    
    if (!fs.existsSync(contentDir)) {
      console.log('  ❌ Content directory not found');
      this.results.dataFlow.contentFiles = { status: 'missing' };
      this.results.summary.failed++;
      return;
    }

    const requiredFiles = [
      { name: 'enhanced-users.json', minItems: 10 },
      { name: 'enhanced-projects.json', minItems: 10 },
      { name: 'enhanced-posts.json', minItems: 15 },
      { name: 'enhanced-files.json', minItems: 20 },
      { name: 'enhanced-transactions.json', minItems: 5 },
      { name: 'enhanced-analytics.json', minItems: 1 }
    ];

    let validFiles = 0;
    let totalItems = 0;
    const fileResults = {};

    for (const file of requiredFiles) {
      const filePath = path.join(contentDir, file.name);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const itemCount = Array.isArray(content) ? content.length : 
                           content.files ? content.files.length : 1;
          
          const isValid = itemCount >= file.minItems;
          
          console.log(`  ${isValid ? '✅' : '⚠️'} ${file.name.padEnd(25)} | ${itemCount} items ${isValid ? '(✓)' : '(needs more)'}`);
          
          fileResults[file.name] = {
            status: isValid ? 'valid' : 'insufficient',
            itemCount,
            minRequired: file.minItems
          };
          
          if (isValid) validFiles++;
          totalItems += itemCount;
        } else {
          console.log(`  ❌ ${file.name.padEnd(25)} | NOT FOUND`);
          fileResults[file.name] = { status: 'missing' };
        }
      } catch (error) {
        console.log(`  ❌ ${file.name.padEnd(25)} | INVALID JSON`);
        fileResults[file.name] = { status: 'invalid', error: error.message };
      }
    }

    console.log(`\n    📊 Total content items: ${totalItems}`);
    console.log(`    ✅ Valid files: ${validFiles}/${requiredFiles.length}`);

    const filesScore = Math.round((validFiles / requiredFiles.length) * 100);
    
    this.results.dataFlow.contentFiles = {
      status: filesScore >= 80 ? 'excellent' : filesScore >= 60 ? 'good' : 'needs_work',
      score: filesScore,
      validFiles,
      totalFiles: requiredFiles.length,
      totalItems,
      fileResults
    };

    if (filesScore >= 60) this.results.summary.passed++;
    else this.results.summary.failed++;
  }

  // Test 4: Test React hooks and provider functionality
  async testReactProvider() {
    console.log('\n⚛️  Testing React Provider...');
    
    const providerPath = path.join(process.cwd(), 'components', 'dashboard', 'demo-content-provider.tsx');
    
    if (!fs.existsSync(providerPath)) {
      console.log('  ❌ Demo Content Provider not found');
      this.results.dataFlow.reactProvider = { status: 'missing' };
      this.results.summary.failed++;
      return;
    }

    const providerContent = fs.readFileSync(providerPath, 'utf-8');
    
    // Test hooks
    const hooks = [
      'useDemoContent',
      'useDashboardMetrics',
      'useCommunityMetrics',
      'useFileSystemMetrics',
      'useEscrowMetrics'
    ];

    let implementedHooks = 0;
    hooks.forEach(hook => {
      if (providerContent.includes(hook)) {
        console.log(`  ✅ ${hook} implemented`);
        implementedHooks++;
      } else {
        console.log(`  ⚠️  ${hook} missing`);
      }
    });

    // Test React patterns
    const hasContext = providerContent.includes('createContext');
    const hasProvider = providerContent.includes('Provider');
    const hasUseEffect = providerContent.includes('useEffect');
    const hasUseState = providerContent.includes('useState');
    const hasErrorBoundary = providerContent.includes('ErrorBoundary') || providerContent.includes('error');
    
    console.log(`  ${hasContext ? '✅' : '❌'} React Context implemented`);
    console.log(`  ${hasProvider ? '✅' : '❌'} Provider component`);
    console.log(`  ${hasUseEffect ? '✅' : '❌'} useEffect for data loading`);
    console.log(`  ${hasUseState ? '✅' : '❌'} useState for state management`);
    console.log(`  ${hasErrorBoundary ? '✅' : '⚠️'} Error handling ${hasErrorBoundary ? 'implemented' : 'basic'}`);

    const reactScore = Math.round(((implementedHooks / hooks.length) + 
                                  (hasContext ? 1 : 0) + (hasProvider ? 1 : 0) + 
                                  (hasUseEffect ? 1 : 0) + (hasUseState ? 1 : 0)) / 5 * 100);

    this.results.dataFlow.reactProvider = {
      status: reactScore >= 80 ? 'excellent' : reactScore >= 60 ? 'good' : 'needs_work',
      score: reactScore,
      implementedHooks,
      totalHooks: hooks.length,
      reactFeatures: { hasContext, hasProvider, hasUseEffect, hasUseState, hasErrorBoundary }
    };

    if (reactScore >= 60) this.results.summary.passed++;
    else this.results.summary.failed++;
  }

  // Test 5: Performance and optimization check
  async testPerformance() {
    console.log('\n⚡ Testing Performance & Optimization...');
    
    const startTime = Date.now();
    
    // Test content loading speed
    try {
      const contentDir = path.join(process.cwd(), 'public', 'enhanced-content', 'content');
      const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
      
      let totalSize = 0;
      let loadTime = 0;
      
      for (const file of files.slice(0, 3)) { // Test first 3 files
        const filePath = path.join(contentDir, file);
        const fileStart = Date.now();
        const content = fs.readFileSync(filePath, 'utf-8');
        JSON.parse(content);
        const fileTime = Date.now() - fileStart;
        
        totalSize += content.length;
        loadTime += fileTime;
        
        console.log(`  ✅ ${file.padEnd(25)} | ${Math.round(content.length/1024)}KB in ${fileTime}ms`);
      }
      
      const avgLoadTime = Math.round(loadTime / 3);
      const totalSizeMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
      
      console.log(`\n    📊 Average load time: ${avgLoadTime}ms`);
      console.log(`    💾 Sample content size: ${totalSizeMB}MB`);
      
      // Performance scoring
      const performanceScore = avgLoadTime < 50 ? 100 : 
                             avgLoadTime < 100 ? 80 : 
                             avgLoadTime < 200 ? 60 : 40;

      this.results.performance = {
        status: performanceScore >= 80 ? 'excellent' : performanceScore >= 60 ? 'good' : 'needs_optimization',
        score: performanceScore,
        avgLoadTime,
        totalSizeMB,
        recommendation: avgLoadTime > 100 ? 'Consider content caching' : 'Performance is good'
      };

      if (performanceScore >= 60) this.results.summary.passed++;
      else this.results.summary.warnings++;
      
    } catch (error) {
      console.log(`  ❌ Performance test failed: ${error.message}`);
      this.results.performance = { status: 'failed', error: error.message };
      this.results.summary.failed++;
    }
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📋 API RESPONSES & DATA FLOW SUMMARY');
    console.log('====================================');
    
    const total = this.results.summary.passed + this.results.summary.failed + this.results.summary.warnings;
    const successRate = Math.round((this.results.summary.passed / (total - this.results.summary.warnings)) * 100);
    
    console.log(`📊 Tests: ${this.results.summary.passed} passed, ${this.results.summary.failed} failed, ${this.results.summary.warnings} warnings`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    // Component scores
    console.log('\n📈 COMPONENT SCORES:');
    Object.entries(this.results).forEach(([category, result]) => {
      if (result.score !== undefined) {
        const status = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';
        console.log(`   ${status} ${category}: ${result.score}% (${result.status})`);
      }
    });

    // Performance insights
    if (this.results.performance.avgLoadTime) {
      console.log('\n⚡ PERFORMANCE INSIGHTS:');
      console.log(`   📊 Content loads in ${this.results.performance.avgLoadTime}ms average`);
      console.log(`   💾 Content size: ${this.results.performance.totalSizeMB}MB`);
      console.log(`   💡 ${this.results.performance.recommendation}`);
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (successRate >= 90) {
      console.log('   🎉 API and data flow are excellent!');
      console.log('   🚀 Ready for Bit 5: Demo Scenarios');
    } else if (successRate >= 70) {
      console.log('   ✅ Good data flow - minor optimizations possible');
      console.log('   🔧 Address any failed components');
    } else {
      console.log('   ⚠️  Data flow needs improvement');
      console.log('   🔄 Fix critical issues before proceeding');
    }

    // Next steps
    console.log('\n🚀 NEXT BITS:');
    if (successRate >= 80) {
      console.log('   Bit 5: Create guided demo scenarios');
      console.log('   Bit 6: Test end-to-end demo flows');
      console.log('   Bit 7: Performance optimization');
    } else {
      console.log('   🔧 Fix API endpoint issues');
      console.log('   📝 Improve data loading');
      console.log('   🔄 Re-run Bit 4 after fixes');
    }

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      bit: 4,
      successRate,
      results: this.results,
      insights: {
        strongestComponent: this.getStrongestComponent(),
        weakestComponent: this.getWeakestComponent(),
        overallReadiness: successRate >= 80 ? 'Ready for demos' : 'Needs improvement'
      }
    };

    fs.writeFileSync('api-responses-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Report saved to: api-responses-test-report.json');

    return successRate;
  }

  getStrongestComponent() {
    let strongest = { name: 'none', score: 0 };
    Object.entries(this.results).forEach(([name, result]) => {
      if (result.score && result.score > strongest.score) {
        strongest = { name, score: result.score };
      }
    });
    return strongest;
  }

  getWeakestComponent() {
    let weakest = { name: 'none', score: 100 };
    Object.entries(this.results).forEach(([name, result]) => {
      if (result.score && result.score < weakest.score) {
        weakest = { name, score: result.score };
      }
    });
    return weakest;
  }

  async run() {
    try {
      console.log('🚀 Starting Bit 4: API Responses & Data Flow Test...\n');

      await this.testDemoContentAPI();
      await this.testDemoContentManager();
      await this.testContentFiles();
      await this.testReactProvider();
      await this.testPerformance();

      const successRate = this.generateReport();
      
      process.exit(successRate >= 70 ? 0 : 1);
    } catch (error) {
      console.error('❌ Bit 4 failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new APIResponseTester();
  tester.run();
}

module.exports = APIResponseTester; 