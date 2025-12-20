'use server'

/**
 * Extended Endorsement Server Actions - Covers all Endorsement-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getEndorsements(endorsedUserId: string, skillId?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('endorsements').select('*').eq('endorsed_user_id', endorsedUserId).order('created_at', { ascending: false }).limit(limit); if (skillId) query = query.eq('skill_id', skillId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addEndorsement(endorserId: string, endorsedUserId: string, skillId: string, comment?: string) {
  try { const supabase = await createClient(); if (endorserId === endorsedUserId) throw new Error('Cannot endorse yourself'); const { data: existing } = await supabase.from('endorsements').select('id').eq('endorser_id', endorserId).eq('endorsed_user_id', endorsedUserId).eq('skill_id', skillId).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('endorsements').insert({ endorser_id: endorserId, endorsed_user_id: endorsedUserId, skill_id: skillId, comment }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeEndorsement(endorserId: string, endorsedUserId: string, skillId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('endorsements').delete().eq('endorser_id', endorserId).eq('endorsed_user_id', endorsedUserId).eq('skill_id', skillId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleEndorsement(endorserId: string, endorsedUserId: string, skillId: string) {
  try { const supabase = await createClient(); if (endorserId === endorsedUserId) throw new Error('Cannot endorse yourself'); const { data: existing } = await supabase.from('endorsements').select('id').eq('endorser_id', endorserId).eq('endorsed_user_id', endorsedUserId).eq('skill_id', skillId).single(); if (existing) { await supabase.from('endorsements').delete().eq('id', existing.id); return { success: true, endorsed: false }; } const { data, error } = await supabase.from('endorsements').insert({ endorser_id: endorserId, endorsed_user_id: endorsedUserId, skill_id: skillId }).select().single(); if (error) throw error; return { success: true, endorsed: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function hasEndorsed(endorserId: string, endorsedUserId: string, skillId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('endorsements').select('id').eq('endorser_id', endorserId).eq('endorsed_user_id', endorsedUserId).eq('skill_id', skillId).single(); return { success: true, endorsed: !!data } } catch (error) { return { success: false, endorsed: false } }
}

export async function getEndorsementCount(endorsedUserId: string, skillId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('endorsements').select('*', { count: 'exact', head: true }).eq('endorsed_user_id', endorsedUserId); if (skillId) query = query.eq('skill_id', skillId); const { count, error } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getEndorsementsBySkill(endorsedUserId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('endorsements').select('skill_id').eq('endorsed_user_id', endorsedUserId); if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(e => { counts[e.skill_id] = (counts[e.skill_id] || 0) + 1; }); return { success: true, data: counts } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function getGivenEndorsements(endorserId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('endorsements').select('*').eq('endorser_id', endorserId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTopEndorsed(skillId?: string, limit = 10) {
  try { const supabase = await createClient(); let query = supabase.from('endorsements').select('endorsed_user_id'); if (skillId) query = query.eq('skill_id', skillId); const { data, error } = await query; if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(e => { counts[e.endorsed_user_id] = (counts[e.endorsed_user_id] || 0) + 1; }); const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([user_id, count]) => ({ user_id, count })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
