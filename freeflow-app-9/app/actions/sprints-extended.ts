'use server'

/**
 * Extended Sprints Server Actions
 * Tables: sprints, sprint_tasks, sprint_metrics, sprint_retrospectives
 */

import { createClient } from '@/lib/supabase/server'

export async function getSprint(sprintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').select('*, sprint_tasks(*)').eq('id', sprintId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSprint(sprintData: { name: string; project_id: string; start_date: string; end_date: string; goal?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').insert({ ...sprintData, status: 'planning', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSprint(sprintId: string, updates: Partial<{ name: string; start_date: string; end_date: string; status: string; goal: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sprintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startSprint(sprintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', sprintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeSprint(sprintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', sprintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSprints(options?: { project_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sprints').select('*'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('start_date', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSprintTasks(sprintId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('sprint_tasks').select('*').eq('sprint_id', sprintId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSprintMetrics(sprintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprint_metrics').select('*').eq('sprint_id', sprintId).order('recorded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSprintRetrospective(sprintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprint_retrospectives').select('*').eq('sprint_id', sprintId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
