/**
 * API Configuration
 * Centralized configuration for API timeouts and performance settings
 */

export const API_CONFIG = {
  // Request timeouts (in milliseconds)
  TIMEOUTS: {
    DEFAULT: 30000, // 30 seconds
    LONG_RUNNING: 60000, // 60 seconds for heavy operations
    QUICK: 10000, // 10 seconds for fast operations
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
  },

  // Cache configuration
  CACHE: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 100,
    MAX_CONCURRENT_REQUESTS: 10,
  },
} as const

/**
 * Create a fetch wrapper with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = API_CONFIG.TIMEOUTS.DEFAULT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`)
    }
    throw error
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY.MAX_ATTEMPTS,
  backoffMs: number = API_CONFIG.RETRY.BACKOFF_MS
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxAttempts) {
        const delay = backoffMs * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('All retry attempts failed')
}
