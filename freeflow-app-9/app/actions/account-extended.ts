'use server'

/**
 * Extended Account Server Actions - Covers all Account-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAccount(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('accounts').select('*').eq('id', accountId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAccount(accountData: { name: string; account_type: string; email?: string; phone?: string; website?: string; industry?: string; company_size?: string; billing_address?: Record<string, any>; owner_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('accounts').insert({ ...accountData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAccount(accountId: string, updates: Partial<{ name: string; email: string; phone: string; website: string; industry: string; company_size: string; billing_address: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('accounts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', accountId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAccount(accountId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('accounts').update({ status: 'deleted', deleted_at: new Date().toISOString() }).eq('id', accountId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccounts(options?: { accountType?: string; status?: string; ownerId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('accounts').select('*'); if (options?.accountType) query = query.eq('account_type', options.accountType); if (options?.status) query = query.eq('status', options.status); if (options?.ownerId) query = query.eq('owner_id', options.ownerId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAccountContacts(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_contacts').select('*').eq('account_id', accountId).order('is_primary', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addAccountContact(accountId: string, contactData: { name: string; email?: string; phone?: string; role?: string; is_primary?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_contacts').insert({ account_id: accountId, ...contactData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccountNotes(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_notes').select('*, users(id, full_name, avatar_url)').eq('account_id', accountId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addAccountNote(accountId: string, note: { content: string; note_type?: string; user_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_notes').insert({ account_id: accountId, ...note, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccountActivities(accountId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_activities').select('*, users(id, full_name, avatar_url)').eq('account_id', accountId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logAccountActivity(accountId: string, activity: { activity_type: string; description: string; metadata?: Record<string, any>; user_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_activities').insert({ account_id: accountId, ...activity, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccountSubscription(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_subscriptions').select('*').eq('account_id', accountId).eq('status', 'active').single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccountBillingHistory(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('account_billing').select('*').eq('account_id', accountId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
