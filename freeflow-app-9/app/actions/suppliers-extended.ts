'use server'

/**
 * Extended Suppliers Server Actions
 * Tables: suppliers, supplier_contacts, supplier_products, supplier_orders, supplier_ratings, supplier_documents
 */

import { createClient } from '@/lib/supabase/server'

export async function getSupplier(supplierId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suppliers').select('*, supplier_contacts(*), supplier_products(count), supplier_ratings(*)').eq('id', supplierId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSupplier(supplierData: { name: string; code?: string; description?: string; category?: string; address?: any; phone?: string; email?: string; website?: string; tax_id?: string; payment_terms?: string; lead_time_days?: number; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const supplierCode = supplierData.code || `SUP-${Date.now()}`; const { data, error } = await supabase.from('suppliers').insert({ ...supplierData, code: supplierCode, is_active: supplierData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSupplier(supplierId: string, updates: Partial<{ name: string; description: string; category: string; address: any; phone: string; email: string; website: string; tax_id: string; payment_terms: string; lead_time_days: number; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suppliers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', supplierId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSupplier(supplierId: string) {
  try { const supabase = await createClient(); await supabase.from('supplier_contacts').delete().eq('supplier_id', supplierId); await supabase.from('supplier_products').delete().eq('supplier_id', supplierId); await supabase.from('supplier_documents').delete().eq('supplier_id', supplierId); const { error } = await supabase.from('suppliers').delete().eq('id', supplierId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSuppliers(options?: { category?: string; is_active?: boolean; min_rating?: number; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('suppliers').select('*, supplier_contacts(*), supplier_products(count)'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; let suppliers = data || []; if (options?.min_rating) { suppliers = suppliers.filter(s => (s.average_rating || 0) >= options.min_rating!) } return { success: true, data: suppliers } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addContact(supplierId: string, contactData: { name: string; title?: string; email?: string; phone?: string; is_primary?: boolean }) {
  try { const supabase = await createClient(); if (contactData.is_primary) { await supabase.from('supplier_contacts').update({ is_primary: false }).eq('supplier_id', supplierId) } const { data, error } = await supabase.from('supplier_contacts').insert({ supplier_id: supplierId, ...contactData, is_primary: contactData.is_primary ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getContacts(supplierId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('supplier_contacts').select('*').eq('supplier_id', supplierId).order('is_primary', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addProduct(supplierId: string, productData: { product_id: string; sku?: string; price: number; currency?: string; min_order_quantity?: number; lead_time_days?: number; is_preferred?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('supplier_products').insert({ supplier_id: supplierId, ...productData, currency: productData.currency || 'USD', is_preferred: productData.is_preferred ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProducts(supplierId: string, options?: { is_preferred?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('supplier_products').select('*, products(*)').eq('supplier_id', supplierId); if (options?.is_preferred !== undefined) query = query.eq('is_preferred', options.is_preferred); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createOrder(supplierId: string, orderData: { order_number?: string; items: { product_id: string; quantity: number; unit_price: number }[]; expected_delivery?: string; notes?: string; created_by?: string }) {
  try { const supabase = await createClient(); const orderNumber = orderData.order_number || `PO-${Date.now()}`; const total = orderData.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0); const { data, error } = await supabase.from('supplier_orders').insert({ supplier_id: supplierId, order_number: orderNumber, items: orderData.items, total_amount: total, expected_delivery: orderData.expected_delivery, notes: orderData.notes, created_by: orderData.created_by, status: 'pending', ordered_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'received') updates.received_at = new Date().toISOString(); if (notes) updates.notes = notes; const { data, error } = await supabase.from('supplier_orders').update(updates).eq('id', orderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrders(supplierId: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('supplier_orders').select('*').eq('supplier_id', supplierId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('ordered_at', options.from_date); if (options?.to_date) query = query.lte('ordered_at', options.to_date); const { data, error } = await query.order('ordered_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function rateSupplier(supplierId: string, ratingData: { rated_by: string; rating: number; category?: string; review?: string; order_id?: string }) {
  try { const supabase = await createClient(); const { data: ratingRecord, error: ratingError } = await supabase.from('supplier_ratings').insert({ supplier_id: supplierId, ...ratingData, rated_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (ratingError) throw ratingError; const { data: ratings } = await supabase.from('supplier_ratings').select('rating').eq('supplier_id', supplierId); const avgRating = ratings && ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : ratingData.rating; await supabase.from('suppliers').update({ average_rating: avgRating, rating_count: ratings?.length || 1, updated_at: new Date().toISOString() }).eq('id', supplierId); return { success: true, data: ratingRecord } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRatings(supplierId: string, options?: { category?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('supplier_ratings').select('*, users(*)').eq('supplier_id', supplierId); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('rated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDocument(supplierId: string, documentData: { name: string; document_type: string; file_url: string; file_size?: number; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('supplier_documents').insert({ supplier_id: supplierId, ...documentData, uploaded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

