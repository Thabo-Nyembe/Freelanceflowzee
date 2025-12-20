'use server'

/**
 * Extended Employee Server Actions - Covers all Employee-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getEmployees(organizationId: string, department?: string) {
  try { const supabase = await createClient(); let query = supabase.from('employees').select('*').eq('organization_id', organizationId).order('name', { ascending: true }); if (department) query = query.eq('department', department); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmployee(employeeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').select('*').eq('id', employeeId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEmployee(organizationId: string, input: { user_id?: string; name: string; email: string; department?: string; position?: string; hire_date?: string; salary?: number; manager_id?: string }) {
  try { const supabase = await createClient(); const employeeNumber = `EMP${Date.now()}`; const { data, error } = await supabase.from('employees').insert({ organization_id: organizationId, employee_number: employeeNumber, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEmployee(employeeId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', employeeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function terminateEmployee(employeeId: string, terminationDate: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').update({ status: 'terminated', termination_date: terminationDate, termination_reason: reason }).eq('id', employeeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteEmployee(employeeId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('employees').delete().eq('id', employeeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmployeeRecords(employeeId: string, recordType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('employee_records').select('*').eq('employee_id', employeeId).order('date', { ascending: false }); if (recordType) query = query.eq('record_type', recordType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEmployeeRecord(employeeId: string, input: { record_type: string; title: string; description?: string; date?: string; metadata?: any; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employee_records').insert({ employee_id: employeeId, ...input, date: input.date || new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEmployeeRecord(recordId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employee_records').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', recordId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteEmployeeRecord(recordId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('employee_records').delete().eq('id', recordId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDirectReports(managerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').select('*').eq('manager_id', managerId).eq('status', 'active').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmployeesByDepartment(organizationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').select('department').eq('organization_id', organizationId).eq('status', 'active'); if (error) throw error; const deptCounts: Record<string, number> = {}; data?.forEach(e => { const dept = e.department || 'Unassigned'; deptCounts[dept] = (deptCounts[dept] || 0) + 1; }); return { success: true, data: deptCounts } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
