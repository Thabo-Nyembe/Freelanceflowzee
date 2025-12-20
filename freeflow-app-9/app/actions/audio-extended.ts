'use server'

/**
 * Extended Audio Server Actions - Covers all 3 Audio-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAudioEffects(category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('audio_effects').select('*').order('name', { ascending: true }); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAudioEffect(input: { name: string; category: string; settings: any; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_effects').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAudioEffect(effectId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_effects').update(updates).eq('id', effectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAudioEffect(effectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('audio_effects').delete().eq('id', effectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAudioProjects(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAudioProject(userId: string, input: { name: string; description?: string; sample_rate?: number; bit_depth?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_projects').insert({ user_id: userId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAudioProject(projectId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', projectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAudioProject(projectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('audio_projects').delete().eq('id', projectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAudioTracks(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_tracks').select('*').eq('project_id', projectId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAudioTrack(projectId: string, input: { name: string; file_url?: string; order_index: number; volume?: number; pan?: number; effects?: any[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_tracks').insert({ project_id: projectId, ...input, is_muted: false, is_solo: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAudioTrack(trackId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audio_tracks').update(updates).eq('id', trackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAudioTrack(trackId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('audio_tracks').delete().eq('id', trackId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderAudioTracks(projectId: string, trackOrder: { id: string; order_index: number }[]) {
  try { const supabase = await createClient(); for (const track of trackOrder) { await supabase.from('audio_tracks').update({ order_index: track.order_index }).eq('id', track.id); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
