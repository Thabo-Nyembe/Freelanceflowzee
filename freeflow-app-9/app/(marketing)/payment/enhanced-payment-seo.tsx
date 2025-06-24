'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  CreditCard, 
  Check, 
  Shield, 
  Smartphone, 
  Globe,
  Star,
  Users,
  Zap,
  Crown,
  Building2
} from 'lucide-react'

// Define proper types for the pricing plans
interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  billing: string
  stripePrice: string
  description: string
  features: string[]
  cta: string
  popular: boolean
  testId: string
  trialDays: number
  customPricing?: boolean
}

// Enhanced pricing plans with full features
const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Creator Free',
    price: 0,
    currency: 'USD',
    billing: 'month',
    stripePrice: '',
    description: 'Perfect for getting started with AI-powered creative tools',
    features: [
      'AI Create Studio (Free Models)',
      'Stable Diffusion XL Unlimited',
      'Basic File Sharing (1GB)',
      'Community Access',
      '2 Creative Fields',
      'Standard Support'
    ],
    cta: 'Start Free',
    popular: false,
    testId: 'free-plan',
    trialDays: 0
  },
  pro: {
    id: 'pro',
    name: 'Pro Creator',
    price: 29,
    currency: 'USD',
    billing: 'month',
    stripePrice: 'price_1RdYVtGfWWV489qXxMhUup05',
    description: 'Unlock premium AI models and professional features',
    features: [
      'All AI Models (GPT-4o, Claude, DALL-E)',
      'Premium AI Model Trials',
      'Unlimited AI Generation',
      'Escrow Payment System',
      'Video Studio Pro',
      'Advanced File Sharing (500GB)',
      '6+ Creative Fields',
      'Priority Support'
    ],
    cta: 'Start Pro Trial',
    popular: true,
    testId: 'pro-plan',
    trialDays: 14
  },
  enterprise: {
    id: 'enterprise',
    name: 'Agency Enterprise',
    price: 79,
    currency: 'USD',
    billing: 'month',
    stripePrice: 'price_1RdYVuGfWWV489qXSKBpkliy',
    description: 'White-label solution for agencies and enterprises',
    features: [
      'Everything in Pro',
      'White-label AI Create Studio',
      'Custom AI Model Training',
      'Bulk Asset Generation',
      'Advanced Analytics',
      'Unlimited File Storage (2TB+)',
      'Custom Integrations',
      'Dedicated Account Manager'
    ],
    cta: 'Contact Sales',
    popular: false,
    testId: 'enterprise-plan',
    trialDays: 7,
    customPricing: true
  }
}

// Main enhanced payment component
export default function EnhancedPaymentSEO() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS.pro)
  const [activeTab, setActiveTab] = useState<'pricing' | 'payment' | 'client-access'>('pricing')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const planParam = searchParams?.get('plan')
  
  useEffect(() => {
    if (planParam && PRICING_PLANS[planParam as keyof typeof PRICING_PLANS]) {
      setSelectedPlan(PRICING_PLANS[planParam as keyof typeof PRICING_PLANS])
    }
  }, [planParam])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12" data-testid="payment-container">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your AI-Powered Creative Plan
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Unlock the power of premium AI models (GPT-4o, Claude, DALL-E) with FreeflowZee. 
            Generate professional assets, share files securely, and manage creative projects seamlessly.
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              SSL Secured
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              25,000+ Creatives
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              4.9/5 Rating
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pricing' | 'payment' | 'client-access')} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3" data-testid="payment-tabs">
            <TabsTrigger value="pricing" data-testid="pricing-tab">Choose Plan</TabsTrigger>
            <TabsTrigger value="payment" data-testid="payment-tab">Payment</TabsTrigger>
            <TabsTrigger value="client-access" data-testid="client-access-tab">Client Access</TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {Object.values(PRICING_PLANS).map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${selectedPlan.id === plan.id ? 'bg-blue-50' : ''}`}
                  data-testid={`pricing-card-${plan.id}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {plan.id === 'free' && <Zap className="h-6 w-6 text-green-500" />}
                      {plan.id === 'pro' && <Crown className="h-6 w-6 text-blue-500" />}
                      {plan.id === 'enterprise' && <Building2 className="h-6 w-6 text-purple-500" />}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-500">/{plan.billing}</span>
                    </div>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className="w-full"
                      variant={plan.id === selectedPlan.id ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedPlan(plan)
                        if (plan.price > 0) {
                          setActiveTab('payment')
                        } else {
                          router.push('/dashboard?plan=free')
                        }
                      }}
                      data-testid={`select-${plan.id}`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <div className="max-w-2xl mx-auto">
              <Card data-testid="payment-form-container">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Complete Payment</span>
                    <Badge variant="outline">{selectedPlan.name}</Badge>
                  </CardTitle>
                  <div className="text-2xl font-bold">
                    ${selectedPlan.price}/{selectedPlan.billing}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <form className="space-y-4" data-testid="payment-form">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        data-testid="email-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        data-testid="name-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Card Details</Label>
                      <div className="border rounded-md p-3" data-testid="card-element">
                        <div className="text-gray-500">Stripe payment integration loading...</div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      data-testid="submit-payment"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ${selectedPlan.price}/{selectedPlan.billing}
                    </Button>
                  </form>
                  
                  {paymentError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" data-testid="payment-error">
                      <p className="text-red-600">{paymentError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Client Access Tab */}
          <TabsContent value="client-access">
            <div className="max-w-2xl mx-auto">
              <Card data-testid="client-access-container">
                <CardHeader>
                  <CardTitle>Client Access Portal</CardTitle>
                  <p className="text-gray-600">
                    Already a client? Access your projects and files securely.
                  </p>
                </CardHeader>
                
                <CardContent>
                  <form className="space-y-4" data-testid="client-login">
                    <div>
                      <Label htmlFor="client-email">Email Address</Label>
                      <Input 
                        id="client-email" 
                        type="email" 
                        placeholder="your@email.com"
                        data-testid="client-email-input"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="access-code">Access Code</Label>
                      <Input 
                        id="access-code" 
                        type="text" 
                        placeholder="Enter your access code"
                        data-testid="client-access-code"
                      />
                    </div>
                    
                    <Button className="w-full" data-testid="client-login-submit">
                      <Globe className="h-4 w-4 mr-2" />
                      Access Portal
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer trust badges */}
        <div className="text-center mt-16 space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              256-bit SSL Encryption
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Stripe Secure Processing
            </div>
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 mr-1" />
              Apple Pay & Google Pay
            </div>
          </div>
          
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            All payments are processed securely through Stripe. We never store your payment information. 
            Cancel anytime. 14-day money-back guarantee on all paid plans.
          </p>
        </div>
      </div>
    </div>
  )
}
