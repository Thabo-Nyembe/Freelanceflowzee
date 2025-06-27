import { test, expect } from &apos;@playwright/test&apos;;

test.describe(&apos;API Integration Tests&apos;, () => {
  test.beforeEach(async ({ page }) => {
    await page.setExtraHTTPHeaders({ &apos;x-test-mode&apos;: &apos;true&apos; });
  });

  test(&apos;storage upload API should respond correctly&apos;, async ({ request }) => {
    // Test GET endpoint
    const response = await request.get(&apos;/api/storage/upload&apos;, {
      headers: { &apos;x-test-mode&apos;: &apos;true&apos; }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain(&apos;Storage upload endpoint is working&apos;);
  });

  test(&apos;project access API should handle password method&apos;, async ({ request }) => {
    const response = await request.post(&apos;/api/projects/test-project/access&apos;, {
      headers: { &apos;x-test-mode&apos;: &apos;true&apos; },
      data: {
        method: &apos;password&apos;,
        password: &apos;test123&apos;
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.accessToken).toBeDefined();
  });

  test(&apos;project access API should handle access code method&apos;, async ({ request }) => {
    const response = await request.post(&apos;/api/projects/test-project/access&apos;, {
      headers: { &apos;x-test-mode&apos;: &apos;true&apos; },
      data: {
        method: &apos;code&apos;,
        accessCode: &apos;PREMIUM2024&apos;
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.accessToken).toBeDefined();
  });

  test(&apos;project access API should reject invalid credentials&apos;, async ({ request }) => {
    const response = await request.post(&apos;/api/projects/test-project/access&apos;, {
      headers: { &apos;x-test-mode&apos;: &apos;true&apos; },
      data: {
        method: &apos;password&apos;,
        password: &apos;invalid-password&apos;
      }
    });
    
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain(&apos;Invalid password&apos;);
  });

  test(&apos;API endpoints should handle test mode properly&apos;, async ({ request }) => {
    // Test with test mode header
    const testResponse = await request.get(&apos;/api/projects/test-project/access&apos;, {
      headers: { &apos;x-test-mode&apos;: &apos;true&apos; }
    });
    
    expect(testResponse.status()).toBe(200);
    
    const testData = await testResponse.json();
    expect(testData.success).toBe(true);
    expect(testData.message).toContain(&apos;endpoint is working&apos;);
  });

  test(&apos;should test AI Create API&apos;, async ({ request }) => {
    const response = await request.post(&apos;/api/ai/create&apos;, {
      data: {
        field: &apos;photography&apos;,
        assetType: &apos;luts&apos;,
        quality: &apos;standard&apos;,
        prompt: &apos;cinematic color grading&apos;
      }
    })

    expect(response.status()).toBeLessThan(500)
    
    if (response.ok()) {
      const data = await response.json()
      expect(data).toHaveProperty(&apos;assets&apos;)
    }
  })

  test(&apos;should test collaboration API&apos;, async ({ request }) => {
    const response = await request.get(&apos;/api/collaboration/upf/test&apos;)
    
    expect(response.status()).toBeLessThan(500)
  })

  test(&apos;should test analytics API&apos;, async ({ request }) => {
    const response = await request.get(&apos;/api/analytics/demo&apos;)
    
    expect(response.status()).toBeLessThan(500)
  })

  test(&apos;should test storage API&apos;, async ({ request }) => {
    const response = await request.get(&apos;/api/storage/analytics&apos;)
    
    expect(response.status()).toBeLessThan(500)
  })
});
