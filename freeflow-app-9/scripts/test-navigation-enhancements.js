#!/usr/bin/env node
/**
 * KAZI Platform - Navigation Enhancements Test Suite
 * ------------------------------------------------
 * This script validates the implementation of the EnhancedNavigation and
 * ContextualSidebar components, ensuring all features work as expected.
 * 
 * Run with: node scripts/test-navigation-enhancements.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { JSDOM } = require('jsdom');

// Configure JSDOM for simulating browser environment
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
  url: "http://localhost:9323/",
  runScripts: "outside-only",
  resources: "usable",
  pretendToBeVisual: true
});

// Inject localStorage mock
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Console formatting helpers
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Test result tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components/ui');
const APP_DIR = path.join(ROOT_DIR, 'app');
const ENHANCED_NAV_PATH = path.join(COMPONENTS_DIR, 'enhanced-navigation.tsx');
const CONTEXTUAL_SIDEBAR_PATH = path.join(COMPONENTS_DIR, 'contextual-sidebar.tsx');

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}=== KAZI Navigation Enhancements Test Suite ===${colors.reset}\n`);
  
  try {
    // 1. Check if component files exist
    await testComponentFilesExist();
    
    // 2. Check dependencies in package.json
    await testDependenciesExist();
    
    // 3. Parse component files
    const enhancedNavContent = fs.readFileSync(ENHANCED_NAV_PATH, 'utf8');
    const contextualSidebarContent = fs.readFileSync(CONTEXTUAL_SIDEBAR_PATH, 'utf8');
    
    // 4. Test feature maps completeness and consistency
    await testFeatureMaps(enhancedNavContent, contextualSidebarContent);
    
    // 5. Test bidirectional related features mapping
    await testBidirectionalRelatedFeatures(enhancedNavContent);
    
    // 6. Test quick action paths validity
    await testQuickActionPaths(enhancedNavContent);
    
    // 7. Test keyboard shortcuts definition
    await testKeyboardShortcuts(enhancedNavContent, contextualSidebarContent);
    
    // 8. Test navigation paths against app router
    await testNavigationPathsValidity(enhancedNavContent, contextualSidebarContent);
    
    // 9. Test localStorage integration
    await testLocalStorageIntegration(contextualSidebarContent);
    
    // 10. Test drag-and-drop dependencies and implementation
    await testDragAndDropFunctionality(contextualSidebarContent);
    
    // 11. Test search functionality
    await testSearchFunctionality(enhancedNavContent, contextualSidebarContent);
    
    // 12. Test TypeScript compilation
    await testTypeScriptCompilation();
    
    // Display summary
    displayTestSummary();
    
  } catch (error) {
    console.error(`${colors.red}Test suite encountered an error:${colors.reset}`, error);
    process.exit(1);
  }
}

/**
 * Test 1: Check if component files exist
 */
async function testComponentFilesExist() {
  console.log(`${colors.bright}Testing component files existence...${colors.reset}`);
  
  const enhancedNavExists = fs.existsSync(ENHANCED_NAV_PATH);
  const contextualSidebarExists = fs.existsSync(CONTEXTUAL_SIDEBAR_PATH);
  
  if (enhancedNavExists) {
    logPass('EnhancedNavigation component file exists');
  } else {
    logFail('EnhancedNavigation component file not found at: ' + ENHANCED_NAV_PATH);
  }
  
  if (contextualSidebarExists) {
    logPass('ContextualSidebar component file exists');
  } else {
    logFail('ContextualSidebar component file not found at: ' + CONTEXTUAL_SIDEBAR_PATH);
  }
  
  console.log('');
}

/**
 * Test 2: Check dependencies in package.json
 */
async function testDependenciesExist() {
  console.log(`${colors.bright}Testing required dependencies...${colors.reset}`);
  
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    'framer-motion',
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    '@dnd-kit/modifiers',
    'lucide-react',
    'next',
    'react',
    'react-dom'
  ];
  
  const allDeps = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  for (const dep of requiredDeps) {
    if (allDeps[dep]) {
      logPass(`Dependency '${dep}' found in package.json`);
    } else {
      logFail(`Dependency '${dep}' not found in package.json`);
    }
  }
  
  console.log('');
}

