'use server'

/**
 * Extended Receipts Server Actions
 * Tables: receipts, receipt_items, receipt_templates, receipt_settings, receipt_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getReceipt(receiptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('receipts').select('*, receipt_items(*), transactions(*), users(*), organizations(*)').eq('id', receiptId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReceipt(receiptData: { transaction_id?: string; customer_id?: string; organization_id?: string; receipt_number?: string; subtotal: number; tax?: number; discount?: number; total: number; payment_method?: string; notes?: string; items?: { description: string; quantity: number; unit_price: number; total: number }[] }) {
  try { const supabase = await createClient(); const { items, ...receiptInfo } = receiptData; const receiptNumber = receiptData.receipt_number || `RCP-${Date.now()}`; const { data: receipt, error: receiptError } = await supabase.from('receipts').insert({ ...receiptInfo, receipt_number: receiptNumber, status: 'issued', issued_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (receiptError) throw receiptError; if (items && items.length > 0) { const itemsData = items.map((item, index) => ({ receipt_id: receipt.id, ...item, order: index + 1, created_at: new Date().toISOString() })); await supabase.from('receipt_items').insert(itemsData) } return { success: true, data: receipt } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReceipt(receiptId: string, updates: Partial<{ notes: string; status: string; voided_at: string; void_reason: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('receipts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', receiptId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function voidReceipt(receiptId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('receipts').update({ status: 'voided', voided_at: new Date().toISOString(), void_reason: reason, updated_at: new Date().toISOString() }).eq('id', receiptId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReceipts(options?: { customer_id?: string; organization_id?: string; status?: string; payment_method?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('receipts').select('*, receipt_items(count), users(*)'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); if (options?.payment_method) query = query.eq('payment_method', options.payment_method); if (options?.from_date) query = query.gte('issued_at', options.from_date); if (options?.to_date) query = query.lte('issued_at', options.to_date); if (options?.search) query = query.ilike('receipt_number', `%${options.search}%`); const { data, error } = await query.order('issued_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReceiptItems(receiptId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('receipt_items').select('*').eq('receipt_id', receiptId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCustomerReceipts(customerId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('receipts').select('*, receipt_items(count)').eq('customer_id', customerId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('issued_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReceiptByNumber(receiptNumber: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('receipts').select('*, receipt_items(*), users(*)').eq('receipt_number', receiptNumber).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReceiptStats(options?: { organization_id?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('receipts').select('status, total, payment_method'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.from_date) query = query.gte('issued_at', options.from_date); if (options?.to_date) query = query.lte('issued_at', options.to_date); const { data } = await query; const receipts = data || []; const total = receipts.length; const issued = receipts.filter(r => r.status === 'issued').length; const voided = receipts.filter(r => r.status === 'voided').length; const totalAmount = receipts.filter(r => r.status === 'issued').reduce((sum, r) => sum + (r.total || 0), 0); const byPaymentMethod: { [key: string]: number } = {}; receipts.filter(r => r.status === 'issued').forEach(r => { const method = r.payment_method || 'other'; byPaymentMethod[method] = (byPaymentMethod[method] || 0) + 1 }); return { success: true, data: { total, issued, voided, totalAmount, byPaymentMethod } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function emailReceipt(receiptId: string, email: string) {
  try { const supabase = await createClient(); const { data: receipt, error: receiptError } = await supabase.from('receipts').select('*').eq('id', receiptId).single(); if (receiptError) throw receiptError; await supabase.from('receipt_history').insert({ receipt_id: receiptId, action: 'emailed', details: { email }, created_at: new Date().toISOString() }); return { success: true, message: 'Receipt email queued' } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateReceipt(receiptId: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('receipts').select('*, receipt_items(*)').eq('id', receiptId).single(); if (fetchError) throw fetchError; const { id, receipt_number, created_at, updated_at, issued_at, receipt_items, ...receiptData } = original; const newReceiptNumber = `RCP-${Date.now()}`; const { data: newReceipt, error: createError } = await supabase.from('receipts').insert({ ...receiptData, receipt_number: newReceiptNumber, status: 'draft', issued_at: null, created_at: new Date().toISOString() }).select().single(); if (createError) throw createError; if (receipt_items && receipt_items.length > 0) { const itemsData = receipt_items.map((item: any) => { const { id, receipt_id, created_at, ...itemData } = item; return { ...itemData, receipt_id: newReceipt.id, created_at: new Date().toISOString() } }); await supabase.from('receipt_items').insert(itemsData) } return { success: true, data: newReceipt } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReceiptTemplates(options?: { organization_id?: string; category?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('receipt_templates').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
