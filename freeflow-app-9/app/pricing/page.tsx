import { Metadata } from 'next'
import { Zap, Crown, Sparkles } from 'lucide-react'
import { PricingCard } from '@/components/pricing-card'

export const metadata: Metadata = {
  title: 'Pricing | KAZI - Choose Your Perfect Plan',
  description: 'Simple, transparent pricing for freelancers. Start free and scale as you grow with KAZI\'s enterprise features.',
  keywords: 'KAZI pricing, freelance software cost, AI platform pricing, enterprise features'
}

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of successful freelancers using KAZI to build thriving creative businesses 
              with AI-powered tools, universal feedback systems, and secure payment protection.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border">
              <button className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">
                Monthly
              </button>
              <button className="px-6 py-2 rounded-full text-gray-600 text-sm font-medium">
                Annual (Save 20%)
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Can I change plans anytime?</h3>
                  <p className="text-gray-600">Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Is there a setup fee?</h3>
                  <p className="text-gray-600">No setup fees, ever. What you see is what you pay.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">What about data security?</h3>
                  <p className="text-gray-600">Your data is protected with enterprise-grade security, encryption, and regular backups.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Need a custom plan?</h3>
                  <p className="text-gray-600">Contact us for custom enterprise solutions tailored to your specific needs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Freelance Business?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of successful freelancers using FreeFlow
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}