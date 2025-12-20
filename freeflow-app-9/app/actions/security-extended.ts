'use server'

/**
 * Extended Security Server Actions - Covers all 5 Security-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSecurityAudits(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_audits').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSecurityAudit(userId: string, input: { type: string; scope?: string; findings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_audits').insert({ user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSecurityAudit(auditId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_audits').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', auditId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeSecurityAudit(auditId: string, findings: any, score?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_audits').update({ status: 'completed', findings, score, completed_at: new Date().toISOString() }).eq('id', auditId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecurityEmailEvents(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_email_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSecurityEmailEvent(userId: string, input: { event_type: string; email_template_id?: string; recipient_email: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_email_events').insert({ user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSecurityEmailEventStatus(eventId: string, status: string, errorMessage?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_email_events').update({ status, error_message: errorMessage, sent_at: status === 'sent' ? new Date().toISOString() : null }).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecurityEmailTemplates() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_email_templates').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSecurityEmailTemplate(input: { name: string; subject: string; body: string; event_type: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_email_templates').insert({ ...input, is_active: input.is_active ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSecurityEmailTemplate(templateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_email_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSecurityEmailTemplate(templateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('security_email_templates').delete().eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecurityEvents(userId?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('security_events').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); const { data, error } = await query.limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSecurityEvent(input: { user_id?: string; event_type: string; severity: string; description: string; ip_address?: string; user_agent?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_events').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acknowledgeSecurityEvent(eventId: string, acknowledgedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_events').update({ is_acknowledged: true, acknowledged_by: acknowledgedBy, acknowledged_at: new Date().toISOString() }).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecuritySettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSecuritySettings(userId: string, settings: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_settings').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function enableTwoFactor(userId: string, method: string, secret?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_settings').upsert({ user_id: userId, two_factor_enabled: true, two_factor_method: method, two_factor_secret: secret, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function disableTwoFactor(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('security_settings').update({ two_factor_enabled: false, two_factor_method: null, two_factor_secret: null, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