/**
 * Test 3: Feature maps completeness and consistency
 */
async function testFeatureMaps(enhancedNavContent, contextualSidebarContent) {
  console.log(`${colors.bright}Testing feature maps completeness and consistency...${colors.reset}`);
  
  // Extract feature categories from both components
  const enhancedNavCategories = extractFeatureCategories(enhancedNavContent);
  const sidebarCategories = extractFeatureCategories(contextualSidebarContent);
  
  // Check if both components have the same categories
  const enhancedNavCategoryNames = Object.keys(enhancedNavCategories);
  const sidebarCategoryNames = sidebarCategories.map(cat => cat.id);
  
  // Compare category names
  const missingInEnhancedNav = sidebarCategoryNames.filter(cat => !enhancedNavCategoryNames.includes(cat));
  const missingInSidebar = enhancedNavCategoryNames.filter(cat => !sidebarCategoryNames.includes(cat));
  
  if (missingInEnhancedNav.length === 0) {
    logPass('EnhancedNavigation contains all sidebar categories');
  } else {
    logFail(`EnhancedNavigation is missing categories: ${missingInEnhancedNav.join(', ')}`);
  }
  
  if (missingInSidebar.length === 0) {
    logPass('ContextualSidebar contains all enhanced navigation categories');
  } else {
    logFail(`ContextualSidebar is missing categories: ${missingInSidebar.join(', ')}`);
  }
  
  // Check feature counts per category
  const commonCategories = enhancedNavCategoryNames.filter(cat => sidebarCategoryNames.includes(cat));
  
  for (const category of commonCategories) {
    const enhancedNavFeatureCount = enhancedNavCategories[category]?.length || 0;
    const sidebarCategory = sidebarCategories.find(cat => cat.id === category);
    const sidebarFeatureCount = sidebarCategory?.features?.length || 0;
    
    if (enhancedNavFeatureCount === sidebarFeatureCount) {
      logPass(`Category '${category}' has consistent feature count (${enhancedNavFeatureCount})`);
    } else {
      logFail(`Category '${category}' has inconsistent feature count: EnhancedNav=${enhancedNavFeatureCount}, Sidebar=${sidebarFeatureCount}`);
    }
  }
  
  // Check for duplicate paths
  const allEnhancedNavPaths = Object.values(enhancedNavCategories).flat().map(f => f.path);
  const duplicateEnhancedNavPaths = findDuplicates(allEnhancedNavPaths);
  
  if (duplicateEnhancedNavPaths.length === 0) {
    logPass('No duplicate paths in EnhancedNavigation');
  } else {
    logFail(`Found duplicate paths in EnhancedNavigation: ${duplicateEnhancedNavPaths.join(', ')}`);
  }
  
  const allSidebarPaths = sidebarCategories.flatMap(cat => cat.features.map(f => f.path));
  const duplicateSidebarPaths = findDuplicates(allSidebarPaths);
  
  if (duplicateSidebarPaths.length === 0) {
    logPass('No duplicate paths in ContextualSidebar');
  } else {
    logFail(`Found duplicate paths in ContextualSidebar: ${duplicateSidebarPaths.join(', ')}`);
  }
  
  console.log('');
}

/**
 * Test 4: Bidirectional related features mapping
 */
