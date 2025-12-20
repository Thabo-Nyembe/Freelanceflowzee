'use server'

/**
 * Extended Invoice Server Actions - Covers all 12 Invoice-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getInvoiceActivityLog(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_activity_log').select('*').eq('invoice_id', invoiceId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logInvoiceActivity(invoiceId: string, action: string, performedBy: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_activity_log').insert({ invoice_id: invoiceId, action, performed_by: performedBy, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoiceAgingBuckets(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_aging_buckets').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateInvoiceAgingBuckets(userId: string, buckets: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_aging_buckets').upsert({ user_id: userId, ...buckets, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoiceAnalyticsDaily(userId: string, startDate?: string, endDate?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('invoice_analytics_daily').select('*').eq('user_id', userId).order('date', { ascending: false })
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    const { data, error } = await query.limit(90)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInvoiceClients(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_clients').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvoiceClient(userId: string, input: { name: string; email: string; address?: string; phone?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_clients').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoiceClient(clientId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', clientId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoiceEvents(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_events').select('*').eq('invoice_id', invoiceId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvoiceEvent(invoiceId: string, eventType: string, metadata?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_events').insert({ invoice_id: invoiceId, event_type: eventType, metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoiceItems(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addInvoiceItem(invoiceId: string, input: { description: string; quantity: number; unit_price: number; tax_rate?: number }) {
  try { const supabase = await createClient(); const total = input.quantity * input.unit_price * (1 + (input.tax_rate || 0) / 100); const { data, error } = await supabase.from('invoice_items').insert({ invoice_id: invoiceId, ...input, total }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoiceItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_items').update(updates).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInvoiceItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('invoice_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoiceLineItems(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_line_items').select('*').eq('invoice_id', invoiceId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addInvoiceLineItem(invoiceId: string, input: { description: string; amount: number; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_line_items').insert({ invoice_id: invoiceId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoicePaymentLinks(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_payment_links').select('*').eq('invoice_id', invoiceId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvoicePaymentLink(invoiceId: string, amount: number, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_payment_links').insert({ invoice_id: invoiceId, amount, expires_at: expiresAt, is_active: true, link_token: crypto.randomUUID() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivatePaymentLink(linkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_payment_links').update({ is_active: false }).eq('id', linkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoicePayments(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_payments').select('*').eq('invoice_id', invoiceId).order('paid_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordInvoicePayment(invoiceId: string, input: { amount: number; payment_method: string; transaction_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_payments').insert({ invoice_id: invoiceId, ...input, paid_at: new Date().toISOString(), status: 'completed' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoiceReminders(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_reminders').select('*').eq('invoice_id', invoiceId).order('scheduled_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function scheduleInvoiceReminder(invoiceId: string, scheduledAt: string, reminderType?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_reminders').insert({ invoice_id: invoiceId, scheduled_at: scheduledAt, reminder_type: reminderType || 'email', status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelInvoiceReminder(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_reminders').update({ status: 'cancelled' }).eq('id', reminderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoiceTemplates(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_templates').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvoiceTemplate(userId: string, input: { name: string; template_data: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_templates').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoiceTemplate(templateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInvoiceTemplate(templateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('invoice_templates').delete().eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecurringInvoices(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_invoices').select('*').eq('user_id', userId).eq('is_active', true).order('next_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRecurringInvoice(userId: string, input: { client_id: string; template_id?: string; frequency: string; start_date: string; amount: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_invoices').insert({ user_id: userId, ...input, next_date: input.start_date, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRecurringInvoice(recurringId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_invoices').update(updates).eq('id', recurringId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelRecurringInvoice(recurringId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recurring_invoices').update({ is_active: false }).eq('id', recurringId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
