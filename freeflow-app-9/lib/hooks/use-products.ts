'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import type { JsonValue } from '@/lib/types/database'

// Feature type for products
export interface ProductFeature {
  name: string
  description?: string
  enabled?: boolean
  [key: string]: JsonValue | undefined
}

// Types
export type ProductCategory = 'subscription' | 'one_time' | 'add_on' | 'bundle' | 'freemium' | 'enterprise' | 'other'
export type ProductStatus = 'draft' | 'active' | 'archived' | 'discontinued' | 'coming_soon'
export type BillingCycle = 'one_time' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

export interface Product {
  id: string
  user_id: string
  product_name: string
  description: string | null
  category: ProductCategory
  status: ProductStatus
  price: number
  currency: string
  billing_cycle: BillingCycle
  active_users: number
  total_revenue: number
  average_rating: number
  total_reviews: number
  growth_rate: number
  features: ProductFeature[]
  metadata: Record<string, JsonValue>
  thumbnail_url: string | null
  images: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProductVariant {
  id: string
  product_id: string
  user_id: string
  variant_name: string
  sku: string | null
  price: number
  compare_at_price: number | null
  stock_quantity: number
  track_inventory: boolean
  attributes: Record<string, JsonValue>
  is_active: boolean
  created_at: string
  updated_at: string
}

// Hook Options
interface UseProductsOptions {
  category?: ProductCategory
  status?: ProductStatus
  searchQuery?: string
}

// Products Hook
export function useProducts(options: UseProductsOptions = {}) {
  const { category, status, searchQuery } = options

  // Build filters object (searchQuery requires separate handling)
  const filters: Record<string, unknown> = {}
  if (category) filters.category = category
  if (status) filters.status = status

  const result = useSupabaseQuery<Product>({
    table: 'products',
    filters,
    orderBy: { column: 'total_revenue', ascending: false },
    softDelete: true
  })

  // Filter by search query client-side if needed
  const filteredData = searchQuery
    ? result.data.filter((p: Product) =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : result.data

  return { ...result, data: filteredData }
}

// Single Product Hook
export function useProduct(productId: string | null) {
  const result = useSupabaseQuery<Product>({
    table: 'products',
    filters: productId ? { id: productId } : {},
    softDelete: true
  })

  // Return single product or null
  const singleProduct = result.data.length > 0 ? result.data[0] : null
  return { ...result, data: singleProduct }
}

// Product Variants Hook
export function useProductVariants(productId: string | null) {
  const filters: Record<string, unknown> = { is_active: true }
  if (productId) filters.product_id = productId

  return useSupabaseQuery<ProductVariant>({
    table: 'product_variants',
    filters,
    orderBy: { column: 'price', ascending: true }
  })
}

// Product stats row type (subset of Product fields used for statistics)
interface ProductStatsRow {
  status: ProductStatus
  category: ProductCategory
  price: number
  active_users: number
  total_revenue: number
  average_rating: number
}

// Product Statistics Hook
export function useProductStats() {
  const result = useSupabaseQuery<ProductStatsRow>({
    table: 'products',
    select: 'status, category, price, active_users, total_revenue, average_rating',
    softDelete: true
  })

  const { data, ...rest } = result

  const stats = data && data.length > 0 ? {
    totalProducts: data.length,
    activeProducts: data.filter((p: ProductStatsRow) => p.status === 'active').length,
    totalRevenue: data.reduce((sum: number, p: ProductStatsRow) => sum + (p.total_revenue || 0), 0),
    totalUsers: data.reduce((sum: number, p: ProductStatsRow) => sum + (p.active_users || 0), 0),
    averageRating: data.length > 0 ? data.reduce((sum: number, p: ProductStatsRow) => sum + (p.average_rating || 0), 0) / data.length : 0,
    byCategory: data.reduce((acc: Record<string, number>, p: ProductStatsRow) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byStatus: data.reduce((acc: Record<string, number>, p: ProductStatsRow) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  } : null

  return { stats, ...rest }
}

// Top Products Hook
export function useTopProducts(limit: number = 5) {
  return useSupabaseQuery<Product>({
    table: 'products',
    filters: { status: 'active' },
    orderBy: { column: 'total_revenue', ascending: false },
    limit,
    softDelete: true
  })
}

// Mutations
export function useProductMutations() {
  return useSupabaseMutation<Product>({
    table: 'products'
  })
}
