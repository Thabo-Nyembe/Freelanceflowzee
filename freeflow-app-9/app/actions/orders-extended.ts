'use server'

/**
 * Extended Orders Server Actions
 * Tables: orders, order_items, order_status_history, order_payments, order_shipments, order_notes, order_discounts
 */

import { createClient } from '@/lib/supabase/server'

export async function getOrder(orderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('orders').select('*, order_items(*, products(*)), order_status_history(*), order_payments(*), order_shipments(*)').eq('id', orderId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOrder(orderData: { customer_id: string; organization_id?: string; billing_address?: any; shipping_address?: any; currency?: string; notes?: string }) {
  try { const supabase = await createClient(); const orderNumber = `ORD-${Date.now()}`; const { data, error } = await supabase.from('orders').insert({ ...orderData, order_number: orderNumber, status: 'pending', subtotal: 0, tax: 0, shipping: 0, total: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('order_status_history').insert({ order_id: data.id, status: 'pending', changed_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOrder(orderId: string, updates: Partial<{ billing_address: any; shipping_address: any; notes: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('orders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', orderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).select().single(); if (error) throw error; await supabase.from('order_status_history').insert({ order_id: orderId, status, notes, changed_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelOrder(orderId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('orders').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', orderId).select().single(); if (error) throw error; await supabase.from('order_status_history').insert({ order_id: orderId, status: 'cancelled', notes: reason, changed_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrders(options?: { customer_id?: string; organization_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('orders').select('*, order_items(count)'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(orderId: string, itemData: { product_id: string; quantity: number; unit_price: number; variant_id?: string; notes?: string }) {
  try { const supabase = await createClient(); const total = itemData.quantity * itemData.unit_price; const { data, error } = await supabase.from('order_items').insert({ order_id: orderId, ...itemData, total, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await recalculateOrderTotals(orderId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateItem(itemId: string, updates: Partial<{ quantity: number; unit_price: number; notes: string }>) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('order_items').select('order_id, quantity, unit_price').eq('id', itemId).single(); const quantity = updates.quantity ?? item?.quantity ?? 1; const unitPrice = updates.unit_price ?? item?.unit_price ?? 0; const total = quantity * unitPrice; const { data, error } = await supabase.from('order_items').update({ ...updates, total, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; if (item) await recalculateOrderTotals(item.order_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('order_items').select('order_id').eq('id', itemId).single(); const { error } = await supabase.from('order_items').delete().eq('id', itemId); if (error) throw error; if (item) await recalculateOrderTotals(item.order_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateOrderTotals(orderId: string) {
  const supabase = await createClient()
  const { data: items } = await supabase.from('order_items').select('total').eq('order_id', orderId)
  const { data: discounts } = await supabase.from('order_discounts').select('amount').eq('order_id', orderId)
  const subtotal = items?.reduce((sum, i) => sum + (i.total || 0), 0) || 0
  const discountTotal = discounts?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
  const { data: order } = await supabase.from('orders').select('tax, shipping').eq('id', orderId).single()
  const total = subtotal - discountTotal + (order?.tax || 0) + (order?.shipping || 0)
  await supabase.from('orders').update({ subtotal, discount: discountTotal, total, updated_at: new Date().toISOString() }).eq('id', orderId)
}

export async function addPayment(orderId: string, paymentData: { amount: number; method: string; transaction_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('order_payments').insert({ order_id: orderId, ...paymentData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function confirmPayment(paymentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('order_payments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', paymentId).select().single(); if (error) throw error; const { data: order } = await supabase.from('orders').select('id').eq('id', data.order_id).single(); if (order) { const { data: payments } = await supabase.from('order_payments').select('amount').eq('order_id', order.id).eq('status', 'completed'); const paidAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0; const { data: orderDetails } = await supabase.from('orders').select('total').eq('id', order.id).single(); if (paidAmount >= (orderDetails?.total || 0)) { await supabase.from('orders').update({ payment_status: 'paid', updated_at: new Date().toISOString() }).eq('id', order.id) } } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createShipment(orderId: string, shipmentData: { carrier: string; tracking_number?: string; shipping_method?: string; items?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('order_shipments').insert({ order_id: orderId, ...shipmentData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateShipmentStatus(shipmentId: string, status: string, trackingUrl?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'shipped') updates.shipped_at = new Date().toISOString(); if (status === 'delivered') updates.delivered_at = new Date().toISOString(); if (trackingUrl) updates.tracking_url = trackingUrl; const { data, error } = await supabase.from('order_shipments').update(updates).eq('id', shipmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addNote(orderId: string, noteData: { content: string; is_internal?: boolean; author_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('order_notes').insert({ order_id: orderId, ...noteData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyDiscount(orderId: string, discountData: { code?: string; type: string; amount: number; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('order_discounts').insert({ order_id: orderId, ...discountData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await recalculateOrderTotals(orderId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
