"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Lock,
  Unlock,
  CreditCard,
  Download,
  Star,
  Check,
  Shield,
  Zap,
  Crown,
  DollarSign,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('PaymentGate')

// ============================================================================
// TYPES
// ============================================================================

export interface PricingTier {
  id: string
  name: string
  price: number
  currency: string
  type: 'free' | 'standard' | 'premium' | 'exclusive'
  features: string[]
  downloads: number | 'unlimited'
  quality: 'standard' | 'high' | 'original'
  watermark: boolean
  commercial: boolean
  support: 'community' | 'email' | 'priority'
  popular?: boolean
}

export interface PaymentGateProps {
  itemId: string
  itemType: 'image' | 'video' | 'audio' | 'document' | 'collection'
  itemTitle: string
  itemThumbnail?: string
  creatorName: string
  creatorId: string
  pricingTiers: PricingTier[]
  userTier?: string
  onPurchaseComplete?: (tier: PricingTier, transactionId: string) => void
  onAccessGranted?: () => void
  className?: string
}

// ============================================================================
// PAYMENT GATE COMPONENT
// ============================================================================

export function PaymentGate({
  itemId,
  itemType,
  itemTitle,
  itemThumbnail,
  creatorName,
  creatorId,
  pricingTiers,
  userTier,
  onPurchaseComplete,
  onAccessGranted,
  className = ''
}: PaymentGateProps) {
  // State
  const [isOpen, setIsOpen] = useState(true)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card')

  // Payment form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [billingName, setBillingName] = useState('')

  // Check if user has access
  const hasAccess = userTier && pricingTiers.some(tier =>
    tier.id === userTier && tier.type !== 'free'
  )

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTierSelect = (tier: PricingTier) => {
    setSelectedTier(tier)

    if (tier.type === 'free') {
      handleFreeAccess(tier)
    } else {
      setShowPaymentForm(true)
    }

    logger.info('Pricing tier selected', {
      itemId,
      tierId: tier.id,
      tierName: tier.name,
      price: tier.price
    })
  }

  const handleFreeAccess = (tier: PricingTier) => {
    toast.success('Free access granted!')
    logger.info('Free access granted', { itemId, tierId: tier.id })

    if (onAccessGranted) {
      onAccessGranted()
    }

    setIsOpen(false)
  }

  const handlePayment = async () => {
    if (!selectedTier) return

    // Validation
    if (!billingName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!cardNumber.trim() || cardNumber.length < 16) {
      toast.error('Please enter a valid card number')
      return
    }

    if (!cardExpiry.trim() || !cardExpiry.includes('/')) {
      toast.error('Please enter a valid expiry date (MM/YY)')
      return
    }

    if (!cardCvc.trim() || cardCvc.length < 3) {
      toast.error('Please enter a valid CVC')
      return
    }

    setIsProcessing(true)

    try {
      // In production, this would call Stripe API
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          tierId: selectedTier.id,
          amount: selectedTier.price,
          currency: selectedTier.currency,
          creatorId,
          paymentMethod: {
            type: paymentMethod,
            cardLast4: cardNumber.slice(-4)
          }
        })
      })

      if (!response.ok) {
        throw new Error('Payment failed')
      }

      const result = await response.json()

      logger.info('Payment successful', {
        itemId,
        tierId: selectedTier.id,
        transactionId: result.transactionId,
        amount: selectedTier.price
      })

      toast.success('Payment successful!', {
        description: `You now have ${selectedTier.name} access`
      })

      if (onPurchaseComplete) {
        onPurchaseComplete(selectedTier, result.transactionId)
      }

      if (onAccessGranted) {
        onAccessGranted()
      }

      setIsOpen(false)

    } catch (error) {
      logger.error('Payment failed', {
        itemId,
        error: error.message
      })

      toast.error('Payment failed', {
        description: error.message || 'Please try again or contact support'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    logger.info('Payment gate closed', { itemId })
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ')
  }

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  // Get tier icon
  const getTierIcon = (type: PricingTier['type']) => {
    switch (type) {
      case 'free':
        return <Unlock className="w-5 h-5" />
      case 'standard':
        return <Download className="w-5 h-5" />
      case 'premium':
        return <Star className="w-5 h-5" />
      case 'exclusive':
        return <Crown className="w-5 h-5" />
      default:
        return <Lock className="w-5 h-5" />
    }
  }

  // Get tier color
  const getTierColor = (type: PricingTier['type']) => {
    switch (type) {
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'exclusive':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (hasAccess) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Premium Content
          </DialogTitle>
          <DialogDescription>
            Choose a pricing option to access "{itemTitle}"
          </DialogDescription>
        </DialogHeader>

        {!showPaymentForm ? (
          <div className="space-y-6">
            {/* Item Preview */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {itemThumbnail && (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      <img src={itemThumbnail}
                        alt={itemTitle}
                        className="w-full h-full object-cover"
                      loading="lazy" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{itemTitle}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by {creatorName}
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {itemType}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    selectedTier?.id === tier.id ? 'ring-2 ring-blue-600' : ''
                  } ${tier.popular ? 'border-2 border-blue-600' : ''}`}
                  onClick={() => handleTierSelect(tier)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg ${getTierColor(tier.type)} flex items-center justify-center mb-3`}>
                      {getTierIcon(tier.type)}
                    </div>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {tier.price === 0 ? 'Free' : `$${tier.price}`}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-sm text-gray-600">
                          {tier.currency}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span className="font-medium">
                          {tier.downloads === 'unlimited' ? 'Unlimited' : tier.downloads}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quality:</span>
                        <span className="font-medium capitalize">{tier.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Watermark:</span>
                        <span className="font-medium">
                          {tier.watermark ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commercial Use:</span>
                        <span className="font-medium">
                          {tier.commercial ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={tier.type === 'free' ? 'outline' : 'default'}
                    >
                      {tier.type === 'free' ? 'Get Free Access' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trust Signals */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Secure Payment</p>
                    <p className="text-xs text-gray-600">256-bit SSL encryption</p>
                  </div>
                  <div>
                    <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Instant Access</p>
                    <p className="text-xs text-gray-600">Download immediately</p>
                  </div>
                  <div>
                    <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Creator Support</p>
                    <p className="text-xs text-gray-600">85% goes to creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Payment Form
          <div className="space-y-6">
            {/* Selected Tier Summary */}
            {selectedTier && (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedTier.name}</h3>
                      <p className="text-sm text-gray-600">
                        Access to "{itemTitle}"
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        ${selectedTier.price}
                      </p>
                      <p className="text-sm text-gray-600">{selectedTier.currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <div>
              <Label className="mb-2 block">Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="justify-start"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </Button>
                <Button
                  variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('wallet')}
                  className="justify-start"
                  disabled
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Digital Wallet
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Soon
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="billingName">Name on Card</Label>
                  <Input
                    id="billingName"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value.replace(/\s/g, ''))
                      if (formatted.replace(/\s/g, '').length <= 16) {
                        setCardNumber(formatted)
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    disabled={isProcessing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      value={cardExpiry}
                      onChange={(e) => {
                        const formatted = formatExpiry(e.target.value)
                        if (formatted.length <= 5) {
                          setCardExpiry(formatted)
                        }
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input
                      id="cardCvc"
                      value={cardCvc}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 4) {
                          setCardCvc(value)
                        }
                      }}
                      placeholder="123"
                      maxLength={4}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      Your payment is secure
                    </p>
                    <p className="text-blue-700">
                      We use Stripe for secure payment processing. Your card details are never stored on our servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                disabled={isProcessing}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Pay ${selectedTier?.price}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// PAYMENT GATE BUTTON (Trigger Component)
// ============================================================================

interface PaymentGateButtonProps {
  itemId: string
  itemType: 'image' | 'video' | 'audio' | 'document' | 'collection'
  itemTitle: string
  hasAccess: boolean
  onClick?: () => void
  className?: string
}

export function PaymentGateButton({
  itemId,
  itemType,
  itemTitle,
  hasAccess,
  onClick,
  className = ''
}: PaymentGateButtonProps) {
  if (hasAccess) {
    return (
      <Button className={className} onClick={onClick}>
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    )
  }

  return (
    <Button className={className} onClick={onClick}>
      <Lock className="w-4 h-4 mr-2" />
      Unlock to Download
    </Button>
  )
}
