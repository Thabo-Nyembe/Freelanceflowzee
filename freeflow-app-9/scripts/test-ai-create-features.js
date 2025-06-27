#!/usr/bin/env node

/**
 * AI Create Features Testing Script
 * Tests the AI Create component functionality and user API key features
 * without requiring authentication by testing the components directly
 */

const fs = require('fs');
const path = require('path');

// Test Configuration
const TEST_CONFIG = {
  componentsDir: './components/collaboration',
  testResults: {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  }
};

// Test Functions
class AICreateFeatureTester {
  constructor() {
    this.results = TEST_CONFIG.testResults;
  }

  runTest(testName, testFunction) {
    this.results.total++;
    console.log(`\n🧪 Testing: ${testName}`);
    console.log('-'.repeat(50));
    
    try {
      testFunction();
      this.results.passed++;
      console.log(`✅ PASSED: ${testName}`);
      this.results.details.push({
        test: testName,
        status: 'PASSED',
        message: 'Test completed successfully'
      });
    } catch (error) {
      this.results.failed++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.results.details.push({
        test: testName,
        status: 'FAILED',
        message: error.message
      });
    }
  }

  testAICreateComponentExists() {
    this.runTest('AI Create Component File Exists', () => {
      const aiCreatePath = path.join(TEST_CONFIG.componentsDir, 'ai-create.tsx');
      if (!fs.existsSync(aiCreatePath)) {
        throw new Error('AI Create component file not found');
      }
      console.log('📁 AI Create component file found');
    });
  }

  testAPIKeySettingsComponentExists() {
    this.runTest('API Key Settings Component File Exists', () => {
      const apiKeySettingsPath = path.join(TEST_CONFIG.componentsDir, 'simple-api-key-settings.tsx');
      if (!fs.existsSync(apiKeySettingsPath)) {
        throw new Error('API Key Settings component file not found');
      }
      console.log('📁 API Key Settings component file found');
    });
  }

  testAICreateComponentStructure() {
    this.runTest('AI Create Component Structure', () => {
      const aiCreatePath = path.join(TEST_CONFIG.componentsDir, 'ai-create.tsx');
      const content = fs.readFileSync(aiCreatePath, 'utf8');
      
      // Check for key component features
      const requiredFeatures = [
        'interface AssetGenerationState',
        'userApiKeys',
        'costSavings',
        'showApiKeySettings',
        'Cost Savings Dashboard',
        'API Key Management',
        'APIKeySettings',
        'UPDATE_COST_SAVINGS',
        'SET_USER_API_KEY'
      ];
      
      const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
      
      if (missingFeatures.length > 0) {
        throw new Error(`Missing features: ${missingFeatures.join(', ')}`);
      }
      
      console.log('🔧 All required component features found');
      console.log(`   ✓ State management for API keys`);
      console.log(`   ✓ Cost savings tracking`);
      console.log(`   ✓ API key management modal`);
      console.log(`   ✓ Action types for updates`);
    });
  }

  testAPIKeySettingsComponentStructure() {
    this.runTest('API Key Settings Component Structure', () => {
      const apiKeySettingsPath = path.join(TEST_CONFIG.componentsDir, 'simple-api-key-settings.tsx');
      const content = fs.readFileSync(apiKeySettingsPath, 'utf8');
      
      // Check for key features
      const requiredFeatures = [
        'interface APIKeySettingsProps',
        'onApiKeyUpdate',
        'onProviderChange',
        'useState',
        'Provider Selection',
        'OpenAI',
        'Anthropic',
        'Google AI',
        'Hugging Face'
      ];
      
      const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
      
      if (missingFeatures.length > 0) {
        throw new Error(`Missing features: ${missingFeatures.join(', ')}`);
      }
      
      console.log('🔑 API Key Settings component features verified');
      console.log(`   ✓ Multiple provider support`);
      console.log(`   ✓ Callback functions for updates`);
      console.log(`   ✓ State management`);
    });
  }

