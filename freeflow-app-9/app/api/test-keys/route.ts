import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

export async function GET() {
  const results: any[] = []

  // Test OpenAI
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      results.push({
        service: 'OpenAI (GPT-4, DALL-E)',
        status: 'missing',
        message: 'API key not found in environment'
      })
    } else {
      const openai = new OpenAI({ apiKey })
      await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      })
      results.push({
        service: 'OpenAI (GPT-4, DALL-E)',
        status: 'working',
        message: 'Successfully connected',
        key: apiKey.substring(0, 15) + '...'
      })
    }
  } catch (error) {
    results.push({
      service: 'OpenAI (GPT-4, DALL-E)',
      status: error.status === 401 || error.message?.includes('Incorrect API key') ? 'invalid' : 'error',
      message: error.message || 'Connection failed',
      error: error.toString().substring(0, 200)
    })
  }

  // Test Google AI
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      results.push({
        service: 'Google AI (Gemini)',
        status: 'missing',
        message: 'API key not found in environment'
      })
    } else {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'test' }] }]
          })
        }
      )

      if (response.ok) {
        results.push({
          service: 'Google AI (Gemini)',
          status: 'working',
          message: 'Successfully connected',
          key: apiKey.substring(0, 15) + '...'
        })
      } else {
        const errorText = await response.text()
        results.push({
          service: 'Google AI (Gemini)',
          status: response.status === 400 && errorText.includes('API_KEY_INVALID') ? 'invalid' : 'error',
          message: `HTTP ${response.status}`,
          error: errorText.substring(0, 200)
        })
      }
    }
  } catch (error) {
    results.push({
      service: 'Google AI (Gemini)',
      status: 'error',
      message: error.message || 'Connection failed'
    })
  }

  // Test OpenRouter
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      results.push({
        service: 'OpenRouter (Claude, Llama)',
        status: 'missing',
        message: 'API key not found in environment'
      })
    } else {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:9323'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      })

      if (response.ok) {
        results.push({
          service: 'OpenRouter (Claude, Llama)',
          status: 'working',
          message: 'Successfully connected',
          key: apiKey.substring(0, 15) + '...'
        })
      } else {
        results.push({
          service: 'OpenRouter (Claude, Llama)',
          status: response.status === 401 ? 'invalid' : 'error',
          message: `HTTP ${response.status}`
        })
      }
    }
  } catch (error) {
    results.push({
      service: 'OpenRouter (Claude, Llama)',
      status: 'error',
      message: error.message || 'Connection failed'
    })
  }

  // Test Stripe
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      results.push({
        service: 'Stripe (Payments)',
        status: 'missing',
        message: 'API key not found in environment'
      })
    } else {
      const response = await fetch('https://api.stripe.com/v1/customers?limit=1', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })

      if (response.ok) {
        results.push({
          service: 'Stripe (Payments)',
          status: 'working',
          message: 'Successfully connected',
          key: apiKey.substring(0, 15) + '...'
        })
      } else {
        results.push({
          service: 'Stripe (Payments)',
          status: response.status === 401 ? 'invalid' : 'error',
          message: `HTTP ${response.status}`
        })
      }
    }
  } catch (error) {
    results.push({
      service: 'Stripe (Payments)',
      status: 'error',
      message: error.message || 'Connection failed'
    })
  }

  // Test Supabase
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      results.push({
        service: 'Supabase (Database)',
        status: 'missing',
        message: 'Credentials not found'
      })
    } else {
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      })

      if (response.ok || response.status === 404) {
        results.push({
          service: 'Supabase (Database)',
          status: 'working',
          message: 'Successfully connected',
          url: url
        })
      } else {
        results.push({
          service: 'Supabase (Database)',
          status: response.status === 401 ? 'invalid' : 'error',
          message: `HTTP ${response.status}`
        })
      }
    }
  } catch (error) {
    results.push({
      service: 'Supabase (Database)',
      status: 'error',
      message: error.message || 'Connection failed'
    })
  }

  // Check Wasabi/S3
  const wasabiKey = process.env.WASABI_ACCESS_KEY_ID
  const wasabiSecret = process.env.WASABI_SECRET_ACCESS_KEY
  results.push({
    service: 'Wasabi/S3 (File Storage)',
    status: wasabiKey && wasabiSecret ? 'configured' : 'missing',
    message: wasabiKey && wasabiSecret ? 'Credentials found (not tested - requires S3 client)' : 'Credentials not found',
    key: wasabiKey ? wasabiKey.substring(0, 15) + '...' : undefined
  })

  // Summary
  const working = results.filter(r => r.status === 'working').length
  const configured = results.filter(r => r.status === 'configured').length
  const invalid = results.filter(r => r.status === 'invalid')
  const missing = results.filter(r => r.status === 'missing')

  return NextResponse.json({
    summary: {
      total: results.length,
      working: working + configured,
      invalid: invalid.length,
      missing: missing.length
    },
    results,
    needsAttention: [...invalid, ...missing]
  })
}
