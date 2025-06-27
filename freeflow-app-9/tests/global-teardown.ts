import { FullConfig } from &apos;@playwright/test&apos;;
import fs from &apos;fs&apos;;
import path from &apos;path&apos;;

async function globalTeardown(config: FullConfig) {
  // Clean up storage state file
  const storageStatePath = &apos;./tests/storage-state.json&apos;;
  if (fs.existsSync(storageStatePath)) {
    fs.unlinkSync(storageStatePath);
  }

  // Clean up test artifacts older than 7 days
  const artifactDirs = [
    &apos;test-results/screenshots&apos;,
    &apos;test-results/videos&apos;,
    &apos;test-results/traces&apos;
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
