'use client'

import { Metadata } from 'next'
import { generatePageSEO, generateStructuredData, SEO_CONFIG } from '@/lib/seo-optimizer'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Building, 
  Crown,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  Target,
  Globe,
  ChevronRight,
  Calculator,
  DollarSign,
  Percent
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Context7 Pattern: Enhanced SEO for pricing (handled via layout or head)

// Context7 Pattern: Pricing Data with ROI calculations
const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Creator Free',
    price: 0,
    period: 'month',
    description: 'Perfect for creative exploration',
    popular: false,
    features: [
      'AI Create Studio (Free models)',
      'Stable Diffusion XL (unlimited)',
      'Basic design templates',
      'File sharing up to 1GB',
      'Community hub access',
      'Basic project tracker',
      'WeTransfer-style file sharing'
    ],
    limitations: [
      'No premium AI models',
      'No escrow payments',
      'No custom branding',
      'Limited file storage'
    ],
    cta: 'Start Creating Free',
    savings: 0,
    roiCalculator: {
      timesSaved: '5 hours/month',
      moneySaved: '$200/month',
      projectsManaged: '3 projects'
    }
  },
  {
    id: 'professional',
    name: 'Pro Creator',
    price: 29,
    period: 'month',
    description: 'For serious creative professionals',
    popular: true,
    features: [
      'AI Create Studio (All models)',
      'Premium AI model trials (GPT-4o, Claude, DALL-E)',
      'Photography, Video, Design, Music, Writing assets',
      'Unlimited AI asset generation',
      'File sharing up to 500GB',
      'Escrow payment protection',
      'Video Studio Pro access',
      'Custom branding & portfolios',
      'Priority AI processing',
      'Professional client portals',
      'Revenue analytics dashboard',
      'Social media integration'
    ],
    limitations: [
      'Team members (up to 5)',
      'Standard API access'
    ],
    cta: 'Start Free Trial',
    savings: 25,
    roiCalculator: {
      timesSaved: '20 hours/month',
      moneySaved: '$1200/month',
      projectsManaged: 'Unlimited projects'
    }
  },
  {
    id: 'enterprise',
    name: 'Agency Enterprise',
    price: 79,
    period: 'month',
    description: 'For agencies and creative teams',
    popular: false,
    features: [
      'Everything in Pro Creator',
      'Unlimited team members',
      'White-label AI Create Studio',
      'Bulk AI asset generation',
      'Advanced escrow management',
      'Custom AI model training',
      'Enterprise security & compliance',
      'Dedicated account manager',
      'Custom workflow automation',
      'Advanced analytics & reporting',
      'API access for integrations',
      'SSO & team management',
      'Custom training & onboarding'
    ],
    limitations: [],
    cta: 'Contact Sales',
    savings: 30,
    roiCalculator: {
      timesSaved: '60 hours/month',
      moneySaved: '$5000/month',
      projectsManaged: 'Unlimited + full team'
    }
  }
]

// Context7 Pattern: Interactive FAQ data
const FAQ_DATA = [
  {
    question: 'How do the premium AI model trials work?',
    answer: 'Pro users get free trials of expensive premium models like GPT-4o (3 trials), Claude 3.5 Sonnet (3 trials), and DALL-E 3 (2 trials). After trials, you can use your own API keys for unlimited access at cost.'
  },
  {
    question: 'What creative fields does AI Create support?',
    answer: 'AI Create generates assets for 6+ creative fields: Photography (LUTs, presets), Design (templates, mockups), Music (samples, MIDI), Video (transitions, effects), Writing (content, campaigns), and Web Development (components, themes).'
  },
  {
    question: 'How does the escrow payment system work?',
    answer: 'Our escrow system holds client payments securely until project milestones are met. This protects both freelancers and clients, ensuring fair payment and quality delivery.'
  },
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.'
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'All paid plans come with a 14-day free trial with full access to AI Create premium models. No credit card required to start.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied with AI Create or our platform, get a full refund.'
  }
]

