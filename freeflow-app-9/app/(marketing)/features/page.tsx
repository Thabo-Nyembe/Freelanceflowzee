'use client'

import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { EnhancedNavigation } from '@/components/marketing/enhanced-navigation';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { BorderTrail } from '@/components/ui/border-trail';
import { GlowEffect } from '@/components/ui/glow-effect';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ParallaxScroll } from '@/components/ui/parallax-scroll';
import {
  ArrowRight,
  Brain,
  Shield,
  FileText,
  Video,
  Users,
  Globe,
  Calendar,
  MessageSquare,
  DollarSign,
  Cloud,
  Zap,
} from 'lucide-react';

const features = [
  {
    title: 'Multi-Model AI Studio',
    description:
      'Generate content faster with GPT-4o, Claude, DALL-E, and Google AI—all in one place. Write, design, and create without leaving your workspace.',
    icon: Brain,
    href: '/dashboard/ai-create',
    color: 'from-purple-500 to-purple-700',
  },
  {
    title: 'Universal Pinpoint Feedback',
    description:
      'Leave pixel-perfect feedback on any file type. Click, comment, and collaborate with voice notes and AI-powered analysis—no more endless email threads.',
    icon: MessageSquare,
    href: '/dashboard/collaboration-v2',
    color: 'from-pink-500 to-pink-700',
  },
  {
    title: 'Professional Video Studio',
    description:
      'Edit, transcribe, and collaborate on videos in real-time. Screen recording, timestamp comments, and client approval—all built in.',
    icon: Video,
    href: '/dashboard/video-studio-v2',
    color: 'from-red-500 to-red-700',
  },
  {
    title: 'Multi-Cloud Storage System',
    description:
      'Store unlimited files while saving 70% on costs. Intelligent routing between Supabase and Wasabi keeps your data safe and your budget happy.',
    icon: Cloud,
    href: '/dashboard/files-hub-v2',
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    title: 'Secure Escrow Payments',
    description:
      'Get paid on time, every time. Clients fund milestones upfront, you deliver with confidence, and funds release automatically when work is approved.',
    icon: Shield,
    href: '/dashboard/escrow-v2',
    color: 'from-blue-500 to-blue-700',
  },
  {
    title: 'Real-Time Collaboration',
    description:
      'Work together like you\'re in the same room. See live cursors, instant updates, and presence indicators that keep your team in perfect sync.',
    icon: Users,
    href: '/dashboard/collaboration-v2',
    color: 'from-green-500 to-green-700',
  },
  {
    title: 'Creator Community Hub',
    description:
      'Join 2,800+ verified creators. Network, find collaborators, showcase your work on the social wall, and discover opportunities in the marketplace.',
    icon: Globe,
    href: '/dashboard/community-v2',
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    title: 'AI Daily Planning',
    description:
      'Let AI organize your day. Get smart time estimates, productivity insights, and automated scheduling that learns how you actually work.',
    icon: Calendar,
    href: '/dashboard/my-day-v2',
    color: 'from-orange-500 to-orange-700',
  },
  {
    title: 'Professional Invoicing',
    description:
      'Create stunning invoices in seconds. Automatic tracking, tax calculations, and complete financial records—bookkeeping made effortless.',
    icon: DollarSign,
    href: '/dashboard/financial-hub',
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    title: 'Advanced Analytics Suite',
    description:
      'Real-time business intelligence with revenue tracking, cost optimization, and performance predictions.',
    icon: Zap,
    href: '/dashboard/analytics-v2',
    color: 'from-rose-500 to-rose-700',
  },
  {
    title: 'Client Zone Galleries',
    description:
      'Professional client portals with secure file access, watermarked previews, and approval workflows.',
    icon: FileText,
    href: '/dashboard/client-zone',
    color: 'from-yellow-500 to-yellow-700',
  },
];

