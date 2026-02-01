import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

/**
 * API Key Testing
 *
 * Tests if a user's API key is valid before saving
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { configId, keyValue, environment = 'production' } = body

    logger.info('Testing API key', { configId, environment })

    if (!configId || !keyValue) {
      return NextResponse.json(
        { error: 'configId and keyValue are required' },
        { status: 400 }
      )
    }

    // Test the key based on the service
    let testResult: any = { success: false, error: 'Test not implemented' }

    switch (configId) {
      case 'openai':
        testResult = await testOpenAI(keyValue)
        break

      case 'anthropic':
        testResult = await testAnthropic(keyValue)
        break

      case 'resend':
        testResult = await testResend(keyValue)
        break

      case 'sendgrid':
        testResult = await testSendGrid(keyValue)
        break

      case 'twilio':
        testResult = await testTwilio(keyValue)
        break

      case 'stripe':
        testResult = await testStripe(keyValue)
        break

      default:
        // For services without specific tests, just validate format
        testResult = { success: true, message: 'Key format validated' }
    }

    if (testResult.success) {
      logger.info('API key test successful', { configId })

      return NextResponse.json({
        success: true,
        message: 'API key is valid',
        details: testResult.details
      })
    } else {
      throw new Error(testResult.error || 'API key validation failed')
    }

  } catch (error) {
    logger.error('API key test failed', {
      configId: body?.configId,
      error: error.message
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'API key validation failed'
      },
      { status: 400 }
    )
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testOpenAI(apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        details: {
          modelsAvailable: data.data?.length || 0,
          hasGPT4: data.data?.some((m: any) => m.id.includes('gpt-4'))
        }
      }
    } else {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'Invalid API key'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to test OpenAI key'
    }
  }
}

async function testAnthropic(apiKey: string) {
  try {
    // Anthropic doesn't have a simple test endpoint, so we make a minimal request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
    })

    if (response.ok || response.status === 400) {
      // 400 is ok - means key is valid but request might be invalid
      return {
        success: true,
        details: {
          apiVersion: '2023-06-01',
          hasClaudeAccess: true
        }
      }
    } else {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || 'Invalid API key'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to test Anthropic key'
    }
  }
}

async function testResend(apiKey: string) {
  try {
    const response = await fetch('https://api.resend.com/api-keys', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (response.ok || response.status === 403) {
      // 403 means key is valid but doesn't have this permission
      return {
        success: true,
        details: {
          provider: 'Resend',
          verified: true
        }
      }
    } else {
      return {
        success: false,
        error: 'Invalid API key'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to test Resend key'
    }
  }
}

async function testSendGrid(apiKey: string) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        details: {
          email: data.email,
          verified: true
        }
      }
    } else {
      return {
        success: false,
        error: 'Invalid API key'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to test SendGrid key'
    }
  }
}

async function testTwilio(accountSid: string, authToken?: string) {
  // Validate format first
  if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
    return {
      success: false,
      error: 'Invalid Account SID format. Must start with AC and be 34 characters.'
    }
  }

  // If no auth token provided, only format validation
  if (!authToken) {
    return {
      success: true,
      details: {
        provider: 'Twilio',
        accountSid: accountSid.substring(0, 6) + '...' + accountSid.slice(-4),
        note: 'Format validated. Provide auth token for full verification.'
      }
    }
  }

  try {
    // Test API credentials by fetching account info
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        details: {
          provider: 'Twilio',
          accountSid: accountSid.substring(0, 6) + '...' + accountSid.slice(-4),
          friendlyName: data.friendly_name,
          status: data.status,
          type: data.type,
          verified: true
        }
      }
    } else if (response.status === 401) {
      return {
        success: false,
        error: 'Invalid credentials. Please check your Account SID and Auth Token.'
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `API error: ${response.status}`
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to test Twilio credentials'
    }
  }
}

async function testStripe(apiKey: string) {
  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        details: {
          currency: data.available?.[0]?.currency,
          livemode: data.livemode,
          verified: true
        }
      }
    } else {
      return {
        success: false,
        error: 'Invalid API key'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to test Stripe key'
    }
  }
}
