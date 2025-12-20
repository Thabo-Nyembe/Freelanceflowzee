'use server'

/**
 * Extended Cameras Server Actions
 * Tables: cameras, camera_feeds, camera_recordings, camera_alerts
 */

import { createClient } from '@/lib/supabase/server'

export async function getCamera(cameraId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cameras').select('*').eq('id', cameraId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCamera(cameraData: { user_id: string; name: string; location?: string; stream_url?: string; type?: string; resolution?: string; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cameras').insert({ ...cameraData, status: 'offline', is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCamera(cameraId: string, updates: Partial<{ name: string; location: string; stream_url: string; status: string; is_active: boolean; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cameras').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', cameraId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCamera(cameraId: string) {
  try { const supabase = await createClient(); await supabase.from('camera_recordings').delete().eq('camera_id', cameraId); await supabase.from('camera_alerts').delete().eq('camera_id', cameraId); const { error } = await supabase.from('cameras').delete().eq('id', cameraId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCameras(options?: { user_id?: string; status?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('cameras').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startRecording(cameraId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('camera_recordings').insert({ camera_id: cameraId, status: 'recording', started_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('cameras').update({ is_recording: true }).eq('id', cameraId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopRecording(recordingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('camera_recordings').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', recordingId).select().single(); if (error) throw error; if (data?.camera_id) await supabase.from('cameras').update({ is_recording: false }).eq('id', data.camera_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCameraRecordings(cameraId: string, options?: { date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('camera_recordings').select('*').eq('camera_id', cameraId); if (options?.date_from) query = query.gte('started_at', options.date_from); if (options?.date_to) query = query.lte('started_at', options.date_to); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCameraAlert(alertData: { camera_id: string; type: string; message: string; severity?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('camera_alerts').insert({ ...alertData, is_acknowledged: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
