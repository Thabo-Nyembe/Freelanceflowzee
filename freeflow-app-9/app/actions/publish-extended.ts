'use server'

/**
 * Extended Publish Server Actions - Covers all Publish-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPublications(userId?: string, entityType?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('publications').select('*').order('published_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (entityType) query = query.eq('entity_type', entityType); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publish(userId: string, entityId: string, entityType: string, scheduledAt?: string) {
  try { const supabase = await createClient(); const publishedAt = scheduledAt || new Date().toISOString(); const status = scheduledAt && new Date(scheduledAt) > new Date() ? 'scheduled' : 'published'; const { data, error } = await supabase.from('publications').insert({ user_id: userId, entity_id: entityId, entity_type: entityType, status, published_at: status === 'published' ? publishedAt : null, scheduled_at: scheduledAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublish(entityId: string, entityType: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('publications').update({ status: 'unpublished', unpublished_at: new Date().toISOString() }).eq('entity_id', entityId).eq('entity_type', entityType).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function republish(entityId: string, entityType: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('publications').update({ status: 'published', published_at: new Date().toISOString(), republished_at: new Date().toISOString() }).eq('entity_id', entityId).eq('entity_type', entityType).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPublicationStatus(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('publications').select('status, published_at, scheduled_at').eq('entity_id', entityId).eq('entity_type', entityType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data, isPublished: data?.status === 'published' } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', isPublished: false } }
}

export async function getScheduledPublications(limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('publications').select('*').eq('status', 'scheduled').order('scheduled_at', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function processScheduledPublications() {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('publications').update({ status: 'published', published_at: now }).eq('status', 'scheduled').lte('scheduled_at', now).select(); if (error) throw error; return { success: true, processed: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', processed: 0 } }
}

export async function cancelScheduledPublication(publicationId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('publications').delete().eq('id', publicationId).eq('user_id', userId).eq('status', 'scheduled'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
