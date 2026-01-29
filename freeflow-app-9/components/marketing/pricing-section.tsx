'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Building2, Rocket } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for freelancers just getting started',
    price: 0,
    priceLabel: 'Free',
    priceDescription: 'Forever free',
    icon: Zap,
    features: [
      '3 Active Projects',
      '1 GB Storage',
      'Basic Invoicing',
      'Email Support',
      'Client Portal Access',
      'Basic Analytics',
    ],
    cta: 'Get Started Free',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing freelancers and small teams',
    price: 29,
    priceLabel: '$29',
    priceDescription: 'per month',
    icon: Rocket,
    features: [
      'Unlimited Projects',
      '50 GB Storage',
      'Escrow Payments',
      'Priority Support',
      'Video Studio',
      'AI-Powered Tools',
      'Advanced Analytics',
      'Custom Branding',
      'Team Collaboration',
      'API Access',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For agencies and large organizations',
    price: 99,
    priceLabel: '$99',
    priceDescription: 'per month',
    icon: Building2,
    features: [
      'Everything in Professional',
      'Unlimited Storage',
      'White-Label Options',
      'Dedicated Support',
      'Custom Integrations',
      'Advanced Security',
      'SLA Guarantee',
      'Onboarding Training',
      'Audit Logs',
      'SSO/SAML',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section className="py-20 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
            All plans include a 14-day free trial with no credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card className={`h-full flex flex-col ${plan.popular ? 'border-purple-500 shadow-xl scale-105' : 'border-gray-200 dark:border-gray-800'}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-purple-500' : 'text-gray-500'}`} />
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.priceLabel}</span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground ml-2">{plan.priceDescription}</span>
                    )}
                    {plan.price === 0 && (
                      <span className="text-muted-foreground ml-2">{plan.priceDescription}</span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''}`}
                      variant={plan.ctaVariant}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Need a custom plan for your organization?{' '}
            <Link href="/contact" className="text-purple-600 hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
