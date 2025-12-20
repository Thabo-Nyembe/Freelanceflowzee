'use server'

/**
 * Extended Availability Server Actions - Covers all Availability-related tables
 * Tables: availability_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getAvailabilitySchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('availability_schedules').select('*').eq('id', scheduleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAvailabilitySchedule(scheduleData: { user_id: string; name?: string; timezone?: string; is_default?: boolean; schedule: { day: number; start_time: string; end_time: string; is_available: boolean }[] }) {
  try { const supabase = await createClient(); if (scheduleData.is_default) { await supabase.from('availability_schedules').update({ is_default: false }).eq('user_id', scheduleData.user_id); } const { data, error } = await supabase.from('availability_schedules').insert({ ...scheduleData, is_default: scheduleData.is_default ?? false, timezone: scheduleData.timezone || 'UTC', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAvailabilitySchedule(scheduleId: string, updates: Partial<{ name: string; timezone: string; is_default: boolean; schedule: { day: number; start_time: string; end_time: string; is_available: boolean }[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('availability_schedules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAvailabilitySchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('availability_schedules').delete().eq('id', scheduleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAvailabilitySchedules(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('availability_schedules').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDefaultAvailability(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('availability_schedules').select('*').eq('user_id', userId).eq('is_default', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefaultAvailability(userId: string, scheduleId: string) {
  try { const supabase = await createClient(); await supabase.from('availability_schedules').update({ is_default: false }).eq('user_id', userId); const { data, error } = await supabase.from('availability_schedules').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkAvailability(userId: string, dateTime: Date) {
  try { const supabase = await createClient(); const { data: schedule } = await supabase.from('availability_schedules').select('schedule, timezone').eq('user_id', userId).eq('is_default', true).single(); if (!schedule) return { success: true, isAvailable: true }; const dayOfWeek = dateTime.getDay(); const timeString = dateTime.toTimeString().slice(0, 5); const daySchedule = schedule.schedule?.find((s: any) => s.day === dayOfWeek); if (!daySchedule || !daySchedule.is_available) return { success: true, isAvailable: false }; const isAvailable = timeString >= daySchedule.start_time && timeString <= daySchedule.end_time; return { success: true, isAvailable } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAvailableSlots(userId: string, date: string, duration: number) {
  try { const supabase = await createClient(); const { data: schedule } = await supabase.from('availability_schedules').select('schedule, timezone').eq('user_id', userId).eq('is_default', true).single(); if (!schedule) return { success: true, slots: [] }; const targetDate = new Date(date); const dayOfWeek = targetDate.getDay(); const daySchedule = schedule.schedule?.find((s: any) => s.day === dayOfWeek); if (!daySchedule || !daySchedule.is_available) return { success: true, slots: [] }; const slots: string[] = []; let currentTime = daySchedule.start_time; while (currentTime < daySchedule.end_time) { slots.push(currentTime); const [hours, minutes] = currentTime.split(':').map(Number); const newMinutes = minutes + duration; const newHours = hours + Math.floor(newMinutes / 60); currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}`; } return { success: true, slots } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', slots: [] } }
}

export async function addAvailabilityException(exceptionData: { schedule_id: string; date: string; is_available: boolean; start_time?: string; end_time?: string; reason?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('availability_exceptions').insert({ ...exceptionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAvailabilityExceptions(scheduleId: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('availability_exceptions').select('*').eq('schedule_id', scheduleId); if (options?.startDate) query = query.gte('date', options.startDate); if (options?.endDate) query = query.lte('date', options.endDate); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function removeAvailabilityException(exceptionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('availability_exceptions').delete().eq('id', exceptionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
