'use server'

/**
 * Extended Salaries Server Actions
 * Tables: salaries, salary_components, salary_deductions, salary_history, salary_structures, salary_grades
 */

import { createClient } from '@/lib/supabase/server'

export async function getSalary(salaryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('salaries').select('*, salary_components(*), salary_deductions(*), salary_structures(*), salary_grades(*), users(*)').eq('id', salaryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSalary(salaryData: { employee_id: string; structure_id?: string; grade_id?: string; base_salary: number; currency?: string; effective_from: string; effective_until?: string; components?: { type: string; name: string; amount: number; is_taxable?: boolean }[]; deductions?: { type: string; name: string; amount: number }[]; metadata?: any }) {
  try { const supabase = await createClient(); const { components, deductions, ...salaryInfo } = salaryData; const { data: salary, error: salaryError } = await supabase.from('salaries').insert({ ...salaryInfo, status: 'active', created_at: new Date().toISOString() }).select().single(); if (salaryError) throw salaryError; if (components && components.length > 0) { const compData = components.map(c => ({ salary_id: salary.id, ...c, created_at: new Date().toISOString() })); await supabase.from('salary_components').insert(compData) } if (deductions && deductions.length > 0) { const dedData = deductions.map(d => ({ salary_id: salary.id, ...d, created_at: new Date().toISOString() })); await supabase.from('salary_deductions').insert(dedData) } return { success: true, data: salary } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSalary(salaryId: string, updates: Partial<{ base_salary: number; grade_id: string; status: string; effective_until: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('salaries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', salaryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSalary(salaryId: string) {
  try { const supabase = await createClient(); await supabase.from('salary_components').delete().eq('salary_id', salaryId); await supabase.from('salary_deductions').delete().eq('salary_id', salaryId); const { error } = await supabase.from('salaries').delete().eq('id', salaryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSalaries(options?: { employee_id?: string; structure_id?: string; grade_id?: string; status?: string; effective_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('salaries').select('*, salary_components(*), salary_deductions(*), salary_structures(*), salary_grades(*), users(*)'); if (options?.employee_id) query = query.eq('employee_id', options.employee_id); if (options?.structure_id) query = query.eq('structure_id', options.structure_id); if (options?.grade_id) query = query.eq('grade_id', options.grade_id); if (options?.status) query = query.eq('status', options.status); if (options?.effective_date) { query = query.lte('effective_from', options.effective_date).or(`effective_until.is.null,effective_until.gte.${options.effective_date}`) } const { data, error } = await query.order('effective_from', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmployeeSalary(employeeId: string, effectiveDate?: string) {
  try { const supabase = await createClient(); const date = effectiveDate || new Date().toISOString(); let query = supabase.from('salaries').select('*, salary_components(*), salary_deductions(*), salary_structures(*), salary_grades(*)').eq('employee_id', employeeId).eq('status', 'active').lte('effective_from', date).or(`effective_until.is.null,effective_until.gte.${date}`); const { data, error } = await query.order('effective_from', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reviseSalary(employeeId: string, revisionData: { new_base_salary: number; new_grade_id?: string; reason: string; effective_from: string; revised_by: string }) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('salaries').select('*').eq('employee_id', employeeId).eq('status', 'active').order('effective_from', { ascending: false }).limit(1).single(); if (current) { await supabase.from('salary_history').insert({ salary_id: current.id, employee_id: employeeId, previous_amount: current.base_salary, new_amount: revisionData.new_base_salary, change_percentage: ((revisionData.new_base_salary - current.base_salary) / current.base_salary) * 100, reason: revisionData.reason, changed_by: revisionData.revised_by, changed_at: new Date().toISOString(), created_at: new Date().toISOString() }); await supabase.from('salaries').update({ effective_until: revisionData.effective_from, status: 'superseded', updated_at: new Date().toISOString() }).eq('id', current.id) } const { data: newSalary, error } = await supabase.from('salaries').insert({ employee_id: employeeId, base_salary: revisionData.new_base_salary, grade_id: revisionData.new_grade_id || current?.grade_id, structure_id: current?.structure_id, currency: current?.currency || 'USD', effective_from: revisionData.effective_from, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: newSalary } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSalaryHistory(employeeId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('salary_history').select('*, salaries(*), users(*)').eq('employee_id', employeeId); if (options?.from_date) query = query.gte('changed_at', options.from_date); if (options?.to_date) query = query.lte('changed_at', options.to_date); const { data, error } = await query.order('changed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSalaryStructures(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('salary_structures').select('*, salary_grades(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSalaryGrades(structureId?: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('salary_grades').select('*'); if (structureId) query = query.eq('structure_id', structureId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('level', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function calculateGrossSalary(salaryId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('salaries').select('base_salary, salary_components(amount)').eq('id', salaryId).single(); if (!data) return { success: false, error: 'Salary not found' }; const componentsTotal = (data.salary_components || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0); const gross = data.base_salary + componentsTotal; return { success: true, data: { baseSalary: data.base_salary, componentsTotal, gross } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function calculateNetSalary(salaryId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('salaries').select('base_salary, salary_components(amount), salary_deductions(amount)').eq('id', salaryId).single(); if (!data) return { success: false, error: 'Salary not found' }; const componentsTotal = (data.salary_components || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0); const deductionsTotal = (data.salary_deductions || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0); const gross = data.base_salary + componentsTotal; const net = gross - deductionsTotal; return { success: true, data: { baseSalary: data.base_salary, componentsTotal, gross, deductionsTotal, net } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

