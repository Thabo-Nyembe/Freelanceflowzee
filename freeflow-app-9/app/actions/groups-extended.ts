'use server'

/**
 * Extended Groups Server Actions
 * Tables: groups, group_members, group_invites, group_posts, group_events, group_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getGroup(groupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('groups').select('*, group_members(*), group_settings(*)').eq('id', groupId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGroup(groupData: { name: string; description?: string; created_by: string; type?: string; privacy?: string; category?: string; cover_image?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('groups').insert({ ...groupData, member_count: 1, post_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('group_members').insert({ group_id: data.id, user_id: groupData.created_by, role: 'admin', joined_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGroup(groupId: string, updates: Partial<{ name: string; description: string; privacy: string; category: string; cover_image: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('groups').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', groupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteGroup(groupId: string) {
  try { const supabase = await createClient(); await supabase.from('group_members').delete().eq('group_id', groupId); await supabase.from('group_invites').delete().eq('group_id', groupId); await supabase.from('group_posts').delete().eq('group_id', groupId); await supabase.from('group_events').delete().eq('group_id', groupId); await supabase.from('group_settings').delete().eq('group_id', groupId); const { error } = await supabase.from('groups').delete().eq('id', groupId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroups(options?: { type?: string; privacy?: string; category?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('groups').select('*').eq('is_active', true); if (options?.type) query = query.eq('type', options.type); if (options?.privacy) query = query.eq('privacy', options.privacy); if (options?.category) query = query.eq('category', options.category); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('member_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMember(groupId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('group_members').select('*').eq('group_id', groupId).eq('user_id', userId).single(); if (existing) return { success: true, data: existing, alreadyMember: true }; const { data, error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: userId, role: role || 'member', joined_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: group } = await supabase.from('groups').select('member_count').eq('id', groupId).single(); await supabase.from('groups').update({ member_count: (group?.member_count || 0) + 1 }).eq('id', groupId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeMember(groupId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId); if (error) throw error; const { data: group } = await supabase.from('groups').select('member_count').eq('id', groupId).single(); await supabase.from('groups').update({ member_count: Math.max(0, (group?.member_count || 1) - 1) }).eq('id', groupId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMemberRole(groupId: string, userId: string, role: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('group_members').update({ role, updated_at: new Date().toISOString() }).eq('group_id', groupId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMembers(groupId: string, options?: { role?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('group_members').select('*').eq('group_id', groupId); if (options?.role) query = query.eq('role', options.role); const { data, error } = await query.order('joined_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvite(inviteData: { group_id: string; invited_by: string; invited_user?: string; invite_email?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('group_invites').insert({ ...inviteData, status: 'pending', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function respondToInvite(inviteId: string, accept: boolean) {
  try { const supabase = await createClient(); const { data: invite, error: fetchError } = await supabase.from('group_invites').select('*').eq('id', inviteId).single(); if (fetchError) throw fetchError; const { error } = await supabase.from('group_invites').update({ status: accept ? 'accepted' : 'declined', responded_at: new Date().toISOString() }).eq('id', inviteId); if (error) throw error; if (accept && invite.invited_user) { await addMember(invite.group_id, invite.invited_user) }; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGroupPost(postData: { group_id: string; author_id: string; content: string; type?: string; attachments?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('group_posts').insert({ ...postData, like_count: 0, comment_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: group } = await supabase.from('groups').select('post_count').eq('id', postData.group_id).single(); await supabase.from('groups').update({ post_count: (group?.post_count || 0) + 1 }).eq('id', postData.group_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroupPosts(groupId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('group_posts').select('*').eq('group_id', groupId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGroupEvent(eventData: { group_id: string; created_by: string; title: string; description?: string; start_time: string; end_time?: string; location?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('group_events').insert({ ...eventData, attendee_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroupEvents(groupId: string, options?: { upcoming?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('group_events').select('*').eq('group_id', groupId); if (options?.upcoming) query = query.gte('start_time', new Date().toISOString()); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
