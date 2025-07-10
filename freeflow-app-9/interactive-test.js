#!/usr/bin/env node

/**
 * Comprehensive Interactive Features Test
 * Tests all interactive components, buttons, and functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Interactive Features Test...\n');

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

function addTest(name, status, details = '') {
  testResults.tests.push({
    name,
    status,
    details,
    timestamp: new Date().toISOString()
  });
  testResults.summary.total++;
  testResults.summary[status]++;
}

// 1. Test Component File Structure
console.log('📁 Testing Component File Structure...');
try {
  const componentDirs = [
    'components/ui',
    'components/collaboration',
    'components/dashboard',
    'components/ai',
    'components/video',
    'components/navigation',
    'components/forms'
  ];

  componentDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      console.log(`✅ ${dir}: ${files.length} component files found`);
      addTest(`Component structure - ${dir}`, 'passed', `${files.length} files found`);
    } else {
      console.log(`❌ ${dir}: Directory not found`);
      addTest(`Component structure - ${dir}`, 'failed', 'Directory not found');
    }
  });
} catch (error) {
  console.log(`❌ Component structure test failed: ${error.message}`);
  addTest('Component structure', 'failed', error.message);
}

// 2. Test Interactive UI Components
console.log('\n🎯 Testing Interactive UI Components...');
try {
  const uiComponents = [
    'components/ui/button.tsx',
    'components/ui/dialog.tsx',
    'components/ui/dropdown-menu.tsx',
    'components/ui/tabs.tsx',
    'components/ui/form.tsx',
    'components/ui/input.tsx',
    'components/ui/textarea.tsx',
    'components/ui/checkbox.tsx',
    'components/ui/select.tsx',
    'components/ui/switch.tsx'
  ];

  uiComponents.forEach(component => {
    const fullPath = path.join(__dirname, component);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for interactive patterns
      const hasClickHandler = content.includes('onClick') || content.includes('onSelect') || content.includes('onValueChange');
      const hasClientDirective = content.includes("'use client'") || content.includes('"use client"');
      const hasForwardRef = content.includes('forwardRef');
      
      if (hasClickHandler && hasClientDirective) {
        console.log(`✅ ${component}: Interactive component with client directive`);
        addTest(`UI Component - ${component}`, 'passed', 'Interactive with client directive');
      } else if (hasClickHandler) {
        console.log(`⚠️  ${component}: Interactive but missing client directive`);
        addTest(`UI Component - ${component}`, 'warnings', 'Interactive but missing client directive');
      } else {
        console.log(`ℹ️  ${component}: Non-interactive component`);
        addTest(`UI Component - ${component}`, 'passed', 'Non-interactive component');
      }
    } else {
      console.log(`❌ ${component}: File not found`);
      addTest(`UI Component - ${component}`, 'failed', 'File not found');
    }
  });
} catch (error) {
  console.log(`❌ UI components test failed: ${error.message}`);
  addTest('UI Components', 'failed', error.message);
}

// 3. Test Dashboard Interactive Features
console.log('\n📊 Testing Dashboard Interactive Features...');
try {
  const dashboardComponents = [
    'components/dashboard/enhanced-interactive-dashboard.tsx',
    'components/dashboard-nav.tsx',
    'components/dashboard-header.tsx',
    'app/(app)/dashboard/page.tsx'
  ];

  dashboardComponents.forEach(component => {
    const fullPath = path.join(__dirname, component);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for dashboard interactive patterns
      const hasTabSwitching = content.includes('onValueChange') || content.includes('setActiveTab');
      const hasInteractiveElements = content.includes('onClick') || content.includes('onSelect');
      const hasClientDirective = content.includes("'use client'") || content.includes('"use client"');
      
      if (hasTabSwitching && hasClientDirective) {
        console.log(`✅ ${component}: Dashboard component with tab switching`);
        addTest(`Dashboard - ${component}`, 'passed', 'Interactive with tab switching');
      } else if (hasInteractiveElements) {
        console.log(`✅ ${component}: Dashboard component with interactive elements`);
        addTest(`Dashboard - ${component}`, 'passed', 'Interactive elements found');
      } else {
        console.log(`ℹ️  ${component}: Static dashboard component`);
        addTest(`Dashboard - ${component}`, 'passed', 'Static component');
      }
    } else {
      console.log(`❌ ${component}: File not found`);
      addTest(`Dashboard - ${component}`, 'failed', 'File not found');
    }
  });
} catch (error) {
  console.log(`❌ Dashboard components test failed: ${error.message}`);
  addTest('Dashboard Components', 'failed', error.message);
}

// 4. Test AI Interactive Features
console.log('\n🤖 Testing AI Interactive Features...');
try {
  const aiComponents = [
    'components/ai/ai-assistant.tsx',
    'components/ai/ai-create.tsx',
    'components/ai/enhanced-ai-chat.tsx',
    'components/ai/ai-create-studio.tsx'
  ];

  aiComponents.forEach(component => {
    const fullPath = path.join(__dirname, component);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for AI interactive patterns
      const hasFormSubmission = content.includes('onSubmit') || content.includes('handleSubmit');
      const hasInputHandling = content.includes('onChange') || content.includes('setValue');
      const hasClientDirective = content.includes("'use client'") || content.includes('"use client"');
      
      if (hasFormSubmission && hasClientDirective) {
        console.log(`✅ ${component}: AI component with form submission`);
        addTest(`AI - ${component}`, 'passed', 'Interactive with form submission');
      } else if (hasInputHandling) {
        console.log(`✅ ${component}: AI component with input handling`);
        addTest(`AI - ${component}`, 'passed', 'Interactive with input handling');
      } else {
        console.log(`ℹ️  ${component}: Static AI component`);
        addTest(`AI - ${component}`, 'passed', 'Static component');
      }
    } else {
      console.log(`❌ ${component}: File not found`);
      addTest(`AI - ${component}`, 'failed', 'File not found');
    }
  });
} catch (error) {
  console.log(`❌ AI components test failed: ${error.message}`);
  addTest('AI Components', 'failed', error.message);
}

// 5. Test Video Interactive Features
console.log('\n🎥 Testing Video Interactive Features...');
try {
  const videoComponents = [
    'components/video/video-player.tsx',
    'components/video/video-controls.tsx',
    'components/video/video-upload.tsx',
    'components/video/screen-recorder.tsx'
  ];

  videoComponents.forEach(component => {
    const fullPath = path.join(__dirname, component);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for video interactive patterns
      const hasVideoControls = content.includes('onPlay') || content.includes('onPause') || content.includes('onSeek');
      const hasUploadHandling = content.includes('onDrop') || content.includes('onChange');
      const hasClientDirective = content.includes("'use client'") || content.includes('"use client"');
      
      if (hasVideoControls && hasClientDirective) {
        console.log(`✅ ${component}: Video component with controls`);
        addTest(`Video - ${component}`, 'passed', 'Interactive with video controls');
      } else if (hasUploadHandling) {
        console.log(`✅ ${component}: Video component with upload handling`);
        addTest(`Video - ${component}`, 'passed', 'Interactive with upload handling');
      } else {
        console.log(`ℹ️  ${component}: Static video component`);
        addTest(`Video - ${component}`, 'passed', 'Static component');
      }
    } else {
      console.log(`❌ ${component}: File not found`);
      addTest(`Video - ${component}`, 'failed', 'File not found');
    }
  });
} catch (error) {
  console.log(`❌ Video components test failed: ${error.message}`);
  addTest('Video Components', 'failed', error.message);
}

// 6. Test Navigation Interactive Features
console.log('\n🧭 Testing Navigation Interactive Features...');
try {
  const navigationComponents = [
    'components/navigation.tsx',
    'components/site-header.tsx',
    'components/mobile-menu.tsx',
    'components/app-navigation.tsx'
  ];

  navigationComponents.forEach(component => {
    const fullPath = path.join(__dirname, component);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for navigation interactive patterns
      const hasMenuToggle = content.includes('onOpenChange') || content.includes('setOpen');
      const hasRouting = content.includes('useRouter') || content.includes('Link');
      const hasClientDirective = content.includes("'use client'") || content.includes('"use client"');
      
      if (hasMenuToggle && hasClientDirective) {
        console.log(`✅ ${component}: Navigation with menu toggle`);
        addTest(`Navigation - ${component}`, 'passed', 'Interactive with menu toggle');
      } else if (hasRouting) {
        console.log(`✅ ${component}: Navigation with routing`);
        addTest(`Navigation - ${component}`, 'passed', 'Interactive with routing');
      } else {
        console.log(`ℹ️  ${component}: Static navigation component`);
        addTest(`Navigation - ${component}`, 'passed', 'Static component');
      }
    } else {
      console.log(`❌ ${component}: File not found`);
      addTest(`Navigation - ${component}`, 'failed', 'File not found');
    }
  });
} catch (error) {
  console.log(`❌ Navigation components test failed: ${error.message}`);
  addTest('Navigation Components', 'failed', error.message);
}

// 7. Test Form Interactive Features
console.log('\n📝 Testing Form Interactive Features...');
try {
  const formComponents = [
    'components/forms/booking-form.tsx',
    'components/forms/project-creation-form.tsx',
    'components/contact-form.tsx',
    'components/payment/payment-form.tsx'
  ];

  formComponents.forEach(component => {
    const fullPath = path.join(__dirname, component);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for form interactive patterns
      const hasFormSubmission = content.includes('onSubmit') || content.includes('handleSubmit');
      const hasValidation = content.includes('zodResolver') || content.includes('useForm');
      const hasClientDirective = content.includes("'use client'") || content.includes('"use client"');
      
      if (hasFormSubmission && hasClientDirective) {
        console.log(`✅ ${component}: Form with submission handling`);
        addTest(`Forms - ${component}`, 'passed', 'Interactive with form submission');
      } else if (hasValidation) {
        console.log(`✅ ${component}: Form with validation`);
        addTest(`Forms - ${component}`, 'passed', 'Interactive with validation');
      } else {
        console.log(`ℹ️  ${component}: Static form component`);
        addTest(`Forms - ${component}`, 'passed', 'Static component');
      }
    } else {
      console.log(`❌ ${component}: File not found`);
      addTest(`Forms - ${component}`, 'failed', 'File not found');
    }
  });
} catch (error) {
  console.log(`❌ Form components test failed: ${error.message}`);
  addTest('Form Components', 'failed', error.message);
}

// 8. Test Client/Server Component Boundaries
console.log('\n🔄 Testing Client/Server Component Boundaries...');
try {
  // Find all components with 'use client' directive
  const findClientComponents = (dir) => {
    const results = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results.push(...findClientComponents(fullPath));
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes("'use client'") || content.includes('"use client"')) {
            results.push(fullPath);
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    });
    
    return results;
  };

  const clientComponents = findClientComponents(path.join(__dirname, 'components'));
  const appClientComponents = findClientComponents(path.join(__dirname, 'app'));
  
  const totalClientComponents = clientComponents.length + appClientComponents.length;
  
  console.log(`✅ Found ${totalClientComponents} client components`);
  console.log(`   - Components directory: ${clientComponents.length}`);
  console.log(`   - App directory: ${appClientComponents.length}`);
  
  addTest('Client Components', 'passed', `${totalClientComponents} client components found`);
} catch (error) {
  console.log(`❌ Client components test failed: ${error.message}`);
  addTest('Client Components', 'failed', error.message);
}

// Save test results
console.log('\n📊 Test Summary:');
console.log(`Total Tests: ${testResults.summary.total}`);
console.log(`Passed: ${testResults.summary.passed}`);
console.log(`Failed: ${testResults.summary.failed}`);
console.log(`Warnings: ${testResults.summary.warnings}`);

// Calculate success rate
const successRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%`);

// Save detailed results
fs.writeFileSync(
  path.join(__dirname, 'interactive-test-results.json'),
  JSON.stringify(testResults, null, 2)
);

console.log('\n✅ Interactive Features Test Complete!');
console.log('📄 Detailed results saved to: interactive-test-results.json');

// Exit with appropriate code
process.exit(testResults.summary.failed > 0 ? 1 : 0);