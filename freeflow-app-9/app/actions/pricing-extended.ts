'use server'

/**
 * Extended Pricing Server Actions
 * Tables: pricing, pricing_tiers, pricing_features, pricing_discounts
 */

import { createClient } from '@/lib/supabase/server'

export async function getPricingPlan(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pricing').select('*, pricing_features(*)').eq('id', planId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPricingPlan(planData: { name: string; description?: string; price: number; billing_period: string; features?: string[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pricing').insert({ ...planData, is_active: planData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePricingPlan(planId: string, updates: Partial<{ name: string; description: string; price: number; billing_period: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pricing').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', planId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePricingPlan(planId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('pricing').delete().eq('id', planId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPricingPlans(options?: { billing_period?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('pricing').select('*, pricing_features(*)'); if (options?.billing_period) query = query.eq('billing_period', options.billing_period); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('price', { ascending: true }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPricingTiers() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pricing_tiers').select('*, pricing(*)').order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPricingFeatures(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pricing_features').select('*').eq('plan_id', planId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPricingDiscounts(options?: { is_active?: boolean; code?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('pricing_discounts').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.code) query = query.eq('code', options.code); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function validateDiscountCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pricing_discounts').select('*').eq('code', code).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid or expired code' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
