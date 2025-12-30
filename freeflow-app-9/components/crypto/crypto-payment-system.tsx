'use client'

/**
 * World-Class Cryptocurrency Payment System
 * Complete crypto payment UI with wallet connection, currency selection, and transaction tracking
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Check, Copy, ExternalLink, RefreshCw,
  AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  QrCode, Zap, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { cn } from '@/lib/utils'
import {
  CryptoCurrency,
  PaymentNetwork,
  WalletProvider,
  CryptoPayment,
  ExchangeRate,
  WalletConnection
} from '@/lib/crypto-payment-types'
import {
  CRYPTO_ASSETS,
  formatCryptoAmount,
  getEstimatedConfirmationTime,
  getTransactionUrl,
  generatePaymentQRData,
  formatPaymentStatus,
  getRecommendedCryptos
} from '@/lib/crypto-payment-utils'

// ===== WALLET CONNECTION COMPONENT =====

interface WalletConnectorProps {
  onConnect: (connection: WalletConnection) => void
  onDisconnect: () => void
  connection?: WalletConnection
}

export function WalletConnector({ onConnect, onDisconnect, connection }: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showProviders, setShowProviders] = useState(false)

  const walletProviders: Array<{
    id: WalletProvider
    name: string
    icon: string
    description: string
    networks: PaymentNetwork[]
  }> = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect with MetaMask wallet',
      networks: ['ethereum', 'bsc', 'polygon', 'avalanche']
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect with Coinbase Wallet',
      networks: ['ethereum', 'polygon']
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect with any WalletConnect wallet',
      networks: ['ethereum', 'bsc', 'polygon', 'avalanche']
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect with Phantom (Solana)',
      networks: ['solana']
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Connect with Trust Wallet',
      networks: ['ethereum', 'bsc', 'polygon']
    },
    {
      id: 'manual',
      name: 'Manual Payment',
      icon: '📱',
      description: 'Pay manually with QR code',
      networks: ['bitcoin', 'ethereum', 'bsc', 'polygon', 'solana', 'avalanche', 'tron']
    }
  ]

  const handleConnect = async (provider: WalletProvider) => {
    setIsConnecting(true)

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockConnection: WalletConnection = {
        provider,
        address: provider === 'phantom'
          ? '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          : '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        network: provider === 'phantom' ? 'solana' : 'ethereum',
        balance: Math.random() * 10,
        connected: true
      }

      onConnect(mockConnection)
      setShowProviders(false)
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (connection?.connected) {
    return (
      <LiquidGlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-md" />
              <div className="relative w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl">
                {walletProviders.find(p => p.id === connection.provider)?.icon}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">
                  {walletProviders.find(p => p.id === connection.provider)?.name}
                </h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <p className="text-sm text-gray-400 font-mono">
                {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Disconnect
          </Button>
        </div>
      </LiquidGlassCard>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowProviders(!showProviders)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        size="lg"
      >
        <Wallet className="w-5 h-5 mr-2" />
        Connect Wallet
      </Button>

      <AnimatePresence>
        {showProviders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {walletProviders.map((provider) => (
              <motion.div
                key={provider.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LiquidGlassCard
                  className="p-4 cursor-pointer hover:border-purple-500/50 transition-all"
                  onClick={() => handleConnect(provider.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{provider.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{provider.name}</h4>
                      <p className="text-xs text-gray-400">{provider.description}</p>
                    </div>
                    {isConnecting && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ===== CURRENCY SELECTOR COMPONENT =====

interface CurrencySelectorProps {
  selectedCurrency: CryptoCurrency | null
  onSelect: (currency: CryptoCurrency) => void
  amount: number
  exchangeRates: Record<CryptoCurrency, ExchangeRate>
}

export function CurrencySelector({ selectedCurrency, onSelect, amount, exchangeRates }: CurrencySelectorProps) {
  const recommended = getRecommendedCryptos(amount)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Select Cryptocurrency</h3>
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          <Zap className="w-3 h-3 mr-1" />
          Recommended
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(CRYPTO_ASSETS).map((asset) => {
          const isRecommended = recommended.includes(asset.symbol)
          const isSelected = selectedCurrency === asset.symbol
          const rate = exchangeRates[asset.symbol]
          const cryptoAmount = rate ? amount / rate.usdPrice : 0

          return (
            <motion.div
              key={asset.symbol}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LiquidGlassCard
                className={cn(
                  'p-4 cursor-pointer transition-all relative overflow-hidden',
                  isSelected && 'border-purple-500 bg-purple-500/10',
                  isRecommended && 'border-blue-500/50'
                )}
                onClick={() => onSelect(asset.symbol)}
              >
                {isSelected && (
                  <>
                    <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur" />
                    <BorderTrail className="bg-gradient-to-r from-purple-500 to-blue-500" size={40} duration={3} />
                  </>
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold",
                      isSelected
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-slate-800 text-gray-300"
                    )}>
                      {asset.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{asset.symbol}</h4>
                      <p className="text-xs text-gray-400">{asset.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-semibold text-white">
                      {formatCryptoAmount(cryptoAmount, asset.symbol)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ${rate?.usdPrice.toLocaleString()}
                    </p>
                    {rate && rate.change24h !== 0 && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        rate.change24h > 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {rate.change24h > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(rate.change24h).toFixed(2)}%
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Network Fee:</span>
                    <span className="text-white">${(asset.networkFee.average * (rate?.usdPrice || 0)).toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confirmation Time:</span>
                    <span className="text-white">{getEstimatedConfirmationTime(asset.symbol)}</span>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ===== QR CODE PAYMENT COMPONENT =====

interface QRCodePaymentProps {
  address: string
  amount: number
  currency: CryptoCurrency
  expiresAt: Date
}

export function QRCodePayment({ address, amount, currency, expiresAt }: QRCodePaymentProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const distance = expiry - now

      if (distance < 0) {
        setTimeLeft('Expired')
        clearInterval(interval)
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const qrData = generatePaymentQRData(address, currency, amount)

  return (
    <LiquidGlassCard className="p-6">
      <div className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="relative">
            <GlowEffect className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-xl" />
            <div className="relative bg-white p-6 rounded-xl">
              {/* QR Code would be generated here using a library like qrcode.react */}
              <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Address */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Payment Address</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-slate-900/50 rounded-lg border border-gray-700 font-mono text-sm text-white break-all">
              {address}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="border-gray-700 hover:bg-slate-800"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Amount to Send</label>
          <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
            <div className="text-center">
              <p className="text-3xl font-bold text-white font-mono">
                {formatCryptoAmount(amount, currency)} {currency}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Send exactly this amount
              </p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-400">Expires in:</span>
          <span className="font-semibold text-yellow-400 font-mono">{timeLeft}</span>
        </div>

        {/* Important Notice */}
        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300 space-y-1">
            <p className="font-semibold text-yellow-400">Important:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Send only {currency} to this address</li>
              <li>Send the exact amount shown above</li>
              <li>Payment will be confirmed after {CRYPTO_ASSETS[currency].confirmations} confirmations</li>
              <li>This address expires in {timeLeft}</li>
            </ul>
          </div>
        </div>
      </div>
    </LiquidGlassCard>
  )
}

