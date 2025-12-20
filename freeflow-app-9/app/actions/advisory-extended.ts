'use server'

/**
 * Extended Advisory Server Actions
 * Tables: advisory_sessions, advisory_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getAdvisorySession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_sessions').select('*').eq('id', sessionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAdvisorySession(sessionData: { user_id: string; advisor_id?: string; topic: string; description?: string; session_type?: string; scheduled_at?: string; duration_minutes?: number; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_sessions').insert({ ...sessionData, status: sessionData.status || 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAdvisorySession(sessionId: string, updates: Partial<{ topic: string; description: string; scheduled_at: string; duration_minutes: number; status: string; notes: string; rating: number; feedback: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_sessions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAdvisorySession(sessionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('advisory_sessions').delete().eq('id', sessionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdvisorySessions(options?: { user_id?: string; advisor_id?: string; status?: string; session_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('advisory_sessions').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.advisor_id) query = query.eq('advisor_id', options.advisor_id); if (options?.status) query = query.eq('status', options.status); if (options?.session_type) query = query.eq('session_type', options.session_type); const { data, error } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startAdvisorySession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_sessions').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeAdvisorySession(sessionId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_sessions').update({ status: 'completed', notes, completed_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rateAdvisorySession(sessionId: string, rating: number, feedback?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_sessions').update({ rating, feedback, rated_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAdvisoryAnalytics(advisorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_analytics').select('*').eq('advisor_id', advisorId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUpcomingSessions(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('advisory_sessions').select('*').eq('user_id', userId).in('status', ['scheduled', 'confirmed']).gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
