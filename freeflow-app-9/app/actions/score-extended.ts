'use server'

/**
 * Extended Score Server Actions - Covers all Score-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getScore(entityId: string, entityType: string, scoreType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scores').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('score_type', scoreType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data, score: data?.score || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', score: 0 } }
}

export async function setScore(entityId: string, entityType: string, scoreType: string, score: number, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scores').upsert({ entity_id: entityId, entity_type: entityType, score_type: scoreType, score, metadata, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type,score_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateScore(entityId: string, entityType: string, scoreType: string, delta: number) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('scores').select('id, score').eq('entity_id', entityId).eq('entity_type', entityType).eq('score_type', scoreType).single(); if (existing) { const { data, error } = await supabase.from('scores').update({ score: existing.score + delta, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data, score: data.score }; } return setScore(entityId, entityType, scoreType, delta); } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScores(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scores').select('*').eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLeaderboard(scoreType: string, entityType: string, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scores').select('entity_id, score').eq('score_type', scoreType).eq('entity_type', entityType).order('score', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRank(entityId: string, entityType: string, scoreType: string) {
  try { const supabase = await createClient(); const { data: entityScore } = await supabase.from('scores').select('score').eq('entity_id', entityId).eq('entity_type', entityType).eq('score_type', scoreType).single(); if (!entityScore) return { success: true, rank: null }; const { count, error } = await supabase.from('scores').select('*', { count: 'exact', head: true }).eq('entity_type', entityType).eq('score_type', scoreType).gt('score', entityScore.score); if (error) throw error; return { success: true, rank: (count || 0) + 1, score: entityScore.score } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', rank: null } }
}

export async function getScoreDistribution(scoreType: string, entityType: string, buckets = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scores').select('score').eq('score_type', scoreType).eq('entity_type', entityType); if (error) throw error; if (!data?.length) return { success: true, data: [] }; const scores = data.map(s => s.score); const min = Math.min(...scores); const max = Math.max(...scores); const bucketSize = (max - min) / buckets; const distribution = Array(buckets).fill(0); scores.forEach(s => { const bucket = Math.min(Math.floor((s - min) / bucketSize), buckets - 1); distribution[bucket]++; }); return { success: true, data: distribution, min, max } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteScore(entityId: string, entityType: string, scoreType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('scores').delete().eq('entity_id', entityId).eq('entity_type', entityType).eq('score_type', scoreType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
