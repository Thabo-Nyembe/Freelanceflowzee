'use server'

/**
 * Extended Capture Server Actions
 * Tables: captures, capture_sessions, capture_frames, capture_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getCapture(captureId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('captures').select('*, capture_frames(*)').eq('id', captureId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCapture(captureData: { user_id: string; type: string; source?: string; title?: string; description?: string; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('captures').insert({ ...captureData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startCaptureSession(captureId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capture_sessions').insert({ capture_id: captureId, status: 'active', started_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('captures').update({ status: 'capturing' }).eq('id', captureId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endCaptureSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capture_sessions').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; if (data?.capture_id) await supabase.from('captures').update({ status: 'completed' }).eq('id', data.capture_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addCaptureFrame(frameData: { capture_id: string; session_id?: string; frame_number: number; file_url: string; timestamp?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capture_frames').insert({ ...frameData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCaptures(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('captures').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCaptureFrames(captureId: string, options?: { limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('capture_frames').select('*').eq('capture_id', captureId).order('frame_number', { ascending: true }); if (options?.offset) query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1); else if (options?.limit) query = query.limit(options.limit); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteCapture(captureId: string) {
  try { const supabase = await createClient(); await supabase.from('capture_frames').delete().eq('capture_id', captureId); await supabase.from('capture_sessions').delete().eq('capture_id', captureId); const { error } = await supabase.from('captures').delete().eq('id', captureId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCaptureSettings(captureId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('captures').update({ settings, updated_at: new Date().toISOString() }).eq('id', captureId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
