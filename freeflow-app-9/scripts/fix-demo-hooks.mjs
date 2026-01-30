#!/usr/bin/env node

/**
 * Fix Demo Mode in All Hooks
 * Removes early returns that skip data fetching in demo mode
 */

import fs from 'fs';
import path from 'path';

const HOOKS_DIR = './lib/hooks';

// Pattern to find and fix
const patterns = [
  {
    // Pattern: if (isDemoModeEnabled()) { setIsLoading(false); return; }
    find: /if\s*\(\s*isDemoModeEnabled\(\)\s*\)\s*\{\s*set(?:Is)?Loading\(false\);?\s*return;?\s*\}/g,
    replace: '// Demo mode: fetch data with demo=true parameter',
    description: 'Early return in demo mode'
  },
  {
    // Pattern: if (isDemoMode) { setIsLoading(false); return; }
    find: /if\s*\(\s*isDemoMode\s*\)\s*\{\s*set(?:Is)?Loading\(false\);?\s*return;?\s*\}/g,
    replace: '// Demo mode: data will be fetched with demo user ID',
    description: 'Demo mode early return'
  }
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];

  for (const pattern of patterns) {
    if (pattern.find.test(content)) {
      content = content.replace(pattern.find, pattern.replace);
      modified = true;
      changes.push(pattern.description);
    }
    // Reset regex lastIndex
    pattern.find.lastIndex = 0;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return changes;
  }
  return null;
}

function main() {
  console.log('='.repeat(60));
  console.log('FIXING DEMO MODE IN HOOKS');
  console.log('='.repeat(60));

  const files = fs.readdirSync(HOOKS_DIR).filter(f => f.endsWith('.ts'));
  let fixedCount = 0;

  for (const file of files) {
    const filePath = path.join(HOOKS_DIR, file);
    const changes = fixFile(filePath);

    if (changes) {
      console.log(`✓ Fixed: ${file}`);
      changes.forEach(c => console.log(`   - ${c}`));
      fixedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`COMPLETE: Fixed ${fixedCount} files`);
  console.log('='.repeat(60));
}

main();
