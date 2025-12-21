/**
 * Standardized API Response Utilities
 *
 * Provides consistent response format across all API routes
 * Includes error codes, pagination helpers, and type-safe responses
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================
// ERROR CODES
// ============================================

export const ErrorCode = {
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',

  // Rate limiting (429)
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Business logic errors (422)
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS'
} as const

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode]

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
  meta?: ResponseMeta
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: ErrorCodeType
    message: string
    details?: ValidationErrorDetail[] | Record<string, unknown>
  }
  meta?: ResponseMeta
}

export interface ResponseMeta {
  requestId?: string
  timestamp: string
  duration?: number
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ValidationErrorDetail {
  field: string
  message: string
  code: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================
// RESPONSE BUILDERS
// ============================================

/**
 * Create a successful API response
 */
export function success<T>(
  data: T,
  options?: {
    message?: string
    status?: number
    pagination?: PaginationMeta
    headers?: Record<string, string>
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message: options?.message,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: options?.pagination
    }
  }

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: options?.headers
  })
}

/**
 * Create a paginated successful response
 */
export function paginated<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  options?: {
    message?: string
    headers?: Record<string, string>
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return success(data, {
    message: options?.message,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    },
    headers: options?.headers
  })
}

/**
 * Create an error API response
 */
export function error(
  code: ErrorCodeType,
  message: string,
  options?: {
    status?: number
    details?: ValidationErrorDetail[] | Record<string, unknown>
    headers?: Record<string, string>
  }
): NextResponse<ApiErrorResponse> {
  const statusMap: Record<ErrorCodeType, number> = {
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.INVALID_TOKEN]: 401,
    [ErrorCode.TOKEN_EXPIRED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.INVALID_INPUT]: 400,
    [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.RESOURCE_NOT_FOUND]: 404,
    [ErrorCode.CONFLICT]: 409,
    [ErrorCode.DUPLICATE_ENTRY]: 409,
    [ErrorCode.RESOURCE_EXISTS]: 409,
    [ErrorCode.RATE_LIMITED]: 429,
    [ErrorCode.TOO_MANY_REQUESTS]: 429,
    [ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode.DATABASE_ERROR]: 500,
    [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
    [ErrorCode.BUSINESS_RULE_VIOLATION]: 422,
    [ErrorCode.INVALID_STATE_TRANSITION]: 422,
    [ErrorCode.INSUFFICIENT_FUNDS]: 422
  }

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: options?.details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  }

  return NextResponse.json(response, {
    status: options?.status || statusMap[code] || 500,
    headers: options?.headers
  })
}

// ============================================
// CONVENIENCE ERROR METHODS
// ============================================

export const ApiError = {
  unauthorized: (message = 'Authentication required') =>
    error(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message = 'Access denied') =>
    error(ErrorCode.FORBIDDEN, message),

  notFound: (resource = 'Resource') =>
    error(ErrorCode.NOT_FOUND, `${resource} not found`),

  validation: (errors: z.ZodError['errors']) =>
    error(ErrorCode.VALIDATION_ERROR, 'Validation failed', {
      details: errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    }),

  badRequest: (message: string, details?: Record<string, unknown>) =>
    error(ErrorCode.INVALID_INPUT, message, { details }),

  conflict: (message: string) =>
    error(ErrorCode.CONFLICT, message),

  duplicate: (field: string) =>
    error(ErrorCode.DUPLICATE_ENTRY, `${field} already exists`),

  rateLimited: (retryAfter?: number) =>
    error(ErrorCode.RATE_LIMITED, 'Too many requests', {
      headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined
    }),

  internal: (message = 'Internal server error') =>
    error(ErrorCode.INTERNAL_ERROR, message),

  database: (message = 'Database operation failed') =>
    error(ErrorCode.DATABASE_ERROR, message),

  businessRule: (message: string) =>
    error(ErrorCode.BUSINESS_RULE_VIOLATION, message)
}

// ============================================
// SERVER ACTION RESPONSES
// ============================================

export interface ActionSuccessResult<T> {
  success: true
  data: T
  message?: string
}

export interface ActionErrorResult {
  success: false
  error: string
  code?: ErrorCodeType
  details?: ValidationErrorDetail[]
}

export type ActionResult<T> = ActionSuccessResult<T> | ActionErrorResult

/**
 * Create a successful server action result
 */
export function actionSuccess<T>(data: T, message?: string): ActionSuccessResult<T> {
  return { success: true, data, message }
}

/**
 * Create an error server action result
 */
export function actionError(
  message: string,
  code?: ErrorCodeType,
  details?: ValidationErrorDetail[]
): ActionErrorResult {
  return { success: false, error: message, code, details }
}

/**
 * Create validation error for server actions
 */
export function actionValidationError(errors: z.ZodError['errors']): ActionErrorResult {
  return {
    success: false,
    error: 'Validation failed',
    code: ErrorCode.VALIDATION_ERROR,
    details: errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  }
}

// ============================================
// PAGINATION HELPERS
// ============================================

/**
 * Parse pagination parameters from request
 */
export function parsePagination(searchParams: URLSearchParams): {
  page: number
  limit: number
  offset: number
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Parse sort parameters from request
 */
export function parseSort(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = 'created_at'
): { sortBy: string; sortOrder: 'asc' | 'desc' } {
  const sortBy = searchParams.get('sort_by') || defaultField
  const sortOrder = (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc'

  return {
    sortBy: allowedFields.includes(sortBy) ? sortBy : defaultField,
    sortOrder: ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc'
  }
}

// ============================================
// REQUEST VALIDATION
// ============================================

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse<ApiErrorResponse> }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return { error: ApiError.validation(result.error.errors) }
    }

    return { data: result.data }
  } catch {
    return { error: ApiError.badRequest('Invalid JSON body') }
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data: T } | { error: NextResponse<ApiErrorResponse> } {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })

  const result = schema.safeParse(params)

  if (!result.success) {
    return { error: ApiError.validation(result.error.errors) }
  }

  return { data: result.data }
}
