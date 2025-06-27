#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Component Implementations vs Test Expectations\n');

// Expected components from test scripts
const EXPECTED_COMPONENTS = {
  'Projects Hub': {
    path: '/dashboard/projects-hub',
    component: 'components/hubs/projects-hub.tsx',
    expectedTabs: ['Overview', 'Active', 'Completed', 'Analytics'],
    expectedButtons: ['New Project', 'View Details', 'Edit Project', 'Add Feedback', 'Delete Project']
  }, 'Video Studio': {
    path: '/dashboard/video-studio',
    component: 'app/(app)/dashboard/video-studio/page.tsx',
    expectedTabs: ['Projects', 'Templates', 'Assets', 'Analytics'],
    expectedButtons: ['Record', 'Edit', 'Upload', 'Share', 'Export']
  }, 'Community Hub': {
    path: '/dashboard/community',
    component: 'components/community/enhanced-community-hub.tsx',
    expectedTabs: ['Feed', 'Creators', 'Showcase', 'Events'],
    expectedButtons: ['Create Post', 'Follow Creator', 'Like Post', 'Share Post']
  }, 'AI Assistant': {
    path: '/dashboard/ai-assistant',
    component: 'app/(app)/dashboard/ai-assistant/page.tsx',
    expectedTabs: ['Chat', 'Analyze', 'Generate', 'History'],
    expectedButtons: ['Send Message', 'Clear Chat', 'Export Chat', 'Settings']
  }, 'My Day': {
    path: '/dashboard/my-day',
    component: 'app/(app)/dashboard/my-day/page.tsx',
    expectedTabs: ['Today', 'Schedule', 'Tasks', 'Insights'],
    expectedButtons: ['Add Task', 'Start Timer', 'View Calendar', 'Generate Schedule']
  }, 'Files Hub': {
    path: '/dashboard/files-hub',
    component: 'components/hubs/files-hub.tsx',
    expectedTabs: ['Files', 'Shared', 'Recent', 'Storage', 'Analytics'],
    expectedButtons: ['Upload', 'New Folder', 'Share', 'Download', 'Delete']
  }, 'Escrow System': {
    path: '/dashboard/escrow',
    component: 'app/(app)/dashboard/escrow/page.tsx',
    expectedTabs: ['Active', 'Completed', 'Pending', 'Analytics'],
    expectedButtons: ['Release Funds', 'View Details', 'Dispute', 'Download Receipt']
  }, 'AI Create': {
    path: '/dashboard/ai-create',
    component: 'components/collaboration/ai-create.tsx',
    expectedTabs: ['Generate Assets', 'Asset Library', 'Advanced Settings'],
    expectedButtons: ['Generate Assets', 'Preview Asset', 'Download Asset', 'Upload Asset', 'Export All']
  }
};

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

function analyzeComponent(componentName, config) {
  console.log(`\n📋 ${componentName}`);
  console.log(`   Path: ${config.path}`);
  console.log(`   Component: ${config.component}`);
  
  const exists = checkFileExists(config.component);
  console.log(`   Exists: ${exists ? '✅' : '❌'}`);
  
  if (exists) {
    try {
      const content = fs.readFileSync(config.component, 'utf8');
      
      // Check for tabs
      const hasTabsImport = content.includes('import { Tabs, TabsContent, TabsList, TabsTrigger }');
      const tabsListMatches = content.match(/TabsList/g);
      const tabsTriggerMatches = content.match(/TabsTrigger/g);
      
      console.log(`   Tabs Import: ${hasTabsImport ? '✅' : '❌'}`);
      console.log(`   TabsList Count: ${tabsListMatches ? tabsListMatches.length : 0}`);
      console.log(`   TabsTrigger Count: ${tabsTriggerMatches ? tabsTriggerMatches.length : 0}`);
      
      // Check for expected tabs
      console.log(`   Expected Tabs: ${config.expectedTabs.join(', ')}`);
      const foundTabs = [];
      config.expectedTabs.forEach(tab => {
        if (content.includes(tab) || content.includes(tab.toLowerCase())) {
          foundTabs.push(tab);
        }
      });
      console.log(`   Found Tabs: ${foundTabs.join(', ')} (${foundTabs.length}/${config.expectedTabs.length})`);
      
      // Check for buttons
      const buttonMatches = content.match(/Button/g);
      console.log(`   Button Components: ${buttonMatches ? buttonMatches.length : 0}`);
      
      // Check for expected buttons
      console.log(`   Expected Buttons: ${config.expectedButtons.join(', ')}`);
      const foundButtons = [];
      config.expectedButtons.forEach(button => {
        if (content.includes(button) || content.includes(button.toLowerCase().replace(' ', '-'))) {
          foundButtons.push(button);
        }
      });
      console.log(`   Found Buttons: ${foundButtons.join(', ')} (${foundButtons.length}/${config.expectedButtons.length})`);
      
      // Overall status
      const tabsComplete = foundTabs.length >= Math.floor(config.expectedTabs.length * 0.75);
      const buttonsComplete = foundButtons.length >= Math.floor(config.expectedButtons.length * 0.5);
      const status = tabsComplete && buttonsComplete ? '🟢 READY' : 
                    tabsComplete || buttonsComplete ? '🟡 PARTIAL' : '🔴 NEEDS WORK';
      console.log(`   Status: ${status}`);
      
    } catch (e) {
      console.log(`   Error reading file: ${e.message}`);
    }
  }
}

