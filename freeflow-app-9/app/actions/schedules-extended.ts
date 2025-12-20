'use server'

/**
 * Extended Schedules Server Actions
 * Tables: schedules, schedule_entries, schedule_exceptions, schedule_templates, schedule_assignments, schedule_conflicts
 */

import { createClient } from '@/lib/supabase/server'

export async function getSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedules').select('*, schedule_entries(*), schedule_exceptions(*), schedule_assignments(*), users(*)').eq('id', scheduleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSchedule(scheduleData: { name: string; description?: string; type?: string; owner_id?: string; entity_type?: string; entity_id?: string; timezone?: string; start_date?: string; end_date?: string; is_active?: boolean; entries?: any[]; metadata?: any }) {
  try { const supabase = await createClient(); const { entries, ...scheduleInfo } = scheduleData; const { data: schedule, error: scheduleError } = await supabase.from('schedules').insert({ ...scheduleInfo, is_active: scheduleInfo.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (scheduleError) throw scheduleError; if (entries && entries.length > 0) { const entryData = entries.map(e => ({ schedule_id: schedule.id, ...e, created_at: new Date().toISOString() })); await supabase.from('schedule_entries').insert(entryData) } return { success: true, data: schedule } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSchedule(scheduleId: string, updates: Partial<{ name: string; description: string; type: string; timezone: string; start_date: string; end_date: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSchedule(scheduleId: string) {
  try { const supabase = await createClient(); await supabase.from('schedule_entries').delete().eq('schedule_id', scheduleId); await supabase.from('schedule_exceptions').delete().eq('schedule_id', scheduleId); await supabase.from('schedule_assignments').delete().eq('schedule_id', scheduleId); const { error } = await supabase.from('schedules').delete().eq('id', scheduleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSchedules(options?: { owner_id?: string; entity_type?: string; entity_id?: string; type?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('schedules').select('*, schedule_entries(count), schedule_assignments(count), users(*)'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addScheduleEntry(scheduleId: string, entryData: { title: string; description?: string; start_time: string; end_time: string; day_of_week?: number; is_all_day?: boolean; is_recurring?: boolean; recurrence_rule?: string; location?: string; color?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedule_entries').insert({ schedule_id: scheduleId, ...entryData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await checkConflicts(scheduleId, data.id, entryData.start_time, entryData.end_time); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateScheduleEntry(entryId: string, updates: Partial<{ title: string; description: string; start_time: string; end_time: string; day_of_week: number; is_all_day: boolean; location: string; color: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedule_entries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', entryId).select().single(); if (error) throw error; if (updates.start_time || updates.end_time) { await checkConflicts(data.schedule_id, entryId, data.start_time, data.end_time) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteScheduleEntry(entryId: string) {
  try { const supabase = await createClient(); await supabase.from('schedule_conflicts').delete().or(`entry1_id.eq.${entryId},entry2_id.eq.${entryId}`); const { error } = await supabase.from('schedule_entries').delete().eq('id', entryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScheduleEntries(scheduleId: string, options?: { from_date?: string; to_date?: string; day_of_week?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('schedule_entries').select('*').eq('schedule_id', scheduleId); if (options?.from_date) query = query.gte('start_time', options.from_date); if (options?.to_date) query = query.lte('end_time', options.to_date); if (options?.day_of_week !== undefined) query = query.eq('day_of_week', options.day_of_week); const { data, error } = await query.order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addScheduleException(scheduleId: string, exceptionData: { date: string; type: 'closed' | 'modified' | 'special'; reason?: string; modified_hours?: { start: string; end: string } }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedule_exceptions').insert({ schedule_id: scheduleId, ...exceptionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScheduleExceptions(scheduleId: string, options?: { from_date?: string; to_date?: string; type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('schedule_exceptions').select('*').eq('schedule_id', scheduleId); if (options?.type) query = query.eq('type', options.type); if (options?.from_date) query = query.gte('date', options.from_date); if (options?.to_date) query = query.lte('date', options.to_date); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

async function checkConflicts(scheduleId: string, entryId: string, startTime: string, endTime: string) {
  const supabase = await createClient()
  const { data: conflicts } = await supabase.from('schedule_entries').select('id').eq('schedule_id', scheduleId).neq('id', entryId).or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)
  if (conflicts && conflicts.length > 0) {
    for (const conflict of conflicts) {
      await supabase.from('schedule_conflicts').upsert({ schedule_id: scheduleId, entry1_id: entryId, entry2_id: conflict.id, detected_at: new Date().toISOString(), created_at: new Date().toISOString() }, { onConflict: 'entry1_id,entry2_id' })
    }
  }
}

export async function getScheduleConflicts(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedule_conflicts').select('*, entry1:entry1_id(*), entry2:entry2_id(*)').eq('schedule_id', scheduleId).is('resolved_at', null); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignToSchedule(scheduleId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedule_assignments').insert({ schedule_id: scheduleId, user_id: userId, role, assigned_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScheduleTemplates(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('schedule_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createScheduleFromTemplate(templateId: string, name: string, startDate: string, ownerId?: string) {
  try { const supabase = await createClient(); const { data: template } = await supabase.from('schedule_templates').select('*').eq('id', templateId).single(); if (!template) return { success: false, error: 'Template not found' }; return createSchedule({ name, description: template.description, type: template.type, owner_id: ownerId, start_date: startDate, entries: template.default_entries, timezone: template.timezone }) } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

