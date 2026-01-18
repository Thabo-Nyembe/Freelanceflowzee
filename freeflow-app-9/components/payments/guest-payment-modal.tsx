'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Mail,
  User,
  Zap,
  Check,
  X,
  ArrowRight,
  Shield,
  Sparkles,
  Clock,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { subscriptionManager } from '@/lib/subscription/subscription-manager'

interface GuestPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  price: number
  onSuccess?: (sessionId: string) => void
  featureDescription?: string
  duration?: string // e.g., "24 hours", "7 days", "1 month"
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  processingTime: string
  fee: number // percentage
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Visa, Mastercard, American Express',
    processingTime: 'Instant',
    fee: 2.9
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: <div className="w-5 h-5 bg-black rounded text-white flex items-center justify-center text-xs">🍎</div>,
    description: 'Quick and secure payment',
    processingTime: 'Instant',
    fee: 2.9
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: <div className="w-5 h-5 bg-blue-500 rounded text-white flex items-center justify-center text-xs">G</div>,
    description: 'Pay with your Google account',
    processingTime: 'Instant',
    fee: 2.9
  }
]

export default function GuestPaymentModal({
  isOpen,
  onClose,
  feature,
  price,
  onSuccess,
  featureDescription,
  duration = "24 hours"
}: GuestPaymentModalProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'processing' | 'success'>('info')
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    name: '',
    agreedToTerms: false
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep('info')
      setError(null)
      setGuestInfo({ email: '', name: '', agreedToTerms: false })
    }
  }, [isOpen])

  const handleGuestInfoSubmit = async () => {
    if (!guestInfo.email || !guestInfo.name || !guestInfo.agreedToTerms) {
      setError('Please fill in all fields and agree to the terms')
      return
    }

    setLoading(true)
    try {
      // Create guest session
      const sessionId = await subscriptionManager.createGuestSession(guestInfo.email)
      setGuestSessionId(sessionId)
      setStep('payment')
    } catch (err) {
      setError('Failed to create guest session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!guestSessionId) {
      setError('Guest session not found. Please try again.')
      return
    }

    setLoading(true)
    setStep('processing')

    try {
      // Create payment intent for guest user
      const response = await fetch('/api/payments/guest-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestSessionId,
          email: guestInfo.email,
          name: guestInfo.name,
          feature,
          amount: Math.round(price * 100), // Convert to cents
          paymentMethod: selectedPaymentMethod,
          duration
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed')
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStep('success')

      if (onSuccess) {
        onSuccess(guestSessionId)
      }
    } catch (err: unknown) {
      setError(err.message || 'Payment failed. Please try again.')
      setStep('payment')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = price + (price * (PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.fee || 2.9) / 100)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Quick Access</CardTitle>
                    <p className="text-sm text-muted-foreground">No account required</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 mt-4">
                {['info', 'payment', 'success'].map((stepName, idx) => (
                  <React.Fragment key={stepName}>
                    <div className={`w-2 h-2 rounded-full ${
                      step === stepName ? 'bg-purple-600' :
                      ['info', 'payment', 'processing', 'success'].indexOf(step) > idx ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    {idx < 2 && <div className="flex-1 h-0.5 bg-gray-200" />}
                  </React.Fragment>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Feature Details */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">{feature}</h3>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  {featureDescription || `Get instant access to ${feature} for ${duration}`}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Clock className="w-4 h-4" />
                    <span>Access for {duration}</span>
                  </div>
                  <Badge className="bg-purple-600 text-white">
                    ${price}
                  </Badge>
                </div>
              </div>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {step === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="guest-name">Your Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="guest-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="guest-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="guest-email"
                          type="email"
                          placeholder="your@email.com"
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll send your access details here
                      </p>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={guestInfo.agreedToTerms}
                        onCheckedChange={(checked) =>
                          setGuestInfo(prev => ({ ...prev, agreedToTerms: checked as boolean }))
                        }
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                        I agree to the <a href="/terms" className="text-purple-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>
                      </label>
                    </div>

                    <Button
                      onClick={handleGuestInfoSubmit}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        </motion.div>
                      ) : (
                        <>
                          Continue to Payment
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Payment Method</Label>
                      <div className="space-y-2 mt-2">
                        {PAYMENT_METHODS.map((method) => (
                          <div
                            key={method.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPaymentMethod === method.id
                                ? 'border-purple-300 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            <div className="flex items-center gap-3">
                              {method.icon}
                              <div className="flex-1">
                                <div className="font-medium text-sm">{method.name}</div>
                                <div className="text-xs text-gray-500">{method.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">{method.processingTime}</div>
                                <div className="text-xs text-gray-500">{method.fee}% fee</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Feature Access</span>
                          <span>${price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Processing Fee</span>
                          <span>${(totalAmount - price).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Total</span>
                          <span>${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Secured by industry-standard encryption</span>
                    </div>

                    <Button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Pay ${totalAmount.toFixed(2)}
                    </Button>
                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
                    >
                      <CreditCard className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                    <p className="text-gray-600 text-sm">Please wait while we process your payment securely...</p>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Payment Successful!</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      You now have access to <strong>{feature}</strong> for {duration}
                    </p>
                    <div className="flex items-center gap-2 justify-center text-sm text-green-700 mb-6">
                      <Star className="w-4 h-4" />
                      <span>Access details sent to {guestInfo.email}</span>
                    </div>
                    <Button
                      onClick={onClose}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Start Using Feature
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}