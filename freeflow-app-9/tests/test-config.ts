import { PlaywrightTestConfig } from &apos;@playwright/test&apos;;

// Shared test configuration
export const BASE_URL = &apos;http://localhost:3001&apos;;
export const TEST_TIMEOUT = 30000;
export const NAVIGATION_TIMEOUT = 45000;
export const ACTION_TIMEOUT = 15000;

// Common test configuration that can be imported and extended
export const baseTestConfig: PlaywrightTestConfig = {
  use: {
    baseURL: BASE_URL,
    actionTimeout: ACTION_TIMEOUT,
    navigationTimeout: NAVIGATION_TIMEOUT,
    screenshot: &apos;only-on-failure&apos;,
    video: &apos;retain-on-failure&apos;,
    trace: &apos;on-first-retry&apos;,
  },
  timeout: TEST_TIMEOUT,
  expect: {
    timeout: ACTION_TIMEOUT,
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [&apos;html&apos;, { open: &apos;never&apos; }],
    [&apos;list&apos;]
  ],
};

// Test data constants
export const VALID_CREDENTIALS = {
  email: &apos;test.user@example.com&apos;,
  password: &apos;ValidPassword123!&apos;
};

export const INVALID_CREDENTIALS = {
  invalidEmail: &apos;invalid.email.format&apos;,
  nonExistentEmail: &apos;nonexistent@example.com&apos;,
  wrongPassword: &apos;WrongPassword123!&apos;,
  blankEmail: '&apos;,'
  blankPassword: '&apos;'
}; 