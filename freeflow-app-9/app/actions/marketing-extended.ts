'use server'

/**
 * Extended Marketing Server Actions - Covers all Marketing-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMarketingCampaigns(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('marketing_campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMarketingCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_campaigns').select('*').eq('id', campaignId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMarketingCampaign(userId: string, input: { name: string; description?: string; type: string; budget?: number; start_date?: string; end_date?: string; target_audience?: any; channels?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_campaigns').insert({ user_id: userId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMarketingCampaign(campaignId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_campaigns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function launchMarketingCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_campaigns').update({ status: 'active', launched_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pauseMarketingCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_campaigns').update({ status: 'paused' }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endMarketingCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_campaigns').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMarketingCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('marketing_campaigns').delete().eq('id', campaignId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMarketingAssets(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_assets').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMarketingAsset(campaignId: string, input: { name: string; type: string; file_url?: string; content?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_assets').insert({ campaign_id: campaignId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMarketingAsset(assetId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_assets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', assetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveMarketingAsset(assetId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_assets').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() }).eq('id', assetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMarketingAsset(assetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('marketing_assets').delete().eq('id', assetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaignPerformance(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('marketing_campaigns').select('metrics, budget, spent').eq('id', campaignId).single(); if (error) throw error; return { success: true, data: { metrics: data?.metrics || {}, budget: data?.budget || 0, spent: data?.spent || 0, remaining: (data?.budget || 0) - (data?.spent || 0) } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
