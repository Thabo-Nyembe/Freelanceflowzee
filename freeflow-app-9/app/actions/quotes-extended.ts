'use server'

/**
 * Extended Quotes Server Actions
 * Tables: quotes, quote_items, quote_versions, quote_comments, quote_templates, quote_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getQuote(quoteId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotes').select('*, quote_items(*), quote_versions(*), quote_comments(*), clients(*), users(*)').eq('id', quoteId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createQuote(quoteData: { client_id: string; author_id: string; organization_id?: string; title?: string; items: { description: string; quantity: number; unit_price: number; discount?: number; tax_rate?: number }[]; valid_days?: number; terms?: string; notes?: string }) {
  try { const supabase = await createClient(); const { items, ...quoteInfo } = quoteData; const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price * (1 - (item.discount || 0) / 100), 0); const tax = items.reduce((sum, item) => { const itemSubtotal = item.quantity * item.unit_price * (1 - (item.discount || 0) / 100); return sum + itemSubtotal * ((item.tax_rate || 0) / 100) }, 0); const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + (quoteData.valid_days || 30)); const { data: quote, error: quoteError } = await supabase.from('quotes').insert({ ...quoteInfo, quote_number: `Q-${Date.now()}`, subtotal, tax, total: subtotal + tax, valid_until: validUntil.toISOString(), status: 'draft', version: 1, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (quoteError) throw quoteError; const itemsData = items.map((item, idx) => ({ quote_id: quote.id, ...item, amount: item.quantity * item.unit_price * (1 - (item.discount || 0) / 100), order: idx, created_at: new Date().toISOString() })); await supabase.from('quote_items').insert(itemsData); await supabase.from('quote_versions').insert({ quote_id: quote.id, version: 1, content: quoteData, created_by: quoteData.author_id, created_at: new Date().toISOString() }); return { success: true, data: quote } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateQuote(quoteId: string, updates: Partial<{ title: string; valid_until: string; terms: string; notes: string; status: string; discount: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', quoteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteQuote(quoteId: string) {
  try { const supabase = await createClient(); await supabase.from('quote_items').delete().eq('quote_id', quoteId); await supabase.from('quote_versions').delete().eq('quote_id', quoteId); await supabase.from('quote_comments').delete().eq('quote_id', quoteId); const { error } = await supabase.from('quotes').delete().eq('id', quoteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQuotes(options?: { author_id?: string; client_id?: string; organization_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('quotes').select('*, clients(*), quote_items(count)'); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.or(`quote_number.ilike.%${options.search}%,title.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(quoteId: string, itemData: { description: string; quantity: number; unit_price: number; discount?: number; tax_rate?: number; order?: number }) {
  try { const supabase = await createClient(); const amount = itemData.quantity * itemData.unit_price * (1 - (itemData.discount || 0) / 100); const { data, error } = await supabase.from('quote_items').insert({ quote_id: quoteId, ...itemData, amount, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await recalculateTotals(quoteId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateItem(itemId: string, updates: Partial<{ description: string; quantity: number; unit_price: number; discount: number; tax_rate: number; order: number }>) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('quote_items').select('quote_id, quantity, unit_price, discount').eq('id', itemId).single(); const quantity = updates.quantity ?? item?.quantity ?? 0; const unit_price = updates.unit_price ?? item?.unit_price ?? 0; const discount = updates.discount ?? item?.discount ?? 0; const amount = quantity * unit_price * (1 - discount / 100); const { data, error } = await supabase.from('quote_items').update({ ...updates, amount, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; if (item) await recalculateTotals(item.quote_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('quote_items').select('quote_id').eq('id', itemId).single(); const { error } = await supabase.from('quote_items').delete().eq('id', itemId); if (error) throw error; if (item) await recalculateTotals(item.quote_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateTotals(quoteId: string) {
  const supabase = await createClient()
  const { data: items } = await supabase.from('quote_items').select('amount, quantity, unit_price, discount, tax_rate').eq('quote_id', quoteId)
  const { data: quote } = await supabase.from('quotes').select('discount').eq('id', quoteId).single()
  const subtotal = items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  const tax = items?.reduce((sum, item) => { const itemAmount = item.amount || 0; return sum + itemAmount * ((item.tax_rate || 0) / 100) }, 0) || 0
  const quoteDiscount = subtotal * ((quote?.discount || 0) / 100)
  const total = subtotal - quoteDiscount + tax
  await supabase.from('quotes').update({ subtotal, tax, total, updated_at: new Date().toISOString() }).eq('id', quoteId)
}

export async function sendQuote(quoteId: string, senderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString(), sent_by: senderId, updated_at: new Date().toISOString() }).eq('id', quoteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptQuote(quoteId: string, acceptedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotes').update({ status: 'accepted', accepted_at: new Date().toISOString(), accepted_by: acceptedBy, updated_at: new Date().toISOString() }).eq('id', quoteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function declineQuote(quoteId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotes').update({ status: 'declined', declined_reason: reason, declined_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', quoteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addComment(quoteId: string, commentData: { author_id: string; content: string; is_internal?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quote_comments').insert({ quote_id: quoteId, ...commentData, created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVersion(quoteId: string, userId: string) {
  try { const supabase = await createClient(); const { data: quote } = await supabase.from('quotes').select('*, quote_items(*)').eq('id', quoteId).single(); if (!quote) return { success: false, error: 'Quote not found' }; const newVersion = (quote.version || 1) + 1; await supabase.from('quotes').update({ version: newVersion, updated_at: new Date().toISOString() }).eq('id', quoteId); const { data, error } = await supabase.from('quote_versions').insert({ quote_id: quoteId, version: newVersion, content: quote, created_by: userId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function convertToInvoice(quoteId: string, userId: string) {
  try { const supabase = await createClient(); const { data: quote } = await supabase.from('quotes').select('*, quote_items(*)').eq('id', quoteId).single(); if (!quote) return { success: false, error: 'Quote not found' }; await supabase.from('quotes').update({ status: 'converted', converted_at: new Date().toISOString() }).eq('id', quoteId); return { success: true, quote } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordView(quoteId: string) {
  try { const supabase = await createClient(); await supabase.from('quotes').update({ view_count: supabase.sql`view_count + 1`, last_viewed_at: new Date().toISOString() }).eq('id', quoteId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateQuote(quoteId: string, userId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('quotes').select('*, quote_items(*)').eq('id', quoteId).single(); if (!original) return { success: false, error: 'Quote not found' }; const { id, quote_number, created_at, updated_at, sent_at, accepted_at, quote_items, ...quoteData } = original; const { data: newQuote, error } = await supabase.from('quotes').insert({ ...quoteData, quote_number: `Q-${Date.now()}`, title: `${quoteData.title || 'Quote'} (Copy)`, status: 'draft', version: 1, view_count: 0, author_id: userId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (quote_items && quote_items.length > 0) { const itemsData = quote_items.map((item: any) => ({ quote_id: newQuote.id, description: item.description, quantity: item.quantity, unit_price: item.unit_price, discount: item.discount, tax_rate: item.tax_rate, amount: item.amount, order: item.order, created_at: new Date().toISOString() })); await supabase.from('quote_items').insert(itemsData) } return { success: true, data: newQuote } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
