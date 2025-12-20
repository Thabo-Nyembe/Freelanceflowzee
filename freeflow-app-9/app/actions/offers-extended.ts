'use server'

/**
 * Extended Offers Server Actions
 * Tables: offers, offer_codes, offer_redemptions, offer_conditions, offer_products, offer_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getOffer(offerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offers').select('*, offer_codes(*), offer_conditions(*), offer_products(*), offer_schedules(*)').eq('id', offerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOffer(offerData: { name: string; description?: string; offer_type: string; discount_type: string; discount_value: number; organization_id?: string; start_date?: string; end_date?: string; max_redemptions?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offers').insert({ ...offerData, status: 'draft', redemption_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOffer(offerId: string, updates: Partial<{ name: string; description: string; discount_type: string; discount_value: number; start_date: string; end_date: string; max_redemptions: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', offerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteOffer(offerId: string) {
  try { const supabase = await createClient(); await supabase.from('offer_codes').delete().eq('offer_id', offerId); await supabase.from('offer_conditions').delete().eq('offer_id', offerId); await supabase.from('offer_products').delete().eq('offer_id', offerId); await supabase.from('offer_schedules').delete().eq('offer_id', offerId); const { error } = await supabase.from('offers').delete().eq('id', offerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOffers(options?: { organization_id?: string; status?: string; offer_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('offers').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); if (options?.offer_type) query = query.eq('offer_type', options.offer_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function activateOffer(offerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offers').update({ status: 'active', activated_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', offerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateOffer(offerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offers').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', offerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCode(codeData: { offer_id: string; code: string; max_uses?: number; user_specific_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offer_codes').insert({ ...codeData, use_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateCode(code: string) {
  try { const supabase = await createClient(); const { data: offerCode, error } = await supabase.from('offer_codes').select('*, offers(*)').eq('code', code).eq('is_active', true).single(); if (error || !offerCode) return { success: false, error: 'Invalid code' }; const offer = offerCode.offers; if (offer.status !== 'active') return { success: false, error: 'Offer not active' }; if (offer.end_date && new Date(offer.end_date) < new Date()) return { success: false, error: 'Offer expired' }; if (offerCode.max_uses && offerCode.use_count >= offerCode.max_uses) return { success: false, error: 'Code usage limit reached' }; if (offer.max_redemptions && offer.redemption_count >= offer.max_redemptions) return { success: false, error: 'Offer limit reached' }; return { success: true, data: offerCode } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodes(offerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offer_codes').select('*').eq('offer_id', offerId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function redeemOffer(redemptionData: { offer_id: string; code_id?: string; user_id: string; order_id?: string; discount_amount: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offer_redemptions').insert({ ...redemptionData, redeemed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('offers').update({ redemption_count: supabase.sql`redemption_count + 1` }).eq('id', redemptionData.offer_id); if (redemptionData.code_id) { await supabase.from('offer_codes').update({ use_count: supabase.sql`use_count + 1` }).eq('id', redemptionData.code_id) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRedemptions(offerId: string, options?: { user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('offer_redemptions').select('*').eq('offer_id', offerId); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('redeemed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCondition(conditionData: { offer_id: string; condition_type: string; operator: string; value: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offer_conditions').insert({ ...conditionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addProduct(offerId: string, productId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('offer_products').insert({ offer_id: offerId, product_id: productId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setSchedule(offerId: string, scheduleData: { day_of_week?: number[]; start_time?: string; end_time?: string; timezone?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('offer_schedules').select('id').eq('offer_id', offerId).single(); if (existing) { const { data, error } = await supabase.from('offer_schedules').update({ ...scheduleData, updated_at: new Date().toISOString() }).eq('offer_id', offerId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('offer_schedules').insert({ offer_id: offerId, ...scheduleData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
