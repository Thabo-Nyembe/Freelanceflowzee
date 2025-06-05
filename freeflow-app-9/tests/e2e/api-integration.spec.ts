import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-test-mode': 'true' });
  });

  test('storage upload API should respond correctly', async ({ request }) => {
    // Test GET endpoint
    const response = await request.get('/api/storage/upload', {
      headers: { 'x-test-mode': 'true' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Storage upload endpoint is working');
  });

  test('project access API should handle password method', async ({ request }) => {
    const response = await request.post('/api/projects/test-project/access', {
      headers: { 'x-test-mode': 'true' },
      data: {
        method: 'password',
        password: 'test123'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.accessToken).toBeDefined();
  });

  test('project access API should handle access code method', async ({ request }) => {
    const response = await request.post('/api/projects/test-project/access', {
      headers: { 'x-test-mode': 'true' },
      data: {
        method: 'code',
        accessCode: 'PREMIUM2024'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.accessToken).toBeDefined();
  });

  test('project access API should reject invalid credentials', async ({ request }) => {
    const response = await request.post('/api/projects/test-project/access', {
      headers: { 'x-test-mode': 'true' },
      data: {
        method: 'password',
        password: 'invalid-password'
      }
    });
    
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid password');
  });

  test('API endpoints should handle test mode properly', async ({ request }) => {
    // Test with test mode header
    const testResponse = await request.get('/api/projects/test-project/access', {
      headers: { 'x-test-mode': 'true' }
    });
    
    expect(testResponse.status()).toBe(200);
    
    const testData = await testResponse.json();
    expect(testData.success).toBe(true);
    expect(testData.message).toContain('endpoint is working');
  });
});