async function testBidirectionalRelatedFeatures(enhancedNavContent) {
  console.log(`${colors.bright}Testing bidirectional related features mapping...${colors.reset}`);
  
  const relatedFeaturesMap = extractRelatedFeaturesMap(enhancedNavContent);
  let bidirectionalCount = 0;
  let nonBidirectionalCount = 0;
  
  // Check each feature's related items
  for (const [feature, relatedFeatures] of Object.entries(relatedFeaturesMap)) {
    if (feature === 'default') continue; // Skip default mapping
    
    for (const related of relatedFeatures) {
      const relatedPath = related.path;
      const isRelatedBack = relatedFeaturesMap[relatedPath]?.some(rf => rf.path === feature);
      
      if (isRelatedBack) {
        bidirectionalCount++;
      } else {
        nonBidirectionalCount++;
        logWarning(`Non-bidirectional relationship: '${feature}' links to '${relatedPath}' but not vice versa`);
      }
    }
  }
  
  const totalRelationships = bidirectionalCount + nonBidirectionalCount;
  const bidirectionalPercentage = totalRelationships > 0 
    ? Math.round((bidirectionalCount / totalRelationships) * 100) 
    : 0;
  
  if (bidirectionalPercentage >= 70) {
    logPass(`Bidirectional mapping: ${bidirectionalPercentage}% (${bidirectionalCount}/${totalRelationships})`);
  } else {
    logWarning(`Low bidirectional mapping: ${bidirectionalPercentage}% (${bidirectionalCount}/${totalRelationships})`);
  }
  
  console.log('');
}

/**
 * Test 5: Quick action paths validity
 */
async function testQuickActionPaths(enhancedNavContent) {
  console.log(`${colors.bright}Testing quick action paths validity...${colors.reset}`);
  
  const quickActionsMap = extractQuickActionsMap(enhancedNavContent);
  const featureCategories = extractFeatureCategories(enhancedNavContent);
  const allValidPaths = Object.values(featureCategories).flat().map(f => f.path);
  
  // Add common subpaths that might be valid
  const commonSubpaths = ['create', 'edit', 'view', 'settings', 'new', 'upload', 'add'];
  for (const path of [...allValidPaths]) {
    for (const subpath of commonSubpaths) {
      allValidPaths.push(`${path}/${subpath}`);
    }
  }
  
  // Check each quick action path
  let validCount = 0;
  let invalidCount = 0;
  
  for (const [page, actions] of Object.entries(quickActionsMap)) {
    for (const action of actions) {
      const actionPath = action.path;
      
      // Empty path is valid (goes to dashboard root)
      if (actionPath === '') {
        validCount++;
        continue;
      }
      
      if (allValidPaths.includes(actionPath) || actionPath.startsWith('http')) {
        validCount++;
      } else {
        invalidCount++;
        logWarning(`Quick action path may be invalid: '${page}' has action '${action.name}' with path '${actionPath}'`);
      }
    }
  }
  
  const totalPaths = validCount + invalidCount;
  const validPercentage = totalPaths > 0 
    ? Math.round((validCount / totalPaths) * 100) 
    : 0;
  
  if (validPercentage === 100) {
    logPass(`All quick action paths are valid (${validCount}/${totalPaths})`);
  } else {
    logWarning(`Some quick action paths may be invalid: ${validPercentage}% valid (${validCount}/${totalPaths})`);
  }
  
  console.log('');
}

/**
 * Test 6: Keyboard shortcuts definition
 */
