export interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const tokens = new Map<string, { count: number; reset: number }>()

export function rateLimit(options: RateLimitOptions) {
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
        reset: current.reset
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