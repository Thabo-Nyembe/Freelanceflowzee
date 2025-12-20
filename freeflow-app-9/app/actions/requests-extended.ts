'use server'

/**
 * Extended Requests Server Actions
 * Tables: requests, request_types, request_comments, request_attachments, request_approvals, request_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getRequest(requestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').select('*, request_types(*), request_comments(*), request_attachments(*), request_approvals(*), requester:requester_id(*), assignee:assignee_id(*)').eq('id', requestId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRequest(requestData: { type_id: string; requester_id: string; title: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; category?: string; due_date?: string; assignee_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const requestNumber = `REQ-${Date.now()}`; const { data, error } = await supabase.from('requests').insert({ ...requestData, request_number: requestNumber, status: 'open', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('request_history').insert({ request_id: data.id, action: 'created', user_id: requestData.requester_id, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRequest(requestId: string, updates: Partial<{ title: string; description: string; priority: string; category: string; due_date: string; assignee_id: string; status: string; metadata: any }>, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; await supabase.from('request_history').insert({ request_id: requestId, action: 'updated', user_id: userId, changes: updates, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignRequest(requestId: string, assigneeId: string, assignedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').update({ assignee_id: assigneeId, assigned_at: new Date().toISOString(), status: 'assigned', updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; await supabase.from('request_history').insert({ request_id: requestId, action: 'assigned', user_id: assignedBy, details: { assignee_id: assigneeId }, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startRequest(requestId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').update({ status: 'in_progress', started_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; await supabase.from('request_history').insert({ request_id: requestId, action: 'started', user_id: userId, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeRequest(requestId: string, userId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').update({ status: 'completed', completed_at: new Date().toISOString(), resolution, updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; await supabase.from('request_history').insert({ request_id: requestId, action: 'completed', user_id: userId, details: { resolution }, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeRequest(requestId: string, userId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').update({ status: 'closed', closed_at: new Date().toISOString(), close_reason: reason, updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; await supabase.from('request_history').insert({ request_id: requestId, action: 'closed', user_id: userId, details: { reason }, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequests(options?: { requester_id?: string; assignee_id?: string; type_id?: string; status?: string; priority?: string; category?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('requests').select('*, request_types(*), requester:requester_id(*), assignee:assignee_id(*), request_comments(count)'); if (options?.requester_id) query = query.eq('requester_id', options.requester_id); if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.category) query = query.eq('category', options.category); if (options?.search) query = query.or(`title.ilike.%${options.search}%,request_number.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRequestTypes(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('request_types').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRequestComment(requestId: string, commentData: { user_id: string; content: string; is_internal?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('request_comments').insert({ request_id: requestId, ...commentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('requests').update({ updated_at: new Date().toISOString() }).eq('id', requestId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequestComments(requestId: string, options?: { is_internal?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('request_comments').select('*, users(*)').eq('request_id', requestId); if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal); const { data, error } = await query.order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRequestAttachment(requestId: string, attachmentData: { user_id: string; file_name: string; file_url: string; file_type?: string; file_size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('request_attachments').insert({ request_id: requestId, ...attachmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequestHistory(requestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('request_history').select('*, users(*)').eq('request_id', requestId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function requestApproval(requestId: string, approvalData: { approver_id: string; level?: number; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('request_approvals').insert({ request_id: requestId, ...approvalData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('requests').update({ status: 'pending_approval', updated_at: new Date().toISOString() }).eq('id', requestId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveRequest(approvalId: string, approverId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('request_approvals').update({ status: 'approved', approved_at: new Date().toISOString(), notes, updated_at: new Date().toISOString() }).eq('id', approvalId).eq('approver_id', approverId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectRequest(approvalId: string, approverId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('request_approvals').update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: reason, updated_at: new Date().toISOString() }).eq('id', approvalId).eq('approver_id', approverId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequestStats(options?: { requester_id?: string; assignee_id?: string; type_id?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('requests').select('status, priority'); if (options?.requester_id) query = query.eq('requester_id', options.requester_id); if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const requests = data || []; const total = requests.length; const open = requests.filter(r => r.status === 'open').length; const inProgress = requests.filter(r => r.status === 'in_progress').length; const completed = requests.filter(r => r.status === 'completed').length; const closed = requests.filter(r => r.status === 'closed').length; const byPriority: { [key: string]: number } = {}; requests.forEach(r => { byPriority[r.priority || 'medium'] = (byPriority[r.priority || 'medium'] || 0) + 1 }); return { success: true, data: { total, open, inProgress, completed, closed, byPriority } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
