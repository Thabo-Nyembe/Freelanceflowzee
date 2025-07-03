import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import path from 'path';

test.describe('AI Create Feature', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateToFeature('AI Create');
  });

  test('should use Design Assistant for image analysis', async ({ page }) => {
    // Upload image for analysis
    const imagePath = path.join(__dirname, '../../public/images/sample-design.jpg');
    await helpers.uploadFile('[data-testid="design-upload"]', imagePath);
    
    // Start analysis
    await page.click('[data-testid="analyze-design"]');
    await page.waitForSelector('[data-testid="analysis-complete"]');
    
    // Verify analysis results
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="typography-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="layout-feedback"]')).toBeVisible();
    
    // Check AI suggestions
    await expect(page.locator('[data-testid="design-suggestions"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="improvement-points"]')).toHaveCount(3);
  });

  test('should generate code from design', async ({ page }) => {
    // Upload design mockup
    const mockupPath = path.join(__dirname, '../../public/images/website-mockup.jpg');
    await helpers.uploadFile('[data-testid="mockup-upload"]', mockupPath);
    
    // Select code generation options
    await page.click('[data-testid="code-generator"]');
    await page.selectOption('[data-testid="framework-select"]', 'react');
    await page.selectOption('[data-testid="style-select"]', 'tailwind');
    
    // Generate code
    await page.click('[data-testid="generate-code"]');
    await page.waitForSelector('[data-testid="generation-complete"]');
    
    // Verify generated code
    await expect(page.locator('[data-testid="code-preview"]')).toContainText('<div');
    await expect(page.locator('[data-testid="code-preview"]')).toContainText('className=');
    
    // Check code quality
    await expect(page.locator('[data-testid="code-analysis"]')).toContainText('Responsive');
    await expect(page.locator('[data-testid="code-analysis"]')).toContainText('Accessible');
  });

  test('should use Content Writer for marketing copy', async ({ page }) => {
    // Navigate to content writer
    await page.click('[data-testid="content-writer"]');
    
    // Set content parameters
    await page.fill('[data-testid="topic-input"]', 'Professional Design Services');
    await page.selectOption('[data-testid="tone-select"]', 'professional');
    await page.fill('[data-testid="keywords-input"]', 'design, branding, creative');
    await page.selectOption('[data-testid="length-select"]', 'medium');
    
    // Generate content
    await page.click('[data-testid="generate-content"]');
    await page.waitForSelector('[data-testid="content-ready"]');
    
    // Verify content quality
    const content = await page.locator('[data-testid="generated-content"]').textContent();
    expect(content).toContain('design');
    expect(content.length).toBeGreaterThan(200);
    
    // Check content variations
    await page.click('[data-testid="generate-variation"]');
    await page.waitForSelector('[data-testid="variation-ready"]');
    const variation = await page.locator('[data-testid="content-variation"]').textContent();
    expect(variation).not.toEqual(content);
  });

  test('should generate images from text prompts', async ({ page }) => {
    // Navigate to image generator
    await page.click('[data-testid="image-generator"]');
    
    // Set image parameters
    await page.fill('[data-testid="prompt-input"]', 'Modern minimalist logo design');
    await page.selectOption('[data-testid="style-select"]', 'minimalist');
    await page.selectOption('[data-testid="color-scheme"]', 'monochrome');
    
    // Generate image
    await page.click('[data-testid="generate-image"]');
    await page.waitForSelector('[data-testid="image-ready"]', { timeout: 60000 });
    
    // Verify image generation
    await expect(page.locator('[data-testid="generated-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="image-download"]')).toBeEnabled();
    
    // Generate variations
    await page.click('[data-testid="generate-variations"]');
    await page.waitForSelector('[data-testid="variations-ready"]');
    await expect(page.locator('[data-testid="image-variation"]')).toHaveCount(4);
  });

  test('should handle AI processing errors gracefully', async ({ page }) => {
    // Test invalid image upload
    const invalidPath = path.join(__dirname, '../../public/images/invalid.txt');
    await helpers.uploadFile('[data-testid="design-upload"]', invalidPath);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid file type');

    // Test empty prompt
    await page.click('[data-testid="content-writer"]');
    await page.click('[data-testid="generate-content"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Please enter a topic');

    // Test API failure
    await page.route('**/api/ai/**', route => route.abort());
    await page.fill('[data-testid="topic-input"]', 'Test Content');
    await page.click('[data-testid="generate-content"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('AI service unavailable');
  });

  test('should integrate with project workflow', async ({ page }) => {
    // Create design project
    await page.click('[data-testid="new-project"]');
    await page.fill('[data-testid="project-name"]', 'AI Design Project');
    await page.click('[data-testid="create-project"]');
    
    // Use multiple AI features
    const mockupPath = path.join(__dirname, '../../public/images/website-mockup.jpg');
    await helpers.uploadFile('[data-testid="mockup-upload"]', mockupPath);
    
    // Generate and save assets
    await page.click('[data-testid="generate-all"]');
    await page.waitForSelector('[data-testid="generation-complete"]');
    
    // Verify project assets
    await expect(page.locator('[data-testid="project-assets"]')).toContainText('Generated Code');
    await expect(page.locator('[data-testid="project-assets"]')).toContainText('Marketing Copy');
    await expect(page.locator('[data-testid="project-assets"]')).toContainText('Brand Assets');
    
    // Export project
    await page.click('[data-testid="export-project"]');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-all"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('AI-Design-Project');
  });

  test('should optimize AI processing performance', async ({ page }) => {
    // Upload large design file
    const largePath = path.join(__dirname, '../../public/images/large-design.jpg');
    await helpers.uploadFile('[data-testid="design-upload"]', largePath);
    
    // Monitor processing time
    const startTime = Date.now();
    await page.click('[data-testid="analyze-design"]');
    await page.waitForSelector('[data-testid="analysis-complete"]');
    const processingTime = Date.now() - startTime;
    
    // Verify reasonable processing time
    expect(processingTime).toBeLessThan(30000); // 30 seconds max
    
    // Check streaming response
    await page.click('[data-testid="content-writer"]');
    await page.fill('[data-testid="topic-input"]', 'Performance Test');
    await page.click('[data-testid="generate-content"]');
    
    // Verify streaming updates
    await expect(page.locator('[data-testid="streaming-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
  });
});