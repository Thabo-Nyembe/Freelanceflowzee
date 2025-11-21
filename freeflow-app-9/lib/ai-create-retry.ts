/**
 * AI CREATE A++++ SMART RETRY LOGIC
 * Automatic retry with exponential backoff for failed generations
 */

export interface RetryConfig {
  maxAttempts: number // Default: 3
  baseDelay: number // Default: 1000ms (1 second)
  maxDelay: number // Default: 10000ms (10 seconds)
  exponentialBase: number // Default: 2 (doubles each time)
  onRetry?: (attempt: number, delay: number, error: Error) => void
  onSuccess?: (attempt: number) => void
  onFailure?: (attempts: number, error: Error) => void
}

export interface RetryState {
  isRetrying: boolean
  currentAttempt: number
  maxAttempts: number
  nextRetryDelay: number
  lastError: Error | null
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBase: 2
}

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  baseDelay: number = 1000,
  exponentialBase: number = 2,
  maxDelay: number = 10000
): number {
  const delay = baseDelay * Math.pow(exponentialBase, attempt)
  return Math.min(delay, maxDelay)
}

/**
 * Execute function with automatic retry logic
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < fullConfig.maxAttempts; attempt++) {
    try {
      // Attempt the operation
      const result = await fn()

      // Success! Call success callback if provided
      if (fullConfig.onSuccess && attempt > 0) {
        fullConfig.onSuccess(attempt + 1)
      }

      return result
    } catch (error) {
      lastError = error as Error

      // If this is not the last attempt, retry
      if (attempt < fullConfig.maxAttempts - 1) {
        const delay = calculateRetryDelay(
          attempt,
          fullConfig.baseDelay,
          fullConfig.exponentialBase,
          fullConfig.maxDelay
        )

        // Call retry callback if provided
        if (fullConfig.onRetry) {
          fullConfig.onRetry(attempt + 1, delay, lastError)
        }

        // Wait before retrying
        await sleep(delay)
      }
    }
  }

  // All attempts failed, call failure callback if provided
  if (fullConfig.onFailure && lastError) {
    fullConfig.onFailure(fullConfig.maxAttempts, lastError)
  }

  // Throw the last error
  throw lastError || new Error('Operation failed after all retry attempts')
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /502/,
    /503/,
    /504/,
    /rate limit/i,
    /too many requests/i
  ]

  const errorMessage = error.message || ''

  return retryablePatterns.some(pattern => pattern.test(errorMessage))
}

/**
 * Retry with conditional logic (only retry if error is retryable)
 */
export async function executeWithSmartRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  return executeWithRetry(async () => {
    try {
      return await fn()
    } catch (error) {
      // If error is not retryable, throw immediately
      if (!isRetryableError(error as Error)) {
        throw error
      }
      throw error
    }
  }, config)
}

/**
 * Create retry state manager (for UI updates)
 */
export function createRetryStateManager() {
  let state: RetryState = {
    isRetrying: false,
    currentAttempt: 0,
    maxAttempts: 3,
    nextRetryDelay: 0,
    lastError: null
  }

  const listeners: Array<(state: RetryState) => void> = []

  return {
    getState: () => ({ ...state }),

    subscribe: (listener: (state: RetryState) => void) => {
      listeners.push(listener)
      return () => {
        const index = listeners.indexOf(listener)
        if (index > -1) listeners.splice(index, 1)
      }
    },

    startRetry: (maxAttempts: number) => {
      state = {
        isRetrying: true,
        currentAttempt: 1,
        maxAttempts,
        nextRetryDelay: 0,
        lastError: null
      }
      listeners.forEach(l => l({ ...state }))
    },

    updateAttempt: (attempt: number, delay: number, error: Error) => {
      state = {
        ...state,
        currentAttempt: attempt,
        nextRetryDelay: delay,
        lastError: error
      }
      listeners.forEach(l => l({ ...state }))
    },

    endRetry: (success: boolean, error?: Error) => {
      state = {
        ...state,
        isRetrying: false,
        lastError: error || null
      }
      listeners.forEach(l => l({ ...state }))
    },

    reset: () => {
      state = {
        isRetrying: false,
        currentAttempt: 0,
        maxAttempts: 3,
        nextRetryDelay: 0,
        lastError: null
      }
      listeners.forEach(l => l({ ...state }))
    }
  }
}

/**
 * Format retry delay for display
 */
export function formatRetryDelay(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.round(ms / 1000)
  if (seconds === 1) return '1 second'
  return `${seconds} seconds`
}

/**
 * Get retry progress percentage
 */
export function getRetryProgress(currentAttempt: number, maxAttempts: number): number {
  if (maxAttempts === 0) return 0
  return Math.round((currentAttempt / maxAttempts) * 100)
}

/**
 * Batch retry for multiple operations
 */
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  config: Partial<RetryConfig> = {}
): Promise<Array<{ success: boolean; result?: T; error?: Error }>> {
  const results = await Promise.allSettled(
    operations.map(op => executeWithRetry(op, config))
  )

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, result: result.value }
    } else {
      return { success: false, error: result.reason }
    }
  })
}

/**
 * Retry with abort controller (for cancellation)
 */
export async function executeWithRetryAndAbort<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  abortController: AbortController,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  return executeWithRetry(async () => {
    if (abortController.signal.aborted) {
      throw new Error('Operation aborted')
    }
    return await fn(abortController.signal)
  }, config)
}

/**
 * Get retry statistics
 */
export interface RetryStats {
  totalAttempts: number
  successfulAttempts: number
  failedAttempts: number
  totalRetries: number
  avgRetriesPerOperation: number
  successRate: number
}

export function calculateRetryStats(
  operations: Array<{ attempts: number; success: boolean }>
): RetryStats {
  const totalAttempts = operations.reduce((sum, op) => sum + op.attempts, 0)
  const successfulAttempts = operations.filter(op => op.success).length
  const failedAttempts = operations.length - successfulAttempts
  const totalRetries = operations.reduce((sum, op) => sum + Math.max(0, op.attempts - 1), 0)

  return {
    totalAttempts,
    successfulAttempts,
    failedAttempts,
    totalRetries,
    avgRetriesPerOperation: operations.length > 0 ? totalRetries / operations.length : 0,
    successRate: operations.length > 0 ? (successfulAttempts / operations.length) * 100 : 0
  }
}
