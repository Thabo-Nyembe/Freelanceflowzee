'use server'

/**
 * Extended Lights Server Actions
 * Tables: lights, light_scenes, light_schedules, light_groups
 */

import { createClient } from '@/lib/supabase/server'

export async function getLight(lightId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lights').select('*').eq('id', lightId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLight(lightData: { user_id: string; name: string; type?: string; location?: string; is_on?: boolean; brightness?: number; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lights').insert({ ...lightData, is_on: lightData.is_on ?? false, brightness: lightData.brightness ?? 100, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLight(lightId: string, updates: Partial<{ name: string; is_on: boolean; brightness: number; color: string; location: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('lights').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', lightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLight(lightId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('lights').delete().eq('id', lightId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLights(options?: { user_id?: string; location?: string; is_on?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('lights').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.location) query = query.eq('location', options.location); if (options?.is_on !== undefined) query = query.eq('is_on', options.is_on); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleLight(lightId: string) {
  try { const supabase = await createClient(); const { data: light } = await supabase.from('lights').select('is_on').eq('id', lightId).single(); if (!light) throw new Error('Light not found'); const { data, error } = await supabase.from('lights').update({ is_on: !light.is_on, updated_at: new Date().toISOString() }).eq('id', lightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLightScenes(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('light_scenes').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function activateScene(sceneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('light_scenes').update({ last_activated_at: new Date().toISOString() }).eq('id', sceneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLightSchedules(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('light_schedules').select('*').eq('user_id', userId).order('time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
