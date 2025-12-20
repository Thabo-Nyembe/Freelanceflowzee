'use server'

/**
 * Extended Invoices Server Actions
 * Tables: invoices, invoice_items, invoice_payments, invoice_reminders
 */

import { createClient } from '@/lib/supabase/server'

export async function getInvoice(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoices').select('*, invoice_items(*)').eq('id', invoiceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInvoice(invoiceData: { user_id: string; client_id: string; invoice_number?: string; due_date: string; items: Array<{ description: string; quantity: number; unit_price: number }>; notes?: string; tax_rate?: number }) {
  try { const supabase = await createClient(); const subtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0); const tax = subtotal * (invoiceData.tax_rate || 0) / 100; const { data, error } = await supabase.from('invoices').insert({ user_id: invoiceData.user_id, client_id: invoiceData.client_id, invoice_number: invoiceData.invoice_number, due_date: invoiceData.due_date, subtotal, tax, total: subtotal + tax, notes: invoiceData.notes, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (data) { await supabase.from('invoice_items').insert(invoiceData.items.map(item => ({ invoice_id: data.id, ...item, total: item.quantity * item.unit_price }))); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoice(invoiceId: string, updates: Partial<{ due_date: string; notes: string; status: string; tax_rate: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoices').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInvoice(invoiceId: string) {
  try { const supabase = await createClient(); await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId); const { error } = await supabase.from('invoices').delete().eq('id', invoiceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvoices(options?: { user_id?: string; client_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('invoices').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.status) query = query.eq('status', options.status); if (options?.date_from) query = query.gte('created_at', options.date_from); if (options?.date_to) query = query.lte('created_at', options.date_to); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendInvoice(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoices').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markInvoicePaid(invoiceId: string, paymentData: { amount: number; method: string; reference?: string }) {
  try { const supabase = await createClient(); await supabase.from('invoice_payments').insert({ invoice_id: invoiceId, ...paymentData, paid_at: new Date().toISOString() }); const { data, error } = await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOverdueInvoices(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoices').select('*').eq('user_id', userId).eq('status', 'sent').lt('due_date', new Date().toISOString()).order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
