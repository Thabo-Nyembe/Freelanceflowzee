'use server'

/**
 * Extended Renewals Server Actions
 * Tables: renewals, renewal_reminders, renewal_history, renewal_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getRenewal(renewalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('renewals').select('*').eq('id', renewalId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRenewal(renewalData: { user_id: string; subscription_id?: string; contract_id?: string; renewal_date: string; amount?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('renewals').insert({ ...renewalData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRenewal(renewalId: string, updates: Partial<{ renewal_date: string; amount: number; status: string; notes: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('renewals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', renewalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function processRenewal(renewalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('renewals').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', renewalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRenewals(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('renewals').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('renewal_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUpcomingRenewals(userId: string, daysAhead?: number) {
  try { const supabase = await createClient(); const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + (daysAhead || 30)); const { data, error } = await supabase.from('renewals').select('*').eq('user_id', userId).eq('status', 'pending').lte('renewal_date', futureDate.toISOString()).gte('renewal_date', new Date().toISOString()).order('renewal_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRenewalReminders(renewalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('renewal_reminders').select('*').eq('renewal_id', renewalId).order('reminder_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRenewalHistory(renewalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('renewal_history').select('*').eq('renewal_id', renewalId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
