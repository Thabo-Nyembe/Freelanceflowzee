'use server'

/**
 * Extended Wallet Server Actions
 * Tables: wallets, wallet_transactions, wallet_balances, wallet_limits
 */

import { createClient } from '@/lib/supabase/server'

export async function getWallet(walletId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wallets').select('*').eq('id', walletId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserWallet(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWallet(walletData: { user_id: string; currency?: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wallets').insert({ ...walletData, balance: 0, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWalletBalance(walletId: string, amount: number, transactionType: 'credit' | 'debit') {
  try { const supabase = await createClient(); const wallet = await supabase.from('wallets').select('balance').eq('id', walletId).single(); if (wallet.error) throw wallet.error; const newBalance = transactionType === 'credit' ? wallet.data.balance + amount : wallet.data.balance - amount; if (newBalance < 0) throw new Error('Insufficient balance'); const { data, error } = await supabase.from('wallets').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', walletId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWalletTransactions(walletId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('wallet_transactions').select('*').eq('wallet_id', walletId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWalletTransaction(transactionData: { wallet_id: string; amount: number; type: string; description?: string; reference_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wallet_transactions').insert({ ...transactionData, status: 'completed', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWalletBalance(walletId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wallet_balances').select('*').eq('wallet_id', walletId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWalletLimits(walletId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('wallet_limits').select('*').eq('wallet_id', walletId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
