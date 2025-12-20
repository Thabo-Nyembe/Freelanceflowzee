'use server'

/**
 * Extended Payments Server Actions - Covers all Payment-related tables
 * Tables: payments, payment_methods, payment_configs, payment_links, payment_reminders, payment_analytics_snapshots
 */

import { createClient } from '@/lib/supabase/server'

export async function getPayment(paymentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payments').select('*').eq('id', paymentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPayment(paymentData: { user_id: string; amount: number; currency: string; payment_method_id?: string; description?: string; invoice_id?: string; status?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payments').insert({ ...paymentData, status: paymentData.status || 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePayment(paymentId: string, updates: Partial<{ status: string; processor_id: string; processor_response: Record<string, any>; completed_at: string; error_message: string }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.status === 'completed' && !updates.completed_at) updateData.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('payments').update(updateData).eq('id', paymentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPayments(userId: string, options?: { status?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('payments').select('*', { count: 'exact' }).eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data, count, error } = await query.order('created_at', { ascending: false }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1); if (error) throw error; return { success: true, data: data || [], total: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function getPaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_methods').select('*').eq('id', methodId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPaymentMethod(methodData: { user_id: string; type: string; provider: string; last_four?: string; brand?: string; exp_month?: number; exp_year?: number; is_default?: boolean; billing_address_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); if (methodData.is_default) { await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', methodData.user_id); } const { data, error } = await supabase.from('payment_methods').insert({ ...methodData, is_default: methodData.is_default ?? false, is_verified: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePaymentMethod(methodId: string, updates: Partial<{ is_default: boolean; is_verified: boolean; exp_month: number; exp_year: number; billing_address_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_methods').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', methodId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePaymentMethod(methodId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('payment_methods').delete().eq('id', methodId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentMethods(userId: string, options?: { type?: string; isVerified?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('payment_methods').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.isVerified !== undefined) query = query.eq('is_verified', options.isVerified); const { data, error } = await query.order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPaymentConfig(configKey: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_configs').select('*').eq('key', configKey).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePaymentConfig(configKey: string, value: any, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_configs').upsert({ key: configKey, value, description, updated_at: new Date().toISOString() }, { onConflict: 'key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentConfigs() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_configs').select('*').order('key', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPaymentLink(linkData: { user_id: string; amount: number; currency: string; description?: string; expires_at?: string; max_uses?: number; success_url?: string; cancel_url?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const code = Math.random().toString(36).substring(2, 12).toUpperCase(); const { data, error } = await supabase.from('payment_links').insert({ ...linkData, code, use_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { ...data, code } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_links').select('*').eq('id', linkId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentLinkByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_links').select('*').eq('code', code).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Payment link not found' }; if (data.expires_at && new Date(data.expires_at) < new Date()) return { success: false, error: 'Payment link has expired' }; if (data.max_uses && data.use_count >= data.max_uses) return { success: false, error: 'Payment link has reached maximum uses' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function usePaymentLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_links').update({ use_count: supabase.rpc('increment_use_count'), last_used_at: new Date().toISOString() }).eq('id', linkId).select().single(); if (error) { const { data: current } = await supabase.from('payment_links').select('use_count').eq('id', linkId).single(); await supabase.from('payment_links').update({ use_count: (current?.use_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', linkId); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivatePaymentLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_links').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentLinks(userId: string, options?: { isActive?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('payment_links').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPaymentReminder(reminderData: { payment_id: string; user_id: string; remind_at: string; message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_reminders').insert({ ...reminderData, is_sent: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markPaymentReminderSent(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_reminders').update({ is_sent: true, sent_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingPaymentReminders() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_reminders').select('*, payments(*)').eq('is_sent', false).lte('remind_at', new Date().toISOString()).order('remind_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordPaymentAnalyticsSnapshot(snapshotData: { period: string; period_start: string; period_end: string; total_volume: number; transaction_count: number; avg_transaction_value: number; success_rate: number; by_method: Record<string, any>; by_currency: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('payment_analytics_snapshots').insert({ ...snapshotData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPaymentAnalyticsSnapshots(options?: { period?: string; startDate?: string; endDate?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('payment_analytics_snapshots').select('*'); if (options?.period) query = query.eq('period', options.period); if (options?.startDate) query = query.gte('period_start', options.startDate); if (options?.endDate) query = query.lte('period_end', options.endDate); const { data, error } = await query.order('period_start', { ascending: false }).limit(options?.limit || 30); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
