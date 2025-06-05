// 🧪 Access API Endpoint Testing Suite
// Comprehensive testing for the /api/projects/[slug]/access endpoint
// Tests rate limiting, validation, security, and proper responses

import { test, expect } from '@playwright/test';

// Configuration for accessing the API
test.use({
  baseURL: 'http://localhost:3000',
  extraHTTPHeaders: {
    'Content-Type': 'application/json',
  },
});

const TEST_PROJECT_SLUG = 'premium-brand-identity-package';

const VALID_CREDENTIALS = {
  password: 'secure-unlock-2024',
  accessCode: 'BRAND2024'
};

const INVALID_CREDENTIALS = {
  password: 'wrong-password',
  accessCode: 'INVALID123'
};

test.describe('🔑 Access API Endpoint Testing', () => {
  
  // Reset rate limiting before each test to ensure isolation
  test.beforeEach(async ({ request }) => {
    // Reset rate limiting by calling a special endpoint (we'll wait a bit to let any previous requests finish)
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  test.describe('✅ Valid Access Attempts', () => {
    
    test('should grant access with valid password', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: VALID_CREDENTIALS.password
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.accessToken).toMatch(/^access_token_\d+_[a-z0-9]+$/);
      expect(data.projectSlug).toBe(TEST_PROJECT_SLUG);
      expect(data.unlockUrl).toBe(`/projects/${TEST_PROJECT_SLUG}/unlocked`);
      expect(data.expiresAt).toBeDefined();
      expect(data.message).toBe('Access granted successfully');
    });

    test('should grant access with valid access code', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          accessCode: VALID_CREDENTIALS.accessCode
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.accessToken).toMatch(/^access_token_\d+_[a-z0-9]+$/);
      expect(data.projectSlug).toBe(TEST_PROJECT_SLUG);
      expect(data.unlockUrl).toBe(`/projects/${TEST_PROJECT_SLUG}/unlocked`);
    });

    test('should grant access with both valid credentials', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: VALID_CREDENTIALS.password,
          accessCode: VALID_CREDENTIALS.accessCode
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('❌ Invalid Access Attempts', () => {
    
    test('should reject invalid password', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: INVALID_CREDENTIALS.password
        }
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
      expect(data.code).toBe('unauthorized');
    });

    test('should reject invalid access code', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          accessCode: INVALID_CREDENTIALS.accessCode
        }
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid credentials');
      expect(data.code).toBe('unauthorized');
    });

    test('should reject empty credentials', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {}
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Please enter either a password or access code');
      expect(data.code).toBe('validation_error');
    });

    test('should reject request with empty strings', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: '',
          accessCode: ''
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Please enter either a password or access code');
      expect(data.code).toBe('validation_error');
    });
  });

  test.describe('🚫 Rate Limiting', () => {
    
    test('should implement rate limiting after 5 failed attempts', async ({ request }) => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
          data: {
            password: `wrong-password-${i}`
          }
        });
        
        expect(response.status()).toBe(401);
      }

      // 6th attempt should be rate limited
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: 'wrong-password-6'
        }
      });

      expect(response.status()).toBe(429);
      
      const data = await response.json();
      expect(data.error).toContain('Too many failed attempts');
      expect(data.code).toBe('rate_limited');
      expect(data.retryAfter).toBeGreaterThan(0);
    });

    test('should clear rate limiting on successful access', async ({ request }) => {
      // Make a few failed attempts
      for (let i = 0; i < 3; i++) {
        await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
          data: {
            password: `wrong-password-${i}`
          }
        });
      }

      // Successful attempt should clear rate limiting
      const successResponse = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: VALID_CREDENTIALS.password
        }
      });

      expect(successResponse.status()).toBe(200);

      // Next attempt should not be rate limited
      const nextResponse = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: 'wrong-password-after-success'
        }
      });

      expect(nextResponse.status()).toBe(401); // Should be unauthorized, not rate limited
    });
  });

  test.describe('🔍 GET Access Status Check', () => {
    
    test('should validate access token via GET request', async ({ request }) => {
      // First, get a valid access token
      const authResponse = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: VALID_CREDENTIALS.password
        }
      });

      const authData = await authResponse.json();
      const accessToken = authData.accessToken;

      // Check access status with the token
      const checkResponse = await request.get(`/api/projects/${TEST_PROJECT_SLUG}/access?token=${accessToken}`);
      
      expect(checkResponse.status()).toBe(200);
      
      const checkData = await checkResponse.json();
      expect(checkData.valid).toBe(true);
      expect(checkData.projectSlug).toBe(TEST_PROJECT_SLUG);
      expect(checkData.accessLevel).toBe('premium');
    });

    test('should reject invalid access token', async ({ request }) => {
      const response = await request.get(`/api/projects/${TEST_PROJECT_SLUG}/access?token=invalid_token`);
      
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid access token');
      expect(data.code).toBe('invalid_token');
    });

    test('should require access token for GET request', async ({ request }) => {
      const response = await request.get(`/api/projects/${TEST_PROJECT_SLUG}/access`);
      
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Access token required');
      expect(data.code).toBe('missing_token');
    });

    test('should accept token in Authorization header', async ({ request }) => {
      // First, get a valid access token
      const authResponse = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: VALID_CREDENTIALS.password
        }
      });

      const authData = await authResponse.json();
      const accessToken = authData.accessToken;

      // Check access status with the token in header
      const checkResponse = await request.get(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      expect(checkResponse.status()).toBe(200);
      
      const checkData = await checkResponse.json();
      expect(checkData.valid).toBe(true);
    });
  });

  test.describe('🛡️ Security & Edge Cases', () => {
    
    test('should handle malformed JSON gracefully', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: 'invalid json string'
      });

      expect(response.status()).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
      expect(data.code).toBe('server_error');
    });

    test('should reject request to non-existent project', async ({ request }) => {
      const response = await request.post(`/api/projects/non-existent-project/access`, {
        data: {
          password: VALID_CREDENTIALS.password
        }
      });

      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Project not found');
      expect(data.code).toBe('not_found');
    });

    test('should handle concurrent requests properly', async ({ request }) => {
      const promises = [];
      
      // Create 5 concurrent valid requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
            data: {
              password: VALID_CREDENTIALS.password
            }
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // All should succeed
      for (const response of responses) {
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.accessToken).toBeDefined();
      }
    });

    test('should generate unique access tokens', async ({ request }) => {
      const tokens = new Set();
      
      // Generate 10 access tokens
      for (let i = 0; i < 10; i++) {
        const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
          data: {
            password: VALID_CREDENTIALS.password
          }
        });

        const data = await response.json();
        tokens.add(data.accessToken);
      }

      // All tokens should be unique
      expect(tokens.size).toBe(10);
    });
  });

  test.describe('⏱️ Token Expiration', () => {
    
    test('should set future expiration date', async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: VALID_CREDENTIALS.password
        }
      });

      const data = await response.json();
      const expirationTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Should expire approximately 24 hours from now (within 1 minute tolerance)
      expect(expirationTime).toBeGreaterThan(now + oneDay - 60000);
      expect(expirationTime).toBeLessThan(now + oneDay + 60000);
    });
  });
}); 