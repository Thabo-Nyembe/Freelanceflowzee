#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

console.log('🎨 FreeflowZee Comprehensive Color Visibility Test');
console.log('==================================================');

// Function to test if server is running
function testServerConnection(port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      let data = '';'
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ success: true, data, status: res.statusCode });
      });
    });
    req.on('error', () => {
      resolve({ success: false });
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false });
    });
  });
}

// Function to check for problematic color combinations
function analyzeColorIssues(html) {
  const issues = [];
  
  // Check for specific problematic patterns
  const problematicPatterns = [
    /bg-black/gi,
    /bg-gray-900/gi,
    /from-gray-900/gi,
    /from-black/gi,
    /to-gray-900/gi,
    /to-black/gi,
    /via-gray-900/gi,
    /via-black/gi,
  ];
  
  const textWhitePattern = /text-white/gi;
  
  problematicPatterns.forEach((pattern, index) => {
    const matches = html.match(pattern);
    if (matches) {
      issues.push({
        type: 'background',
        pattern: pattern.source,
        count: matches.length,
        severity: 'high'
      });
    }
  });
  
  const textWhiteMatches = html.match(textWhitePattern);
  if (textWhiteMatches) {
    issues.push({
      type: 'text',
      pattern: 'text-white',
      count: textWhiteMatches.length,
      severity: 'medium',
      note: 'May be legitimate on colored backgrounds'
    });
  }
  
  return issues;
}

// Function to check CSS overrides
function checkCSSOverrides() {
  const cssFile = 'app/globals.css';
  
  if (!fs.existsSync(cssFile)) {
    return { exists: false, error: 'CSS file not found' };
  }
  
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  
  // Check for our specific override rules
  const hasBlackBgOverride = cssContent.includes('*[class*= "bg-black"]');
  const hasGrayBgOverride = cssContent.includes('*[class*= "bg-gray-900"]');
  const hasGradientOverride = cssContent.includes('*[class*= "from-gray-900"]');
  const hasTextVisibilityRules = cssContent.includes('color: var(--purple-700) !important');
  
  return {
    exists: true,
    overrides: {
      blackBackground: hasBlackBgOverride,
      grayBackground: hasGrayBgOverride,
      gradientBackground: hasGradientOverride,
      textVisibility: hasTextVisibilityRules
    },
    complete: hasBlackBgOverride && hasGrayBgOverride && hasGradientOverride && hasTextVisibilityRules
  };
}

// Main test function
async function runColorVisibilityTest() {
  console.log('\n🔍 Phase 1: Server Connection Test');
  console.log('================================== ');
  
  const serverTest = await testServerConnection(3000);
  
  if (!serverTest.success) {
    console.log('❌ Server not running on port 3000');
    console.log('💡 Please start the development server with: npm run dev');
    return;
  }
  
  console.log('✅ Server is running successfully');
  console.log(`📊 Response status: ${serverTest.status}`);
  
  console.log('\n🎨 Phase 2: CSS Override Verification');
  console.log('==================================== ');
  
  const cssCheck = checkCSSOverrides();
  
  if (!cssCheck.exists) {
    console.log('❌ CSS file not found');
    return;
  }
  
  console.log('✅ CSS file exists');
  
  Object.entries(cssCheck.overrides).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const description = {
      blackBackground: 'Black background override',
      grayBackground: 'Gray-900 background override',
      gradientBackground: 'Gradient background override',
      textVisibility: 'Text visibility rules'
    }[key];
    
    console.log(`${status} ${description}`);
  });
  
  if (cssCheck.complete) {
    console.log('\n🎉 All CSS overrides are in place!');
  } else {
    console.log('\n⚠️  Some CSS overrides are missing');
  }
  
  console.log('\n🔍 Phase 3: HTML Color Analysis');
  console.log('=============================== ');
  
  const issues = analyzeColorIssues(serverTest.data);
  
  if (issues.length === 0) {
    console.log('✅ No color issues detected in HTML!');
  } else {
    console.log(`⚠️  Found ${issues.length} potential color issues:`);
    issues.forEach((issue, index) => {
      const severity = issue.severity === 'high' ? '🔴' : '🟡';
      console.log(`${severity} ${issue.type.toUpperCase()}: ${issue.pattern} (${issue.count} occurrences)`);
      if (issue.note) {
        console.log(`   📝 Note: ${issue.note}`);
      }
    });
  }
  
  console.log('\n🎯 Phase 4: Recommendations');
  console.log('=========================== ');
  
  // High-severity issues
  const highSeverityIssues = issues.filter(i => i.severity === 'high');
  if (highSeverityIssues.length > 0) {
    console.log('🔴 High Priority Fixes Needed:');
    highSeverityIssues.forEach(issue => {
      console.log(`   • Remove or replace ${issue.pattern} classes`);
    });
  }
  
  // Medium-severity issues  
  const mediumSeverityIssues = issues.filter(i => i.severity === 'medium');
  if (mediumSeverityIssues.length > 0) {
    console.log('🟡 Medium Priority - Review Required:');
    mediumSeverityIssues.forEach(issue => {
      console.log(`   • Review ${issue.pattern} usage - ensure proper contrast on colored backgrounds`);
    });
  }
  
  if (highSeverityIssues.length === 0 && cssCheck.complete) {
    console.log('🎉 Color system looks good! All major issues have been resolved.');
    console.log('💡 Consider manual testing on different pages to verify visual appearance.');
  }
  
  console.log('\n📋 Test Summary');
  console.log('===============');
  console.log(`Server Status: ${serverTest.success ? '✅ Running' : '❌ Not Running'}`);
  console.log(`CSS Overrides: ${cssCheck.complete ? '✅ Complete' : '⚠️  Incomplete'}`);
  console.log(`High Severity Issues: ${highSeverityIssues.length}`);
  console.log(`Medium Severity Issues: ${mediumSeverityIssues.length}`);
  
  const overallStatus = serverTest.success && cssCheck.complete && highSeverityIssues.length === 0;
  console.log(`Overall Status: ${overallStatus ? '✅ PASSED' : '⚠️  NEEDS ATTENTION'}`);
}

// Run the test
runColorVisibilityTest().catch(console.error); 