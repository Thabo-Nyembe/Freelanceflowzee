import { readFileSync, writeFileSync } from 'fs';

const files = [
  "./app/v1/dashboard/collaboration/workspace/page.tsx",
  "./app/v1/dashboard/collaboration/feedback/page.tsx",
  "./app/v1/dashboard/collaboration/canvas/page.tsx",
  "./app/v1/dashboard/collaboration/teams/page.tsx",
  "./app/v1/dashboard/collaboration/meetings/page.tsx",
  "./app/v1/dashboard/collaboration/analytics/page.tsx",
  "./app/v1/dashboard/collaboration/media/page.tsx",
  "./app/v1/dashboard/client-zone/knowledge-base/page.tsx",
  "./app/v1/dashboard/email-marketing/page.tsx",
  "./app/v1/dashboard/knowledge-base/page.tsx",
  "./app/(app)/dashboard/client-zone/knowledge-base/page.tsx",
  "./backup-v1-pages/collaboration/workspace/page.tsx",
  "./backup-v1-pages/collaboration/feedback/page.tsx",
  "./backup-v1-pages/collaboration/canvas/page.tsx",
  "./backup-v1-pages/collaboration/teams/page.tsx",
  "./backup-v1-pages/collaboration/meetings/page.tsx",
  "./backup-v1-pages/collaboration/analytics/page.tsx",
  "./backup-v1-pages/collaboration/media/page.tsx",
  "./backup-v1-pages/email-marketing/page.tsx",
  "./lib/bookings-queries.ts",
  "./lib/ai-create-collaboration.ts",
  "./lib/projects-hub-queries.ts",
  "./lib/clients-queries.ts",
  "./lib/files-hub-queries.ts",
  "./lib/ai-create-orchestrator.ts",
  "./lib/gallery-queries.ts",
  "./lib/video-studio-queries.ts",
  "./lib/revalidation.ts",
  "./lib/video-studio-utils.tsx",
  "./lib/team-utils.tsx",
  "./lib/video-assets-queries.ts",
  "./lib/ai-assistant-utils.tsx",
  "./lib/error-monitoring.ts",
  "./lib/data-fetching.ts",
  "./lib/time-tracking-utils.tsx"
];

let fixed = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    let modified = false;

    // Replace all variations of imports
    if (content.includes('createFeatureLogger')) {
      content = content.replace(
        /import\s*{\s*createFeatureLogger\s*}\s*from\s*['"]@\/lib\/logger['"]/g,
        "import { createSimpleLogger } from '@/lib/simple-logger'"
      );
      content = content.replace(
        /import\s*{\s*createFeatureLogger\s*}\s*from\s*['"]\.\/ logger['"]/g,
        "import { createSimpleLogger } from '@/lib/simple-logger'"
      );
      content = content.replace(
        /import\s*{\s*createFeatureLogger\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/lib\/logger['"]/g,
        "import { createSimpleLogger } from '@/lib/simple-logger'"
      );
      content = content.replace(/createFeatureLogger\(/g, 'createSimpleLogger(');

      writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixed++;
      modified = true;
    }
  } catch (err) {
    console.log(`⚠️  Skipped (file not found): ${file}`);
  }
}

console.log(`\n✅ Fixed ${fixed} files`);
