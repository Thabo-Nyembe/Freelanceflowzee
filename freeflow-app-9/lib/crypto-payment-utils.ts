/**
 * Cryptocurrency Payment Utilities
 * World-class utility functions for crypto payments
 */

import { CryptoAsset, CryptoCurrency, PaymentNetwork, ExchangeRate } from './crypto-payment-types'

// Supported Cryptocurrency Assets
export const CRYPTO_ASSETS: Record<CryptoCurrency, CryptoAsset> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'bitcoin',
    icon: '₿',
    decimals: 8,
    minAmount: 0.0001,
    maxAmount: 21,
    confirmations: 3,
    averageConfirmationTime: 30,
    networkFee: {
      slow: 0.00001,
      average: 0.00003,
      fast: 0.00005
    }
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ethereum',
    icon: 'Ξ',
    decimals: 18,
    minAmount: 0.001,
    maxAmount: 1000,
    confirmations: 12,
    averageConfirmationTime: 3,
    networkFee: {
      slow: 0.0005,
      average: 0.001,
      fast: 0.002
    }
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    network: 'ethereum',
    icon: '₮',
    decimals: 6,
    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    minAmount: 1,
    maxAmount: 1000000,
    confirmations: 12,
    averageConfirmationTime: 3,
    networkFee: {
      slow: 0.5,
      average: 1,
      fast: 2
    }
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'ethereum',
    icon: '$',
    decimals: 6,
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    minAmount: 1,
    maxAmount: 1000000,
    confirmations: 12,
    averageConfirmationTime: 3,
    networkFee: {
      slow: 0.5,
      average: 1,
      fast: 2
    }
  },
  BNB: {
    symbol: 'BNB',
    name: 'Binance Coin',
    network: 'bsc',
    icon: 'B',
    decimals: 18,
    minAmount: 0.01,
    maxAmount: 10000,
    confirmations: 15,
    averageConfirmationTime: 1,
    networkFee: {
      slow: 0.0001,
      average: 0.0003,
      fast: 0.0005
    }
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    network: 'solana',
    icon: '◎',
    decimals: 9,
    minAmount: 0.01,
    maxAmount: 100000,
    confirmations: 32,
    averageConfirmationTime: 0.5,
    networkFee: {
      slow: 0.00001,
      average: 0.00005,
      fast: 0.0001
    }
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    network: 'polygon',
    icon: 'M',
    decimals: 18,
    minAmount: 1,
    maxAmount: 1000000,
    confirmations: 128,
    averageConfirmationTime: 2,
    networkFee: {
      slow: 0.01,
      average: 0.1,
      fast: 0.5
    }
  },
  AVAX: {
    symbol: 'AVAX',
    name: 'Avalanche',
    network: 'avalanche',
    icon: 'A',
    decimals: 18,
    minAmount: 0.1,
    maxAmount: 100000,
    confirmations: 1,
    averageConfirmationTime: 0.02,
    networkFee: {
      slow: 0.001,
      average: 0.01,
      fast: 0.1
    }
  }
}

// Network Explorers
export const BLOCK_EXPLORERS: Record<PaymentNetwork, string> = {
  bitcoin: 'https://blockchair.com/bitcoin',
  ethereum: 'https://etherscan.io',
  bsc: 'https://bscscan.com',
  polygon: 'https://polygonscan.com',
  solana: 'https://solscan.io',
  avalanche: 'https://snowtrace.io',
  tron: 'https://tronscan.org'
}

/**
 * Format crypto amount with proper decimals
 */
export function formatCryptoAmount(amount: number, currency: CryptoCurrency): string {
  const asset = CRYPTO_ASSETS[currency]
  return amount.toFixed(asset.decimals)
}

/**
 * Validate crypto address format
 */
export function isValidCryptoAddress(address: string, network: PaymentNetwork): boolean {
  const patterns: Record<PaymentNetwork, RegExp> = {
    bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    bsc: /^0x[a-fA-F0-9]{40}$/,
    polygon: /^0x[a-fA-F0-9]{40}$/,
    solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    avalanche: /^0x[a-fA-F0-9]{40}$/,
    tron: /^T[A-Za-z1-9]{33}$/
  }

  return patterns[network]?.test(address) || false
}

/**
 * Calculate crypto amount from fiat
 */
export function calculateCryptoAmount(
  fiatAmount: number,
  exchangeRate: ExchangeRate
): number {
  return fiatAmount / exchangeRate.usdPrice
}

/**
 * Calculate fiat amount from crypto
 */
export function calculateFiatAmount(
  cryptoAmount: number,
  exchangeRate: ExchangeRate
): number {
  return cryptoAmount * exchangeRate.usdPrice
}

/**
 * Get estimated confirmation time
 */
export function getEstimatedConfirmationTime(
  currency: CryptoCurrency,
  speed: 'slow' | 'average' | 'fast' = 'average'
): string {
  const asset = CRYPTO_ASSETS[currency]
  const minutes = asset.averageConfirmationTime

  if (speed === 'slow') {
    return formatTime(minutes * 2)
  } else if (speed === 'fast') {
    return formatTime(minutes * 0.5)
  }

  return formatTime(minutes)
}

/**
 * Format time duration
 */
