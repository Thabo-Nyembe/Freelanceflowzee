'use server'

/**
 * Extended Transaction Server Actions - Covers all Transaction-related tables
 * Tables: transactions, transaction_fees, transaction_webhooks
 */

import { createClient } from '@/lib/supabase/server'

export async function getTransaction(transactionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transactions').select('*').eq('id', transactionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTransaction(txData: { user_id: string; amount: number; currency: string; type: string; status?: string; description?: string; reference_id?: string; reference_type?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transactions').insert({ ...txData, status: txData.status || 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTransaction(transactionId: string, updates: Partial<{ status: string; metadata: Record<string, any>; completed_at: string; error_message: string }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.status === 'completed' && !updates.completed_at) updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('transactions').update(updateData).eq('id', transactionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransactions(userId: string, options?: { type?: string; status?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('transactions').select('*', { count: 'exact' }).eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data, count, error } = await query.order('created_at', { ascending: false }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1); if (error) throw error; return { success: true, data: data || [], total: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function getTransactionsByReference(referenceType: string, referenceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transactions').select('*').eq('reference_type', referenceType).eq('reference_id', referenceId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTransactionStats(userId: string, options?: { period?: 'day' | 'week' | 'month' | 'year'; startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('transactions').select('amount, type, status, currency').eq('user_id', userId).eq('status', 'completed'); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data } = await query; const stats = { totalIn: 0, totalOut: 0, count: data?.length || 0, byType: {} as Record<string, number>, byCurrency: {} as Record<string, number> }; data?.forEach(tx => { if (tx.type === 'credit' || tx.type === 'deposit' || tx.type === 'refund') stats.totalIn += tx.amount; else stats.totalOut += tx.amount; stats.byType[tx.type] = (stats.byType[tx.type] || 0) + tx.amount; stats.byCurrency[tx.currency] = (stats.byCurrency[tx.currency] || 0) + tx.amount; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTransactionFee(feeData: { transaction_id: string; fee_type: string; amount: number; currency: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transaction_fees').insert({ ...feeData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransactionFees(transactionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transaction_fees').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTotalFees(userId: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('transaction_fees').select('amount, currency, transactions!inner(user_id)').eq('transactions.user_id', userId); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data } = await query; const totalByCurrency: Record<string, number> = {}; data?.forEach(fee => { totalByCurrency[fee.currency] = (totalByCurrency[fee.currency] || 0) + fee.amount; }); return { success: true, data: totalByCurrency } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTransactionWebhook(webhookData: { transaction_id: string; event_type: string; url: string; payload: Record<string, any>; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transaction_webhooks').insert({ ...webhookData, status: webhookData.status || 'pending', attempts: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTransactionWebhook(webhookId: string, updates: Partial<{ status: string; attempts: number; last_attempt_at: string; response: Record<string, any>; error_message: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transaction_webhooks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', webhookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransactionWebhooks(transactionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transaction_webhooks').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPendingTransactionWebhooks(limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transaction_webhooks').select('*, transactions(*)').eq('status', 'pending').lt('attempts', 5).order('created_at', { ascending: true }).limit(limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
