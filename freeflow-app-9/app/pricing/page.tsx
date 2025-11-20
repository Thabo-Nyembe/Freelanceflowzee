'use client'

import Link from 'next/link'
import { Zap, Crown, Sparkles } from 'lucide-react'
import { PricingCard } from '@/components/pricing-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { ParallaxScroll } from '@/components/ui/parallax-scroll'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for getting started',
      icon: Sparkles,
      features: [
        '3 active projects',
        'Basic AI assistance',
        '5GB file storage',
        'Email support',
        'Community access',
        'Basic analytics'
      ],
      limitations: [
        'No video recording',
        'No payment processing',
        'Limited integrations'
      ],
      cta: 'Start Free',
      ctaVariant: 'outline' as const,
      popular: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'For serious freelancers',
      icon: Zap,
      features: [
        'Unlimited projects',
        'Advanced AI features',
        '100GB file storage',
        'Video studio access',
        'Payment processing (2.9%)',
        'Priority support',
        'Advanced analytics',
        'Client portal access',
        'Custom branding'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      ctaVariant: 'default' as const,
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For agencies and teams',
      icon: Crown,
      features: [
        'Everything in Professional',
        'Team collaboration (up to 10 users)',
        'Unlimited storage',
        'White-label solution',
        'Advanced security',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom AI training'
      ],
      limitations: [],
      cta: 'Contact Sales',
      ctaVariant: 'outline' as const,
      popular: false
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Scroll Progress */}
      <ScrollProgress position="top" height={3} showPercentage={false} />

      {/* Enhanced Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />

      {/* Animated Gradient Orbs with Parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <ParallaxScroll speed={0.2} direction="down">
          <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        </ParallaxScroll>
        <ParallaxScroll speed={0.3} direction="up">
          <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </ParallaxScroll>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <TextShimmer className="text-4xl md:text-5xl font-bold mb-6" duration={2}>
              Simple, Transparent Pricing
            </TextShimmer>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of successful freelancers using KAZI to build thriving creative businesses
              with AI-powered tools, universal feedback systems, and secure payment protection.
            </p>

            {/* Billing Toggle */}
            <LiquidGlassCard className="inline-flex items-center p-1">
              <button className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">
                Monthly
              </button>
              <button className="px-6 py-2 rounded-full text-gray-400 text-sm font-medium hover:text-white transition-colors">
                Annual (Save 20%)
              </button>
            </LiquidGlassCard>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <TextShimmer className="text-3xl font-bold text-center mb-12" duration={2}>
              Frequently Asked Questions
            </TextShimmer>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-white">Can I change plans anytime?</h3>
                  <p className="text-gray-400">Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.</p>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-white">What payment methods do you accept?</h3>
                  <p className="text-gray-400">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-white">Is there a setup fee?</h3>
                  <p className="text-gray-400">No setup fees, ever. What you see is what you pay.</p>
                </LiquidGlassCard>
              </div>

              <div className="space-y-4">
                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-white">Do you offer refunds?</h3>
                  <p className="text-gray-400">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-white">What about data security?</h3>
                  <p className="text-gray-400">Your data is protected with enterprise-grade security, encryption, and regular backups.</p>
                </LiquidGlassCard>

                <LiquidGlassCard className="p-6">
                  <h3 className="font-semibold text-lg mb-2 text-white">Need a custom plan?</h3>
                  <p className="text-gray-400">Contact us for custom enterprise solutions tailored to your specific needs.</p>
                </LiquidGlassCard>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 relative">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
            <LiquidGlassCard className="relative p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <BorderTrail
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                size={100}
                duration={8}
              />
              <TextShimmer className="text-3xl font-bold mb-4" duration={2}>
                Ready to Transform Your Freelance Business?
              </TextShimmer>
              <p className="text-xl mb-8 text-gray-300">
                Join thousands of successful freelancers using KAZI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}