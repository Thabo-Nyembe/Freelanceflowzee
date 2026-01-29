/**
 * API Error Handler Utility
 *
 * Provides consistent error handling across all API routes
 */

import { NextResponse } from 'next/server'

export interface APIError {
  code: string
  message: string
  details?: unknown
  status: number
}

// Standard error codes
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  CONFLICT: 'CONFLICT',
} as const

// Standard error responses
export const Errors = {
  unauthorized: (message = 'Authentication required'): APIError => ({
    code: ErrorCodes.UNAUTHORIZED,
    message,
    status: 401,
  }),

  forbidden: (message = 'Access denied'): APIError => ({
    code: ErrorCodes.FORBIDDEN,
    message,
    status: 403,
  }),

  notFound: (resource = 'Resource'): APIError => ({
    code: ErrorCodes.NOT_FOUND,
    message: `${resource} not found`,
    status: 404,
  }),

  badRequest: (message = 'Invalid request'): APIError => ({
    code: ErrorCodes.BAD_REQUEST,
    message,
    status: 400,
  }),

  validationError: (details: unknown): APIError => ({
    code: ErrorCodes.VALIDATION_ERROR,
    message: 'Validation failed',
    details,
    status: 400,
  }),

  rateLimited: (retryAfter?: number): APIError => ({
    code: ErrorCodes.RATE_LIMITED,
    message: 'Too many requests. Please try again later.',
    details: retryAfter ? { retryAfter } : undefined,
    status: 429,
  }),

  internal: (message = 'Internal server error'): APIError => ({
    code: ErrorCodes.INTERNAL_ERROR,
    message,
    status: 500,
  }),

  serviceUnavailable: (message = 'Service temporarily unavailable'): APIError => ({
    code: ErrorCodes.SERVICE_UNAVAILABLE,
    message,
    status: 503,
  }),

  paymentRequired: (message = 'Payment required'): APIError => ({
    code: ErrorCodes.PAYMENT_REQUIRED,
    message,
    status: 402,
  }),

  conflict: (message = 'Resource conflict'): APIError => ({
    code: ErrorCodes.CONFLICT,
    message,
    status: 409,
  }),
}

/**
 * Create a JSON error response
 */
export function errorResponse(error: APIError): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    },
    {
      status: error.status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * Wrap an API handler with error handling
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      // Handle known error types
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
          return errorResponse(Errors.unauthorized())
        }
        if (error.message.includes('not found') || error.message.includes('Not found')) {
          return errorResponse(Errors.notFound())
        }
        if (error.message.includes('validation') || error.message.includes('invalid')) {
          return errorResponse(Errors.badRequest(error.message))
        }

        // Generic error
        return errorResponse({
          code: ErrorCodes.INTERNAL_ERROR,
          message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
          status: 500,
        })
      }

      // Unknown error type
      return errorResponse(Errors.internal())
    }
  }
}

/**
 * Type guard for checking if something is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'status' in error
  )
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Created response helper
 */
export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 })
}

/**
 * No content response helper
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
