// API Key Test Script
import OpenAI from 'openai'

interface TestResult {
  service: string
  key: string
  status: 'working' | 'expired' | 'invalid' | 'error'
  message: string
  error?: string
}

const results: TestResult[] = []

// Test OpenAI
async function testOpenAI() {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      results.push({
        service: 'OpenAI',
        key: 'Not found',
        status: 'error',
        message: 'API key not found in environment'
      })
      return
    }

    const openai = new OpenAI({ apiKey })
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "test successful"' }],
      max_tokens: 10
    })

    results.push({
      service: 'OpenAI',
      key: apiKey.substring(0, 10) + '...',
      status: 'working',
      message: 'Successfully connected to OpenAI API'
    })
  } catch (error: any) {
    results.push({
      service: 'OpenAI',
      key: process.env.OPENAI_API_KEY?.substring(0, 10) + '...' || 'N/A',
      status: error.status === 401 ? 'invalid' : 'error',
      message: error.message || 'Unknown error',
      error: error.toString()
    })
  }
}

// Test Google AI (Gemini)
async function testGoogleAI() {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      results.push({
        service: 'Google AI (Gemini)',
        key: 'Not found',
        status: 'error',
        message: 'API key not found in environment'
      })
      return
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "test successful"' }] }]
        })
      }
    )

    if (response.ok) {
      results.push({
        service: 'Google AI (Gemini)',
        key: apiKey.substring(0, 10) + '...',
        status: 'working',
        message: 'Successfully connected to Google AI API'
      })
    } else {
      const error = await response.text()
      results.push({
        service: 'Google AI (Gemini)',
        key: apiKey.substring(0, 10) + '...',
        status: response.status === 401 ? 'invalid' : 'error',
        message: `HTTP ${response.status}`,
        error
      })
    }
  } catch (error: any) {
    results.push({
      service: 'Google AI (Gemini)',
      key: process.env.GOOGLE_AI_API_KEY?.substring(0, 10) + '...' || 'N/A',
      status: 'error',
      message: error.message || 'Unknown error',
      error: error.toString()
    })
  }
}

// Test OpenRouter
async function testOpenRouter() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      results.push({
        service: 'OpenRouter (Claude)',
        key: 'Not found',
        status: 'error',
        message: 'API key not found in environment'
      })
      return
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:9323',
        'X-Title': 'KAZI Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: 'Say "test successful"' }],
        max_tokens: 10
      })
    })

    if (response.ok) {
      results.push({
        service: 'OpenRouter (Claude)',
        key: apiKey.substring(0, 10) + '...',
        status: 'working',
        message: 'Successfully connected to OpenRouter API'
      })
    } else {
      const error = await response.text()
      results.push({
        service: 'OpenRouter (Claude)',
        key: apiKey.substring(0, 10) + '...',
        status: response.status === 401 ? 'invalid' : 'error',
        message: `HTTP ${response.status}`,
        error
      })
    }
  } catch (error: any) {
    results.push({
      service: 'OpenRouter (Claude)',
      key: process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...' || 'N/A',
      status: 'error',
      message: error.message || 'Unknown error',
      error: error.toString()
    })
  }
}

// Test Stripe
async function testStripe() {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      results.push({
        service: 'Stripe',
        key: 'Not found',
        status: 'error',
        message: 'API key not found in environment'
      })
      return
    }

    const response = await fetch('https://api.stripe.com/v1/customers?limit=1', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (response.ok) {
      results.push({
        service: 'Stripe',
        key: apiKey.substring(0, 10) + '...',
        status: 'working',
        message: 'Successfully connected to Stripe API'
      })
    } else {
      results.push({
        service: 'Stripe',
        key: apiKey.substring(0, 10) + '...',
        status: response.status === 401 ? 'invalid' : 'error',
        message: `HTTP ${response.status}`
      })
    }
  } catch (error: any) {
    results.push({
      service: 'Stripe',
      key: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...' || 'N/A',
      status: 'error',
      message: error.message || 'Unknown error',
      error: error.toString()
    })
  }
}

// Test Supabase
async function testSupabase() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      results.push({
        service: 'Supabase',
        key: 'Not found',
        status: 'error',
        message: 'Supabase credentials not found'
      })
      return
    }

    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    })

    if (response.ok || response.status === 404) {
      results.push({
        service: 'Supabase',
        key: key.substring(0, 10) + '...',
        status: 'working',
        message: 'Successfully connected to Supabase'
      })
    } else {
      results.push({
        service: 'Supabase',
        key: key.substring(0, 10) + '...',
        status: response.status === 401 ? 'invalid' : 'error',
        message: `HTTP ${response.status}`
      })
    }
  } catch (error: any) {
    results.push({
      service: 'Supabase',
      key: 'N/A',
      status: 'error',
      message: error.message || 'Unknown error',
      error: error.toString()
    })
  }
}

// Run all tests
async function runTests() {
  console.log('🔍 Testing API Keys...\n')

  await testOpenAI()
  await testGoogleAI()
  await testOpenRouter()
  await testStripe()
  await testSupabase()

  console.log('\n📊 API Key Test Results:\n')
  console.log('─'.repeat(80))

  results.forEach(result => {
    const icon = result.status === 'working' ? '✅' :
                 result.status === 'invalid' ? '❌' :
                 result.status === 'expired' ? '⏰' : '⚠️'

    console.log(`${icon} ${result.service}`)
    console.log(`   Status: ${result.status.toUpperCase()}`)
    console.log(`   Key: ${result.key}`)
    console.log(`   Message: ${result.message}`)
    if (result.error) {
      console.log(`   Error: ${result.error.substring(0, 100)}...`)
    }
    console.log('─'.repeat(80))
  })

  // Summary
  const working = results.filter(r => r.status === 'working').length
  const total = results.length
  console.log(`\n📈 Summary: ${working}/${total} services working`)

  // List services that need new keys
  const needsNewKeys = results.filter(r => r.status !== 'working')
  if (needsNewKeys.length > 0) {
    console.log('\n🔑 Services that need new API keys:')
    needsNewKeys.forEach(r => {
      console.log(`   • ${r.service} - ${r.message}`)
    })
  }

  return results
}

// Export for use in API route
export { runTests, TestResult }
