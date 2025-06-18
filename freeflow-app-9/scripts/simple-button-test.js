#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

console.log('🧪 FreeflowZee Create/Add Button Functionality Test');
console.log('==================================================');
console.log('📅 Date:', new Date().toISOString());
console.log('🔧 Testing Method: HTTP + HTML Analysis');
console.log('');

// Test configuration
const BASE_URL = 'http://localhost:3004';
const TEST_ROUTES = [
  '/dashboard',
  '/dashboard/projects-hub', 
  '/dashboard/files-hub',
  '/dashboard/ai-create',
  '/dashboard/video-studio',
  '/dashboard/community',
  '/dashboard/my-day',
  '/dashboard/escrow',
  '/dashboard/time-tracking'
];

const API_ENDPOINTS = [
  '/api/ai/chat',
  '/api/collaboration/upf',
  '/api/storage/analytics',
  '/api/upload'
];

// Expected buttons with their test IDs
const EXPECTED_BUTTONS = {
  'Dashboard': [
    'new-project-btn',
    'create-project-btn', 
    'create-invoice-btn',
    'upload-files-btn',
    'schedule-meeting-btn'
  ],
  'Projects Hub': [
    'create-project-btn',
    'new-project-btn'
  ],
  'Files Hub': [
    'upload-file-btn',
    'create-folder-btn'
  ],
  'AI Create': [
    'generate-assets-btn',
    'preview-asset-btn',
    'download-asset-btn',
    'upload-asset-btn',
    'export-all-btn'
  ],
  'Video Studio': [
    'create-video-btn',
    'upload-media-btn',
    'upload-btn'
  ],
  'Community': [
    'create-post-btn'
  ],
  'My Day': [
    'add-task-btn',
    'start-timer-btn'
  ],
  'Escrow': [
    'create-escrow-btn',
    'create-deposit-btn',
    'add-milestone-btn'
  ],
  'Time Tracking': [
    'start-timer-btn',
    'add-entry-btn',
    'create-project-btn',
    'export-timesheet-btn',
    'generate-report-btn'
  ]
};

class SimpleButtonTester {
  constructor() {
    this.results = {
      routes: {},
      apis: {},
      buttons: {},
      summary: {
        totalRoutes: 0,
        workingRoutes: 0,
        totalAPIs: 0,
        workingAPIs: 0,
        totalButtons: 0,
        expectedButtons: 0,
        foundButtons: 0
      }
    };
  }

