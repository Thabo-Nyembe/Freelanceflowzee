const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class DashboardTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      overview: {},
      projectsHub: {},
      aiCreate: {},
      videoStudio: {},
      filesHub: {},
      community: {},
      myDay: {},
      escrow: {},
      navigation: {},
      interactiveElements: {},
      dataLoading: {},
      errorHandling: {},
      apiCalls: {},
      issues: [],
      functionality: {}
    };
  }

  async init() {
    console.log('🚀 Starting dashboard functionality test...');
    
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1920, height: 1080 }
      });
      
      this.page = await this.browser.newPage();
      
      // Enable console logging
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          this.results.issues.push({
            type: 'Console Error',
            message: msg.text(),
            location: msg.location()
          });
        }
      });
      
      // Track network requests
      this.page.on('response', response => {
        if (response.status() >= 400) {
          this.results.issues.push({
            type: 'Network Error',
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
          });
        }
      });
      
      await this.page.goto('http://localhost:9323', { waitUntil: 'networkidle2' });
      console.log('✅ Page loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      this.results.issues.push({
        type: 'Initialization Error',
        message: error.message
      });
    }
  }

  async testDashboardOverview() {
    console.log('📊 Testing Dashboard Overview...');
    
    try {
      // Check if dashboard loads
      await this.page.waitForSelector('h1:contains("Welcome to FreeflowZee")', { timeout: 5000 });
      this.results.overview.titleLoaded = true;
      
      // Check stats cards
      const statsCards = await this.page.$$eval('[data-testid*="stat"], .glass-card', cards => {
        return cards.map(card => ({
          text: card.textContent.trim(),
          visible: card.offsetHeight > 0
        }));
      });
      
      this.results.overview.statsCards = statsCards;
      
      // Check recent activities
      const activities = await this.page.$$eval('.space-y-4 li', activities => {
        return activities.map(activity => ({
          text: activity.textContent.trim(),
          hasIcon: activity.querySelector('svg, .lucide') !== null
        }));
      });
      
      this.results.overview.recentActivities = activities;
      
      // Test Quick Actions
      const quickActions = await this.page.$$eval('[data-testid*="quick-action"], .grid button', buttons => {
        return buttons.map(button => ({
          text: button.textContent.trim(),
          clickable: !button.disabled,
          visible: button.offsetHeight > 0
        }));
      });
      
      this.results.overview.quickActions = quickActions;
      
      console.log('✅ Dashboard Overview test completed');
      
    } catch (error) {
      console.error('❌ Dashboard Overview test failed:', error);
      this.results.overview.error = error.message;
    }
  }

  async testTabNavigation() {
    console.log('🔄 Testing Tab Navigation...');
    
    try {
      // Get all tabs
      const tabs = await this.page.$$eval('[role="tab"], [data-testid*="tab"]', tabs => {
        return tabs.map(tab => ({
          text: tab.textContent.trim(),
          value: tab.getAttribute('data-value') || tab.getAttribute('value'),
          active: tab.getAttribute('aria-selected') === 'true' || tab.classList.contains('active')
        }));
      });
      
      this.results.navigation.tabs = tabs;
      
      // Test clicking each tab
      const tabTests = [];
      for (const tab of tabs) {
        try {
          if (tab.value) {
            await this.page.click(`[data-value="${tab.value}"]`);
            await this.page.waitForTimeout(1000);
            
            // Check if content changed
            const content = await this.page.$eval('body', el => el.textContent);
            tabTests.push({
              tab: tab.text,
              clicked: true,
              contentLength: content.length
            });
          }
        } catch (error) {
          tabTests.push({
            tab: tab.text,
            clicked: false,
            error: error.message
          });
        }
      }
      
      this.results.navigation.tabTests = tabTests;
      console.log('✅ Tab navigation test completed');
      
    } catch (error) {
      console.error('❌ Tab navigation test failed:', error);
      this.results.navigation.error = error.message;
    }
  }

  async testProjectsHub() {
    console.log('📁 Testing Projects Hub...');
    
    try {
      // Navigate to projects tab
      await this.page.click('[data-value="projects-hub"]');
      await this.page.waitForTimeout(1000);
      
      // Check for projects content
      const projectsContent = await this.page.$eval('body', el => {
        const text = el.textContent;
        return {
          hasProjectsTitle: text.includes('Projects Hub'),
          hasCreateButton: text.includes('Create') || text.includes('New Project'),
          hasProjectsList: text.includes('project') || text.includes('Project'),
          isEmpty: text.includes('No projects') || text.includes('coming soon')
        };
      });
      
      this.results.projectsHub = projectsContent;
      
      // Test create project button if it exists
      try {
        const createButton = await this.page.$('[data-testid*="create"], button:contains("Create"), button:contains("New Project")');
        if (createButton) {
          await createButton.click();
          await this.page.waitForTimeout(1000);
          this.results.projectsHub.createButtonWorks = true;
        }
      } catch (error) {
        this.results.projectsHub.createButtonError = error.message;
      }
      
      console.log('✅ Projects Hub test completed');
      
    } catch (error) {
      console.error('❌ Projects Hub test failed:', error);
      this.results.projectsHub.error = error.message;
    }
  }

  async testAICreate() {
    console.log('🧠 Testing AI Create...');
    
    try {
      // Navigate to AI Create tab
      await this.page.click('[data-value="ai-create"]');
      await this.page.waitForTimeout(1000);
      
      // Check for AI Create content
      const aiContent = await this.page.$eval('body', el => {
        const text = el.textContent;
        return {
          hasAITitle: text.includes('AI Create') || text.includes('AI Assistant'),
          hasProviderTabs: text.includes('OpenAI') || text.includes('Anthropic'),
          hasAPIKeyInput: text.includes('API Key') || text.includes('Enter'),
          hasGenerateButton: text.includes('Generate') || text.includes('Create')
        };
      });
      
      this.results.aiCreate = aiContent;
      
      // Test API key input if it exists
      try {
        const apiKeyInput = await this.page.$('input[type="password"], input[placeholder*="API"], input[placeholder*="key"]');
        if (apiKeyInput) {
          await apiKeyInput.type('test-api-key');
          this.results.aiCreate.apiKeyInputWorks = true;
        }
      } catch (error) {
        this.results.aiCreate.apiKeyInputError = error.message;
      }
      
      console.log('✅ AI Create test completed');
      
    } catch (error) {
      console.error('❌ AI Create test failed:', error);
      this.results.aiCreate.error = error.message;
    }
  }

  async testVideoStudio() {
    console.log('🎥 Testing Video Studio...');
    
    try {
      // Navigate to Video Studio tab
      await this.page.click('[data-value="video-studio"]');
      await this.page.waitForTimeout(1000);
      
      // Check for Video Studio content
      const videoContent = await this.page.$eval('body', el => {
        const text = el.textContent;
        return {
          hasVideoTitle: text.includes('Video Studio'),
          hasRecordButton: text.includes('Record'),
          hasEditButton: text.includes('Edit'),
          hasUploadButton: text.includes('Upload'),
          hasShareButton: text.includes('Share'),
          hasExportButton: text.includes('Export')
        };
      });
      
      this.results.videoStudio = videoContent;
      
      // Test interactive buttons
      const videoButtons = [
        '[data-testid="record-btn"]',
        '[data-testid="edit-btn"]',
        '[data-testid="upload-media-btn"]',
        '[data-testid="share-btn"]',
        '[data-testid="export-btn"]'
      ];
      
      const buttonTests = [];
      for (const selector of videoButtons) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            await this.page.waitForTimeout(500);
            buttonTests.push({ selector, clicked: true });
          }
        } catch (error) {
          buttonTests.push({ selector, clicked: false, error: error.message });
        }
      }
      
      this.results.videoStudio.buttonTests = buttonTests;
      
      console.log('✅ Video Studio test completed');
      
    } catch (error) {
      console.error('❌ Video Studio test failed:', error);
      this.results.videoStudio.error = error.message;
    }
  }

  async testFilesHub() {
    console.log('📁 Testing Files Hub...');
    
    try {
      // Navigate to Files Hub tab
      await this.page.click('[data-value="files-hub"]');
      await this.page.waitForTimeout(1000);
      
      // Check for Files Hub content
      const filesContent = await this.page.$eval('body', el => {
        const text = el.textContent;
        return {
          hasFilesTitle: text.includes('Files Hub'),
          hasUploadArea: text.includes('Upload') || text.includes('Drop files'),
          hasFilesList: text.includes('file') || text.includes('File'),
          comingSoon: text.includes('coming soon') || text.includes('Coming Soon')
        };
      });
      
      this.results.filesHub = filesContent;
      
      console.log('✅ Files Hub test completed');
      
    } catch (error) {
      console.error('❌ Files Hub test failed:', error);
      this.results.filesHub.error = error.message;
    }
  }

  async testInteractiveElements() {
    console.log('🎮 Testing Interactive Elements...');
    
    try {
      // Test global search
      const searchButton = await this.page.$('[placeholder*="Search"], button:contains("Search")');
      if (searchButton) {
        await searchButton.click();
        await this.page.waitForTimeout(500);
        this.results.interactiveElements.searchWorks = true;
      }
      
      // Test buttons with data-testid
      const testButtons = await this.page.$$('[data-testid*="btn"], [data-testid*="button"]');
      const buttonResults = [];
      
      for (const button of testButtons) {
        try {
          const testId = await button.evaluate(el => el.getAttribute('data-testid'));
          const text = await button.evaluate(el => el.textContent.trim());
          
          await button.click();
          await this.page.waitForTimeout(200);
          
          buttonResults.push({
            testId,
            text,
            clicked: true
          });
        } catch (error) {
          buttonResults.push({
            testId: 'unknown',
            clicked: false,
            error: error.message
          });
        }
      }
      
      this.results.interactiveElements.buttons = buttonResults;
      
      console.log('✅ Interactive elements test completed');
      
    } catch (error) {
      console.error('❌ Interactive elements test failed:', error);
      this.results.interactiveElements.error = error.message;
    }
  }

  async testDataLoading() {
    console.log('💾 Testing Data Loading...');
    
    try {
      // Check for loading states
      const loadingElements = await this.page.$$eval('[data-testid*="loading"], .loading, .spinner', elements => {
        return elements.map(el => ({
          class: el.className,
          visible: el.offsetHeight > 0
        }));
      });
      
      this.results.dataLoading.loadingElements = loadingElements;
      
      // Check for error states
      const errorElements = await this.page.$$eval('[data-testid*="error"], .error, .text-red', elements => {
        return elements.map(el => ({
          text: el.textContent.trim(),
          visible: el.offsetHeight > 0
        }));
      });
      
      this.results.dataLoading.errorElements = errorElements;
      
      console.log('✅ Data loading test completed');
      
    } catch (error) {
      console.error('❌ Data loading test failed:', error);
      this.results.dataLoading.error = error.message;
    }
  }

  async generateReport() {
    console.log('📄 Generating comprehensive report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.results,
      summary: {
        totalIssues: this.results.issues.length,
        criticalIssues: this.results.issues.filter(i => i.type.includes('Error')).length,
        tabsWorking: this.results.navigation.tabTests?.filter(t => t.clicked).length || 0,
        buttonsWorking: this.results.interactiveElements.buttons?.filter(b => b.clicked).length || 0,
        overallStatus: this.results.issues.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND'
      },
      recommendations: []
    };
    
    // Add recommendations based on findings
    if (this.results.issues.length > 0) {
      report.recommendations.push('Fix console errors and network issues');
    }
    
    if (this.results.projectsHub.isEmpty) {
      report.recommendations.push('Implement actual project management functionality');
    }
    
    if (this.results.filesHub.comingSoon) {
      report.recommendations.push('Complete files hub implementation');
    }
    
    // Write report to file
    const reportPath = path.join(__dirname, 'dashboard-functionality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ Report generated:', reportPath);
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.testDashboardOverview();
      await this.testTabNavigation();
      await this.testProjectsHub();
      await this.testAICreate();
      await this.testVideoStudio();
      await this.testFilesHub();
      await this.testInteractiveElements();
      await this.testDataLoading();
      
      const report = await this.generateReport();
      
      console.log('\n🎉 Dashboard functionality test completed!');
      console.log('📊 Summary:', report.summary);
      console.log('🔧 Recommendations:', report.recommendations);
      
      return report;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.results.issues.push({
        type: 'Test Suite Error',
        message: error.message
      });
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test suite
const tester = new DashboardTester();
tester.run().catch(console.error);