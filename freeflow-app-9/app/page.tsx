'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteFooter } from '@/components/marketing/site-footer'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LiquidGlassCard, LiquidGlassCardHeader, LiquidGlassCardTitle, LiquidGlassCardContent } from '@/components/ui/liquid-glass-card'
import {
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Shield,
  Globe,
  Video,
  Brain,
  MessageSquare,
  Upload,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Sparkles,
  TrendingUp,
  Award,
  Lock,
  Menu,
  X
} from 'lucide-react'
import { PricingComparisonTable } from '@/components/marketing/pricing-comparison-table'

const features = [
  {
    title: 'Multi-Model AI Studio',
    description: 'Generate stunning content in seconds with GPT-4o, Claude, DALL-E, and Google AI. Create copy, images, and designs without leaving your workspace.',
    icon: Brain,
    href: '/dashboard/ai-create-v2',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Professional Video Studio',
    description: 'Edit videos with AI-powered transcription, screen recording, and timestamp comments. Collaborate with clients in real-time.',
    icon: Video,
    href: '/dashboard/video-studio-v2',
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Universal Pinpoint Feedback',
    description: 'Leave precise feedback on any file type—images, videos, PDFs, or code. Add voice notes and AI analysis.',
    icon: MessageSquare,
    href: '/dashboard/collaboration-v2',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Secure Escrow Payments',
    description: 'Protect your income with milestone-based payments. Clients fund upfront, you deliver with confidence.',
    icon: Shield,
    href: '/dashboard/escrow-v2',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'AI Daily Planning',
    description: 'Let AI organize your day. Get smart time estimates, productivity insights, and automated scheduling.',
    icon: Calendar,
    href: '/dashboard/my-day-v2',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Multi-Cloud Storage',
    description: 'Store unlimited files with 70% cost savings. Intelligent routing between Supabase and Wasabi.',
    icon: Upload,
    href: '/dashboard/files-hub-v2',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Work together like you\'re in the same room. See live cursors, instant updates, and presence indicators.',
    icon: Users,
    href: '/dashboard/collaboration-v2',
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Professional Invoicing',
    description: 'Create beautiful invoices in seconds. Track payments automatically and maintain financial records.',
    icon: DollarSign,
    href: '/dashboard/financial-v2',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Client Zone Galleries',
    description: 'Impress clients with branded portals for file delivery. Control access and collect approvals.',
    icon: FileText,
    href: '/dashboard/client-zone',
    gradient: 'from-yellow-500 to-yellow-600'
  }
]

const stats = [
  { value: '25,000+', label: 'Active Users', icon: Users },
  { value: '40+', label: 'Countries', icon: Globe },
  { value: '98%', label: 'Satisfaction', icon: Star },
  { value: '$2.5M+', label: 'Processed', icon: TrendingUp }
]

const testimonials = [
  {
    quote: "KAZI transformed how we work. The Universal Feedback system alone saved us 15 hours per week. Our clients love the professional galleries and real-time collaboration.",
    author: "Sarah Chen",
    role: "Creative Director",
    company: "Design Studio Pro",
    rating: 5,
    metric: "15 hrs/week saved"
  },
  {
    quote: "I was spending $1,100/mo on Upwork fees and tools. KAZI replaced ClickUp, Jasper, and my escrow service for just $29. It's a no-brainer for any serious freelancer.",
    author: "Marcus Rodriguez",
    role: "Agency Owner",
    company: "Digital Collective",
    rating: 5,
    metric: "Saved $12k/year"
  },
  {
    quote: "The AI Video Studio is magic. I can shoot, transcribe, and edit client feedback videos in minutes. My agency revenue grew 60% because I spend less time on admin.",
    author: "Priya Sharma",
    role: "Freelance Videographer",
    company: "Sharma Productions",
    rating: 5,
    metric: "+60% Revenue"
  }
]

const trustBadges = [
  { icon: Lock, label: 'SSL Encrypted' },
  { icon: Shield, label: 'GDPR Compliant' },
  { icon: Award, label: 'SOC 2 Certified' },
  { icon: CheckCircle, label: '30-Day Guarantee' }
]

