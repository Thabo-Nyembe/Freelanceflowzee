'use server'

/**
 * Extended Webinars Server Actions
 * Tables: webinars, webinar_registrations, webinar_sessions, webinar_recordings
 */

import { createClient } from '@/lib/supabase/server'

export async function getWebinar(webinarId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webinars').select('*, webinar_sessions(*)').eq('id', webinarId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWebinar(webinarData: { title: string; user_id: string; description?: string; scheduled_at: string; duration?: number; max_attendees?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webinars').insert({ ...webinarData, status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWebinar(webinarId: string, updates: Partial<{ title: string; description: string; scheduled_at: string; status: string; max_attendees: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webinars').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', webinarId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWebinar(webinarId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('webinars').delete().eq('id', webinarId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWebinars(options?: { user_id?: string; status?: string; is_public?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('webinars').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerForWebinar(webinarId: string, registrationData: { user_id: string; email?: string; name?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webinar_registrations').insert({ webinar_id: webinarId, ...registrationData, status: 'registered', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWebinarRegistrations(webinarId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('webinar_registrations').select('*').eq('webinar_id', webinarId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWebinarRecordings(webinarId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webinar_recordings').select('*').eq('webinar_id', webinarId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
