'use server'

/**
 * Extended Billing Server Actions - Covers all Billing-related tables
 * Tables: billing, billing_addresses, billing_credits, billing_stats
 */

import { createClient } from '@/lib/supabase/server'

export async function getBillingInfo(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBillingInfo(billingData: { user_id: string; customer_id?: string; plan_id?: string; status?: string; billing_email?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing').insert({ ...billingData, status: billingData.status || 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBillingInfo(userId: string, updates: Partial<{ customer_id: string; plan_id: string; status: string; billing_email: string; next_billing_date: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBillingAddress(addressId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing_addresses').select('*').eq('id', addressId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBillingAddress(addressData: { user_id: string; name: string; line1: string; line2?: string; city: string; state?: string; postal_code: string; country: string; is_default?: boolean }) {
  try { const supabase = await createClient(); if (addressData.is_default) { await supabase.from('billing_addresses').update({ is_default: false }).eq('user_id', addressData.user_id); } const { data, error } = await supabase.from('billing_addresses').insert({ ...addressData, is_default: addressData.is_default ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBillingAddress(addressId: string, updates: Partial<{ name: string; line1: string; line2: string; city: string; state: string; postal_code: string; country: string; is_default: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing_addresses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', addressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBillingAddress(addressId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('billing_addresses').delete().eq('id', addressId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBillingAddresses(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBillingCredits(userId: string, amount: number, reason: string, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing_credits').insert({ user_id: userId, amount, remaining_amount: amount, reason, expires_at: expiresAt, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function useBillingCredits(userId: string, amount: number) {
  try { const supabase = await createClient(); const { data: credits } = await supabase.from('billing_credits').select('*').eq('user_id', userId).gt('remaining_amount', 0).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()).order('expires_at', { ascending: true }); let remaining = amount; const updates: { id: string; remaining_amount: number }[] = []; for (const credit of credits || []) { if (remaining <= 0) break; const use = Math.min(credit.remaining_amount, remaining); updates.push({ id: credit.id, remaining_amount: credit.remaining_amount - use }); remaining -= use; } if (remaining > 0) return { success: false, error: 'Insufficient credits' }; for (const u of updates) { await supabase.from('billing_credits').update({ remaining_amount: u.remaining_amount, updated_at: new Date().toISOString() }).eq('id', u.id); } return { success: true, usedAmount: amount } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBillingCreditsBalance(userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('billing_credits').select('remaining_amount').eq('user_id', userId).gt('remaining_amount', 0).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()); const balance = data?.reduce((sum, c) => sum + (c.remaining_amount || 0), 0) || 0; return { success: true, balance } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBillingCredits(userId: string, options?: { includeExpired?: boolean; includeUsed?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('billing_credits').select('*').eq('user_id', userId); if (!options?.includeUsed) query = query.gt('remaining_amount', 0); if (!options?.includeExpired) query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBillingStats(userId: string, period?: string) {
  try { const supabase = await createClient(); let query = supabase.from('billing_stats').select('*').eq('user_id', userId); if (period) query = query.eq('period', period); const { data, error } = await query.order('period_start', { ascending: false }).limit(12); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordBillingStats(statsData: { user_id: string; period: string; period_start: string; period_end: string; total_amount: number; credits_used: number; invoice_count: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('billing_stats').upsert({ ...statsData, created_at: new Date().toISOString() }, { onConflict: 'user_id,period' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
