'use server'

/**
 * Extended Release Server Actions - Covers all Release-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getReleases(projectId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('releases').select('*').order('release_date', { ascending: false }); if (projectId) query = query.eq('project_id', projectId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRelease(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').select('*').eq('id', releaseId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRelease(input: { version: string; name?: string; description?: string; project_id?: string; release_date?: string; changelog?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').insert({ ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRelease(releaseId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', releaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishRelease(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').update({ status: 'published', published_at: new Date().toISOString(), release_date: new Date().toISOString() }).eq('id', releaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleRelease(releaseId: string, releaseDate: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').update({ status: 'scheduled', release_date: releaseDate }).eq('id', releaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveRelease(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', releaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRelease(releaseId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('releases').delete().eq('id', releaseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReleaseNotes(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('release_notes').select('*').eq('release_id', releaseId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReleaseNote(releaseId: string, input: { type: string; title: string; description?: string; order_index?: number; related_issue_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('release_notes').insert({ release_id: releaseId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReleaseNote(noteId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('release_notes').update(updates).eq('id', noteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReleaseNote(noteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('release_notes').delete().eq('id', noteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderReleaseNotes(releaseId: string, noteOrders: { id: string; order_index: number }[]) {
  try { const supabase = await createClient(); for (const note of noteOrders) { await supabase.from('release_notes').update({ order_index: note.order_index }).eq('id', note.id).eq('release_id', releaseId); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLatestRelease(projectId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('releases').select('*').eq('status', 'published').order('release_date', { ascending: false }).limit(1); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query; if (error) throw error; return { success: true, data: data?.[0] || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReleaseHistory(projectId: string, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').select('id, version, name, status, release_date').eq('project_id', projectId).eq('status', 'published').order('release_date', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
