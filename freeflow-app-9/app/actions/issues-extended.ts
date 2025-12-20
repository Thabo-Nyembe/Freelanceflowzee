'use server'

/**
 * Extended Issues Server Actions
 * Tables: issues, issue_comments, issue_labels, issue_assignees, issue_milestones, issue_attachments
 */

import { createClient } from '@/lib/supabase/server'

export async function getIssue(issueId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issues').select('*, issue_comments(*), issue_labels(*), issue_assignees(*), issue_attachments(*)').eq('id', issueId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createIssue(issueData: { title: string; description?: string; project_id: string; created_by: string; priority?: string; type?: string; milestone_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issues').insert({ ...issueData, status: 'open', number: await getNextIssueNumber(issueData.project_id), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function getNextIssueNumber(projectId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase.from('issues').select('number').eq('project_id', projectId).order('number', { ascending: false }).limit(1).single()
  return (data?.number || 0) + 1
}

export async function updateIssue(issueId: string, updates: Partial<{ title: string; description: string; status: string; priority: string; type: string; milestone_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issues').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', issueId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeIssue(issueId: string, closedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issues').update({ status: 'closed', closed_by: closedBy, closed_at: new Date().toISOString() }).eq('id', issueId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reopenIssue(issueId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issues').update({ status: 'open', closed_by: null, closed_at: null, updated_at: new Date().toISOString() }).eq('id', issueId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIssues(options?: { project_id?: string; status?: string; priority?: string; type?: string; milestone_id?: string; created_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('issues').select('*, issue_labels(*), issue_assignees(*)'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.type) query = query.eq('type', options.type); if (options?.milestone_id) query = query.eq('milestone_id', options.milestone_id); if (options?.created_by) query = query.eq('created_by', options.created_by); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addIssueComment(commentData: { issue_id: string; author_id: string; content: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issue_comments').insert({ ...commentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIssueComments(issueId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issue_comments').select('*').eq('issue_id', issueId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addIssueLabel(issueId: string, labelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issue_labels').insert({ issue_id: issueId, label_id: labelId, added_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeIssueLabel(issueId: string, labelId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('issue_labels').delete().eq('issue_id', issueId).eq('label_id', labelId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignIssue(issueId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issue_assignees').insert({ issue_id: issueId, user_id: userId, assigned_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unassignIssue(issueId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('issue_assignees').delete().eq('issue_id', issueId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIssueMilestones(projectId: string, options?: { is_open?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('issue_milestones').select('*').eq('project_id', projectId); if (options?.is_open !== undefined) query = query.eq('is_open', options.is_open); const { data, error } = await query.order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addIssueAttachment(attachmentData: { issue_id: string; file_name: string; file_url: string; file_size: number; file_type: string; uploaded_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issue_attachments').insert({ ...attachmentData, uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIssueAttachments(issueId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('issue_attachments').select('*').eq('issue_id', issueId).order('uploaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
