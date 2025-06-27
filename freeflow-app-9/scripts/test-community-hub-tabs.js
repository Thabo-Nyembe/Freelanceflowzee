#!/usr/bin/env node

/**
 * 🎯 COMMUNITY HUB TABS TESTER
 * 
 * Focused testing script for Community Hub tabs and interactive elements
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

// Community Hub specific elements
const COMMUNITY_HUB_ELEMENTS = {
  name: 'Community Hub',
  url: '/dashboard/community',
  tabs: [
    { id: 'feed', name: 'Feed', selector: '[role= "tab"][data-value= "feed"]' },
    { id: 'creators', name: 'Creators', selector: '[role= "tab"][data-value= "creators"]' },
    { id: 'showcase', name: 'Showcase', selector: '[role= "tab"][data-value= "showcase"]' },
    { id: 'events', name: 'Events', selector: '[role= "tab"][data-value= "events"]' }
  ],
  buttons: [
    { id: 'create-post', name: 'Create Post', selector: '[data-testid= "create-post-btn"]' },
    { id: 'follow-creator', name: 'Follow Creator', selector: '[data-testid= "follow-btn"]' },
    { id: 'like-post', name: 'Like Post', selector: '[data-testid= "like-btn"]' },
    { id: 'share-post', name: 'Share Post', selector: '[data-testid= "share-btn"]' }
  ],
  socialElements: [
    { id: 'post-card', name: 'Post Card', selector: '.post-card, [data-testid= "post-card"]' },
    { id: 'creator-profile', name: 'Creator Profile', selector: '.creator-profile, [data-testid= "creator-profile"]' },
    { id: 'trending-hashtags', name: 'Trending Hashtags', selector: '.trending-hashtags, [data-testid= "trending-hashtags"]' },
    { id: 'featured-creators', name: 'Featured Creators', selector: '.featured-creators, [data-testid= "featured-creators"]' }
  ],
  interactions: [
    { id: 'comment-input', name: 'Comment Input', selector: 'input[placeholder*= "comment"], textarea[placeholder*= "comment"]' },
    { id: 'reaction-button', name: 'Reaction Button', selector: '[aria-label*= "reaction"], .reaction-btn' },
    { id: 'share-modal', name: 'Share Modal', selector: '[role= "dialog"], .share-modal' },
    { id: 'search-creators', name: 'Search Creators', selector: 'input[placeholder*= "Search creators"]' }
  ]
};

class CommunityHubTester {
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
    console.log('🚀 Initializing Community Hub Tester...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(TEST_CONFIG.viewport);
    await this.page.goto(TEST_CONFIG.baseUrl + COMMUNITY_HUB_ELEMENTS.url);
    await this.page.waitForLoadState('networkidle');
  }

  async testCommunityHubTabs() {
    console.log('\n👥 Testing Community Hub Tabs...');
    
    for (const tab of COMMUNITY_HUB_ELEMENTS.tabs) {
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

      const screenshotPath = `community-hub-${tab.id}-tab.png`;
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

  async testCommunityHubButtons() {
    console.log('\n🔘 Testing Community Hub Buttons...');
    
    for (const button of COMMUNITY_HUB_ELEMENTS.buttons) {
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

      // Don't click create post to avoid modal
      if (button.id !== 'create-post') {
        await buttonElement.click();
        await this.page.waitForTimeout(1000);
      }

      const screenshotPath = `community-hub-${button.id}-button.png`;
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

  async testSocialElements() {
    console.log('\n📱 Testing Social Elements...');
    
    for (const element of COMMUNITY_HUB_ELEMENTS.socialElements) {
      const result = await this.testSocialElement(element);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testSocialElement(element) {
    console.log(`  📱 Testing element: ${element.name}`);
    
    try {
      const socialElement = await this.page.locator(element.selector).first();
      
      if (!(await socialElement.isVisible())) {
        return {
          name: element.name,
          status: 'warning',
          error: 'Social element not visible (may require content)',
          timestamp: new Date().toISOString()
        };
      }

      await socialElement.hover();
      await this.page.waitForTimeout(500);

      return {
        name: element.name,
        status: 'passed',
        details: 'Social element is visible and interactive',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: element.name,
        status: 'warning',
        error: 'Social element not available (may require content)',
        timestamp: new Date().toISOString()
      };
    }
  }

  async testInteractions() {
    console.log('\n💬 Testing Interactions...');
    
    for (const interaction of COMMUNITY_HUB_ELEMENTS.interactions) {
      const result = await this.testInteraction(interaction);
      this.results.details.push(result);
      this.results.total++;
      if (result.status === 'passed') this.results.passed++;
      else this.results.failed++;
    }
  }

  async testInteraction(interaction) {
    console.log(`  💬 Testing interaction: ${interaction.name}`);
    
    try {
      const interactionElement = await this.page.locator(interaction.selector).first();
      
      if (!(await interactionElement.isVisible())) {
        return {
          name: interaction.name,
          status: 'warning',
          error: 'Interaction element not visible (may require user action)',
          timestamp: new Date().toISOString()
        };
      }

      if (interaction.id === 'comment-input' || interaction.id === 'search-creators') {
        await interactionElement.fill('test input');
        await this.page.waitForTimeout(500);
        await interactionElement.clear();
      } else {
        await interactionElement.hover();
        await this.page.waitForTimeout(500);
      }

      return {
        name: interaction.name,
        status: 'passed',
        details: 'Interaction element is functional',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: interaction.name,
        status: 'warning',
        error: 'Interaction not available (may require specific context)',
        timestamp: new Date().toISOString()
      };
    }
  }

  generateReport() {
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    
    console.log('\n📊 COMMUNITY HUB TEST REPORT');
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
      communityHub: {
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
      await this.testCommunityHubTabs();
      await this.testCommunityHubButtons();
      await this.testSocialElements();
      await this.testInteractions();
      
      const report = this.generateReport();
      
      await fs.writeFile('community-hub-test-report.json',
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n🎉 Community Hub testing completed!');
      console.log('📄 Report saved to: community-hub-test-report.json');
      
    } catch (error) {
      console.error('❌ Community Hub testing failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new CommunityHubTester();
  tester.run();
}

module.exports = CommunityHubTester; 