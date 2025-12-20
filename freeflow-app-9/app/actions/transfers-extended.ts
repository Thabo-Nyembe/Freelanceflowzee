'use server'

/**
 * Extended Transfers Server Actions
 * Tables: transfers, transfer_items, transfer_approvals, transfer_history, transfer_schedules, transfer_batches
 */

import { createClient } from '@/lib/supabase/server'

export async function getTransfer(transferId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').select('*, transfer_items(*), transfer_approvals(*, users(*))').eq('id', transferId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTransfer(transferData: { transfer_type: string; from_id: string; from_type: string; to_id: string; to_type: string; amount?: number; currency?: string; items?: any[]; reason?: string; initiated_by: string; requires_approval?: boolean; scheduled_at?: string; metadata?: any }) {
  try { const supabase = await createClient(); const transferNumber = `TRF-${Date.now()}`; const { data: transfer, error: transferError } = await supabase.from('transfers').insert({ ...transferData, transfer_number: transferNumber, currency: transferData.currency || 'USD', status: transferData.requires_approval ? 'pending_approval' : 'pending', requires_approval: transferData.requires_approval ?? false, created_at: new Date().toISOString() }).select().single(); if (transferError) throw transferError; if (transferData.items && transferData.items.length > 0) { const itemRecords = transferData.items.map(item => ({ transfer_id: transfer.id, ...item, status: 'pending', created_at: new Date().toISOString() })); await supabase.from('transfer_items').insert(itemRecords) } await logHistory(transfer.id, 'created', { transfer_type: transferData.transfer_type }, transferData.initiated_by); return { success: true, data: transfer } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTransfer(transferId: string, updates: Partial<{ status: string; reason: string; scheduled_at: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', transferId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelTransfer(transferId: string, reason: string, cancelledBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfers').update({ status: 'cancelled', cancellation_reason: reason, cancelled_by: cancelledBy, cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', transferId).select().single(); if (error) throw error; await logHistory(transferId, 'cancelled', { reason }, cancelledBy); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransfers(options?: { transfer_type?: string; status?: string; from_id?: string; to_id?: string; initiated_by?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('transfers').select('*, transfer_items(count)'); if (options?.transfer_type) query = query.eq('transfer_type', options.transfer_type); if (options?.status) query = query.eq('status', options.status); if (options?.from_id) query = query.eq('from_id', options.from_id); if (options?.to_id) query = query.eq('to_id', options.to_id); if (options?.initiated_by) query = query.eq('initiated_by', options.initiated_by); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); if (options?.search) query = query.ilike('transfer_number', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function approveTransfer(transferId: string, approverId: string, comments?: string) {
  try { const supabase = await createClient(); await supabase.from('transfer_approvals').insert({ transfer_id: transferId, approver_id: approverId, status: 'approved', comments, approved_at: new Date().toISOString(), created_at: new Date().toISOString() }); const { data, error } = await supabase.from('transfers').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', transferId).select().single(); if (error) throw error; await logHistory(transferId, 'approved', { approver_id: approverId }, approverId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectTransfer(transferId: string, approverId: string, reason: string) {
  try { const supabase = await createClient(); await supabase.from('transfer_approvals').insert({ transfer_id: transferId, approver_id: approverId, status: 'rejected', comments: reason, created_at: new Date().toISOString() }); const { data, error } = await supabase.from('transfers').update({ status: 'rejected', rejection_reason: reason, updated_at: new Date().toISOString() }).eq('id', transferId).select().single(); if (error) throw error; await logHistory(transferId, 'rejected', { reason }, approverId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeTransfer(transferId: string, executedBy?: string) {
  try { const supabase = await createClient(); const { data: transfer } = await supabase.from('transfers').select('*, transfer_items(*)').eq('id', transferId).single(); if (!transfer) return { success: false, error: 'Transfer not found' }; if (transfer.requires_approval && transfer.status !== 'approved') { return { success: false, error: 'Transfer requires approval' } } await supabase.from('transfer_items').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('transfer_id', transferId); const { data, error } = await supabase.from('transfers').update({ status: 'completed', executed_by: executedBy, executed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', transferId).select().single(); if (error) throw error; await logHistory(transferId, 'executed', {}, executedBy); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getItems(transferId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfer_items').select('*').eq('transfer_id', transferId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

async function logHistory(transferId: string, action: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('transfer_history').insert({ transfer_id: transferId, action, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getHistory(transferId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfer_history').select('*, users(*)').eq('transfer_id', transferId).order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSchedule(scheduleData: { transfer_type: string; from_id: string; from_type: string; to_id: string; to_type: string; amount?: number; items?: any[]; frequency: string; start_date: string; end_date?: string; next_run?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transfer_schedules').insert({ ...scheduleData, next_run: scheduleData.next_run || scheduleData.start_date, status: 'active', run_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSchedules(options?: { transfer_type?: string; status?: string; from_id?: string; to_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('transfer_schedules').select('*'); if (options?.transfer_type) query = query.eq('transfer_type', options.transfer_type); if (options?.status) query = query.eq('status', options.status); if (options?.from_id) query = query.eq('from_id', options.from_id); if (options?.to_id) query = query.eq('to_id', options.to_id); const { data, error } = await query.order('next_run', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBatch(batchData: { name: string; transfer_type: string; transfers: any[]; created_by: string; scheduled_at?: string }) {
  try { const supabase = await createClient(); const { data: batch, error: batchError } = await supabase.from('transfer_batches').insert({ name: batchData.name, transfer_type: batchData.transfer_type, created_by: batchData.created_by, scheduled_at: batchData.scheduled_at, status: 'pending', transfer_count: batchData.transfers.length, created_at: new Date().toISOString() }).select().single(); if (batchError) throw batchError; for (const transferData of batchData.transfers) { await createTransfer({ ...transferData, batch_id: batch.id, initiated_by: batchData.created_by }) } return { success: true, data: batch } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeBatch(batchId: string, executedBy: string) {
  try { const supabase = await createClient(); const { data: transfers } = await supabase.from('transfers').select('id').eq('batch_id', batchId).eq('status', 'pending'); for (const transfer of transfers || []) { await executeTransfer(transfer.id, executedBy) } const { data, error } = await supabase.from('transfer_batches').update({ status: 'completed', executed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', batchId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
