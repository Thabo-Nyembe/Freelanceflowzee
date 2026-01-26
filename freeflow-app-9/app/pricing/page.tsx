'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CheckCircle, Sparkles, Zap, Crown, Shield, Lock, Award, ArrowRight, Menu } from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
              aria-label="KAZI Homepage"
            >
              <Sparkles className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KAZI
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8" role="menubar">
              <Link
                href="/features"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-label="View all features"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-current="page"
                aria-label="Pricing - Current page"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-label="Read our blog"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-label="Contact us"
              >
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4" role="group" aria-label="Account actions">
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Log in to your account"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup" className="hidden sm:block">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Start your free trial"
                >
                  Start Free Trial
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-white">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link
                      href="/features"
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Features
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-lg font-medium text-gray-900 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/blog"
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                    <Link
                      href="/contact"
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Contact
                    </Link>
                    <Separator className="my-4" />
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        Start Free Trial
                      </Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20" aria-labelledby="pricing-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-purple-50 text-purple-700"
              role="status"
              aria-label="Simple, Transparent Pricing"
            >
              Simple, Transparent Pricing
            </Badge>
            <h1
              id="pricing-hero-heading"
              className="text-5xl sm:text-6xl font-bold tracking-tight mb-6"
            >
              Pricing That Grows
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                With Your Business
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Start free, upgrade when you're ready. No contracts, no hidden fees, and cancel anytime. Join 25,000+ professionals who've streamlined their workflow.
            </p>

            {/* Billing Toggle */}
            <div
              className="inline-flex items-center p-1 bg-gray-100 rounded-full"
              role="group"
              aria-label="Select billing period"
            >
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={billingPeriod === 'monthly'}
                aria-label="Switch to monthly billing"
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-pressed={billingPeriod === 'annual'}
                aria-label="Switch to annual billing - Save 20%"
              >
                Annual
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-700 text-xs"
                  aria-hidden="true"
                >
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20"
            role="list"
            aria-label="Pricing plans"
          >
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
                  plan.popular
                    ? 'border-2 border-blue-600 shadow-2xl scale-105'
                    : 'border-2 border-gray-200 hover:border-blue-600 hover:shadow-xl transition-all'
                }`}
                role="listitem"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1"
                      role="status"
                      aria-label="Most popular plan"
                    >
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-4`}
                    aria-hidden="true"
                  >
                    <plan.icon className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6" role="status" aria-label={`Price: ${plan.price}${plan.period || ''}`}>
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Separator aria-hidden="true" />
                  <ul className="space-y-3" role="list" aria-label={`${plan.name} plan features`}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3" role="listitem">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link href={plan.href} className="w-full">
                    <Button
                      className={`w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      aria-label={`${plan.cta} - ${plan.name} plan for ${plan.price}${plan.period || ''}`}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Trust Badges */}
          <div
            className="flex flex-wrap justify-center gap-8 mb-20"
            role="region"
            aria-label="Security and trust badges"
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-600"
                role="status"
                aria-label={badge.label}
              >
                <badge.icon className="w-5 h-5 text-green-600" aria-hidden="true" />
                <span className="font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white" aria-labelledby="faq-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-50 text-blue-700"
              role="status"
            >
              Got Questions?
            </Badge>
            <h2
              id="faq-heading"
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about KAZI pricing
            </p>
          </div>

          <div
            className="grid md:grid-cols-2 gap-6"
            role="list"
            aria-label="Frequently asked questions"
          >
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border-2 hover:border-blue-600 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                role="listitem"
              >
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
      <section
        className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
        aria-labelledby="cta-heading"
        role="region"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            id="cta-heading"
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            role="group"
            aria-label="Call to action buttons"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                aria-label="Start your free 14-day trial - No credit card required"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
                aria-label="Contact our sales team for custom plans"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-white/80 mt-6 text-sm" role="status">
            30-day money-back guarantee • Cancel anytime • No hidden fees
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" role="contentinfo" aria-label="Site footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" aria-hidden="true" />
                <span className="text-xl font-bold">KAZI</span>
              </div>
              <p className="text-gray-400">
                All-in-one workspace for freelancers and agencies
              </p>
            </div>

            <nav aria-label="Product links">
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2" role="list">
                <li><Link href="/features" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Features</Link></li>
                <li><Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Pricing</Link></li>
                <li><Link href="/demo-features" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Demo</Link></li>
              </ul>
            </nav>

            <nav aria-label="Resource links">
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2" role="list">
                <li><Link href="/blog" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Blog</Link></li>
                <li><Link href="/docs" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Docs</Link></li>
                <li><Link href="/tutorials" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Tutorials</Link></li>
              </ul>
            </nav>

            <nav aria-label="Company links">
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2" role="list">
                <li><Link href="/contact" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Contact</Link></li>
                <li><Link href="/signup" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Sign Up</Link></li>
                <li><Link href="/login" className="block text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-1">Login</Link></li>
              </ul>
            </nav>
          </div>

          <Separator className="bg-gray-800 mb-8" aria-hidden="true" />

          <div className="text-center text-gray-400" role="contentinfo">
            <p>© 2025 KAZI. Built in South Africa 🇿🇦 • Serving 40+ Countries Worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
