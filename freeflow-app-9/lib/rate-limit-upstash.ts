/**
 * KAZI Production Rate Limiter
 *
 * A comprehensive rate limiting system using Upstash Redis
 * with support for different tiers, endpoints, and sliding windows.
 *
 * Features:
 * - Sliding window rate limiting
 * - Per-user and per-IP limits
 * - Tier-based limits (free, starter, pro, enterprise)
 * - Per-endpoint customization
 * - Analytics and monitoring
 * - Graceful fallback to in-memory
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Types
export type RateLimitTier = 'free' | 'starter' | 'professional' | 'enterprise' | 'unlimited'

export interface RateLimitConfig {
  requests: number
  window: string // e.g., '1m', '1h', '1d'
  windowMs?: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export interface RateLimitContext {
  userId?: string
  ip?: string
  tier?: RateLimitTier
  endpoint?: string
}

// Tier-based limits
const TIER_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
  free: { requests: 100, window: '1h' },
  starter: { requests: 500, window: '1h' },
  professional: { requests: 2000, window: '1h' },
  enterprise: { requests: 10000, window: '1h' },
  unlimited: { requests: 100000, window: '1h' }
}

// Endpoint-specific limits (overrides tier limits for specific endpoints)
const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  // AI endpoints (more expensive)
  '/api/ai/chat': { requests: 50, window: '1h' },
  '/api/ai/generate-image': { requests: 20, window: '1h' },
  '/api/ai/content-generation': { requests: 30, window: '1h' },
  '/api/ai/comprehensive': { requests: 100, window: '1h' },

  // Auth endpoints (stricter for security)
  '/api/auth/signup': { requests: 10, window: '1h' },
  '/api/auth/login': { requests: 20, window: '15m' },
  '/api/auth/forgot-password': { requests: 5, window: '1h' },

  // File uploads (resource intensive)
  '/api/files/upload': { requests: 100, window: '1h' },
  '/api/files/upload/chunked': { requests: 500, window: '1h' },

  // Webhooks (higher limits for integrations)
  '/api/payments/webhooks': { requests: 1000, window: '1h' },
  '/api/webhooks': { requests: 500, window: '1h' },

  // Public endpoints (stricter)
  '/api/public': { requests: 50, window: '1h' }
}

// Initialize Redis client (with fallback)
let redis: Redis | null = null
let ratelimit: Ratelimit | null = null

function initializeRedis(): boolean {
  if (redis) return true

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn('[RateLimit] Upstash Redis not configured, using in-memory fallback')
    return false
  }

  try {
    redis = new Redis({ url, token })
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1h'),
      analytics: true,
      prefix: 'kazi:ratelimit'
    })
    console.log('[RateLimit] Upstash Redis initialized successfully')
    return true
  } catch (error) {
    console.error('[RateLimit] Failed to initialize Upstash Redis:', error)
    return false
  }
}

// In-memory fallback
const inMemoryStore = new Map<string, { count: number; reset: number }>()

function inMemoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const windowKey = Math.floor(now / windowMs)
  const key = `${identifier}:${windowKey}`

  const current = inMemoryStore.get(key) || { count: 0, reset: (windowKey + 1) * windowMs }

  if (current.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: current.reset,
      retryAfter: Math.ceil((current.reset - now) / 1000)
    }
  }

  current.count++
  inMemoryStore.set(key, current)

  // Cleanup old entries
  if (inMemoryStore.size > 10000) {
    const cutoff = windowKey - 10
    for (const [k] of inMemoryStore) {
      const keyWindow = parseInt(k.split(':').pop() || '0')
      if (keyWindow < cutoff) {
        inMemoryStore.delete(k)
      }
    }
  }

  return {
    success: true,
    limit,
    remaining: limit - current.count,
    reset: current.reset
  }
}

// Parse window string to milliseconds
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/)
  if (!match) return 60000 // Default to 1 minute

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 's': return value * 1000
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    default: return 60000
  }
}

/**
 * Main rate limit function
 */
