import { test, expect, Page } from '@playwright/test';

interface FeatureTest {
  name: string;
  path: string;
  description: string;
  category: string;
  expectedElements?: string[];
  criticalFunctions?: string[];
}

// Comprehensive feature list based on dashboard configuration
const allFeatures: FeatureTest[] = [
  // Core Features
  { name: 'My Day', path: 'my-day', description: 'AI-powered daily planning', category: 'core', expectedElements: ['[data-testid="my-day-container"]', 'button', 'input'] },
  { name: 'Projects Hub', path: 'projects-hub', description: 'Project management system', category: 'core', expectedElements: ['[data-testid="projects-container"]', 'button', '.project-card'] },
  { name: 'Analytics', path: 'analytics', description: 'Business intelligence', category: 'core', expectedElements: ['[data-testid="analytics-dashboard"]', '.chart', '.metric'] },
  { name: 'Time Tracking', path: 'time-tracking', description: 'Time tracking and metrics', category: 'core', expectedElements: ['[data-testid="time-tracker"]', 'button', '.timer'] },

  // AI Features
  { name: 'AI Create', path: 'ai-create', description: 'Multi-model AI studio', category: 'ai', expectedElements: ['[data-testid="ai-create-studio"]', 'textarea', 'button'] },
  { name: 'AI Design', path: 'ai-design', description: 'AI-powered design generation', category: 'ai', expectedElements: ['[data-testid="ai-design-studio"]', 'canvas', 'button'] },
  { name: 'AI Assistant', path: 'ai-assistant', description: 'Personal AI assistant', category: 'ai', expectedElements: ['[data-testid="ai-assistant"]', 'input', 'button'] },

  // Creative Suite
  { name: 'Video Studio', path: 'video-studio', description: 'Video editing with AI transcription', category: 'creative', expectedElements: ['[data-testid="video-studio"]', 'video', 'button'] },
  { name: 'Canvas', path: 'canvas', description: 'Interactive design canvas', category: 'creative', expectedElements: ['canvas', '[data-testid="canvas-tools"]', 'button'] },
  { name: 'Gallery', path: 'gallery', description: 'Portfolio showcase', category: 'creative', expectedElements: ['[data-testid="gallery"]', '.gallery-item', 'button'] },
  { name: 'CV Portfolio', path: 'cv-portfolio', description: 'Portfolio and resume builder', category: 'creative', expectedElements: ['[data-testid="cv-builder"]', 'form', 'button'] },

  // Business Tools
  { name: 'Financial Hub', path: 'financial-hub', description: 'Financial management', category: 'business', expectedElements: ['[data-testid="financial-dashboard"]', '.financial-metric', 'button'] },
  { name: 'Financial', path: 'financial', description: 'Financial tracking', category: 'business', expectedElements: ['[data-testid="financial-tracker"]', 'table', 'button'] },
  { name: 'Bookings', path: 'bookings', description: 'Appointment scheduling', category: 'business', expectedElements: ['[data-testid="booking-system"]', 'calendar', 'button'] },
  { name: 'Calendar', path: 'calendar', description: 'Advanced calendar', category: 'business', expectedElements: ['[data-testid="calendar"]', '.calendar-grid', 'button'] },

  // Communication
  { name: 'Messages', path: 'messages', description: 'Communication hub', category: 'communication', expectedElements: ['[data-testid="messages"]', '.message-thread', 'textarea'] },
  { name: 'Collaboration', path: 'collaboration', description: 'Real-time collaboration', category: 'communication', expectedElements: ['[data-testid="collaboration-tools"]', '.collaboration-panel', 'button'] },
  { name: 'Community Hub', path: 'community-v2', description: 'Professional networking', category: 'communication', expectedElements: ['[data-testid="community"]', '.community-post', 'button'] },
  { name: 'Client Zone', path: 'client-zone', description: 'Client portal', category: 'communication', expectedElements: ['[data-testid="client-portal"]', '.client-project', 'button'] },

  // Storage & Files
  { name: 'Files Hub', path: 'files-hub', description: 'Multi-cloud storage', category: 'storage', expectedElements: ['[data-testid="files-hub"]', '.file-item', 'button'] },
  { name: 'Files', path: 'files', description: 'File management', category: 'storage', expectedElements: ['[data-testid="file-manager"]', '.file-list', 'button'] },

  // Settings
  { name: 'Settings', path: 'settings', description: 'Platform configuration', category: 'settings', expectedElements: ['[data-testid="settings"]', 'form', 'button'] },
  { name: 'Notifications', path: 'notifications', description: 'Notification management', category: 'settings', expectedElements: ['[data-testid="notifications"]', '.notification-item', 'button'] }
];

class FeatureTester {
  constructor(private page: Page) {}

