'use server'

/**
 * Extended Motion Server Actions
 * Tables: motions, motion_frames, motion_animations, motion_presets
 */

import { createClient } from '@/lib/supabase/server'

export async function getMotion(motionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('motions').select('*').eq('id', motionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMotion(motionData: { user_id: string; name: string; type?: string; duration?: number; fps?: number; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('motions').insert({ ...motionData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMotion(motionId: string, updates: Partial<{ name: string; type: string; duration: number; fps: number; settings: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('motions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', motionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMotion(motionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('motions').delete().eq('id', motionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMotions(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('motions').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMotionFrames(motionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('motion_frames').select('*').eq('motion_id', motionId).order('frame_number', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMotionPresets(options?: { type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('motion_presets').select('*'); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function renderMotion(motionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('motions').update({ status: 'rendering', render_started_at: new Date().toISOString() }).eq('id', motionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
