import { test as base, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Extend base test with custom fixtures
export const test = base.extend({
  // Add authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Get test credentials from env
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Test credentials not found in environment variables');
    }

    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    // Use the authenticated page
    await use(page);
  },

  // Add supabase client fixture
  supabase: async ({}, use) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    await use(supabase);
  },
});

// Custom assertions
export { expect };

// Helper to create test video
export async function createTestVideo(supabase: any) {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      title: 'Test Video',
      description: 'Test video description',
      status: 'ready',
      mux_asset_id: 'test-asset-id',
      mux_playback_id: 'test-playback-id',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper to clean up test video
export async function cleanupTestVideo(supabase: any, videoId: string) {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId);

  if (error) throw error;
}

// Helper to wait for video processing
export async function waitForVideoProcessing(page: any, videoId: string) {
  await page.waitForFunction(
    (id) => {
      const element = document.querySelector(`[data-video-id="${id}"]`);
      return element?.getAttribute('data-status') === 'ready';
    },
    videoId,
    { timeout: 30000 }
  );
} 