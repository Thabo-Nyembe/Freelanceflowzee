'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
      'Access 4 premium AI models (GPT-4o, Claude, DALL-E, Google AI) for instant content generation across creative fields.',
    icon: Brain,
    href: '/dashboard/ai-create',
    color: 'from-purple-500 to-purple-700',
  },
  {
    title: 'Universal Pinpoint Feedback',
    description:
      'Revolutionary multi-media commenting on images, videos, PDFs, and code with AI analysis and voice notes.',
    icon: MessageSquare,
    href: '/dashboard/collaboration',
    color: 'from-pink-500 to-pink-700',
  },
  {
    title: 'Professional Video Studio',
    description:
      'Complete video editing with AI transcription, screen recording, timestamp comments, and client collaboration.',
    icon: Video,
    href: '/dashboard/video-studio',
    color: 'from-red-500 to-red-700',
  },
  {
    title: 'Multi-Cloud Storage System',
    description:
      'Enterprise storage with 70% cost savings through intelligent Supabase + Wasabi routing and version control.',
    icon: Cloud,
    href: '/dashboard/files-hub',
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    title: 'Secure Escrow Payments',
    description:
      'Milestone-based payment protection with Stripe integration, automated invoicing, and global processing.',
    icon: Shield,
    href: '/dashboard/escrow',
    color: 'from-blue-500 to-blue-700',
  },
  {
    title: 'Real-Time Collaboration',
    description:
      'Live multi-user editing with cursor tracking, instant messaging, presence indicators, and conflict resolution.',
    icon: Users,
    href: '/dashboard/collaboration',
    color: 'from-green-500 to-green-700',
  },
  {
    title: 'Creator Community Hub',
    description:
      'Connect with 2,800+ verified creators through marketplace, social wall, and professional networking.',
    icon: Globe,
    href: '/dashboard/community',
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    title: 'AI Daily Planning',
    description:
      'Intelligent task management with productivity optimization, time estimates, and automated scheduling.',
    icon: Calendar,
    href: '/dashboard/my-day',
    color: 'from-orange-500 to-orange-700',
  },
  {
    title: 'Professional Invoicing',
    description:
      'Automated invoice generation with multiple templates, tax calculations, and comprehensive financial tracking.',
    icon: DollarSign,
    href: '/dashboard/financial-hub',
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    title: 'Advanced Analytics Suite',
    description:
      'Real-time business intelligence with revenue tracking, cost optimization, and performance predictions.',
    icon: Zap,
    href: '/dashboard/analytics',
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

  const handleStartRevolution = () => {
    toast.success('🚀 Join the Creative Revolution', {
      description: 'Creating account - access all enterprise features'
    })
    setTimeout(() => {
      router.push('/signup')
    }, 1500)
  }

  const handleViewPricing = () => {
    toast.success('💎 Enterprise Pricing', {
      description: 'Loading pricing tiers and feature comparison'
    })
    setTimeout(() => {
      router.push('/pricing')
    }, 1500)
  }

  const handleFeatureClick = (title: string, href: string) => {
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
      {/* Premium Scroll Progress */}
      <ScrollProgress position="top" height={3} showPercentage={true} />

      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" />
      <ParallaxScroll speed={0.3} direction="down">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      </ParallaxScroll>
      <ParallaxScroll speed={0.4} direction="up">
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </ParallaxScroll>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container py-12 md:py-20 relative">
        <ScrollReveal variant="blur" duration={0.8}>
          <div className="mx-auto max-w-3xl text-center">
            <TextShimmer className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6" duration={2}>
              Enterprise Features for{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Modern Creatives
              </span>
            </TextShimmer>
            <p className="mt-6 text-lg text-gray-300">
              KAZI provides a complete suite of enterprise-grade tools including multi-model AI studio,
              universal feedback systems, real-time collaboration, and secure payment processing.
              Built for professionals who demand the best.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button onClick={handleStartRevolution} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Revolution
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={handleViewPricing} variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800">
                Enterprise Pricing
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              variant="slide-up"
              delay={index * 0.1}
              duration={0.5}
            >
              <div
                onClick={() => handleFeatureClick(feature.title, feature.href)}
                className="relative group cursor-pointer h-full"
              >
                <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                <LiquidGlassCard className="relative h-full">
                  <BorderTrail className={`bg-gradient-to-r ${feature.color}`} size={60} duration={8} />
                  <div className="p-6">
                    <div
                      className={`rounded-lg p-2.5 inline-block bg-gradient-to-r ${feature.color} bg-opacity-20`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-gray-400">{feature.description}</p>
                    <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </LiquidGlassCard>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA Section with Scroll Reveal */}
        <ScrollReveal variant="scale" delay={0.2} duration={0.6}>
          <div className="mt-20 relative">
            <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-40" />
            <LiquidGlassCard className="relative">
              <BorderTrail className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" size={100} duration={10} />
              <div className="p-12 text-center">
                <TextShimmer className="text-3xl font-bold mb-4" duration={2}>
                  Ready to Transform Your Creative Business?
                </TextShimmer>
                <p className="mt-4 text-lg text-gray-300">
                  Join thousands of successful freelancers using KAZI
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Button onClick={handleStartRevolution} size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button onClick={handleScheduleDemo} size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
