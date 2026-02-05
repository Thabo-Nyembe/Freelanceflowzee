/**
 * Common API Types
 * Shared type definitions for API routes to improve type safety
 */

import { Session } from 'next-auth'
import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// Session & Auth Types
// ============================================================================

/**
 * NextAuth session with user information
 */
export interface AuthSession extends Session {
  user: {
    id?: string
    authId?: string
    email?: string
    name?: string
    image?: string
  }
}

/**
 * Demo mode context
 */
export interface DemoContext {
  isDemoMode: boolean
  demoUserId: string | null
}

// ============================================================================
// Supabase Client Type
// ============================================================================

/**
 * Typed Supabase client
 * Use this instead of 'any' for supabase parameters
 */
export type TypedSupabaseClient = SupabaseClient<any>

// ============================================================================
// Common Request/Response Types
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string
  details?: string
  code?: string
}

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    [key: string]: any
  }
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Filter parameters
 */
export interface FilterParams {
  search?: string
  status?: string
  category?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  [key: string]: any
}

// ============================================================================
// Invoice Types
// ============================================================================

/**
 * Invoice item
 */
export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate?: number
}

/**
 * Invoice line item calculation
 */
export interface InvoiceCalculation {
  subtotal: number
  taxAmount: number
  total: number
}

// ============================================================================
// Customer Types
// ============================================================================

/**
 * Customer data
 */
export interface CustomerData {
  id?: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  website?: string
  status?: 'active' | 'inactive' | 'pending'
  notes?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make certain fields required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * Make certain fields optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Database record with timestamps
 */
export interface TimestampedRecord {
  created_at: string
  updated_at: string
}

/**
 * Database record with user reference
 */
export interface UserOwnedRecord {
  user_id: string
}

/**
 * Soft-deletable record
 */
export interface SoftDeletableRecord {
  deleted_at: string | null
  is_deleted: boolean
}
