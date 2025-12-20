'use server'

/**
 * Extended Announcement Server Actions - Covers all Announcement-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAnnouncements(status?: string, targetAudience?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(limit); if (status) query = query.eq('status', status); if (targetAudience) query = query.eq('target_audience', targetAudience); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').select('*').eq('id', announcementId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAnnouncement(input: { title: string; content: string; author_id: string; announcement_type?: string; priority?: number; target_audience?: string; start_date?: string; end_date?: string; action_url?: string; action_text?: string; is_dismissible?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').insert({ ...input, status: 'draft', view_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAnnouncement(announcementId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', announcementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); await supabase.from('announcement_reads').delete().eq('announcement_id', announcementId); const { error } = await supabase.from('announcements').delete().eq('id', announcementId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').update({ status: 'active', published_at: new Date().toISOString() }).eq('id', announcementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveAnnouncement(announcementId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('announcements').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', announcementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveAnnouncements(targetAudience?: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); let query = supabase.from('announcements').select('*').eq('status', 'active').lte('start_date', now).or(`end_date.is.null,end_date.gte.${now}`).order('priority', { ascending: false }); if (targetAudience) query = query.or(`target_audience.eq.${targetAudience},target_audience.eq.all`); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markAnnouncementRead(announcementId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('announcement_reads').select('id').eq('announcement_id', announcementId).eq('user_id', userId).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('announcement_reads').insert({ announcement_id: announcementId, user_id: userId }).select().single(); if (error) throw error; const { data: announcement } = await supabase.from('announcements').select('view_count').eq('id', announcementId).single(); await supabase.from('announcements').update({ view_count: (announcement?.view_count || 0) + 1 }).eq('id', announcementId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissAnnouncement(announcementId: string, userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('announcement_reads').select('id').eq('announcement_id', announcementId).eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('announcement_reads').update({ dismissed: true, dismissed_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('announcement_reads').insert({ announcement_id: announcementId, user_id: userId, dismissed: true, dismissed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnnouncementStats(announcementId: string) {
  try { const supabase = await createClient(); const { data: announcement } = await supabase.from('announcements').select('view_count').eq('id', announcementId).single(); const { count: readCount } = await supabase.from('announcement_reads').select('*', { count: 'exact', head: true }).eq('announcement_id', announcementId); const { count: dismissedCount } = await supabase.from('announcement_reads').select('*', { count: 'exact', head: true }).eq('announcement_id', announcementId).eq('dismissed', true); return { success: true, data: { view_count: announcement?.view_count || 0, read_count: readCount || 0, dismissed_count: dismissedCount || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