async function testKeyboardShortcuts(enhancedNavContent, contextualSidebarContent) {
  console.log(`${colors.bright}Testing keyboard shortcuts definition...${colors.reset}`);
  
  // Expected shortcuts
  const expectedShortcuts = [
    { key: 'k', modifier: 'metaKey', description: 'Quick Search' },
    { key: '.', modifier: 'metaKey', description: 'Toggle Sidebar' },
    { key: '1', modifier: 'metaKey', description: 'Categories View' },
    { key: '2', modifier: 'metaKey', description: 'Favorites View' },
    { key: '3', modifier: 'metaKey', description: 'Recent View' }
  ];
  
  // Check EnhancedNavigation for search shortcut
  const enhancedNavHasSearchShortcut = enhancedNavContent.includes('⌘K') || 
                                      enhancedNavContent.includes('cmd+k') || 
                                      enhancedNavContent.includes('command+k');
  
  if (enhancedNavHasSearchShortcut) {
    logPass('EnhancedNavigation includes Quick Search (⌘K) shortcut reference');
  } else {
    logFail('EnhancedNavigation is missing Quick Search (⌘K) shortcut reference');
  }
  
  // Check ContextualSidebar for toggle shortcut
  const sidebarHasToggleShortcut = contextualSidebarContent.includes('⌘.') || 
                                  contextualSidebarContent.includes('cmd+.') || 
                                  contextualSidebarContent.includes('command+.');
  
  if (sidebarHasToggleShortcut) {
    logPass('ContextualSidebar includes Toggle (⌘.) shortcut reference');
  } else {
    logFail('ContextualSidebar is missing Toggle (⌘.) shortcut reference');
  }
  
  // Check for view switching shortcuts
  const sidebarHasViewShortcuts = contextualSidebarContent.includes('⌘1') || 
                                 (contextualSidebarContent.includes('cmd+1') && 
                                  contextualSidebarContent.includes('cmd+2') && 
                                  contextualSidebarContent.includes('cmd+3'));
  
  if (sidebarHasViewShortcuts) {
    logPass('ContextualSidebar includes View Switching (⌘1-3) shortcut references');
  } else {
    logFail('ContextualSidebar is missing View Switching (⌘1-3) shortcut references');
  }
  
  // Check for event listeners
  const sidebarHasKeydownListener = contextualSidebarContent.includes('addEventListener(\'keydown\'') ||
                                   contextualSidebarContent.includes('addEventListener("keydown"');
  
  if (sidebarHasKeydownListener) {
    logPass('ContextualSidebar implements keydown event listener');
  } else {
    logFail('ContextualSidebar is missing keydown event listener implementation');
  }
  
  console.log('');
}

/**
 * Test 7: Navigation paths validity against app router
 */
async function testNavigationPathsValidity(enhancedNavContent, contextualSidebarContent) {
  console.log(`${colors.bright}Testing navigation paths validity against app router...${colors.reset}`);
  
  // Extract all paths from both components
  const featureCategories = extractFeatureCategories(enhancedNavContent);
  const allPaths = Object.values(featureCategories).flat().map(f => f.path);
  
  // Check if dashboard pages exist for these paths
  let validCount = 0;
  let invalidCount = 0;
  const checkedPaths = new Set();
  
  for (const path of allPaths) {
    if (checkedPaths.has(path)) continue;
    checkedPaths.add(path);
    
    const dashboardPath = path === '' 
      ? path.join(APP_DIR, '(app)/dashboard') 
      : path.join(APP_DIR, '(app)/dashboard', path);
    
    // Check if directory exists or if there's a dynamic route parent
    const pathSegments = path.split('/');
    let isValid = false;
    
    // Check exact path
    if (fs.existsSync(dashboardPath)) {
      isValid = true;
    } else {
      // Check for dynamic route patterns ([id], [...slug], etc.)
      const parentPath = pathSegments.slice(0, -1).join('/');
      const parentDir = parentPath === '' 
        ? path.join(APP_DIR, '(app)/dashboard') 
        : path.join(APP_DIR, '(app)/dashboard', parentPath);
      
      if (fs.existsSync(parentDir)) {
        const items = fs.readdirSync(parentDir);
        for (const item of items) {
          if (item.startsWith('[') && item.endsWith(']')) {
            isValid = true;
            break;
          }
        }
      }
    }
    
    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
      logWarning(`Path '${path}' might not have a corresponding page in the app router`);
    }
  }
  
  const totalPaths = validCount + invalidCount;
  const validPercentage = totalPaths > 0 
    ? Math.round((validCount / totalPaths) * 100) 
    : 0;
  
  if (validPercentage >= 90) {
    logPass(`Navigation paths validity: ${validPercentage}% (${validCount}/${totalPaths})`);
  } else {
    logWarning(`Low navigation paths validity: ${validPercentage}% (${validCount}/${totalPaths})`);
  }
  
  console.log('');
}

/**
 * Test 8: LocalStorage integration
 */
