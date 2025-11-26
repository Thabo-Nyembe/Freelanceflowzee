/**
 * ₿ CRYPTO PAYMENTS UTILITIES
 * Comprehensive utilities for cryptocurrency payment processing and wallet management
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Crypto-Payments-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'BNB' | 'SOL' | 'ADA' | 'DOGE' | 'XRP' | 'MATIC'
export type PaymentStatus = 'pending' | 'confirming' | 'confirmed' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'expired'
export type TransactionType = 'payment' | 'withdrawal' | 'refund' | 'fee' | 'transfer' | 'stake' | 'unstake'
export type WalletType = 'hot' | 'cold' | 'exchange' | 'hardware' | 'custodial'
export type NetworkType = 'mainnet' | 'testnet'

export interface CryptoWallet {
  id: string
  userId: string
  name: string
  currency: CryptoCurrency
  address: string
  balance: number
  lockedBalance: number
  availableBalance: number
  usdValue: number
  type: WalletType
  isActive: boolean
  isPrimary: boolean
  network: string
  networkType: NetworkType
  derivationPath?: string
  publicKey?: string
  createdAt: Date
  updatedAt: Date
  lastActivity?: Date
  transactionCount: number
  tags: string[]
}

export interface CryptoTransaction {
  id: string
  userId: string
  walletId: string
  type: TransactionType
  amount: number
  currency: CryptoCurrency
  usdAmount: number
  fee: number
  feeUsd: number
  netAmount: number
  status: PaymentStatus
  fromAddress?: string
  toAddress: string
  txHash?: string
  blockNumber?: number
  confirmations: number
  requiredConfirmations: number
  network: string
  gasPrice?: number
  gasUsed?: number
  nonce?: number
  description: string
  memo?: string
  metadata: {
    customerEmail?: string
    customerName?: string
    invoiceId?: string
    productId?: string
    orderId?: string
    paymentMethod?: string
  }
  createdAt: Date
  updatedAt: Date
  confirmedAt?: Date
  completedAt?: Date
  expiresAt?: Date
  errorMessage?: string
  retryCount: number
}

export interface CryptoPrice {
  currency: CryptoCurrency
  usd: number
  eur: number
  gbp: number
  change24h: number
  changePercent24h: number
  marketCap: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdated: Date
}

export interface PaymentLink {
  id: string
  userId: string
  name: string
  description: string
  amount: number
  currency: CryptoCurrency
  fixedAmount: boolean
  url: string
  qrCode: string
  expiresAt?: Date
  maxUses?: number
  currentUses: number
  isActive: boolean
  redirectUrl?: string
  createdAt: Date
}

export interface RecurringPayment {
  id: string
  userId: string
  walletId: string
  name: string
  description: string
  amount: number
  currency: CryptoCurrency
  toAddress: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  nextPaymentDate: Date
  lastPaymentDate?: Date
  totalPayments: number
  remainingPayments?: number
  isActive: boolean
  createdAt: Date
}

export interface ExchangeRate {
  from: CryptoCurrency
  to: CryptoCurrency
  rate: number
  inverseRate: number
  lastUpdated: Date
}

export interface TransactionFee {
  currency: CryptoCurrency
  network: string
  slow: {
    fee: number
    usd: number
    time: string
  }
  standard: {
    fee: number
    usd: number
    time: string
  }
  fast: {
    fee: number
    usd: number
    time: string
  }
}

export interface WalletAnalytics {
  walletId: string
  period: 'day' | 'week' | 'month' | 'year'
  totalReceived: number
  totalSent: number
  totalFees: number
  transactionCount: number
  averageTransactionSize: number
  largestTransaction: number
  profitLoss: number
  profitLossPercent: number
}

// ============================================================================
// MOCK DATA - 60 Crypto Transactions
// ============================================================================

const addresses = {
  BTC: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'],
  ETH: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'],
  USDT: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359'],
  USDC: ['0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520', '0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c'],
  BNB: ['bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2', 'bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23'],
  SOL: ['7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', '4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T'],
  ADA: ['addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh0c54m46', 'addr1q9ld26v2lv547upd8kvpcw32m8fc2u8zf', 'lmyqkc'],
  DOGE: ['D7Y55r6Yoc1G8CcWdNMFpRyUeqCdCHSP9h', 'DDWUYQ3dYb1tnKDkd4y6MXZ6xqFvwVvP4P']
}

export const mockCryptoTransactions: CryptoTransaction[] = Array.from({ length: 60 }, (_, i) => {
  const currencies: CryptoCurrency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'ADA', 'DOGE']
  const statuses: PaymentStatus[] = ['pending', 'confirming', 'confirmed', 'completed', 'failed']
  const types: TransactionType[] = ['payment', 'withdrawal', 'refund', 'transfer']

  const currency = currencies[Math.floor(Math.random() * currencies.length)]
  const type = types[Math.floor(Math.random() * types.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]

  const amount = parseFloat((Math.random() * 10 + 0.01).toFixed(8))
  const usdAmount = amount * (Math.random() * 50000 + 100)
  const fee = amount * 0.001 // 0.1% fee
  const feeUsd = usdAmount * 0.001

  const createdDate = new Date()
  createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 720))

  const requiredConfirmations = currency === 'BTC' ? 6 : currency === 'ETH' ? 12 : 1
  const confirmations = status === 'completed' ? requiredConfirmations : Math.floor(Math.random() * requiredConfirmations)

  return {
    id: `CTX-${String(i + 1).padStart(4, '0')}`,
    userId: 'user_demo_123',
    walletId: `WALLET-${currency}`,
    type,
    amount,
    currency,
    usdAmount,
    fee,
    feeUsd,
    netAmount: amount - fee,
    status,
    fromAddress: type === 'payment' ? addresses[currency][0] : undefined,
    toAddress: addresses[currency][Math.floor(Math.random() * 2)],
    txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    blockNumber: Math.floor(Math.random() * 10000000),
    confirmations,
    requiredConfirmations,
    network: currency === 'USDT' || currency === 'USDC' ? 'ERC20' : currency,
    gasPrice: currency === 'ETH' ? Math.floor(Math.random() * 100) + 20 : undefined,
    gasUsed: currency === 'ETH' ? 21000 : undefined,
    nonce: Math.floor(Math.random() * 1000),
    description: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
    metadata: {
      customerEmail: 'customer@example.com',
      invoiceId: `INV-${Math.floor(Math.random() * 10000)}`
    },
    createdAt: createdDate,
    updatedAt: new Date(),
    confirmedAt: status === 'confirmed' || status === 'completed' ? new Date() : undefined,
    completedAt: status === 'completed' ? new Date() : undefined,
    expiresAt: status === 'pending' ? new Date(createdDate.getTime() + 30 * 60 * 1000) : undefined,
    retryCount: status === 'failed' ? Math.floor(Math.random() * 3) : 0
  }
})

// ============================================================================
// MOCK DATA - 10 Crypto Wallets
// ============================================================================

export const mockCryptoWallets: CryptoWallet[] = [
  'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'ADA', 'DOGE', 'XRP', 'MATIC'
].map((currency, i) => {
  const balance = parseFloat((Math.random() * 100 + 1).toFixed(8))
  const lockedBalance = parseFloat((balance * Math.random() * 0.2).toFixed(8))
  const usdValue = balance * (Math.random() * 50000 + 100)

  return {
    id: `WALLET-${currency}`,
    userId: 'user_demo_123',
    name: `${currency} Wallet`,
    currency: currency as CryptoCurrency,
    address: addresses[currency as keyof typeof addresses]?.[0] || `${currency.toLowerCase()}1234567890`,
    balance,
    lockedBalance,
    availableBalance: balance - lockedBalance,
    usdValue,
    type: ['hot', 'cold', 'exchange', 'hardware'][Math.floor(Math.random() * 4)] as WalletType,
    isActive: true,
    isPrimary: i === 0,
    network: currency === 'USDT' || currency === 'USDC' ? 'ERC20' : currency,
    networkType: 'mainnet',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    lastActivity: new Date(),
    transactionCount: Math.floor(Math.random() * 500) + 10,
    tags: ['primary', 'trading', 'savings'].slice(0, Math.floor(Math.random() * 2) + 1)
  }
})

// ============================================================================
// MOCK DATA - Crypto Prices
// ============================================================================

export const mockCryptoPrices: CryptoPrice[] = [
  { currency: 'BTC', usd: 45000, change24h: 1250, changePercent24h: 2.86 },
  { currency: 'ETH', usd: 2800, change24h: -45, changePercent24h: -1.58 },
  { currency: 'USDT', usd: 1.0, change24h: 0, changePercent24h: 0 },
  { currency: 'USDC', usd: 1.0, change24h: 0, changePercent24h: 0 },
  { currency: 'BNB', usd: 320, change24h: 12, changePercent24h: 3.9 },
  { currency: 'SOL', usd: 105, change24h: -3, changePercent24h: -2.78 },
  { currency: 'ADA', usd: 0.58, change24h: 0.02, changePercent24h: 3.57 },
  { currency: 'DOGE', usd: 0.08, change24h: 0.001, changePercent24h: 1.27 }
].map(price => ({
  ...price,
  eur: price.usd * 0.92,
  gbp: price.usd * 0.79,
  marketCap: price.usd * (Math.random() * 1000000000000),
  volume24h: price.usd * (Math.random() * 10000000000),
  high24h: price.usd * 1.05,
  low24h: price.usd * 0.95,
  lastUpdated: new Date()
}))

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCryptoAmount(amount: number, currency: CryptoCurrency): string {
  const decimals = currency === 'BTC' ? 8 : currency === 'ETH' ? 6 : 2
  return `${amount.toFixed(decimals)} ${currency}`
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function shortenAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2) return address
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`
}

export function getConfirmationProgress(confirmations: number, required: number): number {
  return Math.min((confirmations / required) * 100, 100)
}

export function getTransactionsByStatus(transactions: CryptoTransaction[], status: PaymentStatus): CryptoTransaction[] {
  logger.debug('Filtering transactions by status', { status, totalTransactions: transactions.length })
  return transactions.filter(t => t.status === status)
}

export function getTransactionsByCurrency(transactions: CryptoTransaction[], currency: CryptoCurrency): CryptoTransaction[] {
  logger.debug('Filtering transactions by currency', { currency, totalTransactions: transactions.length })
  return transactions.filter(t => t.currency === currency)
}

export function getTransactionsByType(transactions: CryptoTransaction[], type: TransactionType): CryptoTransaction[] {
  logger.debug('Filtering transactions by type', { type, totalTransactions: transactions.length })
  return transactions.filter(t => t.type === type)
}

export function getPendingTransactions(transactions: CryptoTransaction[]): CryptoTransaction[] {
  logger.debug('Getting pending transactions', { totalTransactions: transactions.length })
  return transactions.filter(t => t.status === 'pending' || t.status === 'confirming')
}

export function getCompletedTransactions(transactions: CryptoTransaction[]): CryptoTransaction[] {
  logger.debug('Getting completed transactions', { totalTransactions: transactions.length })
  return transactions.filter(t => t.status === 'completed')
}

export function searchTransactions(transactions: CryptoTransaction[], query: string): CryptoTransaction[] {
  const searchLower = query.toLowerCase()
  logger.debug('Searching transactions', { query, totalTransactions: transactions.length })

  return transactions.filter(t =>
    t.txHash?.toLowerCase().includes(searchLower) ||
    t.toAddress.toLowerCase().includes(searchLower) ||
    t.fromAddress?.toLowerCase().includes(searchLower) ||
    t.description.toLowerCase().includes(searchLower) ||
    t.metadata.invoiceId?.toLowerCase().includes(searchLower)
  )
}

export function sortTransactions(
  transactions: CryptoTransaction[],
  sortBy: 'date' | 'amount' | 'status' | 'confirmations'
): CryptoTransaction[] {
  logger.debug('Sorting transactions', { sortBy, totalTransactions: transactions.length })

  return [...transactions].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'amount':
        return b.usdAmount - a.usdAmount
      case 'status':
        return a.status.localeCompare(b.status)
      case 'confirmations':
        return b.confirmations - a.confirmations
      default:
        return 0
    }
  })
}

export function getWalletsByType(wallets: CryptoWallet[], type: WalletType): CryptoWallet[] {
  logger.debug('Filtering wallets by type', { type, totalWallets: wallets.length })
  return wallets.filter(w => w.type === type)
}

export function getActiveWallets(wallets: CryptoWallet[]): CryptoWallet[] {
  logger.debug('Getting active wallets', { totalWallets: wallets.length })
  return wallets.filter(w => w.isActive)
}

export function getTotalPortfolioValue(wallets: CryptoWallet[]): number {
  logger.debug('Calculating total portfolio value', { totalWallets: wallets.length })
  return wallets.reduce((sum, w) => sum + w.usdValue, 0)
}

export function calculateTransactionStats(transactions: CryptoTransaction[]) {
  logger.debug('Calculating transaction statistics')

  const totalTransactions = transactions.length
  const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'confirming').length
  const completedTransactions = transactions.filter(t => t.status === 'completed').length
  const failedTransactions = transactions.filter(t => t.status === 'failed').length

  const totalVolume = transactions.reduce((sum, t) => sum + t.usdAmount, 0)
  const totalFees = transactions.reduce((sum, t) => sum + t.feeUsd, 0)

  const currencyStats = transactions.reduce((acc, t) => {
    acc[t.currency] = (acc[t.currency] || 0) + 1
    return acc
  }, {} as Record<CryptoCurrency, number>)

  const typeStats = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {} as Record<TransactionType, number>)

  const stats = {
    totalTransactions,
    pendingTransactions,
    completedTransactions,
    failedTransactions,
    successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
    totalVolume,
    totalFees,
    avgTransactionValue: totalTransactions > 0 ? totalVolume / totalTransactions : 0,
    avgFee: totalTransactions > 0 ? totalFees / totalTransactions : 0,
    currencyStats,
    typeStats
  }

  logger.info('Transaction statistics calculated', stats)
  return stats
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirming: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-purple-100 text-purple-800',
    expired: 'bg-orange-100 text-orange-800'
  }
  return colors[status]
}

export function getCurrencyColor(currency: CryptoCurrency): string {
  const colors: Record<CryptoCurrency, string> = {
    BTC: 'bg-orange-100 text-orange-800',
    ETH: 'bg-blue-100 text-blue-800',
    USDT: 'bg-green-100 text-green-800',
    USDC: 'bg-blue-100 text-blue-800',
    BNB: 'bg-yellow-100 text-yellow-800',
    SOL: 'bg-purple-100 text-purple-800',
    ADA: 'bg-blue-100 text-blue-800',
    DOGE: 'bg-yellow-100 text-yellow-800',
    XRP: 'bg-blue-100 text-blue-800',
    MATIC: 'bg-purple-100 text-purple-800'
  }
  return colors[currency]
}

export function getWalletTypeColor(type: WalletType): string {
  const colors = {
    hot: 'bg-red-100 text-red-800',
    cold: 'bg-blue-100 text-blue-800',
    exchange: 'bg-green-100 text-green-800',
    hardware: 'bg-purple-100 text-purple-800',
    custodial: 'bg-orange-100 text-orange-800'
  }
  return colors[type]
}

export function calculateFee(amount: number, currency: CryptoCurrency, speed: 'slow' | 'standard' | 'fast'): {
  fee: number
  usd: number
  time: string
} {
  const feeRates = {
    BTC: { slow: 0.0001, standard: 0.0002, fast: 0.0005 },
    ETH: { slow: 0.001, standard: 0.002, fast: 0.005 },
    default: { slow: 0.0001, standard: 0.0002, fast: 0.0003 }
  }

  const times = {
    slow: '30-60 min',
    standard: '10-20 min',
    fast: '2-5 min'
  }

  const rates = feeRates[currency as keyof typeof feeRates] || feeRates.default
  const fee = amount * rates[speed]
  const price = mockCryptoPrices.find(p => p.currency === currency)?.usd || 1
  const usd = fee * price

  return { fee, usd, time: times[speed] }
}

export function convertCurrency(
  amount: number,
  from: CryptoCurrency,
  to: CryptoCurrency
): number {
  const fromPrice = mockCryptoPrices.find(p => p.currency === from)?.usd || 1
  const toPrice = mockCryptoPrices.find(p => p.currency === to)?.usd || 1

  const usdValue = amount * fromPrice
  return usdValue / toPrice
}

export function getTransactionRisk(transaction: CryptoTransaction): {
  level: 'low' | 'medium' | 'high'
  factors: string[]
} {
  const factors: string[] = []
  let riskScore = 0

  // Check amount
  if (transaction.usdAmount > 10000) {
    riskScore += 2
    factors.push('High value transaction')
  }

  // Check confirmations
  if (transaction.confirmations < transaction.requiredConfirmations / 2) {
    riskScore += 1
    factors.push('Low confirmations')
  }

  // Check retry count
  if (transaction.retryCount > 0) {
    riskScore += 1
    factors.push('Multiple retry attempts')
  }

  // Check expiry
  if (transaction.expiresAt && transaction.expiresAt < new Date()) {
    riskScore += 2
    factors.push('Transaction expired')
  }

  let level: 'low' | 'medium' | 'high'
  if (riskScore >= 4) level = 'high'
  else if (riskScore >= 2) level = 'medium'
  else level = 'low'

  if (factors.length === 0) factors.push('Normal transaction')

  logger.debug('Transaction risk assessed', { transactionId: transaction.id, level, factors })

  return { level, factors }
}

logger.info('Crypto Payments utilities initialized', {
  mockTransactions: mockCryptoTransactions.length,
  mockWallets: mockCryptoWallets.length,
  mockPrices: mockCryptoPrices.length
})
