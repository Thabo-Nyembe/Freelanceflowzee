'use server'

/**
 * Extended Profile Server Actions - Covers all Profile-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getProfiles(isPublic?: boolean, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(limit); if (isPublic !== undefined) query = query.eq('is_public', isPublic); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getProfile(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProfileByUsername(username: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProfile(input: { user_id: string; username?: string; display_name?: string; bio?: string; avatar_url?: string; cover_url?: string; website?: string; location?: string; social_links?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').insert({ ...input, is_public: true, is_verified: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProfile(userId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProfile(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('profiles').delete().eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleProfilePublic(userId: string, isPublic: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').update({ is_public: isPublic }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyProfile(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkUsernameAvailability(username: string, excludeUserId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('profiles').select('id').eq('username', username); if (excludeUserId) query = query.neq('user_id', excludeUserId); const { data, error } = await query; if (error) throw error; return { success: true, data: { available: !data || data.length === 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchProfiles(query: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').select('*').eq('is_public', true).or(`username.ilike.%${query}%,display_name.ilike.%${query}%`).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getProfileSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProfileSettings(userId: string, settings: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('profile_settings').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('profile_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('profile_settings').insert({ user_id: userId, ...settings }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProfileWithSettings(userId: string) {
  try { const supabase = await createClient(); const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('user_id', userId).single(); if (profileError) throw profileError; const { data: settings } = await supabase.from('profile_settings').select('*').eq('user_id', userId).single(); return { success: true, data: { ...profile, settings } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementProfileViews(userId: string) {
  try { const supabase = await createClient(); const { data: profile, error: profileError } = await supabase.from('profiles').select('view_count').eq('user_id', userId).single(); if (profileError) throw profileError; const { data, error } = await supabase.from('profiles').update({ view_count: (profile.view_count || 0) + 1 }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
