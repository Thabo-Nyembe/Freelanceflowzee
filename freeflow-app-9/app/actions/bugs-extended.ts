'use server'

/**
 * Extended Bugs Server Actions
 * Tables: bugs, bug_comments, bug_attachments, bug_assignments
 */

import { createClient } from '@/lib/supabase/server'

export async function getBug(bugId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bugs').select('*, bug_comments(*), bug_attachments(*)').eq('id', bugId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBug(bugData: { reporter_id: string; project_id?: string; title: string; description: string; severity?: string; priority?: string; steps_to_reproduce?: string; expected_behavior?: string; actual_behavior?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bugs').insert({ ...bugData, status: 'open', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBug(bugId: string, updates: Partial<{ title: string; description: string; severity: string; priority: string; status: string; assignee_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bugs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', bugId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeBug(bugId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bugs').update({ status: 'closed', resolution, closed_at: new Date().toISOString() }).eq('id', bugId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reopenBug(bugId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bugs').update({ status: 'reopened', reopen_reason: reason, reopened_at: new Date().toISOString() }).eq('id', bugId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBugs(options?: { project_id?: string; reporter_id?: string; assignee_id?: string; status?: string; severity?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('bugs').select('*'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.reporter_id) query = query.eq('reporter_id', options.reporter_id); if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id); if (options?.status) query = query.eq('status', options.status); if (options?.severity) query = query.eq('severity', options.severity); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignBug(bugId: string, assigneeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bugs').update({ assignee_id: assigneeId, assigned_at: new Date().toISOString(), status: 'assigned' }).eq('id', bugId).select().single(); if (error) throw error; await supabase.from('bug_assignments').insert({ bug_id: bugId, assignee_id: assigneeId, assigned_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addBugComment(bugId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bug_comments').insert({ bug_id: bugId, user_id: userId, content, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBugStats(projectId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('bugs').select('status, severity'); if (projectId) query = query.eq('project_id', projectId); const { data } = await query; if (!data) return { success: true, data: { total: 0, byStatus: {}, bySeverity: {} } }; const total = data.length; const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {}); const bySeverity = data.reduce((acc: Record<string, number>, b) => { acc[b.severity || 'unknown'] = (acc[b.severity || 'unknown'] || 0) + 1; return acc }, {}); return { success: true, data: { total, byStatus, bySeverity } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, byStatus: {}, bySeverity: {} } } }
}
