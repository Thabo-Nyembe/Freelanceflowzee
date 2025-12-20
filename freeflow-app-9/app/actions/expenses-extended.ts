'use server'

/**
 * Extended Expenses Server Actions
 * Tables: expenses, expense_categories, expense_reports, expense_receipts, expense_policies
 */

import { createClient } from '@/lib/supabase/server'

export async function getExpense(expenseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('expenses').select('*, expense_categories(*), expense_receipts(*)').eq('id', expenseId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExpense(expenseData: { user_id: string; category_id?: string; description: string; amount: number; currency?: string; date: string; vendor?: string; payment_method?: string; is_billable?: boolean; project_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('expenses').insert({ ...expenseData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExpense(expenseId: string, updates: Partial<{ category_id: string; description: string; amount: number; date: string; vendor: string; is_billable: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('expenses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', expenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteExpense(expenseId: string) {
  try { const supabase = await createClient(); await supabase.from('expense_receipts').delete().eq('expense_id', expenseId); const { error } = await supabase.from('expenses').delete().eq('id', expenseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExpenses(options?: { user_id?: string; category_id?: string; status?: string; date_from?: string; date_to?: string; is_billable?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('expenses').select('*, expense_categories(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.status) query = query.eq('status', options.status); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); if (options?.is_billable !== undefined) query = query.eq('is_billable', options.is_billable); const { data, error } = await query.order('date', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExpenseCategories(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('expense_categories').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function approveExpense(expenseId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('expenses').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() }).eq('id', expenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectExpense(expenseId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('expenses').update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date().toISOString() }).eq('id', expenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addExpenseReceipt(receiptData: { expense_id: string; file_url: string; file_name?: string; file_size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('expense_receipts').insert({ ...receiptData, uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExpenseReport(reportData: { user_id: string; title: string; expense_ids: string[]; date_from: string; date_to: string }) {
  try { const supabase = await createClient(); const { data: expenses } = await supabase.from('expenses').select('amount').in('id', reportData.expense_ids); const total = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0; const { data, error } = await supabase.from('expense_reports').insert({ ...reportData, total_amount: total, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExpenseReports(userId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('expense_reports').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
