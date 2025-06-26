#!/usr/bin/env node

/**
 * Direct OpenRouter API Test
 * Tests OpenRouter integration directly without requiring dev server
 */

require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

async function testOpenRouterDirect() {
  log('\n🤖 Direct OpenRouter API Test', colors.cyan);
  log('=' .repeat(40), colors.cyan);

  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    log('❌ OPENROUTER_API_KEY not found in environment', colors.red);
    return false;
  }

  if (apiKey === 'your_openrouter_key_here') {
    log('❌ API key is still placeholder value', colors.red);
    return false;
  }

  log(`✅ API Key found: ${apiKey.substring(0, 20)}...`, colors.green);

  try {
    // Test 1: Connection Test
    log('\n🔗 Testing OpenRouter Connection...', colors.yellow);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'FreeflowZee AI Assistant Test'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for FreeflowZee platform.'
          },
          {
            role: 'user',
            content: 'Please respond with: "OpenRouter connection successful for FreeflowZee!"'
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log(`❌ OpenRouter API Error: ${response.status}`, colors.red);
      log(`Error details: ${errorText.substring(0, 200)}...`, colors.red);
      return false;
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const aiResponse = data.choices[0].message.content;
      log('✅ OpenRouter API Connection Successful!', colors.green);
      log(`💬 AI Response: "${aiResponse}"`, colors.green);
      
      // Test 2: Get Available Models
      log('\n🎯 Testing Available Models...', colors.yellow);
      const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const modelCount = modelsData.data ? modelsData.data.length : 0;
        log(`✅ Found ${modelCount} available models`, colors.green);
        
        if (modelsData.data && modelsData.data.length > 0) {
          log('📋 Sample models:', colors.green);
          modelsData.data.slice(0, 3).forEach(model => {
            log(`   • ${model.name || model.id}`, colors.green);
          });
        }
      }

      log('\n🎉 OpenRouter Integration Test PASSED!', colors.cyan);
      log('=' .repeat(40), colors.cyan);
      log('✨ Your FreeflowZee app now has AI capabilities!', colors.green);
      log('🚀 Ready for deployment with OpenRouter AI!', colors.green);
      
      return true;
    } else {
      log('❌ Invalid response from OpenRouter API', colors.red);
      return false;
    }

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
    
    if (error.message.includes('fetch')) {
      log('💡 This might be a network connectivity issue', colors.yellow);
    }
    
    return false;
  }
}

// Test environment setup
function testEnvironmentSetup() {
  log('\n🔧 Environment Setup Check', colors.cyan);
  log('-'.repeat(30), colors.cyan);
  
  const requiredEnvVars = [
    'OPENROUTER_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  let allGood = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log(`✅ ${envVar}: Set`, colors.green);
    } else {
      log(`❌ ${envVar}: Missing`, colors.red);
      allGood = false;
    }
  }
  
  return allGood;
}

// Run tests
async function runTests() {
  log('🤖 FreeflowZee OpenRouter Integration Test', colors.cyan);
  log('='.repeat(50), colors.cyan);
  
  const envOk = testEnvironmentSetup();
  
  if (!envOk) {
    log('\n❌ Environment setup incomplete', colors.red);
    return;
  }
  
  const success = await testOpenRouterDirect();
  
  if (success) {
    log('\n🎯 NEXT STEPS:', colors.cyan);
    log('1. Your OpenRouter API is working perfectly!', colors.green);
    log('2. You can now deploy to production', colors.green);
    log('3. AI features will be available in your app', colors.green);
  } else {
    log('\n⚠️  Please check the errors above', colors.yellow);
    log('If issues persist, verify your API key is correct', colors.yellow);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { testOpenRouterDirect }; 