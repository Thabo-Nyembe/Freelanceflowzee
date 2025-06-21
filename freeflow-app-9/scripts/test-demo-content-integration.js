#!/usr/bin/env node

/**
 * 🎯 BIT 1: DEMO CONTENT INTEGRATION TEST
 * 
 * This script tests the demo content integration in small, manageable bits
 * to ensure everything is working properly for feature demonstrations.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 BIT 1: Demo Content Integration Test');
console.log('=====================================');

class DemoContentTester {
  constructor() {
    this.results = {
      contentFiles: {},
      apiEndpoints: {},
      components: {},
      summary: { passed: 0, failed: 0, errors: [] }
    };
  }

  // Test 1: Verify content files exist and are valid
  async testContentFiles() {
    console.log('\n📁 Testing Content Files...');
    
    const contentDir = path.join(process.cwd(), 'public', 'enhanced-content', 'content');
    const requiredFiles = [
      'enhanced-users.json',
      'enhanced-projects.json',
      'enhanced-posts.json',
      'enhanced-files.json',
      'enhanced-transactions.json',
      'enhanced-analytics.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(contentDir, file);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const count = Array.isArray(content) ? content.length : 
                       content.files ? content.files.length : 1;
          
          console.log(`  ✅ ${file.padEnd(25)} | ${count} items`);
          this.results.contentFiles[file] = { status: 'passed', count };
          this.results.summary.passed++;
        } else {
          console.log(`  ❌ ${file.padEnd(25)} | NOT FOUND`);
          this.results.contentFiles[file] = { status: 'failed', error: 'File not found' };
          this.results.summary.failed++;
        }
      } catch (error) {
        console.log(`  ❌ ${file.padEnd(25)} | INVALID JSON`);
        this.results.contentFiles[file] = { status: 'failed', error: error.message };
        this.results.summary.failed++;
      }
    }
  }

  // Test 2: Check if demo content manager exists
  async testDemoContentManager() {
    console.log('\n🧩 Testing Demo Content Manager...');
    
    const managerPath = path.join(process.cwd(), 'lib', 'demo-content.ts');
    
    if (fs.existsSync(managerPath)) {
      console.log('  ✅ Demo Content Manager exists');
      
      // Check for key functions
      const content = fs.readFileSync(managerPath, 'utf-8');
      const functions = [
        'getDemoUsers',
        'getDemoProjects', 
        'getDemoPosts',
        'getDemoFiles',
        'getDemoTransactions',
        'getDemoAnalytics'
      ];
      
      let foundFunctions = 0;
      for (const func of functions) {
        if (content.includes(func)) {
          console.log(`    ✅ ${func}`);
          foundFunctions++;
        } else {
          console.log(`    ❌ ${func} - Missing`);
        }
      }
      
      this.results.components.demoManager = {
        status: foundFunctions >= 4 ? 'passed' : 'partial',
        foundFunctions,
        totalFunctions: functions.length
      };
      
      if (foundFunctions >= 4) this.results.summary.passed++;
      else this.results.summary.failed++;
      
    } else {
      console.log('  ❌ Demo Content Manager not found');
      this.results.components.demoManager = { status: 'failed', error: 'Manager not found' };
      this.results.summary.failed++;
    }
  }

  // Test 3: Check API endpoints
  async testAPIEndpoints() {
    console.log('\n🔗 Testing API Endpoints...');
    
    const apiPath = path.join(process.cwd(), 'app', 'api', 'demo', 'content', 'route.ts');
    
    if (fs.existsSync(apiPath)) {
      console.log('  ✅ Demo API endpoint exists');
      
      const content = fs.readFileSync(apiPath, 'utf-8');
      const features = [
        'GET',
        'POST', 
        'type=users',
        'type=projects',
        'type=analytics'
      ];
      
      let foundFeatures = 0;
      for (const feature of features) {
        if (content.includes(feature)) {
          console.log(`    ✅ ${feature} support`);
          foundFeatures++;
        } else {
          console.log(`    ❌ ${feature} - Missing`);
        }
      }
      
      this.results.apiEndpoints.demoAPI = {
        status: foundFeatures >= 3 ? 'passed' : 'partial',
        foundFeatures,
        totalFeatures: features.length
      };
      
      if (foundFeatures >= 3) this.results.summary.passed++;
      else this.results.summary.failed++;
      
    } else {
      console.log('  ❌ Demo API endpoint not found');
      this.results.apiEndpoints.demoAPI = { status: 'failed', error: 'API not found' };
      this.results.summary.failed++;
    }
  }

  // Test 4: Check React provider
  async testReactProvider() {
    console.log('\n⚛️  Testing React Provider...');
    
    const providerPath = path.join(process.cwd(), 'components', 'dashboard', 'demo-content-provider.tsx');
    
    if (fs.existsSync(providerPath)) {
      console.log('  ✅ Demo Content Provider exists');
      
      const content = fs.readFileSync(providerPath, 'utf-8');
      const hooks = [
        'useDemoContent',
        'useDashboardMetrics',
        'useCommunityMetrics',
        'useFileSystemMetrics'
      ];
      
      let foundHooks = 0;
      for (const hook of hooks) {
        if (content.includes(hook)) {
          console.log(`    ✅ ${hook}`);
          foundHooks++;
        } else {
          console.log(`    ❌ ${hook} - Missing`);
        }
      }
      
      this.results.components.reactProvider = {
        status: foundHooks >= 2 ? 'passed' : 'partial',
        foundHooks,
        totalHooks: hooks.length
      };
      
      if (foundHooks >= 2) this.results.summary.passed++;
      else this.results.summary.failed++;
      
    } else {
      console.log('  ❌ Demo Content Provider not found');
      this.results.components.reactProvider = { status: 'failed', error: 'Provider not found' };
      this.results.summary.failed++;
    }
  }

  // Generate summary report
  generateReport() {
    console.log('\n📋 DEMO CONTENT INTEGRATION SUMMARY');
    console.log('===================================');
    
    const totalTests = this.results.summary.passed + this.results.summary.failed;
    const successRate = Math.round((this.results.summary.passed / totalTests) * 100);
    
    console.log(`📊 Tests: ${this.results.summary.passed}/${totalTests} passed (${successRate}%)`);
    
    if (successRate >= 80) {
      console.log('🎉 EXCELLENT! Demo content integration is ready');
    } else if (successRate >= 60) {
      console.log('✅ GOOD! Most components are working');
    } else {
      console.log('⚠️  NEEDS WORK! Several components need attention');
    }

    // Show next steps
    console.log('\n🚀 NEXT BITS:');
    if (successRate >= 80) {
      console.log('   Bit 2: Test specific dashboard components');
      console.log('   Bit 3: Verify API responses');
      console.log('   Bit 4: Test React hooks integration');
      console.log('   Bit 5: Create feature demonstration flows');
    } else {
      console.log('   🔧 Fix failing components first');
      console.log('   📝 Check file paths and imports');
      console.log('   🔄 Re-run this test after fixes');
    }

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      successRate,
      results: this.results,
      recommendations: this.getRecommendations(successRate)
    };

    fs.writeFileSync('demo-content-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: demo-content-test-report.json');

    return successRate;
  }

  getRecommendations(successRate) {
    if (successRate >= 80) {
      return [
        'Demo content integration is ready for feature demonstrations',
        'Proceed with testing individual dashboard components',
        'Consider creating guided demo flows for different audiences'
      ];
    } else if (successRate >= 60) {
      return [
        'Fix any missing components or API endpoints',
        'Verify all file paths are correct',
        'Test API responses manually'
      ];
    } else {
      return [
        'Critical components are missing - check installation',
        'Verify all required files exist in correct locations',
        'Check for TypeScript compilation errors',
        'Run npm install to ensure dependencies are installed'
      ];
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Bit 1: Demo Content Integration Test...\n');

      await this.testContentFiles();
      await this.testDemoContentManager();
      await this.testAPIEndpoints();
      await this.testReactProvider();

      const successRate = this.generateReport();
      
      process.exit(successRate >= 60 ? 0 : 1);
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new DemoContentTester();
  tester.run();
}

module.exports = DemoContentTester; 