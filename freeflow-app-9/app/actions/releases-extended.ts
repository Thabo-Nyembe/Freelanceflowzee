'use server'

/**
 * Extended Releases Server Actions
 * Tables: releases, release_notes, release_assets, release_deployments
 */

import { createClient } from '@/lib/supabase/server'

export async function getRelease(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').select('*, release_notes(*), release_assets(*)').eq('id', releaseId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRelease(releaseData: { version: string; name?: string; description?: string; project_id?: string; is_prerelease?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').insert({ ...releaseData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRelease(releaseId: string, updates: Partial<{ version: string; name: string; description: string; status: string; is_prerelease: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', releaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishRelease(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('releases').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', releaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReleases(options?: { project_id?: string; status?: string; is_prerelease?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('releases').select('*'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_prerelease !== undefined) query = query.eq('is_prerelease', options.is_prerelease); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReleaseNotes(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('release_notes').select('*').eq('release_id', releaseId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReleaseAssets(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('release_assets').select('*').eq('release_id', releaseId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReleaseDeployments(releaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('release_deployments').select('*').eq('release_id', releaseId).order('deployed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