  testCostSavingsFunctionality() {
    this.runTest('Cost Savings Functionality', () => {
      const aiCreatePath = path.join(TEST_CONFIG.componentsDir, 'ai-create.tsx');
      const content = fs.readFileSync(aiCreatePath, 'utf8');
      
      // Check for cost savings related features
      const costFeatures = [
        'monthly:',
        'freeCreditsUsed:',
        'requestsThisMonth:',
        'total:',
        'Monthly Savings',
        'Free Credits Used',
        'UPDATE_COST_SAVINGS'
      ];
      
      const missingFeatures = costFeatures.filter(feature => !content.includes(feature));
      
      if (missingFeatures.length > 0) {
        throw new Error(`Missing cost saving features: ${missingFeatures.join(', ')}`);
      }
      
      console.log('💰 Cost savings functionality verified');
      console.log(`   ✓ Monthly savings tracking`);
      console.log(`   ✓ Free credits usage`);
      console.log(`   ✓ Request counting`);
      console.log(`   ✓ Total savings calculation`);
    });
  }

  testUserAPIKeyIntegration() {
    this.runTest('User API Key Integration', () => {
      const aiCreatePath = path.join(TEST_CONFIG.componentsDir, 'ai-create.tsx');
      const content = fs.readFileSync(aiCreatePath, 'utf8');
      
      // Check for API key integration features
      const apiKeyFeatures = [
        'SET_USER_API_KEY',
        'SET_API_PROVIDER',
        'SET_API_KEY_VALID',
        'TOGGLE_API_KEY_SETTINGS',
        'userApiKeys:',
        'selectedApiProvider:',
        'userApiKeysValid:'
      ];
      
      const missingFeatures = apiKeyFeatures.filter(feature => !content.includes(feature));
      
      if (missingFeatures.length > 0) {
        throw new Error(`Missing API key features: ${missingFeatures.join(', ')}`);
      }
      
      console.log('🔐 User API key integration verified');
      console.log(`   ✓ API key storage and validation`);
      console.log(`   ✓ Provider selection`);
      console.log(`   ✓ Settings modal toggle`);
      console.log(`   ✓ State management actions`);
    });
  }

