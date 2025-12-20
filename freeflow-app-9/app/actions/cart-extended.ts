'use server'

/**
 * Extended Cart Server Actions - Covers all Cart-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCarts(userId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('carts').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCart(cartId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('carts').select('*').eq('id', cartId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCart(userId: string, sessionId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('carts').insert({ user_id: userId, session_id: sessionId, status: 'active', total_items: 0, subtotal: 0, total: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrCreateCart(userId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('carts').select('*').eq('user_id', userId).eq('status', 'active').single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('carts').insert({ user_id: userId, status: 'active', total_items: 0, subtotal: 0, total: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCart(cartId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('carts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', cartId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function abandonCart(cartId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('carts').update({ status: 'abandoned', abandoned_at: new Date().toISOString() }).eq('id', cartId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearCart(cartId: string) {
  try { const supabase = await createClient(); await supabase.from('cart_items').delete().eq('cart_id', cartId); const { data, error } = await supabase.from('carts').update({ total_items: 0, subtotal: 0, total: 0, discount_amount: 0 }).eq('id', cartId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCart(cartId: string) {
  try { const supabase = await createClient(); await supabase.from('cart_items').delete().eq('cart_id', cartId); const { error } = await supabase.from('carts').delete().eq('id', cartId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCartItems(cartId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cart_items').select('*').eq('cart_id', cartId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCartItem(cartId: string, input: { product_id: string; variant_id?: string; quantity: number; price: number; name: string; image?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('cart_items').select('*').eq('cart_id', cartId).eq('product_id', input.product_id).eq('variant_id', input.variant_id || null).single(); if (existing) { const newQty = existing.quantity + input.quantity; const { data, error } = await supabase.from('cart_items').update({ quantity: newQty, subtotal: newQty * existing.price }).eq('id', existing.id).select().single(); if (error) throw error; await recalculateCartTotals(cartId); return { success: true, data } } const { data, error } = await supabase.from('cart_items').insert({ cart_id: cartId, ...input, subtotal: input.quantity * input.price }).select().single(); if (error) throw error; await recalculateCartTotals(cartId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try { const supabase = await createClient(); const { data: item, error: itemError } = await supabase.from('cart_items').select('cart_id, price').eq('id', itemId).single(); if (itemError) throw itemError; const { data, error } = await supabase.from('cart_items').update({ quantity, subtotal: quantity * item.price }).eq('id', itemId).select().single(); if (error) throw error; await recalculateCartTotals(item.cart_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCartItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item, error: itemError } = await supabase.from('cart_items').select('cart_id').eq('id', itemId).single(); if (itemError) throw itemError; const { error } = await supabase.from('cart_items').delete().eq('id', itemId); if (error) throw error; await recalculateCartTotals(item.cart_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateCartTotals(cartId: string) {
  const supabase = await createClient(); const { data: items } = await supabase.from('cart_items').select('quantity, subtotal').eq('cart_id', cartId); const totalItems = items?.reduce((sum, i) => sum + i.quantity, 0) || 0; const subtotal = items?.reduce((sum, i) => sum + (i.subtotal || 0), 0) || 0; await supabase.from('carts').update({ total_items: totalItems, subtotal, total: subtotal }).eq('id', cartId)
}

export async function applyCartCoupon(cartId: string, couponCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('carts').update({ coupon_code: couponCode }).eq('id', cartId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCartCoupon(cartId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('carts').update({ coupon_code: null, discount_amount: 0 }).eq('id', cartId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
