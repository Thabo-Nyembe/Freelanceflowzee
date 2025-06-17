import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  timeout: 60000,
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 2,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like await page.goto('/') */
    baseURL: 'http://localhost:3004',
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'x-test-mode': 'true'
    },
    
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Timeout for each action */
    actionTimeout: 30000,
  },

  /* Configure projects for comprehensive responsive testing */
  projects: [
    /* Desktop browsers with various resolutions */
    {
      name: 'desktop-chrome-1920',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'desktop-chrome-1366',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 }
      },
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    /* Large tablets */
    {
      name: 'tablet-ipad-pro',
      use: { 
        ...devices['iPad Pro'],
        isMobile: true,
        hasTouch: true
      },
    },
    {
      name: 'tablet-surface-pro',
      use: { 
        viewport: { width: 1368, height: 912 },
        deviceScaleFactor: 1.5,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        isMobile: true,
        hasTouch: true
      },
    },
    
    /* Standard tablets */
    {
      name: 'tablet-ipad',
      use: { 
        ...devices['iPad'],
        isMobile: true,
        hasTouch: true
      },
    },
    {
      name: 'tablet-android',
      use: { 
        viewport: { width: 800, height: 1280 },
        deviceScaleFactor: 2,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-T970) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        isMobile: true,
        hasTouch: true
      },
    },
    
    /* Large mobile phones */
    {
      name: 'mobile-iphone-14-pro-max',
      use: { 
        ...devices['iPhone 14 Pro Max'],
        isMobile: true,
        hasTouch: true
      },
    },
    {
      name: 'mobile-pixel-7-pro',
      use: { 
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        isMobile: true,
        hasTouch: true
      },
    },
    
    /* Standard mobile phones */
    {
      name: 'mobile-iphone-13',
      use: { 
        ...devices['iPhone 13'],
        isMobile: true,
        hasTouch: true
      },
    },
    {
      name: 'mobile-samsung-galaxy',
      use: { 
        ...devices['Galaxy S8'],
        isMobile: true,
        hasTouch: true
      },
    },
    
    /* Small mobile phones */
    {
      name: 'mobile-iphone-se',
      use: { 
        ...devices['iPhone SE'],
        isMobile: true,
        hasTouch: true
      },
    },
    {
      name: 'mobile-small-android',
      use: { 
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
        isMobile: true,
        hasTouch: true
      },
    },
    
    /* Ultra-wide and portrait orientations */
    {
      name: 'ultrawide-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 }
      },
    },
    {
      name: 'tablet-portrait',
      use: { 
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'PORT=3004 npm run dev',
    url: 'http://localhost:3004',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});
