/**
 * API Route Handler Wrapper
 *
 * Provides a standardized way to create API route handlers with:
 * - Authentication
 * - Rate limiting
 * - Input validation
 * - Error handling
 * - Logging
 * - Response formatting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { User } from '@supabase/supabase-js'
import {
  success,
  paginated,
  ApiError,
  parsePagination,
  parseSort,
  PaginationMeta
} from './response'
import { checkRouteRateLimit, RateLimitConfig } from './rate-limiter'
import {
  createRequestLogger,
  generateRequestId,
  logRequestEnd,
  Logger
} from '../logger'

// ============================================
// TYPES
// ============================================

export interface ApiHandlerContext {
  /** Authenticated user (if auth required) */
  user: User | null
  /** User ID shorthand */
  userId: string | null
  /** Supabase client */
  supabase: Awaited<ReturnType<typeof createClient>>
  /** Request logger with correlation ID */
  logger: Logger
  /** Request ID for correlation */
  requestId: string
  /** Parsed URL search params */
  searchParams: URLSearchParams
  /** Pagination parameters */
  pagination: {
    page: number
    limit: number
    offset: number
  }
  /** Sort parameters */
  sort: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  /** Validated request body (if schema provided) */
  body?: unknown
  /** Route params (e.g., [id]) */
  params: Record<string, string>
}

export interface ApiHandlerOptions<TBody = unknown> {
  /** Require authentication */
  auth?: boolean
  /** Rate limit configuration */
  rateLimit?: RateLimitConfig | false
  /** Zod schema for request body validation */
  bodySchema?: z.ZodSchema<TBody>
  /** Allowed sort fields for list endpoints */
  sortFields?: string[]
  /** Default sort field */
  defaultSort?: string
  /** Required permissions (for permission-based access) */
  permissions?: string[]
}

type ApiHandler<TBody = unknown> = (
  request: NextRequest,
  context: ApiHandlerContext & { body: TBody }
) => Promise<NextResponse>

// ============================================
// HANDLER WRAPPER
// ============================================

/**
 * Create a wrapped API route handler with built-in features
 *
 * @example
 * ```ts
 * import { createHandler } from '@/lib/api/handler'
 * import { createProjectSchema } from '@/lib/validations'
 *
 * export const POST = createHandler({
 *   auth: true,
 *   bodySchema: createProjectSchema,
 *   rateLimit: { limit: 50, windowSeconds: 60 }
 * }, async (request, { user, body, supabase, logger }) => {
 *   logger.info('Creating project', { name: body.name })
 *
 *   const { data, error } = await supabase
 *     .from('projects')
 *     .insert({ ...body, user_id: user.id })
 *     .select()
 *     .single()
 *
 *   if (error) throw error
 *   return success(data, { message: 'Project created', status: 201 })
 * })
 * ```
 */
export function createHandler<TBody = unknown>(
  options: ApiHandlerOptions<TBody>,
  handler: ApiHandler<TBody>
) {
  return async (
    request: NextRequest,
    routeContext?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const startTime = Date.now()
    const requestId = generateRequestId()
    const logger = createRequestLogger(requestId)
    const supabase = await createClient()

    try {
      // Rate limiting
      if (options.rateLimit !== false) {
        const rateLimitConfig = options.rateLimit || {
          limit: 100,
          windowSeconds: 60
        }
        const rateLimitResponse = await checkRouteRateLimit(request, rateLimitConfig)
        if (rateLimitResponse) {
          return rateLimitResponse
        }
      }

      // Authentication
      let user: User | null = null
      let userId: string | null = null

      if (options.auth) {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          return ApiError.unauthorized()
        }

        user = authUser
        userId = authUser.id
      } else {
        // Try to get user optionally
        const { data: { user: authUser } } = await supabase.auth.getUser()
        user = authUser
        userId = authUser?.id || null
      }

      // Body validation
      let body: TBody | undefined

      if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const rawBody = await request.json()
          const result = options.bodySchema.safeParse(rawBody)

          if (!result.success) {
            return ApiError.validation(result.error.errors)
          }

          body = result.data
        } catch {
          return ApiError.badRequest('Invalid JSON body')
        }
      }

      // Parse query parameters
      const searchParams = new URL(request.url).searchParams
      const pagination = parsePagination(searchParams)
      const sort = parseSort(
        searchParams,
        options.sortFields || ['created_at', 'updated_at', 'name'],
        options.defaultSort || 'created_at'
      )

      // Build context
      const context: ApiHandlerContext & { body: TBody } = {
        user,
        userId,
        supabase,
        logger,
        requestId,
        searchParams,
        pagination,
        sort,
        body: body as TBody,
        params: routeContext?.params || {}
      }

      // Execute handler
      const response = await handler(request, context)

      // Add request ID header
      response.headers.set('X-Request-ID', requestId)

      // Log completion
      const duration = Date.now() - startTime
      logRequestEnd(logger, {
        method: request.method,
        url: request.nextUrl.pathname,
        status: response.status,
        duration
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error('Request handler error', {
        method: request.method,
        url: request.nextUrl.pathname,
        duration,
        error
      })

      // Handle specific error types
      if (error instanceof z.ZodError) {
        return ApiError.validation(error.errors)
      }

      // Supabase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code: string; message: string; details?: string }

        if (supabaseError.code === 'PGRST116') {
          return ApiError.notFound()
        }

        if (supabaseError.code === '23505') {
          return ApiError.duplicate('Record')
        }

        if (supabaseError.code === '23503') {
          return ApiError.badRequest('Referenced record does not exist')
        }

        return ApiError.database(supabaseError.message)
      }

      // Generic error
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      return ApiError.internal(message)
    }
  }
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export {
  success,
  paginated,
  ApiError,
  parsePagination,
  parseSort
}

export type { PaginationMeta }

// ============================================
// LIST HANDLER HELPER
// ============================================

/**
 * Helper for creating paginated list endpoints
 */
export function createListResponse<T>(
  data: T[],
  total: number,
  pagination: { page: number; limit: number }
): NextResponse {
  return paginated(data, {
    page: pagination.page,
    limit: pagination.limit,
    total
  })
}

// ============================================
// ERROR HELPERS
// ============================================

/**
 * Check if a Supabase error is "not found"
 */
export function isNotFoundError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: string }).code === 'PGRST116'
  )
}

/**
 * Check if a Supabase error is "duplicate"
 */
export function isDuplicateError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: string }).code === '23505'
  )
}
