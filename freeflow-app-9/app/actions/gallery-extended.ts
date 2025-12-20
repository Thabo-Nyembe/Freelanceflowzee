'use server'

/**
 * Extended Gallery Server Actions - Covers all 15 Gallery-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getGalleryAIMetadata(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_ai_metadata').select('*').eq('image_id', imageId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryAlbums(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_albums').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGalleryAlbum(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_albums').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryClientLinks(galleryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_client_links').select('*').eq('gallery_id', galleryId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGalleryClientLink(galleryId: string, clientEmail: string, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_client_links').insert({ gallery_id: galleryId, client_email: clientEmail, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryCollectionImages(collectionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_collection_images').select('*').eq('collection_id', collectionId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addImageToCollection(collectionId: string, imageId: string, order?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_collection_images').insert({ collection_id: collectionId, image_id: imageId, order }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryComments(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_comments').select('*').eq('image_id', imageId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGalleryComment(imageId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_comments').insert({ image_id: imageId, user_id: userId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryDownloads(galleryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_downloads').select('*').eq('gallery_id', galleryId).order('downloaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordGalleryDownload(galleryId: string, imageId: string, userId?: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('gallery_downloads').insert({ gallery_id: galleryId, image_id: imageId, user_id: userId, downloaded_at: new Date().toISOString() }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryEdits(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_edits').select('*').eq('image_id', imageId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGalleryEdit(imageId: string, userId: string, editData: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_edits').insert({ image_id: imageId, user_id: userId, edit_data: editData }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryFavorites(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleGalleryFavorite(userId: string, imageId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('gallery_favorites').select('id').eq('user_id', userId).eq('image_id', imageId).single(); if (existing) { await supabase.from('gallery_favorites').delete().eq('id', existing.id); return { success: true, favorited: false } } else { await supabase.from('gallery_favorites').insert({ user_id: userId, image_id: imageId }); return { success: true, favorited: true } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryImageTags(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_image_tags').select('*').eq('image_id', imageId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addGalleryImageTag(imageId: string, tagId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_image_tags').insert({ image_id: imageId, tag_id: tagId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryImages(galleryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_images').select('*').eq('gallery_id', galleryId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addGalleryImage(galleryId: string, input: { url: string; name?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_images').insert({ gallery_id: galleryId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryLikes(imageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_likes').select('*').eq('image_id', imageId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleGalleryLike(imageId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('gallery_likes').select('id').eq('image_id', imageId).eq('user_id', userId).single(); if (existing) { await supabase.from('gallery_likes').delete().eq('id', existing.id); return { success: true, liked: false } } else { await supabase.from('gallery_likes').insert({ image_id: imageId, user_id: userId }); return { success: true, liked: true } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryProofingSelections(galleryId: string, clientId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('gallery_proofing_selections').select('*').eq('gallery_id', galleryId); if (clientId) query = query.eq('client_id', clientId); const { data, error } = await query.order('selected_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function selectProofingImage(galleryId: string, imageId: string, clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_proofing_selections').insert({ gallery_id: galleryId, image_id: imageId, client_id: clientId, selected_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryShares(galleryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_shares').select('*').eq('gallery_id', galleryId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGalleryShare(galleryId: string, shareType: string, password?: string, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_shares').insert({ gallery_id: galleryId, share_type: shareType, password, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryTags(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_tags').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGalleryTag(userId: string, name: string, color?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_tags').insert({ user_id: userId, name, color }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackGalleryView(galleryId: string, viewerInfo?: any) {
  try { const supabase = await createClient(); const { error } = await supabase.from('gallery_views').insert({ gallery_id: galleryId, viewed_at: new Date().toISOString(), viewer_info: viewerInfo }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGalleryViews(galleryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('gallery_views').select('*').eq('gallery_id', galleryId).order('viewed_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
