/**
 * Shared Database Types
 *
 * Provides type-safe alternatives to `any` for common patterns:
 * - Query result types with proper error handling
 * - Supabase client type alias
 * - Common callback parameter types
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PostgrestError } from '@supabase/postgrest-js'

// Re-export for convenience
export type { SupabaseClient } from '@supabase/supabase-js'
export type { PostgrestError } from '@supabase/postgrest-js'

/**
 * Standard database query result type
 * Replaces: Promise<{ data: T | null; error: any }>
 */
export interface QueryResult<T> {
  data: T | null
  error: DatabaseError | null
}

/**
 * Database error type - use instead of `any` for error handling
 */
export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

/**
 * Convert PostgrestError to DatabaseError
 */
export function toDbError(error: PostgrestError | Error | unknown): DatabaseError {
  if (error && typeof error === 'object' && 'message' in error) {
    const e = error as PostgrestError
    return {
      message: e.message,
      code: e.code,
      details: e.details,
      hint: e.hint
    }
  }
  if (error instanceof Error) {
    return { message: error.message }
  }
  return { message: 'An unknown error occurred' }
}

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  error: DatabaseError | null
}

/**
 * Query filter options
 */
export interface QueryFilters {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Mutation result type for create/update/delete operations
 */
export interface MutationResult<T> {
  data: T | null
  error: DatabaseError | null
  success: boolean
}

/**
 * Batch operation result
 */
export interface BatchResult<T> {
  succeeded: T[]
  failed: Array<{ item: T; error: DatabaseError }>
  totalProcessed: number
}

/**
 * Generic record type for database entities
 */
export interface BaseRecord {
  id: string
  created_at: string
  updated_at?: string
}

/**
 * User-owned record type
 */
export interface UserOwnedRecord extends BaseRecord {
  user_id: string
}

/**
 * Soft-deletable record type
 */
export interface SoftDeletableRecord extends BaseRecord {
  deleted_at?: string | null
}

/**
 * JSON value type - use instead of `any` for JSON fields
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/**
 * Metadata/settings type - use instead of `any` for generic config
 */
export type Metadata = Record<string, JsonValue>

/**
 * Type-safe empty result helpers
 */
export function emptyResult<T>(): QueryResult<T> {
  return { data: null, error: null }
}

export function errorResult<T>(error: DatabaseError): QueryResult<T> {
  return { data: null, error }
}

export function successResult<T>(data: T): QueryResult<T> {
  return { data, error: null }
}

/**
 * Type guard for checking if result has error
 */
export function hasError<T>(result: QueryResult<T>): result is QueryResult<T> & { error: DatabaseError } {
  return result.error !== null
}

/**
 * Type guard for checking if result has data
 */
export function hasData<T>(result: QueryResult<T>): result is QueryResult<T> & { data: T } {
  return result.data !== null
}
