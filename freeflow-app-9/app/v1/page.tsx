'use client'

import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Lock
} from 'lucide-react'

const features = [
  {
    title: 'Multi-Model AI Studio',
    description: 'Generate stunning content in seconds with GPT-4o, Claude, DALL-E, and Google AI. Create copy, images, and designs without leaving your workspace.',
    icon: Brain,
    href: '/v1/dashboard/ai-create',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Professional Video Studio',
    description: 'Edit videos with AI-powered transcription, screen recording, and timestamp comments. Collaborate with clients in real-time.',
    icon: Video,
    href: '/v1/dashboard/video-studio',
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Universal Pinpoint Feedback',
    description: 'Leave precise feedback on any file type—images, videos, PDFs, or code. Add voice notes and AI analysis.',
    icon: MessageSquare,
    href: '/v1/dashboard/collaboration',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Secure Escrow Payments',
    description: 'Protect your income with milestone-based payments. Clients fund upfront, you deliver with confidence.',
    icon: Shield,
    href: '/v1/dashboard/escrow',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'AI Daily Planning',
    description: 'Let AI organize your day. Get smart time estimates, productivity insights, and automated scheduling.',
    icon: Calendar,
    href: '/v1/dashboard/my-day',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Multi-Cloud Storage',
    description: 'Store unlimited files with 70% cost savings. Intelligent routing between Supabase and Wasabi.',
    icon: Upload,
    href: '/v1/dashboard/files-hub',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Work together like you\'re in the same room. See live cursors, instant updates, and presence indicators.',
    icon: Users,
    href: '/v1/dashboard/collaboration',
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Professional Invoicing',
    description: 'Create beautiful invoices in seconds. Track payments automatically and maintain financial records.',
    icon: DollarSign,
    href: '/v1/dashboard/financial',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Client Zone Galleries',
    description: 'Impress clients with branded portals for file delivery. Control access and collect approvals.',
    icon: FileText,
    href: '/v1/dashboard/client-zone',
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
    quote: "The escrow system gives us peace of mind. Clients fund projects upfront, and we deliver knowing we're protected. The AI daily planner keeps our team on track.",
    author: "Marcus Rodriguez",
    role: "Agency Owner",
    company: "Digital Collective",
    rating: 5,
    metric: "$300/mo saved"
  },
  {
    quote: "Switched from juggling 6 different apps to just KAZI. The video studio with AI transcription and the multi-model AI content generator are game-changers for our workflow.",
    author: "Priya Sharma",
    role: "Freelance Videographer",
    company: "Sharma Productions",
    rating: 5,
    metric: "+60% revenue"
  }
]

const trustBadges = [
  { icon: Lock, label: 'SSL Encrypted' },
  { icon: Shield, label: 'GDPR Compliant' },
  { icon: Award, label: 'SOC 2 Certified' },
  { icon: CheckCircle, label: '30-Day Guarantee' }
]

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:bg-none dark:bg-gray-900 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-orange-400/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
          scale: [1.2, 1, 1.2]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5
        }}
      />

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
              href="/v1"
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
                href="/v1/features"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-label="View all features"
              >
                Features
              </Link>
              <Link
                href="/v1/pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-label="View pricing plans"
              >
                Pricing
              </Link>
              <Link
                href="/v1/blog"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-label="Read our blog"
              >
                Blog
              </Link>
              <Link
                href="/v1/contact"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                role="menuitem"
                aria-label="Contact us"
              >
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  aria-label="Log in to your account"
                  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Start your free trial"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge
                variant="secondary"
                className="mb-6 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm px-4 py-2"
                role="status"
                aria-label="Trusted by over 25,000 professionals"
              >
                <Sparkles className="w-4 h-4 inline mr-2" aria-hidden="true" />
                Trusted by 25,000+ Professionals
              </Badge>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Run Your Entire Business
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                From One Platform
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Stop juggling 6+ apps. KAZI combines project management, AI content creation, secure payments,
              client collaboration, and professional file delivery in one beautiful workspace.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              role="group"
              aria-label="Primary actions"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Start your free trial - No credit card required"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/v1/demo-features">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 hover:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Watch interactive demo of KAZI platform"
                >
                  <Play className="mr-2 w-5 h-5" aria-hidden="true" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              role="region"
              aria-label="Security and trust badges"
            >
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                  role="status"
                  aria-label={badge.label}
                >
                  <badge.icon className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </motion.div>
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

      {/* Problem Statement */}
      <section
        className="py-20"
        aria-labelledby="problem-heading"
        role="region"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="problem-heading" className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Tired of Context Switching Between 6+ Apps?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Freelancers and agencies waste hours every day switching between project management, file storage,
              invoicing, communication, and payment platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" role="list">
            {[
              { title: 'One Workspace', description: 'Everything in one place—no more tab chaos or lost files across platforms.' },
              { title: 'Save 15+ Hours/Week', description: 'Automate repetitive tasks with AI and streamline your entire workflow.' },
              { title: 'Get Paid Faster', description: 'Secure escrow payments mean you get paid on time, every time.' }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                role="listitem"
              >
                <LiquidGlassCard
                  variant="tinted"
                  hoverEffect
                  role="article"
                  aria-label={`${benefit.title}: ${benefit.description}`}
                >
                  <LiquidGlassCardHeader>
                    <CheckCircle className="w-12 h-12 text-green-600 mb-4" aria-hidden="true" />
                    <LiquidGlassCardTitle>{benefit.title}</LiquidGlassCardTitle>
                  </LiquidGlassCardHeader>
                  <LiquidGlassCardContent>
                    <p className="text-gray-700 dark:text-gray-300">{benefit.description}</p>
                  </LiquidGlassCardContent>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                role="listitem"
              >
                <Card
                  className="group h-full border-2 hover:border-blue-600 transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                  role="article"
                  aria-label={`${feature.title}: ${feature.description}`}
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      aria-hidden="true"
                    >
                      <feature.icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={feature.href}>
                      <Button
                        variant="ghost"
                        className="w-full group-hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Learn more about ${feature.title}`}
                      >
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
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
      </section>

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
              <Link href="/v1/pricing">
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold">KAZI</span>
              </div>
              <p className="text-gray-400">
                All-in-one workspace for freelancers and agencies
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <Link href="/v1/features" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
                <Link href="/v1/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="/v1/demo-features" className="block text-gray-400 hover:text-white transition-colors">Demo</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="/v1/blog" className="block text-gray-400 hover:text-white transition-colors">Blog</Link>
                <Link href="/docs" className="block text-gray-400 hover:text-white transition-colors">Docs</Link>
                <Link href="/tutorials" className="block text-gray-400 hover:text-white transition-colors">Tutorials</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <Link href="/v1/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link href="/signup" className="block text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">Login</Link>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <div className="text-center text-gray-400">
            <p>© 2026 KAZI. Built in South Africa 🇿🇦 • Serving 40+ Countries Worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
