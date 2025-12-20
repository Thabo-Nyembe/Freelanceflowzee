'use server'

/**
 * Extended Design Server Actions
 * Tables: designs, design_versions, design_assets, design_comments, design_exports
 */

import { createClient } from '@/lib/supabase/server'

export async function getDesign(designId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('designs').select('*, design_versions(*), design_assets(*), design_comments(*)').eq('id', designId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDesign(designData: { user_id: string; name: string; description?: string; project_id?: string; type?: string; width?: number; height?: number; canvas_data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('designs').insert({ ...designData, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDesign(designId: string, updates: Partial<{ name: string; description: string; status: string; canvas_data: any; thumbnail: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('designs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', designId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDesign(designId: string) {
  try { const supabase = await createClient(); await supabase.from('design_versions').delete().eq('design_id', designId); await supabase.from('design_assets').delete().eq('design_id', designId); await supabase.from('design_comments').delete().eq('design_id', designId); const { error } = await supabase.from('designs').delete().eq('id', designId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserDesigns(userId: string, options?: { project_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('designs').select('*').eq('user_id', userId); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveDesignVersion(designId: string, versionData: { canvas_data: any; thumbnail?: string; description?: string }) {
  try { const supabase = await createClient(); const { data: design } = await supabase.from('designs').select('version').eq('id', designId).single(); const newVersion = (design?.version || 0) + 1; const { data, error } = await supabase.from('design_versions').insert({ design_id: designId, version: newVersion, canvas_data: versionData.canvas_data, thumbnail: versionData.thumbnail, description: versionData.description, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('designs').update({ version: newVersion, updated_at: new Date().toISOString() }).eq('id', designId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDesignVersions(designId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('design_versions').select('*').eq('design_id', designId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDesignAsset(assetData: { design_id: string; name: string; type: string; url: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('design_assets').insert({ ...assetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addDesignComment(commentData: { design_id: string; user_id: string; content: string; x?: number; y?: number; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('design_comments').insert({ ...commentData, is_resolved: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function exportDesign(exportData: { design_id: string; format: string; quality?: number; scale?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('design_exports').insert({ ...exportData, status: 'pending', requested_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
