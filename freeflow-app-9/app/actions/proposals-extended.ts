'use server'

/**
 * Extended Proposals Server Actions
 * Tables: proposals, proposal_items, proposal_versions, proposal_comments, proposal_signatures, proposal_templates, proposal_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getProposal(proposalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('proposals').select('*, proposal_items(*), proposal_versions(*), proposal_comments(*), proposal_signatures(*), users(*), clients(*)').eq('id', proposalId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProposal(proposalData: { title: string; client_id: string; author_id: string; organization_id?: string; description?: string; items?: { description: string; quantity: number; unit_price: number; discount?: number }[]; valid_until?: string; terms?: string; notes?: string }) {
  try { const supabase = await createClient(); const { items, ...proposalInfo } = proposalData; const subtotal = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100)), 0) || 0; const { data: proposal, error: proposalError } = await supabase.from('proposals').insert({ ...proposalInfo, subtotal, total: subtotal, status: 'draft', version: 1, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (proposalError) throw proposalError; if (items && items.length > 0) { const itemsData = items.map((item, idx) => ({ proposal_id: proposal.id, ...item, order: idx, amount: item.quantity * item.unit_price * (1 - (item.discount || 0) / 100), created_at: new Date().toISOString() })); await supabase.from('proposal_items').insert(itemsData) } await supabase.from('proposal_versions').insert({ proposal_id: proposal.id, version: 1, content: proposalData, created_by: proposalData.author_id, created_at: new Date().toISOString() }); return { success: true, data: proposal } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProposal(proposalId: string, updates: Partial<{ title: string; description: string; valid_until: string; terms: string; notes: string; status: string; discount: number; tax_rate: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('proposals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', proposalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProposal(proposalId: string) {
  try { const supabase = await createClient(); await supabase.from('proposal_items').delete().eq('proposal_id', proposalId); await supabase.from('proposal_versions').delete().eq('proposal_id', proposalId); await supabase.from('proposal_comments').delete().eq('proposal_id', proposalId); await supabase.from('proposal_signatures').delete().eq('proposal_id', proposalId); const { error } = await supabase.from('proposals').delete().eq('id', proposalId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProposals(options?: { author_id?: string; client_id?: string; organization_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('proposals').select('*, clients(*), proposal_items(count)'); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(proposalId: string, itemData: { description: string; quantity: number; unit_price: number; discount?: number; order?: number }) {
  try { const supabase = await createClient(); const amount = itemData.quantity * itemData.unit_price * (1 - (itemData.discount || 0) / 100); const { data, error } = await supabase.from('proposal_items').insert({ proposal_id: proposalId, ...itemData, amount, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await recalculateTotal(proposalId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateItem(itemId: string, updates: Partial<{ description: string; quantity: number; unit_price: number; discount: number; order: number }>) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('proposal_items').select('proposal_id, quantity, unit_price, discount').eq('id', itemId).single(); const quantity = updates.quantity ?? item?.quantity ?? 0; const unit_price = updates.unit_price ?? item?.unit_price ?? 0; const discount = updates.discount ?? item?.discount ?? 0; const amount = quantity * unit_price * (1 - discount / 100); const { data, error } = await supabase.from('proposal_items').update({ ...updates, amount, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; if (item) await recalculateTotal(item.proposal_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('proposal_items').select('proposal_id').eq('id', itemId).single(); const { error } = await supabase.from('proposal_items').delete().eq('id', itemId); if (error) throw error; if (item) await recalculateTotal(item.proposal_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function recalculateTotal(proposalId: string) {
  const supabase = await createClient()
  const { data: items } = await supabase.from('proposal_items').select('amount').eq('proposal_id', proposalId)
  const { data: proposal } = await supabase.from('proposals').select('discount, tax_rate').eq('id', proposalId).single()
  const subtotal = items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  const discount = subtotal * ((proposal?.discount || 0) / 100)
  const taxable = subtotal - discount
  const tax = taxable * ((proposal?.tax_rate || 0) / 100)
  const total = taxable + tax
  await supabase.from('proposals').update({ subtotal, total, updated_at: new Date().toISOString() }).eq('id', proposalId)
}

export async function sendProposal(proposalId: string, senderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('proposals').update({ status: 'sent', sent_at: new Date().toISOString(), sent_by: senderId, updated_at: new Date().toISOString() }).eq('id', proposalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptProposal(proposalId: string, signatureData: { signer_name: string; signer_email: string; signer_ip?: string; signature_data?: string }) {
  try { const supabase = await createClient(); await supabase.from('proposal_signatures').insert({ proposal_id: proposalId, ...signatureData, signed_at: new Date().toISOString() }); const { data, error } = await supabase.from('proposals').update({ status: 'accepted', accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', proposalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function declineProposal(proposalId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('proposals').update({ status: 'declined', declined_reason: reason, declined_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', proposalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addComment(proposalId: string, commentData: { author_id: string; content: string; is_internal?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('proposal_comments').insert({ proposal_id: proposalId, ...commentData, created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVersion(proposalId: string, userId: string) {
  try { const supabase = await createClient(); const { data: proposal } = await supabase.from('proposals').select('*, proposal_items(*)').eq('id', proposalId).single(); if (!proposal) return { success: false, error: 'Proposal not found' }; const newVersion = (proposal.version || 1) + 1; await supabase.from('proposals').update({ version: newVersion, updated_at: new Date().toISOString() }).eq('id', proposalId); const { data, error } = await supabase.from('proposal_versions').insert({ proposal_id: proposalId, version: newVersion, content: proposal, created_by: userId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordView(proposalId: string, viewerData?: { viewer_ip?: string; viewer_agent?: string }) {
  try { const supabase = await createClient(); await supabase.from('proposals').update({ view_count: supabase.sql`view_count + 1`, last_viewed_at: new Date().toISOString() }).eq('id', proposalId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateProposal(proposalId: string, userId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('proposals').select('*, proposal_items(*)').eq('id', proposalId).single(); if (!original) return { success: false, error: 'Proposal not found' }; const { id, created_at, updated_at, sent_at, accepted_at, proposal_items, ...proposalData } = original; const { data: newProposal, error } = await supabase.from('proposals').insert({ ...proposalData, title: `${proposalData.title} (Copy)`, status: 'draft', version: 1, view_count: 0, author_id: userId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (proposal_items && proposal_items.length > 0) { const itemsData = proposal_items.map((item: any) => ({ proposal_id: newProposal.id, description: item.description, quantity: item.quantity, unit_price: item.unit_price, discount: item.discount, amount: item.amount, order: item.order, created_at: new Date().toISOString() })); await supabase.from('proposal_items').insert(itemsData) } return { success: true, data: newProposal } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
