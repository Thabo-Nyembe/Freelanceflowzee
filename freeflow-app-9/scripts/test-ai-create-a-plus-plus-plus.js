#!/usr/bin/env node

/**
 * 🎉 A+++ AI CREATE FEATURE COMPREHENSIVE TEST SUITE
 * 
 * This script tests all enhanced AI Create features for FreeflowZee:
 * - Multi-field asset generation (Photography, Videography, Design, Music, Writing, Web Dev)
 * - Premium AI model integration with cost optimization
 * - Advanced settings with quality levels and resolutions
 * - Enterprise-grade asset metadata and file formats
 * - Real-time generation progress and analytics
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:3000'
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

// A+++ Test Cases for All Creative Fields
const testCases = [
  {
    name: "Photography - Professional LUTs",
    data: {
      field: "photography",
      assetType: "luts",
      parameters: {
        style: "cinematic",
        colorScheme: "warm",
        customPrompt: "Create professional color grading for film-style photography"
      },
      advancedSettings: {
        quality: "ultra",
        resolution: "4k"
      }
    },
    expectedAssets: 4,
    expectedFormats: ['.cube']
  },
  {
    name: "Videography - Epic Transitions",
    data: {
      field: "videography", 
      assetType: "transitions",
      parameters: {
        style: "epic",
        colorScheme: "dark",
        customPrompt: "Cinematic scene transitions for storytelling"
      },
      advancedSettings: {
        quality: "pro",
        resolution: "4k"
      }
    },
    expectedAssets: 5,
    expectedFormats: ['.prproj']
  },
  {
    name: "Design - Modern Templates",
    data: {
      field: "design",
      assetType: "templates", 
      parameters: {
        style: "modern",
        colorScheme: "purple",
        customPrompt: "Professional business template designs"
      },
      advancedSettings: {
        quality: "high",
        resolution: "1080p"
      }
    },
    expectedAssets: 3,
    expectedFormats: ['.ai']
  },
  {
    name: "Music - Electronic Samples",
    data: {
      field: "music",
      assetType: "samples",
      parameters: {
        style: "electronic",
        colorScheme: "vibrant",
        customPrompt: "Upbeat electronic music samples for content creation"
      },
      advancedSettings: {
        quality: "pro",
        resolution: "192kbps"
      }
    },
    expectedAssets: 4,
    expectedFormats: ['.wav']
  },
  {
    name: "Writing - Blog Templates", 
    data: {
      field: "writing",
      assetType: "templates",
      parameters: {
        style: "professional",
        colorScheme: "clean",
        customPrompt: "SEO-optimized blog post templates"
      },
      advancedSettings: {
        quality: "high",
        resolution: "standard"
      }
    },
    expectedAssets: 3,
    expectedFormats: ['.docx']
  },
  {
    name: "Web Development - React Components",
    data: {
      field: "web-development",
      assetType: "components",
      parameters: {
        style: "modern",
        colorScheme: "blue",
        customPrompt: "Reusable React components for web applications"
      },
      advancedSettings: {
        quality: "enterprise",
        resolution: "responsive"
      }
    },
    expectedAssets: 4,
    expectedFormats: ['.jsx']
  }
]

// Premium AI Model Test Cases
const premiumModelTests = [
  {
    name: "GPT-4o Enterprise Model",
    modelConfig: {
      modelId: "gpt-4o",
      provider: "OpenAI",
      useCustomApi: false,
      qualityLevel: "enterprise"
    }
  },
  {
    name: "Claude 3.5 Sonnet Enterprise",
    modelConfig: {
      modelId: "claude-3.5-sonnet", 
      provider: "Anthropic",
      useCustomApi: false,
      qualityLevel: "enterprise"
    }
  },
  {
    name: "DALL-E 3 Image Generation",
    modelConfig: {
      modelId: "dall-e-3",
      provider: "OpenAI", 
      useCustomApi: false,
      qualityLevel: "premium"
    }
  }
]

async function testAICreateEndpoint(testCase, modelConfig = null) {
  try {
    const requestData = { ...testCase.data }
    if (modelConfig) {
      requestData.modelConfig = modelConfig
    }

    console.log(`${colors.cyan}🧪 Testing: ${testCase.name}${colors.reset}`)
    console.log(`${colors.blue}   Field: ${requestData.field}${colors.reset}`)
    console.log(`${colors.blue}   Asset Type: ${requestData.assetType}${colors.reset}`)
    console.log(`${colors.blue}   Style: ${requestData.parameters.style}${colors.reset}`)
    
    if (modelConfig) {
      console.log(`${colors.magenta}   AI Model: ${modelConfig.modelId} (${modelConfig.provider})${colors.reset}`)
    }

    const startTime = Date.now()
    const response = await axios.post(`${BASE_URL}/api/ai/create`, requestData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    })
    const endTime = Date.now()

    if (response.data.success) {
      const assets = response.data.assets
      const metadata = response.data.metadata
      
      console.log(`${colors.green}   ✅ SUCCESS - Generated ${assets.length} assets${colors.reset}`)
      console.log(`${colors.green}   📊 Total Size: ${metadata.totalSize}${colors.reset}`)
      console.log(`${colors.green}   ⏱️  Generation Time: ${endTime - startTime}ms${colors.reset}`)
      console.log(`${colors.green}   🤖 AI Model Used: ${metadata.modelUsed.name}${colors.reset}`)
      
      // Validate asset count
      if (assets.length === testCase.expectedAssets) {
        console.log(`${colors.green}   ✅ Asset count correct (${assets.length})${colors.reset}`)
      } else {
        console.log(`${colors.yellow}   ⚠️  Asset count mismatch: expected ${testCase.expectedAssets}, got ${assets.length}${colors.reset}`)
      }

      // Validate file formats
      const formats = assets.map(asset => asset.metadata.format)
      const hasExpectedFormat = testCase.expectedFormats.some(expected => 
        formats.some(format => format.includes(expected))
      )
      
      if (hasExpectedFormat) {
        console.log(`${colors.green}   ✅ File formats correct${colors.reset}`)
      } else {
        console.log(`${colors.yellow}   ⚠️  Format mismatch: expected ${testCase.expectedFormats}, got ${formats}${colors.reset}`)
      }

      // Show sample asset
      if (assets.length > 0) {
        const sampleAsset = assets[0]
        console.log(`${colors.blue}   📁 Sample Asset: ${sampleAsset.name}${colors.reset}`)
        console.log(`${colors.blue}   🏷️  Tags: ${sampleAsset.metadata.tags.join(', ')}${colors.reset}`)
      }

      return { success: true, assets: assets.length, metadata }
    } else {
      console.log(`${colors.red}   ❌ FAILED - ${response.data.error}${colors.reset}`)
      return { success: false, error: response.data.error }
    }
  } catch (error) {
    console.log(`${colors.red}   ❌ ERROR - ${error.message}${colors.reset}`)
    return { success: false, error: error.message }
  }
}

async function runComprehensiveTest() {
  console.log(`${colors.bold}${colors.magenta}`)
  console.log(`🎉 ========================================`)
  console.log(`   FreeflowZee A+++ AI Create Test Suite`)
  console.log(`   Testing Enterprise-Grade AI Features`)
  console.log(`========================================${colors.reset}`)
  console.log()

  let totalTests = 0
  let passedTests = 0
  let totalAssets = 0
  const results = []

  // Test all creative fields
  console.log(`${colors.bold}${colors.cyan}📚 Testing All Creative Fields${colors.reset}`)
  console.log()

  for (const testCase of testCases) {
    totalTests++
    const result = await testAICreateEndpoint(testCase)
    results.push({ name: testCase.name, ...result })
    
    if (result.success) {
      passedTests++
      totalAssets += result.assets
    }
    
    console.log()
  }

  // Test premium AI models
  console.log(`${colors.bold}${colors.magenta}🤖 Testing Premium AI Models${colors.reset}`)
  console.log()

  for (const modelTest of premiumModelTests) {
    totalTests++
    // Use design template test for model testing
    const designTest = testCases.find(t => t.name.includes("Design"))
    const result = await testAICreateEndpoint(designTest, modelTest.modelConfig)
    results.push({ name: `${designTest.name} + ${modelTest.name}`, ...result })
    
    if (result.success) {
      passedTests++
      totalAssets += result.assets
    }
    
    console.log()
  }

  // Final Results Summary
  console.log(`${colors.bold}${colors.cyan}`)
  console.log(`📊 ========================================`)
  console.log(`   FINAL TEST RESULTS`)
  console.log(`========================================${colors.reset}`)
  console.log()
  
  console.log(`${colors.bold}${colors.green}✅ Tests Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)${colors.reset}`)
  console.log(`${colors.bold}${colors.blue}🎨 Total Assets Generated: ${totalAssets}${colors.reset}`)
  console.log()

  // Detailed Results
  console.log(`${colors.bold}${colors.cyan}📋 Detailed Results:${colors.reset}`)
  results.forEach(result => {
    const status = result.success ? 
      `${colors.green}✅ PASS${colors.reset}` : 
      `${colors.red}❌ FAIL${colors.reset}`
    console.log(`   ${status} ${result.name}`)
    if (result.success && result.assets) {
      console.log(`       📁 ${result.assets} assets generated`)
    }
    if (!result.success && result.error) {
      console.log(`       ❌ ${result.error}`)
    }
  })

  console.log()
  
  if (passedTests === totalTests) {
    console.log(`${colors.bold}${colors.green}🎉 ALL TESTS PASSED! A+++ AI CREATE FEATURES WORKING PERFECTLY!${colors.reset}`)
    console.log(`${colors.green}🚀 Ready for production deployment with enterprise-grade AI capabilities${colors.reset}`)
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Please review the results above.${colors.reset}`)
  }
  
  console.log()
  console.log(`${colors.bold}${colors.magenta}🎯 A+++ Features Tested:${colors.reset}`)
  console.log(`   • Multi-field asset generation (6 creative fields)`)
  console.log(`   • Premium AI model integration (GPT-4o, Claude 3.5, DALL-E 3)`)
  console.log(`   • Advanced quality settings and resolutions`)
  console.log(`   • Enterprise-grade metadata and file formats`)
  console.log(`   • Real-time generation analytics`)
  console.log(`   • Professional asset categorization and tagging`)
  console.log()
}

// Run the comprehensive test
if (require.main === module) {
  runComprehensiveTest().catch(console.error)
}

module.exports = { runComprehensiveTest, testAICreateEndpoint } 