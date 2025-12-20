'use server'

/**
 * Extended Voices Server Actions
 * Tables: voices, voice_samples, voice_settings, voice_generations
 */

import { createClient } from '@/lib/supabase/server'

export async function getVoice(voiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voices').select('*, voice_samples(*)').eq('id', voiceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVoice(voiceData: { name: string; user_id?: string; type?: string; language?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voices').insert({ ...voiceData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVoice(voiceId: string, updates: Partial<{ name: string; description: string; status: string; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voices').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', voiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteVoice(voiceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('voices').delete().eq('id', voiceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoices(options?: { user_id?: string; type?: string; language?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('voices').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.language) query = query.eq('language', options.language); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVoiceSamples(voiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_samples').select('*').eq('voice_id', voiceId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVoiceSettings(voiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('voice_settings').select('*').eq('voice_id', voiceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVoiceGenerations(options?: { voice_id?: string; user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('voice_generations').select('*'); if (options?.voice_id) query = query.eq('voice_id', options.voice_id); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
