'use server'

/**
 * Extended Discount Server Actions - Covers all Discount-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDiscounts(isActive?: boolean, discountType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('discounts').select('*').order('created_at', { ascending: false }); if (isActive !== undefined) query = query.eq('is_active', isActive); if (discountType) query = query.eq('discount_type', discountType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDiscount(discountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discounts').select('*').eq('id', discountId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDiscount(input: { name: string; description?: string; discount_type: string; value: number; min_purchase?: number; max_discount?: number; start_date?: string; end_date?: string; usage_limit?: number; applies_to?: string[]; excluded_products?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discounts').insert({ ...input, is_active: true, usage_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDiscount(discountId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discounts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', discountId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleDiscountActive(discountId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discounts').update({ is_active: isActive }).eq('id', discountId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDiscount(discountId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('discounts').delete().eq('id', discountId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementDiscountUsage(discountId: string) {
  try { const supabase = await createClient(); const { data: discount, error: discountError } = await supabase.from('discounts').select('usage_count, usage_limit').eq('id', discountId).single(); if (discountError) throw discountError; if (discount.usage_limit && discount.usage_count >= discount.usage_limit) throw new Error('Discount usage limit reached'); const { data, error } = await supabase.from('discounts').update({ usage_count: (discount.usage_count || 0) + 1 }).eq('id', discountId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateDiscount(discountId: string, orderTotal: number) {
  try { const supabase = await createClient(); const { data: discount, error } = await supabase.from('discounts').select('*').eq('id', discountId).single(); if (error) throw error; if (!discount.is_active) throw new Error('Discount is not active'); const now = new Date(); if (discount.start_date && new Date(discount.start_date) > now) throw new Error('Discount not yet active'); if (discount.end_date && new Date(discount.end_date) < now) throw new Error('Discount has expired'); if (discount.min_purchase && orderTotal < discount.min_purchase) throw new Error(`Minimum purchase of ${discount.min_purchase} required`); if (discount.usage_limit && discount.usage_count >= discount.usage_limit) throw new Error('Discount usage limit reached'); let discountAmount = 0; if (discount.discount_type === 'percentage') { discountAmount = orderTotal * (discount.value / 100); } else { discountAmount = discount.value; } if (discount.max_discount && discountAmount > discount.max_discount) { discountAmount = discount.max_discount; } return { success: true, data: { valid: true, discount_amount: discountAmount, discount } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDiscountCodes(discountId?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('discount_codes').select('*').order('created_at', { ascending: false }); if (discountId) query = query.eq('discount_id', discountId); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDiscountCode(discountId: string, input: { code: string; usage_limit?: number; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('discount_codes').insert({ discount_id: discountId, ...input, is_active: true, usage_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateDiscountCode(code: string, orderTotal: number) {
  try { const supabase = await createClient(); const { data: discountCode, error } = await supabase.from('discount_codes').select('*, discounts(*)').eq('code', code).single(); if (error) throw error; if (!discountCode.is_active) throw new Error('Code is not active'); if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) throw new Error('Code has expired'); if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) throw new Error('Code usage limit reached'); return validateDiscount(discountCode.discount_id, orderTotal) } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDiscountCode(codeId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('discount_codes').delete().eq('id', codeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
