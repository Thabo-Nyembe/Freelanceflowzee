'use client'

import React, { memo, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Check, X, Star, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PricingCardProps {
  plan: {
    name: string
    price: string
    period?: string
    description: string
    icon: LucideIcon
    features: string[]
    limitations: string[]
    cta: string
    ctaVariant: 'default' | 'outline'
    popular: boolean
  }
}

// Memoized feature list items
const FeatureItem = memo(function FeatureItem({ feature }: { feature: string }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="text-gray-700">{feature}</span>
    </div>
  )
})

const LimitationItem = memo(function LimitationItem({ limitation }: { limitation: string }) {
  return (
    <div className="flex items-start gap-3">
      <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
      <span className="text-gray-500">{limitation}</span>
    </div>
  )
})

// Memoized pricing card component
export const PricingCard = memo(function PricingCard({ plan }: PricingCardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const Icon = plan.icon

  const handleSelectPlan = async () => {
    setIsLoading(true)

    try {
      // Determine action based on plan
      let action = 'subscribe'
      if (plan.name === 'Starter') {
        action = 'start_free'
      } else if (plan.name === 'Professional' && plan.cta === 'Start Free Trial') {
        action = 'start_trial'
      } else if (plan.name === 'Enterprise') {
        action = 'contact_sales'
      }

      // Track checkout start
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'checkout_start',
            properties: {
              plan: plan.name,
              price: plan.price,
              action,
              pathname,
              timestamp: new Date().toISOString()
            }
          })
        })
      } catch (error) {
        console.error('Analytics error:', error)
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.name.toLowerCase(),
          action
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          description: result.plan.name
        })

        // Show next steps alert
        setTimeout(() => {
          alert(`✅ ${result.message}\n\nNext Steps:\n${result.nextSteps.map(step => `• ${step}`).join('\n')}`)
        }, 500)

        // Handle redirect or checkout
        if (result.action === 'redirect') {
          router.push(result.redirectUrl)
        } else if (result.action === 'checkout') {
          window.location.href = result.checkoutUrl
        }
      } else {
        toast.error('Failed to process plan selection', {
          description: result.error || 'Please try again later'
        })
      }
    } catch (error: any) {
      console.error('Plan selection error:', error)
      toast.error('Failed to select plan', {
        description: 'Please check your connection and try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={`relative p-8 ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105' : ''}`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
          <Star className="w-3 h-3 mr-1" />
          Most Popular
        </Badge>
      )}

      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-gray-600">
          {plan.description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.period && <span className="text-gray-600">{plan.period}</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {plan.features.map((feature, idx) => (
            <FeatureItem key={idx} feature={feature} />
          ))}
          {plan.limitations.map((limitation, idx) => (
            <LimitationItem key={idx} limitation={limitation} />
          ))}
        </div>

        <Button
          variant={plan.ctaVariant}
          className="w-full py-6"
          onClick={handleSelectPlan}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : plan.cta}
        </Button>
      </CardContent>
    </Card>
  )
})
