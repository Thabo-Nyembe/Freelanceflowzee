'use server'

/**
 * Extended Project Server Actions - Covers all 10 Project-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getProjectAccess(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_access').select('*').eq('project_id', projectId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function grantProjectAccess(projectId: string, userId: string, role: string, grantedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_access').insert({ project_id: projectId, user_id: userId, role, granted_by: grantedBy }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProjectAccess(accessId: string, role: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_access').update({ role }).eq('id', accessId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeProjectAccess(projectId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('project_access').delete().eq('project_id', projectId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectActivity(projectId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_activity').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logProjectActivity(projectId: string, userId: string, action: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_activity').insert({ project_id: projectId, user_id: userId, action, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectAnalyses(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_analyses').select('*').eq('project_id', projectId).order('analyzed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createProjectAnalysis(projectId: string, analysisType: string, results: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_analyses').insert({ project_id: projectId, analysis_type: analysisType, results, analyzed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectAnalytics(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_analytics').select('*').eq('project_id', projectId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProjectAnalytics(projectId: string, analytics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_analytics').upsert({ project_id: projectId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectBaselines(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_baselines').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createProjectBaseline(projectId: string, name: string, baselineData: any, createdBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_baselines').insert({ project_id: projectId, name, baseline_data: baselineData, created_by: createdBy }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectDeliverables(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_deliverables').select('*').eq('project_id', projectId).order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createProjectDeliverable(projectId: string, input: { name: string; description?: string; due_date: string; assigned_to?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_deliverables').insert({ project_id: projectId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProjectDeliverable(deliverableId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_deliverables').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', deliverableId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectFiles(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addProjectFile(projectId: string, input: { name: string; file_url: string; file_type: string; file_size: number; uploaded_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_files').insert({ project_id: projectId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProjectFile(fileId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('project_files').delete().eq('id', fileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectPhases(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_phases').select('*').eq('project_id', projectId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createProjectPhase(projectId: string, input: { name: string; description?: string; start_date?: string; end_date?: string; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_phases').insert({ project_id: projectId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProjectPhase(phaseId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_phases').update(updates).eq('id', phaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectProfitability(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_profitability').select('*').eq('project_id', projectId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProjectProfitability(projectId: string, profitability: { revenue?: number; costs?: number; profit_margin?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_profitability').upsert({ project_id: projectId, ...profitability, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectTemplates(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('project_templates').select('*').order('name', { ascending: true })
    if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createProjectTemplate(userId: string, input: { name: string; description?: string; template_data: any; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_templates').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProjectTemplate(templateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProjectTemplate(templateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('project_templates').delete().eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
