'use server'

/**
 * Extended Refund Server Actions - Covers all Refund-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRefunds(status?: string, orderId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('refunds').select('*').order('created_at', { ascending: false }); if (status) query = query.eq('status', status); if (orderId) query = query.eq('order_id', orderId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRefund(refundId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').select('*').eq('id', refundId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRefund(input: { order_id: string; amount: number; reason: string; refund_type: string; items?: any[]; notes?: string; processed_by?: string }) {
  try { const supabase = await createClient(); const refundNumber = `REF-${Date.now()}`; const { data, error } = await supabase.from('refunds').insert({ refund_number: refundNumber, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveRefund(refundId: string, approvedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').update({ status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function processRefund(refundId: string, transactionId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').update({ status: 'processed', transaction_id: transactionId, processed_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectRefund(refundId: string, reason: string, rejectedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').update({ status: 'rejected', rejection_reason: reason, rejected_by: rejectedBy, rejected_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelRefund(refundId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').update({ status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRefundRequests(status?: string, userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('refund_requests').select('*').order('created_at', { ascending: false }); if (status) query = query.eq('status', status); if (userId) query = query.eq('user_id', userId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRefundRequest(requestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refund_requests').select('*').eq('id', requestId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRefundRequest(input: { user_id: string; order_id: string; amount: number; reason: string; reason_details?: string; items?: any[]; attachments?: string[] }) {
  try { const supabase = await createClient(); const requestNumber = `RR-${Date.now()}`; const { data, error } = await supabase.from('refund_requests').insert({ request_number: requestNumber, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRefundRequest(requestId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refund_requests').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveRefundRequest(requestId: string, approvedBy: string, refundAmount?: number) {
  try { const supabase = await createClient(); const { data: request, error: requestError } = await supabase.from('refund_requests').select('*').eq('id', requestId).single(); if (requestError) throw requestError; const { data, error } = await supabase.from('refund_requests').update({ status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString(), approved_amount: refundAmount || request.amount }).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectRefundRequest(requestId: string, reason: string, rejectedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refund_requests').update({ status: 'rejected', rejection_reason: reason, rejected_by: rejectedBy, rejected_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRefundStats(startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('refunds').select('status, amount'); if (startDate) query = query.gte('created_at', startDate); if (endDate) query = query.lte('created_at', endDate); const { data, error } = await query; if (error) throw error; const stats = { total: data?.length || 0, pending: data?.filter(r => r.status === 'pending').length || 0, approved: data?.filter(r => r.status === 'approved').length || 0, processed: data?.filter(r => r.status === 'processed').length || 0, rejected: data?.filter(r => r.status === 'rejected').length || 0, total_amount: data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0, processed_amount: data?.filter(r => r.status === 'processed').reduce((sum, r) => sum + (r.amount || 0), 0) || 0 }; return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
