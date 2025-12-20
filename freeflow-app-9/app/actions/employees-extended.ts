'use server'

/**
 * Extended Employees Server Actions
 * Tables: employees, employee_profiles, employee_documents, employee_performance, employee_leave
 */

import { createClient } from '@/lib/supabase/server'

export async function getEmployee(employeeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').select('*, employee_profiles(*), employee_documents(*)').eq('id', employeeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEmployee(employeeData: { user_id: string; employee_number: string; department_id?: string; position?: string; manager_id?: string; hire_date: string; employment_type?: string; salary?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').insert({ ...employeeData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEmployee(employeeId: string, updates: Partial<{ department_id: string; position: string; manager_id: string; status: string; salary: number; employment_type: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employees').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', employeeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmployees(options?: { department_id?: string; status?: string; manager_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('employees').select('*, employee_profiles(*)'); if (options?.department_id) query = query.eq('department_id', options.department_id); if (options?.status) query = query.eq('status', options.status); if (options?.manager_id) query = query.eq('manager_id', options.manager_id); if (options?.search) query = query.ilike('employee_number', `%${options.search}%`); const { data, error } = await query.order('hire_date', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateEmployeeProfile(employeeId: string, profileData: Partial<{ first_name: string; last_name: string; email: string; phone: string; address: any; emergency_contact: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employee_profiles').upsert({ employee_id: employeeId, ...profileData, updated_at: new Date().toISOString() }, { onConflict: 'employee_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addEmployeeDocument(docData: { employee_id: string; type: string; title: string; file_url: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employee_documents').insert({ ...docData, uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmployeeDocuments(employeeId: string, options?: { type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('employee_documents').select('*').eq('employee_id', employeeId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('uploaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordPerformanceReview(reviewData: { employee_id: string; reviewer_id: string; period: string; rating: number; feedback?: string; goals?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employee_performance').insert({ ...reviewData, review_date: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function requestLeave(leaveData: { employee_id: string; type: string; start_date: string; end_date: string; reason?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employee_leave').insert({ ...leaveData, status: 'pending', requested_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveLeave(leaveId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('employee_leave').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() }).eq('id', leaveId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmployeeLeave(employeeId: string, options?: { status?: string; year?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('employee_leave').select('*').eq('employee_id', employeeId); if (options?.status) query = query.eq('status', options.status); if (options?.year) { const startOfYear = `${options.year}-01-01`; const endOfYear = `${options.year}-12-31`; query = query.gte('start_date', startOfYear).lte('start_date', endOfYear) } const { data, error } = await query.order('start_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
