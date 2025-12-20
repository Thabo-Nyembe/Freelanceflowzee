'use server'

/**
 * Extended Customers Server Actions
 * Tables: customers, customer_segments, customer_notes, customer_interactions, customer_tags
 */

import { createClient } from '@/lib/supabase/server'

export async function getCustomer(customerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customers').select('*, customer_notes(*), customer_tags(*)').eq('id', customerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCustomer(customerData: { name: string; email?: string; phone?: string; company?: string; segment_id?: string; source?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customers').insert({ ...customerData, status: 'active', lifetime_value: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCustomer(customerId: string, updates: Partial<{ name: string; email: string; phone: string; company: string; segment_id: string; status: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', customerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCustomer(customerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('customers').delete().eq('id', customerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomers(options?: { segment_id?: string; status?: string; source?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('customers').select('*'); if (options?.segment_id) query = query.eq('segment_id', options.segment_id); if (options?.status) query = query.eq('status', options.status); if (options?.source) query = query.eq('source', options.source); if (options?.search) query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCustomerSegments(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('customer_segments').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCustomerNote(noteData: { customer_id: string; user_id: string; content: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_notes').insert({ ...noteData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomerNotes(customerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_notes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logCustomerInteraction(interactionData: { customer_id: string; user_id?: string; type: string; channel?: string; summary?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_interactions').insert({ ...interactionData, occurred_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomerInteractions(customerId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('customer_interactions').select('*').eq('customer_id', customerId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function tagCustomer(customerId: string, tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_tags').insert({ customer_id: customerId, tag, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
