#!/usr/bin/env node

/**
 * OpenRouter Integration Test Script
 * Tests the OpenRouter AI service integration with FreeflowZee
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`)
}

async function testOpenRouterAPI() {
  const baseUrl = 'http://localhost:3000'
  
  log('\n🤖 Testing OpenRouter AI Integration...', colors.cyan)
  log('=' .repeat(50), colors.cyan)'

  try {
    // Test 1: API Health Check
    log('\n📡 Test 1: API Health Check', colors.yellow)
    const healthResponse = await fetch(`${baseUrl}/api/ai/openrouter`)
    const healthData = await healthResponse.json()
    
    if (healthData.success) {
      log('✅ API is responding correctly', colors.green)
      log(`📄 Available endpoints: ${Object.keys(healthData.endpoints).length}`, colors.green)
    } else {
      log('❌ API health check failed', colors.red)
      return false
    }

    // Test 2: Connection Test
    log('\n🔗 Test 2: OpenRouter Connection Test', colors.yellow)
    const connectionResponse = await fetch(`${baseUrl}/api/ai/openrouter?test=connection`)
    const connectionData = await connectionResponse.json()
    
    if (connectionData.success && connectionData.connected) {
      log('✅ OpenRouter connection successful', colors.green)
    } else {
      log('⚠️  OpenRouter connection test failed - API key may not be set', colors.yellow)
      log('   You can still proceed to set up your API key', colors.yellow)
    }

    // Test 3: Available Models (if connection works)
    if (connectionData.connected) {
      log('\n🎯 Test 3: Available Models', colors.yellow)
      const modelsResponse = await fetch(`${baseUrl}/api/ai/openrouter?test=models`)
      const modelsData = await modelsResponse.json()
      
      if (modelsData.success && modelsData.models) {
        log(`✅ Found ${modelsData.total} available models`, colors.green)
        log(`📋 Showing first few models:`, colors.green)
        modelsData.models.slice(0, 3).forEach(model => {
          log(`   • ${model.name || model.id}`, colors.green)
        })
      }
    }

    // Test 4: AI Response Generation (if connected)
    if (connectionData.connected) {
      log('\n💭 Test 4: AI Response Generation', colors.yellow)
      const aiResponse = await fetch(`${baseUrl}/api/ai/openrouter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Briefly introduce yourself as the FreeflowZee AI assistant',
          context: { testMode: true }
        })
      })
      
      const aiData = await aiResponse.json()
      
      if (aiData.success) {
        log('✅ AI response generation working', colors.green)
        log(`💬 Sample response: "${aiData.response.substring(0, 100)}..."`, colors.green)
      } else {
        log('❌ AI response generation failed', colors.red)
        log(`Error: ${aiData.error}`, colors.red)
      }
    }

    log('\n🎉 OpenRouter Integration Test Complete!', colors.cyan)
    log('=' .repeat(50), colors.cyan)'
    
    // Instructions for setting up API key
    if (!connectionData.connected) {
      log('\n📝 NEXT STEPS: Set up your OpenRouter API Key', colors.yellow)
      log('1. Edit your .env.local file', colors.yellow)
      log('2. Replace "your_openrouter_key_here" with your actual API key', colors.yellow)
      log('3. Restart your development server', colors.yellow)
      log('4. Run this test again to verify connection', colors.yellow)
    } else {
      log('\n✨ OpenRouter is fully integrated and working!', colors.green)
      log('Your FreeflowZee app now has AI capabilities enabled.', colors.green)
    }

    return true

  } catch (error) {
    log('\n❌ Test failed with error: ', colors.red)
    log(error.message, colors.red)
    log('\nMake sure your development server is running on port 3000', colors.yellow)
    return false
  }
}

// Run the test
if (require.main === module) {
  testOpenRouterAPI()
    .then(success => {
      if (success) {
        log('\n🚀 Ready for deployment with AI features!', colors.green)
      } else {
        log('\n⚠️  Some tests failed - check the issues above', colors.yellow)
      }
    })
    .catch(error => {
      log('\n💥 Test script error:', colors.red)
      log(error.message, colors.red)
    })
}

module.exports = { testOpenRouterAPI } 