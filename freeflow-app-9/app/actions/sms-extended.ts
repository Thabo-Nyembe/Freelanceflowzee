'use server'

/**
 * Extended SMS Server Actions
 * Tables: sms_messages, sms_templates, sms_campaigns, sms_logs
 */

import { createClient } from '@/lib/supabase/server'

export async function getSmsMessage(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sms_messages').select('*').eq('id', messageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendSmsMessage(messageData: { to: string; message: string; from?: string; template_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sms_messages').insert({ ...messageData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSmsMessages(options?: { status?: string; to?: string; campaign_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sms_messages').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.to) query = query.eq('to', options.to); if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSmsTemplates(options?: { is_active?: boolean; category?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('sms_templates').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSmsTemplate(templateData: { name: string; content: string; category?: string; variables?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sms_templates').insert({ ...templateData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSmsCampaigns(options?: { status?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sms_campaigns').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSmsLogs(options?: { message_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sms_logs').select('*'); if (options?.message_id) query = query.eq('message_id', options.message_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
