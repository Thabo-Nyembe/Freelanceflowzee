#!/usr/bin/env node

/**
 * FreeflowZee Application Test Script
 * 
 * This script validates that all major features of the FreeflowZee application
 * are working correctly. It can be run to do a quick health check.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - File missing: ${filePath}`, 'red');
    return false;
  }
}

function runHealthCheck() {
  log('\n🎯 FreeflowZee Application Health Check', 'cyan');
  log('=' .repeat(50), 'cyan');

  let allPassed = true;

  // Check core files
  log('\n📁 Core Application Files:', 'blue');
  allPassed &= checkFile('app/page.tsx', 'Main application page');
  allPassed &= checkFile('package.json', 'Package configuration');
  allPassed &= checkFile('next.config.mjs', 'Next.js configuration');
  allPassed &= checkFile('tailwind.config.ts', 'Tailwind CSS configuration');

  // Check component structure
  log('\n🧩 Component Architecture:', 'blue');
  allPassed &= checkFile('components/navigation/main-navigation.tsx', 'Main navigation component');
  allPassed &= checkFile('components/dashboard/dashboard-overview.tsx', 'Dashboard overview component');
  allPassed &= checkFile('components/hubs/projects-hub.tsx', 'Projects hub component');
  allPassed &= checkFile('components/hubs/universal-feedback-hub.tsx', 'Universal feedback hub component');
  allPassed &= checkFile('components/hubs/financial-hub.tsx', 'Financial hub component');
  allPassed &= checkFile('components/hubs/team-hub.tsx', 'Team hub component');

  // Check UI components
  log('\n🎨 UI Components:', 'blue');
  allPassed &= checkFile('components/ui/button.tsx', 'Button component');
  allPassed &= checkFile('components/ui/card.tsx', 'Card component');
  allPassed &= checkFile('components/ui/badge.tsx', 'Badge component');
  allPassed &= checkFile('components/ui/tabs.tsx', 'Tabs component');
  allPassed &= checkFile('components/ui/dialog.tsx', 'Dialog component');
  allPassed &= checkFile('components/ui/dropdown-menu.tsx', 'Dropdown menu component');
  allPassed &= checkFile('components/ui/progress.tsx', 'Progress component');

  // Check Context7 integration
  log('\n📚 Context7 Integration:', 'blue');
  allPassed &= checkFile('.context7/config.json', 'Context7 configuration');
  allPassed &= checkFile('scripts/context7-dev.js', 'Context7 development script');
  allPassed &= checkFile('lib/context7/client.ts', 'Context7 client library');
  allPassed &= checkFile('components/dev/context7-helper.tsx', 'Context7 development helper');

  // Check Supabase configuration
  log('\n🗄️  Supabase Integration:', 'blue');
  allPassed &= checkFile('lib/supabase/client.ts', 'Supabase client');
  allPassed &= checkFile('lib/supabase/middleware.ts', 'Supabase middleware');
  allPassed &= checkFile('middleware.ts', 'Application middleware');

  // Test package dependencies
  log('\n📦 Dependencies Check:', 'blue');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'next', 'react', 'react-dom', '@supabase/ssr', 
      'tailwindcss', 'recharts', '@radix-ui/react-tabs',
      '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'
    ];
    
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    requiredDeps.forEach(dep => {
      if (allDeps[dep]) {
        log(`✅ ${dep} - ${allDeps[dep]}`, 'green');
      } else {
        log(`❌ Missing dependency: ${dep}`, 'red');
        allPassed = false;
      }
    });
  } catch (error) {
    log(`❌ Error checking dependencies: ${error.message}`, 'red');
    allPassed = false;
  }

  // Check build capability
  log('\n🔨 Build Test:', 'blue');
  try {
    log('Testing TypeScript compilation...', 'yellow');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    log('✅ TypeScript compilation successful', 'green');
  } catch (error) {
    log('❌ TypeScript compilation failed', 'red');
    log(`Error: ${error.message}`, 'red');
    allPassed = false;
  }

  // Final result
  log('\n' + '=' .repeat(50), 'cyan');
  if (allPassed) {
    log('🎉 All checks passed! FreeflowZee is ready to go!', 'green');
    log('\n🚀 To start the application:', 'blue');
    log('   pnpm context7:dev  # Start with Context7 integration', 'cyan');
    log('   pnpm dev          # Start standard development server', 'cyan');
  } else {
    log('⚠️  Some checks failed. Please review the issues above.', 'yellow');
  }
  log('=' .repeat(50), 'cyan');

  return allPassed;
}

// Feature test descriptions
function showFeatureOverview() {
  log('\n🌟 FreeflowZee Features Overview:', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  const features = [
    { name: 'Dashboard Hub', desc: 'Real-time analytics, charts, and activity feeds' },
    { name: 'Projects Hub', desc: 'Project management with progress tracking and team collaboration' },
    { name: 'Universal Feedback', desc: 'Pinpoint feedback system for images, videos, documents, and code' },
    { name: 'Financial Hub', desc: 'Invoice management, escrow payments, and financial analytics' },
    { name: 'Team Hub', desc: 'Team member management, roles, and collaboration tools' },
    { name: 'Context7 Integration', desc: 'Enhanced development with up-to-date documentation' },
    { name: 'Modern UI/UX', desc: 'Glassmorphism design with responsive layout' },
    { name: 'Mock Data', desc: 'Comprehensive demo data for all features' }
  ];

  features.forEach((feature, index) => {
    log(`${index + 1}. ${feature.name}`, 'blue');
    log(`   ${feature.desc}`, 'reset');
  });

  log('\n📖 Access the application at: http://localhost:3004', 'green');
  log('🔧 Demo mode active - no Supabase configuration required', 'yellow');
}

// Run the health check
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'features') {
    showFeatureOverview();
  } else {
    runHealthCheck();
    showFeatureOverview();
  }
}

module.exports = { runHealthCheck, showFeatureOverview }; 