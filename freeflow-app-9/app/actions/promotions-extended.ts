'use server'

/**
 * Extended Promotions Server Actions
 * Tables: promotions, promotion_codes, promotion_usage, promotion_rules, promotion_campaigns, promotion_tiers, promotion_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getPromotion(promotionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('promotions').select('*, promotion_codes(*), promotion_rules(*), promotion_tiers(*)').eq('id', promotionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPromotion(promotionData: { name: string; description?: string; type: string; discount_type: string; discount_value: number; organization_id?: string; starts_at: string; ends_at?: string; max_uses?: number; min_order_amount?: number; applies_to?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('promotions').insert({ ...promotionData, status: 'active', usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePromotion(promotionId: string, updates: Partial<{ name: string; description: string; discount_type: string; discount_value: number; starts_at: string; ends_at: string; max_uses: number; min_order_amount: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('promotions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', promotionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePromotion(promotionId: string) {
  try { const supabase = await createClient(); await supabase.from('promotion_codes').delete().eq('promotion_id', promotionId); await supabase.from('promotion_usage').delete().eq('promotion_id', promotionId); await supabase.from('promotion_rules').delete().eq('promotion_id', promotionId); await supabase.from('promotion_tiers').delete().eq('promotion_id', promotionId); const { error } = await supabase.from('promotions').delete().eq('id', promotionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPromotions(options?: { organization_id?: string; type?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('promotions').select('*, promotion_codes(count), promotion_usage(count)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCode(promotionId: string, codeData: { code: string; max_uses?: number; user_id?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('promotion_codes').insert({ promotion_id: promotionId, ...codeData, usage_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function generateCodes(promotionId: string, count: number, prefix?: string) {
  try { const supabase = await createClient(); const codes = []; for (let i = 0; i < count; i++) { const code = `${prefix || 'PROMO'}${Math.random().toString(36).substring(2, 8).toUpperCase()}`; codes.push({ promotion_id: promotionId, code, usage_count: 0, is_active: true, created_at: new Date().toISOString() }) } const { data, error } = await supabase.from('promotion_codes').insert(codes).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function validateCode(code: string, userId?: string, orderAmount?: number) {
  try { const supabase = await createClient(); const { data: promoCode, error } = await supabase.from('promotion_codes').select('*, promotions(*)').eq('code', code).eq('is_active', true).single(); if (error || !promoCode) return { success: false, error: 'Invalid promotion code' }; const promotion = promoCode.promotions; if (promotion.status !== 'active') return { success: false, error: 'Promotion is not active' }; if (promotion.ends_at && new Date(promotion.ends_at) < new Date()) return { success: false, error: 'Promotion has expired' }; if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) return { success: false, error: 'Code has expired' }; if (promoCode.max_uses && promoCode.usage_count >= promoCode.max_uses) return { success: false, error: 'Code usage limit reached' }; if (promotion.max_uses && promotion.usage_count >= promotion.max_uses) return { success: false, error: 'Promotion usage limit reached' }; if (promotion.min_order_amount && orderAmount && orderAmount < promotion.min_order_amount) return { success: false, error: `Minimum order amount of ${promotion.min_order_amount} required` }; if (userId && promoCode.user_id && promoCode.user_id !== userId) return { success: false, error: 'This code is not valid for your account' }; return { success: true, data: { promotion, code: promoCode } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyCode(code: string, userId: string, orderId: string, discountAmount: number) {
  try { const supabase = await createClient(); const { data: promoCode } = await supabase.from('promotion_codes').select('id, promotion_id').eq('code', code).single(); if (!promoCode) return { success: false, error: 'Code not found' }; const { data, error } = await supabase.from('promotion_usage').insert({ promotion_id: promoCode.promotion_id, code_id: promoCode.id, user_id: userId, order_id: orderId, discount_amount: discountAmount, used_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('promotion_codes').update({ usage_count: supabase.sql`usage_count + 1` }).eq('id', promoCode.id); await supabase.from('promotions').update({ usage_count: supabase.sql`usage_count + 1` }).eq('id', promoCode.promotion_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodes(promotionId: string, options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('promotion_codes').select('*').eq('promotion_id', promotionId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUsage(promotionId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('promotion_usage').select('*, users(*), promotion_codes(*)').eq('promotion_id', promotionId); if (options?.from_date) query = query.gte('used_at', options.from_date); if (options?.to_date) query = query.lte('used_at', options.to_date); const { data, error } = await query.order('used_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRule(promotionId: string, ruleData: { rule_type: string; condition: any; value: any; priority?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('promotion_rules').insert({ promotion_id: promotionId, ...ruleData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCampaign(campaignData: { name: string; description?: string; promotion_ids: string[]; starts_at: string; ends_at?: string; target_audience?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('promotion_campaigns').insert({ ...campaignData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActivePromotions() {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('promotions').select('*, promotion_codes(*)').eq('status', 'active').lte('starts_at', now).or(`ends_at.is.null,ends_at.gt.${now}`).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
