import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section
      className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden"
      aria-labelledby="final-cta-heading"
      role="region"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
        aria-hidden="true"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 id="final-cta-heading" className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Streamline Your Workflow?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Join 25,000+ professionals who've ditched the app chaos. Start your free trial today—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label="Call to action buttons">
          <Link href="/signup">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-2xl focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              aria-label="Start your free 14-day trial - No credit card required"
              style={{ backgroundColor: '#ffffff', color: '#2563eb' }}
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
              aria-label="View pricing plans and features"
            >
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="text-white/80 mt-6 text-sm" role="status">
          ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
        </p>
      </div>
    </section>
  )
}
