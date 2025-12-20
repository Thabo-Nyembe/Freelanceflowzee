'use server'

/**
 * Extended Financial Server Actions - Covers all Financial-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getFinancialAccounts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('financial_accounts').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFinancialAccount(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('financial_accounts').select('*').eq('id', accountId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFinancialAccount(userId: string, input: { name: string; type: string; currency?: string; balance?: number; institution?: string; account_number?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('financial_accounts').insert({ user_id: userId, ...input, balance: input.balance || 0, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFinancialAccount(accountId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('financial_accounts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', accountId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFinancialAccount(accountId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('financial_accounts').delete().eq('id', accountId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFinancialTransactions(accountId: string, dateRange?: { start: string; end: string }) {
  try { const supabase = await createClient(); let query = supabase.from('financial_transactions').select('*').eq('account_id', accountId).order('date', { ascending: false }); if (dateRange) { query = query.gte('date', dateRange.start).lte('date', dateRange.end); } const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFinancialTransaction(accountId: string, input: { amount: number; type: string; category?: string; description?: string; date?: string; payee?: string; reference?: string }) {
  try { const supabase = await createClient(); const { data: account, error: accountError } = await supabase.from('financial_accounts').select('balance').eq('id', accountId).single(); if (accountError) throw accountError; const newBalance = input.type === 'credit' ? (account?.balance || 0) + input.amount : (account?.balance || 0) - input.amount; const { data, error } = await supabase.from('financial_transactions').insert({ account_id: accountId, ...input, date: input.date || new Date().toISOString(), balance_after: newBalance }).select().single(); if (error) throw error; await supabase.from('financial_accounts').update({ balance: newBalance }).eq('id', accountId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFinancialTransaction(transactionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('financial_transactions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', transactionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFinancialTransaction(transactionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('financial_transactions').delete().eq('id', transactionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccountBalance(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('financial_accounts').select('balance, currency').eq('id', accountId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTransactionSummary(accountId: string, period: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('financial_transactions').select('amount, type, category').eq('account_id', accountId); if (error) throw error; const income = data?.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 0; const expenses = data?.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) || 0; return { success: true, data: { period, total_income: income, total_expenses: expenses, net: income - expenses } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reconcileAccount(accountId: string, actualBalance: number, userId: string) {
  try { const supabase = await createClient(); const { data: account, error } = await supabase.from('financial_accounts').select('balance').eq('id', accountId).single(); if (error) throw error; const difference = actualBalance - (account?.balance || 0); if (difference !== 0) { await supabase.from('financial_transactions').insert({ account_id: accountId, amount: Math.abs(difference), type: difference > 0 ? 'credit' : 'debit', category: 'reconciliation', description: 'Account reconciliation adjustment', date: new Date().toISOString(), balance_after: actualBalance }); await supabase.from('financial_accounts').update({ balance: actualBalance, reconciled_at: new Date().toISOString() }).eq('id', accountId); } return { success: true, data: { previous_balance: account?.balance, new_balance: actualBalance, adjustment: difference } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