export default function FeaturesPage() {
  const router = useRouter()
  const pathname = usePathname()

  // Analytics tracking helper
  const trackEvent = async (event: string, label: string, properties?: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties: {
            label,
            pathname,
            ...properties,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  const handleStartRevolution = async () => {
    await trackEvent('button_click', 'Start Revolution - Features Page', { href: '/signup' })
    toast.success('🚀 Join the Creative Revolution', {
      description: 'Creating account - access all enterprise features'
    })
    setTimeout(() => {
      router.push('/signup')
    }, 1500)
  }

  const handleViewPricing = async () => {
    await trackEvent('button_click', 'View Pricing - Features Page', { href: '/pricing' })
    toast.success('💎 Enterprise Pricing', {
      description: 'Loading pricing tiers and feature comparison'
    })
    setTimeout(() => {
      router.push('/pricing')
    }, 1500)
  }

  const handleFeatureClick = async (title: string, href: string) => {
    await trackEvent('feature_click', `Features Page - ${title}`, { href })
    toast.success('✨ Opening ' + title, {
      description: 'Loading feature demonstration'
    })
    setTimeout(() => {
      router.push(href)
    }, 1500)
  }

  const handleScheduleDemo = () => {
    toast.success('📅 Schedule Your Demo', {
      description: 'Opening contact form to schedule your demo'
    })
    setTimeout(() => {
      router.push('/contact')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Enhanced Navigation with Analytics */}
      <EnhancedNavigation />
      {/* Premium Scroll Progress */}
      <ScrollProgress position="top" height={3} showPercentage={true} />

      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <ParallaxScroll speed={0.3} direction="down">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      </ParallaxScroll>
      <ParallaxScroll speed={0.4} direction="up">
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      </ParallaxScroll>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="container py-12 md:py-20 relative">
        <ScrollReveal variant="blur" duration={0.8}>
          <section className="mx-auto max-w-3xl text-center" aria-labelledby="features-hero-heading">
            <h1 id="features-hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              <TextShimmer duration={2}>
                The Only Platform You'll{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ever Need
                </span>
              </TextShimmer>
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Everything from AI content creation to secure payments, video collaboration to project management—all in one place. Stop paying for 6+ tools when KAZI gives you the complete toolkit for half the price.
            </p>
            <div
              className="mt-8 flex justify-center gap-4"
              role="group"
              aria-label="Primary actions"
            >
              <Button
                onClick={handleStartRevolution}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                aria-label="Start your free trial"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                onClick={handleViewPricing}
                variant="outline"
                size="lg"
                className="border-slate-700 text-white hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                aria-label="View pricing plans"
              >
                View Pricing
              </Button>
            </div>
          </section>
        </ScrollReveal>

        <section aria-labelledby="features-grid-heading">
          <h2 id="features-grid-heading" className="sr-only">Platform features</h2>
          <div
            className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Complete list of platform features"
          >
            {features.map((feature, index) => (
              <ScrollReveal
                key={feature.title}
                variant="slide-up"
                delay={index * 0.1}
                duration={0.5}
              >
                <div
                  onClick={() => handleFeatureClick(feature.title, feature.href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleFeatureClick(feature.title, feature.href)
                    }
                  }}
                  className="relative group cursor-pointer h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-2xl"
                  role="button"
                  tabIndex={0}
                  aria-label={`${feature.title}: ${feature.description}`}
                >
                  <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" aria-hidden="true" />
                  <LiquidGlassCard className="relative h-full">
                    <BorderTrail className={`bg-gradient-to-r ${feature.color}`} size={60} duration={8} />
                    <div className="p-6">
                      <div
                        className={`rounded-lg p-2.5 inline-block bg-gradient-to-r ${feature.color} bg-opacity-20`}
                        aria-hidden="true"
                      >
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-gray-400">{feature.description}</p>
                      <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </div>
                  </LiquidGlassCard>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* CTA Section with Scroll Reveal */}
        <ScrollReveal variant="scale" delay={0.2} duration={0.6}>
          <section className="mt-20 relative" aria-labelledby="features-cta-heading">
            <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-40" aria-hidden="true" />
            <LiquidGlassCard className="relative">
              <BorderTrail className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" size={100} duration={10} />
              <div className="p-12 text-center">
                <h2 id="features-cta-heading">
                  <TextShimmer className="text-3xl font-bold mb-4" duration={2}>
                    Ready to Transform Your Creative Business?
                  </TextShimmer>
                </h2>
                <p className="mt-4 text-lg text-gray-300">
                  Join thousands of successful freelancers using KAZI
                </p>
                <div
                  className="mt-8 flex justify-center gap-4"
                  role="group"
                  aria-label="Call to action buttons"
                >
                  <Button
                    onClick={handleStartRevolution}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
                    aria-label="Start your free trial"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Button>
                  <Button
                    onClick={handleScheduleDemo}
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
                    aria-label="Schedule a demo with our team"
                  >
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