// ===== PAYMENT STATUS TRACKER =====

interface PaymentStatusTrackerProps {
  payment: CryptoPayment
  onRefresh: () => void
}

export function PaymentStatusTracker({ payment, onRefresh }: PaymentStatusTrackerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const statusInfo = formatPaymentStatus(payment.status)
  const progressPercentage = (payment.confirmations / payment.requiredConfirmations) * 100

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <LiquidGlassCard className="p-6">
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{statusInfo.icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-white">{statusInfo.label}</h3>
              <p className="text-sm text-gray-400">Transaction Status</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-gray-700 hover:bg-slate-800"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        {/* Progress Bar */}
        {(payment.status === 'confirming' || payment.status === 'confirmed') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Confirmations</span>
              <span className="text-white font-medium">
                {payment.confirmations} / {payment.requiredConfirmations}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-400 text-center">
              {payment.requiredConfirmations - payment.confirmations} more confirmations needed
            </p>
          </div>
        )}

        {/* Transaction Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Amount</span>
            <span className="font-semibold text-white font-mono">
              {payment.cryptoAmount} {payment.cryptoCurrency}
            </span>
          </div>

          {payment.txHash && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-sm text-gray-400">Transaction Hash</span>
              <a
                href={getTransactionUrl(payment.txHash, payment.network)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span className="font-mono text-sm">
                  {payment.txHash.slice(0, 6)}...{payment.txHash.slice(-4)}
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Network Fee</span>
            <span className="text-white font-mono text-sm">
              ${payment.networkFee.toFixed(4)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Total Paid</span>
            <span className="font-semibold text-white font-mono">
              ${payment.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={cn(
          "p-4 rounded-lg border text-center",
          statusInfo.color
        )}>
          <p className="font-medium">{statusInfo.label}</p>
          {payment.status === 'completed' && payment.completedAt && (
            <p className="text-xs mt-1 opacity-75">
              Completed at {new Date(payment.completedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </LiquidGlassCard>
  )
}

export default {
  WalletConnector,
  CurrencySelector,
  QRCodePayment,
  PaymentStatusTracker
}
