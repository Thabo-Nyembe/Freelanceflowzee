'use server'

/**
 * Extended Purchases Server Actions
 * Tables: purchases, purchase_items, purchase_orders, purchase_invoices, purchase_receipts, purchase_returns, purchase_vendors
 */

import { createClient } from '@/lib/supabase/server'

export async function getPurchase(purchaseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('purchases').select('*, purchase_items(*), purchase_orders(*), purchase_invoices(*), purchase_receipts(*), purchase_vendors(*)').eq('id', purchaseId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPurchase(purchaseData: { vendor_id: string; organization_id?: string; created_by: string; items: { product_id?: string; description: string; quantity: number; unit_price: number }[]; notes?: string; expected_date?: string }) {
  try { const supabase = await createClient(); const { items, ...purchaseInfo } = purchaseData; const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0); const { data: purchase, error: purchaseError } = await supabase.from('purchases').insert({ ...purchaseInfo, subtotal, total: subtotal, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (purchaseError) throw purchaseError; const itemsData = items.map((item, idx) => ({ purchase_id: purchase.id, ...item, amount: item.quantity * item.unit_price, order: idx, created_at: new Date().toISOString() })); await supabase.from('purchase_items').insert(itemsData); return { success: true, data: purchase } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePurchase(purchaseId: string, updates: Partial<{ vendor_id: string; status: string; notes: string; expected_date: string; discount: number; tax_rate: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('purchases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', purchaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePurchase(purchaseId: string) {
  try { const supabase = await createClient(); await supabase.from('purchase_items').delete().eq('purchase_id', purchaseId); await supabase.from('purchase_orders').delete().eq('purchase_id', purchaseId); await supabase.from('purchase_invoices').delete().eq('purchase_id', purchaseId); await supabase.from('purchase_receipts').delete().eq('purchase_id', purchaseId); await supabase.from('purchase_returns').delete().eq('purchase_id', purchaseId); const { error } = await supabase.from('purchases').delete().eq('id', purchaseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPurchases(options?: { vendor_id?: string; organization_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('purchases').select('*, purchase_vendors(*), purchase_items(count)'); if (options?.vendor_id) query = query.eq('vendor_id', options.vendor_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); if (options?.search) query = query.ilike('reference_number', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(purchaseId: string, itemData: { product_id?: string; description: string; quantity: number; unit_price: number; order?: number }) {
  try { const supabase = await createClient(); const amount = itemData.quantity * itemData.unit_price; const { data, error } = await supabase.from('purchase_items').insert({ purchase_id: purchaseId, ...itemData, amount, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await recalculateTotal(purchaseId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateItem(itemId: string, updates: Partial<{ description: string; quantity: number; unit_price: number; order: number }>) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('purchase_items').select('purchase_id, quantity, unit_price').eq('id', itemId).single(); const quantity = updates.quantity ?? item?.quantity ?? 0; const unit_price = updates.unit_price ?? item?.unit_price ?? 0; const amount = quantity * unit_price; const { data, error } = await supabase.from('purchase_items').update({ ...updates, amount, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; if (item) await recalculateTotal(item.purchase_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateTotal(purchaseId: string) {
  const supabase = await createClient()
  const { data: items } = await supabase.from('purchase_items').select('amount').eq('purchase_id', purchaseId)
  const { data: purchase } = await supabase.from('purchases').select('discount, tax_rate').eq('id', purchaseId).single()
  const subtotal = items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  const discount = subtotal * ((purchase?.discount || 0) / 100)
  const taxable = subtotal - discount
  const tax = taxable * ((purchase?.tax_rate || 0) / 100)
  const total = taxable + tax
  await supabase.from('purchases').update({ subtotal, total, updated_at: new Date().toISOString() }).eq('id', purchaseId)
}

export async function createOrder(purchaseId: string, userId: string) {
  try { const supabase = await createClient(); const { data: purchase } = await supabase.from('purchases').select('*').eq('id', purchaseId).single(); if (!purchase) return { success: false, error: 'Purchase not found' }; const orderNumber = `PO-${Date.now()}`; const { data, error } = await supabase.from('purchase_orders').insert({ purchase_id: purchaseId, order_number: orderNumber, vendor_id: purchase.vendor_id, total: purchase.total, status: 'pending', created_by: userId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('purchases').update({ status: 'ordered', order_id: data.id, ordered_at: new Date().toISOString() }).eq('id', purchaseId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function receiveItems(purchaseId: string, receivedData: { received_by: string; items: { item_id: string; quantity_received: number; condition?: string; notes?: string }[]; warehouse_id?: string }) {
  try { const supabase = await createClient(); const allReceived = true; for (const item of receivedData.items) { await supabase.from('purchase_items').update({ quantity_received: item.quantity_received, received_at: new Date().toISOString() }).eq('id', item.item_id) } const { data, error } = await supabase.from('purchase_receipts').insert({ purchase_id: purchaseId, received_by: receivedData.received_by, warehouse_id: receivedData.warehouse_id, items: receivedData.items, received_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: items } = await supabase.from('purchase_items').select('quantity, quantity_received').eq('purchase_id', purchaseId); const fullyReceived = items?.every(i => (i.quantity_received || 0) >= i.quantity); await supabase.from('purchases').update({ status: fullyReceived ? 'received' : 'partially_received', updated_at: new Date().toISOString() }).eq('id', purchaseId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInvoice(purchaseId: string, invoiceData: { invoice_number: string; invoice_date: string; due_date: string; amount: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('purchase_invoices').insert({ purchase_id: purchaseId, ...invoiceData, status: 'unpaid', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function payInvoice(invoiceId: string, paymentData: { amount: number; payment_method: string; payment_reference?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('purchase_invoices').update({ status: 'paid', paid_amount: paymentData.amount, payment_method: paymentData.payment_method, payment_reference: paymentData.payment_reference, paid_at: new Date().toISOString() }).eq('id', invoiceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReturn(purchaseId: string, returnData: { items: { item_id: string; quantity: number; reason: string }[]; created_by: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('purchase_returns').insert({ purchase_id: purchaseId, ...returnData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVendors(options?: { is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('purchase_vendors').select('*, purchases(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVendor(vendorData: { name: string; email?: string; phone?: string; address?: string; tax_id?: string; payment_terms?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('purchase_vendors').insert({ ...vendorData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approvePurchase(purchaseId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('purchases').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', purchaseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
