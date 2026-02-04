// Server Actions for Product Management
// Created: December 14, 2024
// Updated: December 15, 2024 - A+++ Standard with structured error handling

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { uuidSchema } from '@/lib/validations'
import { z } from 'zod'

const logger = createSimpleLogger('product-actions')

// ============================================
// TYPES & ENUMS
// ============================================

type ProductCategory = 'subscription' | 'one_time' | 'add_on' | 'bundle' | 'freemium' | 'enterprise' | 'other'
type ProductStatus = 'draft' | 'active' | 'archived' | 'discontinued' | 'coming_soon'
type BillingCycle = 'one_time' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

interface Product {
  id: string
  user_id: string
  product_name: string
  description?: string
  category: ProductCategory
  status: ProductStatus
  price: number
  currency: string
  billing_cycle: BillingCycle
  features?: unknown[]
  thumbnail_url?: string
  images?: string[]
  metadata?: Record<string, unknown>
  active_users?: number
  total_revenue?: number
  average_rating?: number
  total_reviews?: number
  growth_rate?: number
  deleted_at?: string
  created_at: string
  updated_at: string
}

interface ProductVariant {
  id: string
  product_id: string
  user_id: string
  variant_name: string
  sku?: string
  price: number
  compare_at_price?: number
  stock_quantity: number
  track_inventory: boolean
  attributes?: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProductStats {
  totalProducts: number
  activeProducts: number
  totalRevenue: number
  totalUsers: number
  averageRating: number
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const productCategorySchema = z.enum(['subscription', 'one_time', 'add_on', 'bundle', 'freemium', 'enterprise', 'other'])
const productStatusSchema = z.enum(['draft', 'active', 'archived', 'discontinued', 'coming_soon'])
const billingCycleSchema = z.enum(['one_time', 'monthly', 'quarterly', 'yearly', 'custom'])

const createProductSchema = z.object({
  product_name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().max(5000).optional(),
  category: productCategorySchema.default('subscription'),
  status: productStatusSchema.default('draft'),
  price: z.number().min(0).default(0),
  currency: z.string().length(3).default('USD'),
  billing_cycle: billingCycleSchema.default('monthly'),
  features: z.array(z.unknown()).optional(),
  thumbnail_url: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  metadata: z.record(z.unknown()).optional()
})

const updateProductSchema = createProductSchema.partial()

const createVariantSchema = z.object({
  variant_name: z.string().min(1, 'Variant name is required').max(255),
  sku: z.string().max(100).optional(),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0).default(0),
  track_inventory: z.boolean().default(false),
  attributes: z.record(z.unknown()).optional()
})

const updateVariantSchema = createVariantSchema.partial()

const updateMetricsSchema = z.object({
  active_users: z.number().int().min(0).optional(),
  total_revenue: z.number().min(0).optional(),
  average_rating: z.number().min(0).max(5).optional(),
  total_reviews: z.number().int().min(0).optional(),
  growth_rate: z.number().optional()
})

// ============================================
// SERVER ACTIONS - PRODUCTS
// ============================================

/**
 * Create Product
 */
export async function createProduct(
  data: z.infer<typeof createProductSchema>
): Promise<ActionResult<Product>> {
  try {
    // Validate input
    const validatedData = createProductSchema.parse(data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized product creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        ...validatedData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create product', { error, userId: user.id })
      return actionError('Failed to create product', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/products-v2')
    logger.info('Product created successfully', { productId: product.id, userId: user.id })
    return actionSuccess(product as Product, 'Product created successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Product validation failed', { error: error.errors })
      return actionError('Invalid product data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error creating product', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Product
 */
export async function updateProduct(
  productId: string,
  data: z.infer<typeof updateProductSchema>
): Promise<ActionResult<Product>> {
  try {
    // Validate inputs
    uuidSchema.parse(productId)
    const validatedData = updateProductSchema.parse(data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized product update attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', productId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update product', { error, productId, userId: user.id })
      return actionError('Failed to update product', 'DATABASE_ERROR')
    }

    if (!product) {
      logger.warn('Product not found or unauthorized', { productId, userId: user.id })
      return actionError('Product not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/products-v2')
    logger.info('Product updated successfully', { productId, userId: user.id })
    return actionSuccess(product as Product, 'Product updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Product update validation failed', { error: error.errors })
      return actionError('Invalid product data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error updating product', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Product Status
 */
export async function updateProductStatus(
  productId: string,
  status: ProductStatus
): Promise<ActionResult<Product>> {
  try {
    // Validate inputs
    uuidSchema.parse(productId)
    productStatusSchema.parse(status)

    return updateProduct(productId, { status })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Product status validation failed', { error: error.errors })
      return actionError('Invalid product status', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error updating product status', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete Product (soft delete)
 */
export async function deleteProduct(productId: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(productId)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized product deletion attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', productId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete product', { error, productId, userId: user.id })
      return actionError('Failed to delete product', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/products-v2')
    logger.info('Product deleted successfully', { productId, userId: user.id })
    return actionSuccess({ success: true }, 'Product deleted successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Product ID validation failed', { error: error.errors })
      return actionError('Invalid product ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error deleting product', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Product Metrics
 */
export async function updateProductMetrics(
  productId: string,
  metrics: z.infer<typeof updateMetricsSchema>
): Promise<ActionResult<Product>> {
  try {
    // Validate inputs
    uuidSchema.parse(productId)
    const validatedMetrics = updateMetricsSchema.parse(metrics)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized product metrics update attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(validatedMetrics)
      .eq('id', productId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update product metrics', { error, productId, userId: user.id })
      return actionError('Failed to update product metrics', 'DATABASE_ERROR')
    }

    if (!product) {
      logger.warn('Product not found or unauthorized', { productId, userId: user.id })
      return actionError('Product not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/products-v2')
    logger.info('Product metrics updated successfully', { productId, userId: user.id })
    return actionSuccess(product as Product, 'Product metrics updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Product metrics validation failed', { error: error.errors })
      return actionError('Invalid metrics data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error updating product metrics', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get Product Stats
 */
export async function getProductStats(): Promise<ActionResult<ProductStats>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized product stats request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('status, category, price, active_users, total_revenue, average_rating')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch product stats', { error, userId: user.id })
      return actionError('Failed to fetch product statistics', 'DATABASE_ERROR')
    }

    const stats: ProductStats = {
      totalProducts: products?.length || 0,
      activeProducts: products?.filter(p => p.status === 'active').length || 0,
      totalRevenue: products?.reduce((sum, p) => sum + (p.total_revenue || 0), 0) || 0,
      totalUsers: products?.reduce((sum, p) => sum + (p.active_users || 0), 0) || 0,
      averageRating: products?.length
        ? products.reduce((sum, p) => sum + (p.average_rating || 0), 0) / products.length
        : 0
    }

    logger.info('Product stats retrieved successfully', { userId: user.id, totalProducts: stats.totalProducts })
    return actionSuccess(stats, 'Statistics retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching product stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// SERVER ACTIONS - PRODUCT VARIANTS
// ============================================

/**
 * Create Product Variant
 */
export async function createProductVariant(
  productId: string,
  data: z.infer<typeof createVariantSchema>
): Promise<ActionResult<ProductVariant>> {
  try {
    // Validate inputs
    uuidSchema.parse(productId)
    const validatedData = createVariantSchema.parse(data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized variant creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: variant, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        user_id: user.id,
        ...validatedData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create variant', { error, productId, userId: user.id })
      return actionError('Failed to create variant', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/products-v2')
    logger.info('Variant created successfully', { variantId: variant.id, productId, userId: user.id })
    return actionSuccess(variant as ProductVariant, 'Variant created successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Variant validation failed', { error: error.errors })
      return actionError('Invalid variant data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error creating variant', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Product Variant
 */
export async function updateProductVariant(
  variantId: string,
  data: z.infer<typeof updateVariantSchema>
): Promise<ActionResult<ProductVariant>> {
  try {
    // Validate inputs
    uuidSchema.parse(variantId)
    const validatedData = updateVariantSchema.parse(data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized variant update attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: variant, error } = await supabase
      .from('product_variants')
      .update(validatedData)
      .eq('id', variantId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update variant', { error, variantId, userId: user.id })
      return actionError('Failed to update variant', 'DATABASE_ERROR')
    }

    if (!variant) {
      logger.warn('Variant not found or unauthorized', { variantId, userId: user.id })
      return actionError('Variant not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/products-v2')
    logger.info('Variant updated successfully', { variantId, userId: user.id })
    return actionSuccess(variant as ProductVariant, 'Variant updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Variant update validation failed', { error: error.errors })
      return actionError('Invalid variant data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error updating variant', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete Product Variant
 */
export async function deleteProductVariant(variantId: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(variantId)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized variant deletion attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('product_variants')
      .update({ is_active: false })
      .eq('id', variantId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete variant', { error, variantId, userId: user.id })
      return actionError('Failed to delete variant', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/products-v2')
    logger.info('Variant deleted successfully', { variantId, userId: user.id })
    return actionSuccess({ success: true }, 'Variant deleted successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Variant ID validation failed', { error: error.errors })
      return actionError('Invalid variant ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error deleting variant', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
