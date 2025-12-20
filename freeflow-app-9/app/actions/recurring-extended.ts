'use server'

/**
 * Extended Recurring Server Actions
 * Tables: recurring_payments, recurring_invoices, recurring_tasks, recurring_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getRecurringPayment(paymentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_payments').select('*').eq('id', paymentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRecurringPayment(paymentData: { user_id: string; amount: number; currency?: string; frequency: string; next_date: string; payment_method_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_payments').insert({ ...paymentData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRecurringPayment(paymentId: string, updates: Partial<{ amount: number; frequency: string; next_date: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_payments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', paymentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecurringPayments(options?: { user_id?: string; status?: string; frequency?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('recurring_payments').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.frequency) query = query.eq('frequency', options.frequency); const { data, error } = await query.order('next_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecurringInvoices(options?: { user_id?: string; client_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('recurring_invoices').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('next_invoice_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRecurringInvoice(invoiceData: { user_id: string; client_id: string; amount: number; frequency: string; next_invoice_date: string; items?: any[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_invoices').insert({ ...invoiceData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecurringTasks(options?: { user_id?: string; project_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('recurring_tasks').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('next_run', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecurringSchedules(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('recurring_schedules').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
