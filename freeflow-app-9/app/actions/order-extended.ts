'use server'

/**
 * Extended Order Server Actions - Covers all Order-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getOrders(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOrder(orderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOrder(userId: string, input: { items: Array<{ product_id: string; quantity: number; unit_price: number }>; shipping_address?: any; billing_address?: any; payment_method?: string; notes?: string }) {
  try { const supabase = await createClient(); const orderNumber = `ORD-${Date.now()}`; const subtotal = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0); const { data: order, error: orderError } = await supabase.from('orders').insert({ user_id: userId, order_number: orderNumber, subtotal, total: subtotal, shipping_address: input.shipping_address, billing_address: input.billing_address, payment_method: input.payment_method, notes: input.notes, status: 'pending' }).select().single(); if (orderError) throw orderError; const orderItems = input.items.map(item => ({ order_id: order.id, product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price, total_price: item.quantity * item.unit_price })); const { error: itemsError } = await supabase.from('order_items').insert(orderItems); if (itemsError) throw itemsError; return { success: true, data: order } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'paid') updates.paid_at = new Date().toISOString(); if (status === 'shipped') updates.shipped_at = new Date().toISOString(); if (status === 'delivered') updates.delivered_at = new Date().toISOString(); if (status === 'cancelled') { updates.cancelled_at = new Date().toISOString(); updates.cancellation_reason = notes; } const { data, error } = await supabase.from('orders').update(updates).eq('id', orderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelOrder(orderId: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('orders').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason }).eq('id', orderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteOrder(orderId: string) {
  try { const supabase = await createClient(); await supabase.from('order_items').delete().eq('order_id', orderId); const { error } = await supabase.from('orders').delete().eq('id', orderId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrderItems(orderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addOrderItem(orderId: string, input: { product_id: string; quantity: number; unit_price: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('order_items').insert({ order_id: orderId, ...input, total_price: input.quantity * input.unit_price }).select().single(); if (error) throw error; await recalculateOrderTotal(orderId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOrderItem(itemId: string, updates: { quantity?: number; unit_price?: number }) {
  try { const supabase = await createClient(); const { data: item, error: itemError } = await supabase.from('order_items').select('order_id, quantity, unit_price').eq('id', itemId).single(); if (itemError) throw itemError; const quantity = updates.quantity || item.quantity; const unitPrice = updates.unit_price || item.unit_price; const { data, error } = await supabase.from('order_items').update({ ...updates, total_price: quantity * unitPrice }).eq('id', itemId).select().single(); if (error) throw error; await recalculateOrderTotal(item.order_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeOrderItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item, error: itemError } = await supabase.from('order_items').select('order_id').eq('id', itemId).single(); if (itemError) throw itemError; const { error } = await supabase.from('order_items').delete().eq('id', itemId); if (error) throw error; await recalculateOrderTotal(item.order_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateOrderTotal(orderId: string) {
  const supabase = await createClient();
  const { data: items } = await supabase.from('order_items').select('total_price').eq('order_id', orderId);
  const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
  await supabase.from('orders').update({ subtotal, total: subtotal, updated_at: new Date().toISOString() }).eq('id', orderId);
}

export async function getOrderSummary(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('orders').select('status, total').eq('user_id', userId); if (error) throw error; const stats = { total_orders: data?.length || 0, total_spent: data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0, pending: data?.filter(o => o.status === 'pending').length || 0, completed: data?.filter(o => o.status === 'delivered').length || 0 }; return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
