'use server'

/**
 * Extended Transactions Server Actions
 * Tables: transactions, transaction_items, transaction_fees, transaction_refunds, transaction_disputes, transaction_logs
 */

import { createClient } from '@/lib/supabase/server'

export async function getTransaction(transactionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transactions').select('*, transaction_items(*), transaction_fees(*), transaction_refunds(*)').eq('id', transactionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTransaction(transactionData: { transaction_type: string; amount: number; currency?: string; sender_id?: string; recipient_id?: string; reference?: string; description?: string; payment_method?: string; items?: any[]; metadata?: any }) {
  try { const supabase = await createClient(); const transactionNumber = `TXN-${Date.now()}`; const { data: transaction, error: txnError } = await supabase.from('transactions').insert({ ...transactionData, transaction_number: transactionNumber, currency: transactionData.currency || 'USD', status: 'pending', net_amount: transactionData.amount, created_at: new Date().toISOString() }).select().single(); if (txnError) throw txnError; if (transactionData.items && transactionData.items.length > 0) { const itemRecords = transactionData.items.map(item => ({ transaction_id: transaction.id, ...item, created_at: new Date().toISOString() })); await supabase.from('transaction_items').insert(itemRecords) } await logTransaction(transaction.id, 'created', { amount: transactionData.amount }); return { success: true, data: transaction } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTransaction(transactionId: string, updates: Partial<{ status: string; payment_method: string; external_id: string; processed_at: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('transactions').select('status').eq('id', transactionId).single(); const { data, error } = await supabase.from('transactions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', transactionId).select().single(); if (error) throw error; if (updates.status && updates.status !== current?.status) { await logTransaction(transactionId, 'status_changed', { from: current?.status, to: updates.status }) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransactions(options?: { transaction_type?: string; status?: string; sender_id?: string; recipient_id?: string; payment_method?: string; from_date?: string; to_date?: string; min_amount?: number; max_amount?: number; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('transactions').select('*, transaction_items(count)'); if (options?.transaction_type) query = query.eq('transaction_type', options.transaction_type); if (options?.status) query = query.eq('status', options.status); if (options?.sender_id) query = query.eq('sender_id', options.sender_id); if (options?.recipient_id) query = query.eq('recipient_id', options.recipient_id); if (options?.payment_method) query = query.eq('payment_method', options.payment_method); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); if (options?.min_amount) query = query.gte('amount', options.min_amount); if (options?.max_amount) query = query.lte('amount', options.max_amount); if (options?.search) query = query.or(`transaction_number.ilike.%${options.search}%,reference.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function processTransaction(transactionId: string, processingDetails?: { external_id?: string; processor_response?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transactions').update({ status: 'completed', external_id: processingDetails?.external_id, processor_response: processingDetails?.processor_response, processed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', transactionId).select().single(); if (error) throw error; await logTransaction(transactionId, 'processed', processingDetails); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failTransaction(transactionId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transactions').update({ status: 'failed', failure_reason: reason, updated_at: new Date().toISOString() }).eq('id', transactionId).select().single(); if (error) throw error; await logTransaction(transactionId, 'failed', { reason }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addFee(transactionId: string, feeData: { fee_type: string; amount: number; description?: string; is_refundable?: boolean }) {
  try { const supabase = await createClient(); const { data: fee, error } = await supabase.from('transaction_fees').insert({ transaction_id: transactionId, ...feeData, is_refundable: feeData.is_refundable ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await recalculateNetAmount(transactionId); return { success: true, data: fee } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateNetAmount(transactionId: string) {
  const supabase = await createClient()
  const { data: transaction } = await supabase.from('transactions').select('amount').eq('id', transactionId).single()
  const { data: fees } = await supabase.from('transaction_fees').select('amount').eq('transaction_id', transactionId)
  const totalFees = fees?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0
  const netAmount = (transaction?.amount || 0) - totalFees
  await supabase.from('transactions').update({ net_amount: netAmount, updated_at: new Date().toISOString() }).eq('id', transactionId)
}

export async function refundTransaction(transactionId: string, refundData: { amount: number; reason: string; refunded_by?: string }) {
  try { const supabase = await createClient(); const { data: transaction } = await supabase.from('transactions').select('amount, refunded_amount').eq('id', transactionId).single(); if (!transaction) return { success: false, error: 'Transaction not found' }; const currentRefunded = transaction.refunded_amount || 0; const maxRefundable = transaction.amount - currentRefunded; if (refundData.amount > maxRefundable) return { success: false, error: `Maximum refundable amount is ${maxRefundable}` }; const { data: refund, error } = await supabase.from('transaction_refunds').insert({ transaction_id: transactionId, amount: refundData.amount, reason: refundData.reason, refunded_by: refundData.refunded_by, status: 'pending', refund_number: `REF-${Date.now()}`, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const newRefundedAmount = currentRefunded + refundData.amount; const isFullyRefunded = newRefundedAmount >= transaction.amount; await supabase.from('transactions').update({ refunded_amount: newRefundedAmount, status: isFullyRefunded ? 'refunded' : 'partially_refunded', updated_at: new Date().toISOString() }).eq('id', transactionId); await logTransaction(transactionId, 'refunded', { amount: refundData.amount, reason: refundData.reason }); return { success: true, data: refund } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDispute(transactionId: string, disputeData: { dispute_type: string; reason: string; disputed_by: string; evidence?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transaction_disputes').insert({ transaction_id: transactionId, ...disputeData, status: 'open', dispute_number: `DSP-${Date.now()}`, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('transactions').update({ status: 'disputed', updated_at: new Date().toISOString() }).eq('id', transactionId); await logTransaction(transactionId, 'disputed', { dispute_type: disputeData.dispute_type }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveDispute(disputeId: string, resolution: { outcome: string; resolution_notes: string; resolved_by: string }) {
  try { const supabase = await createClient(); const { data: dispute } = await supabase.from('transaction_disputes').select('transaction_id').eq('id', disputeId).single(); const { data, error } = await supabase.from('transaction_disputes').update({ status: 'resolved', outcome: resolution.outcome, resolution_notes: resolution.resolution_notes, resolved_by: resolution.resolved_by, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', disputeId).select().single(); if (error) throw error; if (dispute?.transaction_id) { const newStatus = resolution.outcome === 'in_favor_of_buyer' ? 'refunded' : 'completed'; await supabase.from('transactions').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', dispute.transaction_id); await logTransaction(dispute.transaction_id, 'dispute_resolved', resolution) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function logTransaction(transactionId: string, action: string, details?: any) {
  const supabase = await createClient()
  await supabase.from('transaction_logs').insert({ transaction_id: transactionId, action, details, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getTransactionLogs(transactionId: string, options?: { action?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('transaction_logs').select('*').eq('transaction_id', transactionId); if (options?.action) query = query.eq('action', options.action); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStats(options?: { from_date?: string; to_date?: string; transaction_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('transactions').select('status, amount, net_amount, transaction_type'); if (options?.transaction_type) query = query.eq('transaction_type', options.transaction_type); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const transactions = data || []; return { success: true, data: { total: transactions.length, totalAmount: transactions.reduce((sum, t) => sum + (t.amount || 0), 0), totalNetAmount: transactions.reduce((sum, t) => sum + (t.net_amount || 0), 0), completed: transactions.filter(t => t.status === 'completed').length, pending: transactions.filter(t => t.status === 'pending').length, failed: transactions.filter(t => t.status === 'failed').length, refunded: transactions.filter(t => t.status === 'refunded' || t.status === 'partially_refunded').length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
