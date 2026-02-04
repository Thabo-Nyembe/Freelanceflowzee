'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  Clock,
  Users,
  Shield,
  Brain,
  ArrowRight,
  Smartphone,
  Monitor,
  Play,
  Gift,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import GuestPaymentModal from '@/components/payments/guest-payment-modal'
import { SUBSCRIPTION_PLANS, PlanType } from '@/lib/subscription/subscription-manager'

import Marketing2025Wrapper, {
  Enhanced2025MarketingCard,
  Enhanced2025MarketingButton,
  Enhanced2025HeroSection
} from '@/components/ui/marketing-2025-wrapper'
import { toast } from 'sonner'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Pricing')

interface QuickAccessFeature {
  id: string
  name: string
  description: string
  price: number
  duration: string
  icon: React.ReactNode
  category: 'ai' | 'collaboration' | 'analytics' | 'creative'
  popular?: boolean
}

const QUICK_ACCESS_FEATURES: QuickAccessFeature[] = [
  {
    id: 'ai-create-24h',
    name: 'AI Create Studio',
    description: '24-hour access to all AI models (GPT-4o, Claude, DALL-E)',
    price: 9.99,
    duration: '24 hours',
    icon: <Brain className="w-5 h-5" />,
    category: 'ai',
    popular: true
  },
  {
    id: 'video-studio-7d',
    name: 'Video Studio Pro',
    description: 'Professional video editing with AI transcription',
    price: 19.99,
    duration: '7 days',
    icon: <Play className="w-5 h-5" />,
    category: 'creative'
  },
  {
    id: 'analytics-premium-30d',
    name: 'Premium Analytics',
    description: 'Advanced business insights and predictive analytics',
    price: 14.99,
    duration: '30 days',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'analytics'
  },
  {
    id: 'collaboration-suite-7d',
    name: 'Collaboration Suite',
    description: 'Universal Pinpoint System + real-time collaboration',
    price: 12.99,
    duration: '7 days',
    icon: <Users className="w-5 h-5" />,
    category: 'collaboration'
  }
]

