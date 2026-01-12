import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface ApiContext {
  userId: string
  apiKeyId: string
  permissions: string[]
  rateLimit: number
  rateLimitRemaining: number
}

/**
 * Validates an API key from the Authorization header
 * Returns the user context if valid, or an error response
 */
export async function validateApiKey(request: NextRequest): Promise<{ context?: ApiContext; error?: NextResponse }> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Use: Bearer <api_key>' },
        { status: 401 }
      )
    }
  }

  const apiKey = authHeader.replace('Bearer ', '')

  // Validate key format
  if (!apiKey.startsWith('sk_') && !apiKey.startsWith('kazi_')) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 }
      )
    }
  }

  const supabase = await createClient()

  // Hash the key to compare with stored hash
  const keyHash = Buffer.from(apiKey).toString('base64')

  // Look up the API key
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .is('deleted_at', null)
    .single()

  if (keyError || !keyData) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }
  }

  // Check key status
  if (keyData.status !== 'active') {
    return {
      error: NextResponse.json(
        { error: `API key is ${keyData.status}` },
        { status: 403 }
      )
    }
  }

  // Check expiration
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return {
      error: NextResponse.json(
        { error: 'API key has expired' },
        { status: 403 }
      )
    }
  }

  // Check rate limit
  const { data: rateLimitData } = await supabase
    .from('rate_limit_tiers')
    .select('*')
    .eq('user_id', keyData.user_id)
    .single()

  let rateLimitRemaining = keyData.rate_limit_per_hour || 1000

  if (rateLimitData) {
    const now = new Date()
    const resetAt = new Date(rateLimitData.reset_at)

    if (now > resetAt) {
      // Reset the counter
      await supabase
        .from('rate_limit_tiers')
        .update({
          requests_used: 1,
          reset_at: new Date(now.getTime() + 3600000).toISOString()
        })
        .eq('id', rateLimitData.id)

      rateLimitRemaining = rateLimitData.requests_limit - 1
    } else if (rateLimitData.requests_limit > 0 && rateLimitData.requests_used >= rateLimitData.requests_limit) {
      return {
        error: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            resetAt: rateLimitData.reset_at,
            limit: rateLimitData.requests_limit
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(rateLimitData.requests_limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitData.reset_at
            }
          }
        )
      }
    } else {
      // Increment usage
      await supabase
        .from('rate_limit_tiers')
        .update({ requests_used: rateLimitData.requests_used + 1 })
        .eq('id', rateLimitData.id)

      rateLimitRemaining = rateLimitData.requests_limit - rateLimitData.requests_used - 1
    }
  }

  // Update API key usage stats
  await supabase
    .from('api_keys')
    .update({
      total_requests: (keyData.total_requests || 0) + 1,
      requests_today: (keyData.requests_today || 0) + 1,
      last_used_at: new Date().toISOString(),
      last_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })
    .eq('id', keyData.id)

  return {
    context: {
      userId: keyData.user_id,
      apiKeyId: keyData.id,
      permissions: keyData.scopes || [keyData.permission],
      rateLimit: keyData.rate_limit_per_hour || 1000,
      rateLimitRemaining
    }
  }
}

/**
 * Checks if the API context has the required permission
 */
export function hasPermission(context: ApiContext, required: string | string[]): boolean {
  const requiredPerms = Array.isArray(required) ? required : [required]

  // Admin and full-access have all permissions
  if (context.permissions.includes('admin') || context.permissions.includes('full-access')) {
    return true
  }

  return requiredPerms.some(p => context.permissions.includes(p))
}

/**
 * Creates a response with rate limit headers
 */
export function withRateLimitHeaders(response: NextResponse, context: ApiContext): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(context.rateLimit))
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, context.rateLimitRemaining)))
  return response
}

/**
 * Logs an API request for analytics
 */
export async function logApiRequest(
  context: ApiContext,
  request: NextRequest,
  statusCode: number,
  latencyMs: number,
  errorMessage?: string
) {
  const supabase = await createClient()

  await supabase.from('api_request_logs').insert({
    user_id: context.userId,
    api_key_id: context.apiKeyId,
    method: request.method,
    path: request.nextUrl.pathname,
    status_code: statusCode,
    latency_ms: latencyMs,
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    user_agent: request.headers.get('user-agent'),
    error_message: errorMessage
  })
}
