'use server'

/**
 * Extended Prices Server Actions
 * Tables: prices, price_tiers, price_rules, price_discounts, price_history, price_schedules, price_lists, price_adjustments
 */

import { createClient } from '@/lib/supabase/server'

export async function getPrice(priceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('prices').select('*, price_tiers(*), price_rules(*), price_discounts(*)').eq('id', priceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPrice(priceData: { product_id: string; amount: number; currency: string; type?: string; interval?: string; interval_count?: number; trial_days?: number; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('prices').insert({ ...priceData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('price_history').insert({ price_id: data.id, amount: priceData.amount, currency: priceData.currency, changed_at: new Date().toISOString(), reason: 'initial_creation' }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePrice(priceId: string, updates: Partial<{ amount: number; currency: string; is_active: boolean; metadata: any }>, reason?: string) {
  try { const supabase = await createClient(); const { data: oldPrice } = await supabase.from('prices').select('amount, currency').eq('id', priceId).single(); const { data, error } = await supabase.from('prices').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', priceId).select().single(); if (error) throw error; if (updates.amount !== undefined && oldPrice && updates.amount !== oldPrice.amount) { await supabase.from('price_history').insert({ price_id: priceId, old_amount: oldPrice.amount, amount: updates.amount, currency: updates.currency || oldPrice.currency, changed_at: new Date().toISOString(), reason: reason || 'price_update' }) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePrice(priceId: string) {
  try { const supabase = await createClient(); await supabase.from('price_tiers').delete().eq('price_id', priceId); await supabase.from('price_rules').delete().eq('price_id', priceId); await supabase.from('price_discounts').delete().eq('price_id', priceId); await supabase.from('price_schedules').delete().eq('price_id', priceId); const { error } = await supabase.from('prices').delete().eq('id', priceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPrices(options?: { product_id?: string; type?: string; currency?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('prices').select('*, price_tiers(*), price_discounts(*)'); if (options?.product_id) query = query.eq('product_id', options.product_id); if (options?.type) query = query.eq('type', options.type); if (options?.currency) query = query.eq('currency', options.currency); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('amount', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTier(priceId: string, tierData: { min_quantity: number; max_quantity?: number; unit_amount: number; flat_amount?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_tiers').insert({ price_id: priceId, ...tierData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTiers(priceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_tiers').select('*').eq('price_id', priceId).order('min_quantity', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRule(priceId: string, ruleData: { name: string; condition_type: string; condition_value: any; adjustment_type: string; adjustment_value: number; priority?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_rules').insert({ price_id: priceId, ...ruleData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRules(priceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_rules').select('*').eq('price_id', priceId).eq('is_active', true).order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDiscount(priceId: string, discountData: { name: string; type: string; value: number; code?: string; min_quantity?: number; max_uses?: number; starts_at?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_discounts').insert({ price_id: priceId, ...discountData, usage_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyDiscount(priceId: string, code: string) {
  try { const supabase = await createClient(); const { data: discount, error } = await supabase.from('price_discounts').select('*').eq('price_id', priceId).eq('code', code).eq('is_active', true).single(); if (error || !discount) return { success: false, error: 'Invalid discount code' }; if (discount.expires_at && new Date(discount.expires_at) < new Date()) return { success: false, error: 'Discount has expired' }; if (discount.max_uses && discount.usage_count >= discount.max_uses) return { success: false, error: 'Discount usage limit reached' }; return { success: true, data: discount } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function calculatePrice(priceId: string, quantity: number, discountCode?: string) {
  try { const supabase = await createClient(); const { data: price } = await supabase.from('prices').select('*, price_tiers(*), price_rules(*)').eq('id', priceId).single(); if (!price) return { success: false, error: 'Price not found' }; let unitPrice = price.amount; if (price.price_tiers && price.price_tiers.length > 0) { const applicableTier = price.price_tiers.find((t: any) => quantity >= t.min_quantity && (!t.max_quantity || quantity <= t.max_quantity)); if (applicableTier) { unitPrice = applicableTier.unit_amount } } let subtotal = unitPrice * quantity; let discount = 0; if (discountCode) { const { data: discountData } = await supabase.from('price_discounts').select('*').eq('price_id', priceId).eq('code', discountCode).eq('is_active', true).single(); if (discountData) { if (discountData.type === 'percentage') { discount = subtotal * (discountData.value / 100) } else { discount = discountData.value } } } const total = subtotal - discount; return { success: true, data: { unitPrice, quantity, subtotal, discount, total, currency: price.currency } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function schedulePrice(priceId: string, scheduleData: { amount: number; starts_at: string; ends_at?: string; reason?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_schedules').insert({ price_id: priceId, ...scheduleData, status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPriceHistory(priceId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_history').select('*').eq('price_id', priceId).order('changed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPriceList(listId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_lists').select('*, prices(*, products(*))').eq('id', listId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPriceList(listData: { name: string; description?: string; currency: string; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('price_lists').insert({ ...listData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
