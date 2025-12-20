'use server'

/**
 * Extended Newsletters Server Actions
 * Tables: newsletters, newsletter_subscribers, newsletter_campaigns, newsletter_templates, newsletter_analytics, newsletter_segments
 */

import { createClient } from '@/lib/supabase/server'

export async function getNewsletter(newsletterId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletters').select('*, newsletter_templates(*), newsletter_segments(*)').eq('id', newsletterId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createNewsletter(newsletterData: { name: string; description?: string; organization_id?: string; from_email?: string; from_name?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletters').insert({ ...newsletterData, status: 'active', subscriber_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNewsletter(newsletterId: string, updates: Partial<{ name: string; description: string; from_email: string; from_name: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletters').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', newsletterId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNewsletters(options?: { organization_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('newsletters').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function subscribe(subscriberData: { newsletter_id: string; email: string; name?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_subscribers').insert({ ...subscriberData, status: 'active', subscribed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('newsletters').update({ subscriber_count: supabase.sql`subscriber_count + 1` }).eq('id', subscriberData.newsletter_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unsubscribe(subscriberId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_subscribers').update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('id', subscriberId).select().single(); if (error) throw error; await supabase.from('newsletters').update({ subscriber_count: supabase.sql`subscriber_count - 1` }).eq('id', data.newsletter_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubscribers(newsletterId: string, options?: { status?: string; segment_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('newsletter_subscribers').select('*').eq('newsletter_id', newsletterId); if (options?.status) query = query.eq('status', options.status); if (options?.segment_id) query = query.contains('segment_ids', [options.segment_id]); const { data, error } = await query.order('subscribed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCampaign(campaignData: { newsletter_id: string; name: string; subject: string; content: string; template_id?: string; segment_ids?: string[]; scheduled_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_campaigns').insert({ ...campaignData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCampaign(campaignId: string, updates: Partial<{ name: string; subject: string; content: string; template_id: string; segment_ids: string[]; scheduled_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_campaigns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendCampaign(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_campaigns').update({ status: 'sending', sent_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaigns(newsletterId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('newsletter_campaigns').select('*').eq('newsletter_id', newsletterId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTemplate(templateData: { newsletter_id: string; name: string; subject?: string; content: string; category?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_templates').insert({ ...templateData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplates(newsletterId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_templates').select('*').eq('newsletter_id', newsletterId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordAnalytics(analyticsData: { campaign_id: string; subscriber_id?: string; event_type: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_analytics').insert({ ...analyticsData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCampaignAnalytics(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_analytics').select('event_type').eq('campaign_id', campaignId); if (error) throw error; const stats = { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }; data?.forEach(a => { if (stats[a.event_type as keyof typeof stats] !== undefined) stats[a.event_type as keyof typeof stats]++ }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSegment(segmentData: { newsletter_id: string; name: string; description?: string; conditions: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('newsletter_segments').insert({ ...segmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
