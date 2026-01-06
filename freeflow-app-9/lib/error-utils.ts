/**
 * Error handling utilities
 */

export interface AppError extends Error {
  code: string
  statusCode: number
  details?: unknown
}

export function createAppError(
  message: string,
  code: string,
  statusCode: number = 500,
  details?: unknown
): AppError {
  const error = new Error(message) as AppError
  error.code = code
  error.statusCode = statusCode
  error.details = details
  return error
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error && 'statusCode' in error
}

export function formatError(error: unknown): {
  message: string
  code: string
  statusCode: number
  details?: unknown
} {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    }
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  }
}

export function handleAsyncError<T>(
  promise: Promise<T>
): Promise<[T | null, AppError | null]> {
  return promise
    .then<[T, null]>((data) => [data, null])
    .catch<[null, AppError]>((error) => [null, formatError(error) as AppError])
}

export class ValidationError extends Error {
  code = 'VALIDATION_ERROR'
  statusCode = 400
  fields: Record<string, string>

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ValidationError'
    this.fields = fields
  }
}

export class NotFoundError extends Error {
  code = 'NOT_FOUND'
  statusCode = 404

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  code = 'UNAUTHORIZED'
  statusCode = 401

  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  code = 'FORBIDDEN'
  statusCode = 403

  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'An unknown error occurred'
}

/**
 * Safely stringify error for logging
 */
export function stringifyError(error: unknown): string {
  try {
    if (error instanceof Error) {
      return JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}
