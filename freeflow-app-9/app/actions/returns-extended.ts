'use server'

/**
 * Extended Returns Server Actions
 * Tables: returns, return_items, return_reasons, return_labels, return_inspections, return_policies
 */

import { createClient } from '@/lib/supabase/server'

export async function getReturn(returnId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('returns').select('*, return_items(*), return_reasons(*), return_labels(*), return_inspections(*), orders(*), users(*)').eq('id', returnId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReturn(returnData: { order_id: string; customer_id: string; reason_id?: string; reason_text?: string; items: { order_item_id: string; quantity: number; reason?: string }[]; return_method?: 'mail' | 'store' | 'pickup'; notes?: string }) {
  try { const supabase = await createClient(); const { items, ...returnInfo } = returnData; const returnNumber = `RET-${Date.now()}`; const { data: returnRecord, error: returnError } = await supabase.from('returns').insert({ ...returnInfo, return_number: returnNumber, status: 'requested', created_at: new Date().toISOString() }).select().single(); if (returnError) throw returnError; if (items && items.length > 0) { const itemsData = items.map(item => ({ return_id: returnRecord.id, ...item, status: 'pending', created_at: new Date().toISOString() })); await supabase.from('return_items').insert(itemsData) } return { success: true, data: returnRecord } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveReturn(returnId: string, approverId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('returns').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: approverId, approval_notes: notes, updated_at: new Date().toISOString() }).eq('id', returnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectReturn(returnId: string, rejecterId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('returns').update({ status: 'rejected', rejected_at: new Date().toISOString(), rejected_by: rejecterId, rejection_reason: reason, updated_at: new Date().toISOString() }).eq('id', returnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function generateReturnLabel(returnId: string, labelData: { carrier: string; tracking_number?: string; label_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('return_labels').insert({ return_id: returnId, ...labelData, status: 'generated', generated_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('returns').update({ status: 'label_generated', updated_at: new Date().toISOString() }).eq('id', returnId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markReturnShipped(returnId: string, trackingNumber?: string) {
  try { const supabase = await createClient(); const updates: any = { status: 'shipped', shipped_at: new Date().toISOString(), updated_at: new Date().toISOString() }; if (trackingNumber) updates.tracking_number = trackingNumber; const { data, error } = await supabase.from('returns').update(updates).eq('id', returnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markReturnReceived(returnId: string, receivedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('returns').update({ status: 'received', received_at: new Date().toISOString(), received_by: receivedBy, updated_at: new Date().toISOString() }).eq('id', returnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function inspectReturn(returnId: string, inspectionData: { inspector_id: string; items: { return_item_id: string; condition: string; is_acceptable: boolean; notes?: string }[]; overall_condition?: string; notes?: string }) {
  try { const supabase = await createClient(); const { items, ...inspectionInfo } = inspectionData; const { data: inspection, error: inspectionError } = await supabase.from('return_inspections').insert({ return_id: returnId, ...inspectionInfo, inspected_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (inspectionError) throw inspectionError; for (const item of items) { await supabase.from('return_items').update({ condition: item.condition, is_acceptable: item.is_acceptable, inspection_notes: item.notes, inspected_at: new Date().toISOString() }).eq('id', item.return_item_id) } const allAcceptable = items.every(i => i.is_acceptable); await supabase.from('returns').update({ status: allAcceptable ? 'inspected' : 'inspection_failed', updated_at: new Date().toISOString() }).eq('id', returnId); return { success: true, data: inspection } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function processRefund(returnId: string, refundData: { amount: number; method: string; processed_by: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('returns').update({ status: 'refunded', refund_amount: refundData.amount, refund_method: refundData.method, refunded_at: new Date().toISOString(), refunded_by: refundData.processed_by, refund_notes: refundData.notes, updated_at: new Date().toISOString() }).eq('id', returnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeReturn(returnId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('returns').update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', returnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReturns(options?: { customer_id?: string; order_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('returns').select('*, return_items(count), return_reasons(*), orders(*), users(*)'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.order_id) query = query.eq('order_id', options.order_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); if (options?.search) query = query.ilike('return_number', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReturnItems(returnId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('return_items').select('*, order_items(*)').eq('return_id', returnId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReturnReasons(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('return_reasons').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReturnPolicies(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('return_policies').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReturnStats(options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('returns').select('status, refund_amount'); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const returns = data || []; const total = returns.length; const requested = returns.filter(r => r.status === 'requested').length; const approved = returns.filter(r => r.status === 'approved').length; const shipped = returns.filter(r => r.status === 'shipped').length; const received = returns.filter(r => r.status === 'received').length; const refunded = returns.filter(r => r.status === 'refunded').length; const rejected = returns.filter(r => r.status === 'rejected').length; const totalRefunded = returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + (r.refund_amount || 0), 0); return { success: true, data: { total, requested, approved, shipped, received, refunded, rejected, totalRefunded } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
