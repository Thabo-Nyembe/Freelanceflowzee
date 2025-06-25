import { PlaywrightTestConfig } from '@playwright/test';

// Shared test configuration
export const BASE_URL = 'http://localhost:3001';
export const TEST_TIMEOUT = 30000;
export const NAVIGATION_TIMEOUT = 45000;
export const ACTION_TIMEOUT = 15000;

// Common test configuration that can be imported and extended
export const baseTestConfig: PlaywrightTestConfig = {
  use: {
    baseURL: BASE_URL,
    actionTimeout: ACTION_TIMEOUT,
    navigationTimeout: NAVIGATION_TIMEOUT,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  timeout: TEST_TIMEOUT,
  expect: {
    timeout: ACTION_TIMEOUT,
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
};

// Test data constants
export const VALID_CREDENTIALS = {
  email: 'test.user@example.com',
  password: 'ValidPassword123!'
};

export const INVALID_CREDENTIALS = {
  invalidEmail: 'invalid.email.format',
  nonExistentEmail: 'nonexistent@example.com',
  wrongPassword: 'WrongPassword123!',
  blankEmail: '',
  blankPassword: ''
}; 