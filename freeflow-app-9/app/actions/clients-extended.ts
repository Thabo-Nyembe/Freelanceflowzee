'use server'

/**
 * Extended Clients Server Actions
 * Tables: clients, client_contacts, client_projects, client_notes
 */

import { createClient } from '@/lib/supabase/server'

export async function getClient(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('clients').select('*, client_contacts(*), client_projects(*)').eq('id', clientId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createClient2(clientData: { user_id: string; name: string; email?: string; phone?: string; company?: string; industry?: string; website?: string; address?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('clients').insert({ ...clientData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateClient(clientId: string, updates: Partial<{ name: string; email: string; phone: string; company: string; industry: string; website: string; address: string; status: string; notes: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', clientId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteClient(clientId: string) {
  try { const supabase = await createClient(); await supabase.from('client_contacts').delete().eq('client_id', clientId); await supabase.from('client_notes').delete().eq('client_id', clientId); const { error } = await supabase.from('clients').delete().eq('id', clientId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClients(options?: { user_id?: string; status?: string; industry?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('clients').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.industry) query = query.eq('industry', options.industry); if (options?.search) query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%,company.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addClientContact(contactData: { client_id: string; name: string; email?: string; phone?: string; role?: string; is_primary?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_contacts').insert({ ...contactData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientContacts(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_contacts').select('*').eq('client_id', clientId).order('is_primary', { ascending: false }).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addClientNote(noteData: { client_id: string; user_id: string; content: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_notes').insert({ ...noteData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientNotes(clientId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('client_notes').select('*').eq('client_id', clientId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getClientStats(userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('clients').select('status').eq('user_id', userId); if (!data) return { success: true, data: { total: 0, byStatus: {} } }; const total = data.length; const byStatus = data.reduce((acc: Record<string, number>, c) => { acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1; return acc }, {}); return { success: true, data: { total, byStatus } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, byStatus: {} } } }
}