export async function checkRateLimit(context: RateLimitContext): Promise<RateLimitResult> {
  const { userId, ip, tier = 'free', endpoint } = context

  // Determine identifier
  const identifier = userId || ip || 'anonymous'

  // Get applicable limit
  let config: RateLimitConfig

  // Check for endpoint-specific limits
  if (endpoint && ENDPOINT_LIMITS[endpoint]) {
    config = ENDPOINT_LIMITS[endpoint]
  } else {
    config = TIER_LIMITS[tier]
  }

  // Apply tier multiplier for paid tiers on endpoint limits
  if (endpoint && ENDPOINT_LIMITS[endpoint] && tier !== 'free') {
    const tierMultiplier = {
      starter: 2,
      professional: 5,
      enterprise: 20,
      unlimited: 100
    }
    config = {
      ...config,
      requests: config.requests * (tierMultiplier[tier] || 1)
    }
  }

  const windowMs = parseWindow(config.window)
  const key = endpoint ? `${identifier}:${endpoint}` : identifier

  // Try Upstash Redis first
  if (initializeRedis() && ratelimit) {
    try {
      const result = await ratelimit.limit(key)

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000)
      }
    } catch (error) {
      console.error('[RateLimit] Upstash error, falling back to in-memory:', error)
    }
  }

  // Fallback to in-memory
  return inMemoryRateLimit(key, config.requests, windowMs)
}

/**
 * Create a rate limiter for specific use cases
 */
export function createRateLimiter(config: RateLimitConfig) {
  const windowMs = parseWindow(config.window)

  return async (identifier: string): Promise<RateLimitResult> => {
    if (initializeRedis() && redis) {
      try {
        const limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.requests, config.window as any),
          prefix: 'kazi:custom'
        })

        const result = await limiter.limit(identifier)
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset
        }
      } catch (error) {
        console.error('[RateLimit] Custom limiter error:', error)
      }
    }

    return inMemoryRateLimit(identifier, config.requests, windowMs)
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  options?: {
    tier?: RateLimitTier
    customLimit?: RateLimitConfig
  }
) {
  return async (req: Request): Promise<Response> => {
    // Extract identifier
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    // Get user ID from authorization header or cookie
    const authHeader = req.headers.get('authorization')
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 36) : undefined

    // Get endpoint
    const url = new URL(req.url)
    const endpoint = url.pathname

    // Check rate limit
    const result = await checkRateLimit({
      userId,
      ip,
      tier: options?.tier || 'free',
      endpoint
    })

    // Add rate limit headers to response
    const addRateLimitHeaders = (response: Response): Response => {
      const headers = new Headers(response.headers)
      headers.set('X-RateLimit-Limit', result.limit.toString())
      headers.set('X-RateLimit-Remaining', result.remaining.toString())
      headers.set('X-RateLimit-Reset', result.reset.toString())

      if (!result.success && result.retryAfter) {
        headers.set('Retry-After', result.retryAfter.toString())
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })
    }

    if (!result.success) {
      return addRateLimitHeaders(
        new Response(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: result.retryAfter
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      )
    }

    // Call the handler and add rate limit headers
    const response = await handler(req)
    return addRateLimitHeaders(response)
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Standard API calls
  api: createRateLimiter({ requests: 100, window: '1m' }),

  // Authentication endpoints
  auth: createRateLimiter({ requests: 10, window: '15m' }),

  // AI operations
  ai: createRateLimiter({ requests: 20, window: '1h' }),

  // File uploads
  upload: createRateLimiter({ requests: 50, window: '1h' }),

  // Webhooks
  webhook: createRateLimiter({ requests: 1000, window: '1h' }),

  // Search operations
  search: createRateLimiter({ requests: 60, window: '1m' }),

  // Export operations
  export: createRateLimiter({ requests: 10, window: '1h' })
}

/**
 * Get rate limit analytics (if using Upstash)
 */
export async function getRateLimitAnalytics(identifier?: string): Promise<{
  totalRequests: number
  blockedRequests: number
  topEndpoints: Array<{ endpoint: string; count: number }>
} | null> {
  if (!initializeRedis() || !redis) {
    return null
  }

  try {
    // This is a simplified version - Upstash provides more detailed analytics
    const analytics = await redis.get(`kazi:analytics:${identifier || 'global'}`)
    return analytics as any || null
  } catch (error) {
    console.error('[RateLimit] Failed to get analytics:', error)
    return null
  }
}

// Export for use in middleware
export { TIER_LIMITS, ENDPOINT_LIMITS }
