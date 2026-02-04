import { readFileSync, writeFileSync, existsSync } from 'fs';

const files = [
  "./app/v1/dashboard/client-zone/knowledge-base/page.tsx",
  "./app/v1/dashboard/email-marketing/page.tsx",
  "./app/v1/dashboard/knowledge-base/page.tsx",
  "./app/(app)/dashboard/client-zone/knowledge-base/page.tsx",
  "./backup-v1-pages/email-marketing/page.tsx"
];

let fixed = 0;

for (const file of files) {
  if (!existsSync(file)) {
    console.log(`⚠️  File not found: ${file}`);
    continue;
  }

  try {
    let content = readFileSync(file, 'utf8');
    const original = content;

    // Replace dynamic imports
    content = content.replace(
      /const\s*{\s*createFeatureLogger\s*}\s*=\s*await\s*import\(['"]@\/lib\/logger['"]\)/g,
      "const { createSimpleLogger } = await import('@/lib/simple-logger')"
    );

    // Also replace the function calls
    content = content.replace(/createFeatureLogger\(/g, 'createSimpleLogger(');

    if (content !== original) {
      writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixed++;
    } else {
      console.log(`⚠️  No changes: ${file}`);
    }
  } catch (err) {
    console.log(`❌ Error fixing ${file}:`, err.message);
  }
}

console.log(`\n✅ Fixed ${fixed} files with dynamic imports`);