function generateSummaryReport() {
  console.log('\n' + '='.repeat(80));'
  console.log('📊 COMPONENT IMPLEMENTATION SUMMARY');
  console.log('='.repeat(80));'
  
  let readyCount = 0;
  let partialCount = 0;
  let needsWorkCount = 0;
  
  Object.entries(EXPECTED_COMPONENTS).forEach(([name, config]) => {
    if (checkFileExists(config.component)) {
      try {
        const content = fs.readFileSync(config.component, 'utf8');
        const foundTabs = config.expectedTabs.filter(tab => 
          content.includes(tab) || content.includes(tab.toLowerCase())
        );
        const foundButtons = config.expectedButtons.filter(button => 
          content.includes(button) || content.includes(button.toLowerCase().replace(' ', '-'))
        );
        
        const tabsComplete = foundTabs.length >= Math.floor(config.expectedTabs.length * 0.75);
        const buttonsComplete = foundButtons.length >= Math.floor(config.expectedButtons.length * 0.5);
        
        if (tabsComplete && buttonsComplete) {
          readyCount++;
          console.log(`✅ ${name}: READY (${foundTabs.length}/${config.expectedTabs.length} tabs, ${foundButtons.length}/${config.expectedButtons.length} buttons)`);
        } else if (tabsComplete || buttonsComplete) {
          partialCount++;
          console.log(`🟡 ${name}: PARTIAL (${foundTabs.length}/${config.expectedTabs.length} tabs, ${foundButtons.length}/${config.expectedButtons.length} buttons)`);
        } else {
          needsWorkCount++;
          console.log(`🔴 ${name}: NEEDS WORK (${foundTabs.length}/${config.expectedTabs.length} tabs, ${foundButtons.length}/${config.expectedButtons.length} buttons)`);
        }
      } catch (e) {
        needsWorkCount++;
        console.log(`❌ ${name}: ERROR - ${e.message}`);
      }
    } else {
      needsWorkCount++;
      console.log(`❌ ${name}: FILE NOT FOUND`);
    }
  });
  
  console.log('\n' + '-'.repeat(50));'
  console.log(`📈 Summary: ${readyCount} Ready, ${partialCount} Partial, ${needsWorkCount} Need Work`);
  console.log(`🎯 Success Rate: ${Math.round((readyCount / Object.keys(EXPECTED_COMPONENTS).length) * 100)}%`);
  
  if (needsWorkCount > 0 || partialCount > 0) {
    console.log('\n💡 Recommendations: ');
    console.log('   1. Focus on components marked as "NEEDS WORK" first');
    console.log('   2. Add missing tabs to "PARTIAL" components');
    console.log('   3. Ensure all buttons have proper testid attributes');
    console.log('   4. Run individual test scripts to identify specific missing elements');
  }
}

// Run the analysis
Object.entries(EXPECTED_COMPONENTS).forEach(([name, config]) => {
  analyzeComponent(name, config);
});

generateSummaryReport();

console.log('\n🔗 Next steps:');
console.log('   1. Run: node scripts/run-individual-tab-tests.js');
console.log('   2. Check detailed test results for specific missing elements');
console.log('   3. Create or fix missing components based on this analysis'); 