'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { 
  Check, 
  Star, 
  Users, 
  Crown, 
  Zap, 
  Shield,
  ChevronRight,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Rocket
} from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for individual creators getting started',
    badge: 'Most Popular',
    badgeColor: 'bg-green-500',
    features: [
      '3 active projects',
      '5GB storage',
      'Basic client feedback',
      'Email support',
      'Mobile app access',
      'Basic analytics',
      'Standard templates'
    ],
    limitations: [
      'No custom branding',
      'Limited integrations',
      'Basic support only'
    ],
    cta: 'Start Free',
    ctaVariant: 'outline' as const,
    icon: Users,
    popular: true
  },
  {
    name: 'Professional',
    price: 19,
    period: 'month',
    description: 'Everything you need to scale your creative business',
    badge: 'Best Value',
    badgeColor: 'bg-blue-500',
    features: [
      'Unlimited projects',
      '100GB storage',
      'Advanced feedback system',
      'Priority support',
      'Custom branding',
      'Advanced analytics',
      'All templates',
      'Client portal',
      'Team collaboration',
      'API access',
      'Integrations'
    ],
    limitations: [],
    cta: 'Start 14-day Trial',
    ctaVariant: 'default' as const,
    icon: Crown,
    popular: false
  },
  {
    name: 'Enterprise',
    price: 49,
    period: 'month',
    description: 'Advanced features for teams and agencies',
    badge: 'Enterprise',
    badgeColor: 'bg-purple-500',
    features: [
      'Everything in Professional',
      'Unlimited storage',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SSO authentication',
      'Team management',
      'Advanced workflows',
      'Custom analytics',
      'SLA guarantee'
    ],
    limitations: [],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
    icon: Rocket,
    popular: false
  }
]

const features = [
  {
    category: 'Project Management',
    items: [
      { name: 'Active Projects', starter: '3', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Storage Space', starter: '5GB', pro: '100GB', enterprise: 'Unlimited' },
      { name: 'File Types', starter: 'Basic', pro: 'All formats', enterprise: 'All formats' },
      { name: 'Collaboration Tools', starter: 'Basic', pro: 'Advanced', enterprise: 'Enterprise' }
    ]
  },
  {
    category: 'Client Features',
    items: [
      { name: 'Client Feedback', starter: 'Basic', pro: 'Advanced', enterprise: 'Enterprise' },
      { name: 'Client Portal', starter: '❌', pro: '✅', enterprise: '✅' },
      { name: 'Custom Branding', starter: '❌', pro: '✅', enterprise: 'White-label' },
      { name: 'Client Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' }
    ]
  },
  {
    category: 'Support & Security',
    items: [
      { name: 'Support Level', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
      { name: 'Response Time', starter: '48 hours', pro: '24 hours', enterprise: '4 hours' },
      { name: 'Security Features', starter: 'Basic', pro: 'Advanced', enterprise: 'Enterprise' },
      { name: 'SLA Guarantee', starter: '❌', pro: '❌', enterprise: '99.9%' }
    ]
  }
]

const faqs = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, and at the next billing cycle for downgrades.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay via bank transfer.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! Professional and Enterprise plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'You can export all your data before canceling. We keep your data for 90 days after cancellation in case you want to reactivate.'
  },
  {
    question: 'Do you offer discounts for nonprofits?',
    answer: 'Yes! We offer 50% discounts for verified nonprofit organizations. Contact us for more information.'
  }
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const getPrice = (price: number) => {
    if (price === 0) return 'Free'
    const finalPrice = isAnnual ? Math.round(price * 0.8) : price
    return `$${finalPrice}`
  }

  const getPeriod = (period: string) => {
    if (period === 'forever') return ''
    return isAnnual ? '/year' : '/month'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <Badge className="mb-6 bg-indigo-100 text-indigo-800 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Choose the perfect plan for your creative business
              </Badge>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Simple, Transparent
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Pricing</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Start free and scale as you grow. No hidden fees, no surprises.
                Cancel anytime with no questions asked.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center mb-12">
                <span className={`mr-3 ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAnnual ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAnnual ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`ml-3 ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  Annual
                </span>
                {isAnnual && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    Save 20%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 -mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                    plan.popular ? 'ring-2 ring-indigo-500 scale-105' : 'hover:scale-105'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center py-2 text-sm font-medium">
                      <Star className="w-4 h-4 inline mr-1" />
                      {plan.badge}
                    </div>
                  )}
                  
                  <CardHeader className={plan.popular ? 'pt-12' : 'pt-6'}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <plan.icon className="w-8 h-8 text-indigo-600 mr-3" />
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      </div>
                      {!plan.popular && plan.badge && (
                        <Badge className={`${plan.badgeColor} text-white`}>
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {getPrice(plan.price)}
                      </span>
                      <span className="text-gray-600 ml-1">
                        {getPeriod(plan.period)}
                      </span>
                      {isAnnual && plan.price > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Save ${plan.price * 12 - Math.round(plan.price * 0.8) * 12} annually
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                      {plan.description}
                    </p>
                    
                    <Link href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'}>
                      <Button 
                        className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : ''}`}
                        variant={plan.ctaVariant}
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Compare All Features
              </h2>
              <p className="text-lg text-gray-600">
                Detailed comparison of what's included in each plan
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 bg-indigo-50">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((category, categoryIndex) => (
                    <>
                      <tr key={category.category} className="bg-gray-100">
                        <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900 bg-gray-100">
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item, itemIndex) => (
                        <tr key={item.name} className={itemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-600">{item.starter}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-900 bg-indigo-50 font-medium">{item.pro}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-600">{item.enterprise}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to know about our pricing
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Creative Workflow?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of creatives who trust FreeflowZee with their projects
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Today
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                  Watch Demo
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-indigo-200 mt-6">
              No credit card required • Cancel anytime • 14-day free trial
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 