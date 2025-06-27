import { defineConfig, devices } from &apos;@playwright/test&apos;
import path from &apos;path&apos;

export default defineConfig({
  testDir: &apos;./integration/hydration&apos;,
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? &apos;dot&apos; : &apos;html&apos;,
  use: {
    baseURL: &apos;http://localhost:3002&apos;,
    trace: &apos;on-first-retry&apos;,
    video: &apos;on-first-retry&apos;,
  },
  projects: [
    {
      name: &apos;chromium&apos;,
      use: { ...devices[&apos;Desktop Chrome&apos;] },
    },
    {
      name: &apos;firefox&apos;,
      use: { ...devices[&apos;Desktop Firefox&apos;] },
    },
    {
      name: &apos;webkit&apos;,
      use: { ...devices[&apos;Desktop Safari&apos;] },
    },
    {
      name: &apos;Mobile Chrome&apos;,
      use: { ...devices[&apos;Pixel 5&apos;] },
    },
    {
      name: &apos;Mobile Safari&apos;,
      use: { ...devices[&apos;iPhone 12&apos;] },
    },
  ],
  webServer: {
    command: &apos;npm run dev&apos;,
    url: &apos;http://localhost:3002&apos;,
    reuseExistingServer: !process.env.CI,
    stdout: &apos;pipe&apos;,
    stderr: &apos;pipe&apos;,
  },
}) 