async function testLocalStorageIntegration(contextualSidebarContent) {
  console.log(`${colors.bright}Testing localStorage integration...${colors.reset}`);
  
  // Check if localStorage is used in the component
  const localStorageKeys = [
    'kazi-sidebar-favorites',
    'kazi-sidebar-recent',
    'kazi-sidebar-expanded-categories',
    'kazi-sidebar-workspace',
    'kazi-sidebar-view'
  ];
  
  let foundKeysCount = 0;
  
  for (const key of localStorageKeys) {
    if (contextualSidebarContent.includes(key)) {
      foundKeysCount++;
      logPass(`LocalStorage key '${key}' is used`);
    } else {
      logFail(`LocalStorage key '${key}' is not found in the component`);
    }
  }
  
  // Check for localStorage methods
  const hasGetItem = contextualSidebarContent.includes('localStorage.getItem(');
  const hasSetItem = contextualSidebarContent.includes('localStorage.setItem(');
  
  if (hasGetItem) {
    logPass('Component uses localStorage.getItem() to retrieve data');
  } else {
    logFail('Component does not use localStorage.getItem()');
  }
  
  if (hasSetItem) {
    logPass('Component uses localStorage.setItem() to store data');
  } else {
    logFail('Component does not use localStorage.setItem()');
  }
  
  // Check for useEffect with localStorage
  const hasLocalStorageEffect = contextualSidebarContent.includes('useEffect') && 
                               contextualSidebarContent.includes('localStorage') &&
                               contextualSidebarContent.includes('typeof window !== \'undefined\'');
  
  if (hasLocalStorageEffect) {
    logPass('Component uses useEffect with localStorage and window check');
  } else {
    logWarning('Component might not properly handle localStorage in SSR environments');
  }
  
  console.log('');
}

/**
 * Test 9: Drag-and-drop functionality
 */
async function testDragAndDropFunctionality(contextualSidebarContent) {
  console.log(`${colors.bright}Testing drag-and-drop functionality...${colors.reset}`);
  
  // Check for DnD Kit imports
  const hasDndKitCore = contextualSidebarContent.includes('@dnd-kit/core');
  const hasDndKitSortable = contextualSidebarContent.includes('@dnd-kit/sortable');
  const hasDndKitModifiers = contextualSidebarContent.includes('@dnd-kit/modifiers');
  
  if (hasDndKitCore) {
    logPass('Component imports @dnd-kit/core');
  } else {
    logFail('Component does not import @dnd-kit/core');
  }
  
  if (hasDndKitSortable) {
    logPass('Component imports @dnd-kit/sortable');
  } else {
    logFail('Component does not import @dnd-kit/sortable');
  }
  
  if (hasDndKitModifiers) {
    logPass('Component imports @dnd-kit/modifiers');
  } else {
    logWarning('Component does not import @dnd-kit/modifiers (recommended for constraints)');
  }
  
  // Check for DnD Kit components
  const hasDndContext = contextualSidebarContent.includes('DndContext');
  const hasSortableContext = contextualSidebarContent.includes('SortableContext');
  const hasSortableItem = contextualSidebarContent.includes('useSortable');
  
  if (hasDndContext && hasSortableContext && hasSortableItem) {
    logPass('Component implements all required DnD Kit components');
  } else {
    logFail('Component is missing some required DnD Kit components');
  }
  
  // Check for drag event handlers
  const hasDragEndHandler = contextualSidebarContent.includes('handleDragEnd') || 
                           contextualSidebarContent.includes('onDragEnd');
  
  if (hasDragEndHandler) {
    logPass('Component implements drag end event handler');
  } else {
    logFail('Component does not implement drag end event handler');
  }
  
  // Check for array manipulation after drag
  const hasArrayMove = contextualSidebarContent.includes('arrayMove');
  
  if (hasArrayMove) {
    logPass('Component uses arrayMove to reorder items after drag');
  } else {
    logWarning('Component might not correctly reorder items after drag');
  }
  
  console.log('');
}

/**
 * Test 10: Search functionality
 */
