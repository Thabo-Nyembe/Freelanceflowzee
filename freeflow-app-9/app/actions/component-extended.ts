'use server'

/**
 * Extended Component Server Actions - Covers all 8 Component-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getComponentAnalytics(componentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_analytics').select('*').eq('component_id', componentId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComponentAnalytics(componentId: string, analytics: { views?: number; downloads?: number; usage_count?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_analytics').upsert({ component_id: componentId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComponentCollections(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_collections').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createComponentCollection(userId: string, name: string, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_collections').insert({ user_id: userId, name, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addToComponentCollection(collectionId: string, componentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_collections').update({ components: supabase.sql`array_append(components, ${componentId})` }).eq('id', collectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComponentDownloads(componentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_downloads').select('*').eq('component_id', componentId).order('downloaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackComponentDownload(componentId: string, userId?: string, version?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_downloads').insert({ component_id: componentId, user_id: userId, version, downloaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComponentExamples(componentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_examples').select('*').eq('component_id', componentId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addComponentExample(componentId: string, input: { title: string; code: string; description?: string; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_examples').insert({ component_id: componentId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComponentExample(exampleId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_examples').update(updates).eq('id', exampleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComponentFavorites(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleComponentFavorite(userId: string, componentId: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase.from('component_favorites').select('id').eq('user_id', userId).eq('component_id', componentId).single()
    if (existing) {
      await supabase.from('component_favorites').delete().eq('id', existing.id)
      return { success: true, favorited: false }
    } else {
      await supabase.from('component_favorites').insert({ user_id: userId, component_id: componentId })
      return { success: true, favorited: true }
    }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComponentReviews(componentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_reviews').select('*').eq('component_id', componentId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addComponentReview(componentId: string, userId: string, rating: number, review: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_reviews').insert({ component_id: componentId, user_id: userId, rating, review }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComponentReview(reviewId: string, rating: number, review: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_reviews').update({ rating, review, updated_at: new Date().toISOString() }).eq('id', reviewId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComponentShowcases() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_showcases').select('*').eq('is_featured', true).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createComponentShowcase(componentId: string, input: { title: string; description?: string; demo_url?: string; is_featured?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_showcases').insert({ component_id: componentId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComponentVersions(componentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_versions').select('*').eq('component_id', componentId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createComponentVersion(componentId: string, input: { version: string; changelog?: string; code: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('component_versions').insert({ component_id: componentId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
