'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'

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
  features: any[]
  metadata: Record<string, any>
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
  attributes: Record<string, any>
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

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('total_revenue', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (searchQuery) {
      query = query.ilike('product_name', `%${searchQuery}%`)
    }

    return query
  }

  return useSupabaseQuery<Product>('products', buildQuery, [category, status, searchQuery])
}

// Single Product Hook
export function useProduct(productId: string | null) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
  }

  return useSupabaseQuery<Product>(
    'products',
    buildQuery,
    [productId],
    { enabled: !!productId }
  )
}

// Product Variants Hook
export function useProductVariants(productId: string | null) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('price', { ascending: true })
  }

  return useSupabaseQuery<ProductVariant>(
    'product_variants',
    buildQuery,
    [productId],
    { enabled: !!productId }
  )
}

// Product Statistics Hook
export function useProductStats() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('products')
      .select('status, category, price, active_users, total_revenue, average_rating')
      .is('deleted_at', null)
  }

  const { data, ...rest } = useSupabaseQuery<any>('products', buildQuery, [])

  const stats = data ? {
    totalProducts: data.length,
    activeProducts: data.filter((p: any) => p.status === 'active').length,
    totalRevenue: data.reduce((sum: number, p: any) => sum + (p.total_revenue || 0), 0),
    totalUsers: data.reduce((sum: number, p: any) => sum + (p.active_users || 0), 0),
    averageRating: data.length > 0 ? data.reduce((sum: number, p: any) => sum + (p.average_rating || 0), 0) / data.length : 0,
    byCategory: data.reduce((acc: Record<string, number>, p: any) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {}),
    byStatus: data.reduce((acc: Record<string, number>, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})
  } : null

  return { stats, ...rest }
}

// Top Products Hook
export function useTopProducts(limit: number = 5) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('total_revenue', { ascending: false })
      .limit(limit)
  }

  return useSupabaseQuery<Product>('products', buildQuery, [limit])
}

// Mutations
export function useProductMutations() {
  return useSupabaseMutation()
}
