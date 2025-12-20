'use server'

/**
 * Extended Timesheets Server Actions
 * Tables: timesheets, timesheet_entries, timesheet_approvals, timesheet_projects, timesheet_categories, timesheet_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getTimesheet(timesheetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timesheets').select('*, timesheet_entries(*, timesheet_projects(*), timesheet_categories(*)), timesheet_approvals(*, users(*))').eq('id', timesheetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTimesheet(timesheetData: { user_id: string; period_start: string; period_end: string; period_type?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timesheets').insert({ ...timesheetData, period_type: timesheetData.period_type || 'weekly', status: 'draft', total_hours: 0, billable_hours: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTimesheet(timesheetId: string, updates: Partial<{ status: string; notes: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timesheets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', timesheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTimesheet(timesheetId: string) {
  try { const supabase = await createClient(); await supabase.from('timesheet_entries').delete().eq('timesheet_id', timesheetId); await supabase.from('timesheet_approvals').delete().eq('timesheet_id', timesheetId); const { error } = await supabase.from('timesheets').delete().eq('id', timesheetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimesheets(options?: { user_id?: string; status?: string; period_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('timesheets').select('*, users(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.period_type) query = query.eq('period_type', options.period_type); if (options?.from_date) query = query.gte('period_start', options.from_date); if (options?.to_date) query = query.lte('period_end', options.to_date); const { data, error } = await query.order('period_start', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addEntry(timesheetId: string, entryData: { date: string; hours: number; project_id?: string; category_id?: string; task_id?: string; description?: string; is_billable?: boolean; hourly_rate?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timesheet_entries').insert({ timesheet_id: timesheetId, ...entryData, is_billable: entryData.is_billable ?? true, created_at: new Date().toISOString() }).select('*, timesheet_projects(*), timesheet_categories(*)').single(); if (error) throw error; await recalculateTotals(timesheetId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEntry(entryId: string, updates: Partial<{ date: string; hours: number; project_id: string; category_id: string; task_id: string; description: string; is_billable: boolean; hourly_rate: number }>) {
  try { const supabase = await createClient(); const { data: entry } = await supabase.from('timesheet_entries').select('timesheet_id').eq('id', entryId).single(); const { data, error } = await supabase.from('timesheet_entries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', entryId).select().single(); if (error) throw error; if (entry?.timesheet_id) await recalculateTotals(entry.timesheet_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteEntry(entryId: string) {
  try { const supabase = await createClient(); const { data: entry } = await supabase.from('timesheet_entries').select('timesheet_id').eq('id', entryId).single(); const { error } = await supabase.from('timesheet_entries').delete().eq('id', entryId); if (error) throw error; if (entry?.timesheet_id) await recalculateTotals(entry.timesheet_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateTotals(timesheetId: string) {
  const supabase = await createClient()
  const { data: entries } = await supabase.from('timesheet_entries').select('hours, is_billable').eq('timesheet_id', timesheetId)
  const totalHours = entries?.reduce((sum, e) => sum + (e.hours || 0), 0) || 0
  const billableHours = entries?.filter(e => e.is_billable).reduce((sum, e) => sum + (e.hours || 0), 0) || 0
  await supabase.from('timesheets').update({ total_hours: totalHours, billable_hours: billableHours, updated_at: new Date().toISOString() }).eq('id', timesheetId)
}

export async function getEntries(timesheetId: string, options?: { date?: string; project_id?: string; category_id?: string; is_billable?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('timesheet_entries').select('*, timesheet_projects(*), timesheet_categories(*)').eq('timesheet_id', timesheetId); if (options?.date) query = query.eq('date', options.date); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_billable !== undefined) query = query.eq('is_billable', options.is_billable); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitTimesheet(timesheetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timesheets').update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', timesheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveTimesheet(timesheetId: string, approverId: string, comments?: string) {
  try { const supabase = await createClient(); await supabase.from('timesheet_approvals').insert({ timesheet_id: timesheetId, approver_id: approverId, status: 'approved', comments, approved_at: new Date().toISOString(), created_at: new Date().toISOString() }); const { data, error } = await supabase.from('timesheets').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', timesheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectTimesheet(timesheetId: string, approverId: string, reason: string) {
  try { const supabase = await createClient(); await supabase.from('timesheet_approvals').insert({ timesheet_id: timesheetId, approver_id: approverId, status: 'rejected', comments: reason, created_at: new Date().toISOString() }); const { data, error } = await supabase.from('timesheets').update({ status: 'rejected', rejection_reason: reason, updated_at: new Date().toISOString() }).eq('id', timesheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjects(options?: { is_active?: boolean; search?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('timesheet_projects').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCategories(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('timesheet_categories').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserStats(userId: string, options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('timesheets').select('*, timesheet_entries(hours, is_billable)').eq('user_id', userId); if (options?.from_date) query = query.gte('period_start', options.from_date); if (options?.to_date) query = query.lte('period_end', options.to_date); const { data } = await query; let totalHours = 0, billableHours = 0; data?.forEach(ts => { ts.timesheet_entries?.forEach((e: any) => { totalHours += e.hours || 0; if (e.is_billable) billableHours += e.hours || 0 }) }); return { success: true, data: { totalHours, billableHours, nonBillableHours: totalHours - billableHours, timesheetCount: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrCreateCurrentTimesheet(userId: string, periodType: string = 'weekly') {
  try { const supabase = await createClient(); const now = new Date(); let periodStart: Date, periodEnd: Date; if (periodType === 'weekly') { const dayOfWeek = now.getDay(); periodStart = new Date(now); periodStart.setDate(now.getDate() - dayOfWeek); periodStart.setHours(0, 0, 0, 0); periodEnd = new Date(periodStart); periodEnd.setDate(periodStart.getDate() + 6); periodEnd.setHours(23, 59, 59, 999) } else { periodStart = new Date(now.getFullYear(), now.getMonth(), 1); periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); periodEnd.setHours(23, 59, 59, 999) } const { data: existing } = await supabase.from('timesheets').select('*').eq('user_id', userId).eq('period_start', periodStart.toISOString().split('T')[0]).single(); if (existing) return { success: true, data: existing }; return await createTimesheet({ user_id: userId, period_start: periodStart.toISOString().split('T')[0], period_end: periodEnd.toISOString().split('T')[0], period_type: periodType }) } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
