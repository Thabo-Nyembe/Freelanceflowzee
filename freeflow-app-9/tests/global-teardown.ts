import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  // Clean up storage state file
  const storageStatePath = './tests/storage-state.json';
  if (fs.existsSync(storageStatePath)) {
    fs.unlinkSync(storageStatePath);
  }

  // Clean up test artifacts older than 7 days
  const artifactDirs = [
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  artifactDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime < sevenDaysAgo) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });
}

export default globalTeardown;
