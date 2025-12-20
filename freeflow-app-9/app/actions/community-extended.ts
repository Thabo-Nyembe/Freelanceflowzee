'use server'

/**
 * Extended Community Server Actions - Covers all 12 Community-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCommunityAnalytics(communityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_analytics').select('*').eq('community_id', communityId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCommunityAnalytics(communityId: string, analytics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_analytics').upsert({ community_id: communityId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityComments(postId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCommunityComment(postId: string, userId: string, content: string, parentId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_comments').insert({ post_id: postId, user_id: userId, content, parent_id: parentId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCommunityComment(commentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('community_comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityConnections(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_connections').select('*').or(`user_id.eq.${userId},connected_user_id.eq.${userId}`).eq('status', 'accepted'); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCommunityConnection(userId: string, connectedUserId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_connections').insert({ user_id: userId, connected_user_id: connectedUserId, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCommunityConnection(connectionId: string, status: 'accepted' | 'rejected') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_connections').update({ status }).eq('id', connectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityEventAttendees(eventId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_event_attendees').select('*').eq('event_id', eventId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerForCommunityEvent(eventId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_event_attendees').insert({ event_id: eventId, user_id: userId, status: 'registered' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEventAttendeeStatus(eventId: string, userId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_event_attendees').update({ status }).eq('event_id', eventId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityEvents(communityId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('community_events').select('*').order('start_date', { ascending: true })
    if (communityId) query = query.eq('community_id', communityId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCommunityEvent(input: { title: string; description?: string; start_date: string; end_date?: string; community_id?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_events').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCommunityEvent(eventId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_events').update(updates).eq('id', eventId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityGroupMembers(groupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_group_members').select('*').eq('group_id', groupId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCommunityGroupMember(groupId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_group_members').insert({ group_id: groupId, user_id: userId, role: role || 'member' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCommunityGroupMember(groupId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('community_group_members').delete().eq('group_id', groupId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityGroups(communityId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('community_groups').select('*').order('name', { ascending: true })
    if (communityId) query = query.eq('community_id', communityId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCommunityGroup(input: { name: string; description?: string; community_id?: string; created_by: string; is_private?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_groups').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityLikes(targetType: string, targetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_likes').select('*').eq('target_type', targetType).eq('target_id', targetId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleCommunityLike(userId: string, targetType: string, targetId: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase.from('community_likes').select('id').eq('user_id', userId).eq('target_type', targetType).eq('target_id', targetId).single()
    if (existing) {
      await supabase.from('community_likes').delete().eq('id', existing.id)
      return { success: true, liked: false }
    } else {
      await supabase.from('community_likes').insert({ user_id: userId, target_type: targetType, target_id: targetId })
      return { success: true, liked: true }
    }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityMembers(communityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_members').select('*').eq('community_id', communityId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function joinCommunity(communityId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_members').insert({ community_id: communityId, user_id: userId, role: 'member' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveCommunity(communityId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityPostLikes(postId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_post_likes').select('*').eq('post_id', postId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function togglePostLike(postId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase.from('community_post_likes').select('id').eq('post_id', postId).eq('user_id', userId).single()
    if (existing) {
      await supabase.from('community_post_likes').delete().eq('id', existing.id)
      return { success: true, liked: false }
    } else {
      await supabase.from('community_post_likes').insert({ post_id: postId, user_id: userId })
      return { success: true, liked: true }
    }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityPosts(communityId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false })
    if (communityId) query = query.eq('community_id', communityId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCommunityPost(input: { title?: string; content: string; community_id?: string; author_id: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_posts').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCommunityPost(postId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_posts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', postId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCommunityPost(postId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('community_posts').delete().eq('id', postId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCommunityShares(postId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_shares').select('*').eq('post_id', postId).order('shared_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareCommunityPost(postId: string, userId: string, platform?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('community_shares').insert({ post_id: postId, user_id: userId, platform, shared_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
