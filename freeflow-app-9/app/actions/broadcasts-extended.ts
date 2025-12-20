'use server'

/**
 * Extended Broadcasts Server Actions
 * Tables: broadcasts, broadcast_recipients, broadcast_templates, broadcast_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getBroadcast(broadcastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('broadcasts').select('*, broadcast_recipients(*)').eq('id', broadcastId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBroadcast(broadcastData: { user_id: string; title: string; content: string; type?: string; channel?: string; scheduled_at?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('broadcasts').insert({ ...broadcastData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBroadcast(broadcastId: string, updates: Partial<{ title: string; content: string; type: string; channel: string; scheduled_at: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('broadcasts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', broadcastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendBroadcast(broadcastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('broadcasts').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', broadcastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBroadcasts(options?: { user_id?: string; status?: string; channel?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('broadcasts').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.channel) query = query.eq('channel', options.channel); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBroadcastRecipients(broadcastId: string, recipientIds: string[]) {
  try { const supabase = await createClient(); const recipients = recipientIds.map(id => ({ broadcast_id: broadcastId, recipient_id: id, status: 'pending', created_at: new Date().toISOString() })); const { data, error } = await supabase.from('broadcast_recipients').insert(recipients).select(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBroadcastTemplates(options?: { user_id?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('broadcast_templates').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function scheduleBroadcast(broadcastId: string, scheduledAt: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('broadcasts').update({ status: 'scheduled', scheduled_at: scheduledAt, updated_at: new Date().toISOString() }).eq('id', broadcastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
