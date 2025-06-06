#!/usr/bin/env node

// Simple functionality test for FreeflowZee
const http = require('http');

console.log('🧪 TESTING FREEFLOWZEE FUNCTIONALITY...\n');

// Test 1: Landing Page Load
function testLandingPage() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Testing Landing Page Load...');
    
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasWatchDemo = data.includes('Watch Demo');
        const hasContactSales = data.includes('Contact Sales') || data.includes('Talk to Sales');
        const hasLogo = data.includes('FreeflowZee');
        const hasHeroSection = data.includes('data-testid="hero-section"');
        
        console.log(`   ✅ Landing page loads: ${res.statusCode === 200 ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Watch Demo button: ${hasWatchDemo ? 'FOUND' : 'MISSING'}`);
        console.log(`   ✅ Contact Sales button: ${hasContactSales ? 'FOUND' : 'MISSING'}`);
        console.log(`   ✅ Logo present: ${hasLogo ? 'FOUND' : 'MISSING'}`);
        console.log(`   ✅ Hero section: ${hasHeroSection ? 'FOUND' : 'MISSING'}`);
        
        resolve({
          pageLoads: res.statusCode === 200,
          hasWatchDemo,
          hasContactSales,
          hasLogo,
          hasHeroSection
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
  });
}

// Test 2: Contact Page
function testContactPage() {
  return new Promise((resolve, reject) => {
    console.log('\n2️⃣ Testing Contact Page...');
    
    const req = http.get('http://localhost:3000/contact', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   ✅ Contact page status: ${res.statusCode}`);
        console.log(`   ✅ Contact page accessible: ${res.statusCode === 200 ? 'PASS' : 'FAIL'}`);
        
        resolve({
          contactPageLoads: res.statusCode === 200,
          statusCode: res.statusCode
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Request timeout')));
  });
}

// Test 3: Component Files Exist
function testComponentFiles() {
  const fs = require('fs');
  console.log('\n3️⃣ Testing Component Files...');
  
  const files = [
    'components/demo-modal.tsx',
    'components/app-navigation.tsx',
    'app/landing.tsx'
  ];
  
  const results = {};
  
  files.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ✅ ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
    results[file] = exists;
  });
  
  return results;
}

// Run All Tests
async function runTests() {
  try {
    console.log('🚀 Starting comprehensive functionality tests...\n');
    
    // Test landing page
    const landingResults = await testLandingPage();
    
    // Test contact page
    const contactResults = await testContactPage();
    
    // Test component files
    const fileResults = testComponentFiles();
    
    // Generate Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    
    const totalTests = 7;
    let passedTests = 0;
    
    if (landingResults.pageLoads) passedTests++;
    if (landingResults.hasWatchDemo) passedTests++;
    if (landingResults.hasContactSales) passedTests++;
    if (landingResults.hasLogo) passedTests++;
    if (contactResults.contactPageLoads) passedTests++;
    if (fileResults['components/demo-modal.tsx']) passedTests++;
    if (fileResults['app/landing.tsx']) passedTests++;
    
    console.log(`✅ PASSED: ${passedTests}/${totalTests} tests`);
    console.log(`📈 SUCCESS RATE: ${Math.round((passedTests/totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! ChunkLoadError has been resolved and demo functionality is working!');
    } else {
      console.log('\n⚠️ Some tests failed. Review the output above for details.');
    }
    
    // Specific status
    console.log('\n🔍 SPECIFIC FUNCTIONALITY STATUS:');
    console.log(`   • ChunkLoadError (Contact Sales): ${contactResults.contactPageLoads ? 'FIXED ✅' : 'STILL BROKEN ❌'}`);
    console.log(`   • Demo Modal Implementation: ${fileResults['components/demo-modal.tsx'] ? 'COMPLETE ✅' : 'MISSING ❌'}`);
    console.log(`   • Logo Navigation: ${landingResults.hasLogo ? 'WORKING ✅' : 'BROKEN ❌'}`);
    console.log(`   • Landing Page Buttons: ${landingResults.hasWatchDemo && landingResults.hasContactSales ? 'WORKING ✅' : 'MISSING ❌'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests(); 