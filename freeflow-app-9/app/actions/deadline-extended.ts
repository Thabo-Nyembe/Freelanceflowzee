'use server'

/**
 * Extended Deadline Server Actions - Covers all Deadline-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDeadline(deadlineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deadlines').select('*').eq('id', deadlineId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDeadline(deadlineData: { title: string; due_date: string; entity_type: string; entity_id: string; priority?: 'low' | 'medium' | 'high' | 'critical'; reminder_before_hours?: number[]; description?: string; user_id?: string; assignee_ids?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deadlines').insert({ ...deadlineData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDeadline(deadlineId: string, updates: Partial<{ title: string; due_date: string; priority: 'low' | 'medium' | 'high' | 'critical'; reminder_before_hours: number[]; description: string; status: string; assignee_ids: string[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deadlines').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', deadlineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDeadline(deadlineId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('deadlines').delete().eq('id', deadlineId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeDeadline(deadlineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deadlines').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', deadlineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function extendDeadline(deadlineId: string, newDueDate: string, reason?: string) {
  try { const supabase = await createClient(); const { data: deadline } = await supabase.from('deadlines').select('due_date, extension_count').eq('id', deadlineId).single(); const { data, error } = await supabase.from('deadlines').update({ due_date: newDueDate, extension_count: (deadline?.extension_count || 0) + 1, last_extension_reason: reason, updated_at: new Date().toISOString() }).eq('id', deadlineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEntityDeadlines(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deadlines').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserDeadlines(userId: string, options?: { status?: string; priority?: string; includeCompleted?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('deadlines').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (!options?.includeCompleted) query = query.neq('status', 'completed'); const { data, error } = await query.order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUpcomingDeadlines(userId?: string, days = 7) {
  try { const supabase = await createClient(); const now = new Date(); const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); let query = supabase.from('deadlines').select('*').neq('status', 'completed').gte('due_date', now.toISOString()).lte('due_date', endDate.toISOString()); if (userId) query = query.eq('user_id', userId); const { data, error } = await query.order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOverdueDeadlines(userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('deadlines').select('*').neq('status', 'completed').lt('due_date', new Date().toISOString()); if (userId) query = query.eq('user_id', userId); const { data, error } = await query.order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
