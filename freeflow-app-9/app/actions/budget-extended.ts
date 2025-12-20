'use server'

/**
 * Extended Budget Server Actions - Covers all Budget-related tables
 * Tables: budgets
 */

import { createClient } from '@/lib/supabase/server'

export async function getBudget(budgetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budgets').select('*').eq('id', budgetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBudget(budgetData: { user_id?: string; organization_id?: string; project_id?: string; name: string; description?: string; amount: number; currency?: string; period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'; start_date?: string; end_date?: string; category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budgets').insert({ ...budgetData, currency: budgetData.currency || 'USD', is_active: budgetData.is_active ?? true, spent: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBudget(budgetId: string, updates: Partial<{ name: string; description: string; amount: number; currency: string; period: string; start_date: string; end_date: string; category: string; is_active: boolean; spent: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budgets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', budgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBudget(budgetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('budgets').delete().eq('id', budgetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBudgets(options?: { userId?: string; organizationId?: string; projectId?: string; isActive?: boolean; category?: string; period?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('budgets').select('*'); if (options?.userId) query = query.eq('user_id', options.userId); if (options?.organizationId) query = query.eq('organization_id', options.organizationId); if (options?.projectId) query = query.eq('project_id', options.projectId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.category) query = query.eq('category', options.category); if (options?.period) query = query.eq('period', options.period); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBudgetExpense(budgetId: string, amount: number, description?: string) {
  try { const supabase = await createClient(); const { data: budget } = await supabase.from('budgets').select('spent, amount').eq('id', budgetId).single(); if (!budget) return { success: false, error: 'Budget not found' }; const newSpent = (budget.spent || 0) + amount; const { data, error } = await supabase.from('budgets').update({ spent: newSpent, updated_at: new Date().toISOString() }).eq('id', budgetId).select().single(); if (error) throw error; return { success: true, data, remaining: budget.amount - newSpent, isOverBudget: newSpent > budget.amount } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBudgetStatus(budgetId: string) {
  try { const supabase = await createClient(); const { data: budget, error } = await supabase.from('budgets').select('*').eq('id', budgetId).single(); if (error) throw error; if (!budget) return { success: false, error: 'Budget not found' }; const percentUsed = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0; const remaining = budget.amount - budget.spent; return { success: true, data: { ...budget, percentUsed: Math.round(percentUsed * 100) / 100, remaining, isOverBudget: budget.spent > budget.amount, status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'healthy' } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBudgetsByCategory(options?: { userId?: string; organizationId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('budgets').select('category, amount, spent'); if (options?.userId) query = query.eq('user_id', options.userId); if (options?.organizationId) query = query.eq('organization_id', options.organizationId); const { data } = await query.eq('is_active', true); const byCategory: Record<string, { total: number; spent: number; count: number }> = {}; data?.forEach(b => { const cat = b.category || 'Uncategorized'; if (!byCategory[cat]) byCategory[cat] = { total: 0, spent: 0, count: 0 }; byCategory[cat].total += b.amount; byCategory[cat].spent += b.spent || 0; byCategory[cat].count++; }); return { success: true, data: byCategory } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBudgetSummary(options?: { userId?: string; organizationId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('budgets').select('amount, spent, is_active'); if (options?.userId) query = query.eq('user_id', options.userId); if (options?.organizationId) query = query.eq('organization_id', options.organizationId); const { data } = await query; const active = data?.filter(b => b.is_active) || []; const totalBudget = active.reduce((sum, b) => sum + b.amount, 0); const totalSpent = active.reduce((sum, b) => sum + (b.spent || 0), 0); const overBudget = active.filter(b => (b.spent || 0) > b.amount).length; return { success: true, data: { totalBudgets: data?.length || 0, activeBudgets: active.length, totalBudget, totalSpent, remaining: totalBudget - totalSpent, percentUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0, overBudgetCount: overBudget } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetBudgetSpending(budgetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('budgets').update({ spent: 0, updated_at: new Date().toISOString() }).eq('id', budgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateBudget(budgetId: string, newName?: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('budgets').select('*').eq('id', budgetId).single(); if (!original) return { success: false, error: 'Budget not found' }; const { id, created_at, updated_at, spent, ...rest } = original; const { data, error } = await supabase.from('budgets').insert({ ...rest, name: newName || `${original.name} (Copy)`, spent: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
