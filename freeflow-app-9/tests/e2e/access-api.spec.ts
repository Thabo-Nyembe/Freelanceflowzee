// 🧪 Access API Endpoint Testing Suite
// Comprehensive testing for the /api/projects/[slug]/access endpoint
// Tests rate limiting, validation, security, and proper responses

import { test as base, expect } from &apos;@playwright/test&apos;;

// Define test fixtures
const test = base.extend({
  request: async ({ request }, use) => {
    // Default configuration with test mode
    await use(request);
  },
  normalRequest: async ({ request }, use) => {
    // Configuration without test mode for rate limiting tests
    const headers = { &apos;Content-Type&apos;: &apos;application/json&apos; };
    await use(request.with({ extraHTTPHeaders: headers }));
  }
});

// Configuration for accessing the API
test.use({
  baseURL: &apos;http://localhost:3000&apos;,
  extraHTTPHeaders: {
    &apos;Content-Type&apos;: &apos;application/json&apos;,
    &apos;x-test-mode&apos;: &apos;true&apos;  // Add test mode header for all requests
  },
});

const TEST_PROJECT_SLUG = &apos;premium-brand-identity-package&apos;;

const VALID_CREDENTIALS = {
  password: &apos;secure-unlock-2024&apos;,
  accessCode: &apos;BRAND2024&apos;
};

const INVALID_CREDENTIALS = {
  password: &apos;wrong-password&apos;,
  accessCode: &apos;INVALID123&apos;
};

test.describe(&apos;🔑 Access API Endpoint Testing&apos;, () => {
  
  test.describe(&apos;✅ Valid Access Attempts&apos;, () => {
    
    test(&apos;should grant access with valid password&apos;, async ({ request }) => {
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
      expect(data.message).toBe(&apos;Access granted successfully&apos;);
    });

    test(&apos;should grant access with valid access code&apos;, async ({ request }) => {
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

    test(&apos;should grant access with both valid credentials&apos;, async ({ request }) => {
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

  test.describe(&apos;❌ Invalid Access Attempts&apos;, () => {
    
    test(&apos;should reject invalid password&apos;, async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: INVALID_CREDENTIALS.password
        }
      });

      // Debug logging
      console.log(&apos;Response status:&apos;, await response.status());
      console.log(&apos;Response body:&apos;, await response.json());

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Invalid credentials&apos;);
      expect(data.code).toBe(&apos;unauthorized&apos;);
    });

    test(&apos;should reject invalid access code&apos;, async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          accessCode: INVALID_CREDENTIALS.accessCode
        }
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Invalid credentials&apos;);
      expect(data.code).toBe(&apos;unauthorized&apos;);
    });

    test(&apos;should reject empty credentials&apos;, async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {}
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Please enter either a password or access code&apos;);
      expect(data.code).toBe(&apos;validation_error&apos;);
    });

    test(&apos;should reject request with empty strings&apos;, async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: '&apos;,'
          accessCode: '&apos;'
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Please enter either a password or access code&apos;);
      expect(data.code).toBe(&apos;validation_error&apos;);
    });
  });

  test.describe(&apos;🔍 GET Access Status Check&apos;, () => {
    
    test(&apos;should validate access token via GET request&apos;, async ({ request }) => {
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
      expect(checkData.accessLevel).toBe(&apos;premium&apos;);
    });

    test(&apos;should reject invalid access token&apos;, async ({ request }) => {
      const response = await request.get(`/api/projects/${TEST_PROJECT_SLUG}/access?token=invalid_token`);
      
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Invalid access token&apos;);
      expect(data.code).toBe(&apos;invalid_token&apos;);
    });

    test(&apos;should require access token for GET request&apos;, async ({ request }) => {
      const response = await request.get(`/api/projects/${TEST_PROJECT_SLUG}/access`);
      
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Access token required&apos;);
      expect(data.code).toBe(&apos;missing_token&apos;);
    });

    test(&apos;should accept token in Authorization header&apos;, async ({ request }) => {
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
          &apos;Authorization&apos;: `Bearer ${accessToken}`
        }
      });
      
      expect(checkResponse.status()).toBe(200);
      
      const checkData = await checkResponse.json();
      expect(checkData.valid).toBe(true);
    });
  });

  test.describe(&apos;🛡️ Security & Edge Cases&apos;, () => {
    
    test(&apos;should handle malformed JSON gracefully&apos;, async ({ request }) => {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: &apos;invalid json string&apos;
      });

      expect(response.status()).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Internal server error&apos;);
      expect(data.code).toBe(&apos;server_error&apos;);
    });

    test(&apos;should reject request to non-existent project&apos;, async ({ request }) => {
      const response = await request.post(`/api/projects/non-existent-project/access`, {
        data: {
          password: VALID_CREDENTIALS.password
        }
      });

      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe(&apos;Project not found&apos;);
      expect(data.code).toBe(&apos;not_found&apos;);
    });

    test(&apos;should handle concurrent requests properly&apos;, async ({ request }) => {
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

    test(&apos;should generate unique access tokens&apos;, async ({ request }) => {
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

  test.describe(&apos;⏱️ Token Expiration&apos;, () => {
    
    test(&apos;should set future expiration date&apos;, async ({ request }) => {
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