import dynamic from 'next/dynamic'
import { HeroBeam } from '@/components/marketing/hero-beam';
import { HeroTextReveal } from '@/components/ui/hero-text-reveal'
import { MagneticButton } from '@/components/ui/magnetic-button'

// Dynamic imports for below-the-fold components
const Hero3DCard = dynamic(() => import('@/components/marketing/hero-3d-card').then(mod => ({ default: mod.Hero3DCard })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-800/20 rounded-xl animate-pulse" />
})
const BentoGrid = dynamic(() => import('@/components/ui/bento-grid').then(mod => ({ default: mod.BentoGrid })))
const BentoGridItem = dynamic(() => import('@/components/ui/bento-grid').then(mod => ({ default: mod.BentoGridItem })))
const InfiniteMovingCards = dynamic(() => import('@/components/ui/infinite-moving-cards').then(mod => ({ default: mod.InfiniteMovingCards })))

export default function HomePage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:bg-none dark:bg-gray-900 relative overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:bg-gray-900 focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:font-semibold focus:min-h-[44px] focus:min-w-[44px] focus:flex focus:items-center"
      >
        Skip to main content
      </a>
      {/* Animated Background Blobs Removed - Replaced by AuroraBackground in Hero */}

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
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
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                KAZI
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8" role="menubar">
              <Link
                href="/features"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
                role="menuitem"
                aria-label="View all features"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
                role="menuitem"
                aria-label="View pricing plans"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
                role="menuitem"
                aria-label="Read our blog"
              >
                Blog
              </Link>

              <Link
                href="/contact"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
                role="menuitem"
                aria-label="Contact us"
              >
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  aria-label="Log in to your account"
                  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup" className="hidden sm:block">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                <SheetContent side="right" className="w-[300px] bg-white dark:bg-gray-900">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link
                      href="/features"
                      className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Features
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/blog"
                      className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>

                    <Link
                      href="/contact"
                      className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
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
      </motion.nav>



      {/* Hero Section */}
        <HeroBeam className="w-full min-h-[50rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-left">
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Badge
                  variant="secondary"
                  className="mb-6 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 backdrop-blur-sm px-4 py-2"
                  role="status"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-blue-500" />
                  Trusted by 25,000+ Professionals
                </Badge>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
                <HeroTextReveal text="More Features. Less Cost." className="justify-start text-slate-900 dark:text-white" />
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Zero Compromises.
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed">
                Why pay for Monday, Jasper, and Loom separately? KAZI gives you AI content creation,
                video studio, escrow payments, and project management in one unified workspace for just $29/mo.
              </p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/signup">
                  <MagneticButton>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 !text-white hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 h-auto shadow-2xl shadow-blue-900/20 transition-all hover:scale-105"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </MagneticButton>
                </Link>
                <Link href="/demo-features">
                  <MagneticButton>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 h-auto border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50 backdrop-blur-sm"
                    >
                      <Play className="mr-2 w-5 h-5" />
                      Watch Demo
                    </Button>
                  </MagneticButton>
                </Link>
              </motion.div>

              <motion.div
                className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-medium"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            </div>

            {/* Right Visual - 3D Card */}
            <div className="relative h-[400px] lg:h-[600px] w-full hidden lg:block perspective-1000">
              <Hero3DCard />
              {/* Decorative Gradient Behind Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] -z-10 rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
            </div>
          </div>
        </div>
      </HeroBeam>

      {/* Video Demo Section */}
      <section
        className="py-20 bg-gradient-to-b from-slate-900 to-slate-800"
        aria-labelledby="demo-video-heading"
        role="region"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              <Play className="w-3 h-3 mr-1" />
              Watch Demo
            </Badge>
            <h2 id="demo-video-heading" className="text-4xl sm:text-5xl font-bold text-white mb-4">
              See KAZI in Action
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Watch how KAZI helps you manage projects, track time, and grow your freelance business.
            </p>
          </div>

          {/* Main Demo Video */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-700">
              <video
                controls
                poster="/demo-captures/gallery-projects.jpg"
                className="w-full aspect-video bg-slate-900"
                preload="metadata"
              >
                <source src="/demo-captures/final/01-platform-overview-with-voiceover.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-center text-slate-400 mt-4 text-sm">
              Platform Overview - 2 minutes
            </p>
          </div>

          {/* Video Thumbnails */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Getting Started', duration: '51s', file: '02-getting-started-with-voiceover.mp4', poster: 'gallery-my-day.jpg' },
              { title: 'Invoicing', duration: '19s', file: '03-invoicing-with-voiceover.mp4', poster: 'gallery-invoices.jpg' },
              { title: 'AI Features', duration: '27s', file: '04-ai-features-with-voiceover.mp4', poster: '30-ai-dashboard.jpg' },
              { title: 'Full Tour', duration: '25s', file: '05-full-gallery-with-voiceover.mp4', poster: 'gallery-analytics.jpg' },
            ].map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => {
                  const mainVideo = document.querySelector('video') as HTMLVideoElement
                  if (mainVideo) {
                    mainVideo.src = `/demo-captures/final/${video.file}`
                    mainVideo.play()
                    mainVideo.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }}
              >
                <div className="relative rounded-lg overflow-hidden border border-slate-700 group-hover:border-blue-500 transition-all aspect-video">
                  <Image
                    src={`/demo-captures/${video.poster}`}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-slate-900 ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                    {video.duration}
                  </div>
                </div>
                <p className="text-slate-300 text-sm mt-2 text-center group-hover:text-white transition-colors">
                  {video.title}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm"
        aria-labelledby="stats-heading"
        role="region"
      >
        <h2 id="stats-heading" className="sr-only">Platform statistics and achievements</h2>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className="text-center border-2 hover:border-blue-600 transition-all hover:shadow-xl"
                  role="status"
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <CardContent className="p-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" aria-hidden="true" />
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" role="status">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section (Replaces generic Problem Statement) */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Social Proof Marquee */}
      <section className="py-10 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trusted by 25,000+ Freelancers & Agencies</p>
        </div>
        <div className="flex flex-col antialiased bg-white dark:bg-gray-900 dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={[
              { name: "Acme Corp" },
              { name: "Global Design" },
              { name: "TechFlow" },
              { name: "Creative Studios" },
              { name: "Indie Hackers" },
              { name: "Freelance Union" },
              { name: "Digital Nomads" },
            ]}
            direction="right"
            speed="slow"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section
        className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
        aria-labelledby="features-heading"
        role="region"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <BentoGrid className="max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <BentoGridItem
              key={index}
              title={feature.title}
              description={feature.description}
              header={
                <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br ${feature.gradient} opacity-10 flex items-center justify-center`}>
                  <feature.icon className={`h-12 w-12 opacity-50 text-gray-500`} />
                </div>
              }
              icon={<feature.icon className="h-4 w-4 text-neutral-500" />}
              className={index === 3 || index === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </section>

      {/* Testimonials */}
      <section
        className="py-20"
        aria-labelledby="testimonials-heading"
        role="region"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              role="status"
              aria-label="Success Stories section"
            >
              Success Stories
            </Badge>
            <h2 id="testimonials-heading" className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by 25,000+ Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8" role="list">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                role="listitem"
              >
                <LiquidGlassCard
                  variant="gradient"
                  className="h-full"
                  role="article"
                  aria-label={`Testimonial from ${testimonial.author}, ${testimonial.role} at ${testimonial.company}`}
                >
                  <LiquidGlassCardHeader>
                    <div
                      className="flex gap-1 mb-4"
                      role="img"
                      aria-label={`${testimonial.rating} out of 5 stars`}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      ))}
                    </div>
                    <Badge
                      className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      role="status"
                      aria-label={`Result: ${testimonial.metric}`}
                    >
                      {testimonial.metric}
                    </Badge>
                  </LiquidGlassCardHeader>
                  <LiquidGlassCardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{testimonial.quote}</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
                        aria-hidden="true"
                      >
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                  </LiquidGlassCardContent>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Final CTA */}
      <section
        className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden"
        aria-labelledby="final-cta-heading"
        role="region"
      >
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
          aria-hidden="true"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                  aria-label="Start your free 14-day trial - No credit card required"
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
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div >
  )
}
