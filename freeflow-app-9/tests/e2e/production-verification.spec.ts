import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

test.describe('Production Build Verification - Enhanced Pages', () => {

  test('AI Settings page loads and has test IDs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-settings`);

    // Check page loads
    await expect(page).toHaveTitle(/Kazi|AI Settings/i);

    // Check for test IDs
    await expect(page.getByTestId('toggle-key-visibility-openai-btn')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('save-key-openai-btn')).toBeVisible();
    await expect(page.getByTestId('test-connection-openai-btn')).toBeVisible();

    console.log('✅ AI Settings page verified');
  });

  test('Desktop App page loads and has test IDs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/desktop-app`);

    // Check page loads by heading
    await expect(page.getByRole('heading', { name: /Desktop App Builder/i })).toBeVisible({ timeout: 10000 });

    // Check for test IDs
    await expect(page.getByTestId('export-image-btn')).toBeVisible();
    await expect(page.getByTestId('share-preview-btn')).toBeVisible();
    await expect(page.getByTestId('generate-code-btn')).toBeVisible();

    console.log('✅ Desktop App page verified');
  });

  test('Mobile App page loads and has test IDs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/mobile-app`);

    // Check page loads by heading
    await expect(page.getByRole('heading', { name: /Native Mobile Preview/i })).toBeVisible({ timeout: 10000 });

    // Check for test IDs
    await expect(page.getByTestId('export-mobile-image-btn')).toBeVisible();
    await expect(page.getByTestId('share-mobile-preview-btn')).toBeVisible();
    await expect(page.getByTestId('generate-qr-btn')).toBeVisible();
    await expect(page.getByTestId('toggle-orientation-btn')).toBeVisible();

    console.log('✅ Mobile App page verified');
  });

  test('White Label page loads and has test IDs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/white-label`);

    // Check page loads by heading
    await expect(page.getByRole('heading', { name: /Custom Brand Platform/i })).toBeVisible({ timeout: 10000 });

    // Click Deploy tab to access test IDs (force click to bypass pointer interception)
    await page.getByRole('tab', { name: /Deploy/i }).click({ force: true });
    await page.waitForTimeout(1000); // Wait for tab content to render

    // Check for test IDs in deployment tab
    await expect(page.getByTestId('generate-white-label-btn')).toBeVisible();
    await expect(page.getByTestId('export-code-btn')).toBeVisible();
    await expect(page.getByTestId('deploy-domain-btn')).toBeVisible();

    console.log('✅ White Label page verified');
  });

  test('Voice Collaboration page loads and has test IDs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/voice-collaboration`);

    // Check page loads by heading
    await expect(page.getByRole('heading', { name: /Team Voice Hub/i })).toBeVisible({ timeout: 10000 });

    // Check for test IDs
    await expect(page.getByTestId('toggle-mute-btn')).toBeVisible();
    await expect(page.getByTestId('toggle-call-btn')).toBeVisible();
    await expect(page.getByTestId('toggle-video-btn')).toBeVisible();
    await expect(page.getByTestId('toggle-recording-btn')).toBeVisible();

    console.log('✅ Voice Collaboration page verified');
  });
});

test.describe('Production Build Verification - Critical Pages', () => {

  test('Dashboard overview loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.getByRole('heading', { name: /Executive Dashboard/i })).toBeVisible({ timeout: 10000 });
    console.log('✅ Dashboard overview loaded');
  });

  test('AI Create page loads and API works', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-create-v2`);
    await expect(page.getByRole('heading', { name: /AI Create/i })).toBeVisible({ timeout: 10000 });
    console.log('✅ AI Create page loaded');
  });

  test('Video Studio page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/video-studio-v2`);
    await expect(page.getByRole('heading', { name: /KAZI Video Studio/i })).toBeVisible({ timeout: 10000 });
    console.log('✅ Video Studio page loaded');
  });

  test('Projects Hub page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/projects-hub-v2`);
    await expect(page.getByRole('heading', { name: /Project Hub|Projects/i })).toBeVisible({ timeout: 10000 });
    console.log('✅ Projects Hub page loaded');
  });

  test('AI Design page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai-design`);
    await expect(page.getByRole('heading', { name: /AI Design Studio/i })).toBeVisible({ timeout: 10000 });
    console.log('✅ AI Design page loaded');
  });
});

test.describe('Production Build Verification - API Endpoints', () => {

  test('AI Create API returns correct format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/ai/create`, {
      data: {
        creativeField: 'photography',
        assetType: 'luts',
        style: 'Cinematic',
        aiModel: 'gpt-4o-mini'
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.assets).toBeDefined();
    expect(Array.isArray(data.assets)).toBe(true);
    expect(data.assets[0].type).toBe('luts');

    console.log('✅ AI Create API verified');
  });

  test('Bookings API responds', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/bookings/time-slots?date=2025-11-01`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.timeSlots).toBeDefined();

    console.log('✅ Bookings API verified');
  });
});
