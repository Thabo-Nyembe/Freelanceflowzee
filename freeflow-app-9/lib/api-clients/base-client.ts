/**
 * Base API Client
 *
 * Provides typed API client with error handling, loading states,
 * and integration with TanStack Query
 *
 * Inspired by world-class SaaS platforms:
 * - https://github.com/ixartz/SaaS-Boilerplate
 * - https://github.com/mickasmt/next-saas-stripe-starter
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiClientOptions {
  baseUrl?: string
  headers?: Record<string, string>
}

export class BaseApiClient {
  protected supabase: SupabaseClient
  protected baseUrl: string
  protected headers: Record<string, string>

  constructor(options: ApiClientOptions = {}) {
    this.supabase = createClient()
    this.baseUrl = options.baseUrl || '/api'
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  /**
   * Generic fetch wrapper with error handling
   */
  protected async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      return {
        data: data.data || data,
        success: true
      }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
        success: false
      }
    }
  }

  /**
   * GET request
   */
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.fetch<T>(`${endpoint}${queryString}`, {
      method: 'GET'
    })
  }

  /**
   * POST request
   */
  protected async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * PATCH request
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  /**
   * DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'DELETE'
    })
  }

  /**
   * Direct Supabase query (for real-time features)
   */
  protected getSupabase() {
    return this.supabase
  }
}

/**
 * Creates a paginated query helper
 */
export function createPaginatedQuery<T extends { id: string }>(
  tableName: string,
  options?: {
    orderBy?: string
    ascending?: boolean
  }
) {
  return async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<T>> => {
    const supabase = createClient()

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const query = supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range(from, to)

    if (options?.orderBy) {
      query.order(options.orderBy, { ascending: options.ascending ?? false })
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > to + 1
    }
  }
}
