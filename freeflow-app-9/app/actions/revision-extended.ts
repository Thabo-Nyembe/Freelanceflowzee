'use server'

/**
 * Extended Revision Server Actions - Covers all Revision-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRevisions(entityId: string, entityType: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revisions').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('revision_number', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRevision(entityId: string, entityType: string, content: any, createdBy: string, message?: string) {
  try { const supabase = await createClient(); const { data: latest } = await supabase.from('revisions').select('revision_number').eq('entity_id', entityId).eq('entity_type', entityType).order('revision_number', { ascending: false }).limit(1).single(); const revisionNumber = (latest?.revision_number || 0) + 1; const { data, error } = await supabase.from('revisions').insert({ entity_id: entityId, entity_type: entityType, content, created_by: createdBy, revision_number: revisionNumber, message }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRevision(entityId: string, entityType: string, revisionNumber: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revisions').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('revision_number', revisionNumber).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLatestRevision(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('revisions').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('revision_number', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreRevision(entityId: string, entityType: string, revisionNumber: number, restoredBy: string) {
  try { const supabase = await createClient(); const { data: revision, error: fetchError } = await supabase.from('revisions').select('content').eq('entity_id', entityId).eq('entity_type', entityType).eq('revision_number', revisionNumber).single(); if (fetchError) throw fetchError; const { data, error } = await supabase.from(entityType).update(revision.content).eq('id', entityId).select().single(); if (error) throw error; await createRevision(entityId, entityType, revision.content, restoredBy, `Restored from revision ${revisionNumber}`); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function compareRevisions(entityId: string, entityType: string, rev1: number, rev2: number) {
  try { const supabase = await createClient(); const [{ data: r1 }, { data: r2 }] = await Promise.all([ supabase.from('revisions').select('content, created_at, created_by').eq('entity_id', entityId).eq('entity_type', entityType).eq('revision_number', rev1).single(), supabase.from('revisions').select('content, created_at, created_by').eq('entity_id', entityId).eq('entity_type', entityType).eq('revision_number', rev2).single() ]); if (!r1 || !r2) return { success: false, error: 'One or both revisions not found' }; const differences: Record<string, { before: any; after: any }> = {}; const allKeys = new Set([...Object.keys(r1.content || {}), ...Object.keys(r2.content || {})]); allKeys.forEach(key => { if (JSON.stringify(r1.content?.[key]) !== JSON.stringify(r2.content?.[key])) { differences[key] = { before: r1.content?.[key], after: r2.content?.[key] }; } }); return { success: true, differences, revision1: { number: rev1, ...r1 }, revision2: { number: rev2, ...r2 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRevision(revisionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('revisions').delete().eq('id', revisionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRevisionCount(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('revisions').select('*', { count: 'exact', head: true }).eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}