export default function EnhancedPricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [showGuestPayment, setShowGuestPayment] = useState(false)
  const [selectedQuickFeature, setSelectedQuickFeature] = useState<QuickAccessFeature | null>(null)
  const [activeTab, setActiveTab] = useState<'subscription' | 'quick-access'>('subscription')

  const getAnnualDiscount = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.7) // 30% discount
  }

  const getPlanPrice = (plan: PlanType) => {
    const planData = SUBSCRIPTION_PLANS[plan]
    if (planData.price === 0) return 0
    return billingInterval === 'annual' ? getAnnualDiscount(planData.price) : planData.price
  }

  const handleQuickAccess = (feature: QuickAccessFeature) => {
    setSelectedQuickFeature(feature)
    setShowGuestPayment(true)
  }

  const handleSubscriptionUpgrade = (plan: PlanType) => {
    setSelectedPlan(plan)
    // Redirect to signup or upgrade flow
    window.location.href = plan === 'enterprise' ? '/contact' : '/signup'
  }

  const planOrder: PlanType[] = ['free', 'professional', 'enterprise']

  return (
    <Marketing2025Wrapper
      enableParallax={true}
      enableSpatial={true}
      enableAnimations={true}
      heroSection={true}
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">

          {/* Enhanced Header */}
          <Enhanced2025HeroSection
            subtitle="Revolutionary Pricing"
            title="Choose Your KAZI Experience"
            description="From instant feature access to comprehensive subscriptions. Start free, upgrade when ready, or try any feature instantly without commitment."
          />

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="subscription" className="text-sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Subscriptions
                </TabsTrigger>
                <TabsTrigger value="quick-access" className="text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Access
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <TabsContent value="subscription" className="space-y-12">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${billingInterval === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <Switch
                checked={billingInterval === 'annual'}
                onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
              />
              <span className={`text-sm ${billingInterval === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
              </span>
              <Badge className="bg-green-100 text-green-700 ml-2">
                Save 30%
              </Badge>
            </div>

            {/* Subscription Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {planOrder.map((planType, index) => {
                const plan = SUBSCRIPTION_PLANS[planType]
                const price = getPlanPrice(planType)
                const isPopular = planType === 'professional'

                return (
                  <motion.div
                    key={planType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative ${isPopular ? 'scale-105' : ''}`}
                  >
                    <Enhanced2025MarketingCard
                      title={plan.name}
                      description={`${plan.features.length} powerful features`}
                      icon={planType === 'free' ? Sparkles : planType === 'professional' ? Zap : Crown}
                      gradient={
                        planType === 'free' ? 'from-purple-400 to-pink-400' :
                        planType === 'professional' ? 'from-blue-400 to-cyan-400' :
                        'from-violet-400 to-purple-400'
                      }
                      badge={
                        planType === 'free' ? 'Always Free' :
                        planType === 'professional' ? 'Most Popular' :
                        'Enterprise'
                      }
                      stats={{
                        price: planType === 'enterprise' ? 'Custom' : (price === 0 ? 'Free' : `$${price}`),
                        period: planType === 'enterprise' ? 'Contact Us' : (billingInterval === 'annual' ? '/year' : '/month'),
                        features: `${plan.features.length} features`
                      }}
                      className={isPopular ? 'ring-2 ring-cyan-400/50' : ''}
                    >
                      <div className="space-y-6">
                        {/* Price Display */}
                        <div className="text-center">
                          {planType !== 'enterprise' && (
                            <>
                              {billingInterval === 'annual' && price > 0 && (
                                <div className="text-sm text-gray-500 line-through">
                                  ${Math.round(plan.price * 12)}/year
                                </div>
                              )}
                              <div className="text-4xl font-bold">
                                {price === 0 ? 'Free' : `$${price}`}
                              </div>
                              <div className="text-gray-500">
                                {price === 0 ? 'Forever' : `/${billingInterval === 'annual' ? 'year' : 'month'}`}
                              </div>
                            </>
                          )}
                          {planType === 'enterprise' && (
                            <div className="text-3xl font-bold text-purple-600">
                              Custom Pricing
                            </div>
                          )}
                        </div>

                        {/* Features List */}
                        <div className="space-y-3">
                          {plan.features.slice(0, 6).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                              <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                            </div>
                          ))}
                          {plan.features.length > 6 && (
                            <div className="text-sm text-gray-500 text-center pt-2">
                              +{plan.features.length - 6} more features
                            </div>
                          )}
                        </div>

                        {/* Limits Display */}
                        <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-sm text-gray-700">Plan Limits</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Projects:</span>
                              <span className="font-medium ml-1">
                                {plan.limits.projects === -1 ? '∞' : plan.limits.projects}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Storage:</span>
                              <span className="font-medium ml-1">
                                {plan.limits.storage === -1 ? '∞' : `${plan.limits.storage}GB`}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">AI Requests:</span>
                              <span className="font-medium ml-1">
                                {plan.limits.aiRequests === -1 ? '∞' : `${plan.limits.aiRequests}/mo`}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Collaborators:</span>
                              <span className="font-medium ml-1">
                                {plan.limits.collaborators === -1 ? '∞' : plan.limits.collaborators}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Enhanced2025MarketingButton
                          variant={isPopular ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => handleSubscriptionUpgrade(planType)}
                        >
                          {planType === 'free' ? 'Get Started Free' :
                           planType === 'professional' ? 'Start Free Trial' :
                           'Contact Sales'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Enhanced2025MarketingButton>
                      </div>
                    </Enhanced2025MarketingCard>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="quick-access" className="space-y-8">
            {/* Quick Access Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Try Any Feature Instantly
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                No commitment, no subscription required. Pay only for what you need, when you need it.
                Perfect for trying premium features or one-time projects.
              </p>
            </div>

            {/* Quick Access Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUICK_ACCESS_FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative h-full hover:shadow-lg transition-all cursor-pointer ${
                    feature.popular ? 'ring-2 ring-purple-300' : ''
                  }`}>
                    {feature.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                        Popular
                      </Badge>
                    )}

                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          feature.category === 'ai' ? 'bg-purple-100 text-purple-600' :
                          feature.category === 'creative' ? 'bg-blue-100 text-blue-600' :
                          feature.category === 'analytics' ? 'bg-green-100 text-green-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {feature.duration}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-purple-600">
                          ${feature.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {feature.duration} access
                        </div>
                      </div>

                      <Button
                        onClick={() => handleQuickAccess(feature)}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Get Instant Access
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold text-center mb-6">
                Why Choose Quick Access?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Instant Access</h4>
                  <p className="text-sm text-gray-600">Start using premium features within minutes of payment</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">No Commitment</h4>
                  <p className="text-sm text-gray-600">Try features without long-term subscriptions</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Fair Pricing</h4>
                  <p className="text-sm text-gray-600">Pay only for what you use, when you use it</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mobile Optimization Notice */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full px-6 py-3">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Fully optimized for mobile • Touch gestures enabled
              </span>
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime SLA</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">12K+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">30-day</div>
              <div className="text-sm text-gray-600">Money Back</div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Payment Modal */}
      {selectedQuickFeature && (
        <GuestPaymentModal
          isOpen={showGuestPayment}
          onClose={() => {
            setShowGuestPayment(false)
            setSelectedQuickFeature(null)
          }}
          feature={selectedQuickFeature.name}
          price={selectedQuickFeature.price}
          featureDescription={selectedQuickFeature.description}
          duration={selectedQuickFeature.duration}
          onSuccess={(sessionId) => {
            logger.info('Payment successful', {
              sessionId,
              feature: selectedQuickFeature.name,
              price: selectedQuickFeature.price,
              duration: selectedQuickFeature.duration
            })

            toast.success('Payment successful', {
              description: `${selectedQuickFeature.name} - $${selectedQuickFeature.price} - ${selectedQuickFeature.duration} - Access unlocked`
            })

            // Handle successful payment
            setShowGuestPayment(false)
            // Redirect to feature or show success message
          }}
        />
      )}
    </Marketing2025Wrapper>
  )
}