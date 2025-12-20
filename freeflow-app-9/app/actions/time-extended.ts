'use server'

/**
 * Extended Time Server Actions - Covers all Time-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTimeEntries(userId?: string, projectId?: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('time_entries').select('*').order('start_time', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (projectId) query = query.eq('project_id', projectId); if (startDate) query = query.gte('start_time', startDate); if (endDate) query = query.lte('end_time', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTimeEntry(entryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_entries').select('*').eq('id', entryId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTimeEntry(input: { user_id: string; project_id?: string; task_id?: string; description?: string; start_time: string; end_time?: string; duration_minutes?: number; billable?: boolean; hourly_rate?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_entries').insert({ ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTimeEntry(entryId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_entries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', entryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopTimeEntry(entryId: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data: entry, error: entryError } = await supabase.from('time_entries').select('start_time').eq('id', entryId).single(); if (entryError) throw entryError; const startTime = new Date(entry.start_time); const endTime = new Date(now); const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000); const { data, error } = await supabase.from('time_entries').update({ end_time: now, duration_minutes: durationMinutes, status: 'completed' }).eq('id', entryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTimeEntry(entryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('time_entries').delete().eq('id', entryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserTimeEntrySummary(userId: string, startDate: string, endDate: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_entries').select('duration_minutes, billable, hourly_rate').eq('user_id', userId).gte('start_time', startDate).lte('end_time', endDate); if (error) throw error; const totalMinutes = data?.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0; const billableMinutes = data?.filter(e => e.billable).reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0; const totalBillable = data?.filter(e => e.billable).reduce((sum, e) => sum + ((e.duration_minutes || 0) / 60) * (e.hourly_rate || 0), 0) || 0; return { success: true, data: { total_minutes: totalMinutes, total_hours: Math.round(totalMinutes / 60 * 100) / 100, billable_minutes: billableMinutes, billable_hours: Math.round(billableMinutes / 60 * 100) / 100, total_billable_amount: Math.round(totalBillable * 100) / 100 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimeSheets(userId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('time_sheets').select('*').order('period_start', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTimeSheet(sheetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_sheets').select('*').eq('id', sheetId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTimeSheet(input: { user_id: string; period_start: string; period_end: string; total_hours?: number; billable_hours?: number; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_sheets').insert({ ...input, status: 'draft', total_hours: input.total_hours || 0, billable_hours: input.billable_hours || 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTimeSheet(sheetId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_sheets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitTimeSheet(sheetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_sheets').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', sheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveTimeSheet(sheetId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_sheets').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() }).eq('id', sheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectTimeSheet(sheetId: string, reason: string, rejectedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('time_sheets').update({ status: 'rejected', rejection_reason: reason, rejected_by: rejectedBy, rejected_at: new Date().toISOString() }).eq('id', sheetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTimeSheet(sheetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('time_sheets').delete().eq('id', sheetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
