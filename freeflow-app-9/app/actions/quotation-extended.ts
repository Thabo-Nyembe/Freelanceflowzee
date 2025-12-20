'use server'

/**
 * Extended Quotation Server Actions
 * Tables: quotations, quotation_items, quotation_terms, quotation_revisions
 */

import { createClient } from '@/lib/supabase/server'

export async function getQuotation(quotationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quotationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createQuotation(quotationData: { user_id: string; client_id: string; title: string; valid_until: string; items: Array<{ description: string; quantity: number; unit_price: number }>; notes?: string; terms?: string }) {
  try { const supabase = await createClient(); const subtotal = quotationData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0); const { data, error } = await supabase.from('quotations').insert({ user_id: quotationData.user_id, client_id: quotationData.client_id, title: quotationData.title, valid_until: quotationData.valid_until, subtotal, total: subtotal, notes: quotationData.notes, terms: quotationData.terms, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (data) { await supabase.from('quotation_items').insert(quotationData.items.map(item => ({ quotation_id: data.id, ...item, total: item.quantity * item.unit_price }))); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateQuotation(quotationId: string, updates: Partial<{ title: string; valid_until: string; notes: string; terms: string; status: string; discount: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', quotationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteQuotation(quotationId: string) {
  try { const supabase = await createClient(); await supabase.from('quotation_items').delete().eq('quotation_id', quotationId); const { error } = await supabase.from('quotations').delete().eq('id', quotationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQuotations(options?: { user_id?: string; client_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('quotations').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendQuotation(quotationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotations').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', quotationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptQuotation(quotationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', quotationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectQuotation(quotationId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotations').update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: reason }).eq('id', quotationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function convertToInvoice(quotationId: string) {
  try { const supabase = await createClient(); const { data: quotation } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quotationId).single(); if (!quotation) throw new Error('Quotation not found'); const { data, error } = await supabase.from('quotations').update({ status: 'converted', converted_at: new Date().toISOString() }).eq('id', quotationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
