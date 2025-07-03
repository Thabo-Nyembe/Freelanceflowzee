import { test as base } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';

// Custom test fixtures
type TestFixtures = {
  projectData: any;
  mockFiles: string[];
  testDataPath: string;
};

// Extend base test with custom fixtures
export const test = base.extend<TestFixtures>({
  projectData: async ({}, use) => {
    const data = JSON.parse(
      readFileSync(path.join(__dirname, '../../test-data/project.json'), 'utf-8')
    );
    await use(data);
  },

  mockFiles: async ({}, use) => {
    const files = [
      path.join(__dirname, '../../test-data/sample.pdf'),
      path.join(__dirname, '../../test-data/doc1.pdf'),
      path.join(__dirname, '../../test-data/doc2.jpg'),
      path.join(__dirname, '../../test-data/doc3.png')
    ];
    await use(files);
  },

  testDataPath: async ({}, use) => {
    await use(path.join(__dirname, '../../test-data'));
  }
});

// Helper functions
export const mockApiResponse = (route: string, status: number, data: any) => {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
};

export const generateLargeFile = (sizeInMB: number) => {
  return {
    name: `large-file-${sizeInMB}mb.bin`,
    mimeType: 'application/octet-stream',
    buffer: Buffer.alloc(sizeInMB * 1024 * 1024)
  };
};

export const waitForUpload = async (page: any) => {
  await page.waitForSelector('[data-testid="upload-progress"]', { state: 'visible' });
  await page.waitForSelector('[data-testid="upload-complete"]', { state: 'visible' });
};

export const loginAsTestUser = async (page: any) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3000/dashboard');
};

export const setupTestProject = async (page: any, projectData: any) => {
  await page.route('**/api/projects/**', route => 
    route.fulfill(mockApiResponse('/api/projects', 200, projectData))
  );
};

export const mockStorageQuota = async (page: any, quotaInMB: number) => {
  await page.route('**/api/storage/quota', route =>
    route.fulfill(mockApiResponse('/api/storage/quota', 200, {
      used: quotaInMB * 0.7,
      total: quotaInMB,
      available: quotaInMB * 0.3
    }))
  );
};

export const expectToastMessage = async (page: any, message: string) => {
  await page.waitForSelector('[role="alert"]');
  await expect(page.getByRole('alert')).toContainText(message);
};

export const clearTestData = async (page: any) => {
  await page.evaluate(() => window.localStorage.clear());
  await page.evaluate(() => window.sessionStorage.clear());
};

export { expect } from '@playwright/test';