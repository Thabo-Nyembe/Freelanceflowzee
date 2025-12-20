'use server'

/**
 * Extended Investor Server Actions - Covers all Investor-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getInvestors(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investors').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInvestor(investorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investors').select('*').eq('id', investorId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInvestor(userId: string, input: { name: string; email: string; type?: string; company?: string; investment_amount?: number; equity_percentage?: number; investment_date?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investors').insert({ user_id: userId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvestor(investorId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', investorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInvestor(investorId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('investors').delete().eq('id', investorId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvestorUpdates(investorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investor_updates').select('*').eq('investor_id', investorId).order('sent_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvestorUpdate(investorId: string, input: { title: string; content: string; update_type?: string; attachments?: string[]; metrics?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investor_updates').insert({ investor_id: investorId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function sendInvestorUpdate(updateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investor_updates').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', updateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInvestorUpdate(updateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investor_updates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', updateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInvestorUpdate(updateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('investor_updates').delete().eq('id', updateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvestorSummary(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('investors').select('investment_amount, equity_percentage').eq('user_id', userId).eq('status', 'active'); if (error) throw error; const totalInvestment = data?.reduce((sum, i) => sum + (i.investment_amount || 0), 0) || 0; const totalEquity = data?.reduce((sum, i) => sum + (i.equity_percentage || 0), 0) || 0; return { success: true, data: { total_investors: data?.length || 0, total_investment: totalInvestment, total_equity_given: totalEquity } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
