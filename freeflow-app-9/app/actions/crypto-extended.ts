'use server'

/**
 * Extended Crypto Server Actions - Covers all Crypto/Blockchain-related tables
 * Tables: crypto_addresses, crypto_prices, crypto_transactions, crypto_wallets
 */

import { createClient } from '@/lib/supabase/server'

export async function getCryptoWallet(walletId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_wallets').select('*').eq('id', walletId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCryptoWallet(walletData: { user_id: string; name: string; wallet_type: string; network: string; is_default?: boolean }) {
  try { const supabase = await createClient(); if (walletData.is_default) { await supabase.from('crypto_wallets').update({ is_default: false }).eq('user_id', walletData.user_id); } const { data, error } = await supabase.from('crypto_wallets').insert({ ...walletData, is_default: walletData.is_default ?? false, balance: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCryptoWallet(walletId: string, updates: Partial<{ name: string; is_default: boolean; balance: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_wallets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', walletId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCryptoWallet(walletId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('crypto_wallets').delete().eq('id', walletId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCryptoWallets(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_wallets').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCryptoAddress(addressId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_addresses').select('*, crypto_wallets(name, network)').eq('id', addressId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCryptoAddress(addressData: { wallet_id: string; address: string; label?: string; network: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_addresses').insert({ ...addressData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCryptoAddresses(walletId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_addresses').select('*').eq('wallet_id', walletId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCryptoTransaction(txData: { wallet_id: string; tx_hash: string; from_address: string; to_address: string; amount: number; currency: string; network: string; tx_type: 'send' | 'receive'; status?: string; fee?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_transactions').insert({ ...txData, status: txData.status || 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCryptoTransaction(txId: string, updates: Partial<{ status: string; confirmations: number; block_number: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_transactions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', txId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCryptoTransactions(walletId: string, options?: { txType?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('crypto_transactions').select('*').eq('wallet_id', walletId); if (options?.txType) query = query.eq('tx_type', options.txType); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCryptoPrices(options?: { currencies?: string[]; networks?: string[] }) {
  try { const supabase = await createClient(); let query = supabase.from('crypto_prices').select('*'); if (options?.currencies?.length) query = query.in('currency', options.currencies); if (options?.networks?.length) query = query.in('network', options.networks); const { data, error } = await query.order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateCryptoPrice(currency: string, network: string, priceData: { price_usd: number; price_change_24h?: number; market_cap?: number; volume_24h?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('crypto_prices').upsert({ currency, network, ...priceData, updated_at: new Date().toISOString() }, { onConflict: 'currency,network' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCryptoWalletBalance(walletId: string) {
  try { const supabase = await createClient(); const { data: wallet } = await supabase.from('crypto_wallets').select('balance, network').eq('id', walletId).single(); const { data: price } = await supabase.from('crypto_prices').select('price_usd').eq('network', wallet?.network).single(); const balanceUsd = (wallet?.balance || 0) * (price?.price_usd || 0); return { success: true, data: { balance: wallet?.balance || 0, balanceUsd } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
