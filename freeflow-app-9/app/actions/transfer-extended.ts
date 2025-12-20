'use server'

/**
 * Extended Transfer Server Actions - Covers all Transfer-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTransfer(transferId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').select('*').eq('id', transferId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTransfer(transferData: { transfer_type: string; source_type: string; source_id: string; destination_type: string; destination_id: string; entity_type?: string; entity_ids?: string[]; metadata?: Record<string, any>; user_id?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').insert({ ...transferData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTransferStatus(transferId: string, status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'rolled_back', updates?: { progress?: number; transferred_count?: number; failed_count?: number; error_message?: string }) {
  try { const supabase = await createClient(); const updateData: Record<string, any> = { status, updated_at: new Date().toISOString() }; if (updates?.progress !== undefined) updateData.progress = updates.progress; if (updates?.transferred_count !== undefined) updateData.transferred_count = updates.transferred_count; if (updates?.failed_count !== undefined) updateData.failed_count = updates.failed_count; if (updates?.error_message) updateData.error_message = updates.error_message; if (status === 'completed') updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('transfers').update(updateData).eq('id', transferId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveTransfer(transferId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() }).eq('id', transferId).eq('status', 'pending').select().single(); if (error) throw error; if (!data) return { success: false, error: 'Transfer not found or not pending' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectTransfer(transferId: string, rejecterId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').update({ status: 'rejected', rejected_by: rejecterId, rejected_at: new Date().toISOString(), rejection_reason: reason }).eq('id', transferId).eq('status', 'pending').select().single(); if (error) throw error; if (!data) return { success: false, error: 'Transfer not found or not pending' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelTransfer(transferId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', transferId).in('status', ['pending', 'approved']).select().single(); if (error) throw error; if (!data) return { success: false, error: 'Cannot cancel transfer' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rollbackTransfer(transferId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').update({ status: 'rolled_back', rolled_back_at: new Date().toISOString(), rollback_reason: reason }).eq('id', transferId).eq('status', 'completed').select().single(); if (error) throw error; if (!data) return { success: false, error: 'Transfer not found or not completed' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserTransfers(userId: string, options?: { status?: string; transferType?: string; direction?: 'sent' | 'received' }) {
  try { const supabase = await createClient(); let query = supabase.from('transfers').select('*'); if (options?.direction === 'sent') { query = query.eq('user_id', userId); } else if (options?.direction === 'received') { query = query.eq('destination_id', userId); } else { query = query.or(`user_id.eq.${userId},destination_id.eq.${userId}`); } if (options?.status) query = query.eq('status', options.status); if (options?.transferType) query = query.eq('transfer_type', options.transferType); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPendingTransfers(approverType: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').select('*').eq('status', 'pending').eq('requires_approval', true).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTransferHistory(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').select('*').eq('entity_type', entityType).contains('entity_ids', [entityId]).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
