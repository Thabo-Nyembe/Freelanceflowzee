'use server'

/**
 * Extended Coupon Server Actions - Covers all Coupon-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCoupons(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('coupons').select('*').order('created_at', { ascending: false }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCoupon(couponId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupons').select('*').eq('id', couponId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCouponByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupons').select('*').eq('code', code).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCoupon(input: { code: string; name: string; description?: string; discount_type: string; discount_value: number; min_order_value?: number; max_discount_amount?: number; usage_limit?: number; usage_limit_per_user?: number; start_date?: string; end_date?: string; applies_to_products?: string[]; applies_to_categories?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupons').insert({ ...input, is_active: true, total_usage: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCoupon(couponId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupons').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', couponId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupons').update({ is_active: isActive }).eq('id', couponId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCoupon(couponId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('coupons').delete().eq('id', couponId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateCoupon(code: string, userId: string, orderTotal: number) {
  try { const supabase = await createClient(); const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', code).single(); if (error) throw error; if (!coupon.is_active) throw new Error('Coupon is not active'); const now = new Date(); if (coupon.start_date && new Date(coupon.start_date) > now) throw new Error('Coupon not yet active'); if (coupon.end_date && new Date(coupon.end_date) < now) throw new Error('Coupon has expired'); if (coupon.min_order_value && orderTotal < coupon.min_order_value) throw new Error(`Minimum order of ${coupon.min_order_value} required`); if (coupon.usage_limit && coupon.total_usage >= coupon.usage_limit) throw new Error('Coupon usage limit reached'); const { count } = await supabase.from('coupon_usage').select('*', { count: 'exact', head: true }).eq('coupon_id', coupon.id).eq('user_id', userId); if (coupon.usage_limit_per_user && (count || 0) >= coupon.usage_limit_per_user) throw new Error('You have reached the usage limit for this coupon'); let discountAmount = 0; if (coupon.discount_type === 'percentage') { discountAmount = orderTotal * (coupon.discount_value / 100); } else { discountAmount = coupon.discount_value; } if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) { discountAmount = coupon.max_discount_amount; } return { success: true, data: { valid: true, discount_amount: discountAmount, coupon } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyCoupon(couponId: string, userId: string, orderId: string, discountAmount: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupon_usage').insert({ coupon_id: couponId, user_id: userId, order_id: orderId, discount_amount: discountAmount, used_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: coupon } = await supabase.from('coupons').select('total_usage').eq('id', couponId).single(); await supabase.from('coupons').update({ total_usage: (coupon?.total_usage || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', couponId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCouponUsage(couponId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupon_usage').select('*').eq('coupon_id', couponId).order('used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserCouponUsage(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('coupon_usage').select('*, coupons(*)').eq('user_id', userId).order('used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCouponStats(couponId: string) {
  try { const supabase = await createClient(); const { data: usage, error } = await supabase.from('coupon_usage').select('discount_amount').eq('coupon_id', couponId); if (error) throw error; const totalDiscountGiven = usage?.reduce((sum, u) => sum + (u.discount_amount || 0), 0) || 0; return { success: true, data: { total_usage: usage?.length || 0, total_discount_given: totalDiscountGiven } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
