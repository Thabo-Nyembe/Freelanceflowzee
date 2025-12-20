'use server'

/**
 * Extended Campaigns Server Actions
 * Tables: campaigns, campaign_audiences, campaign_metrics, campaign_content
 */

import { createClient } from '@/lib/supabase/server'

export async function getCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').select('*, campaign_audiences(*), campaign_metrics(*)').eq('id', campaignId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCampaign(campaignData: { user_id: string; name: string; type: string; description?: string; budget?: number; start_date?: string; end_date?: string; goals?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').insert({ ...campaignData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCampaign(campaignId: string, updates: Partial<{ name: string; type: string; description: string; budget: number; start_date: string; end_date: string; status: string; goals: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function launchCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ status: 'active', launched_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pauseCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ status: 'paused', paused_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaigns(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('campaigns').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCampaignAudience(campaignId: string, audienceData: { name: string; criteria: Record<string, any>; size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaign_audiences').insert({ campaign_id: campaignId, ...audienceData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordCampaignMetric(campaignId: string, metricData: { metric_name: string; value: number; date?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaign_metrics').insert({ campaign_id: campaignId, ...metricData, date: metricData.date || new Date().toISOString().split('T')[0], created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaignMetrics(campaignId: string, options?: { metric_name?: string; date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('campaign_metrics').select('*').eq('campaign_id', campaignId); if (options?.metric_name) query = query.eq('metric_name', options.metric_name); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
