'use server'

/**
 * Extended Timeline Server Actions
 * Tables: timelines, timeline_events, timeline_milestones, timeline_markers
 */

import { createClient } from '@/lib/supabase/server'

export async function getTimeline(timelineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timelines').select('*, timeline_events(*), timeline_milestones(*)').eq('id', timelineId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTimeline(timelineData: { name: string; user_id?: string; project_id?: string; start_date?: string; end_date?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timelines').insert({ ...timelineData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTimeline(timelineId: string, updates: Partial<{ name: string; start_date: string; end_date: string; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timelines').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', timelineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTimeline(timelineId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('timelines').delete().eq('id', timelineId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimelines(options?: { user_id?: string; project_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('timelines').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.project_id) query = query.eq('project_id', options.project_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTimelineEvent(timelineId: string, eventData: { title: string; date: string; description?: string; type?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timeline_events').insert({ timeline_id: timelineId, ...eventData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimelineEvents(timelineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timeline_events').select('*').eq('timeline_id', timelineId).order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTimelineMilestones(timelineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timeline_milestones').select('*').eq('timeline_id', timelineId).order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
