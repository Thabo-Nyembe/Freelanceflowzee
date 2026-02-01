/**
 * API Client Utility with Error Handling
 *
 * Provides a centralized API client with:
 * - Automatic error handling
 * - Retry logic
 * - Timeout support
 * - Mock data fallback for development
 * - Logging
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('APIClient')

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  fallbackData?: any
  silentFail?: boolean
}

/**
 * Enhanced fetch with error handling and retries
 */
export async function apiFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const {
    timeout = 10000,
    retries = 1,
    fallbackData = null,
    silentFail = false,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      logger.debug('API request', { url, attempt: attempt + 1, maxRetries: retries + 1 })

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Parse response
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        logger.debug('API success', { url, status: response.status })

        return {
          success: true,
          data: data.data || data,
          message: data.message
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId)

        if (fetchError.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`)
        }

        throw fetchError
      }

    } catch (error) {
      lastError = error

      logger.warn('API request failed', {
        url,
        attempt: attempt + 1,
        maxRetries: retries + 1,
        error: error.message
      })

      // Don't retry on certain errors
      if (error.message.includes('404') || error.message.includes('401')) {
        break
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // All retries failed
  logger.error('API request failed after all retries', {
    url,
    error: lastError?.message,
    retriesAttempted: retries + 1
  })

  // Return fallback data if available
  if (fallbackData !== null) {
    logger.info('Using fallback data', { url })
    return {
      success: true,
      data: fallbackData,
      message: 'Using cached/mock data'
    }
  }

  // Return error response
  if (silentFail) {
    return {
      success: false,
      error: lastError?.message || 'Request failed'
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Request failed',
    data: undefined
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'GET',
  })
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'DELETE',
  })
}

/**
 * Batch multiple API requests
 */
export async function apiBatch<T = any>(
  requests: Array<{ url: string; options?: FetchOptions }>
): Promise<Array<APIResponse<T>>> {
  logger.debug('Batch API request', { count: requests.length })

  const results = await Promise.all(
    requests.map(({ url, options }) => apiFetch<T>(url, { ...options, silentFail: true }))
  )

  const successCount = results.filter(r => r.success).length
  logger.debug('Batch API complete', {
    total: requests.length,
    success: successCount,
    failed: requests.length - successCount
  })

  return results
}
