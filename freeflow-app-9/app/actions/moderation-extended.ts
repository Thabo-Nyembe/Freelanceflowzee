'use server'

/**
 * Extended Moderation Server Actions
 * Tables: moderation_queue, moderation_actions, moderation_rules, moderation_appeals, moderation_logs, moderation_reports
 */

import { createClient } from '@/lib/supabase/server'

export async function getQueueItem(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_queue').select('*, moderation_actions(*), moderation_reports(*)').eq('id', itemId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addToQueue(queueData: { content_type: string; content_id: string; reason: string; reported_by?: string; priority?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_queue').insert({ ...queueData, status: 'pending', priority: queueData.priority || 'normal', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQueue(options?: { status?: string; content_type?: string; priority?: string; assigned_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('moderation_queue').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.content_type) query = query.eq('content_type', options.content_type); if (options?.priority) query = query.eq('priority', options.priority); if (options?.assigned_to) query = query.eq('assigned_to', options.assigned_to); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignItem(itemId: string, moderatorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_queue').update({ assigned_to: moderatorId, status: 'in_review', assigned_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function takeAction(itemId: string, actionData: { action_type: string; moderator_id: string; reason?: string; duration?: number; notes?: string }) {
  try { const supabase = await createClient(); const { data: action, error: actionError } = await supabase.from('moderation_actions').insert({ queue_item_id: itemId, ...actionData, created_at: new Date().toISOString() }).select().single(); if (actionError) throw actionError; await supabase.from('moderation_queue').update({ status: 'resolved', resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', itemId); return { success: true, data: action } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActions(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_actions').select('*').eq('queue_item_id', itemId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRule(ruleData: { name: string; description?: string; rule_type: string; conditions: any; actions: any; priority?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_rules').insert({ ...ruleData, priority: ruleData.priority ?? 0, is_active: ruleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRule(ruleId: string, updates: Partial<{ name: string; description: string; conditions: any; actions: any; priority: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_rules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRules(options?: { rule_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('moderation_rules').select('*'); if (options?.rule_type) query = query.eq('rule_type', options.rule_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitAppeal(appealData: { action_id: string; user_id: string; reason: string; evidence?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_appeals').insert({ ...appealData, status: 'pending', submitted_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reviewAppeal(appealId: string, reviewData: { reviewer_id: string; decision: string; reason?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_appeals').update({ ...reviewData, status: reviewData.decision === 'approved' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', appealId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAppeals(options?: { status?: string; user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('moderation_appeals').select('*, moderation_actions(*)'); if (options?.status) query = query.eq('status', options.status); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('submitted_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReport(reportData: { content_type: string; content_id: string; reporter_id: string; report_type: string; description: string; evidence?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_reports').insert({ ...reportData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await addToQueue({ content_type: reportData.content_type, content_id: reportData.content_id, reason: reportData.report_type, reported_by: reportData.reporter_id }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logAction(logData: { moderator_id: string; action_type: string; target_type: string; target_id: string; details?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('moderation_logs').insert({ ...logData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLogs(options?: { moderator_id?: string; action_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('moderation_logs').select('*'); if (options?.moderator_id) query = query.eq('moderator_id', options.moderator_id); if (options?.action_type) query = query.eq('action_type', options.action_type); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
