'use server'

/**
 * Extended AR (Augmented Reality) Server Actions - Covers all 10 AR-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getARAnalytics(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_analytics').select('*').eq('session_id', sessionId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateARAnalytics(sessionId: string, analytics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_analytics').upsert({ session_id: sessionId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARAnnotations(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_annotations').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createARAnnotation(sessionId: string, userId: string, input: { content: string; position: any; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_annotations').insert({ session_id: sessionId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateARAnnotation(annotationId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_annotations').update(updates).eq('id', annotationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteARAnnotation(annotationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('ar_annotations').delete().eq('id', annotationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARInteractions(sessionId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_interactions').select('*').eq('session_id', sessionId).order('timestamp', { ascending: false }).limit(limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logARInteraction(sessionId: string, userId: string, input: { interaction_type: string; target_id?: string; data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_interactions').insert({ session_id: sessionId, user_id: userId, ...input, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARObjects(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_objects').select('*').eq('session_id', sessionId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createARObject(sessionId: string, input: { name: string; type: string; model_url?: string; position: any; rotation?: any; scale?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_objects').insert({ session_id: sessionId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateARObject(objectId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_objects').update(updates).eq('id', objectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteARObject(objectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('ar_objects').delete().eq('id', objectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARParticipants(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_participants').select('*').eq('session_id', sessionId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function joinARSession(sessionId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_participants').insert({ session_id: sessionId, user_id: userId, joined_at: new Date().toISOString(), status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveARSession(sessionId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_participants').update({ left_at: new Date().toISOString(), status: 'left' }).eq('session_id', sessionId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARRecordings(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_recordings').select('*').eq('session_id', sessionId).order('started_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startARRecording(sessionId: string, startedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_recordings').insert({ session_id: sessionId, started_by: startedBy, started_at: new Date().toISOString(), status: 'recording' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopARRecording(recordingId: string, recordingUrl?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_recordings').update({ ended_at: new Date().toISOString(), recording_url: recordingUrl, status: 'completed' }).eq('id', recordingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARSessionMetrics(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_session_metrics').select('*').eq('session_id', sessionId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateARSessionMetrics(sessionId: string, metrics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_session_metrics').upsert({ session_id: sessionId, ...metrics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARSessions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_sessions').select('*').eq('host_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createARSession(hostId: string, input: { name: string; description?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_sessions').insert({ host_id: hostId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateARSession(sessionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_sessions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endARSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARWhiteboardStrokes(whiteboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_whiteboard_strokes').select('*').eq('whiteboard_id', whiteboardId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addARWhiteboardStroke(whiteboardId: string, userId: string, input: { points: any[]; color?: string; width?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_whiteboard_strokes').insert({ whiteboard_id: whiteboardId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearARWhiteboardStrokes(whiteboardId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('ar_whiteboard_strokes').delete().eq('whiteboard_id', whiteboardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getARWhiteboards(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_whiteboards').select('*').eq('session_id', sessionId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createARWhiteboard(sessionId: string, input: { name: string; position: any; size?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ar_whiteboards').insert({ session_id: sessionId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteARWhiteboard(whiteboardId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('ar_whiteboards').delete().eq('id', whiteboardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
