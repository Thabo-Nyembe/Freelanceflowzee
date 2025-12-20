'use server'

/**
 * Extended Product Server Actions - Covers all Product-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getProducts(categoryId?: string, activeOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('products').select('*').order('name', { ascending: true }); if (activeOnly) query = query.eq('is_active', true); if (categoryId) query = query.eq('category_id', categoryId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getProduct(productId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').select('*').eq('id', productId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProduct(input: { name: string; description?: string; sku: string; price: number; compare_at_price?: number; cost_price?: number; category_id?: string; images?: string[]; tags?: string[]; inventory_quantity?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').insert({ ...input, is_active: true, sold_count: 0, view_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProduct(productId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', productId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').update({ is_active: isActive }).eq('id', productId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProduct(productId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('products').delete().eq('id', productId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProductInventory(productId: string, quantityChange: number) {
  try { const supabase = await createClient(); const { data: product, error: productError } = await supabase.from('products').select('inventory_quantity').eq('id', productId).single(); if (productError) throw productError; const newQuantity = Math.max(0, (product?.inventory_quantity || 0) + quantityChange); const { data, error } = await supabase.from('products').update({ inventory_quantity: newQuantity }).eq('id', productId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementProductViewCount(productId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.rpc('increment', { table_name: 'products', column_name: 'view_count', row_id: productId }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProductVariants(productId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('product_variants').select('*').eq('product_id', productId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createProductVariant(productId: string, input: { name: string; sku: string; price: number; compare_at_price?: number; inventory_quantity?: number; options?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('product_variants').insert({ product_id: productId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProductVariant(variantId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('product_variants').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', variantId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProductVariant(variantId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('product_variants').delete().eq('id', variantId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchProducts(query: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').select('*').eq('is_active', true).or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getProductsByTag(tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('products').select('*').eq('is_active', true).contains('tags', [tag]); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
