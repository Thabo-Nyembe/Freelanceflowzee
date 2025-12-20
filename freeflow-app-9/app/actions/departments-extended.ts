'use server'

/**
 * Extended Departments Server Actions
 * Tables: departments, department_members, department_budgets, department_goals
 */

import { createClient } from '@/lib/supabase/server'

export async function getDepartment(departmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('departments').select('*, department_members(*), department_goals(*)').eq('id', departmentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDepartment(departmentData: { name: string; description?: string; parent_id?: string; manager_id?: string; code?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('departments').insert({ ...departmentData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDepartment(departmentId: string, updates: Partial<{ name: string; description: string; parent_id: string; manager_id: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('departments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', departmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDepartments(options?: { parent_id?: string; is_active?: boolean; search?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('departments').select('*'); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDepartmentMember(departmentId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('department_members').insert({ department_id: departmentId, user_id: userId, role: role || 'member', joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeDepartmentMember(departmentId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('department_members').delete().eq('department_id', departmentId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDepartmentMembers(departmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('department_members').select('*, users:user_id(*)').eq('department_id', departmentId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setDepartmentBudget(budgetData: { department_id: string; fiscal_year: string; amount: number; currency?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('department_budgets').upsert({ ...budgetData, spent: 0, updated_at: new Date().toISOString() }, { onConflict: 'department_id,fiscal_year' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDepartmentBudget(departmentId: string, fiscalYear: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('department_budgets').select('*').eq('department_id', departmentId).eq('fiscal_year', fiscalYear).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDepartmentGoal(goalData: { department_id: string; title: string; description?: string; target_date?: string; target_value?: number; metric?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('department_goals').insert({ ...goalData, status: 'active', progress: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
