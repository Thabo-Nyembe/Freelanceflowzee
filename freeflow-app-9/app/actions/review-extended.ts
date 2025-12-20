'use server'

/**
 * Extended Review Server Actions - Covers all 6 Review-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getReviewApprovals(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_approvals').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReviewApproval(sessionId: string, userId: string, input: { stage_id: string; status: string; comments?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_approvals').insert({ session_id: sessionId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReviewApproval(approvalId: string, status: string, comments?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_approvals').update({ status, comments, updated_at: new Date().toISOString() }).eq('id', approvalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviewCollaborators(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_collaborators').select('*').eq('session_id', sessionId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReviewCollaborator(sessionId: string, userId: string, role: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_collaborators').insert({ session_id: sessionId, user_id: userId, role }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReviewCollaboratorRole(collaboratorId: string, role: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_collaborators').update({ role }).eq('id', collaboratorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeReviewCollaborator(collaboratorId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('review_collaborators').delete().eq('id', collaboratorId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviewNotifications(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReviewNotification(userId: string, sessionId: string, input: { type: string; message: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_notifications').insert({ user_id: userId, session_id: sessionId, ...input, is_read: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markReviewNotificationRead(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', notificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllReviewNotificationsRead(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('review_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviewSessions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_sessions').select('*').eq('owner_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReviewSession(userId: string, input: { name: string; description?: string; template_id?: string; asset_id?: string; due_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_sessions').insert({ owner_id: userId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReviewSession(sessionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_sessions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startReviewSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_sessions').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeReviewSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviewStages(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_stages').select('*').eq('template_id', templateId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReviewStage(templateId: string, input: { name: string; description?: string; order_index: number; required_approvals?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_stages').insert({ template_id: templateId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReviewStage(stageId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_stages').update(updates).eq('id', stageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReviewStage(stageId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('review_stages').delete().eq('id', stageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviewTemplates(userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('review_templates').select('*').order('name', { ascending: true }); if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReviewTemplate(userId: string, input: { name: string; description?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_templates').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReviewTemplate(templateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReviewTemplate(templateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('review_templates').delete().eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
