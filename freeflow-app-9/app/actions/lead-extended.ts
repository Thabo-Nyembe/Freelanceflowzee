'use server'

/**
 * Extended Lead Gen Server Actions - Covers all 7 Lead-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLeadGenCampaigns(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLeadGenCampaign(userId: string, input: { name: string; description?: string; start_date?: string; end_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_campaigns').insert({ user_id: userId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLeadGenCampaign(campaignId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_campaigns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', campaignId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeadGenFormFields(formId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_form_fields').select('*').eq('form_id', formId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLeadGenFormField(formId: string, input: { label: string; type: string; required?: boolean; options?: any; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_form_fields').insert({ form_id: formId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeadGenFormSubmissions(formId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_form_submissions').select('*').eq('form_id', formId).order('submitted_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitLeadGenForm(formId: string, submissionData: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_form_submissions').insert({ form_id: formId, submission_data: submissionData, submitted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeadGenForms(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_forms').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLeadGenForm(campaignId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_forms').insert({ campaign_id: campaignId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeadGenLandingPages(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_landing_pages').select('*').eq('campaign_id', campaignId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLeadGenLandingPage(campaignId: string, input: { name: string; slug: string; content?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_landing_pages').insert({ campaign_id: campaignId, ...input, is_published: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishLeadGenLandingPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_landing_pages').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeadGenLeads(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_leads').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLeadGenLead(campaignId: string, input: { email: string; name?: string; source?: string; data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_leads').insert({ campaign_id: campaignId, ...input, status: 'new' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLeadGenLeadStatus(leadId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_gen_leads').update({ status, updated_at: new Date().toISOString() }).eq('id', leadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeadScores(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_scores').select('*').eq('user_id', userId).order('score', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateLeadScore(leadId: string, score: number, factors?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_scores').upsert({ lead_id: leadId, score, factors, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
