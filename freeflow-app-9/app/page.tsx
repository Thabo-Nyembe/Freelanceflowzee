'use client'

import Link from 'next/link'
import React, { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ErrorBoundary } from "@/components/error-boundary"
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { ParallaxScroll } from '@/components/ui/parallax-scroll'
import {
  Zap,
  Upload,
  Target,
  Brain,
  Shield,
  CheckCircle,
  Star,
  Globe,
  ArrowRight,
  Play,
  Video,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react'

const features = [
  {
    title: 'Multi-Model AI Studio',
    description: 'Access 4 premium AI models (GPT-4o, Claude, DALL-E, Google AI) for instant content generation across creative fields.',
    icon: Brain,
    href: '/dashboard/ai-create',
    color: 'from-purple-500 to-purple-700'
  },
  {
    title: 'Professional Video Studio',
    description: 'Complete video editing with AI transcription, screen recording, timestamp comments, and client collaboration.',
    icon: Video,
    href: '/dashboard/video-studio',
    color: 'from-red-500 to-red-700'
  },
  {
    title: 'Universal Pinpoint Feedback',
    description: 'Revolutionary multi-media commenting on images, videos, PDFs, and code with AI analysis and voice notes.',
    icon: MessageSquare,
    href: '/dashboard/collaboration',
    color: 'from-pink-500 to-pink-700'
  },
  {
    title: 'Secure Escrow Payments',
    description: 'Milestone-based payment protection with Stripe integration, automated invoicing, and global processing.',
    icon: Shield,
    href: '/dashboard/escrow',
    color: 'from-blue-500 to-blue-700'
  },
  {
    title: 'AI Daily Planning',
    description: 'Intelligent task management with productivity optimization, time estimates, and automated scheduling.',
    icon: Calendar,
    href: '/dashboard/my-day',
    color: 'from-orange-500 to-orange-700'
  },
  {
    title: 'Multi-Cloud Storage System',
    description: 'Enterprise storage with 70% cost savings through intelligent Supabase + Wasabi routing and version control.',
    icon: Upload,
    href: '/dashboard/files-hub',
    color: 'from-cyan-500 to-cyan-700'
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Live multi-user editing with cursor tracking, instant messaging, presence indicators, and conflict resolution.',
    icon: Users,
    href: '/dashboard/collaboration',
    color: 'from-green-500 to-green-700'
  },
  {
    title: 'Professional Invoicing',
    description: 'Automated invoice generation with multiple templates, tax calculations, and comprehensive financial tracking.',
    icon: DollarSign,
    href: '/dashboard/financial-hub',
    color: 'from-emerald-500 to-emerald-700'
  },
  {
    title: 'Client Zone Galleries',
    description: 'Professional client portals with secure file access, watermarked previews, and approval workflows.',
    icon: FileText,
    href: '/dashboard/client-zone',
    color: 'from-yellow-500 to-yellow-700'
  }
]

const stats = [
  { value: '25,000+', label: 'Active Users', subtext: 'Growing community' },
  { value: '40+', label: 'Countries', subtext: 'Global reach' },
  { value: '4.9/5', label: 'User Rating', subtext: '2,500+ reviews' },
  { value: '99.9%', label: 'Uptime', subtext: 'Always available' }
]

const testimonials = [
  {
    quote: "Kazi transformed our workflow—saving us hours and ensuring timely payments.",
    author: "Sarah Jones",
    company: "Creative Co.",
    rating: 5
  },
  {
    quote: "Payments are lightning-fast. Kazi's integrated workspace is exceptional.",
    author: "Liam O'Reilly",
    company: "Freelance Designer",
    rating: 5
  }
]

const trustedBy = [
  "TechCrunch", "Product Hunt", "Forbes", "Wired", "Business Insider", "VentureBeat"
]

export default function Home() {
  const router = useRouter()

  // Handler: Start Free Trial (Hero Section)
  const handleStartFreeTrial = () => {
    toast.success('Starting your free trial!')
    setTimeout(() => {
      alert(`🎉 Welcome to KAZI!\n\nNext Steps:\n• Create your account in seconds\n• Explore the dashboard and features\n• Set up your first project\n• Invite team members to collaborate\n• Access all premium features for 14 days\n• No credit card required during trial`)
    }, 500)
    setTimeout(() => {
      router.push('/signup')
    }, 2000)
  }

  // Handler: Watch Demo (Hero Section)
  const handleWatchDemo = () => {
    toast.success('Loading demo video...')
    setTimeout(() => {
      alert(`🎬 KAZI Platform Demo\n\nWhat You'll See:\n• Complete platform walkthrough\n• Real-world use cases and workflows\n• AI-powered features in action\n• Team collaboration demonstrations\n• Payment and invoicing flows\n• Tips from power users`)
    }, 500)
    setTimeout(() => {
      router.push('/dashboard/video-studio')
    }, 2000)
  }

  // Handler: Feature Card Clicks
  const handleFeatureClick = (name: string, href: string) => {
    toast.success(`Opening ${name}...`)
    setTimeout(() => {
      alert(`✨ ${name}\n\nExplore:\n• Live demonstration\n• Interactive tools and features\n• Real-world use cases\n• Workflow examples\n• Integration capabilities\n• Try it now for free`)
    }, 500)
    setTimeout(() => {
      router.push(href)
    }, 2000)
  }

  // Handler: Get Started (CTA Section)
  const handleGetStarted = () => {
    toast.success("Let's get you started!")
    setTimeout(() => {
      alert(`🚀 Getting Started with KAZI\n\nNext Steps:\n• Sign up for free account\n• Choose your plan (Starter is free forever)\n• Complete onboarding in 3 minutes\n• Start creating and collaborating\n• Upgrade anytime to unlock more features`)
    }, 500)
    setTimeout(() => {
      router.push('/signup')
    }, 2000)
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark">
      {/* Premium Scroll Progress */}
      <ScrollProgress position="top" height={3} showPercentage={false} />
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/kazi-brand/logo.svg" 
                alt="KAZI" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold kazi-text-primary kazi-headline">KAZI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="nav-item kazi-body-medium">Features</Link>
              <Link href="/pricing" className="nav-item kazi-body-medium">Pricing</Link>
              <Link href="/demo-features" className="nav-item kazi-body-medium">Demo</Link>
              <Link href="/login" className="btn-kazi-secondary px-4 py-2">Login</Link>
              <Link href="/signup" className="btn-kazi-primary px-4 py-2">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Kazi",
            "description": "All-in-one workspace for freelancers and agencies with AI content creation, secure payments, and project management",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "2500"
            },
            "creator": {
              "@type": "Organization",
              "name": "Kazi",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "ZA"
              }
            }
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden kazi-fade-in pt-16">
        {/* Pattern Craft Background with Parallax */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" />
        <ParallaxScroll speed={0.3} direction="down">
          <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        </ParallaxScroll>
        <ParallaxScroll speed={0.4} direction="up">
          <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </ParallaxScroll>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <ScrollReveal variant="blur" duration={0.8}>
            <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-violet-bolt/10 dark:bg-violet-bolt/20 rounded-full kazi-text-primary text-sm font-medium mb-8 kazi-hover-scale">
              <Globe className="w-4 h-4 mr-2" />
              <span className="kazi-body-medium">Built in Africa. Engineered for the World.</span>
            </div>

            <TextShimmer className="text-5xl md:text-7xl font-bold mb-6" duration={2}>
              Forget 6 tools. <span className="kazi-text-primary">Use one.</span>
            </TextShimmer>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 kazi-body">
              Create, collaborate, manage projects, and handle payments—all beautifully integrated in one elegant workspace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleStartFreeTrial} className="btn-kazi-primary kazi-ripple kazi-focus">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button onClick={handleWatchDemo} className="btn-kazi-secondary kazi-ripple kazi-focus">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-white dark:bg-jet-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
              Still Juggling Multiple Tools?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto kazi-body">
              Stop switching between Slack, Figma, Stripe, Dropbox, and more. Kazi integrates everything you need in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="kazi-fade-in">
              <h3 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light mb-6 kazi-headline">
                One Platform. Infinite Possibilities.
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 kazi-body">
                Kazi integrates everything—AI content creation, project management, secure escrow payments—in one intuitive platform, enhancing productivity and cash flow.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 kazi-text-accent mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 kazi-body">Reduce tool switching by 80%</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 kazi-text-accent mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 kazi-body">Streamline payments and invoicing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 kazi-text-accent mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 kazi-body">Boost team productivity</span>
                </div>
              </div>
            </div>
            <div className="relative kazi-hover-scale">
              <div className="kazi-gradient-primary rounded-lg p-8 text-white text-center shadow-2xl">
                <p className="text-lg kazi-body-medium" style={{ color: '#F8F7F4' }}>Kazi Dashboard Preview</p>
                <div className="mt-4 text-sm opacity-90" style={{ color: '#F8F7F4' }}>
                  All-in-one workspace for modern teams
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 kazi-bg-light dark:kazi-bg-dark relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <TextShimmer className="text-4xl font-bold mb-6" duration={2}>
              Everything You Need in One Place
            </TextShimmer>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto kazi-body">
              Powerful features designed for modern freelancers, agencies, and creative teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} variant="slide-up" delay={index * 0.1} duration={0.5}>
                <div className="relative kazi-hover-scale h-full">
                  <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-30" />
                  <LiquidGlassCard className="relative h-full">
                    <BorderTrail className={`bg-gradient-to-r ${feature.color}`} size={60} duration={8} />
                    <div className="p-6">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} bg-opacity-20 rounded-lg flex items-center justify-center mb-4`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 kazi-headline">{feature.title}</h3>
                      <p className="text-gray-300 mb-4 kazi-body">{feature.description}</p>
                      <button onClick={() => handleFeatureClick(feature.title, feature.href)} className={`bg-gradient-to-r ${feature.color} hover:opacity-90 text-white w-full py-2 px-4 rounded-lg transition-all duration-300 kazi-ripple kazi-focus`}>
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4 inline" />
                      </button>
                    </div>
                  </LiquidGlassCard>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators & Stats */}
      <section className="py-20 bg-white dark:bg-jet-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <TextShimmer className="text-4xl font-bold mb-6" duration={2}>
              Trusted by Leading Global Brands
            </TextShimmer>
            <p className="text-xl text-gray-600 dark:text-gray-300 kazi-body">
              Startups, agencies, and freelancers worldwide choose Kazi
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <LiquidGlassCard key={index} className="text-center kazi-hover-scale p-6">
                <div className="text-4xl font-bold text-blue-400 mb-2 kazi-headline">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white kazi-body-medium">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400 kazi-body">
                  {stat.subtext}
                </div>
              </LiquidGlassCard>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 kazi-body">Featured In</p>
            <div className="flex flex-wrap justify-center gap-8">
              {trustedBy.map((brand, index) => (
                <span key={index} className="text-gray-600 dark:text-gray-300 font-medium kazi-body-medium kazi-hover-scale">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-violet-bolt/5 dark:bg-violet-bolt/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <TextShimmer className="text-4xl font-bold mb-6" duration={2}>
              What Our Users Say
            </TextShimmer>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative kazi-hover-scale">
                <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur opacity-30" />
                <LiquidGlassCard className="relative">
                  <BorderTrail className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" size={60} duration={6} />
                  <div className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-gray-300 mb-6 kazi-body">
                      "{testimonial.quote}"
                    </blockquote>
                    <cite className="text-white font-semibold kazi-body-medium">
                      — {testimonial.author}, {testimonial.company}
                    </cite>
                  </div>
                </LiquidGlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 kazi-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 kazi-headline" style={{ color: '#F8F7F4' }}>
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto kazi-body" style={{ color: '#F8F7F4', opacity: 0.9 }}>
            Join thousands of freelancers and agencies who've streamlined their work with Kazi
          </p>
          <button onClick={handleGetStarted} className="bg-soft-ivory kazi-text-primary hover:bg-white px-8 py-4 text-lg font-semibold rounded-lg kazi-ripple kazi-focus kazi-hover-scale transition-all duration-300">
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5 inline" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="kazi-bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/kazi-brand/logo.svg" 
                  alt="KAZI" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold kazi-text-primary kazi-headline">KAZI</span>
              </div>
              <p className="text-gray-300 kazi-body">
                All-in-one workspace for freelancers and agencies
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 kazi-headline">Product</h3>
              <div className="space-y-2">
                <Link href="/features" className="block text-gray-300 hover:text-white kazi-body">Features</Link>
                <Link href="/pricing" className="block text-gray-300 hover:text-white kazi-body">Pricing</Link>
                <Link href="/demo-features" className="block text-gray-300 hover:text-white kazi-body">Demo</Link>
                <Link href="/dashboard" className="block text-gray-300 hover:text-white kazi-body">Dashboard</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 kazi-headline">Resources</h3>
              <div className="space-y-2">
                <Link href="/blog" className="block text-gray-300 hover:text-white kazi-body">Blog</Link>
                <Link href="/docs" className="block text-gray-300 hover:text-white kazi-body">Documentation</Link>
                <Link href="/tutorials" className="block text-gray-300 hover:text-white kazi-body">Tutorials</Link>
                <Link href="/community" className="block text-gray-300 hover:text-white kazi-body">Community</Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 kazi-headline">Company</h3>
              <div className="space-y-2">
                <Link href="/contact" className="block text-gray-300 hover:text-white kazi-body">Contact</Link>
                <Link href="/signup" className="block text-gray-300 hover:text-white kazi-body">Sign Up</Link>
                <Link href="/login" className="block text-gray-300 hover:text-white kazi-body">Login</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-300 kazi-body">
              Proudly engineered in South Africa • Serving freelancers, startups, and creative teams in 40+ countries worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
          </ErrorBoundary>
      </Suspense>
    )
  }