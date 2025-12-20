'use server'

/**
 * Extended Escrow Server Actions - Covers all Escrow-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getEscrowTransactions(userId: string, role?: 'buyer' | 'seller') {
  try { const supabase = await createClient(); let query = supabase.from('escrow_transactions').select('*').order('created_at', { ascending: false }); if (role === 'buyer') query = query.eq('buyer_id', userId); else if (role === 'seller') query = query.eq('seller_id', userId); else query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEscrowTransaction(escrowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_transactions').select('*').eq('id', escrowId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEscrowTransaction(buyerId: string, sellerId: string, input: { amount: number; currency: string; description: string; project_id?: string; contract_id?: string; terms?: any }) {
  try { const supabase = await createClient(); const escrowNumber = `ESC-${Date.now()}`; const { data, error } = await supabase.from('escrow_transactions').insert({ escrow_number: escrowNumber, buyer_id: buyerId, seller_id: sellerId, ...input, status: 'pending', funded_amount: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function fundEscrow(escrowId: string, amount: number, paymentMethod: string) {
  try { const supabase = await createClient(); const { data: escrow, error: escrowError } = await supabase.from('escrow_transactions').select('funded_amount, amount').eq('id', escrowId).single(); if (escrowError) throw escrowError; const newFundedAmount = (escrow?.funded_amount || 0) + amount; const status = newFundedAmount >= escrow.amount ? 'funded' : 'partially_funded'; const { data, error } = await supabase.from('escrow_transactions').update({ funded_amount: newFundedAmount, status, funded_at: status === 'funded' ? new Date().toISOString() : null, payment_method: paymentMethod }).eq('id', escrowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function releaseEscrow(escrowId: string, releasedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_transactions').update({ status: 'released', released_at: new Date().toISOString(), released_by: releasedBy }).eq('id', escrowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function disputeEscrow(escrowId: string, disputedBy: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_transactions').update({ status: 'disputed', disputed_at: new Date().toISOString(), disputed_by: disputedBy, dispute_reason: reason }).eq('id', escrowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveDispute(escrowId: string, resolution: string, resolvedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_transactions').update({ status: 'resolved', dispute_resolution: resolution, resolved_at: new Date().toISOString(), resolved_by: resolvedBy }).eq('id', escrowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function refundEscrow(escrowId: string, refundAmount: number, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_transactions').update({ status: 'refunded', refunded_amount: refundAmount, refund_reason: reason, refunded_at: new Date().toISOString() }).eq('id', escrowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEscrowMilestones(escrowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_milestones').select('*').eq('escrow_id', escrowId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEscrowMilestone(escrowId: string, input: { title: string; description?: string; amount: number; due_date?: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_milestones').insert({ escrow_id: escrowId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMilestone(milestoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_milestones').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveMilestone(milestoneId: string, approvedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_milestones').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: approvedBy }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function releaseMilestonePayment(milestoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('escrow_milestones').update({ status: 'released', released_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