async function testSearchFunctionality(enhancedNavContent, contextualSidebarContent) {
  console.log(`${colors.bright}Testing search functionality...${colors.reset}`);
  
  // Check for search state in EnhancedNavigation
  const enhancedNavHasSearchState = enhancedNavContent.includes('searchQuery') && 
                                   enhancedNavContent.includes('setSearchQuery');
  
  if (enhancedNavHasSearchState) {
    logPass('EnhancedNavigation implements search state');
  } else {
    logFail('EnhancedNavigation does not implement search state');
  }
  
  // Check for search state in ContextualSidebar
  const sidebarHasSearchState = contextualSidebarContent.includes('searchQuery') && 
                               contextualSidebarContent.includes('setSearchQuery');
  
  if (sidebarHasSearchState) {
    logPass('ContextualSidebar implements search state');
  } else {
    logFail('ContextualSidebar does not implement search state');
  }
  
  // Check for search results state
  const enhancedNavHasSearchResults = enhancedNavContent.includes('searchResults') && 
                                     enhancedNavContent.includes('setSearchResults');
  
  if (enhancedNavHasSearchResults) {
    logPass('EnhancedNavigation implements search results state');
  } else {
    logFail('EnhancedNavigation does not implement search results state');
  }
  
  // Check for search filtering logic
  const enhancedNavHasFiltering = enhancedNavContent.includes('filter') && 
                                 enhancedNavContent.includes('toLowerCase') &&
                                 enhancedNavContent.includes('includes');
  
  if (enhancedNavHasFiltering) {
    logPass('EnhancedNavigation implements case-insensitive search filtering');
  } else {
    logFail('EnhancedNavigation does not implement proper search filtering');
  }
  
  // Check for search in both name and description
  const searchesNameAndDesc = enhancedNavContent.includes('name.toLowerCase') && 
                             enhancedNavContent.includes('description.toLowerCase');
  
  if (searchesNameAndDesc) {
    logPass('Search functionality includes both name and description fields');
  } else {
    logWarning('Search might not be searching across all relevant fields');
  }
  
  // Check for minimum search query length check
  const hasMinQueryLength = enhancedNavContent.includes('searchQuery.trim().length >');
  
  if (hasMinQueryLength) {
    logPass('Search implements minimum query length check');
  } else {
    logWarning('Search might not have minimum query length validation');
  }
  
  console.log('');
}

/**
 * Test 11: TypeScript compilation
 */
async function testTypeScriptCompilation() {
  console.log(`${colors.bright}Testing TypeScript compilation...${colors.reset}`);
  
  try {
    // Run TypeScript compiler in noEmit mode just for the navigation components
    execSync(`npx tsc --noEmit ${ENHANCED_NAV_PATH} ${CONTEXTUAL_SIDEBAR_PATH}`, {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    });
    
    logPass('TypeScript compilation successful for both components');
  } catch (error) {
    logFail('TypeScript compilation failed');
    console.error(`${colors.red}${error.stdout?.toString() || error.message}${colors.reset}`);
  }
  
  console.log('');
}

/**
 * Helper functions
 */

