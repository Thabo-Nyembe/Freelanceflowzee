'use server'

/**
 * Extended Bug Server Actions - Covers all Bug-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBugReports(projectId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('bug_reports').select('*').order('created_at', { ascending: false }); if (projectId) query = query.eq('project_id', projectId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBugReport(bugId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bug_reports').select('*').eq('id', bugId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBugReport(reporterId: string, input: { title: string; description: string; project_id?: string; severity: string; priority?: string; steps_to_reproduce?: string; expected_behavior?: string; actual_behavior?: string; environment?: any; attachments?: string[] }) {
  try { const supabase = await createClient(); const bugNumber = `BUG-${Date.now()}`; const { data, error } = await supabase.from('bug_reports').insert({ reporter_id: reporterId, bug_number: bugNumber, ...input, status: 'open' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBugReport(bugId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bug_reports').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', bugId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignBugReport(bugId: string, assigneeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bug_reports').update({ assignee_id: assigneeId, status: 'assigned', assigned_at: new Date().toISOString() }).eq('id', bugId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBugStatus(bugId: string, status: string, resolution?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'resolved' || status === 'closed') { updates.resolved_at = new Date().toISOString(); updates.resolution = resolution; } const { data, error } = await supabase.from('bug_reports').update(updates).eq('id', bugId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBugReport(bugId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('bug_reports').delete().eq('id', bugId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBugComments(bugId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bug_comments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBugComment(bugId: string, userId: string, input: { content: string; is_internal?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bug_comments').insert({ bug_id: bugId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBugComment(commentId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bug_comments').update({ content, updated_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBugComment(commentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('bug_comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBugStats(projectId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('bug_reports').select('status, severity'); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query; if (error) throw error; const stats = { total: data?.length || 0, open: data?.filter(b => b.status === 'open').length || 0, in_progress: data?.filter(b => b.status === 'in_progress').length || 0, resolved: data?.filter(b => b.status === 'resolved').length || 0, critical: data?.filter(b => b.severity === 'critical').length || 0 }; return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
