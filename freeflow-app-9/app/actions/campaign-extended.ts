'use server'

/**
 * Extended Campaign Server Actions - Covers all Campaign-related tables
 * Tables: campaigns, campaign_contacts, campaign_metrics, campaign_templates
 */

import { createClient } from '@/lib/supabase/server'

export async function getCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').select('*, campaign_contacts(*), campaign_metrics(*)').eq('id', campaignId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCampaign(campaignData: { name: string; description?: string; user_id: string; campaign_type: string; status?: string; subject?: string; content?: string; template_id?: string; scheduled_at?: string; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').insert({ ...campaignData, status: campaignData.status || 'draft', sent_count: 0, open_count: 0, click_count: 0, bounce_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCampaign(campaignId: string, updates: Partial<{ name: string; description: string; subject: string; content: string; template_id: string; scheduled_at: string; status: string; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCampaign(campaignId: string) {
  try { const supabase = await createClient(); await supabase.from('campaign_contacts').delete().eq('campaign_id', campaignId); await supabase.from('campaign_metrics').delete().eq('campaign_id', campaignId); const { error } = await supabase.from('campaigns').delete().eq('id', campaignId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaigns(userId: string, options?: { status?: string; campaign_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('campaigns').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.campaign_type) query = query.eq('campaign_type', options.campaign_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function launchCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ status: 'active', launched_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pauseCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ status: 'paused', updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaigns').update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addCampaignContact(contactData: { campaign_id: string; contact_id?: string; email: string; name?: string; status?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaign_contacts').insert({ ...contactData, status: contactData.status || 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addCampaignContacts(campaignId: string, contacts: { email: string; name?: string; metadata?: Record<string, any> }[]) {
  try { const supabase = await createClient(); const contactsData = contacts.map(c => ({ campaign_id: campaignId, email: c.email, name: c.name, metadata: c.metadata, status: 'pending', created_at: new Date().toISOString() })); const { data, error } = await supabase.from('campaign_contacts').insert(contactsData).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCampaignContacts(campaignId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('campaign_contacts').select('*').eq('campaign_id', campaignId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateCampaignContactStatus(contactId: string, status: string, metadata?: { opened_at?: string; clicked_at?: string; bounced_at?: string; unsubscribed_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaign_contacts').update({ status, ...metadata, updated_at: new Date().toISOString() }).eq('id', contactId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordCampaignMetric(metricData: { campaign_id: string; metric_type: string; value: number; date?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaign_metrics').insert({ ...metricData, date: metricData.date || new Date().toISOString().split('T')[0], created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaignMetrics(campaignId: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('campaign_metrics').select('*').eq('campaign_id', campaignId); if (options?.startDate) query = query.gte('date', options.startDate); if (options?.endDate) query = query.lte('date', options.endDate); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCampaignStats(campaignId: string) {
  try { const supabase = await createClient(); const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', campaignId).single(); if (!campaign) return { success: false, error: 'Campaign not found' }; const { data: contacts } = await supabase.from('campaign_contacts').select('status').eq('campaign_id', campaignId); const contactStats = (contacts || []).reduce((acc: Record<string, number>, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc }, {}); const openRate = campaign.sent_count > 0 ? (campaign.open_count / campaign.sent_count) * 100 : 0; const clickRate = campaign.open_count > 0 ? (campaign.click_count / campaign.open_count) * 100 : 0; const bounceRate = campaign.sent_count > 0 ? (campaign.bounce_count / campaign.sent_count) * 100 : 0; return { success: true, data: { campaign, contactStats, totalContacts: contacts?.length || 0, openRate, clickRate, bounceRate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaignTemplate(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaign_templates').select('*').eq('id', templateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaignTemplates(userId: string, options?: { category?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('campaign_templates').select('*'); if (options?.is_public) { query = query.or(`user_id.eq.${userId},is_public.eq.true`) } else { query = query.eq('user_id', userId) } if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCampaignTemplate(templateData: { name: string; description?: string; user_id: string; category?: string; subject?: string; content: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('campaign_templates').insert({ ...templateData, is_public: templateData.is_public || false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateCampaign(campaignId: string, newName?: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('campaigns').select('*').eq('id', campaignId).single(); if (!original) return { success: false, error: 'Campaign not found' }; const { id, created_at, updated_at, launched_at, completed_at, sent_count, open_count, click_count, bounce_count, ...rest } = original; const { data, error } = await supabase.from('campaigns').insert({ ...rest, name: newName || `${original.name} (Copy)`, status: 'draft', sent_count: 0, open_count: 0, click_count: 0, bounce_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
