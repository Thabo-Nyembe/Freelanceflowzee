'use server'

/**
 * Extended Events Server Actions - Covers all Event-related tables
 * Tables: events, event_attachments, event_attendees, event_recurrence, event_registrations, event_reminders, event_views
 */

import { createClient } from '@/lib/supabase/server'

export async function getEvent(eventId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEvent(eventData: { title: string; description?: string; start_date: string; end_date?: string; location?: string; is_all_day?: boolean; is_recurring?: boolean; visibility?: string; organizer_id: string; calendar_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').insert({ ...eventData, is_all_day: eventData.is_all_day ?? false, is_recurring: eventData.is_recurring ?? false, visibility: eventData.visibility || 'private', status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEvent(eventId: string, updates: Partial<{ title: string; description: string; start_date: string; end_date: string; location: string; is_all_day: boolean; visibility: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('events').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteEvent(eventId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('events').delete().eq('id', eventId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEvents(options?: { organizerId?: string; calendarId?: string; startDate?: string; endDate?: string; status?: string; visibility?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('events').select('*'); if (options?.organizerId) query = query.eq('organizer_id', options.organizerId); if (options?.calendarId) query = query.eq('calendar_id', options.calendarId); if (options?.startDate) query = query.gte('start_date', options.startDate); if (options?.endDate) query = query.lte('start_date', options.endDate); if (options?.status) query = query.eq('status', options.status); if (options?.visibility) query = query.eq('visibility', options.visibility); const { data, error } = await query.order('start_date', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addEventAttendee(attendeeData: { event_id: string; user_id: string; status?: string; role?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_attendees').insert({ ...attendeeData, status: attendeeData.status || 'pending', role: attendeeData.role || 'attendee', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEventAttendee(eventId: string, userId: string, updates: Partial<{ status: string; role: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_attendees').update({ ...updates, updated_at: new Date().toISOString() }).eq('event_id', eventId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeEventAttendee(eventId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEventAttendees(eventId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('event_attendees').select('*, users(id, name, email, avatar_url)').eq('event_id', eventId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addEventAttachment(attachmentData: { event_id: string; file_id: string; name: string; file_type?: string; file_size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_attachments').insert({ ...attachmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEventAttachments(eventId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_attachments').select('*').eq('event_id', eventId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setEventRecurrence(recurrenceData: { event_id: string; frequency: string; interval?: number; days_of_week?: string[]; until_date?: string; count?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_recurrence').upsert({ ...recurrenceData, interval: recurrenceData.interval || 1, created_at: new Date().toISOString() }, { onConflict: 'event_id' }).select().single(); if (error) throw error; await supabase.from('events').update({ is_recurring: true, updated_at: new Date().toISOString() }).eq('id', recurrenceData.event_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEventRecurrence(eventId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_recurrence').select('*').eq('event_id', eventId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEventRegistration(registrationData: { event_id: string; user_id: string; ticket_type?: string; amount_paid?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_registrations').insert({ ...registrationData, status: 'registered', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEventRegistrations(eventId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('event_registrations').select('*, users(id, name, email)').eq('event_id', eventId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEventReminder(reminderData: { event_id: string; user_id: string; remind_at: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_reminders').insert({ ...reminderData, type: reminderData.type || 'email', is_sent: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingEventReminders() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_reminders').select('*, events(title, start_date), users(email, name)').eq('is_sent', false).lte('remind_at', new Date().toISOString()).order('remind_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordEventView(eventId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('event_views').insert({ event_id: eventId, user_id: userId, viewed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEventViewCount(eventId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('event_views').select('*', { count: 'exact', head: true }).eq('event_id', eventId); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
