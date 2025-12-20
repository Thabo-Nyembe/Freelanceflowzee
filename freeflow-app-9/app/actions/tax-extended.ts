'use server'

/**
 * Extended Tax Server Actions - Covers all Tax-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTaxRates(country?: string, state?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('tax_rates').select('*').order('name', { ascending: true }); if (country) query = query.eq('country', country); if (state) query = query.eq('state', state); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTaxRate(rateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_rates').select('*').eq('id', rateId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTaxRate(input: { name: string; rate: number; country: string; state?: string; city?: string; postal_code?: string; category_id?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_rates').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTaxRate(rateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_rates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', rateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTaxRate(rateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tax_rates').delete().eq('id', rateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleTaxRateActive(rateId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_rates').update({ is_active: isActive }).eq('id', rateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getApplicableTaxRate(country: string, state?: string, city?: string, postalCode?: string, categoryId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('tax_rates').select('*').eq('country', country).eq('is_active', true); if (categoryId) query = query.eq('category_id', categoryId); const { data, error } = await query; if (error) throw error; const rates = data || []; let bestMatch = rates.find(r => r.postal_code === postalCode && r.city === city && r.state === state) || rates.find(r => r.city === city && r.state === state && !r.postal_code) || rates.find(r => r.state === state && !r.city && !r.postal_code) || rates.find(r => !r.state && !r.city && !r.postal_code); return { success: true, data: bestMatch || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function calculateTax(amount: number, country: string, state?: string, categoryId?: string) {
  try { const result = await getApplicableTaxRate(country, state, undefined, undefined, categoryId); if (!result.success || !result.data) return { success: true, taxAmount: 0, rate: 0 }; const rate = result.data.rate; const taxAmount = amount * (rate / 100); return { success: true, taxAmount, rate, taxRateId: result.data.id } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTaxCategories(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('tax_categories').select('*').order('name', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTaxCategory(input: { name: string; code: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_categories').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTaxCategory(categoryId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_categories').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', categoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTaxExemptions(userId?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('tax_exemptions').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTaxExemption(input: { user_id: string; exemption_type: string; certificate_number?: string; start_date?: string; end_date?: string; country?: string; state?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_exemptions').insert({ ...input, is_active: true, is_verified: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyTaxExemption(exemptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tax_exemptions').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', exemptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function isUserTaxExempt(userId: string, country?: string, state?: string) {
  try { const supabase = await createClient(); let query = supabase.from('tax_exemptions').select('id').eq('user_id', userId).eq('is_active', true).eq('is_verified', true); if (country) query = query.or(`country.eq.${country},country.is.null`); if (state) query = query.or(`state.eq.${state},state.is.null`); const now = new Date().toISOString(); query = query.or(`end_date.is.null,end_date.gt.${now}`); const { data, error } = await query.limit(1); if (error) throw error; return { success: true, exempt: (data?.length || 0) > 0 } } catch (error) { return { success: false, exempt: false } }
}
