import { test, expect } from '@playwright/test';

test.describe('AI Features Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
  });

  test('should use AI Assist to generate content and save to AI Create', async ({ page }) => {
    // Start in AI Assist
    await page.getByRole('tab', { name: /ai.*assist/i }).click();
    await page.waitForTimeout(1000);
    
    // Generate content using AI Assist
    await page.getByPlaceholder(/ask.*ai|chat.*ai|message/i).fill('Create a modern tech company logo design brief');
    await page.getByRole('button', { name: /send|submit/i }).click();
    
    // Wait for response and verify
    await page.waitForSelector('[data-testid="ai-response"]');
    const designBrief = await page.locator('[data-testid="ai-response"]').textContent();
    expect(designBrief).toBeTruthy();
    
    // Save to AI Create
    await page.getByRole('button', { name: /save to ai create/i }).click();
    
    // Switch to AI Create
    await page.getByRole('tab', { name: /ai.*create/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify design brief is loaded
    await expect(page.locator('[data-testid="prompt-input"]')).toContainText(designBrief);
    
    // Generate assets from brief
    await page.getByRole('button', { name: /generate assets/i }).click();
    await page.waitForSelector('[data-testid="generated-asset"]');
    
    // Verify asset generation
    await expect(page.locator('[data-testid="generated-asset"]')).toBeVisible();
    await expect(page.locator('[data-testid="asset-preview"]')).toBeVisible();
  });

  test('should use AI Create to generate assets and get AI Assist feedback', async ({ page }) => {
    // Start in AI Create
    await page.getByRole('tab', { name: /ai.*create/i }).click();
    await page.waitForTimeout(1000);
    
    // Upload reference image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-data/reference-logo.png');
    
    // Generate variations
    await page.getByRole('button', { name: /generate variations/i }).click();
    await page.waitForSelector('[data-testid="generated-variations"]');
    
    // Select a variation
    await page.locator('[data-testid="generated-variations"]').first().click();
    
    // Get AI feedback
    await page.getByRole('button', { name: /get ai feedback/i }).click();
    
    // Switch to AI Assist
    await page.getByRole('tab', { name: /ai.*assist/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify feedback request
    await expect(page.locator('[data-testid="design-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="improvement-suggestions"]')).toBeVisible();
  });

  test('should use AI features across project workflow', async ({ page }) => {
    // Create new project
    await page.getByRole('tab', { name: /projects.*hub/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /create project/i }).click();
    await page.getByLabel('Project Name').fill('AI-Powered Branding Project');
    await page.getByRole('button', { name: /create/i }).click();
    
    // Get AI recommendations for project setup
    await page.getByRole('button', { name: /ai recommendations/i }).click();
    await page.waitForSelector('[data-testid="ai-recommendations"]');
    
    // Use AI Assist for project planning
    await page.getByRole('tab', { name: /ai.*assist/i }).click();
    await page.waitForTimeout(1000);
    await page.getByPlaceholder(/ask.*ai|chat.*ai|message/i)
      .fill('Help me create a timeline for the AI-Powered Branding Project');
    await page.getByRole('button', { name: /send|submit/i }).click();
    
    // Save timeline to project
    await page.waitForSelector('[data-testid="ai-response"]');
    await page.getByRole('button', { name: /save to project/i }).click();
    
    // Use AI Create for brand assets
    await page.getByRole('tab', { name: /ai.*create/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /new asset/i }).click();
    await page.getByLabel('Asset Type').selectOption('branding');
    await page.getByPlaceholder('Describe what you want to create...').fill('Modern tech company brand kit');
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Wait for generation and save to project
    await page.waitForSelector('[data-testid="generated-assets"]');
    await page.getByRole('button', { name: /save to project/i }).click();
    
    // Verify project updates
    await page.getByRole('tab', { name: /projects.*hub/i }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('AI-Powered Branding Project')).toBeVisible();
    await expect(page.getByTestId('project-timeline')).toBeVisible();
    await expect(page.getByTestId('project-assets')).toBeVisible();
  });

  test('should handle AI feature errors gracefully', async ({ page }) => {
    // Test AI Assist error handling
    await page.getByRole('tab', { name: /ai.*assist/i }).click();
    await page.waitForTimeout(1000);
    await page.route('**/api/ai/assist', route => route.abort());
    await page.getByPlaceholder(/ask.*ai|chat.*ai|message/i).fill('Test error handling');
    await page.getByRole('button', { name: /send|submit/i }).click();
    await expect(page.getByText(/error|failed/i)).toBeVisible();
    
    // Test AI Create error handling
    await page.getByRole('tab', { name: /ai.*create/i }).click();
    await page.waitForTimeout(1000);
    await page.route('**/api/ai/create', route => route.abort());
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.getByText(/error|failed/i)).toBeVisible();
    
    // Verify error recovery
    await page.unroute('**/api/ai/**');
    await page.getByRole('button', { name: /retry/i }).click();
    await expect(page.getByText(/error|failed/i)).not.toBeVisible();
  });
});