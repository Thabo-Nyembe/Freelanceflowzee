'use server'

/**
 * Extended Payroll Server Actions
 * Tables: payroll, payroll_runs, payroll_items, payroll_deductions
 */

import { createClient } from '@/lib/supabase/server'

export async function getPayrollRun(runId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_runs').select('*, payroll_items(*)').eq('id', runId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPayrollRun(runData: { user_id: string; period_start: string; period_end: string; pay_date: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_runs').insert({ ...runData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePayrollRun(runId: string, updates: Partial<{ period_start: string; period_end: string; pay_date: string; status: string; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_runs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePayrollRun(runId: string) {
  try { const supabase = await createClient(); await supabase.from('payroll_items').delete().eq('run_id', runId); const { error } = await supabase.from('payroll_runs').delete().eq('id', runId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPayrollRuns(options?: { user_id?: string; status?: string; year?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('payroll_runs').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('pay_date', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPayrollItems(runId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_items').select('*').eq('run_id', runId).order('employee_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPayrollItem(itemData: { run_id: string; employee_id: string; employee_name: string; gross_pay: number; deductions?: number; net_pay: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_items').insert({ ...itemData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function processPayrollRun(runId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_runs').update({ status: 'processing', processed_at: new Date().toISOString() }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completePayrollRun(runId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_runs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', runId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPayrollDeductions(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_deductions').select('*').eq('item_id', itemId).order('type', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEmployeePayrollHistory(employeeId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payroll_items').select('*, payroll_runs(*)').eq('employee_id', employeeId).order('created_at', { ascending: false }).limit(options?.limit || 24); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
