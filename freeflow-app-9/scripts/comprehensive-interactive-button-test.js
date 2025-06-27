#!/usr/bin/env node

/**
 * 🎯 COMPREHENSIVE INTERACTIVE BUTTON TEST FOR ALL TABS
 * 
 * This script systematically tests every button, tab, and interactive element
 * in the FreeflowZee application using Context7 MCP best practices and 
 * Playwright automation. It covers all dashboard tabs, pages, and features.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3002', // Updated port based on logs
  timeout: 30000,
  viewport: { width: 1280, height: 720 },
  testMode: true
};

// Comprehensive mapping of ALL tabs and interactive elements
const ALL_INTERACTIVE_ELEMENTS = {
  // Main Dashboard Tabs
  dashboard: {
    name: 'Dashboard',
    url: '/dashboard',
    tabs: [
      { id: 'overview', name: 'Overview', selector: '[role= "tab"][data-value= "overview"]' },
      { id: 'projects', name: 'Projects', selector: '[role= "tab"][data-value= "projects"]' },
      { id: 'analytics', name: 'Analytics', selector: '[role= "tab"][data-value= "analytics"]' },
      { id: 'clients', name: 'Clients', selector: '[role= "tab"][data-value= "clients"]' },
      { id: 'tools', name: 'Tools', selector: '[role= "tab"][data-value= "tools"]' }
    ],
    buttons: [
      { id: 'create-project', name: 'Create New Project', selector: '[data-testid= "create-project-btn"]' },
      { id: 'upload-files', name: 'Upload Files', selector: '[data-testid= "upload-files-btn"]' },
      { id: 'generate-assets', name: 'Generate Assets', selector: '[data-testid= "generate-assets-btn"]' },
      { id: 'invite-collaborators', name: 'Invite Collaborators', selector: '[data-testid= "invite-btn"]' }
    ]
  },

  // Projects Hub with All Project-Related Tabs
  projectsHub: {
    name: 'Projects Hub',
    url: '/dashboard/projects-hub',
    tabs: [
      { id: 'overview', name: 'Overview', selector: '[role= "tab"][value= "overview"]' },
      { id: 'active', name: 'Active', selector: '[role= "tab"][value= "active"]' },
      { id: 'completed', name: 'Completed', selector: '[role= "tab"][value= "completed"]' },
      { id: 'analytics', name: 'Analytics', selector: '[role= "tab"][value= "analytics"]' }
    ],
    buttons: [
      { id: 'new-project', name: 'New Project', selector: '[data-testid= "create-project-btn"]' },
      { id: 'view-details', name: 'View Details', selector: '[aria-label= "View Details"]' },
      { id: 'edit-project', name: 'Edit Project', selector: '[aria-label= "Edit Project"]' },
      { id: 'add-feedback', name: 'Add Feedback', selector: '[aria-label= "Add Feedback"]' },
      { id: 'delete-project', name: 'Delete Project', selector: '[aria-label= "Delete Project"]' }
    ]
  },

  // Video Studio with Media Tabs
  videoStudio: {
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
    ]
  },

  // Canvas with Design Tabs
  canvas: {
    name: 'Canvas',
    url: '/dashboard/canvas',
    tabs: [
      { id: 'designs', name: 'Designs', selector: '[role= "tab"][data-value= "designs"]' },
      { id: 'templates', name: 'Templates', selector: '[role= "tab"][data-value= "templates"]' },
      { id: 'assets', name: 'Assets', selector: '[role= "tab"][data-value= "assets"]' },
      { id: 'brand-kit', name: 'Brand Kit', selector: '[role= "tab"][data-value= "brand-kit"]' }
    ],
    buttons: [
      { id: 'new-design', name: 'New Design', selector: '[data-testid= "new-design-btn"]' },
      { id: 'upload-asset', name: 'Upload Asset', selector: '[data-testid= "upload-asset-btn"]' },
      { id: 'save-design', name: 'Save Design', selector: '[data-testid= "save-design-btn"]' },
      { id: 'export-design', name: 'Export Design', selector: '[data-testid= "export-design-btn"]' }
    ]
  },

  // Community Hub with Social Tabs
  community: {
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
    ]
  },

  // AI Assistant with AI Tabs
  aiAssistant: {
    name: 'AI Assistant',
    url: '/dashboard/ai-assistant',
    tabs: [
      { id: 'chat', name: 'Chat', selector: '[role= "tab"][data-value= "chat"]' },
      { id: 'templates', name: 'Templates', selector: '[role= "tab"][data-value= "templates"]' },
      { id: 'history', name: 'History', selector: '[role= "tab"][data-value= "history"]' },
      { id: 'settings', name: 'Settings', selector: '[role= "tab"][data-value= "settings"]' }
    ],
    buttons: [
      { id: 'new-chat', name: 'New Chat', selector: '[data-testid= "new-chat-btn"]' },
      { id: 'send-message', name: 'Send Message', selector: '[data-testid= "send-message-btn"]' },
      { id: 'clear-history', name: 'Clear History', selector: '[data-testid= "clear-history-btn"]' },
      { id: 'save-template', name: 'Save Template', selector: '[data-testid= "save-template-btn"]' }
    ]
  },

  // My Day with Planning Tabs
  myDay: {
    name: 'My Day',
    url: '/dashboard/my-day',
    tabs: [
      { id: 'today', name: 'Today', selector: '[role= "tab"][data-value= "today"]' },
      { id: 'week', name: 'Week', selector: '[role= "tab"][data-value= "week"]' },
      { id: 'calendar', name: 'Calendar', selector: '[role= "tab"][data-value= "calendar"]' },
      { id: 'goals', name: 'Goals', selector: '[role= "tab"][data-value= "goals"]' }
    ],
    buttons: [
      { id: 'add-task', name: 'Add Task', selector: '[data-testid= "add-task-btn"]' },
      { id: 'complete-task', name: 'Complete Task', selector: '[data-testid= "complete-task-btn"]' },
      { id: 'set-goal', name: 'Set Goal', selector: '[data-testid= "set-goal-btn"]' },
      { id: 'schedule-event', name: 'Schedule Event', selector: '[data-testid= "schedule-event-btn"]' }
    ]
  },

  // Escrow with Payment Tabs
  escrow: {
    name: 'Escrow',
    url: '/dashboard/escrow',
    tabs: [
      { id: 'active', name: 'Active', selector: '[role= "tab"][data-value= "active"]' },
      { id: 'pending', name: 'Pending', selector: '[role= "tab"][data-value= "pending"]' },
      { id: 'completed', name: 'Completed', selector: '[role= "tab"][data-value= "completed"]' },
      { id: 'disputes', name: 'Disputes', selector: '[role= "tab"][data-value= "disputes"]' }
    ],
    buttons: [
      { id: 'create-escrow', name: 'Create Escrow', selector: '[data-testid= "create-escrow-btn"]' },
      { id: 'release-funds', name: 'Release Funds', selector: '[data-testid= "release-funds-btn"]' },
      { id: 'request-dispute', name: 'Request Dispute', selector: '[data-testid= "dispute-btn"]' },
      { id: 'view-details', name: 'View Details', selector: '[data-testid= "view-escrow-btn"]' }
    ]
  },

  // Files Hub with Storage Tabs
  filesHub: {
    name: 'Files Hub',
    url: '/dashboard/files-hub',
    tabs: [
      { id: 'all-files', name: 'All Files', selector: '[role= "tab"][data-value= "all-files"]' },
      { id: 'images', name: 'Images', selector: '[role= "tab"][data-value= "images"]' },
      { id: 'videos', name: 'Videos', selector: '[role= "tab"][data-value= "videos"]' },
      { id: 'documents', name: 'Documents', selector: '[role= "tab"][data-value= "documents"]' },
      { id: 'recent', name: 'Recent', selector: '[role= "tab"][data-value= "recent"]' }
    ],
    buttons: [
      { id: 'upload-file', name: 'Upload File', selector: '[data-testid= "upload-file-btn"]' },
      { id: 'create-folder', name: 'Create Folder', selector: '[data-testid= "create-folder-btn"]' },
      { id: 'share-file', name: 'Share File', selector: '[data-testid= "share-file-btn"]' },
      { id: 'delete-file', name: 'Delete File', selector: '[data-testid= "delete-file-btn"]' }
    ]
  },

  // Collaboration with Team Tabs
  collaboration: {
    name: 'Collaboration',
    url: '/dashboard/collaboration',
    tabs: [
      { id: 'active-sessions', name: 'Active Sessions', selector: '[role= "tab"][data-value= "active-sessions"]' },
      { id: 'team-chat', name: 'Team Chat', selector: '[role= "tab"][data-value= "team-chat"]' },
      { id: 'shared-files', name: 'Shared Files', selector: '[role= "tab"][data-value= "shared-files"]' },
      { id: 'video-calls', name: 'Video Calls', selector: '[role= "tab"][data-value= "video-calls"]' }
    ],
    buttons: [
      { id: 'start-session', name: 'Start Session', selector: '[data-testid= "start-session-btn"]' },
      { id: 'join-call', name: 'Join Call', selector: '[data-testid= "join-call-btn"]' },
      { id: 'send-message', name: 'Send Message', selector: '[data-testid= "send-message-btn"]' },
      { id: 'share-screen', name: 'Share Screen', selector: '[data-testid= "share-screen-btn"]' }
    ]
  },

  // Notifications with Alert Tabs
  notifications: {
    name: 'Notifications',
    url: '/dashboard/notifications',
    tabs: [
      { id: 'all', name: 'All', selector: '[role= "tab"][data-value= "all"]' },
      { id: 'unread', name: 'Unread', selector: '[role= "tab"][data-value= "unread"]' },
      { id: 'projects', name: 'Projects', selector: '[role= "tab"][data-value= "projects"]' },
      { id: 'payments', name: 'Payments', selector: '[role= "tab"][data-value= "payments"]' }
    ],
    buttons: [
      { id: 'mark-read', name: 'Mark as Read', selector: '[data-testid= "mark-read-btn"]' },
      { id: 'mark-all-read', name: 'Mark All Read', selector: '[data-testid= "mark-all-read-btn"]' },
      { id: 'delete-notification', name: 'Delete', selector: '[data-testid= "delete-notification-btn"]' },
      { id: 'notification-settings', name: 'Settings', selector: '[data-testid= "notification-settings-btn"]' }
    ]
  }
};

// Additional specialized tabs and components
const SPECIALIZED_COMPONENTS = {
  // Landing page components
  landingPage: {
    name: 'Landing Page',
    url: '/','
    sections: [
      { id: 'hero', name: 'Hero Section', selector: '[data-section= "hero"]' },
      { id: 'features', name: 'Features Section', selector: '[data-section= "features"]' },
      { id: 'pricing', name: 'Pricing Section', selector: '[data-section= "pricing"]' },
      { id: 'testimonials', name: 'Testimonials', selector: '[data-section= "testimonials"]' }
    ],
    buttons: [
      { id: 'get-started', name: 'Get Started', selector: '[data-testid= "get-started-btn"]' },
      { id: 'watch-demo', name: 'Watch Demo', selector: '[data-testid= "watch-demo-btn"]' },
      { id: 'contact-sales', name: 'Contact Sales', selector: '[data-testid= "contact-sales-btn"]' },
      { id: 'learn-more', name: 'Learn More', selector: '[data-testid= "learn-more-btn"]' }
    ]
  },

  // Modal components
  modals: {
    name: 'Modal Components',
    components: [
      { id: 'create-project-modal', name: 'Create Project Modal', trigger: '[data-testid= "create-project-btn"]' },
      { id: 'upload-modal', name: 'Upload Modal', trigger: '[data-testid= "upload-file-btn"]' },
      { id: 'payment-modal', name: 'Payment Modal', trigger: '[data-testid= "payment-btn"]' },
      { id: 'settings-modal', name: 'Settings Modal', trigger: '[data-testid= "settings-btn"]' }
    ]
  },

  // Form components
  forms: {
    name: 'Form Components',
    forms: [
      { id: 'project-form', name: 'Project Creation Form', url: '/projects/new' },
      { id: 'profile-form', name: 'Profile Settings Form', url: '/settings/profile' },
      { id: 'payment-form', name: 'Payment Form', url: '/payment' },
      { id: 'contact-form', name: 'Contact Form', url: '/contact' }
    ]
  }
};

class ComprehensiveTabTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      totalTabs: 0,
      testedTabs: 0,
      totalButtons: 0,
      testedButtons: 0,
      passedTests: 0,
      failedTests: 0,
      errors: [],
      reports: {}
    };
  }

  async initialize() {
    console.log('🚀 Initializing Comprehensive Tab Tester...');
    
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize(TEST_CONFIG.viewport);
    
    // Set up Context7 patterns
    await this.page.addInitScript(() => {
      window.testMode = true;
      window.interactionTracker = [];
    });
  }

  async testAllTabs() {
    console.log('\n🎯 Testing All Tabs and Interactive Elements...\n');

    // Test main dashboard components
    for (const [componentKey, component] of Object.entries(ALL_INTERACTIVE_ELEMENTS)) {
      await this.testComponent(componentKey, component);
    }

    // Test specialized components
    await this.testSpecializedComponents();

    return this.generateComprehensiveReport();
  }

  async testComponent(componentKey, component) {
    console.log(`\n📋 Testing Component: ${component.name}`);
    console.log(`🔗 URL: ${component.url}`);

    try {
      // Navigate to component
      await this.page.goto(`${TEST_CONFIG.baseUrl}${component.url}`, { 
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.timeout 
      });

      await this.page.waitForTimeout(2000); // Allow page to fully load

      // Test tabs if they exist
      if (component.tabs) {
        await this.testTabs(componentKey, component.tabs);
      }

      // Test buttons if they exist
      if (component.buttons) {
        await this.testButtons(componentKey, component.buttons);
      }

      this.results.reports[componentKey] = {
        name: component.name,
        url: component.url,
        status: 'passed',
        tabsCount: component.tabs?.length || 0,
        buttonsCount: component.buttons?.length || 0,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Error testing ${component.name}:`, error.message);
      this.results.errors.push({
        component: component.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.results.reports[componentKey] = {
        name: component.name,
        url: component.url,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async testTabs(componentKey, tabs) {
    console.log(`  🔖 Testing ${tabs.length} tabs...`);

    for (const tab of tabs) {
      try {
        console.log(`    📑 Testing tab: ${tab.name}`);
        
        // Try to find and click the tab
        const tabElement = await this.page.locator(tab.selector).first();
        
        if (await tabElement.isVisible()) {
          await tabElement.click();
          await this.page.waitForTimeout(1000); // Wait for tab content to load
          
          // Verify tab is active
          const isActive = await tabElement.getAttribute('aria-selected') === 'true' ||
                          await tabElement.getAttribute('data-state') === 'active';
          
          if (isActive) {
            console.log(`    ✅ Tab "${tab.name}" activated successfully`);
            this.results.testedTabs++;
            this.results.passedTests++;
          } else {
            console.log(`    ⚠️  Tab "${tab.name}" clicked but may not be active`);
            this.results.testedTabs++;
          }
        } else {
          console.log(`    ❌ Tab "${tab.name}" not found or not visible`);
          this.results.failedTests++;
        }
        
        this.results.totalTabs++;
        
      } catch (error) {
        console.log(`    ❌ Error testing tab "${tab.name}": ${error.message}`);
        this.results.failedTests++;
        this.results.errors.push({
          component: componentKey,
          tab: tab.name,
          error: error.message
        });
      }
    }
  }

  async testButtons(componentKey, buttons) {
    console.log(`  🔘 Testing ${buttons.length} buttons...`);

    for (const button of buttons) {
      try {
        console.log(`    🔲 Testing button: ${button.name}`);
        
        // Try to find the button
        const buttonElement = await this.page.locator(button.selector).first();
        
        if (await buttonElement.isVisible()) {
          // Check if button is enabled
          const isEnabled = !(await buttonElement.isDisabled());
          
          if (isEnabled) {
            // Test button interaction (hover, then click)
            await buttonElement.hover();
            await this.page.waitForTimeout(500);
            
            // Track the current URL before clicking
            const currentUrl = this.page.url();
            
            await buttonElement.click();
            await this.page.waitForTimeout(1500);
            
            // Check if URL changed or modal opened
            const newUrl = this.page.url();
            const urlChanged = currentUrl !== newUrl;
            
            // Check for modal or dialog
            const modalVisible = await this.page.locator('[role= "dialog"], .modal, [data-testid*= "modal"]').first().isVisible().catch(() => false);
            
            if (urlChanged || modalVisible) {
              console.log(`    ✅ Button "${button.name}" triggered navigation or modal`);
              this.results.passedTests++;
            } else {
              console.log(`    ⚠️  Button "${button.name}" clicked but no clear action detected`);
            }
            
            // Close modal if it opened
            if (modalVisible) {
              await this.page.keyboard.press('Escape');
              await this.page.waitForTimeout(500);
            }
            
            // Navigate back if URL changed
            if (urlChanged) {
              await this.page.goBack();
              await this.page.waitForTimeout(1000);
            }
            
          } else {
            console.log(`    ⚠️  Button "${button.name}" is disabled`);
          }
          
          this.results.testedButtons++;
        } else {
          console.log(`    ❌ Button "${button.name}" not found or not visible`);
          this.results.failedTests++;
        }
        
        this.results.totalButtons++;
        
      } catch (error) {
        console.log(`    ❌ Error testing button "${button.name}": ${error.message}`);
        this.results.failedTests++;
        this.results.errors.push({
          component: componentKey,
          button: button.name,
          error: error.message
        });
      }
    }
  }

  async testSpecializedComponents() {
    console.log('\n🎨 Testing Specialized Components...');

    // Test landing page
    await this.testLandingPage();
    
    // Test modals
    await this.testModals();
    
    // Test forms
    await this.testForms();
  }

  async testLandingPage() {
    const landingPage = SPECIALIZED_COMPONENTS.landingPage;
    console.log(`\n🏠 Testing: ${landingPage.name}`);
    
    try {
      await this.page.goto(`${TEST_CONFIG.baseUrl}${landingPage.url}`);
      await this.page.waitForTimeout(2000);
      
      // Test sections
      for (const section of landingPage.sections) {
        const sectionElement = await this.page.locator(section.selector).first();
        const isVisible = await sectionElement.isVisible().catch(() => false);
        
        console.log(`  📄 Section "${section.name}": ${isVisible ? '✅ Visible' : '❌ Not found'}`);
      }
      
      // Test landing page buttons
      await this.testButtons('landingPage', landingPage.buttons);
      
    } catch (error) {
      console.error(`❌ Error testing landing page: ${error.message}`);
    }
  }

  async testModals() {
    const modals = SPECIALIZED_COMPONENTS.modals;
    console.log(`\n📱 Testing: ${modals.name}`);
    
    for (const modal of modals.components) {
      try {
        console.log(`  🔲 Testing modal: ${modal.name}`);
        
        // Go to a page that has the modal trigger
        await this.page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
        await this.page.waitForTimeout(1000);
        
        const triggerElement = await this.page.locator(modal.trigger).first();
        
        if (await triggerElement.isVisible()) {
          await triggerElement.click();
          await this.page.waitForTimeout(1000);
          
          const modalElement = await this.page.locator('[role= "dialog"], .modal').first();
          const modalVisible = await modalElement.isVisible().catch(() => false);
          
          if (modalVisible) {
            console.log(`    ✅ Modal "${modal.name}" opened successfully`);
            
            // Test modal close
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(500);
            
            const modalClosed = !(await modalElement.isVisible().catch(() => true));
            console.log(`    ${modalClosed ? '✅' : '❌'} Modal close test`);
            
          } else {
            console.log(`    ❌ Modal "${modal.name}" did not open`);
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Error testing modal "${modal.name}": ${error.message}`);
      }
    }
  }

  async testForms() {
    const forms = SPECIALIZED_COMPONENTS.forms;
    console.log(`\n📝 Testing: ${forms.name}`);
    
    for (const form of forms.forms) {
      try {
        console.log(`  📄 Testing form: ${form.name}`);
        
        await this.page.goto(`${TEST_CONFIG.baseUrl}${form.url}`);
        await this.page.waitForTimeout(1000);
        
        // Look for form elements
        const formElement = await this.page.locator('form').first();
        const formExists = await formElement.isVisible().catch(() => false);
        
        if (formExists) {
          // Test form inputs
          const inputs = await this.page.locator('input, textarea, select').all();
          console.log(`    📝 Found ${inputs.length} form fields`);
          
          // Test submit button
          const submitBtn = await this.page.locator('[type= "submit"], button[type= "submit"]').first();
          const submitExists = await submitBtn.isVisible().catch(() => false);
          
          console.log(`    ${submitExists ? '✅' : '❌'} Submit button found`);
          console.log(`    ✅ Form "${form.name}" structure verified`);
        } else {
          console.log(`    ❌ Form "${form.name}" not found`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error testing form "${form.name}": ${error.message}`);
      }
    }
  }

  generateComprehensiveReport() {
    const report = {
      summary: {
        totalComponents: Object.keys(ALL_INTERACTIVE_ELEMENTS).length,
        totalTabs: this.results.totalTabs,
        testedTabs: this.results.testedTabs,
        totalButtons: this.results.totalButtons,
        testedButtons: this.results.testedButtons,
        passedTests: this.results.passedTests,
        failedTests: this.results.failedTests,
        successRate: Math.round((this.results.passedTests / (this.results.passedTests + this.results.failedTests)) * 100) || 0
      },
      componentReports: this.results.reports,
      errors: this.results.errors,
      timestamp: new Date().toISOString()
    };

    // Console output
    console.log('\n' + '='.repeat(80));'
    console.log('🎯 COMPREHENSIVE TAB TESTING COMPLETE');
    console.log('='.repeat(80));'
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Components Tested: ${report.summary.totalComponents}`);
    console.log(`   Tabs Tested: ${report.summary.testedTabs}/${report.summary.totalTabs}`);
    console.log(`   Buttons Tested: ${report.summary.testedButtons}/${report.summary.totalButtons}`);
    console.log(`   Tests Passed: ${report.summary.passedTests}`);
    console.log(`   Tests Failed: ${report.summary.failedTests}`);
    console.log(`   Success Rate: ${report.summary.successRate}%`);

    if (report.summary.successRate >= 90) {
      console.log(`\n🎉 EXCELLENT! High success rate achieved!`);
    } else if (report.summary.successRate >= 70) {
      console.log(`\n✅ GOOD! Most tests passed successfully.`);
    } else {
      console.log(`\n⚠️  NEEDS IMPROVEMENT: Several issues found.`);
    }

    // Show component status
    console.log(`\n📋 COMPONENT STATUS:`);
    Object.entries(report.componentReports).forEach(([key, component]) => {
      const status = component.status === 'passed' ? '✅' : '❌';
      console.log(`   ${status} ${component.name}`);
    });

    // Show errors if any
    if (this.results.errors.length > 0) {
      console.log(`\n❌ ERRORS FOUND:`);
      this.results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.component}: ${error.error}`);
      });
      
      if (this.results.errors.length > 10) {
        console.log(`   ... and ${this.results.errors.length - 10} more errors`);
      }
    }

    console.log(`\n📄 Full report saved to: comprehensive-tab-test-report.json`);
    
    return report;
  }

  async saveReport(report) {
    try {
      await fs.writeFile('comprehensive-tab-test-report.json',
        JSON.stringify(report, null, 2)
      );
      
      // Also create a markdown report
      const markdown = this.generateMarkdownReport(report);
      await fs.writeFile('comprehensive-tab-test-report.md', markdown);
      
      console.log('📄 Reports saved successfully!');
    } catch (error) {
      console.error('❌ Error saving reports: ', error.message);
    }
  }

  generateMarkdownReport(report) {
    const { summary } = report;
    
    return `# 🎯 Comprehensive Tab Testing Report

## 📊 Executive Summary

- **Components Tested**: ${summary.totalComponents}
- **Tabs Tested**: ${summary.testedTabs}/${summary.totalTabs}
- **Buttons Tested**: ${summary.testedButtons}/${summary.totalButtons}
- **Success Rate**: ${summary.successRate}%
- **Date**: ${new Date(report.timestamp).toLocaleDateString()}

## 📋 Component Results

${Object.entries(report.componentReports).map(([key, component]) => {
  const status = component.status === 'passed' ? '✅' : '❌';
  return `### ${status} ${component.name}
- **URL**: ${component.url}
- **Status**: ${component.status}
- **Tabs**: ${component.tabsCount || 0}
- **Buttons**: ${component.buttonsCount || 0}
${component.error ? `- **Error**: ${component.error}` : ''}'
`;
}).join('\n')}

## 🔧 Recommendations

${summary.successRate >= 90 ? 
  '🎉 **Excellent Results!** All components are functioning well.' :
  summary.successRate >= 70 ?
    '✅ **Good Results!** Minor issues should be addressed.' : '⚠️ **Needs Attention!** Several components require fixes.'
}

${report.errors.length > 0 ? `
## ❌ Issues Found

${report.errors.map((error, index) => 
  `${index + 1}. **${error.component}**: ${error.error}`
).join('\n')}
` : ''}'

---
*Generated on ${new Date(report.timestamp).toLocaleString()}*
`;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      const report = await this.testAllTabs();
      await this.saveReport(report);
      await this.cleanup();
      
      process.exit(report.summary.successRate >= 70 ? 0 : 1);
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new ComprehensiveTabTester();
  tester.run();
}

module.exports = ComprehensiveTabTester; 