function formatTime(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} seconds`
  } else if (minutes < 60) {
    return `${Math.round(minutes)} minutes`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
  }
}

/**
 * Get block explorer URL for transaction
 */
export function getTransactionUrl(txHash: string, network: PaymentNetwork): string {
  const baseUrl = BLOCK_EXPLORERS[network]

  switch (network) {
    case 'bitcoin':
      return `${baseUrl}/transaction/${txHash}`
    case 'solana':
      return `${baseUrl}/tx/${txHash}`
    default:
      return `${baseUrl}/tx/${txHash}`
  }
}

/**
 * Get block explorer URL for address
 */
export function getAddressUrl(address: string, network: PaymentNetwork): string {
  const baseUrl = BLOCK_EXPLORERS[network]

  switch (network) {
    case 'solana':
      return `${baseUrl}/account/${address}`
    default:
      return `${baseUrl}/address/${address}`
  }
}

/**
 * Generate QR code data for payment
 */
export function generatePaymentQRData(
  address: string,
  currency: CryptoCurrency,
  amount?: number
): string {
  const asset = CRYPTO_ASSETS[currency]

  // Different URI schemes for different cryptocurrencies
  switch (currency) {
    case 'BTC':
      return amount
        ? `bitcoin:${address}?amount=${amount}`
        : `bitcoin:${address}`

    case 'ETH':
    case 'USDT':
    case 'USDC':
    case 'BNB':
    case 'MATIC':
    case 'AVAX':
      // Ethereum-style address
      return amount
        ? `ethereum:${address}@${asset.network}?value=${amount * Math.pow(10, asset.decimals)}`
        : `ethereum:${address}@${asset.network}`

    case 'SOL':
      return amount
        ? `solana:${address}?amount=${amount}`
        : `solana:${address}`

    default:
      return address
  }
}

/**
 * Calculate network fee in USD
 */
export function calculateNetworkFeeUSD(
  currency: CryptoCurrency,
  speed: 'slow' | 'average' | 'fast',
  exchangeRate: number
): number {
  const asset = CRYPTO_ASSETS[currency]
  const cryptoFee = asset.networkFee[speed]
  return cryptoFee * exchangeRate
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
  amount: number,
  currency: CryptoCurrency
): { valid: boolean; error?: string } {
  const asset = CRYPTO_ASSETS[currency]

  if (amount < asset.minAmount) {
    return {
      valid: false,
      error: `Minimum amount is ${asset.minAmount} ${currency}`
    }
  }

  if (amount > asset.maxAmount) {
    return {
      valid: false,
      error: `Maximum amount is ${asset.maxAmount} ${currency}`
    }
  }

  return { valid: true }
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: string): {
  label: string
  color: string
  icon: string
} {
  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
    pending: {
      label: 'Awaiting Payment',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      icon: '⏳'
    },
    confirming: {
      label: 'Confirming',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: '🔄'
    },
    confirmed: {
      label: 'Confirmed',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: '✓'
    },
    completed: {
      label: 'Completed',
      color: 'text-green-700 bg-green-100 border-green-300',
      icon: '✓✓'
    },
    failed: {
      label: 'Failed',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: '✗'
    },
    expired: {
      label: 'Expired',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: '⌛'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: '⊘'
    }
  }

  return statusMap[status] || statusMap.pending
}

/**
 * Get recommended crypto currencies based on amount
 */
export function getRecommendedCryptos(usdAmount: number): CryptoCurrency[] {
  if (usdAmount < 10) {
    // Small amounts - use low-fee networks
    return ['SOL', 'MATIC', 'AVAX', 'USDC', 'USDT']
  } else if (usdAmount < 100) {
    // Medium amounts - balance of speed and security
    return ['USDT', 'USDC', 'ETH', 'SOL', 'MATIC']
  } else if (usdAmount < 1000) {
    // Larger amounts - more secure options
    return ['BTC', 'ETH', 'USDT', 'USDC', 'BNB']
  } else {
    // Very large amounts - most secure
    return ['BTC', 'ETH', 'USDC', 'USDT']
  }
}

/**
 * Mock function to fetch real-time exchange rates
 * In production, this would call a price feed API
 */
export async function fetchExchangeRates(): Promise<Record<CryptoCurrency, ExchangeRate>> {
  // Mock data - in production, fetch from CoinGecko, CoinMarketCap, or similar
  return {
    BTC: {
      currency: 'BTC',
      usdPrice: 67450.32,
      change24h: 2.34,
      lastUpdated: new Date(),
      source: 'coingecko'
    },
    ETH: {
      currency: 'ETH',
      usdPrice: 3542.67,
      change24h: -1.23,
      lastUpdated: new Date(),
      source: 'coingecko'
    },
    USDT: {
      currency: 'USDT',
      usdPrice: 1.0,
      change24h: 0.01,
      lastUpdated: new Date(),
      source: 'coingecko'
    },
    USDC: {
      currency: 'USDC',
      usdPrice: 1.0,
      change24h: 0.0,
      lastUpdated: new Date(),
      source: 'coingecko'
    },
    BNB: {
      currency: 'BNB',
      usdPrice: 612.45,
      change24h: 3.56,
      lastUpdated: new Date(),
      source: 'coingecko'
    },
    SOL: {
      currency: 'SOL',
      usdPrice: 142.78,
      change24h: 5.67,
      lastUpdated: new Date(),
      source: 'coingecko'
    },
    MATIC: {
      currency: 'MATIC',
      usdPrice: 0.89,
      change24h: -2.34,
      lastUpdated: new Date(),
      source: 'coingecko'
    },
    AVAX: {
      currency: 'AVAX',
      usdPrice: 38.92,
      change24h: 1.89,
      lastUpdated: new Date(),
      source: 'coingecko'
    }
  }
}
