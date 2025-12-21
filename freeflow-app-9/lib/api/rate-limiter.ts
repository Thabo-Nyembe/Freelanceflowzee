/**
 * In-Memory Rate Limiter
 *
 * Provides rate limiting for API routes using sliding window algorithm
 * Supports IP-based and user-based rate limiting
 *
 * For production, consider using Redis for distributed rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from './response'

// ============================================
// TYPES
// ============================================

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
  /** Key prefix for namespacing */
  prefix?: string
  /** Use IP-based limiting */
  byIp?: boolean
  /** Use user ID-based limiting */
  byUserId?: boolean
  /** Skip rate limiting for certain conditions */
  skip?: (request: NextRequest) => boolean
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number
}

// ============================================
// IN-MEMORY STORE
// ============================================

class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key)
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Singleton store
const store = new RateLimitStore()

// ============================================
// RATE LIMITER IMPLEMENTATION
// ============================================

/**
 * Check rate limit for a given key
 */
function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const resetAt = now + windowMs

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    store.set(key, { count: 1, resetAt })
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: new Date(resetAt)
    }
  }

  if (entry.count >= config.limit) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfter
    }
  }

  // Increment counter
  entry.count++
  store.set(key, entry)

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: new Date(entry.resetAt)
  }
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a hash of user agent
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `ua:${hashString(userAgent)}`
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Build rate limit key from request and config
 */
function buildKey(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): string {
  const parts: string[] = [config.prefix || 'rl']

  if (config.byUserId && userId) {
    parts.push(`user:${userId}`)
  } else if (config.byIp !== false) {
    parts.push(`ip:${getClientId(request)}`)
  }

  // Add endpoint path for endpoint-specific limits
  parts.push(request.nextUrl.pathname)

  return parts.join(':')
}

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Create rate limit middleware for API routes
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(
    request: NextRequest,
    userId?: string
  ): Promise<NextResponse | null> {
    // Check if should skip
    if (config.skip && config.skip(request)) {
      return null
    }

    const key = buildKey(request, config, userId)
    const result = checkRateLimit(key, config)

    if (!result.success) {
      return ApiError.rateLimited(result.retryAfter)
    }

    return null
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString())
  return response
}

/**
 * Rate limit check with response headers
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<{ allowed: boolean; response?: NextResponse; result: RateLimitResult }> {
  const key = buildKey(request, config, userId)
  const result = checkRateLimit(key, config)

  if (!result.success) {
    const response = NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests',
          retryAfter: result.retryAfter
        }
      },
      { status: 429 }
    )
    addRateLimitHeaders(response, result)
    return { allowed: false, response, result }
  }

  return { allowed: true, result }
}

// ============================================
// PRESET CONFIGURATIONS
// ============================================

/** Default rate limit: 100 requests per minute */
export const defaultRateLimit: RateLimitConfig = {
  limit: 100,
  windowSeconds: 60,
  byIp: true
}

/** Strict rate limit: 20 requests per minute (for sensitive endpoints) */
export const strictRateLimit: RateLimitConfig = {
  limit: 20,
  windowSeconds: 60,
  byIp: true
}

/** Auth rate limit: 5 requests per minute (for login/signup) */
export const authRateLimit: RateLimitConfig = {
  limit: 5,
  windowSeconds: 60,
  byIp: true,
  prefix: 'auth'
}

/** API rate limit: 1000 requests per hour (for authenticated API) */
export const apiRateLimit: RateLimitConfig = {
  limit: 1000,
  windowSeconds: 3600,
  byUserId: true,
  prefix: 'api'
}

/** Upload rate limit: 10 uploads per minute */
export const uploadRateLimit: RateLimitConfig = {
  limit: 10,
  windowSeconds: 60,
  byUserId: true,
  prefix: 'upload'
}

/** Search rate limit: 30 searches per minute */
export const searchRateLimit: RateLimitConfig = {
  limit: 30,
  windowSeconds: 60,
  byIp: true,
  prefix: 'search'
}

// ============================================
// HELPER FUNCTION FOR ROUTE HANDLERS
// ============================================

/**
 * Simple rate limit check for route handlers
 * Returns error response if rate limited, null otherwise
 */
export async function checkRouteRateLimit(
  request: NextRequest,
  options: {
    limit?: number
    windowSeconds?: number
    userId?: string
  } = {}
): Promise<NextResponse | null> {
  const config: RateLimitConfig = {
    limit: options.limit || 100,
    windowSeconds: options.windowSeconds || 60,
    byIp: !options.userId,
    byUserId: !!options.userId
  }

  const key = buildKey(request, config, options.userId)
  const result = checkRateLimit(key, config)

  if (!result.success) {
    const response = NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetAt.toISOString()
        }
      }
    )
    return response
  }

  return null
}

// Export store for testing purposes
export { store as rateLimitStore }
