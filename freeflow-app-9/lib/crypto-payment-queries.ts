/**
 * Cryptocurrency Payment Query Library
 *
 * Complete query system for crypto payment processing with:
 * - Multi-currency wallet management
 * - Transaction processing and tracking
 * - Payment links and recurring payments
 * - Real-time price quotes and exchange rates
 * - Analytics and reporting
 * - Webhook integration
 *
 * Database: 10 tables (wallets, transactions, prices, payment_links, recurring_payments,
 *           exchange_rates, transaction_fees, wallet_analytics, crypto_addresses, webhooks)
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS (matching database schema)
// ============================================================================

export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'BNB' | 'SOL' | 'ADA' | 'DOGE' | 'XRP' | 'MATIC'
export type PaymentStatus = 'pending' | 'confirming' | 'confirmed' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'expired'
export type TransactionType = 'payment' | 'withdrawal' | 'refund' | 'fee' | 'transfer' | 'stake' | 'unstake'
export type WalletType = 'hot' | 'cold' | 'exchange' | 'hardware' | 'custodial'
export type NetworkType = 'mainnet' | 'testnet'

export interface CryptoWallet {
  id: string
  user_id: string
  name: string
  currency: CryptoCurrency
  address: string
  balance: number
  locked_balance: number
  available_balance: number
  usd_value: number
  type: WalletType
  is_active: boolean
  is_primary: boolean
  network: string
  network_type: NetworkType
  derivation_path?: string
  public_key?: string
  last_activity?: string
  transaction_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CryptoTransaction {
  id: string
  user_id: string
  wallet_id: string
  type: TransactionType
  amount: number
  currency: CryptoCurrency
  usd_amount: number
  fee: number
  fee_usd: number
  net_amount: number
  status: PaymentStatus
  from_address?: string
  to_address: string
  tx_hash?: string
  block_number?: number
  confirmations: number
  required_confirmations: number
  network: string
  gas_price?: number
  gas_used?: number
  nonce?: number
  description?: string
  memo?: string
  metadata: Record<string, any>
  error_message?: string
  retry_count: number
  created_at: string
  updated_at: string
  confirmed_at?: string
  completed_at?: string
  expires_at?: string
}

export interface CryptoPrice {
  id: string
  currency: CryptoCurrency
  usd: number
  eur: number
  gbp: number
  change_24h: number
  change_percent_24h: number
  market_cap: number
  volume_24h: number
  high_24h: number
  low_24h: number
  last_updated: string
  created_at: string
}

export interface PaymentLink {
  id: string
  user_id: string
  title: string
  description?: string
  amount?: number
  currency?: string
  supported_cryptos: CryptoCurrency[]
  max_uses?: number
  uses_count: number
  expires_at?: string
  is_active: boolean
  link_code: string
  success_url?: string
  cancel_url?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RecurringPayment {
  id: string
  user_id: string
  wallet_id: string
  to_address: string
  amount: number
  currency: CryptoCurrency
  frequency: string
  next_payment_at: string
  last_payment_at?: string
  payment_count: number
  max_payments?: number
  is_active: boolean
  description?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// ============================================================================
// WALLET MANAGEMENT QUERIES
// ============================================================================

/**
 * Get user's crypto wallets
 */
