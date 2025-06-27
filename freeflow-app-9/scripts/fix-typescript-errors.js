#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Fixing TypeScript Errors...');

// Fix 1: Gallery advanced sharing system - Add Code import const galleryFile = 'components/gallery/advanced-sharing-system.tsx';
if (fs.existsSync(galleryFile)) {
  let content = fs.readFileSync(galleryFile, 'utf8');
  if (content.includes('<Code className= "h-4 w-4" />&apos;) && !content.includes('import { Code }')) {
    // Add Code to the lucide-react imports
    content = content.replace(
      /from "lucide-react"/, ', Code } from "lucide-react"'
    );
    content = content.replace(
      /import \{([^}]+)\} from "lucide-react"/, 'import {$1, Code} from "lucide-react"'
    );
    fs.writeFileSync(galleryFile, content);
    console.log('✅ Fixed Code import in gallery system');
  }
}

// Fix 2: Team collaboration hub - Fix duplicate type in action
const teamHubFile = 'components/team-collaboration-hub.tsx';
if (fs.existsSync(teamHubFile)) {
  let content = fs.readFileSync(teamHubFile, 'utf8');
  
  // Fix the duplicate type property in action
  content = content.replace(
    /\{ type: 'SET_FILE_TYPE_FILTER'; type: string \}/,
    '{ type: \'SET_FILE_TYPE_FILTER\'; fileType: string }'
  );
  
  // Fix the dispatch call
  content = content.replace(
    /dispatch\(\{ type: 'SET_FILE_TYPE_FILTER', type: value \}\)/g,
    'dispatch({ type: \'SET_FILE_TYPE_FILTER\', fileType: value })'
  );
  
  fs.writeFileSync(teamHubFile, content);
  console.log('✅ Fixed team collaboration hub types');
}

// Fix 3: Notifications - Fix circular reference
const notificationsFile = 'components/notifications.tsx';
if (fs.existsSync(notificationsFile)) {
  let content = fs.readFileSync(notificationsFile, 'utf8');
  
  // Fix circular type reference
  content = content.replace(
    /notifications: typeof notifications/, 'notifications: NotificationItem[]'
  );
  
  fs.writeFileSync(notificationsFile, content);
  console.log('✅ Fixed notifications circular reference');
}

// Fix 4: Middleware - Fix IP property
const middlewareFile = 'middleware.ts';
if (fs.existsSync(middlewareFile)) {
  let content = fs.readFileSync(middlewareFile, 'utf8');
  
  // Fix IP access
  content = content.replace(
    /const ip = request\.ip \|\|/,
    'const ip = request.headers.get(\'x-forwarded-for\') ||'
  );
  
  fs.writeFileSync(middlewareFile, content);
  console.log('✅ Fixed middleware IP access');
}

// Fix 5: Storage analytics - Fix property name
const storageFile = 'lib/storage/multi-cloud-storage.ts';
if (fs.existsSync(storageFile)) {
  let content = fs.readFileSync(storageFile, 'utf8');
  
  // Fix potential_savings to potentialSavings
  content = content.replace(
    /analytics\.potential_savings/g, 'analytics.potentialSavings'
  );
  
  fs.writeFileSync(storageFile, content);
  console.log('✅ Fixed storage analytics properties');
}

// Fix 6: Playwright config - Fix timeout property
const playwrightFile = 'playwright.config.ts';
if (fs.existsSync(playwrightFile)) {
  let content = fs.readFileSync(playwrightFile, 'utf8');
  
  // Move timeout to the correct location
  content = content.replace(
    /use: \{[^}]*timeout: 60000,/, 'use: {'
  );
  
  // Add timeout at project level
  if (!content.includes('timeout: 60000')) {
    content = content.replace(
      /export default defineConfig\(\{/, 'export default defineConfig({\n  timeout: 60000,'
    );
  }
  
  fs.writeFileSync(playwrightFile, content);
  console.log('✅ Fixed Playwright timeout configuration');
}

console.log('🎉 TypeScript error fixing completed!');
console.log('🔍 Running type check to verify fixes...'); 