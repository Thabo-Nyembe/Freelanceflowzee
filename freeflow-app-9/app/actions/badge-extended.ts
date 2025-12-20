'use server'

/**
 * Extended Badge Server Actions - Covers all Badge-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBadges(isActive?: boolean, category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('badges').select('*').order('name', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBadge(badgeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badges').select('*').eq('id', badgeId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBadge(input: { name: string; description?: string; icon?: string; color?: string; category?: string; points?: number; criteria?: any; is_secret?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badges').insert({ ...input, is_active: true, award_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBadge(badgeId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badges').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', badgeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleBadgeActive(badgeId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badges').update({ is_active: isActive }).eq('id', badgeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBadge(badgeId: string) {
  try { const supabase = await createClient(); await supabase.from('badge_awards').delete().eq('badge_id', badgeId); const { error } = await supabase.from('badges').delete().eq('id', badgeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBadgeAwards(userId?: string, badgeId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('badge_awards').select('*, badges(*)').order('awarded_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (badgeId) query = query.eq('badge_id', badgeId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserBadges(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badge_awards').select('*, badges(*)').eq('user_id', userId).order('awarded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function awardBadge(userId: string, badgeId: string, reason?: string, awardedBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('badge_awards').select('id').eq('user_id', userId).eq('badge_id', badgeId).single(); if (existing) throw new Error('User already has this badge'); const { data, error } = await supabase.from('badge_awards').insert({ user_id: userId, badge_id: badgeId, reason, awarded_by: awardedBy, awarded_at: new Date().toISOString() }).select('*, badges(*)').single(); if (error) throw error; const { data: badge } = await supabase.from('badges').select('award_count').eq('id', badgeId).single(); await supabase.from('badges').update({ award_count: (badge?.award_count || 0) + 1 }).eq('id', badgeId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeBadge(userId: string, badgeId: string, reason?: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('badge_awards').delete().eq('user_id', userId).eq('badge_id', badgeId); if (error) throw error; const { data: badge } = await supabase.from('badges').select('award_count').eq('id', badgeId).single(); await supabase.from('badges').update({ award_count: Math.max(0, (badge?.award_count || 1) - 1) }).eq('id', badgeId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkUserHasBadge(userId: string, badgeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badge_awards').select('id').eq('user_id', userId).eq('badge_id', badgeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: { hasBadge: !!data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserBadgePoints(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badge_awards').select('badges(points)').eq('user_id', userId); if (error) throw error; const totalPoints = data?.reduce((sum, a) => sum + ((a as any).badges?.points || 0), 0) || 0; return { success: true, data: { total_points: totalPoints, badge_count: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecentBadgeAwards(limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badge_awards').select('*, badges(*), profiles:user_id(username, display_name, avatar_url)').order('awarded_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBadgeLeaderboard(limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('badge_awards').select('user_id, profiles:user_id(username, display_name, avatar_url)'); if (error) throw error; const userCounts: Record<string, { count: number; profile: any }> = {}; data?.forEach(a => { if (!userCounts[a.user_id]) { userCounts[a.user_id] = { count: 0, profile: (a as any).profiles }; } userCounts[a.user_id].count++; }); const sorted = Object.entries(userCounts).sort((a, b) => b[1].count - a[1].count).slice(0, limit).map(([userId, { count, profile }]) => ({ user_id: userId, badge_count: count, profile })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