export async function getCryptoWallets(filters?: {
  currency?: CryptoCurrency
  type?: WalletType
  is_active?: boolean
}): Promise<CryptoWallet[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('crypto_wallets')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('usd_value', { ascending: false })

  if (filters?.currency) {
    query = query.eq('currency', filters.currency)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get single wallet by ID
 */
export async function getCryptoWallet(walletId: string): Promise<CryptoWallet> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('crypto_wallets')
    .select('*')
    .eq('id', walletId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create new wallet
 */
export async function createCryptoWallet(walletData: {
  name: string
  currency: CryptoCurrency
  address: string
  type?: WalletType
  network: string
  network_type?: NetworkType
  derivation_path?: string
  public_key?: string
  tags?: string[]
}): Promise<CryptoWallet> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('crypto_wallets')
    .insert({
      ...walletData,
      user_id: user.id,
      type: walletData.type || 'hot',
      network_type: walletData.network_type || 'mainnet'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update wallet
 */
export async function updateCryptoWallet(
  walletId: string,
  updates: Partial<Pick<CryptoWallet, 'name' | 'is_active' | 'is_primary' | 'tags'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('crypto_wallets')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', walletId)

  if (error) throw error
}

/**
 * Delete wallet
 */
export async function deleteCryptoWallet(walletId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('crypto_wallets')
    .delete()
    .eq('id', walletId)

  if (error) throw error
}

/**
 * Set wallet as primary
 */
export async function setPrimaryWallet(walletId: string, currency: CryptoCurrency): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Unset all other wallets for this currency
  await supabase
    .from('crypto_wallets')
    .update({ is_primary: false })
    .eq('user_id', user.id)
    .eq('currency', currency)

  // Set this wallet as primary
  const { error } = await supabase
    .from('crypto_wallets')
    .update({ is_primary: true })
    .eq('id', walletId)

  if (error) throw error
}

// ============================================================================
// TRANSACTION QUERIES
// ============================================================================

/**
 * Get transactions
 */
export async function getCryptoTransactions(filters?: {
  wallet_id?: string
  currency?: CryptoCurrency
  type?: TransactionType
  status?: PaymentStatus
  limit?: number
  offset?: number
}): Promise<CryptoTransaction[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('crypto_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.wallet_id) {
    query = query.eq('wallet_id', filters.wallet_id)
  }

  if (filters?.currency) {
    query = query.eq('currency', filters.currency)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get transaction by ID
 */
export async function getCryptoTransaction(transactionId: string): Promise<CryptoTransaction> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('crypto_transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create transaction
 */
export async function createCryptoTransaction(txData: {
  wallet_id: string
  type: TransactionType
  amount: number
  currency: CryptoCurrency
  usd_amount: number
  to_address: string
  from_address?: string
  network: string
  fee?: number
  fee_usd?: number
  required_confirmations?: number
  description?: string
  memo?: string
  metadata?: Record<string, any>
  expires_at?: string
}): Promise<CryptoTransaction> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('crypto_transactions')
    .insert({
      ...txData,
      user_id: user.id,
      fee: txData.fee || 0,
      fee_usd: txData.fee_usd || 0,
      required_confirmations: txData.required_confirmations || 1,
      metadata: txData.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: PaymentStatus,
  updates?: {
    tx_hash?: string
    block_number?: number
    confirmations?: number
    confirmed_at?: string
    completed_at?: string
    error_message?: string
  }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('crypto_transactions')
    .update({
      status,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)

  if (error) throw error
}

/**
 * Cancel transaction
 */
export async function cancelTransaction(transactionId: string): Promise<void> {
  await updateTransactionStatus(transactionId, 'cancelled')
}

/**
 * Refund transaction
 */
export async function refundTransaction(transactionId: string): Promise<void> {
  await updateTransactionStatus(transactionId, 'refunded', {
    completed_at: new Date().toISOString()
  })
}

// ============================================================================
// PRICE QUERIES
// ============================================================================

/**
 * Get current crypto prices
 */
export async function getCryptoPrices(currencies?: CryptoCurrency[]): Promise<CryptoPrice[]> {
  const supabase = createClient()

  let query = supabase
    .from('crypto_prices')
    .select('*')
    .order('currency')

  if (currencies && currencies.length > 0) {
    query = query.in('currency', currencies)
  }

  const { data, error} = await query

  if (error) throw error
  return data || []
}

/**
 * Get price for specific currency
 */
export async function getCryptoPrice(currency: CryptoCurrency): Promise<CryptoPrice | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('crypto_prices')
    .select('*')
    .eq('currency', currency)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Calculate crypto amount from fiat
 */
export async function calculateCryptoAmount(
  fiatAmount: number,
  currency: CryptoCurrency,
  fiatCurrency: 'usd' | 'eur' | 'gbp' = 'usd'
): Promise<{ cryptoAmount: number; exchangeRate: number; price: CryptoPrice | null }> {
  const price = await getCryptoPrice(currency)

  if (!price) {
    return { cryptoAmount: 0, exchangeRate: 0, price: null }
  }

  const exchangeRate = price[fiatCurrency]
  const cryptoAmount = fiatAmount / exchangeRate

  return { cryptoAmount, exchangeRate, price }
}

/**
 * Calculate fiat amount from crypto
 */
export async function calculateFiatAmount(
  cryptoAmount: number,
  currency: CryptoCurrency,
  fiatCurrency: 'usd' | 'eur' | 'gbp' = 'usd'
): Promise<{ fiatAmount: number; exchangeRate: number; price: CryptoPrice | null }> {
  const price = await getCryptoPrice(currency)

  if (!price) {
    return { fiatAmount: 0, exchangeRate: 0, price: null }
  }

  const exchangeRate = price[fiatCurrency]
  const fiatAmount = cryptoAmount * exchangeRate

  return { fiatAmount, exchangeRate, price }
}

// ============================================================================
// PAYMENT LINK QUERIES
// ============================================================================

/**
 * Get payment links
 */
export async function getPaymentLinks(filters?: {
  is_active?: boolean
}): Promise<PaymentLink[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('payment_links')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get payment link by code
 */
export async function getPaymentLinkByCode(linkCode: string): Promise<PaymentLink | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('payment_links')
    .select('*')
    .eq('link_code', linkCode)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Create payment link
 */
export async function createPaymentLink(linkData: {
  title: string
  description?: string
  amount?: number
  currency?: string
  supported_cryptos: CryptoCurrency[]
  max_uses?: number
  expires_at?: string
  success_url?: string
  cancel_url?: string
  metadata?: Record<string, any>
}): Promise<PaymentLink> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Generate unique link code
  const linkCode = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const { data, error } = await supabase
    .from('payment_links')
    .insert({
      ...linkData,
      user_id: user.id,
      link_code: linkCode,
      metadata: linkData.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update payment link
 */
export async function updatePaymentLink(
  linkId: string,
  updates: Partial<Pick<PaymentLink, 'title' | 'description' | 'is_active' | 'max_uses' | 'expires_at'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('payment_links')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', linkId)

  if (error) throw error
}

/**
 * Delete payment link
 */
export async function deletePaymentLink(linkId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('payment_links')
    .delete()
    .eq('id', linkId)

  if (error) throw error
}

/**
 * Increment payment link usage
 */
export async function incrementPaymentLinkUsage(linkId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .rpc('increment_payment_link_usage', { link_id: linkId })

  if (error) throw error
}

// ============================================================================
// RECURRING PAYMENT QUERIES
// ============================================================================

/**
 * Get recurring payments
 */
export async function getRecurringPayments(filters?: {
  is_active?: boolean
  wallet_id?: string
}): Promise<RecurringPayment[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('recurring_payments')
    .select('*')
    .eq('user_id', user.id)
    .order('next_payment_at', { ascending: true })

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  if (filters?.wallet_id) {
    query = query.eq('wallet_id', filters.wallet_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Create recurring payment
 */
export async function createRecurringPayment(paymentData: {
  wallet_id: string
  to_address: string
  amount: number
  currency: CryptoCurrency
  frequency: string
  next_payment_at: string
  max_payments?: number
  description?: string
  metadata?: Record<string, any>
}): Promise<RecurringPayment> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('recurring_payments')
    .insert({
      ...paymentData,
      user_id: user.id,
      metadata: paymentData.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update recurring payment
 */
export async function updateRecurringPayment(
  paymentId: string,
  updates: Partial<Pick<RecurringPayment, 'amount' | 'frequency' | 'is_active' | 'max_payments'>>
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('recurring_payments')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId)

  if (error) throw error
}

/**
 * Cancel recurring payment
 */
export async function cancelRecurringPayment(paymentId: string): Promise<void> {
  await updateRecurringPayment(paymentId, { is_active: false })
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get wallet analytics
 */
export async function getWalletAnalytics(walletId?: string): Promise<{
  totalBalance: number
  totalVolume: number
  transactionCount: number
  successRate: number
  avgTransactionValue: number
  totalFees: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Get wallets
  let walletQuery = supabase
    .from('crypto_wallets')
    .select('usd_value, transaction_count')
    .eq('user_id', user.id)

  if (walletId) {
    walletQuery = walletQuery.eq('id', walletId)
  }

  const { data: wallets } = await walletQuery

  // Get transactions
  let txQuery = supabase
    .from('crypto_transactions')
    .select('usd_amount, fee_usd, status')
    .eq('user_id', user.id)

  if (walletId) {
    txQuery = txQuery.eq('wallet_id', walletId)
  }

  const { data: transactions } = await txQuery

  const totalBalance = wallets?.reduce((sum, w) => sum + Number(w.usd_value), 0) || 0
  const transactionCount = transactions?.length || 0
  const successfulTxs = transactions?.filter(tx => tx.status === 'completed') || []
  const totalVolume = successfulTxs.reduce((sum, tx) => sum + Number(tx.usd_amount), 0)
  const totalFees = transactions?.reduce((sum, tx) => sum + Number(tx.fee_usd), 0) || 0
  const successRate = transactionCount > 0 ? (successfulTxs.length / transactionCount) * 100 : 0
  const avgTransactionValue = successfulTxs.length > 0 ? totalVolume / successfulTxs.length : 0

  return {
    totalBalance,
    totalVolume,
    transactionCount,
    successRate,
    avgTransactionValue,
    totalFees
  }
}

/**
 * Get transaction stats by currency
 */
export async function getTransactionStatsByCurrency(): Promise<Array<{
  currency: CryptoCurrency
  count: number
  total_volume: number
  total_fees: number
  avg_amount: number
}>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .rpc('get_transaction_stats_by_currency', { p_user_id: user.id })

  if (error) throw error
  return data || []
}

/**
 * Get payment timeline (last N days)
 */
export async function getPaymentTimeline(days: number = 30): Promise<Array<{
  date: string
  count: number
  volume: number
  fees: number
}>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .rpc('get_payment_timeline', {
      p_user_id: user.id,
      p_days: days
    })

  if (error) throw error
  return data || []
}

/**
 * Export transactions to CSV
 */
export async function exportTransactionsToCSV(
  transactions: CryptoTransaction[]
): Promise<string> {
  const headers = [
    'ID',
    'Date',
    'Type',
    'Currency',
    'Amount',
    'USD Amount',
    'Fee',
    'Status',
    'To Address',
    'TX Hash',
    'Confirmations'
  ]

  const rows = transactions.map(tx => [
    tx.id,
    new Date(tx.created_at).toLocaleString(),
    tx.type,
    tx.currency,
    tx.amount,
    tx.usd_amount,
    tx.fee,
    tx.status,
    tx.to_address,
    tx.tx_hash || '',
    `${tx.confirmations}/${tx.required_confirmations}`
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}

/**
 * Get pending transactions count
 */
export async function getPendingTransactionsCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { count, error } = await supabase
    .from('crypto_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirming'])

  if (error) throw error
  return count || 0
}

/**
 * Search transactions
 */
export async function searchTransactions(searchTerm: string): Promise<CryptoTransaction[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('crypto_transactions')
    .select('*')
    .eq('user_id', user.id)
    .or(`id.ilike.%${searchTerm}%,to_address.ilike.%${searchTerm}%,tx_hash.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data || []
}
