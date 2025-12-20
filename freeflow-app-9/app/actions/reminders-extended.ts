'use server'

/**
 * Extended Reminders Server Actions
 * Tables: reminders, reminder_recipients, reminder_schedules, reminder_templates, reminder_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getReminder(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').select('*, reminder_recipients(*), reminder_schedules(*), users(*)').eq('id', reminderId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReminder(reminderData: { title: string; description?: string; user_id: string; entity_type?: string; entity_id?: string; remind_at: string; repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'; priority?: 'low' | 'medium' | 'high'; channels?: string[]; recipients?: string[] }) {
  try { const supabase = await createClient(); const { recipients, ...reminderInfo } = reminderData; const { data: reminder, error: reminderError } = await supabase.from('reminders').insert({ ...reminderInfo, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (reminderError) throw reminderError; if (recipients && recipients.length > 0) { const recipientsData = recipients.map(userId => ({ reminder_id: reminder.id, user_id: userId, status: 'pending', created_at: new Date().toISOString() })); await supabase.from('reminder_recipients').insert(recipientsData) } return { success: true, data: reminder } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReminder(reminderId: string, updates: Partial<{ title: string; description: string; remind_at: string; repeat: string; priority: string; status: string; channels: string[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReminder(reminderId: string) {
  try { const supabase = await createClient(); await supabase.from('reminder_recipients').delete().eq('reminder_id', reminderId); await supabase.from('reminder_schedules').delete().eq('reminder_id', reminderId); const { error } = await supabase.from('reminders').delete().eq('id', reminderId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function snoozeReminder(reminderId: string, snoozeUntil: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').update({ status: 'snoozed', snoozed_until: snoozeUntil, updated_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; await supabase.from('reminder_history').insert({ reminder_id: reminderId, action: 'snoozed', details: { snoozed_until: snoozeUntil }, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissReminder(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').update({ status: 'dismissed', dismissed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; await supabase.from('reminder_history').insert({ reminder_id: reminderId, action: 'dismissed', created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeReminder(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; await supabase.from('reminder_history').insert({ reminder_id: reminderId, action: 'completed', created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReminders(options?: { user_id?: string; entity_type?: string; entity_id?: string; status?: string; priority?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reminders').select('*, reminder_recipients(count)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.from_date) query = query.gte('remind_at', options.from_date); if (options?.to_date) query = query.lte('remind_at', options.to_date); const { data, error } = await query.order('remind_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUpcomingReminders(userId: string, options?: { hours?: number; limit?: number }) {
  try { const supabase = await createClient(); const now = new Date(); const futureDate = new Date(now.getTime() + (options?.hours || 24) * 60 * 60 * 1000); const { data, error } = await supabase.from('reminders').select('*, reminder_recipients(*)').eq('user_id', userId).eq('status', 'pending').gte('remind_at', now.toISOString()).lte('remind_at', futureDate.toISOString()).order('remind_at', { ascending: true }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOverdueReminders(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const now = new Date(); const { data, error } = await supabase.from('reminders').select('*, reminder_recipients(*)').eq('user_id', userId).eq('status', 'pending').lt('remind_at', now.toISOString()).order('remind_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReminderRecipients(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminder_recipients').select('*, users(*)').eq('reminder_id', reminderId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReminderRecipient(reminderId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminder_recipients').insert({ reminder_id: reminderId, user_id: userId, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReminderTemplates(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('reminder_templates').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFromTemplate(templateId: string, userId: string, remindAt: string, entityType?: string, entityId?: string) {
  try { const supabase = await createClient(); const { data: template, error: templateError } = await supabase.from('reminder_templates').select('*').eq('id', templateId).single(); if (templateError) throw templateError; const { data: reminder, error: reminderError } = await supabase.from('reminders').insert({ title: template.title, description: template.description, user_id: userId, entity_type: entityType, entity_id: entityId, remind_at: remindAt, repeat: template.default_repeat || 'none', priority: template.default_priority || 'medium', channels: template.default_channels, status: 'pending', template_id: templateId, created_at: new Date().toISOString() }).select().single(); if (reminderError) throw reminderError; return { success: true, data: reminder } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReminderHistory(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminder_history').select('*, users(*)').eq('reminder_id', reminderId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTodayReminders(userId: string) {
  try { const supabase = await createClient(); const today = new Date(); const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(); const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(); const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId).gte('remind_at', startOfDay).lt('remind_at', endOfDay).in('status', ['pending', 'snoozed']).order('remind_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
