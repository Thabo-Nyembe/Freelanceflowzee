'use server'

/**
 * Extended Products Server Actions
 * Tables: products, product_variants, product_categories, product_images, product_reviews, product_inventory, product_pricing, product_attributes
 */

import { createClient } from '@/lib/supabase/server'

export async function getProduct(productId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').select('*, product_variants(*), product_categories(*), product_images(*), product_reviews(count), product_inventory(*), product_pricing(*), product_attributes(*)').eq('id', productId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProductBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').select('*, product_variants(*), product_categories(*), product_images(*), product_reviews(count), product_pricing(*)').eq('slug', slug).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProduct(productData: { name: string; slug: string; description?: string; sku?: string; price: number; compare_at_price?: number; cost?: number; category_id?: string; organization_id?: string; images?: { url: string; alt?: string; order?: number }[]; variants?: { name: string; sku: string; price: number; inventory_quantity?: number }[] }) {
  try { const supabase = await createClient(); const { images, variants, ...productInfo } = productData; const { data: product, error: productError } = await supabase.from('products').insert({ ...productInfo, is_active: true, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (productError) throw productError; if (images && images.length > 0) { const imageData = images.map((img, idx) => ({ product_id: product.id, url: img.url, alt: img.alt, order: img.order ?? idx, is_primary: idx === 0, created_at: new Date().toISOString() })); await supabase.from('product_images').insert(imageData) } if (variants && variants.length > 0) { const variantData = variants.map(v => ({ product_id: product.id, ...v, is_active: true, created_at: new Date().toISOString() })); await supabase.from('product_variants').insert(variantData) } await supabase.from('product_inventory').insert({ product_id: product.id, quantity: 0, reserved_quantity: 0, created_at: new Date().toISOString() }); return { success: true, data: product } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProduct(productId: string, updates: Partial<{ name: string; slug: string; description: string; sku: string; price: number; compare_at_price: number; cost: number; category_id: string; is_active: boolean; is_featured: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', productId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProduct(productId: string) {
  try { const supabase = await createClient(); await supabase.from('product_variants').delete().eq('product_id', productId); await supabase.from('product_images').delete().eq('product_id', productId); await supabase.from('product_reviews').delete().eq('product_id', productId); await supabase.from('product_inventory').delete().eq('product_id', productId); await supabase.from('product_pricing').delete().eq('product_id', productId); await supabase.from('product_attributes').delete().eq('product_id', productId); const { error } = await supabase.from('products').delete().eq('id', productId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProducts(options?: { category_id?: string; organization_id?: string; is_active?: boolean; is_featured?: boolean; min_price?: number; max_price?: number; search?: string; sort_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('products').select('*, product_images(*), product_variants(*), product_reviews(count), product_inventory(*)'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_featured !== undefined) query = query.eq('is_featured', options.is_featured); if (options?.min_price) query = query.gte('price', options.min_price); if (options?.max_price) query = query.lte('price', options.max_price); if (options?.search) query = query.ilike('name', `%${options.search}%`); let orderBy = 'created_at'; let ascending = false; if (options?.sort_by === 'price_asc') { orderBy = 'price'; ascending = true } else if (options?.sort_by === 'price_desc') { orderBy = 'price'; ascending = false } else if (options?.sort_by === 'name') { orderBy = 'name'; ascending = true } const { data, error } = await query.order(orderBy, { ascending }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addVariant(productId: string, variantData: { name: string; sku: string; price: number; compare_at_price?: number; inventory_quantity?: number; options?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('product_variants').insert({ product_id: productId, ...variantData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVariant(variantId: string, updates: Partial<{ name: string; sku: string; price: number; compare_at_price: number; is_active: boolean; options: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('product_variants').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', variantId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addImage(productId: string, imageData: { url: string; alt?: string; order?: number; is_primary?: boolean }) {
  try { const supabase = await createClient(); if (imageData.is_primary) { await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId) } const { data, error } = await supabase.from('product_images').insert({ product_id: productId, ...imageData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteImage(imageId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('product_images').delete().eq('id', imageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addReview(productId: string, reviewData: { user_id: string; rating: number; title?: string; content?: string; images?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('product_reviews').insert({ product_id: productId, ...reviewData, is_verified: false, is_approved: false, helpful_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviews(productId: string, options?: { is_approved?: boolean; sort_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('product_reviews').select('*, users(*)').eq('product_id', productId); if (options?.is_approved !== undefined) query = query.eq('is_approved', options.is_approved); let orderBy = 'created_at'; if (options?.sort_by === 'helpful') orderBy = 'helpful_count'; const { data, error } = await query.order(orderBy, { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateInventory(productId: string, adjustment: number, reason?: string, variantId?: string) {
  try { const supabase = await createClient(); if (variantId) { const { data, error } = await supabase.from('product_variants').update({ inventory_quantity: supabase.sql`inventory_quantity + ${adjustment}` }).eq('id', variantId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('product_inventory').update({ quantity: supabase.sql`quantity + ${adjustment}`, updated_at: new Date().toISOString() }).eq('product_id', productId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories(options?: { parent_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('product_categories').select('*, products(count)'); if (options?.parent_id) { query = query.eq('parent_id', options.parent_id) } else { query = query.is('parent_id', null) } if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordView(productId: string) {
  try { const supabase = await createClient(); await supabase.from('products').update({ view_count: supabase.sql`view_count + 1` }).eq('id', productId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
