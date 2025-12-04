'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Sparkles, Zap, Crown, Shield, Lock, Award, Globe, ArrowRight } from 'lucide-react'

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
    cta: 'Start Free',
    href: '/signup',
    popular: false,
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Everything you need to scale',
    icon: Zap,
    features: [
      'Unlimited projects',
      'Advanced AI (GPT-4o, Claude, DALL-E)',
      '100GB file storage',
      'Video studio with screen recording',
      'Payment processing (2.9%)',
      'Priority support (< 2hr response)',
      'Advanced analytics',
      'Branded client portals',
      'Custom branding & white-label'
    ],
    cta: 'Start 14-Day Free Trial',
    href: '/signup?plan=professional',
    popular: true,
    gradient: 'from-blue-600 to-purple-600'
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'Built for high-performing teams',
    icon: Crown,
    features: [
      'Everything in Professional',
      'Team collaboration (up to 10 users)',
      'Unlimited storage',
      'White-label solution',
      'Advanced security & compliance',
      'Custom integrations & API access',
      'Dedicated account manager',
      'SLA guarantee (99.9% uptime)',
      'Custom AI model training'
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
    gradient: 'from-purple-600 to-pink-600'
  }
]

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately with prorated billing.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees, ever. What you see is what you pay. No hidden costs or surprise charges.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.'
  },
  {
    question: 'What about data security?',
    answer: 'Your data is protected with enterprise-grade security, SSL encryption, and regular backups. We\'re GDPR and SOC 2 compliant.'
  },
  {
    question: 'Need a custom plan?',
    answer: 'Contact us for custom enterprise solutions tailored to your specific needs, including volume discounts and custom features.'
  }
]

const trustBadges = [
  { icon: Lock, label: 'SSL Encrypted' },
  { icon: Shield, label: 'GDPR Compliant' },
  { icon: Award, label: 'SOC 2 Certified' },
  { icon: CheckCircle, label: '30-Day Guarantee' }
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KAZI
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-900 font-semibold">
                Pricing
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-purple-50 text-purple-700">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              Pricing That Grows
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                With Your Business
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Start free, upgrade when you're ready. No contracts, no hidden fees, and cancel anytime. Join 25,000+ professionals who've streamlined their workflow.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-full">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 text-xs">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? 'border-2 border-blue-600 shadow-2xl scale-105'
                    : 'border-2 border-gray-200 hover:border-blue-600 hover:shadow-xl transition-all'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Separator />
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href={plan.href} className="w-full">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 mb-20">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-600">
                <badge.icon className="w-5 h-5 text-green-600" />
                <span className="font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700">
              Got Questions?
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about KAZI pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2 hover:border-blue-600 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-white/80 mt-6 text-sm">
            30-day money-back guarantee • Cancel anytime • No hidden fees
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">KAZI</span>
              </div>
              <p className="text-gray-400">
                All-in-one workspace for freelancers and agencies
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <Link href="/features" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
                <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="/demo-features" className="block text-gray-400 hover:text-white transition-colors">Demo</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="/blog" className="block text-gray-400 hover:text-white transition-colors">Blog</Link>
                <Link href="/docs" className="block text-gray-400 hover:text-white transition-colors">Docs</Link>
                <Link href="/tutorials" className="block text-gray-400 hover:text-white transition-colors">Tutorials</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link href="/signup" className="block text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">Login</Link>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <div className="text-center text-gray-400">
            <p>© 2025 KAZI. Built in South Africa 🇿🇦 • Serving 40+ Countries Worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
