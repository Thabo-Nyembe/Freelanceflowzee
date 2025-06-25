// 🧪 Rate Limiting Tests
// Tests rate limiting functionality for the /api/projects/[slug]/access endpoint

import { test, expect } from '@playwright/test';

// Configuration for accessing the API
test.use({
  baseURL: 'http://localhost:3001',
  extraHTTPHeaders: {
    'Content-Type': 'application/json'
  },
});

const TEST_PROJECT_SLUG = 'premium-brand-identity-package';

const VALID_CREDENTIALS = {
  password: 'secure-unlock-2024',
  accessCode: 'BRAND2024'
};

// Run tests in isolation
test.describe.configure({ mode: 'serial' });

test.describe('🚫 Rate Limiting', () => {
  // Clear rate limits before each test
  test.beforeEach(async ({ request }) => {
    await request.post('/api/projects/clear-rate-limits', {
      headers: {
        'x-admin-key': 'test-admin-key'
      }
    });
    // Wait a bit to ensure rate limits are cleared
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
    
  test('should implement rate limiting after 5 failed attempts', async ({ request }) => {
    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: `wrong-password-${i}`
        }
      });
      
      const data = await response.json();
      console.log(`Attempt ${i + 1} response:`, {
        status: response.status(),
        data
      });
      
      expect(response.status()).toBe(401);
    }

    // 6th attempt should be rate limited
    const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
      data: {
        password: 'wrong-password-6'
      }
    });

    const data = await response.json();
    console.log('Final attempt response:', {
      status: response.status(),
      data
    });

    expect(response.status()).toBe(429);
    expect(data.error).toContain('Too many failed attempts');
    expect(data.code).toBe('rate_limited');
    expect(data.retryAfter).toBeGreaterThan(0);
  });

  test('should clear rate limiting on successful access', async ({ request }) => {
    // Make a few failed attempts
    for (let i = 0; i < 3; i++) {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: `wrong-password-${i}`
        }
      });
      const data = await response.json();
      console.log(`Failed attempt ${i + 1} response:`, {
        status: response.status(),
        data
      });
    }

    // Successful attempt should clear rate limiting
    const successResponse = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
      data: {
        password: VALID_CREDENTIALS.password
      }
    });

    const successData = await successResponse.json();
    console.log('Success response:', {
      status: successResponse.status(),
      data: successData
    });

    expect(successResponse.status()).toBe(200);

    // Next attempt should not be rate limited
    const nextResponse = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
      data: {
        password: 'wrong-password-after-success'
      }
    });

    const nextData = await nextResponse.json();
    console.log('Next attempt response:', {
      status: nextResponse.status(),
      data: nextData
    });

    expect(nextResponse.status()).toBe(401); // Should be unauthorized, not rate limited
  });
}); 