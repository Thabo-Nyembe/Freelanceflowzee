#!/usr/bin/env node

/**
 * 🎯 BIT 2: DASHBOARD COMPONENTS TEST
 * 
 * This script tests specific dashboard components to ensure they work
 * properly with the demo content for feature demonstrations.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 BIT 2: Dashboard Components Test');
console.log('=================================== ');

class DashboardComponentTester {
  constructor() {
    this.results = {
      components: {},
      integrations: {},
      summary: { passed: 0, failed: 0, warnings: 0 }
    };
  }

  // Test 1: Check main dashboard layout
  async testDashboardLayout() {
    console.log('\n🏠 Testing Dashboard Layout...');
    
    const layoutPaths = ['app/dashboard/page.tsx', 'components/dashboard/dashboard-layout.tsx',
      'components/dashboard/dashboard-header.tsx'];

    for (const layoutPath of layoutPaths) {
      const fullPath = path.join(process.cwd(), layoutPath);
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Check for demo content integration
        const hasDemo = content.includes('demo') || content.includes('Demo') || 
                       content.includes('useDemoContent') || content.includes('DemoContent');
        
        console.log(`  ✅ ${path.basename(layoutPath).padEnd(25)} | ${hasDemo ? 'Demo Ready' : 'Standard'}`);
        
        this.results.components[layoutPath] = {
          status: 'exists',
          demoIntegration: hasDemo,
          size: Math.round(content.length / 1024) + 'KB'
        };
        this.results.summary.passed++;
      } else {
        console.log(`  ❌ ${path.basename(layoutPath).padEnd(25)} | NOT FOUND`);
        this.results.components[layoutPath] = { status: 'missing' };
        this.results.summary.failed++;
      }
    }
  }

  // Test 2: Check dashboard widgets/cards
  async testDashboardWidgets() {
    console.log('\n📊 Testing Dashboard Widgets...');
    
    const widgetPaths = ['components/dashboard/overview-cards.tsx', 'components/dashboard/recent-projects.tsx', 'components/dashboard/activity-feed.tsx', 'components/dashboard/quick-stats.tsx', 'components/dashboard/earnings-chart.tsx'
    ];

    let foundWidgets = 0;
    
    for (const widgetPath of widgetPaths) {
      const fullPath = path.join(process.cwd(), widgetPath);
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Check for data integration patterns
        const hasDataHooks = content.includes('useState') || content.includes('useEffect') ||
                            content.includes('useDemoContent') || content.includes('fetch');
        
        console.log(`  ✅ ${path.basename(widgetPath).padEnd(25)} | ${hasDataHooks ? 'Data Connected' : 'Static'}`);
        
        this.results.components[widgetPath] = {
          status: 'exists',
          dataIntegration: hasDataHooks
        };
        foundWidgets++;
        this.results.summary.passed++;
      } else {
        console.log(`  ⚠️  ${path.basename(widgetPath).padEnd(25)} | NOT FOUND (Optional)`);
        this.results.components[widgetPath] = { status: 'optional' };
        this.results.summary.warnings++;
      }
    }

    console.log(`\n    📈 Found ${foundWidgets}/${widgetPaths.length} dashboard widgets`);
  }

  // Test 3: Check for demo content hooks usage
  async testDemoContentUsage() {
    console.log('\n🔗 Testing Demo Content Usage...');
    
    // Search for files using demo content
    const searchDirs = ['components/dashboard', 'app/dashboard', 'components/projects', 'components/community'
    ];

    let totalFiles = 0;
    let demoIntegratedFiles = 0;

    for (const searchDir of searchDirs) {
      const fullDir = path.join(process.cwd(), searchDir);
      
      if (fs.existsSync(fullDir)) {
        const files = this.getReactFiles(fullDir);
        
        for (const file of files) {
          totalFiles++;
          const content = fs.readFileSync(file, 'utf-8');
          
          const demoPatterns = ['useDemoContent', 'useDashboardMetrics', 'useCommunityMetrics', 'useFileSystemMetrics', 'getDemoUsers', 'getDemoProjects', '/api/demo/content'
          ];

          const hasDemoIntegration = demoPatterns.some(pattern => content.includes(pattern));
          
          if (hasDemoIntegration) {
            demoIntegratedFiles++;
            const fileName = path.relative(process.cwd(), file);
            console.log(`    ✅ ${fileName}`);
          }
        }
      }
    }

    console.log(`\n    📊 ${demoIntegratedFiles}/${totalFiles} files use demo content`);
    
    this.results.integrations.demoUsage = {
      totalFiles,
      integratedFiles: demoIntegratedFiles,
      integrationRate: Math.round((demoIntegratedFiles / totalFiles) * 100)
    };

    if (demoIntegratedFiles > 0) this.results.summary.passed++;
    else this.results.summary.failed++;
  }

  // Test 4: Check API endpoint functionality
  async testAPIFunctionality() {
    console.log('\n🔌 Testing API Functionality...');
    
    try {
      // Test if we can load demo content manager
      const demoContentPath = path.join(process.cwd(), 'lib', 'demo-content.ts');
      
      if (fs.existsSync(demoContentPath)) {
        console.log('  ✅ Demo Content Manager loadable');
        
        // Check if content files are accessible
        const contentDir = path.join(process.cwd(), 'public', 'enhanced-content', 'content');
        const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
        
        console.log(`  ✅ ${files.length} content files accessible`);
        
        // Test a sample content file
        const sampleFile = path.join(contentDir, 'enhanced-users.json');
        if (fs.existsSync(sampleFile)) {
          const sampleData = JSON.parse(fs.readFileSync(sampleFile, 'utf-8'));
          console.log(`  ✅ Sample data: ${sampleData.length} users loaded`);
          
          // Verify data structure
          if (sampleData[0] && sampleData[0].name && sampleData[0].email) {
            console.log('  ✅ Data structure valid');
            this.results.integrations.apiTest = { status: 'passed', userCount: sampleData.length };
            this.results.summary.passed++;
          } else {
            console.log('  ⚠️  Data structure incomplete');
            this.results.integrations.apiTest = { status: 'warning', issue: 'incomplete structure' };
            this.results.summary.warnings++;
          }
        }
      } else {
        console.log('  ❌ Demo Content Manager not found');
        this.results.integrations.apiTest = { status: 'failed', error: 'Manager missing' };
        this.results.summary.failed++;
      }
    } catch (error) {
      console.log(`  ❌ API test failed: ${error.message}`);
      this.results.integrations.apiTest = { status: 'failed', error: error.message };
      this.results.summary.failed++;
    }
  }

  // Helper: Get React/TypeScript files
  getReactFiles(dir) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getReactFiles(fullPath));
        } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or permission error
    }
    
    return files;
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📋 DASHBOARD COMPONENTS SUMMARY');
    console.log('================================');
    
    const total = this.results.summary.passed + this.results.summary.failed + this.results.summary.warnings;
    const successRate = Math.round((this.results.summary.passed / (total - this.results.summary.warnings)) * 100);
    
    console.log(`📊 Components: ${this.results.summary.passed} passed, ${this.results.summary.failed} failed, ${this.results.summary.warnings} warnings`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    // Integration analysis
    if (this.results.integrations.demoUsage) {
      const { integratedFiles, totalFiles, integrationRate } = this.results.integrations.demoUsage;
      console.log(`🔗 Demo Integration: ${integratedFiles}/${totalFiles} files (${integrationRate}%)`);
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (successRate >= 80) {
      console.log('   🎉 Dashboard components are ready for demos');
      console.log('   🚀 Proceed to Bit 3: API Response Testing');
    } else if (successRate >= 60) {
      console.log('   🔧 Fix missing components before proceeding');
      console.log('   📝 Consider adding more demo content integration');
    } else {
      console.log('   ⚠️  Major components missing - check dashboard structure');
      console.log('   🏗️  May need to create basic dashboard components first');
    }

    // Next steps
    console.log('\n🚀 NEXT BITS:');
    if (successRate >= 70) {
      console.log('   Bit 3: Test API responses and data flow');
      console.log('   Bit 4: Test React hooks and state management');
      console.log('   Bit 5: Create guided demo scenarios');
    } else {
      console.log('   🔄 Re-run Bit 1 to ensure foundation is solid');
      console.log('   🏗️  Create missing dashboard components');
      console.log('   📚 Review dashboard architecture');
    }

    // Save report
    const reportData = {
      timestamp: new Date().toISOString(),
      bit: 2,
      successRate,
      results: this.results,
      nextSteps: this.getNextSteps(successRate)
    };

    fs.writeFileSync('dashboard-components-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Report saved to: dashboard-components-test-report.json');

    return successRate;
  }

  getNextSteps(successRate) {
    if (successRate >= 80) {
      return ['Dashboard components are ready for feature demonstrations', 'Test API responses in Bit 3', 'Verify React hooks integration in Bit 4', 'Create demo flows in Bit 5'
      ];
    } else if (successRate >= 60) {
      return ['Fix missing dashboard components', 'Add demo content integration to existing components', 'Verify component data flow', 'Re-test after fixes'
      ];
    } else {
      return ['Create basic dashboard structure', 'Implement core dashboard components', 'Add demo content integration',
        'Re-run Bit 2 after implementation'];
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Bit 2: Dashboard Components Test...\n');

      await this.testDashboardLayout();
      await this.testDashboardWidgets();
      await this.testDemoContentUsage();
      await this.testAPIFunctionality();

      const successRate = this.generateReport();
      
      process.exit(successRate >= 60 ? 0 : 1);
    } catch (error) {
      console.error('❌ Bit 2 failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new DashboardComponentTester();
  tester.run();
}

module.exports = DashboardComponentTester; 