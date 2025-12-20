'use server'

/**
 * Extended Follow Server Actions - Covers all Follow-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getFollowers(userId: string, limit = 50, offset = 0) {
  try { const supabase = await createClient(); const { data, error, count } = await supabase.from('follows').select('*, follower:profiles!follower_id(*)', { count: 'exact' }).eq('following_id', userId).order('created_at', { ascending: false }).range(offset, offset + limit - 1); if (error) throw error; return { success: true, data: data || [], total: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function getFollowing(userId: string, limit = 50, offset = 0) {
  try { const supabase = await createClient(); const { data, error, count } = await supabase.from('follows').select('*, following:profiles!following_id(*)', { count: 'exact' }).eq('follower_id', userId).order('created_at', { ascending: false }).range(offset, offset + limit - 1); if (error) throw error; return { success: true, data: data || [], total: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function followUser(followerId: string, followingId: string) {
  try { const supabase = await createClient(); if (followerId === followingId) throw new Error('Cannot follow yourself'); const { data: existing } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single(); if (existing) return { success: true, data: existing, alreadyFollowing: true }; const { data, error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unfollowUser(followerId: string, followingId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleFollow(followerId: string, followingId: string) {
  try { const supabase = await createClient(); if (followerId === followingId) throw new Error('Cannot follow yourself'); const { data: existing } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single(); if (existing) { await supabase.from('follows').delete().eq('id', existing.id); return { success: true, following: false }; } const { data, error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId }).select().single(); if (error) throw error; return { success: true, following: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function isFollowing(followerId: string, followingId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single(); return { success: true, following: !!data } } catch (error) { return { success: false, following: false } }
}

export async function getFollowerCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getFollowingCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getMutualFollowers(userId1: string, userId2: string) {
  try { const supabase = await createClient(); const { data: followers1 } = await supabase.from('follows').select('follower_id').eq('following_id', userId1); const { data: followers2 } = await supabase.from('follows').select('follower_id').eq('following_id', userId2); const set1 = new Set(followers1?.map(f => f.follower_id) || []); const mutual = followers2?.filter(f => set1.has(f.follower_id)).map(f => f.follower_id) || []; return { success: true, data: mutual, count: mutual.length } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], count: 0 } }
}

export async function getSuggestedToFollow(userId: string, limit = 10) {
  try { const supabase = await createClient(); const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', userId); const followingIds = following?.map(f => f.following_id) || []; followingIds.push(userId); const { data, error } = await supabase.from('profiles').select('id, full_name, avatar_url').not('id', 'in', `(${followingIds.join(',')})`).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
