'use server'

/**
 * Extended Resource Server Actions - Covers all 9 Resource-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getResourceBookmarks(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addResourceBookmark(userId: string, resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_bookmarks').insert({ user_id: userId, resource_id: resourceId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeResourceBookmark(userId: string, resourceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('resource_bookmarks').delete().eq('user_id', userId).eq('resource_id', resourceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createResourceCategory(name: string, description?: string, parentId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_categories').insert({ name, description, parent_id: parentId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceCollections(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_collections').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createResourceCollection(userId: string, name: string, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_collections').insert({ user_id: userId, name, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addResourceToCollection(collectionId: string, resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_collections').update({ resources: supabase.sql`array_append(resources, ${resourceId})` }).eq('id', collectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceComments(resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_comments').select('*').eq('resource_id', resourceId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addResourceComment(resourceId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_comments').insert({ resource_id: resourceId, user_id: userId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteResourceComment(commentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('resource_comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceDownloads(resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_downloads').select('*').eq('resource_id', resourceId).order('downloaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackResourceDownload(resourceId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_downloads').insert({ resource_id: resourceId, user_id: userId, downloaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceRatings(resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_ratings').select('*').eq('resource_id', resourceId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function rateResource(resourceId: string, userId: string, rating: number, review?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_ratings').upsert({ resource_id: resourceId, user_id: userId, rating, review }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceTags() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_tags').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createResourceTag(name: string, color?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_tags').insert({ name, color }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceUsage(resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_usage').select('*').eq('resource_id', resourceId).order('used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackResourceUsage(resourceId: string, userId: string, usageType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_usage').insert({ resource_id: resourceId, user_id: userId, usage_type: usageType, used_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceUsageLogs(userId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_usage_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logResourceUsage(userId: string, resourceId: string, action: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_usage_logs').insert({ user_id: userId, resource_id: resourceId, action, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