  async makeRequest(url) {
    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        });
      });
      
      req.on('error', (error) => {
        resolve({
          statusCode: 0,
          error: error.message,
          data: ''
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          statusCode: 0,
          error: 'Timeout',
          data: ''
        });
      });
    });
  }

  async testRoutes() {
    console.log('📍 Testing Dashboard Routes:');
    console.log('============================');
    
    for (const route of TEST_ROUTES) {
      const url = BASE_URL + route;
      const response = await this.makeRequest(url);
      
      this.results.summary.totalRoutes++;
      this.results.routes[route] = {
        statusCode: response.statusCode,
        working: response.statusCode >= 200 && response.statusCode < 400,
        error: response.error
      };
      
      if (response.statusCode >= 200 && response.statusCode < 400) {
        this.results.summary.workingRoutes++;
      }
      
      const status = response.statusCode >= 200 && response.statusCode < 400 ? '✅' : '❌';
      console.log(`${status} ${route}: HTTP ${response.statusCode}${response.error ? ' (' + response.error + ')' : ''}`);
    }
    console.log('');
  }

  async testAPIEndpoints() {
    console.log('📍 Testing API Endpoints:');
    console.log('=========================');
    
    for (const endpoint of API_ENDPOINTS) {
      const url = BASE_URL + endpoint;
      const response = await this.makeRequest(url);
      
      this.results.summary.totalAPIs++;
      this.results.apis[endpoint] = {
        statusCode: response.statusCode,
        working: response.statusCode === 200,
        error: response.error
      };
      
      if (response.statusCode === 200) {
        this.results.summary.workingAPIs++;
      }
      
      const status = response.statusCode === 200 ? '✅' : response.statusCode >= 400 && response.statusCode < 500 ? '🟡' : '❌';
      console.log(`${status} ${endpoint}: HTTP ${response.statusCode}${response.error ? ' (' + response.error + ')' : ''}`);
    }
    console.log('');
  }

  async testButtonImplementations() {
    console.log('📍 Testing Button Implementations:');
    console.log('==================================');
    
    // Read component files and check for button implementations
    const componentFiles = [
      'app/(app)/dashboard/page.tsx',
      'app/(app)/dashboard/projects-hub/page.tsx',
      'components/hubs/files-hub.tsx',
      'components/collaboration/ai-create.tsx',
      'app/(app)/dashboard/video-studio/page.tsx',
      'components/community/enhanced-community-hub.tsx',
      'app/(app)/dashboard/my-day/page.tsx',
      'app/(app)/dashboard/escrow/page.tsx',
      'app/(app)/dashboard/time-tracking/page.tsx'
    ];
    
    for (const [componentName, expectedButtons] of Object.entries(EXPECTED_BUTTONS)) {
      this.results.summary.expectedButtons += expectedButtons.length;
      
      const foundButtons = [];
      
      // Find corresponding file
      const file = componentFiles.find(f => {
        const fileName = f.toLowerCase();
        const compName = componentName.toLowerCase().replace(/\s+/g, '-');
        return fileName.includes(compName) || fileName.includes(compName.replace('-', ''));
      });
      
      if (file && fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          for (const buttonId of expectedButtons) {
            if (content.includes(`data-testid="${buttonId}"`) || content.includes(`testid="${buttonId}"`)) {
              foundButtons.push(buttonId);
              this.results.summary.foundButtons++;
            }
          }
        } catch (error) {
          console.log(`⚠️  Error reading ${file}: ${error.message}`);
        }
      }
      
      this.results.buttons[componentName] = {
        expected: expectedButtons,
        found: foundButtons,
        missing: expectedButtons.filter(btn => !foundButtons.includes(btn)),
        file: file || 'Not found'
      };
      
      const successRate = expectedButtons.length > 0 ? Math.round((foundButtons.length / expectedButtons.length) * 100) : 0;
      const status = successRate === 100 ? '✅' : successRate >= 75 ? '🟡' : '❌';
      
      console.log(`${status} ${componentName}: ${foundButtons.length}/${expectedButtons.length} buttons (${successRate}%)`);
      
      if (foundButtons.length > 0) {
        console.log(`     Found: ${foundButtons.join(', ')}`);
      }
      
      if (foundButtons.length < expectedButtons.length) {
        const missing = expectedButtons.filter(btn => !foundButtons.includes(btn));
        console.log(`     Missing: ${missing.join(', ')}`);
      }
    }
    console.log('');
  }

  generateReport() {
    console.log('📊 Test Results Summary:');
    console.log('========================');
    
    const routeSuccessRate = this.results.summary.totalRoutes > 0 ? 
      Math.round((this.results.summary.workingRoutes / this.results.summary.totalRoutes) * 100) : 0;
    
    const apiSuccessRate = this.results.summary.totalAPIs > 0 ? 
      Math.round((this.results.summary.workingAPIs / this.results.summary.totalAPIs) * 100) : 0;
    
    const buttonSuccessRate = this.results.summary.expectedButtons > 0 ? 
      Math.round((this.results.summary.foundButtons / this.results.summary.expectedButtons) * 100) : 0;
    
    console.log(`🌐 Routes: ${this.results.summary.workingRoutes}/${this.results.summary.totalRoutes} working (${routeSuccessRate}%)`);
    console.log(`🔗 APIs: ${this.results.summary.workingAPIs}/${this.results.summary.totalAPIs} working (${apiSuccessRate}%)`);
    console.log(`🔘 Buttons: ${this.results.summary.foundButtons}/${this.results.summary.expectedButtons} implemented (${buttonSuccessRate}%)`);
    
    const overallScore = Math.round((routeSuccessRate + apiSuccessRate + buttonSuccessRate) / 3);
    console.log(`📈 Overall Score: ${overallScore}%`);
    
    console.log('');
    
    if (overallScore >= 90) {
      console.log('🎉 EXCELLENT! All systems are working great!');
    } else if (overallScore >= 75) {
      console.log('✅ GOOD! Most functionality is working well.');
    } else if (overallScore >= 50) {
      console.log('🟡 PARTIAL! Some issues need attention.');
    } else {
      console.log('❌ NEEDS WORK! Several issues require fixing.');
    }
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      routes: this.results.routes,
      apis: this.results.apis,
      buttons: this.results.buttons,
      scores: {
        routes: routeSuccessRate,
        apis: apiSuccessRate,
        buttons: buttonSuccessRate,
        overall: overallScore
      }
    };
    
    fs.writeFileSync('button-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to: button-test-results.json');
    
    return overallScore >= 75;
  }

  async run() {
    try {
      await this.testRoutes();
      await this.testAPIEndpoints();
      await this.testButtonImplementations();
      const success = this.generateReport();
      
      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error('❌ Test failed:', error);
      process.exit(1);
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new SimpleButtonTester();
  tester.run();
}

module.exports = SimpleButtonTester; 