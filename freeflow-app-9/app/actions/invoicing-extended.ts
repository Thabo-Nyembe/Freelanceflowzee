'use server'

/**
 * Extended Invoicing Server Actions
 * Tables: invoicing_templates, invoicing_settings, invoicing_schedules, invoicing_reminders, invoicing_disputes
 */

import { createClient } from '@/lib/supabase/server'

export async function getInvoicingTemplate(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_templates').select('*').eq('id', templateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInvoicingTemplate(templateData: { name: string; user_id: string; content: any; header?: any; footer?: any; styles?: any; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_templates').insert({ ...templateData, usage_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoicingTemplate(templateId: string, updates: Partial<{ name: string; content: any; header: any; footer: any; styles: any; is_default: boolean; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoicingTemplates(options?: { user_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('invoicing_templates').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('is_default', { ascending: false }).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInvoicingSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoicingSettings(userId: string, settings: Partial<{ currency: string; tax_rate: number; payment_terms: number; default_template_id: string; auto_send: boolean; reminder_enabled: boolean; late_fee_enabled: boolean; late_fee_percentage: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_settings').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInvoicingSchedule(scheduleData: { user_id: string; client_id: string; frequency: string; next_invoice_date: string; template_id?: string; items: any[]; amount: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_schedules').insert({ ...scheduleData, is_active: true, invoice_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoicingSchedule(scheduleId: string, updates: Partial<{ frequency: string; next_invoice_date: string; items: any[]; amount: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_schedules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoicingSchedules(userId: string, options?: { client_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('invoicing_schedules').select('*').eq('user_id', userId); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('next_invoice_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvoicingReminder(reminderData: { invoice_id: string; reminder_type: string; scheduled_date: string; message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_reminders').insert({ ...reminderData, status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoicingReminders(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_reminders').select('*').eq('invoice_id', invoiceId).order('scheduled_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvoicingDispute(disputeData: { invoice_id: string; client_id: string; reason: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_disputes').insert({ ...disputeData, status: 'open', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveInvoicingDispute(disputeId: string, resolution: string, adjustedAmount?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoicing_disputes').update({ status: 'resolved', resolution, adjusted_amount: adjustedAmount, resolved_at: new Date().toISOString() }).eq('id', disputeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoicingDisputes(options?: { invoice_id?: string; client_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('invoicing_disputes').select('*'); if (options?.invoice_id) query = query.eq('invoice_id', options.invoice_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
