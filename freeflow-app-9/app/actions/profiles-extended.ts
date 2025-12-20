'use server'

/**
 * Extended Profiles Server Actions
 * Tables: profiles, profile_settings, profile_links, profile_skills, profile_experience, profile_education, profile_certifications, profile_views
 */

import { createClient } from '@/lib/supabase/server'

export async function getProfile(profileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').select('*, profile_settings(*), profile_links(*), profile_skills(*), profile_experience(*), profile_education(*), profile_certifications(*)').eq('id', profileId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProfileByUsername(username: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').select('*, profile_settings(*), profile_links(*), profile_skills(*), profile_experience(*), profile_education(*), profile_certifications(*)').eq('username', username).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProfile(profileData: { user_id: string; username: string; display_name: string; bio?: string; avatar_url?: string; cover_url?: string; location?: string; website?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').insert({ ...profileData, is_public: true, is_verified: false, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('profile_settings').insert({ profile_id: data.id, show_email: false, show_location: true, allow_messages: true, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProfile(profileId: string, updates: Partial<{ username: string; display_name: string; bio: string; avatar_url: string; cover_url: string; location: string; website: string; headline: string; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', profileId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProfile(profileId: string) {
  try { const supabase = await createClient(); await supabase.from('profile_settings').delete().eq('profile_id', profileId); await supabase.from('profile_links').delete().eq('profile_id', profileId); await supabase.from('profile_skills').delete().eq('profile_id', profileId); await supabase.from('profile_experience').delete().eq('profile_id', profileId); await supabase.from('profile_education').delete().eq('profile_id', profileId); await supabase.from('profile_certifications').delete().eq('profile_id', profileId); await supabase.from('profile_views').delete().eq('profile_id', profileId); const { error } = await supabase.from('profiles').delete().eq('id', profileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProfiles(options?: { is_public?: boolean; is_verified?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('profiles').select('*, profile_skills(*)'); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.is_verified !== undefined) query = query.eq('is_verified', options.is_verified); if (options?.search) query = query.or(`username.ilike.%${options.search}%,display_name.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSettings(profileId: string, settings: Partial<{ show_email: boolean; show_location: boolean; show_phone: boolean; allow_messages: boolean; allow_follows: boolean; email_notifications: boolean; push_notifications: boolean; theme: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_settings').upsert({ profile_id: profileId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'profile_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addLink(profileId: string, linkData: { platform: string; url: string; title?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_links').insert({ profile_id: profileId, ...linkData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLink(linkId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('profile_links').delete().eq('id', linkId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addSkill(profileId: string, skillData: { name: string; level?: string; years?: number; endorsement_count?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_skills').insert({ profile_id: profileId, ...skillData, endorsement_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeSkill(skillId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('profile_skills').delete().eq('id', skillId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endorseSkill(skillId: string, endorserId: string) {
  try { const supabase = await createClient(); await supabase.from('profile_skills').update({ endorsement_count: supabase.sql`endorsement_count + 1` }).eq('id', skillId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addExperience(profileId: string, experienceData: { company: string; title: string; location?: string; start_date: string; end_date?: string; is_current?: boolean; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_experience').insert({ profile_id: profileId, ...experienceData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExperience(experienceId: string, updates: Partial<{ company: string; title: string; location: string; start_date: string; end_date: string; is_current: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_experience').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', experienceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addEducation(profileId: string, educationData: { institution: string; degree: string; field_of_study?: string; start_year: number; end_year?: number; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_education').insert({ profile_id: profileId, ...educationData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addCertification(profileId: string, certificationData: { name: string; issuing_organization: string; issue_date: string; expiration_date?: string; credential_id?: string; credential_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profile_certifications').insert({ profile_id: profileId, ...certificationData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordView(profileId: string, viewerData?: { viewer_id?: string; ip_address?: string; referrer?: string }) {
  try { const supabase = await createClient(); await supabase.from('profile_views').insert({ profile_id: profileId, ...viewerData, viewed_at: new Date().toISOString() }); await supabase.from('profiles').update({ view_count: supabase.sql`view_count + 1` }).eq('id', profileId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkUsernameAvailability(username: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('profiles').select('id').eq('username', username).single(); if (error && error.code === 'PGRST116') return { success: true, available: true }; return { success: true, available: false } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
