import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SiteFooter } from '@/components/marketing/site-footer'
import { HeroBeam } from '@/components/marketing/hero-beam'
import { ClientNav } from '@/components/marketing/client-nav'
import { Hero3DWrapper } from '@/components/marketing/hero-3d-wrapper'
import { FeaturesSection } from '@/components/marketing/features-section'
import { StatsSection } from '@/components/marketing/stats-section'
import { TestimonialsSection } from '@/components/marketing/testimonials-section'
import { CTASection } from '@/components/marketing/cta-section'
import {
  ArrowRight,
  Play,
  Star,
  Sparkles,
} from 'lucide-react'

// Lazy load below-the-fold client components
const VideoDemoSection = dynamic(
  () => import('@/components/marketing/video-demo-section').then(mod => ({ default: mod.VideoDemoSection })),
  { ssr: true, loading: () => <div className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 min-h-[600px]" /> }
)

const PricingComparisonTable = dynamic(
  () => import('@/components/marketing/pricing-comparison-table').then(mod => ({ default: mod.PricingComparisonTable })),
  { ssr: true, loading: () => <div className="w-full max-w-4xl mx-auto h-[400px] bg-white dark:bg-slate-900 rounded-2xl animate-pulse" /> }
)

const SocialProofSection = dynamic(
  () => import('@/components/marketing/social-proof-section').then(mod => ({ default: mod.SocialProofSection })),
  { ssr: true, loading: () => <div className="py-10 bg-white dark:bg-gray-900 h-24" /> }
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:bg-none dark:bg-gray-900 relative overflow-x-hidden">
      {/* Navigation - Client Component for interactivity */}
      <ClientNav />

      {/* Hero Section - Server rendered for fast LCP */}
      <HeroBeam className="w-full min-h-[50rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content - Pure server rendered for fast LCP */}
            <div className="text-left">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-6 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 backdrop-blur-sm px-4 py-2"
                  role="status"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-blue-500" />
                  Trusted by 25,000+ Professionals
                </Badge>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
                <span className="flex flex-wrap justify-start text-slate-900 dark:text-white">More Features. Less Cost.</span>
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Zero Compromises.
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed">
                Why pay for Monday, Jasper, and Loom separately? KAZI gives you AI content creation,
                video studio, escrow payments, and project management in one unified workspace for just $29/mo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 !text-white hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 h-auto shadow-2xl shadow-blue-900/20 transition-all hover:scale-105"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/demo-features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 h-auto border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50 backdrop-blur-sm"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200" />
                  ))}
                </div>
                <div className="flex gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <span>from 500+ reviews</span>
              </div>
            </div>

            {/* Right Visual - 3D Card (lazy loaded via client wrapper) */}
            <Hero3DWrapper />
          </div>
        </div>
      </HeroBeam>

      {/* Video Demo Section - Client Component */}
      <VideoDemoSection />

      {/* Stats Section - Client Component */}
      <StatsSection />

      {/* Comparison Section - Server rendered */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Stop Paying the "subscription tax"
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              You could spend $117+ a month piecing together tools, or just $29 with KAZI.
              See exactly what you're paying for.
            </p>
          </div>
          <PricingComparisonTable />
        </div>
      </section>

      {/* Social Proof Marquee - Client Component */}
      <SocialProofSection />

      {/* Features Grid - Client Component */}
      <section
        className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden"
        aria-labelledby="features-heading"
        role="region"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              role="status"
              aria-label="Powerful Features section"
            >
              Powerful Features
            </Badge>
            <h2 id="features-heading" className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From AI-powered content creation to secure payments, KAZI has every tool you need to run a successful creative business.
            </p>
          </div>
        </div>
        <FeaturesSection />
      </section>

      {/* Testimonials - Client Component */}
      <TestimonialsSection />

      {/* Final CTA - Client Component */}
      <CTASection />

      <SiteFooter />
    </div>
  )
}
