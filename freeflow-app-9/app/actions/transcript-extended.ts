'use server'

/**
 * Extended Transcript Server Actions
 * Tables: transcripts, transcript_segments, transcript_speakers, transcript_exports
 */

import { createClient } from '@/lib/supabase/server'

export async function getTranscript(transcriptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transcripts').select('*, transcript_segments(*), transcript_speakers(*)').eq('id', transcriptId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTranscript(transcriptData: { title: string; user_id: string; source_url?: string; source_type?: string; language?: string; duration?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transcripts').insert({ ...transcriptData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranscript(transcriptId: string, updates: Partial<{ title: string; status: string; content: string; language: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transcripts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', transcriptId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTranscript(transcriptId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('transcripts').delete().eq('id', transcriptId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranscripts(options?: { user_id?: string; status?: string; source_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('transcripts').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.source_type) query = query.eq('source_type', options.source_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTranscriptSegments(transcriptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transcript_segments').select('*').eq('transcript_id', transcriptId).order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTranscriptSegment(transcriptId: string, segmentData: { content: string; start_time: number; end_time: number; speaker_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transcript_segments').insert({ transcript_id: transcriptId, ...segmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranscriptSpeakers(transcriptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('transcript_speakers').select('*').eq('transcript_id', transcriptId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
