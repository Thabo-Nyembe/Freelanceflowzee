'use server'

/**
 * Extended Approval Server Actions - Covers all Approval-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getApprovals(userId?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('approvals').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.or(`requester_id.eq.${userId},approver_id.eq.${userId}`); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createApproval(requesterId: string, approverId: string, itemId: string, itemType: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('approvals').insert({ requester_id: requesterId, approver_id: approverId, item_id: itemId, item_type: itemType, reason, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approve(approvalId: string, approverId: string, note?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('approvals').update({ status: 'approved', approver_note: note, approved_at: new Date().toISOString() }).eq('id', approvalId).eq('approver_id', approverId).eq('status', 'pending').select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reject(approvalId: string, approverId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('approvals').update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date().toISOString() }).eq('id', approvalId).eq('approver_id', approverId).eq('status', 'pending').select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelApproval(approvalId: string, requesterId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('approvals').update({ status: 'cancelled' }).eq('id', approvalId).eq('requester_id', requesterId).eq('status', 'pending'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingApprovals(approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('approvals').select('*').eq('approver_id', approverId).eq('status', 'pending').order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPendingApprovalCount(approverId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('approver_id', approverId).eq('status', 'pending'); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getApprovalHistory(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('approvals').select('*').eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMultiLevelApproval(requesterId: string, approverIds: string[], itemId: string, itemType: string, reason?: string) {
  try { const supabase = await createClient(); const approvals = approverIds.map((approverId, index) => ({ requester_id: requesterId, approver_id: approverId, item_id: itemId, item_type: itemType, reason, status: index === 0 ? 'pending' : 'waiting', level: index + 1 })); const { data, error } = await supabase.from('approvals').insert(approvals).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
