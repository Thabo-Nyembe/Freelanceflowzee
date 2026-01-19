'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Check, X, Sparkles, Zap, Shield, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PlanFeature {
  name: string
  included: boolean
  limit?: string
}

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  popular?: boolean
  enterprise?: boolean
  icon: 'sparkles' | 'zap' | 'shield' | 'crown'
}

interface PricingTableProps {
  currentPlanId?: string
  onSelectPlan?: (planId: string, interval: 'monthly' | 'yearly') => void
}

const defaultPlans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: 'sparkles',
    features: [
      { name: '3 Projects', included: true },
      { name: '1 GB Storage', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Community Support', included: true },
      { name: 'API Access', included: false },
      { name: 'Custom Branding', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Advanced Integrations', included: false }
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and small teams',
    monthlyPrice: 19,
    yearlyPrice: 190,
    icon: 'zap',
    features: [
      { name: '10 Projects', included: true },
      { name: '10 GB Storage', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Email Support', included: true },
      { name: 'API Access', included: true, limit: '10K calls/mo' },
      { name: 'Custom Branding', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Advanced Integrations', included: false }
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses',
    monthlyPrice: 49,
    yearlyPrice: 490,
    icon: 'shield',
    popular: true,
    features: [
      { name: 'Unlimited Projects', included: true },
      { name: '100 GB Storage', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Priority Support', included: true },
      { name: 'API Access', included: true, limit: '100K calls/mo' },
      { name: 'Custom Branding', included: true },
      { name: 'Advanced Integrations', included: true },
      { name: 'Team Collaboration', included: true, limit: '10 members' }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    icon: 'crown',
    enterprise: true,
    features: [
      { name: 'Unlimited Everything', included: true },
      { name: 'Unlimited Storage', included: true },
      { name: 'Custom Analytics', included: true },
      { name: '24/7 Dedicated Support', included: true },
      { name: 'API Access', included: true, limit: 'Unlimited' },
      { name: 'White Labeling', included: true },
      { name: 'All Integrations', included: true },
      { name: 'Unlimited Team Members', included: true },
      { name: 'SSO & SAML', included: true },
      { name: 'Custom SLA', included: true },
      { name: 'Dedicated Account Manager', included: true }
    ]
  }
]

export function PricingTable({ currentPlanId, onSelectPlan }: PricingTableProps) {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans)
  const [isYearly, setIsYearly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/billing/subscriptions?action=plans')
      if (res.ok) {
        const data = await res.json()
        if (data.plans && data.plans.length > 0) {
          // Map API plans to our format
          const mappedPlans = data.plans.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || `${p.name} plan`,
            monthlyPrice: p.interval === 'yearly' ? p.price / 12 : p.price,
            yearlyPrice: p.interval === 'yearly' ? p.price : p.price * 10, // 2 months free
            icon: p.name.toLowerCase() === 'enterprise' ? 'crown' :
                  p.name.toLowerCase() === 'professional' ? 'shield' :
                  p.name.toLowerCase() === 'starter' ? 'zap' : 'sparkles',
            popular: p.name.toLowerCase() === 'professional',
            enterprise: p.name.toLowerCase() === 'enterprise',
            features: p.features?.map((f: string) => ({ name: f, included: true })) || []
          }))
          setPlans(mappedPlans)
        }
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlanId) {
      toast.info('This is your current plan')
      return
    }

    setSelectedPlan(planId)
    setLoading(true)

    try {
      if (onSelectPlan) {
        onSelectPlan(planId, isYearly ? 'yearly' : 'monthly')
      } else {
        // Default behavior - redirect to checkout
        const res = await fetch('/api/billing/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            planId,
            interval: isYearly ? 'yearly' : 'monthly'
          })
        })

        if (res.ok) {
          const data = await res.json()
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl
          } else {
            toast.success('Subscription updated successfully')
          }
        } else {
          const error = await res.json()
          toast.error(error.error || 'Failed to update subscription')
        }
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'sparkles': return <Sparkles className="h-6 w-6" />
      case 'zap': return <Zap className="h-6 w-6" />
      case 'shield': return <Shield className="h-6 w-6" />
      case 'crown': return <Crown className="h-6 w-6" />
      default: return <Sparkles className="h-6 w-6" />
    }
  }

  const getSavings = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return null
    const monthlyCost = plan.monthlyPrice * 12
    const yearlyCost = plan.yearlyPrice
    const savings = monthlyCost - yearlyCost
    if (savings <= 0) return null
    return Math.round((savings / monthlyCost) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label
          htmlFor="billing-toggle"
          className={cn(!isYearly && 'text-foreground', 'text-muted-foreground')}
        >
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label
          htmlFor="billing-toggle"
          className={cn(isYearly && 'text-foreground', 'text-muted-foreground')}
        >
          Yearly
          <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-500">
            Save up to 20%
          </Badge>
        </Label>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const savings = getSavings(plan)
          const isCurrentPlan = plan.id === currentPlanId
          const isSelected = plan.id === selectedPlan

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                plan.popular && 'border-primary shadow-lg scale-105',
                plan.enterprise && 'border-amber-500'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getIcon(plan.icon)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{formatPrice(price)}</span>
                    {price > 0 && (
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {isYearly && savings && (
                    <p className="text-sm text-green-500 mt-1">
                      Save {savings}% with yearly billing
                    </p>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span className={cn(
                        'text-sm',
                        !feature.included && 'text-muted-foreground'
                      )}>
                        {feature.name}
                        {feature.limit && (
                          <span className="text-muted-foreground ml-1">
                            ({feature.limit})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={loading || isCurrentPlan}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : isSelected && loading ? (
                    'Processing...'
                  ) : plan.enterprise ? (
                    'Contact Sales'
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* FAQ or additional info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 14-day free trial. No credit card required.</p>
        <p className="mt-1">
          Need a custom plan? <a href="/contact" className="text-primary hover:underline">Contact us</a>
        </p>
      </div>
    </div>
  )
}

export default PricingTable
