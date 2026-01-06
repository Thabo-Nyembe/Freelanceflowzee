export interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

const tokens = new Map<string, { count: number; reset: number }>()

// Original factory function
export function createRateLimiter(options: RateLimitOptions) {
  return (identifier: string): RateLimitResult => {
    const now = Date.now()
    const window = Math.floor(now / options.interval)
    const key = `${identifier}:${window}`

    const current = tokens.get(key) || { count: 0, reset: (window + 1) * options.interval }

    if (current.count >= options.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: options.uniqueTokenPerInterval,
        remaining: 0,
        reset: current.reset,
        retryAfter: Math.ceil((current.reset - now) / 1000)
      }
    }

    current.count++
    tokens.set(key, current)

    // Clean up old tokens
    if (tokens.size > 1000) {
      const cutoff = window - 10
      for (const [k] of tokens) {
        if (parseInt(k.split(':')[1]) < cutoff) {
          tokens.delete(k)
        }
      }
    }

    return {
      success: true,
      limit: options.uniqueTokenPerInterval,
      remaining: options.uniqueTokenPerInterval - current.count,
      reset: current.reset
    }
  }
}

// Simple async rate limit function for API routes
export async function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now()
  const window = Math.floor(now / windowMs)
  const key = `${identifier}:${window}`

  const current = tokens.get(key) || { count: 0, reset: now + windowMs }

  if (current.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: current.reset,
      retryAfter: Math.ceil((current.reset - now) / 1000)
    }
  }

  current.count++
  tokens.set(key, current)

  // Clean up old tokens
  if (tokens.size > 1000) {
    const cutoff = window - 10
    for (const [k] of tokens) {
      if (parseInt(k.split(':')[1]) < cutoff) {
        tokens.delete(k)
      }
    }
  }

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - current.count,
    reset: current.reset
  }
}