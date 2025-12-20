'use server'

/**
 * Extended Leads Server Actions
 * Tables: leads, lead_sources, lead_stages, lead_activities, lead_scores, lead_assignments
 */

import { createClient } from '@/lib/supabase/server'

export async function getLead(leadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('leads').select('*, lead_sources(*), lead_stages(*), lead_activities(*), lead_scores(*)').eq('id', leadId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLead(leadData: { first_name: string; last_name?: string; email?: string; phone?: string; company?: string; source_id?: string; stage_id?: string; owner_id?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('leads').insert({ ...leadData, status: 'new', score: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLead(leadId: string, updates: Partial<{ first_name: string; last_name: string; email: string; phone: string; company: string; stage_id: string; status: string; owner_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('leads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', leadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLead(leadId: string) {
  try { const supabase = await createClient(); await supabase.from('lead_activities').delete().eq('lead_id', leadId); const { error } = await supabase.from('leads').delete().eq('id', leadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeads(options?: { owner_id?: string; stage_id?: string; source_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('leads').select('*, lead_sources(*), lead_stages(*)'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.stage_id) query = query.eq('stage_id', options.stage_id); if (options?.source_id) query = query.eq('source_id', options.source_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%,company.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function moveLeadToStage(leadId: string, stageId: string, userId?: string) {
  try { const supabase = await createClient(); const { data: lead } = await supabase.from('leads').select('stage_id').eq('id', leadId).single(); const { data, error } = await supabase.from('leads').update({ stage_id: stageId, updated_at: new Date().toISOString() }).eq('id', leadId).select().single(); if (error) throw error; await supabase.from('lead_activities').insert({ lead_id: leadId, type: 'stage_change', description: `Moved to new stage`, from_stage_id: lead?.stage_id, to_stage_id: stageId, performed_by: userId, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function convertLeadToContact(leadId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('leads').update({ status: 'converted', converted_at: new Date().toISOString(), converted_by: userId }).eq('id', leadId).select().single(); if (error) throw error; await supabase.from('lead_activities').insert({ lead_id: leadId, type: 'conversion', description: 'Lead converted to contact', performed_by: userId, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addLeadActivity(activityData: { lead_id: string; type: string; description: string; performed_by?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_activities').insert({ ...activityData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLeadActivities(leadId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('lead_activities').select('*').eq('lead_id', leadId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLeadSources() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_sources').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLeadStages() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lead_stages').select('*').order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateLeadScore(leadId: string, score: number, reason?: string) {
  try { const supabase = await createClient(); await supabase.from('lead_scores').insert({ lead_id: leadId, score, reason, created_at: new Date().toISOString() }); const { data, error } = await supabase.from('leads').update({ score, updated_at: new Date().toISOString() }).eq('id', leadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignLead(leadId: string, ownerId: string, assignedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('leads').update({ owner_id: ownerId, updated_at: new Date().toISOString() }).eq('id', leadId).select().single(); if (error) throw error; await supabase.from('lead_assignments').insert({ lead_id: leadId, assigned_to: ownerId, assigned_by: assignedBy, assigned_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
