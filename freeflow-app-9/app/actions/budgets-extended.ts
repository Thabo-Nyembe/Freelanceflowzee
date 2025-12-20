'use server'

/**
 * Extended Budgets Server Actions
 * Tables: budgets, budget_categories, budget_items, budget_allocations
 */

import { createClient } from '@/lib/supabase/server'

export async function getBudget(budgetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budgets').select('*, budget_items(*), budget_allocations(*)').eq('id', budgetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBudget(budgetData: { user_id: string; name: string; total_amount: number; currency?: string; period?: string; start_date?: string; end_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budgets').insert({ ...budgetData, spent_amount: 0, remaining_amount: budgetData.total_amount, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBudget(budgetId: string, updates: Partial<{ name: string; total_amount: number; currency: string; period: string; start_date: string; end_date: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budgets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', budgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBudget(budgetId: string) {
  try { const supabase = await createClient(); await supabase.from('budget_items').delete().eq('budget_id', budgetId); await supabase.from('budget_allocations').delete().eq('budget_id', budgetId); const { error } = await supabase.from('budgets').delete().eq('id', budgetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBudgets(options?: { user_id?: string; status?: string; period?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('budgets').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.period) query = query.eq('period', options.period); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBudgetItem(itemData: { budget_id: string; category_id?: string; name: string; amount: number; type?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budget_items').insert({ ...itemData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordExpense(budgetId: string, amount: number, description?: string, categoryId?: string) {
  try { const supabase = await createClient(); const { data: budget } = await supabase.from('budgets').select('spent_amount, total_amount').eq('id', budgetId).single(); if (!budget) throw new Error('Budget not found'); const newSpent = (budget.spent_amount || 0) + amount; const newRemaining = budget.total_amount - newSpent; const { data, error } = await supabase.from('budgets').update({ spent_amount: newSpent, remaining_amount: newRemaining, updated_at: new Date().toISOString() }).eq('id', budgetId).select().single(); if (error) throw error; await supabase.from('budget_items').insert({ budget_id: budgetId, name: description || 'Expense', amount, category_id: categoryId, type: 'expense', created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBudgetCategories(options?: { user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('budget_categories').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
