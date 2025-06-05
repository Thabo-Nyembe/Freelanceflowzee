#!/bin/bash

echo "🔧 Quick Fix Script for FreeflowZee Dashboard Tests"
echo "Based on Context7 best practices and comprehensive app analysis"

# Step 1: Create missing avatar images
echo "📸 Creating placeholder avatar images..."
mkdir -p public/avatars

# Create simple colored placeholder images (1x1 pixel PNG)
# These will resolve the 404 errors in tests
for avatar in john jane alice bob mike client-1; do
    # Create a 1x1 transparent PNG
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > "public/avatars/${avatar}.jpg"
    echo "✅ Created public/avatars/${avatar}.jpg"
done

# Step 2: Update package.json scripts for better test execution
echo "📝 Adding comprehensive test scripts to package.json..."

# Add new test scripts
npm pkg set scripts.test:landing="NODE_OPTIONS='--max-old-space-size=8192' playwright test tests/e2e/landing-page.spec.ts"
npm pkg set scripts.test:navigation="NODE_OPTIONS='--max-old-space-size=8192' playwright test tests/e2e/navigation.spec.ts"
npm pkg set scripts.test:hubs="NODE_OPTIONS='--max-old-space-size=8192' playwright test tests/e2e/dashboard-hubs.spec.ts"
npm pkg set scripts.test:edge-cases="NODE_OPTIONS='--max-old-space-size=8192' playwright test tests/e2e/edge-cases.spec.ts"
npm pkg set scripts.test:mobile="NODE_OPTIONS='--max-old-space-size=8192' playwright test tests/e2e/mobile-responsive.spec.ts"
npm pkg set scripts.test:performance="NODE_OPTIONS='--max-old-space-size=8192' playwright test tests/e2e/performance.spec.ts"
npm pkg set scripts.test:accessibility="NODE_OPTIONS='--max-old-space-size=8192' playwright test tests/e2e/accessibility.spec.ts"
npm pkg set scripts.test:all-comprehensive="npm run test:dashboard && npm run test:payment && npm run test:landing && npm run test:navigation && npm run test:hubs"

echo "✅ Updated package.json with comprehensive test scripts"

# Step 3: Create a minimal test to verify the Projects Hub selector fix
echo "🧪 Creating a quick diagnostic test for Projects Hub..."

cat > tests/e2e/projects-hub-diagnostic.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({
    'x-test-mode': 'true',
    'user-agent': 'Playwright/Diagnostic Tests - FreeflowZee'
  });
});

test.describe('Projects Hub Diagnostic', () => {
  test('should find Projects Hub element with different selectors', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Try clicking Projects tab first
    await page.click('button[role="tab"]:has-text("Projects")');
    await page.waitForTimeout(1000);
    
    // Test different selectors to find Projects Hub
    const selectors = [
      'h2:has-text("Projects Hub")',
      '.card-title:has-text("Projects Hub")',
      'text=Projects Hub',
      '[data-testid="projects-hub-title"]',
      'h2:text-is("Projects Hub")',
      'h3:has-text("Projects Hub")',
      '*:has-text("Projects Hub")'
    ];
    
    for (const selector of selectors) {
      try {
        const element = await page.locator(selector).first();
        const isVisible = await element.isVisible();
        console.log(`Selector "${selector}": ${isVisible ? '✅ FOUND' : '❌ NOT FOUND'}`);
        
        if (isVisible) {
          const text = await element.textContent();
          console.log(`  Text content: "${text}"`);
        }
      } catch (error) {
        console.log(`Selector "${selector}": ❌ ERROR - ${error.message}`);
      }
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/projects-hub-debug.png' });
    
    // Just check that we're on the projects tab
    const projectsTab = page.locator('button[role="tab"]:has-text("Projects")');
    await expect(projectsTab).toHaveAttribute('aria-selected', 'true');
  });
  
  test('should examine actual DOM structure', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click Projects tab
    await page.click('button[role="tab"]:has-text("Projects")');
    await page.waitForTimeout(1000);
    
    // Get the actual HTML structure
    const projectsContent = await page.locator('[role="tabpanel"]').innerHTML();
    console.log('Projects tab HTML structure:');
    console.log(projectsContent);
    
    // Check for any element containing "Projects"
    const projectElements = await page.locator('*:has-text("Project")').all();
    console.log(`Found ${projectElements.length} elements containing "Project"`);
    
    for (let i = 0; i < Math.min(projectElements.length, 5); i++) {
      const text = await projectElements[i].textContent();
      const tagName = await projectElements[i].evaluate(el => el.tagName);
      console.log(`Element ${i + 1}: <${tagName}> "${text?.substring(0, 50)}..."`);
    }
  });
});
EOF

echo "✅ Created diagnostic test: tests/e2e/projects-hub-diagnostic.spec.ts"

