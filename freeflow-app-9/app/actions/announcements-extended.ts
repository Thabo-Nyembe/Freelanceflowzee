'use server'

/**
 * Extended Announcements Server Actions
 * Tables: announcements, announcement_reads, announcement_targets
 */

import { createClient } from '@/lib/supabase/server'

export async function getAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').select('*').eq('id', announcementId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAnnouncement(announcementData: { user_id: string; title: string; content: string; type?: string; priority?: 'low' | 'normal' | 'high' | 'urgent'; target_audience?: string; starts_at?: string; expires_at?: string; is_pinned?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').insert({ ...announcementData, priority: announcementData.priority || 'normal', status: 'draft', is_pinned: announcementData.is_pinned ?? false, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAnnouncement(announcementId: string, updates: Partial<{ title: string; content: string; type: string; priority: string; target_audience: string; starts_at: string; expires_at: string; is_pinned: boolean; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', announcementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); await supabase.from('announcement_reads').delete().eq('announcement_id', announcementId); const { error } = await supabase.from('announcements').delete().eq('id', announcementId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnnouncements(options?: { user_id?: string; type?: string; status?: string; priority?: string; is_pinned?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('announcements').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned); const { data, error } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', announcementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', announcementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAnnouncementAsRead(announcementId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('announcement_reads').select('id').eq('announcement_id', announcementId).eq('user_id', userId).single(); if (existing) return { success: true }; await supabase.from('announcement_reads').insert({ announcement_id: announcementId, user_id: userId, read_at: new Date().toISOString() }); await supabase.rpc('increment_announcement_view_count', { ann_id: announcementId }).catch(() => {}); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveAnnouncements(options?: { target_audience?: string; limit?: number }) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); let query = supabase.from('announcements').select('*').eq('status', 'published').or(`starts_at.is.null,starts_at.lte.${now}`).or(`expires_at.is.null,expires_at.gte.${now}`); if (options?.target_audience) query = query.or(`target_audience.is.null,target_audience.eq.${options.target_audience}`); const { data, error } = await query.order('is_pinned', { ascending: false }).order('priority', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUnreadAnnouncements(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data: readIds } = await supabase.from('announcement_reads').select('announcement_id').eq('user_id', userId); const readList = (readIds || []).map(r => r.announcement_id); let query = supabase.from('announcements').select('*').eq('status', 'published').or(`starts_at.is.null,starts_at.lte.${now}`).or(`expires_at.is.null,expires_at.gte.${now}`); if (readList.length > 0) query = query.not('id', 'in', `(${readList.join(',')})`); const { data, error } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
