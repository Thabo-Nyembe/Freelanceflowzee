'use server'

/**
 * Extended Payment Server Actions - Covers Payment-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPaymentMethods(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_methods').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPaymentMethod(userId: string, input: { type: string; provider: string; last_four?: string; expiry_month?: number; expiry_year?: number; is_default?: boolean }) {
  try { const supabase = await createClient(); if (input.is_default) { await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId); } const { data, error } = await supabase.from('payment_methods').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefaultPaymentMethod(methodId: string, userId: string) {
  try { const supabase = await createClient(); await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', userId); const { data, error } = await supabase.from('payment_methods').update({ is_default: true }).eq('id', methodId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('payment_methods').delete().eq('id', methodId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentTransactions(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('payment_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPaymentTransaction(userId: string, input: { amount: number; currency: string; payment_method_id?: string; description?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_transactions').insert({ user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePaymentTransactionStatus(transactionId: string, status: string, providerData?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_transactions').update({ status, provider_data: providerData, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', transactionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentSubscriptions(userId: string, activeOnly = false) {
  try { const supabase = await createClient(); let query = supabase.from('payment_subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (activeOnly) query = query.eq('status', 'active'); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPaymentSubscription(userId: string, input: { plan_id: string; payment_method_id: string; interval: string; amount: number; currency: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_subscriptions').insert({ user_id: userId, ...input, status: 'active', current_period_start: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelPaymentSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  try { const supabase = await createClient(); const updates: any = cancelAtPeriodEnd ? { cancel_at_period_end: true } : { status: 'cancelled', cancelled_at: new Date().toISOString() }; const { data, error } = await supabase.from('payment_subscriptions').update(updates).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentInvoices(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('payment_invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPaymentInvoice(userId: string, input: { amount: number; currency: string; due_date: string; line_items: any[]; description?: string }) {
  try { const supabase = await createClient(); const invoiceNumber = `INV-${Date.now()}`; const { data, error } = await supabase.from('payment_invoices').insert({ user_id: userId, invoice_number: invoiceNumber, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendPaymentInvoice(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_invoices').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markPaymentInvoicePaid(invoiceId: string, transactionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_invoices').update({ status: 'paid', paid_at: new Date().toISOString(), transaction_id: transactionId }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentRefunds(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_refunds').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPaymentRefund(userId: string, transactionId: string, input: { amount: number; reason: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_refunds').insert({ user_id: userId, transaction_id: transactionId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function processPaymentRefund(refundId: string, status: string, providerData?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_refunds').update({ status, provider_data: providerData, processed_at: new Date().toISOString() }).eq('id', refundId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
