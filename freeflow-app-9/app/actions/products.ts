'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Product Types
type ProductCategory = 'subscription' | 'one_time' | 'add_on' | 'bundle' | 'freemium' | 'enterprise' | 'other'
type ProductStatus = 'draft' | 'active' | 'archived' | 'discontinued' | 'coming_soon'
type BillingCycle = 'one_time' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

// Create Product
export async function createProduct(data: {
  product_name: string
  description?: string
  category?: ProductCategory
  status?: ProductStatus
  price?: number
  currency?: string
  billing_cycle?: BillingCycle
  features?: any[]
  thumbnail_url?: string
  images?: string[]
  metadata?: Record<string, any>
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      product_name: data.product_name,
      description: data.description,
      category: data.category || 'subscription',
      status: data.status || 'draft',
      price: data.price || 0,
      currency: data.currency || 'USD',
      billing_cycle: data.billing_cycle || 'monthly',
      features: data.features || [],
      thumbnail_url: data.thumbnail_url,
      images: data.images || [],
      metadata: data.metadata || {}
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/products-v2')
  return product
}

// Update Product
export async function updateProduct(productId: string, data: Partial<{
  product_name: string
  description: string
  category: ProductCategory
  status: ProductStatus
  price: number
  currency: string
  billing_cycle: BillingCycle
  features: any[]
  thumbnail_url: string
  images: string[]
  metadata: Record<string, any>
}>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: product, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', productId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/products-v2')
  return product
}

// Update Product Status
export async function updateProductStatus(productId: string, status: ProductStatus) {
  return updateProduct(productId, { status })
}

// Delete Product (soft delete)
export async function deleteProduct(productId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', productId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/products-v2')
  return { success: true }
}

// Create Product Variant
export async function createProductVariant(productId: string, data: {
  variant_name: string
  sku?: string
  price: number
  compare_at_price?: number
  stock_quantity?: number
  track_inventory?: boolean
  attributes?: Record<string, any>
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: variant, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: productId,
      user_id: user.id,
      variant_name: data.variant_name,
      sku: data.sku,
      price: data.price,
      compare_at_price: data.compare_at_price,
      stock_quantity: data.stock_quantity || 0,
      track_inventory: data.track_inventory || false,
      attributes: data.attributes || {}
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/products-v2')
  return variant
}

// Update Product Variant
export async function updateProductVariant(variantId: string, data: Partial<{
  variant_name: string
  sku: string
  price: number
  compare_at_price: number
  stock_quantity: number
  track_inventory: boolean
  attributes: Record<string, any>
  is_active: boolean
}>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: variant, error } = await supabase
    .from('product_variants')
    .update(data)
    .eq('id', variantId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/products-v2')
  return variant
}

// Delete Product Variant
export async function deleteProductVariant(variantId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('product_variants')
    .update({ is_active: false })
    .eq('id', variantId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/products-v2')
  return { success: true }
}

// Update Product Metrics
export async function updateProductMetrics(productId: string, metrics: {
  active_users?: number
  total_revenue?: number
  average_rating?: number
  total_reviews?: number
  growth_rate?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: product, error } = await supabase
    .from('products')
    .update(metrics)
    .eq('id', productId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/products-v2')
  return product
}

// Get Product Stats
export async function getProductStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: products } = await supabase
    .from('products')
    .select('status, category, price, active_users, total_revenue, average_rating')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const stats = {
    totalProducts: products?.length || 0,
    activeProducts: products?.filter(p => p.status === 'active').length || 0,
    totalRevenue: products?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) || 0,
    totalUsers: products?.reduce((sum, p) => sum + (p.active_users || 0), 0) || 0,
    averageRating: products?.length
      ? products.reduce((sum, p) => sum + (p.average_rating || 0), 0) / products.length
      : 0
  }

  return stats
}
