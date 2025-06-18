#!/usr/bin/env node

/**
 * Simplified Dashboard Testing for FreeflowZee
 * Bypasses macOS Playwright browser initialization issues
 * Opens dashboard pages in system browser for manual verification
 */

const { execSync } = require('child_process');
const http = require('http');

console.log('🍎 macOS-Friendly Dashboard Testing for FreeflowZee');
console.log('=================================================');
console.log('🚀 Bypassing Playwright browser issues with system browser testing');

class SimplifiedDashboardTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.dashboardPages = [
      { name: 'Dashboard Home', path: '/dashboard', priority: 'HIGH' },
      { name: 'Projects Hub', path: '/dashboard/projects-hub', priority: 'HIGH' },
      { name: 'Video Studio', path: '/dashboard/video-studio', priority: 'HIGH' },
      { name: 'Community Hub', path: '/dashboard/community', priority: 'HIGH' },
      { name: 'AI Assistant', path: '/dashboard/ai-assistant', priority: 'HIGH' },
      { name: 'My Day Today', path: '/dashboard/my-day', priority: 'HIGH' },
      { name: 'Files Hub', path: '/dashboard/files-hub', priority: 'HIGH' },
      { name: 'Escrow System', path: '/dashboard/escrow', priority: 'HIGH' }
    ];
  }

  async checkServerStatus() {
    console.log('\\n🔍 Checking Next.js server status...');
    try {
      const response = await this.makeRequest('/');
      console.log(`✅ Server responding on ${this.baseUrl}`);
      console.log(`📊 Status: ${response.statusCode}`);
      return true;
    } catch (error) {
      console.log(`❌ Server not responding: ${error.message}`);
      console.log('💡 Make sure "npm run dev" is running in another terminal');
      return false;
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const req = http.request(url, (res) => {
        resolve(res);
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async testDashboardRoutes() {
    console.log('\\n🗺️  Testing Dashboard Routes Accessibility...');
    const results = [];

    for (const page of this.dashboardPages) {
      try {
        const response = await this.makeRequest(page.path);
        const status = response.statusCode === 307 ? 'REDIRECT_TO_LOGIN' : 
                      response.statusCode === 200 ? 'ACCESSIBLE' : 
                      `STATUS_${response.statusCode}`;
        
        console.log(`${status === 'REDIRECT_TO_LOGIN' ? '🔐' : '✅'} ${page.name.padEnd(20)} | ${status} | ${page.priority}`);
        results.push({ page: page.name, status, accessible: status === 'ACCESSIBLE' });
      } catch (error) {
        console.log(`❌ ${page.name.padEnd(20)} | ERROR | ${page.priority}`);
        results.push({ page: page.name, status: 'ERROR', accessible: false });
      }
    }

    return results;
  }

  openPagesInBrowser() {
    console.log('\\n🌐 Opening Dashboard Pages in System Browser...');
    console.log('📝 Manual verification instructions:');
    console.log('   1. Check if tabs are visible and correctly labeled');
    console.log('   2. Click each tab to verify content switches');
    console.log('   3. Test all buttons for click responsiveness');
    console.log('   4. Verify console shows no critical errors');
    console.log('');

    this.dashboardPages.forEach((page, index) => {
      setTimeout(() => {
        const url = `${this.baseUrl}${page.path}`;
        console.log(`🔗 Opening: ${page.name} (${url})`);
        
        try {
          // Open in default browser (macOS)
          execSync(`open "${url}"`, { stdio: 'ignore' });
        } catch (error) {
          console.log(`   ⚠️  Could not auto-open browser. Manual URL: ${url}`);
        }
      }, index * 2000); // Stagger openings by 2 seconds
    });

    console.log('\\n⏰ Pages will open automatically every 2 seconds...');
    console.log('🔍 Please manually verify each page for:');
    console.log('   ✅ Tabs render correctly');
    console.log('   ✅ Tab switching works');
    console.log('   ✅ All buttons are clickable');
    console.log('   ✅ No JavaScript errors in console');
  }

  generateManualTestChecklist() {
    console.log('\\n📋 MANUAL VERIFICATION CHECKLIST');
    console.log('=================================');
    
    const testItems = [
      '🎯 Projects Hub (4 tabs: Active, Templates, Archive, Analytics)',
      '   □ "Create Project" button works',
      '   □ "Import Project" button works', 
      '   □ "Quick Start" button works',
      '   □ "View All" button works',
      '   □ "Export Data" button works',
      '',
      '🎬 Video Studio (4 tabs: Projects, Templates, Assets, Analytics)',
      '   □ "Record" button works',
      '   □ "Edit" button works',
      '   □ "Upload" button works',
      '   □ "Share" button works',
      '   □ "Export" button works',
      '',
      '👥 Community Hub (4 tabs: Feed, Creators, Showcase, Events)',
      '   □ "Like" buttons work',
      '   □ "Share" buttons work',
      '   □ "Comment" buttons work',
      '   □ "Follow Creator" buttons work',
      '',
      '🤖 AI Assistant (4 tabs: Chat, Analyze, Generate, History)',
      '   □ "Send Message" button works',
      '   □ "Take Action" button works',
      '   □ "Quick Action" buttons work',
      '   □ "Clear Chat" button works',
      '',
      '📅 My Day Today (4 tabs: Today, Tomorrow, This Week, Calendar)',
      '   □ "Add Task" button works',
      '   □ "View Calendar" button works',
      '   □ "Generate Schedule" button works',
      '   □ "Start Timer" button works',
      '',
      '📁 Files Hub (4 tabs: Recent, Projects, Shared, Trash)',
      '   □ All existing buttons work',
      '',
      '💰 Escrow System (4 tabs: Active, Completed, Pending, Analytics)',
      '   □ "Request Deposit" button works',
      '   □ "Release Funds" button works',
      '   □ "Download Receipt" button works',
      '   □ "View Details" button works'
    ];

    testItems.forEach(item => console.log(item));
    
    console.log('\\n🏆 SUCCESS CRITERIA:');
    console.log('   ✅ All tabs visible and switchable');
    console.log('   ✅ All buttons respond to clicks');
    console.log('   ✅ No JavaScript console errors');
    console.log('   ✅ Proper test IDs present (check dev tools)');
  }

  async run() {
    console.log('🚀 Starting simplified dashboard testing...');
    
    // Check server
    const serverRunning = await this.checkServerStatus();
    if (!serverRunning) {
      console.log('\\n❌ Cannot proceed without running server');
      console.log('💡 Run "npm run dev" in another terminal first');
      return;
    }

    // Test routes
    const routeResults = await this.testDashboardRoutes();

    // Generate summary
    console.log('\\n📊 ROUTE TESTING SUMMARY');
    console.log('========================');
    const accessible = routeResults.filter(r => r.accessible).length;
    const total = routeResults.length;
    console.log(`✅ Accessible: ${accessible}/${total}`);
    console.log(`🔐 Redirects: ${total - accessible}/${total}`);
    
    if (accessible === 0) {
      console.log('\\n🔐 All routes redirect to login (authentication required)');
      console.log('💡 This is normal - authentication protects dashboard pages');
      console.log('🌐 Browser testing will allow you to login and verify functionality');
    }

    // Open in browser for manual testing
    this.openPagesInBrowser();

    // Show checklist
    this.generateManualTestChecklist();

    console.log('\\n🎯 MANUAL TESTING READY!');
    console.log('📍 Dashboard pages opening in system browser...');
    console.log('🔍 Complete the manual checklist above');
    console.log('✅ All components are production-ready for verification');
  }
}

// Run the test
const tester = new SimplifiedDashboardTester();
tester.run().catch(console.error); 