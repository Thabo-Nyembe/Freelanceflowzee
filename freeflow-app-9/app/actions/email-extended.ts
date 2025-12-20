'use server'

/**
 * Extended Email Server Actions - Covers all 14 Email-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getEmailAgentApprovals(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_agent_approvals').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEmailAgentApproval(userId: string, messageId: string, action: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_agent_approvals').insert({ user_id: userId, message_id: messageId, action, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailAgentConfig(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_agent_config').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEmailAgentConfig(userId: string, config: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_agent_config').upsert({ user_id: userId, ...config }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailAgentMessages(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_agent_messages').select('*').eq('user_id', userId).order('received_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmailAgentResponses(messageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_agent_responses').select('*').eq('message_id', messageId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEmailAgentResponse(messageId: string, responseContent: string, status: string = 'draft') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_agent_responses').insert({ message_id: messageId, response_content: responseContent, status }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailAnalysis(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_analysis').select('*').eq('user_id', userId).order('analyzed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmailAttachments(emailId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_attachments').select('*').eq('email_id', emailId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addEmailAttachment(emailId: string, input: { name: string; url: string; size: number; type: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_attachments').insert({ email_id: emailId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailCampaignLinks(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_campaign_links').select('*').eq('campaign_id', campaignId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackEmailCampaignLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_campaign_links').update({ clicks: supabase.sql`clicks + 1` }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailCampaignRecipients(campaignId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_campaign_recipients').select('*').eq('campaign_id', campaignId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addEmailCampaignRecipient(campaignId: string, email: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_campaign_recipients').insert({ campaign_id: campaignId, email, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailConfigs(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_configs').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEmailConfig(userId: string, input: { name: string; smtp_host: string; smtp_port: number; username: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_configs').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailImportJobs(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_import_jobs').select('*').eq('user_id', userId).order('started_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEmailImportJob(userId: string, source: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_import_jobs').insert({ user_id: userId, source, status: 'pending', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmailMessages(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_messages').select('*').eq('user_id', userId).order('received_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmailResponses(emailId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_responses').select('*').eq('email_id', emailId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmailSegments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_segments').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEmailSegment(userId: string, input: { name: string; conditions: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_segments').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEmailVerificationToken(email: string) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const { data, error } = await supabase.from('email_verification_tokens').insert({ email, token, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyEmailToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('email_verification_tokens').update({ is_used: true, used_at: new Date().toISOString() }).eq('token', token).eq('is_used', false).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