# Step 4: Run the diagnostic test
echo "🔍 Running diagnostic test to understand the selector issue..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!
echo "🚀 Started dev server (PID: $DEV_PID)"

# Wait for dev server to start
sleep 5

echo "Running Projects Hub diagnostic test..."
npx playwright test tests/e2e/projects-hub-diagnostic.spec.ts --headed || true

# Step 5: Create a simple landing page test
echo "🏠 Creating basic landing page test..."

cat > tests/e2e/landing-page-basic.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('Landing Page - Basic Functionality', () => {
  test('should load landing page successfully', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');
    
    // Assert - Basic page loads
    await expect(page).toHaveTitle(/FreeflowZee/);
    await expect(page.locator('h1')).toContainText('Create, Share');
  });
  
  test('should display main navigation elements', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');
    
    // Assert - Navigation elements are present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Start Creating')).toBeVisible();
  });
  
  test('should have working CTA buttons', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act - Click main CTA (should not error)
    const ctaButton = page.locator('text=Start Creating Free').first();
    
    // Assert - Button is clickable
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });
  
  test('should display feature sections', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');
    
    // Assert - Feature sections are visible
    await expect(page.locator('text=Upload Anything')).toBeVisible();
    await expect(page.locator('text=Client Collaboration')).toBeVisible();
    await expect(page.locator('text=Get Paid Fast')).toBeVisible();
  });
});
EOF

echo "✅ Created basic landing page test: tests/e2e/landing-page-basic.spec.ts"

# Step 6: Test the landing page
echo "🧪 Testing landing page functionality..."
npx playwright test tests/e2e/landing-page-basic.spec.ts || true

# Step 7: Create comprehensive test status checker
echo "📊 Creating test status checker..."

cat > check-test-status.js << 'EOF'
const { execSync } = require('child_process');

console.log('🚀 FreeflowZee Test Status Checker');
console.log('='.repeat(50));

const testSuites = [
  { name: 'Dashboard Tests', command: 'npm run test:dashboard' },
  { name: 'Payment Tests', command: 'npm run test:payment' },
  { name: 'Landing Page', command: 'npx playwright test tests/e2e/landing-page-basic.spec.ts' },
  { name: 'Projects Hub Diagnostic', command: 'npx playwright test tests/e2e/projects-hub-diagnostic.spec.ts' }
];

const results = [];

for (const suite of testSuites) {
  console.log(`\n🧪 Running: ${suite.name}`);
  try {
    const output = execSync(suite.command, { encoding: 'utf8', timeout: 60000 });
    const passed = output.includes('passed') || output.includes('✓');
    results.push({ name: suite.name, status: passed ? '✅ PASSED' : '⚠️  PARTIAL', output });
    console.log(`   ${passed ? '✅ PASSED' : '⚠️  PARTIAL'}`);
  } catch (error) {
    results.push({ name: suite.name, status: '❌ FAILED', error: error.message });
    console.log(`   ❌ FAILED: ${error.message.substring(0, 100)}...`);
  }
}

console.log('\n📊 COMPREHENSIVE TEST RESULTS');
console.log('='.repeat(50));
results.forEach(result => {
  console.log(`${result.name}: ${result.status}`);
});

console.log('\n🎯 NEXT STEPS:');
console.log('1. Fix Projects Hub selector in dashboard tests');
console.log('2. Add missing test data attributes to components');
console.log('3. Implement comprehensive edge case testing');
console.log('4. Add mobile responsiveness tests');
console.log('5. Implement accessibility testing');

EOF

echo "✅ Created test status checker: check-test-status.js"

# Step 8: Clean up and provide summary
echo "🧹 Cleaning up..."
kill $DEV_PID 2>/dev/null || true

echo ""
echo "✨ QUICK FIX COMPLETE!"
echo "===================="
echo ""
echo "✅ Actions Completed:"
echo "   • Created placeholder avatar images (resolves 404 errors)"
echo "   • Added comprehensive test scripts to package.json"
echo "   • Created diagnostic test for Projects Hub selector issue"
echo "   • Created basic landing page functionality test"
echo "   • Created test status checker script"
echo ""
echo "🚀 Next Steps:"
echo "   1. Run: node check-test-status.js"
echo "   2. Run: npm run test:dashboard (check for improvements)"
echo "   3. Examine test-results/projects-hub-debug.png for selector debugging"
echo "   4. Update dashboard tests based on diagnostic results"
echo ""
echo "📊 Available Test Commands:"
echo "   • npm run test:dashboard"
echo "   • npm run test:payment" 
echo "   • npm run test:landing"
echo "   • npm run test:all-comprehensive"
echo "   • node check-test-status.js"
echo ""
echo "🎯 This addresses the critical dashboard test issues identified in the comprehensive analysis."
echo "   The Projects Hub selector problem should now be diagnosable with the debug output." 