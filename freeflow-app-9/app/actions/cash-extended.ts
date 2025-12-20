'use server'

/**
 * Extended Cash Server Actions
 * Tables: cash_flows, cash_accounts, cash_transactions, cash_forecasts
 */

import { createClient } from '@/lib/supabase/server'

export async function getCashAccount(accountId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cash_accounts').select('*').eq('id', accountId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCashAccount(accountData: { user_id: string; name: string; type: string; currency?: string; initial_balance?: number; bank_name?: string; account_number?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cash_accounts').insert({ ...accountData, current_balance: accountData.initial_balance || 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCashAccount(accountId: string, updates: Partial<{ name: string; type: string; currency: string; bank_name: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cash_accounts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', accountId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCashAccounts(options?: { user_id?: string; type?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('cash_accounts').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordCashTransaction(transactionData: { account_id: string; type: 'inflow' | 'outflow'; amount: number; category?: string; description?: string; reference?: string; date?: string }) {
  try { const supabase = await createClient(); const { data: account } = await supabase.from('cash_accounts').select('current_balance').eq('id', transactionData.account_id).single(); if (!account) throw new Error('Account not found'); const balanceChange = transactionData.type === 'inflow' ? transactionData.amount : -transactionData.amount; const newBalance = (account.current_balance || 0) + balanceChange; const { data, error } = await supabase.from('cash_transactions').insert({ ...transactionData, balance_after: newBalance, date: transactionData.date || new Date().toISOString().split('T')[0], created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('cash_accounts').update({ current_balance: newBalance, updated_at: new Date().toISOString() }).eq('id', transactionData.account_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCashTransactions(accountId: string, options?: { type?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('cash_transactions').select('*').eq('account_id', accountId); if (options?.type) query = query.eq('type', options.type); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); const { data, error } = await query.order('date', { ascending: false }).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCashFlow(userId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); const { data: accounts } = await supabase.from('cash_accounts').select('id').eq('user_id', userId).eq('is_active', true); if (!accounts?.length) return { success: true, data: { inflow: 0, outflow: 0, net: 0 } }; let query = supabase.from('cash_transactions').select('type, amount').in('account_id', accounts.map(a => a.id)); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); const { data, error } = await query; if (error) throw error; const inflow = data?.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0) || 0; const outflow = data?.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0) || 0; return { success: true, data: { inflow, outflow, net: inflow - outflow } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { inflow: 0, outflow: 0, net: 0 } } }
}

export async function createCashForecast(forecastData: { user_id: string; date: string; projected_inflow: number; projected_outflow: number; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cash_forecasts').insert({ ...forecastData, projected_balance: forecastData.projected_inflow - forecastData.projected_outflow, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
