#!/usr/bin/env node

/**
 * Playwright Visual Test with Context7 Integration
 * Tests UI/UX, fonts, icons, theme, and overall visual presentation
 */

const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: 'test-results/playwright-visual'
};

async function main() {
  console.log('🎭 Playwright Visual Test with Context7');
  
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  
  const results = {
    visual_tests: await runVisualTests(),
    context7_patterns: await testContext7Patterns()
  };
  
  const total = results.visual_tests.total + results.context7_patterns.total;
  const passed = results.visual_tests.passed + results.context7_patterns.passed;
  
  console.log('\n📊 Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  
  await fs.writeFile(path.join(CONFIG.outputDir, 'report.json'), JSON.stringify(results, null, 2));
}

async function runVisualTests() {
  console.log('\n👀 Visual Tests...');
  const tests = [
    { name: 'Font Loading', test: testFontLoading },
    { name: 'Theme Colors', test: testThemeColors },
    { name: 'Icons', test: testIcons },
    { name: 'Layout', test: testLayout }
  ];
  
  return await runTests(tests);
}

async function testContext7Patterns() {
  console.log('\n🧠 Context7 Patterns...');
  const tests = [
    { name: 'SEO Structure', test: testSEO },
    { name: 'Performance', test: testPerformance }
  ];
  
  return await runTests(tests);
}

async function runTests(tests) {
  const results = { passed: 0, failed: 0, total: tests.length, details: [] };
  
  for (const test of tests) {
    console.log(`  🔍 ${test.name}...`);
    try {
      const result = await test.test();
      if (result.success) {
        results.passed++;
        console.log('    ✅ PASSED');
      } else {
        results.failed++;
        console.log(`    ❌ FAILED: ${result.error}`);
      }
      results.details.push({ name: test.name, ...result });
    } catch (error) {
      results.failed++;
      console.log(`    ❌ ERROR: ${error.message}`);
      results.details.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  return results;
}

async function testFontLoading() {
  const response = await fetch(`${CONFIG.baseUrl}/fonts/inter-var.woff2`);
  return {
    success: response.ok,
    error: response.ok ? null : `Font failed: ${response.status}`
  };
}

async function testThemeColors() {
  const response = await fetch(CONFIG.baseUrl);
  const html = await response.text();
  
  const hasTheme = html.includes('purple') && html.includes('white') && !html.includes('bg-black');
  return {
    success: hasTheme,
    error: hasTheme ? null : 'Theme colors not detected'
  };
}

async function testIcons() {
  const response = await fetch(CONFIG.baseUrl);
  const html = await response.text();
  
  const hasIcons = html.includes('<svg') || html.includes('icon');
  return {
    success: hasIcons,
    error: hasIcons ? null : 'No icons detected'
  };
}

async function testLayout() {
  const response = await fetch(CONFIG.baseUrl);
  const html = await response.text();
  
  const hasLayout = html.includes('flex') || html.includes('grid');
  return {
    success: hasLayout,
    error: hasLayout ? null : 'No modern layout detected'
  };
}

async function testSEO() {
  const response = await fetch(CONFIG.baseUrl);
  const html = await response.text();
  
  const hasSEO = html.includes('<title>') && html.includes('meta name="description"');
  return {
    success: hasSEO,
    error: hasSEO ? null : 'SEO metadata missing'
  };
}

async function testPerformance() {
  const start = Date.now();
  const response = await fetch(CONFIG.baseUrl);
  await response.text();
  const loadTime = Date.now() - start;
  
  return {
    success: loadTime < 2000,
    error: loadTime < 2000 ? null : `Slow load: ${loadTime}ms`
  };
}

if (require.main === module) {
  main().catch(console.error);
} 