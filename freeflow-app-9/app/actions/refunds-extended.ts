'use server'

/**
 * Extended Refunds Server Actions
 * Tables: refunds, refund_items, refund_requests, refund_policies, refund_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getRefund(refundId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').select('*, refund_items(*), transactions(*), orders(*), users(*), refund_history(*)').eq('id', refundId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRefundRequest(requestData: { order_id?: string; transaction_id?: string; customer_id: string; amount: number; reason: string; description?: string; items?: { item_id: string; quantity: number; amount: number }[] }) {
  try { const supabase = await createClient(); const { items, ...refundInfo } = requestData; const refundNumber = `REF-${Date.now()}`; const { data: refund, error: refundError } = await supabase.from('refunds').insert({ ...refundInfo, refund_number: refundNumber, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (refundError) throw refundError; if (items && items.length > 0) { const itemsData = items.map(item => ({ refund_id: refund.id, ...item, created_at: new Date().toISOString() })); await supabase.from('refund_items').insert(itemsData) } await supabase.from('refund_history').insert({ refund_id: refund.id, action: 'created', status: 'pending', user_id: requestData.customer_id, created_at: new Date().toISOString() }); return { success: true, data: refund } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveRefund(refundId: string, approverId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: approverId, notes, updated_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; await supabase.from('refund_history').insert({ refund_id: refundId, action: 'approved', status: 'approved', user_id: approverId, notes, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectRefund(refundId: string, rejectorId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').update({ status: 'rejected', rejected_at: new Date().toISOString(), rejected_by: rejectorId, rejection_reason: reason, updated_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; await supabase.from('refund_history').insert({ refund_id: refundId, action: 'rejected', status: 'rejected', user_id: rejectorId, notes: reason, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function processRefund(refundId: string, processorId: string, transactionDetails?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').update({ status: 'processed', processed_at: new Date().toISOString(), processed_by: processorId, transaction_details: transactionDetails, updated_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; await supabase.from('refund_history').insert({ refund_id: refundId, action: 'processed', status: 'processed', user_id: processorId, details: transactionDetails, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRefunds(options?: { customer_id?: string; order_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('refunds').select('*, refund_items(count), users(*), orders(*)'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.order_id) query = query.eq('order_id', options.order_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); if (options?.search) query = query.ilike('refund_number', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPendingRefunds(options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refunds').select('*, refund_items(count), users(*), orders(*)').eq('status', 'pending').order('created_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRefundHistory(refundId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('refund_history').select('*, users(*)').eq('refund_id', refundId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRefundPolicies(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('refund_policies').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRefundStats(options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('refunds').select('status, amount'); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const refunds = data || []; const total = refunds.length; const pending = refunds.filter(r => r.status === 'pending').length; const approved = refunds.filter(r => r.status === 'approved').length; const processed = refunds.filter(r => r.status === 'processed').length; const rejected = refunds.filter(r => r.status === 'rejected').length; const totalAmount = refunds.filter(r => r.status === 'processed').reduce((sum, r) => sum + (r.amount || 0), 0); const pendingAmount = refunds.filter(r => r.status === 'pending' || r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0); return { success: true, data: { total, pending, approved, processed, rejected, totalAmount, pendingAmount } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomerRefunds(customerId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('refunds').select('*, refund_items(count), orders(*)').eq('customer_id', customerId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
