import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
  });

  test('should load dashboard within performance budget', async ({ page }) => {
    // Measure initial page load
    const startTime = Date.now();
    await page.goto('http://localhost:3000/dashboard');
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Check for key elements
    await expect(page.getByRole('tab', { name: /ai.*create/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /ai.*assist/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /projects.*hub/i })).toBeVisible();
  });

  test('should handle AI operations within performance targets', async ({ page }) => {
    // Navigate to AI Create
    await page.getByRole('tab', { name: /ai.*create/i }).click();
    await page.waitForTimeout(1000);
    
    // Measure asset generation time
    await page.getByRole('button', { name: /new asset/i }).click();
    await page.getByLabel('Asset Type').selectOption('image');
    await page.getByPlaceholder('Describe what you want to create...').fill('Simple test image');
    
    const startTime = Date.now();
    await page.getByRole('button', { name: /generate/i }).click();
    await page.waitForSelector('[data-testid="generated-asset"]');
    const generationTime = Date.now() - startTime;
    
    // Performance budget: 5 seconds for generation
    expect(generationTime).toBeLessThan(5000);
  });

  test('should maintain responsiveness under load', async ({ page }) => {
    // Navigate to Files Hub
    await page.getByRole('tab', { name: /files.*hub/i }).click();
    await page.waitForTimeout(1000);
    
    // Upload multiple files simultaneously
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      'test-data/reference-logo.svg',
      'test-data/project.json'
    ]);
    
    // Measure upload time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="upload-complete"]');
    const uploadTime = Date.now() - startTime;
    
    // Performance budget: 3 seconds for upload
    expect(uploadTime).toBeLessThan(3000);
    
    // Check UI responsiveness during upload
    const tabResponse = await page.evaluate(async () => {
      const start = performance.now();
      document.querySelector('[role="tab"]').click();
      return performance.now() - start;
    });
    
    // UI interaction should be under 100ms
    expect(tabResponse).toBeLessThan(100);
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    // Start multiple operations concurrently
    const operations = [
      // AI generation
      page.getByRole('tab', { name: /ai.*create/i }).click()
        .then(() => page.getByRole('button', { name: /new asset/i }).click())
        .then(() => page.getByLabel('Asset Type').selectOption('image'))
        .then(() => page.getByPlaceholder('Describe what you want to create...').fill('Test image'))
        .then(() => page.getByRole('button', { name: /generate/i }).click()),
      
      // File upload
      page.getByRole('tab', { name: /files.*hub/i }).click()
        .then(() => page.locator('input[type="file"]').setInputFiles('test-data/reference-logo.svg')),
      
      // Project creation
      page.getByRole('tab', { name: /projects.*hub/i }).click()
        .then(() => page.getByRole('button', { name: /create project/i }).click())
        .then(() => page.getByLabel('Project Name').fill('Performance Test Project'))
        .then(() => page.getByRole('button', { name: /create/i }).click())
    ];
    
    // Measure total completion time
    const startTime = Date.now();
    await Promise.all(operations);
    const completionTime = Date.now() - startTime;
    
    // Performance budget: 8 seconds for all operations
    expect(completionTime).toBeLessThan(8000);
  });

  test('should maintain memory usage within limits', async ({ page }) => {
    // Monitor memory during intensive operations
    await page.getByRole('tab', { name: /ai.*create/i }).click();
    
    // Generate multiple assets
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /new asset/i }).click();
      await page.getByLabel('Asset Type').selectOption('image');
      await page.getByPlaceholder('Describe what you want to create...').fill(`Test image ${i + 1}`);
      await page.getByRole('button', { name: /generate/i }).click();
      await page.waitForSelector('[data-testid="generated-asset"]');
    }
    
    // Check browser process memory
    const processMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
    
    // Memory budget: 100MB
    expect(processMemory).toBeLessThan(100 * 1024 * 1024);
  });

  test('should optimize network requests', async ({ page }) => {
    // Enable request logging
    const requests = [];
    page.on('request', request => requests.push(request));
    
    // Navigate through features
    await page.getByRole('tab', { name: /ai.*create/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('tab', { name: /ai.*assist/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('tab', { name: /projects.*hub/i }).click();
    await page.waitForTimeout(1000);
    
    // Analyze requests
    const uniqueEndpoints = new Set(requests.map(r => r.url()));
    const totalSize = requests.reduce((sum, r) => sum + (r.size() || 0), 0);
    
    // Network budget: 50 requests, 2MB total
    expect(uniqueEndpoints.size).toBeLessThan(50);
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);
  });
});