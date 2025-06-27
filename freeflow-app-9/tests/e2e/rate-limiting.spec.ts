// 🧪 Rate Limiting Tests
// Tests rate limiting functionality for the /api/projects/[slug]/access endpoint

import { test, expect } from &apos;@playwright/test&apos;;

// Configuration for accessing the API
test.use({
  baseURL: &apos;http://localhost:3001&apos;,
  extraHTTPHeaders: {
    &apos;Content-Type&apos;: &apos;application/json&apos;
  },
});

const TEST_PROJECT_SLUG = &apos;premium-brand-identity-package&apos;;

const VALID_CREDENTIALS = {
  password: &apos;secure-unlock-2024&apos;,
  accessCode: &apos;BRAND2024&apos;
};

// Run tests in isolation
test.describe.configure({ mode: &apos;serial&apos; });

test.describe(&apos;🚫 Rate Limiting&apos;, () => {
  // Clear rate limits before each test
  test.beforeEach(async ({ request }) => {
    await request.post(&apos;/api/projects/clear-rate-limits&apos;, {
      headers: {
        &apos;x-admin-key&apos;: &apos;test-admin-key&apos;
      }
    });
    // Wait a bit to ensure rate limits are cleared
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
    
  test(&apos;should implement rate limiting after 5 failed attempts&apos;, async ({ request }) => {
    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: `wrong-password-${i}
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
        password: &apos;wrong-password-6&apos;
      }
    });

    const data = await response.json();
    console.log(&apos;Final attempt response:&apos;, {
      status: response.status(),
      data
    });

    expect(response.status()).toBe(429);
    expect(data.error).toContain(&apos;Too many failed attempts&apos;);
    expect(data.code).toBe(&apos;rate_limited&apos;);
    expect(data.retryAfter).toBeGreaterThan(0);
  });

  test(&apos;should clear rate limiting on successful access&apos;, async ({ request }) => {
    // Make a few failed attempts
    for (let i = 0; i < 3; i++) {
      const response = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
        data: {
          password: `wrong-password-${i}
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
    console.log(&apos;Success response:&apos;, {
      status: successResponse.status(),
      data: successData
    });

    expect(successResponse.status()).toBe(200);

    // Next attempt should not be rate limited
    const nextResponse = await request.post(`/api/projects/${TEST_PROJECT_SLUG}/access`, {
      data: {
        password: &apos;wrong-password-after-success&apos;
      }
    });

    const nextData = await nextResponse.json();
    console.log(&apos;Next attempt response:&apos;, {
      status: nextResponse.status(),
      data: nextData
    });

    expect(nextResponse.status()).toBe(401); // Should be unauthorized, not rate limited
  });
}); 