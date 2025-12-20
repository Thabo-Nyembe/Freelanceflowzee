'use server'

/**
 * Extended Attribution Server Actions
 * Tables: attribution_sources, attribution_tracking, attribution_conversions
 */

import { createClient } from '@/lib/supabase/server'

export async function getAttributionSource(sourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attribution_sources').select('*').eq('id', sourceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAttributionSource(sourceData: { name: string; type: string; user_id: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string; referrer_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attribution_sources').insert({ ...sourceData, click_count: 0, conversion_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAttributionSources(options?: { user_id?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('attribution_sources').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('click_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackAttributionClick(sourceId: string, trackingData?: { ip_address?: string; user_agent?: string; session_id?: string }) {
  try { const supabase = await createClient(); await supabase.from('attribution_tracking').insert({ source_id: sourceId, event_type: 'click', ...trackingData, created_at: new Date().toISOString() }); await supabase.rpc('increment_attribution_click_count', { src_id: sourceId }).catch(() => {}); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackAttributionConversion(sourceId: string, conversionData: { conversion_type: string; conversion_value?: number; order_id?: string; user_id?: string }) {
  try { const supabase = await createClient(); await supabase.from('attribution_conversions').insert({ source_id: sourceId, ...conversionData, created_at: new Date().toISOString() }); await supabase.rpc('increment_attribution_conversion_count', { src_id: sourceId }).catch(() => {}); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAttributionStats(userId: string, options?: { source_id?: string; date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('attribution_sources').select('*, attribution_conversions(conversion_value)').eq('user_id', userId); if (options?.source_id) query = query.eq('id', options.source_id); const { data } = await query; if (!data) return { success: true, data: { totalClicks: 0, totalConversions: 0, totalValue: 0, sources: [] } }; const totalClicks = data.reduce((sum, s) => sum + (s.click_count || 0), 0); const totalConversions = data.reduce((sum, s) => sum + (s.conversion_count || 0), 0); const totalValue = data.reduce((sum, s) => sum + ((s.attribution_conversions as any[]) || []).reduce((v: number, c: any) => v + (c.conversion_value || 0), 0), 0); return { success: true, data: { totalClicks, totalConversions, totalValue, sources: data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { totalClicks: 0, totalConversions: 0, totalValue: 0, sources: [] } } }
}

export async function getTopAttributionSources(userId: string, options?: { by?: 'clicks' | 'conversions' | 'value'; limit?: number }) {
  try { const supabase = await createClient(); const orderBy = options?.by === 'conversions' ? 'conversion_count' : options?.by === 'value' ? 'total_value' : 'click_count'; const { data, error } = await supabase.from('attribution_sources').select('*').eq('user_id', userId).order(orderBy, { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
