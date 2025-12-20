'use server'

/**
 * Extended Client Server Actions - Covers all 20 Client-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getClientActivities(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_activities').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientActivity(clientId: string, activityType: string, description: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_activities').insert({ client_id: clientId, activity_type: activityType, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientAnalytics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_analytics').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getClientCategories(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_categories').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientCategory(userId: string, name: string, color?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_categories').insert({ user_id: userId, name, color }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteClientCategory(categoryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('client_categories').delete().eq('id', categoryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientCommunications(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_communications').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientCommunication(clientId: string, type: string, subject: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_communications').insert({ client_id: clientId, type, subject, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientContacts(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_contacts').select('*').eq('client_id', clientId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientContact(clientId: string, input: { name: string; email?: string; phone?: string; role?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_contacts').insert({ client_id: clientId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteClientContact(contactId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('client_contacts').delete().eq('id', contactId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientFeedback(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_feedback').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientFeedback(clientId: string, rating: number, comment?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_feedback').insert({ client_id: clientId, rating, comment }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientFiles(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientFile(clientId: string, input: { name: string; url: string; type: string; size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_files').insert({ client_id: clientId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteClientFile(fileId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('client_files').delete().eq('id', fileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientGalleries(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_galleries').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientGallery(clientId: string, name: string, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_galleries').insert({ client_id: clientId, name, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientInvoices(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getClientMessages(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_messages').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientMessage(clientId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_messages').insert({ client_id: clientId, user_id: userId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientMetadata(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_metadata').select('*').eq('client_id', clientId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateClientMetadata(clientId: string, metadata: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_metadata').upsert({ client_id: clientId, ...metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientNotes(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientNote(clientId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_notes').insert({ client_id: clientId, user_id: userId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteClientNote(noteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('client_notes').delete().eq('id', noteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientNotifications(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_notifications').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientNotification(clientId: string, type: string, message: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_notifications').insert({ client_id: clientId, type, message }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientProjects(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getClientReviews(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_reviews').select('*').eq('client_id', clientId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientReview(clientId: string, rating: number, review: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_reviews').insert({ client_id: clientId, rating, review }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientSatisfactionMetrics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_satisfaction_metrics').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getClientSchedules(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_schedules').select('*').eq('client_id', clientId).order('scheduled_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientSchedule(clientId: string, scheduledAt: string, type: string, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_schedules').insert({ client_id: clientId, scheduled_at: scheduledAt, type, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientSegments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_segments').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientSegment(userId: string, name: string, conditions: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_segments').insert({ user_id: userId, name, conditions }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientShares(clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_shares').select('*').eq('client_id', clientId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientShare(clientId: string, sharedWith: string, permissions: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_shares').insert({ client_id: clientId, shared_with: sharedWith, permissions }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getClientTags(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_tags').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createClientTag(userId: string, name: string, color?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('client_tags').insert({ user_id: userId, name, color }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteClientTag(tagId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('client_tags').delete().eq('id', tagId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
