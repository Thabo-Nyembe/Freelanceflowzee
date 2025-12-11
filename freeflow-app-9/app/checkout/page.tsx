'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  CreditCard,
  Lock,
  Shield,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Tag,
  Zap,
  Crown,
  Gift,
} from 'lucide-react'

// Plan configurations
const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    icon: Sparkles,
    gradient: 'from-gray-500 to-gray-600',
    features: [
      '3 active projects',
      'Basic AI assistance',
      '5GB file storage',
      'Email support',
      'Community access',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 29,
    icon: Zap,
    gradient: 'from-blue-600 to-purple-600',
    trialDays: 14,
    features: [
      'Unlimited projects',
      'Advanced AI (GPT-4, Claude, DALL-E)',
      '100GB file storage',
      'Video studio',
      'Payment processing (2.9%)',
      'Priority support',
      'Branded client portals',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    icon: Crown,
    gradient: 'from-purple-600 to-pink-600',
    features: [
      'Everything in Professional',
      'Team collaboration (up to 50 users)',
      'Unlimited storage',
      'White-label solution',
      'Advanced security',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const planParam = searchParams.get('plan') || 'professional'
  const intervalParam = searchParams.get('interval') || 'month'

  const [selectedPlan, setSelectedPlan] = useState(planParam)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(intervalParam as 'month' | 'year')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number; type: string } | null>(null)
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Plan selection, 2: Payment

  const plan = PLANS[selectedPlan as keyof typeof PLANS] || PLANS.professional

  // Calculate prices
  const monthlyPrice = plan.price
  const annualPrice = Math.round(plan.price * 12 * 0.8) // 20% discount
  const displayPrice = billingInterval === 'month' ? monthlyPrice : annualPrice
  const savings = billingInterval === 'year' ? plan.price * 12 - annualPrice : 0

  // Apply promo discount
  const discountedPrice = promoApplied
    ? promoApplied.type === 'percent'
      ? Math.round(displayPrice * (1 - promoApplied.discount / 100))
      : displayPrice - promoApplied.discount
    : displayPrice

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return

    setIsValidatingPromo(true)
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate-promo',
          promoCode: promoCode.trim(),
        }),
      })

      const data = await response.json()

      if (data.success && data.data.valid) {
        setPromoApplied({
          code: data.data.code,
          discount: data.data.discount,
          type: data.data.type,
        })
        toast.success('Promo code applied!', {
          description: `${data.data.discount}${data.data.type === 'percent' ? '%' : ''} off`,
        })
      } else {
        toast.error('Invalid promo code')
        setPromoApplied(null)
      }
    } catch {
      toast.error('Failed to validate promo code')
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoApplied(null)
    setPromoCode('')
    toast.info('Promo code removed')
  }

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      // Free plan - just redirect
      if (plan.price === 0) {
        toast.success('Welcome to KAZI Starter!')
        router.push('/dashboard')
        return
      }

      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-checkout-session',
          planId: selectedPlan,
          billingInterval,
          promoCode: promoApplied?.code,
        }),
      })

      const data = await response.json()

      if (data.success && data.data.url) {
        // Redirect to Stripe checkout or success page
        window.location.href = data.data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process checkout')
    } finally {
      setIsLoading(false)
    }
  }

  const PlanIcon = plan.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KAZI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                Secure Checkout
              </div>
              <Link href="/pricing">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium">Select Plan</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="font-medium">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <>
                {/* Plan Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Your Plan</CardTitle>
                    <CardDescription>Select the plan that best fits your needs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center p-1 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                      <button
                        onClick={() => setBillingInterval('month')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                          billingInterval === 'month'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingInterval('year')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          billingInterval === 'year'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Annual
                        <Badge className="bg-green-100 text-green-700 text-xs">Save 20%</Badge>
                      </button>
                    </div>

                    {/* Plan Options */}
                    <div className="grid gap-4">
                      {Object.values(PLANS).map((p) => {
                        const Icon = p.icon
                        const isSelected = selectedPlan === p.id
                        const price = billingInterval === 'month' ? p.price : Math.round(p.price * 12 * 0.8)

                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPlan(p.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${p.gradient} flex items-center justify-center`}>
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{p.name}</h3>
                                  <p className="text-sm text-gray-500">
                                    {p.features.slice(0, 2).join(' • ')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  {p.price === 0 ? 'Free' : `$${price}`}
                                </div>
                                {p.price > 0 && (
                                  <div className="text-sm text-gray-500">
                                    /{billingInterval === 'month' ? 'mo' : 'yr'}
                                  </div>
                                )}
                              </div>
                            </div>
                            {'trialDays' in p && p.trialDays && (
                              <div className="mt-3 flex items-center gap-2">
                                <Gift className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                  {p.trialDays}-day free trial included
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                      onClick={() => setStep(2)}
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlanIcon className="w-5 h-5" />
                      {plan.name} Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

            {step === 2 && (
              <>
                {/* Payment Step */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Complete Your Purchase
                    </CardTitle>
                    <CardDescription>
                      {plan.price === 0
                        ? 'No payment required for the Starter plan'
                        : 'You will be redirected to our secure payment partner'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {plan.price > 0 && (
                      <>
                        {/* Promo Code */}
                        <div className="space-y-2">
                          <Label>Promo Code</Label>
                          {promoApplied ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <Tag className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-700">
                                {promoApplied.code} - {promoApplied.discount}
                                {promoApplied.type === 'percent' ? '%' : ''} off
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-gray-500"
                                onClick={handleRemovePromo}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter promo code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="uppercase"
                              />
                              <Button
                                variant="outline"
                                onClick={handleValidatePromo}
                                disabled={isValidatingPromo || !promoCode.trim()}
                              >
                                {isValidatingPromo ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Apply'
                                )}
                              </Button>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Try: LAUNCH20, WELCOME10, or FIRSTMONTH
                          </p>
                        </div>

                        <Separator />

                        {/* Payment Info */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <Lock className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Secure Payment</p>
                              <p className="text-sm text-gray-600">
                                Powered by Stripe - PCI DSS compliant
                              </p>
                            </div>
                          </div>

                          {'trialDays' in plan && plan.trialDays && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                              <Gift className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium">14-Day Free Trial</p>
                                <p className="text-sm text-gray-600">
                                  You won&apos;t be charged until the trial ends
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : plan.price === 0 ? (
                        <>
                          Start Free
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : 'trialDays' in plan && plan.trialDays ? (
                        <>
                          Start {plan.trialDays}-Day Free Trial
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Pay ${discountedPrice}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="text-gray-500"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Plan Selection
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Plan */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                    <PlanIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-gray-500">
                      {billingInterval === 'month' ? 'Monthly' : 'Annual'} billing
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{plan.name} Plan</span>
                    <span>{plan.price === 0 ? 'Free' : `$${displayPrice}`}</span>
                  </div>

                  {billingInterval === 'year' && savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Annual Discount (20%)</span>
                      <span>-${savings}</span>
                    </div>
                  )}

                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo ({promoApplied.code})</span>
                      <span>
                        -{promoApplied.discount}{promoApplied.type === 'percent' ? '%' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      {plan.price === 0 ? 'Free' : `$${discountedPrice}`}
                    </span>
                    {plan.price > 0 && (
                      <p className="text-sm text-gray-500">
                        /{billingInterval === 'month' ? 'month' : 'year'}
                      </p>
                    )}
                  </div>
                </div>

                {'trialDays' in plan && plan.trialDays && plan.price > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-green-700 font-medium">
                      Pay $0 today - {plan.trialDays}-day free trial
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-4">
                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    SSL Encrypted
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    GDPR Compliant
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3" />
                    30-Day Guarantee
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CreditCard className="w-3 h-3" />
                    Cancel Anytime
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="mailto:support@kazi.app" className="text-blue-600 hover:underline">
              support@kazi.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
