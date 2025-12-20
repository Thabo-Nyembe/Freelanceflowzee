'use server'

/**
 * Extended Invoice Item Server Actions - Covers all Invoice Item-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getInvoiceItems(invoiceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInvoiceItem(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('invoice_items').select('*').eq('id', itemId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addInvoiceItem(invoiceId: string, item: { description: string; quantity: number; unit_price: number; unit?: string; discount?: number; tax_rate?: number; sort_order?: number }) {
  try { const supabase = await createClient(); const taxAmount = item.tax_rate ? (item.quantity * item.unit_price - (item.discount || 0)) * (item.tax_rate / 100) : 0; const total = (item.quantity * item.unit_price) - (item.discount || 0) + taxAmount; const { data, error } = await supabase.from('invoice_items').insert({ invoice_id: invoiceId, ...item, tax_amount: taxAmount, total }).select().single(); if (error) throw error; await recalculateInvoiceTotal(invoiceId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvoiceItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('invoice_items').select('invoice_id, quantity, unit_price, discount, tax_rate').eq('id', itemId).single(); const quantity = updates.quantity ?? current?.quantity ?? 0; const unitPrice = updates.unit_price ?? current?.unit_price ?? 0; const discount = updates.discount ?? current?.discount ?? 0; const taxRate = updates.tax_rate ?? current?.tax_rate ?? 0; const taxAmount = taxRate ? (quantity * unitPrice - discount) * (taxRate / 100) : 0; const total = (quantity * unitPrice) - discount + taxAmount; const { data, error } = await supabase.from('invoice_items').update({ ...updates, tax_amount: taxAmount, total, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; if (current?.invoice_id) await recalculateInvoiceTotal(current.invoice_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInvoiceItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('invoice_items').select('invoice_id').eq('id', itemId).single(); const { error } = await supabase.from('invoice_items').delete().eq('id', itemId); if (error) throw error; if (item?.invoice_id) await recalculateInvoiceTotal(item.invoice_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderInvoiceItems(itemIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < itemIds.length; i++) { await supabase.from('invoice_items').update({ sort_order: i }).eq('id', itemIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateInvoiceTotal(invoiceId: string) {
  const supabase = await createClient()
  const { data: items } = await supabase.from('invoice_items').select('total').eq('invoice_id', invoiceId)
  const subtotal = items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0
  const { data: invoice } = await supabase.from('invoices').select('discount, tax_rate').eq('id', invoiceId).single()
  const discount = invoice?.discount || 0
  const taxRate = invoice?.tax_rate || 0
  const taxAmount = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + taxAmount
  await supabase.from('invoices').update({ subtotal, tax_amount: taxAmount, total, updated_at: new Date().toISOString() }).eq('id', invoiceId)
}

export async function duplicateInvoiceItem(itemId: string) {
  try { const supabase = await createClient(); const { data: original, error: origError } = await supabase.from('invoice_items').select('*').eq('id', itemId).single(); if (origError) throw origError; const { id, created_at, updated_at, ...itemData } = original; const { data, error } = await supabase.from('invoice_items').insert({ ...itemData, description: `Copy of ${original.description}` }).select().single(); if (error) throw error; await recalculateInvoiceTotal(original.invoice_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLineItems(parentId: string, parentType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('line_items').select('*').eq('parent_id', parentId).eq('parent_type', parentType).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLineItem(parentId: string, parentType: string, item: { name: string; description?: string; quantity: number; unit_price: number; discount?: number; sort_order?: number }) {
  try { const supabase = await createClient(); const total = (item.quantity * item.unit_price) - (item.discount || 0); const { data, error } = await supabase.from('line_items').insert({ parent_id: parentId, parent_type: parentType, ...item, total }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLineItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('line_items').select('quantity, unit_price, discount').eq('id', itemId).single(); const quantity = updates.quantity ?? current?.quantity ?? 0; const unitPrice = updates.unit_price ?? current?.unit_price ?? 0; const discount = updates.discount ?? current?.discount ?? 0; const total = (quantity * unitPrice) - discount; const { data, error } = await supabase.from('line_items').update({ ...updates, total, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLineItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('line_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