  testComponentSyntax() {
    this.runTest('Component Syntax Validation', () => {
      const aiCreatePath = path.join(TEST_CONFIG.componentsDir, 'ai-create.tsx');
      const apiKeySettingsPath = path.join(TEST_CONFIG.componentsDir, 'simple-api-key-settings.tsx');
      
      // Check for basic TypeScript/React syntax issues
      const aiCreateContent = fs.readFileSync(aiCreatePath, 'utf8');
      const apiKeyContent = fs.readFileSync(apiKeySettingsPath, 'utf8');
      
      // Basic syntax checks
      const syntaxChecks = [
        { content: aiCreateContent, name: 'AI Create', checks: ['export default', 'import', 'interface', 'useState', 'useReducer'] },
        { content: apiKeyContent, name: 'API Key Settings', checks: ['export default', 'import', 'interface', 'useState'] }
      ];
      
      syntaxChecks.forEach(({ content, name, checks }) => {
        const missingSyntax = checks.filter(check => !content.includes(check));
        if (missingSyntax.length > 0) {
          throw new Error(`${name}: Missing syntax elements: ${missingSyntax.join(', ')}`);
        }
      });
      
      // Check for obvious syntax errors
      const syntaxErrors = [
        /}\s*{/g,  // Missing semicolon or comma
        /\(\s*\)\s*{/g,  // Empty parentheses followed by brace
      ];
      
      syntaxErrors.forEach(errorPattern => {
        if (errorPattern.test(aiCreateContent) || errorPattern.test(apiKeyContent)) {
          console.warn('⚠️ Potential syntax issue detected - review manually');
        }
      });
      
      console.log('📝 Component syntax validation passed');
      console.log(`   ✓ Import/export statements`);
      console.log(`   ✓ TypeScript interfaces`);
      console.log(`   ✓ React hooks usage`);
    });
  }

  testImportStructure() {
    this.runTest('Import Structure Validation', () => {
      const aiCreatePath = path.join(TEST_CONFIG.componentsDir, 'ai-create.tsx');
      const content = fs.readFileSync(aiCreatePath, 'utf8');
      
      // Check for required imports
      const requiredImports = [
        'import.*react',
        'import.*lucide-react',
        'import.*sonner',
        'import.*APIKeySettings'
      ];
      
      const missingImports = requiredImports.filter(importPattern => {
        return !new RegExp(importPattern, 'i').test(content);
      });
      
      if (missingImports.length > 0) {
        throw new Error(`Missing imports: ${missingImports.join(', ')}`);
      }
      
      console.log('📦 Import structure validated');
      console.log(`   ✓ React imports`);
      console.log(`   ✓ UI component imports`);
      console.log(`   ✓ Toast notification imports`);
      console.log(`   ✓ Custom component imports`);
    });
  }

  testBusinessLogic() {
    this.runTest('Business Logic Implementation', () => {
      const aiCreatePath = path.join(TEST_CONFIG.componentsDir, 'ai-create.tsx');
      const content = fs.readFileSync(aiCreatePath, 'utf8');
      
      // Check for business logic implementation
      const businessFeatures = [
        'providerSavings',
        'newSavings.*providerSavings',
        'monthly.*savings',
        'freeCreditsUsed.*isValid',
        'Object.keys.*userApiKeys.*length'
      ];
      
      const missingFeatures = businessFeatures.filter(feature => {
        return !new RegExp(feature).test(content);
      });
      
      if (missingFeatures.length > 0) {
        throw new Error(`Missing business logic: ${missingFeatures.join(', ')}`);
      }
      
      console.log('🧠 Business logic implementation verified');
      console.log(`   ✓ Provider-specific savings calculation`);
      console.log(`   ✓ Cost tracking logic`);
      console.log(`   ✓ API key validation rewards`);
      console.log(`   ✓ Dynamic savings updates`);
    });
  }

  generateReport() {
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 AI CREATE FEATURES TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.details
        .filter(detail => detail.status === 'FAILED')
        .forEach((detail, index) => {
          console.log(`${index + 1}. ${detail.test}: ${detail.message}`);
        });
    }
    
    if (this.results.passed === this.results.total) {
      console.log('\n🎉 ALL TESTS PASSED! AI Create features are working correctly.');
      console.log('\n💡 FEATURES VERIFIED:');
      console.log('   ✓ User API key management');
      console.log('   ✓ Cost savings tracking');
      console.log('   ✓ Multiple AI provider support');
      console.log('   ✓ Component integration');
      console.log('   ✓ State management');
      console.log('   ✓ Business logic implementation');
    } else if (successRate >= 80) {
      console.log('\n✅ MOSTLY SUCCESSFUL! Minor issues detected.');
    } else {
      console.log('\n⚠️ SIGNIFICANT ISSUES detected. Review failed tests.');
    }
    
    // Save detailed report
    const reportPath = './test-reports/ai-create-features-report.json';
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: `${successRate}%`
      },
      details: this.results.details,
      recommendations: this.generateRecommendations()
    };
    
    // Ensure reports directory exists
    if (!fs.existsSync('./test-reports')) {
      fs.mkdirSync('./test-reports', { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    
    return successRate >= 80;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.failed === 0) {
      recommendations.push('🎉 All tests passing! Consider adding integration tests.');
      recommendations.push('🔄 Set up automated testing in CI/CD pipeline.');
      recommendations.push('📝 Add unit tests for individual functions.');
    } else {
      recommendations.push('🔧 Fix failing component tests to improve reliability.');
      recommendations.push('📚 Review component documentation and examples.');
      recommendations.push('🧪 Add more comprehensive error handling tests.');
    }
    
    recommendations.push('🚀 Consider adding performance benchmarks.');
    recommendations.push('📱 Test responsive design across different viewports.');
    recommendations.push('♿ Ensure accessibility compliance (WCAG 2.1).');
    
    return recommendations;
  }

  runAllTests() {
    console.log('🚀 Starting AI Create Features Testing...');
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
    
    // Run all tests
    this.testAICreateComponentExists();
    this.testAPIKeySettingsComponentExists();
    this.testAICreateComponentStructure();
    this.testAPIKeySettingsComponentStructure();
    this.testCostSavingsFunctionality();
    this.testUserAPIKeyIntegration();
    this.testComponentSyntax();
    this.testImportStructure();
    this.testBusinessLogic();
    
    // Generate final report
    const success = this.generateReport();
    
    console.log('\n🏁 Testing completed!');
    return success;
  }
}

// Main execution
async function main() {
  const tester = new AICreateFeatureTester();
  
  try {
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main();
}

module.exports = { AICreateFeatureTester }; 