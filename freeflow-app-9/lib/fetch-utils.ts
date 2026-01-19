// Fetch utilities with authentication and error handling

import { createClient } from '@/lib/supabase/client'

export interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface FetchResponse<T = unknown> {
  data: T | null
  error: string | null
  status: number
}

/**
 * Fetch with authentication token
 */
export async function fetchWithAuth<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(fetchOptions.headers)

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  let lastError: string | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        return {
          data: null,
          error: errorText || `HTTP ${response.status}`,
          status: response.status,
        }
      }

      const contentType = response.headers.get('content-type')
      let data: T | null = null

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = (await response.text()) as unknown as T
      }

      return {
        data,
        error: null,
        status: response.status,
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error'

      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  clearTimeout(timeoutId)

  return {
    data: null,
    error: lastError || 'Request failed',
    status: 0,
  }
}

/**
 * POST request with authentication
 */
export async function postWithAuth<T = unknown>(
  url: string,
  body: unknown,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * PUT request with authentication
 */
export async function putWithAuth<T = unknown>(
  url: string,
  body: unknown,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/**
 * DELETE request with authentication
 */
export async function deleteWithAuth<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'DELETE',
  })
}

/**
 * PATCH request with authentication
 */
export async function patchWithAuth<T = unknown>(
  url: string,
  body: unknown,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  return fetchWithAuth<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
