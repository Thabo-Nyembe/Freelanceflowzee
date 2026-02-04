import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Get all files still using createFeatureLogger
const output = execSync(
  `find . -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/lib/logger.ts" -exec grep -l "createFeatureLogger" {} \\;`,
  { encoding: 'utf8' }
);

const files = output.trim().split('\n').filter(f => f);

console.log(`Found ${files.length} files to fix\n`);

let fixed = 0;

for (const file of files) {
  if (!existsSync(file)) {
    console.log(`⚠️  File not found: ${file}`);
    continue;
  }

  try {
    let content = readFileSync(file, 'utf8');
    const original = content;

    // Replace all possible import variations
    content = content.replace(
      /import\s*{\s*createFeatureLogger\s*}\s*from\s*['"]\.\/logger['"]/g,
      "import { createSimpleLogger } from '@/lib/simple-logger'"
    );
    content = content.replace(
      /import\s*{\s*createFeatureLogger\s*}\s*from\s*['"]@\/lib\/logger['"]/g,
      "import { createSimpleLogger } from '@/lib/simple-logger'"
    );
    content = content.replace(
      /import\s*{\s*createFeatureLogger\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/lib\/logger['"]/g,
      "import { createSimpleLogger } from '@/lib/simple-logger'"
    );
    content = content.replace(
      /import\s*{\s*createFeatureLogger\s*}\s*from\s*['"]\.\.\/lib\/logger['"]/g,
      "import { createSimpleLogger } from '@/lib/simple-logger'"
    );

    // Replace function calls
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

console.log(`\n✅ Fixed ${fixed} files`);