// Context7 Pattern: Feature comparison matrix
const FEATURE_COMPARISON = [
  { feature: 'AI Create Studio', starter: 'Free models only', professional: 'All premium models', enterprise: 'Custom AI training' },
  { feature: 'Premium AI Trials', starter: false, professional: 'GPT-4o, Claude, DALL-E', enterprise: 'Unlimited access' },
  { feature: 'Creative Fields', starter: '2 fields', professional: '6+ fields', enterprise: 'All + custom' },
  { feature: 'File Storage', starter: '1GB', professional: '500GB', enterprise: '2TB+' },
  { feature: 'Escrow Payments', starter: false, professional: true, enterprise: 'Advanced' },
  { feature: 'Video Studio', starter: false, professional: 'Pro features', enterprise: 'Enterprise suite' },
  { feature: 'Team Members', starter: '1', professional: '5', enterprise: 'Unlimited' },
  { feature: 'Custom Branding', starter: false, professional: true, enterprise: 'White-label' },
  { feature: 'Analytics', starter: 'Basic', professional: 'Advanced', enterprise: 'Enterprise' },
  { feature: 'Support', starter: 'Community', professional: 'Priority', enterprise: 'Dedicated' }
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [showROI, setShowROI] = useState(false)

  const getPrice = (plan: typeof PRICING_PLANS[0]) => {
    if (plan.price === 0) return 0
    const basePrice = plan.price
    return isAnnual ? Math.round(basePrice * 12 * (1 - plan.savings / 100)) : basePrice
  }

  const getSavings = (plan: typeof PRICING_PLANS[0]) => {
    if (plan.price === 0) return 0
    const monthlyTotal = plan.price * 12
    const annualPrice = getPrice(plan)
    return isAnnual ? monthlyTotal - annualPrice : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      {/* Structured Data for Pricing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData('Product'))
        }}
      />
      
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 bg-indigo-100 text-indigo-800">
            <Star className="w-4 h-4 mr-2" />
            30-Day Money Back Guarantee
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your freelance business. Start free, upgrade as you grow. 
            No hidden fees, no surprises.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-indigo-600"
            />
            <span className={`text-lg font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
              <Percent className="w-4 h-4 mr-1" />
              Save 20%
            </Badge>
          </div>
          
          {/* ROI Calculator Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowROI(!showROI)}
            className="mb-8"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {showROI ? 'Hide' : 'Show'} ROI Calculator
          </Button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative hover:shadow-2xl transition-all duration-300 ${
                  plan.popular 
                    ? 'ring-2 ring-indigo-500 shadow-xl scale-105' 
                    : 'border-gray-200 hover:border-indigo-300'
                } ${selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white px-4 py-1">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price === 0 ? '0' : getPrice(plan)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xl text-gray-500 ml-2">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    
                    {isAnnual && plan.price > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 line-through">
                          ${plan.price * 12}/year
                        </span>
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          Save ${getSavings(plan)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* ROI Calculator Display */}
                  {showROI && (
                    <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-indigo-900 mb-2">Potential ROI</h4>
                      <div className="space-y-1 text-sm text-indigo-700">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Time Saved: {plan.roiCalculator.timesSaved}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Value: {plan.roiCalculator.moneySaved}
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Projects: {plan.roiCalculator.projectsManaged}
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    asChild
                  >
                    <Link href={plan.price === 0 ? '/signup' : '/signup?plan=' + plan.id}>
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <hr className="my-4" />
                        <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-center">
                            <X className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Starter</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Professional</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.starter}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.professional}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {FAQ_DATA.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by 10,000+ Professionals
            </h2>
            <p className="text-xl text-gray-600">
              Join freelancers and agencies who've transformed their business
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: 'Bank-Level Security', value: 'SOC 2 Compliant' },
              { icon: Clock, label: 'Uptime Guarantee', value: '99.9%' },
              { icon: Users, label: 'Happy Customers', value: '10,000+' },
              { icon: Award, label: 'Support Rating', value: '4.9/5' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <Zap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Freelance Business?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of successful freelancers who've already upgraded their workflow. 
              Start free, upgrade anytime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">
                  Watch Demo
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 