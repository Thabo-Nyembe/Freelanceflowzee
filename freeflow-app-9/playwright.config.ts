import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Exclude logic tests (vitest) and Jest-based component tests */
  testIgnore: [
    '**/logic/**',
    '**/components/**/*.test.tsx',
    '**/components/**/*.test.ts',
  ],
  timeout: 120000, // 2 minutes for slow-loading pages in dev
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9323',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    port: 9323,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