// Extract feature categories from EnhancedNavigation content
function extractFeatureCategories(content) {
  // This is a simplified extraction that won't handle all edge cases
  // but should work for our test purposes
  try {
    // For EnhancedNavigation
    if (content.includes('featureCategories = {')) {
      const categoriesMatch = content.match(/featureCategories = {([\s\S]*?)}/);
      if (categoriesMatch) {
        const categoriesStr = categoriesMatch[0];
        
        // Extract category names
        const categoryMatches = categoriesStr.match(/(\w+):\s*\[/g);
        if (!categoryMatches) return {};
        
        const categories = {};
        
        for (const categoryMatch of categoryMatches) {
          const categoryName = categoryMatch.replace(/:\s*\[/, '').trim();
          
          // Find the array for this category
          const categoryRegex = new RegExp(`${categoryName}:\\s*\\[(.*?)\\]`, 's');
          const categoryArrayMatch = categoriesStr.match(categoryRegex);
          
          if (categoryArrayMatch) {
            const categoryArray = categoryArrayMatch[1];
            
            // Extract features from the array
            const featureMatches = categoryArray.match(/{\s*name:\s*['"]([^'"]+)['"]/g);
            
            if (featureMatches) {
              categories[categoryName] = featureMatches.map(match => {
                const nameMatch = match.match(/name:\s*['"]([^'"]+)['"]/);
                const pathMatch = match.match(/path:\s*['"]([^'"]+)['"]/);
                
                return {
                  name: nameMatch ? nameMatch[1] : 'Unknown',
                  path: pathMatch ? pathMatch[1] : 'unknown-path'
                };
              });
            } else {
              categories[categoryName] = [];
            }
          }
        }
        
        return categories;
      }
    }
    
    // For ContextualSidebar
    if (content.includes('categories: CategoryType[]')) {
      const categoriesMatch = content.match(/categories:\s*CategoryType\[\]\s*=\s*\[([\s\S]*?)\];/);
      if (categoriesMatch) {
        const categoriesStr = categoriesMatch[1];
        
        // Extract individual categories
        const categoryBlocks = categoriesStr.split(/},\s*{/).map((block, i) => {
          if (i === 0) return block + '}';
          if (i === categoriesStr.split(/},\s*{/).length - 1) return '{' + block;
          return '{' + block + '}';
        });
        
        return categoryBlocks.map(block => {
          const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
          const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
          
          // Extract features
          const featuresMatch = block.match(/features:\s*\[([\s\S]*?)\]/);
          const features = [];
          
          if (featuresMatch) {
            const featuresStr = featuresMatch[1];
            const featureMatches = featuresStr.match(/{\s*id:.*?category:.*?}/g);
            
            if (featureMatches) {
              featureMatches.forEach(featureStr => {
                const featureIdMatch = featureStr.match(/id:\s*['"]([^'"]+)['"]/);
                const featureNameMatch = featureStr.match(/name:\s*['"]([^'"]+)['"]/);
                const featurePathMatch = featureStr.match(/path:\s*['"]([^'"]+)['"]/);
                
                features.push({
                  id: featureIdMatch ? featureIdMatch[1] : 'unknown',
                  name: featureNameMatch ? featureNameMatch[1] : 'Unknown',
                  path: featurePathMatch ? featurePathMatch[1] : 'unknown-path'
                });
              });
            }
          }
          
          return {
            id: idMatch ? idMatch[1] : 'unknown',
            name: nameMatch ? nameMatch[1] : 'Unknown',
            features
          };
        });
      }
    }
    
    return {};
  } catch (error) {
    console.error('Error extracting feature categories:', error);
    return {};
  }
}

// Extract related features map
function extractRelatedFeaturesMap(content) {
  try {
    const relatedMapMatch = content.match(/relatedFeaturesMap\s*:\s*Record.*?=\s*{([\s\S]*?)}/);
    if (!relatedMapMatch) return {};
    
    const relatedMapStr = relatedMapMatch[1];
    const relatedEntries = relatedMapStr.split(/},/);
    
    const relatedMap = {};
    
    for (const entry of relatedEntries) {
      const keyMatch = entry.match(/['"]([^'"]+)['"]/);
      if (!keyMatch) continue;
      
      const key = keyMatch[1];
      const valuesMatch = entry.match(/\[\s*(.*?)\s*\]/s);
      if (!valuesMatch) continue;
      
      const valuesStr = valuesMatch[1];
      const valueMatches = valuesStr.match(/{\s*category:.*?path:.*?}/g);
      
      if (valueMatches) {
        relatedMap[key] = valueMatches.map(valueStr => {
          const categoryMatch = valueStr.match(/category:\s*['"]([^'"]+)['"]/);
          const pathMatch = valueStr.match(/path:\s*['"]([^'"]+)['"]/);
          
          return {
            category: categoryMatch ? categoryMatch[1] : 'unknown',
            path: pathMatch ? pathMatch[1] : 'unknown-path'
          };
        });
      } else {
        relatedMap[key] = [];
      }
    }
    
    return relatedMap;
  } catch (error) {
    console.error('Error extracting related features map:', error);
    return {};
  }
}

// Extract quick actions map
function extractQuickActionsMap(content) {
  try {
    const quickActionsMatch = content.match(/quickActionsMap\s*:\s*Record.*?=\s*{([\s\S]*?)}/);
    if (!quickActionsMatch) return {};
    
    const quickActionsStr = quickActionsMatch[1];
    const actionEntries = quickActionsStr.split(/],/);
    
    const actionsMap = {};
    
    for (const entry of actionEntries) {
      const keyMatch = entry.match(/['"]([^'"]+)['"]/);
      if (!keyMatch) continue;
      
      const key = keyMatch[1];
      const valuesMatch = entry.match(/\[\s*(.*?)\s*\]/s);
      if (!valuesMatch) continue;
      
      const valuesStr = valuesMatch[1];
      const valueMatches = valuesStr.match(/{\s*name:.*?path:.*?icon:.*?}/g);
      
      if (valueMatches) {
        actionsMap[key] = valueMatches.map(valueStr => {
          const nameMatch = valueStr.match(/name:\s*['"]([^'"]+)['"]/);
          const pathMatch = valueStr.match(/path:\s*['"]([^'"]+)['"]/);
          
          return {
            name: nameMatch ? nameMatch[1] : 'Unknown',
            path: pathMatch ? pathMatch[1] : 'unknown-path'
          };
        });
      } else {
        actionsMap[key] = [];
      }
    }
    
    return actionsMap;
  } catch (error) {
    console.error('Error extracting quick actions map:', error);
    return {};
  }
}

// Find duplicates in an array
function findDuplicates(array) {
  return array.filter((item, index) => array.indexOf(item) !== index);
}

// Log a passing test
function logPass(message) {
  console.log(`${colors.green}✓ PASS:${colors.reset} ${message}`);
  testResults.passed++;
  testResults.details.push({ status: 'pass', message });
}

// Log a failing test
function logFail(message) {
  console.log(`${colors.red}✗ FAIL:${colors.reset} ${message}`);
  testResults.failed++;
  testResults.details.push({ status: 'fail', message });
}

// Log a warning
function logWarning(message) {
  console.log(`${colors.yellow}⚠ WARN:${colors.reset} ${message}`);
  testResults.warnings++;
  testResults.details.push({ status: 'warning', message });
}

// Display test summary
function displayTestSummary() {
  const totalTests = testResults.passed + testResults.failed;
  const passRate = totalTests > 0 ? Math.round((testResults.passed / totalTests) * 100) : 0;
  
  console.log(`\n${colors.bright}=== Test Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testResults.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testResults.failed}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${testResults.warnings}`);
  console.log(`${colors.bright}Pass Rate:${colors.reset} ${passRate}%`);
  
  if (testResults.failed > 0) {
    console.log(`\n${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
    testResults.details
      .filter(detail => detail.status === 'fail')
      .forEach(detail => {
        console.log(`${colors.red}✗${colors.reset} ${detail.message}`);
      });
  }
  
  if (testResults.warnings > 0) {
    console.log(`\n${colors.yellow}${colors.bright}Warnings:${colors.reset}`);
    testResults.details
      .filter(detail => detail.status === 'warning')
      .forEach(detail => {
        console.log(`${colors.yellow}⚠${colors.reset} ${detail.message}`);
      });
  }
  
  // Final status
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}${colors.bright}✓ All tests passed!${colors.reset}`);
    if (testResults.warnings > 0) {
      console.log(`${colors.yellow}⚠ But there are ${testResults.warnings} warnings to review.${colors.reset}`);
    }
  } else {
    console.log(`\n${colors.red}${colors.bright}✗ Some tests failed. Please fix the issues above.${colors.reset}`);
  }
}

// Run all tests
runTests().catch(error => {
  console.error(`${colors.red}Test suite encountered an error:${colors.reset}`, error);
  process.exit(1);
});
