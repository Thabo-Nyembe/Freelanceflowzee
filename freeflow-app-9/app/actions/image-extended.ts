'use server'

/**
 * Extended Image Server Actions - Covers all Image-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getImages(userId?: string, folderId?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('images').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (folderId) query = query.eq('folder_id', folderId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getImage(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('images').select('*').eq('id', imageId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createImage(input: { user_id: string; filename: string; original_filename: string; url: string; thumbnail_url?: string; width?: number; height?: number; file_size?: number; mime_type?: string; folder_id?: string; alt_text?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('images').insert({ ...input, status: 'active', view_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateImage(imageId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('images').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', imageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteImage(imageId: string) {
  try { const supabase = await createClient(); await supabase.from('image_transformations').delete().eq('image_id', imageId); await supabase.from('image_metadata').delete().eq('image_id', imageId); const { error } = await supabase.from('images').delete().eq('id', imageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function moveImage(imageId: string, folderId: string | null) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('images').update({ folder_id: folderId, updated_at: new Date().toISOString() }).eq('id', imageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImageMetadata(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('image_metadata').select('*').eq('image_id', imageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setImageMetadata(imageId: string, metadata: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('image_metadata').select('id').eq('image_id', imageId).single(); if (existing) { const { data, error } = await supabase.from('image_metadata').update({ ...metadata, updated_at: new Date().toISOString() }).eq('image_id', imageId).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('image_metadata').insert({ image_id: imageId, ...metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createImageTransformation(imageId: string, transformation: { transform_type: string; parameters: any; result_url: string; result_width?: number; result_height?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('image_transformations').insert({ image_id: imageId, ...transformation }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getImageTransformations(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('image_transformations').select('*').eq('image_id', imageId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function incrementImageViewCount(imageId: string) {
  try { const supabase = await createClient(); const { data: image } = await supabase.from('images').select('view_count').eq('id', imageId).single(); const { data, error } = await supabase.from('images').update({ view_count: (image?.view_count || 0) + 1, last_viewed_at: new Date().toISOString() }).eq('id', imageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchImages(query: string, userId?: string, limit = 20) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('images').select('*').or(`filename.ilike.%${query}%,alt_text.ilike.%${query}%`).eq('status', 'active').limit(limit); if (userId) dbQuery = dbQuery.eq('user_id', userId); const { data, error } = await dbQuery; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkDeleteImages(imageIds: string[]) {
  try { const supabase = await createClient(); await supabase.from('image_transformations').delete().in('image_id', imageIds); await supabase.from('image_metadata').delete().in('image_id', imageIds); const { error } = await supabase.from('images').delete().in('id', imageIds); if (error) throw error; return { success: true, deleted: imageIds.length } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
