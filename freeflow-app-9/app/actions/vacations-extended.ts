'use server'

/**
 * Extended Vacations Server Actions
 * Tables: vacations, vacation_types, vacation_balances, vacation_requests, vacation_approvals, vacation_policies
 */

import { createClient } from '@/lib/supabase/server'

export async function getVacation(vacationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vacations').select('*, vacation_types(*), users(*), vacation_approvals(*, approver:users(*))').eq('id', vacationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVacation(vacationData: { user_id: string; vacation_type_id: string; start_date: string; end_date: string; days_count?: number; reason?: string; is_half_day?: boolean; half_day_period?: string; notes?: string }) {
  try { const supabase = await createClient(); const daysCount = vacationData.days_count || calculateDays(vacationData.start_date, vacationData.end_date, vacationData.is_half_day); const { data: balance } = await supabase.from('vacation_balances').select('*').eq('user_id', vacationData.user_id).eq('vacation_type_id', vacationData.vacation_type_id).eq('year', new Date().getFullYear()).single(); if (balance && balance.available < daysCount) return { success: false, error: 'Insufficient vacation balance' }; const { data, error } = await supabase.from('vacations').insert({ ...vacationData, days_count: daysCount, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function calculateDays(start: string, end: string, isHalfDay?: boolean): number {
  if (isHalfDay) return 0.5
  const startDate = new Date(start)
  const endDate = new Date(end)
  let days = 0
  const current = new Date(startDate)
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) days++
    current.setDate(current.getDate() + 1)
  }
  return days
}

export async function updateVacation(vacationId: string, updates: Partial<{ start_date: string; end_date: string; reason: string; notes: string }>) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('vacations').select('status').eq('id', vacationId).single(); if (current?.status !== 'pending') return { success: false, error: 'Can only update pending vacations' }; const { data, error } = await supabase.from('vacations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', vacationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelVacation(vacationId: string, cancellationReason?: string) {
  try { const supabase = await createClient(); const { data: vacation } = await supabase.from('vacations').select('user_id, vacation_type_id, days_count, status').eq('id', vacationId).single(); if (!vacation) return { success: false, error: 'Vacation not found' }; if (vacation.status === 'cancelled') return { success: false, error: 'Already cancelled' }; const { error } = await supabase.from('vacations').update({ status: 'cancelled', cancellation_reason: cancellationReason, cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', vacationId); if (error) throw error; if (vacation.status === 'approved') { await supabase.from('vacation_balances').update({ used: supabase.rpc('decrement_balance', { amount: vacation.days_count }), available: supabase.rpc('increment_balance', { amount: vacation.days_count }) }).eq('user_id', vacation.user_id).eq('vacation_type_id', vacation.vacation_type_id).eq('year', new Date().getFullYear()) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVacations(options?: { user_id?: string; vacation_type_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('vacations').select('*, vacation_types(*), users(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.vacation_type_id) query = query.eq('vacation_type_id', options.vacation_type_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('start_date', options.from_date); if (options?.to_date) query = query.lte('end_date', options.to_date); const { data, error } = await query.order('start_date', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function approveVacation(vacationId: string, approverId: string, comments?: string) {
  try { const supabase = await createClient(); const { data: vacation } = await supabase.from('vacations').select('user_id, vacation_type_id, days_count').eq('id', vacationId).single(); if (!vacation) return { success: false, error: 'Vacation not found' }; const { error } = await supabase.from('vacations').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', vacationId); if (error) throw error; await supabase.from('vacation_approvals').insert({ vacation_id: vacationId, approver_id: approverId, action: 'approved', comments, created_at: new Date().toISOString() }); await supabase.from('vacation_balances').update({ used: supabase.rpc('increment_balance', { amount: vacation.days_count }), available: supabase.rpc('decrement_balance', { amount: vacation.days_count }) }).eq('user_id', vacation.user_id).eq('vacation_type_id', vacation.vacation_type_id).eq('year', new Date().getFullYear()); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectVacation(vacationId: string, approverId: string, reason: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('vacations').update({ status: 'rejected', rejected_by: approverId, rejection_reason: reason, rejected_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', vacationId); if (error) throw error; await supabase.from('vacation_approvals').insert({ vacation_id: vacationId, approver_id: approverId, action: 'rejected', comments: reason, created_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVacationTypes(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('vacation_types').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVacationType(typeData: { name: string; code: string; description?: string; default_days: number; is_paid?: boolean; is_carryover_allowed?: boolean; max_carryover_days?: number; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vacation_types').insert({ ...typeData, is_paid: typeData.is_paid ?? true, is_carryover_allowed: typeData.is_carryover_allowed ?? false, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBalance(userId: string, year?: number) {
  try { const supabase = await createClient(); const targetYear = year || new Date().getFullYear(); const { data, error } = await supabase.from('vacation_balances').select('*, vacation_types(*)').eq('user_id', userId).eq('year', targetYear); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setBalance(userId: string, vacationTypeId: string, balanceData: { year: number; allocated: number; carryover?: number }) {
  try { const supabase = await createClient(); const total = balanceData.allocated + (balanceData.carryover || 0); const { data: existing } = await supabase.from('vacation_balances').select('id, used').eq('user_id', userId).eq('vacation_type_id', vacationTypeId).eq('year', balanceData.year).single(); if (existing) { const { data, error } = await supabase.from('vacation_balances').update({ allocated: balanceData.allocated, carryover: balanceData.carryover || 0, available: total - existing.used, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('vacation_balances').insert({ user_id: userId, vacation_type_id: vacationTypeId, year: balanceData.year, allocated: balanceData.allocated, carryover: balanceData.carryover || 0, used: 0, available: total, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingApprovals(approverId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vacations').select('*, vacation_types(*), users(*)').eq('status', 'pending').order('created_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTeamCalendar(teamMemberIds: string[], fromDate: string, toDate: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vacations').select('*, users(*), vacation_types(*)').in('user_id', teamMemberIds).in('status', ['approved', 'pending']).gte('start_date', fromDate).lte('end_date', toDate).order('start_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPolicy(policyId?: string) {
  try { const supabase = await createClient(); if (policyId) { const { data, error } = await supabase.from('vacation_policies').select('*').eq('id', policyId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } else { const { data, error } = await supabase.from('vacation_policies').select('*').eq('is_default', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
