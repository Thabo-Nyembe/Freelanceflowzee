'use server'

/**
 * Extended Traffic Server Actions
 * Tables: traffic_sources, traffic_analytics, traffic_campaigns, traffic_conversions
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrafficSource(sourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('traffic_sources').select('*').eq('id', sourceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTrafficSource(sourceData: { name: string; type: string; url?: string; campaign_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('traffic_sources').insert({ ...sourceData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrafficSources(options?: { type?: string; campaign_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('traffic_sources').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTrafficAnalytics(options?: { source_id?: string; page_path?: string; days?: number }) {
  try { const supabase = await createClient(); const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); let query = supabase.from('traffic_analytics').select('*').gte('created_at', since.toISOString()); if (options?.source_id) query = query.eq('source_id', options.source_id); if (options?.page_path) query = query.eq('page_path', options.page_path); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordTrafficEvent(eventData: { source_id?: string; page_path: string; user_agent?: string; referrer?: string; session_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('traffic_analytics').insert({ ...eventData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrafficCampaigns(options?: { status?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('traffic_campaigns').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTrafficConversions(options?: { source_id?: string; campaign_id?: string; days?: number }) {
  try { const supabase = await createClient(); const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); let query = supabase.from('traffic_conversions').select('*').gte('created_at', since.toISOString()); if (options?.source_id) query = query.eq('source_id', options.source_id); if (options?.campaign_id) query = query.eq('campaign_id', options.campaign_id); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
