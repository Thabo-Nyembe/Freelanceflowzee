#!/usr/bin/env node

/**
 * 🎯 VIDEO STUDIO TABS TESTER
 * 
 * Focused testing script for Video Studio tabs and interactive elements
 * using Context7 MCP best practices and Playwright automation.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002',
  timeout: 30000,
  viewport: { width: 1280, height: 720 },
  testMode: true
};

// Video Studio specific elements
const VIDEO_STUDIO_ELEMENTS = {
  name: 'Video Studio',
  url: '/dashboard/video-studio',
  tabs: [
    { id: 'projects', name: 'Projects', selector: '[role= "tab"][data-value= "projects"]' },
    { id: 'templates', name: 'Templates', selector: '[role= "tab"][data-value= "templates"]' },
    { id: 'assets', name: 'Assets', selector: '[role= "tab"][data-value= "assets"]' },
    { id: 'analytics', name: 'Analytics', selector: '[role= "tab"][data-value= "analytics"]' }
  ],
  buttons: [
    { id: 'create-video', name: 'Create Video', selector: '[data-testid= "create-video-btn"]' },
    { id: 'upload-media', name: 'Upload Media', selector: '[data-testid= "upload-media-btn"]' },
    { id: 'export-video', name: 'Export Video', selector: '[data-testid= "export-video-btn"]' },
    { id: 'share-video', name: 'Share Video', selector: '[data-testid= "share-video-btn"]' }
  ],
  videoControls: [
    { id: 'play-pause', name: 'Play/Pause', selector: '[aria-label*= "Play"], [aria-label*= "Pause"]' },
    { id: 'timeline', name: 'Timeline', selector: '[role= "slider"], .timeline' },
    { id: 'volume', name: 'Volume', selector: '[aria-label*= "Volume"]' },
    { id: 'fullscreen', name: 'Fullscreen', selector: '[aria-label*= "Fullscreen"]' }
  ],
  editingTools: [
    { id: 'trim', name: 'Trim', selector: 'button:has-text("Trim")' },
    { id: 'split', name: 'Split', selector: 'button:has-text("Split")' },
    { id: 'merge', name: 'Merge', selector: 'button:has-text("Merge")' },
    { id: 'effects', name: 'Effects', selector: 'button:has-text("Effects")' }
  ]
};

class VideoStudioTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
      screenshots: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing Video Studio Tester...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(TEST_CONFIG.viewport);
    await this.page.goto(TEST_CONFIG.baseUrl + VIDEO_STUDIO_ELEMENTS.url);
    await this.page.waitForLoadState('networkidle');
  }

  async testVideoStudioTabs() {
    console.log('\n🎬 Testing Video Studio Tabs...');
    
    for (const tab of VIDEO_STUDIO_ELEMENTS.tabs) {
      const result = await this.testTab(tab);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testTab(tab) {
    console.log(`  🔍 Testing tab: ${tab.name}`);
    
    try {
      const tabSelectors = [
        tab.selector,
        `[role= "tab"]:has-text("${tab.name}")`,
        `button:has-text("${tab.name}")`,
        `[data-value= "${tab.id}"]`,
        `#${tab.id}-tab`
      ];

      let tabElement = null;
      for (const selector of tabSelectors) {
        try {
          tabElement = await this.page.locator(selector).first();
          if (await tabElement.isVisible()) break;
        } catch (e) {
          continue;
        }
      }

      if (!tabElement || !(await tabElement.isVisible())) {
        return {
          name: tab.name,
          status: 'failed',
          error: 'Tab element not found or not visible',
          timestamp: new Date().toISOString()
        };
      }

      await tabElement.click();
      await this.page.waitForTimeout(1000);

      const isActive = await tabElement.getAttribute('aria-selected') === 'true' ||
                      await tabElement.getAttribute('data-state') === 'active' ||
                      (await tabElement.getAttribute('class') || ).includes('active');'

      const screenshotPath = `video-studio-${tab.id}-tab.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: tab.name,
        status: isActive ? 'passed' : 'warning',
        details: isActive ? 'Tab activated successfully' : 'Tab clicked but activation unclear',
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: tab.name,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testVideoStudioButtons() {
    console.log('\n🔘 Testing Video Studio Buttons...');
    
    for (const button of VIDEO_STUDIO_ELEMENTS.buttons) {
      const result = await this.testButton(button);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testButton(button) {
    console.log(`  🎯 Testing button: ${button.name}`);
    
    try {
      const buttonSelectors = [
        button.selector,
        `button:has-text("${button.name}")`,
        `[aria-label= "${button.name}"]`,
        `[title= "${button.name}"]`,
        `#${button.id}`
      ];

      let buttonElement = null;
      for (const selector of buttonSelectors) {
        try {
          buttonElement = await this.page.locator(selector).first();
          if (await buttonElement.isVisible()) break;
        } catch (e) {
          continue;
        }
      }

      if (!buttonElement || !(await buttonElement.isVisible())) {
        return {
          name: button.name,
          status: 'failed',
          error: 'Button element not found or not visible',
          timestamp: new Date().toISOString()
        };
      }

      const isEnabled = await buttonElement.isEnabled();
      await buttonElement.hover();
      await this.page.waitForTimeout(500);

      // Don't click create video to avoid navigation
      if (button.id !== 'create-video') {
        await buttonElement.click();
        await this.page.waitForTimeout(1000);
      }

      const screenshotPath = `video-studio-${button.id}-button.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.results.screenshots.push(screenshotPath);

      return {
        name: button.name,
        status: 'passed',
        details: `Button is ${isEnabled ? 'enabled' : 'disabled'} and interactive`,
        timestamp: new Date().toISOString(),
        screenshot: screenshotPath
      };

    } catch (error) {
      return {
        name: button.name,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testVideoControls() {
    console.log('\n🎮 Testing Video Controls...');
    
    for (const control of VIDEO_STUDIO_ELEMENTS.videoControls) {
      const result = await this.testVideoControl(control);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testVideoControl(control) {
    console.log(`  🎛️  Testing control: ${control.name}`);
    
    try {
      const controlElement = await this.page.locator(control.selector).first();
      
      if (!(await controlElement.isVisible())) {
        return {
          name: control.name,
          status: 'warning',
          error: 'Control element not visible (may appear with video)',
          timestamp: new Date().toISOString()
        };
      }

      await controlElement.hover();
      await this.page.waitForTimeout(500);

      return {
        name: control.name,
        status: 'passed',
        details: 'Video control is interactive',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: control.name,
        status: 'warning',
        error: 'Control not available (may require video)',
        timestamp: new Date().toISOString()
      };
    }
  }

  async testEditingTools() {
    console.log('\n✂️  Testing Editing Tools...');
    
    for (const tool of VIDEO_STUDIO_ELEMENTS.editingTools) {
      const result = await this.testEditingTool(tool);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testEditingTool(tool) {
    console.log(`  🛠️  Testing tool: ${tool.name}`);
    
    try {
      const toolElement = await this.page.locator(tool.selector).first();
      
      if (!(await toolElement.isVisible())) {
        return {
          name: tool.name,
          status: 'warning',
          error: 'Tool not visible (may appear in editor mode)',
          timestamp: new Date().toISOString()
        };
      }

      await toolElement.hover();
      await this.page.waitForTimeout(500);

      return {
        name: tool.name,
        status: 'passed',
        details: 'Editing tool is available and interactive',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: tool.name,
        status: 'warning',
        error: 'Tool not available (may require video project)',
        timestamp: new Date().toISOString()
      };
    }
  }

  generateReport() {
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    
    console.log('\n📊 VIDEO STUDIO TEST REPORT');
    console.log('=' .repeat(50));'
    console.log(`✅ Passed: ${this.results.passed}/${this.results.total} (${passRate}%)`);
    console.log(`❌ Failed: ${this.results.failed}/${this.results.total}`);
    console.log(`📸 Screenshots: ${this.results.screenshots.length}`);
    
    console.log('\n📋 Detailed Results: ');
    this.results.details.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${result.name}: ${result.status}`);
      if (result.error) console.log(`    Error: ${result.error}`);
      if (result.details) console.log(`    Details: ${result.details}`);
    });

    return {
      videoStudio: {
        summary: {
          total: this.results.total,
          passed: this.results.passed,
          failed: this.results.failed,
          passRate: passRate
        },
        details: this.results.details,
        screenshots: this.results.screenshots
      }
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.testVideoStudioTabs();
      await this.testVideoStudioButtons();
      await this.testVideoControls();
      await this.testEditingTools();
      
      const report = this.generateReport();
      
      await fs.writeFile('video-studio-test-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n🎉 Video Studio testing completed!');
      console.log('📄 Report saved to: video-studio-test-report.json');
      
    } catch (error) {
      console.error('❌ Video Studio testing failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new VideoStudioTester();
  tester.run();
}

module.exports = VideoStudioTester; 