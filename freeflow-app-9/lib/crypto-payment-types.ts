/**
 * Cryptocurrency Payment System Types
 * World-class type definitions for crypto payments
 */

export type CryptoCurrency =
  | 'BTC'  // Bitcoin
  | 'ETH'  // Ethereum
  | 'USDT' // Tether
  | 'USDC' // USD Coin
  | 'BNB'  // Binance Coin
  | 'SOL'  // Solana
  | 'MATIC' // Polygon
  | 'AVAX' // Avalanche

export type PaymentNetwork =
  | 'bitcoin'
  | 'ethereum'
  | 'bsc'      // Binance Smart Chain
  | 'polygon'
  | 'solana'
  | 'avalanche'
  | 'tron'

export type PaymentStatus =
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled'

export type WalletProvider =
  | 'metamask'
  | 'coinbase'
  | 'walletconnect'
  | 'phantom'
  | 'trust'
  | 'manual'

export interface CryptoAsset {
  symbol: CryptoCurrency
  name: string
  network: PaymentNetwork
  icon: string
  decimals: number
  contractAddress?: string
  minAmount: number
  maxAmount: number
  confirmations: number
  averageConfirmationTime: number // in minutes
  networkFee: {
    slow: number
    average: number
    fast: number
  }
}

export interface ExchangeRate {
  currency: CryptoCurrency
  usdPrice: number
  change24h: number
  lastUpdated: Date
  source: string
}

export interface CryptoPayment {
  id: string
  userId: string
  amount: number
  currency: string // USD, EUR, etc.
  cryptoAmount: number
  cryptoCurrency: CryptoCurrency
  network: PaymentNetwork
  walletAddress: string
  paymentAddress: string
  status: PaymentStatus
  txHash?: string
  confirmations: number
  requiredConfirmations: number
  exchangeRate: number
  networkFee: number
  totalAmount: number
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  metadata?: {
    invoiceId?: string
    orderId?: string
    description?: string
    customFields?: Record<string, any>
  }
}

export interface CryptoPaymentIntent {
  id: string
  amount: number
  currency: string
  supportedCryptos: CryptoCurrency[]
  expiresIn: number // seconds
  callbackUrl?: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, any>
}

export interface WalletConnection {
  provider: WalletProvider
  address: string
  network: PaymentNetwork
  balance?: number
  connected: boolean
}

export interface PriceQuote {
  cryptoCurrency: CryptoCurrency
  amount: number
  fiatAmount: number
  fiatCurrency: string
  exchangeRate: number
  networkFee: number
  serviceFee: number
  totalCost: number
  validUntil: Date
}

export interface TransactionReceipt {
  txHash: string
  from: string
  to: string
  amount: number
  currency: CryptoCurrency
  network: PaymentNetwork
  confirmations: number
  blockNumber?: number
  timestamp: Date
  gasUsed?: number
  gasPrice?: number
  status: 'success' | 'failed' | 'pending'
}

export interface PaymentWebhook {
  event: 'payment.created' | 'payment.confirming' | 'payment.confirmed' | 'payment.completed' | 'payment.failed' | 'payment.expired'
  paymentId: string
  data: CryptoPayment
  timestamp: Date
  signature: string
}
