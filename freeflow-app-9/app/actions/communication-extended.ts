'use server'

/**
 * Extended Communication Server Actions
 * Tables: communication_channels, communication_messages, communication_templates, communication_preferences
 */

import { createClient } from '@/lib/supabase/server'

export async function getCommunicationChannel(channelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('communication_channels').select('*').eq('id', channelId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCommunicationChannel(channelData: { name: string; type: string; config?: Record<string, any>; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('communication_channels').insert({ ...channelData, is_active: channelData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCommunicationChannel(channelId: string, updates: Partial<{ name: string; config: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('communication_channels').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', channelId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunicationChannels(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('communication_channels').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendCommunication(messageData: { channel_id: string; recipient_id: string; subject?: string; content: string; template_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('communication_messages').insert({ ...messageData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMessageStatus(messageId: string, status: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'sent') updates.sent_at = new Date().toISOString(); if (status === 'delivered') updates.delivered_at = new Date().toISOString(); if (status === 'read') updates.read_at = new Date().toISOString(); if (metadata) updates.metadata = metadata; const { data, error } = await supabase.from('communication_messages').update(updates).eq('id', messageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunicationMessages(options?: { channel_id?: string; recipient_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('communication_messages').select('*'); if (options?.channel_id) query = query.eq('channel_id', options.channel_id); if (options?.recipient_id) query = query.eq('recipient_id', options.recipient_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCommunicationTemplate(templateData: { name: string; channel_type: string; subject?: string; content: string; variables?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('communication_templates').insert({ ...templateData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunicationTemplates(options?: { channel_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('communication_templates').select('*'); if (options?.channel_type) query = query.eq('channel_type', options.channel_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateCommunicationPreferences(userId: string, preferences: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('communication_preferences').upsert({ user_id: userId, preferences, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