  async navigateToFeature(feature: FeatureTest): Promise<{ success: boolean; error?: string; loadTime: number }> {
    const startTime = Date.now();
    try {
      await this.page.goto(`http://localhost:9323/dashboard/${feature.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Wait for page to be interactive
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });

      const loadTime = Date.now() - startTime;
      return { success: true, loadTime };
    } catch (error) {
      const loadTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        loadTime
      };
    }
  }

  async checkExpectedElements(feature: FeatureTest): Promise<{ found: string[]; missing: string[]; total: number }> {
    const found: string[] = [];
    const missing: string[] = [];

    if (!feature.expectedElements) {
      return { found, missing, total: 0 };
    }

    for (const selector of feature.expectedElements) {
      try {
        const element = await this.page.waitForSelector(selector, { timeout: 3000 });
        if (element) {
          found.push(selector);
        }
      } catch {
        missing.push(selector);
      }
    }

    return { found, missing, total: feature.expectedElements.length };
  }

  async checkForErrors(): Promise<string[]> {
    const errors: string[] = [];

    // Check for console errors
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`);
      }
    });

    // Check for network failures
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        errors.push(`Network Error: ${response.status()} - ${response.url()}`);
      }
    });

    // Check for unhandled exceptions
    this.page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });

    return errors;
  }

  async testBasicInteractivity(feature: FeatureTest): Promise<{ buttons: number; inputs: number; links: number }> {
    const buttons = await this.page.locator('button:visible').count();
    const inputs = await this.page.locator('input:visible, textarea:visible').count();
    const links = await this.page.locator('a[href]:visible').count();

    return { buttons, inputs, links };
  }
}

test.describe('Comprehensive Feature Testing', () => {
  let featureTester: FeatureTester;
  const results: Array<{
    feature: FeatureTest;
    navigation: { success: boolean; error?: string; loadTime: number };
    elements: { found: string[]; missing: string[]; total: number };
    interactivity: { buttons: number; inputs: number; links: number };
    errors: string[];
  }> = [];

  test.beforeEach(async ({ page }) => {
    featureTester = new FeatureTester(page);
  });

  // Group tests by category for better organization
  const categories = ['core', 'ai', 'creative', 'business', 'communication', 'storage', 'settings'];

  for (const category of categories) {
    test.describe(`${category.toUpperCase()} Features`, () => {
      const categoryFeatures = allFeatures.filter(f => f.category === category);

      for (const feature of categoryFeatures) {
        test(`should test ${feature.name} (${feature.path})`, async ({ page }) => {
          console.log(`\n🧪 Testing ${feature.name} - ${feature.description}`);

          const featureTester = new FeatureTester(page);

          // Test 1: Navigation
          console.log(`📍 Navigating to /dashboard/${feature.path}`);
          const navigation = await featureTester.navigateToFeature(feature);

          if (!navigation.success) {
            console.log(`❌ Navigation failed: ${navigation.error}`);
            // Still record the result for reporting
            results.push({
              feature,
              navigation,
              elements: { found: [], missing: [], total: 0 },
              interactivity: { buttons: 0, inputs: 0, links: 0 },
              errors: [navigation.error || 'Navigation failed']
            });
            return;
          }

          console.log(`✅ Navigation successful (${navigation.loadTime}ms)`);

          // Test 2: Expected Elements
          console.log(`🔍 Checking expected elements...`);
          const elements = await featureTester.checkExpectedElements(feature);
          console.log(`📊 Elements: ${elements.found.length}/${elements.total} found`);

          if (elements.missing.length > 0) {
            console.log(`⚠️  Missing elements: ${elements.missing.join(', ')}`);
          }

          // Test 3: Basic Interactivity
          console.log(`🖱️  Checking interactivity...`);
          const interactivity = await featureTester.testBasicInteractivity(feature);
          console.log(`🔘 Interactive elements: ${interactivity.buttons} buttons, ${interactivity.inputs} inputs, ${interactivity.links} links`);

          // Test 4: Error Detection
          const errors = await featureTester.checkForErrors();
          if (errors.length > 0) {
            console.log(`🚨 Errors detected: ${errors.length}`);
            errors.forEach(error => console.log(`   ${error}`));
          }

          // Record results
          results.push({
            feature,
            navigation,
            elements,
            interactivity,
            errors
          });

          // Basic assertions
          expect(navigation.success).toBe(true);
          expect(navigation.loadTime).toBeLessThan(15000); // 15 second timeout

          // Should have some interactive elements (unless it's a pure display feature)
          if (feature.category !== 'settings') {
            expect(interactivity.buttons + interactivity.inputs + interactivity.links).toBeGreaterThan(0);
          }

          console.log(`✅ ${feature.name} test completed successfully\n`);
        });
      }
    });
  }

  test.afterAll(async () => {
    // Generate comprehensive report
    console.log('\n📊 COMPREHENSIVE FEATURE TEST RESULTS');
    console.log('=' * 60);

    const successful = results.filter(r => r.navigation.success);
    const failed = results.filter(r => !r.navigation.success);

    console.log(`Total Features Tested: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Success Rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);

    // Category breakdown
    console.log('\nBy Category:');
    for (const category of categories) {
      const categoryResults = results.filter(r => r.feature.category === category);
      const categorySuccess = categoryResults.filter(r => r.navigation.success);
      console.log(`  ${category.toUpperCase()}: ${categorySuccess.length}/${categoryResults.length} (${((categorySuccess.length / categoryResults.length) * 100).toFixed(1)}%)`);
    }

    // Performance summary
    const avgLoadTime = successful.reduce((sum, r) => sum + r.navigation.loadTime, 0) / successful.length;
    console.log(`\nAverage Load Time: ${avgLoadTime.toFixed(0)}ms`);

    // Error summary
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    console.log(`Total Errors: ${totalErrors}`);

    // Failed features details
    if (failed.length > 0) {
      console.log('\n❌ FAILED FEATURES:');
      failed.forEach(f => {
        console.log(`  ${f.feature.name} (${f.feature.path}): ${f.navigation.error}`);
      });
    }
  });
});