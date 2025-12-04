'use client'

import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Zap,
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
    href: '/dashboard/ai-create',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Professional Video Studio',
    description: 'Edit videos with AI-powered transcription, screen recording, and timestamp comments. Collaborate with clients in real-time.',
    icon: Video,
    href: '/dashboard/video-studio',
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Universal Pinpoint Feedback',
    description: 'Leave precise feedback on any file type—images, videos, PDFs, or code. Add voice notes and AI analysis.',
    icon: MessageSquare,
    href: '/dashboard/collaboration',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Secure Escrow Payments',
    description: 'Protect your income with milestone-based payments. Clients fund upfront, you deliver with confidence.',
    icon: Shield,
    href: '/dashboard/escrow',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'AI Daily Planning',
    description: 'Let AI organize your day. Get smart time estimates, productivity insights, and automated scheduling.',
    icon: Calendar,
    href: '/dashboard/my-day',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Multi-Cloud Storage',
    description: 'Store unlimited files with 70% cost savings. Intelligent routing between Supabase and Wasabi.',
    icon: Upload,
    href: '/dashboard/files-hub',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Work together like you\'re in the same room. See live cursors, instant updates, and presence indicators.',
    icon: Users,
    href: '/dashboard/collaboration',
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Professional Invoicing',
    description: 'Create beautiful invoices in seconds. Track payments automatically and maintain financial records.',
    icon: DollarSign,
    href: '/dashboard/financial-hub',
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
  { value: '4.9/5', label: 'User Rating', icon: Star },
  { value: '99.9%', label: 'Uptime', icon: Zap }
]

const testimonials = [
  {
    quote: "KAZI transformed how we work with clients. The universal feedback system eliminated endless email chains, and we're billing 40% faster with the escrow payments.",
    author: "Sarah Chen",
    role: "Creative Director",
    company: "Design Studio Pro",
    rating: 5,
    metric: "15 hrs/week saved"
  },
  {
    quote: "Payments are lightning-fast. The integrated workspace means I'm not context-switching between 6 different tools anymore. Game changer for freelancers.",
    author: "Marcus Johnson",
    role: "Freelance Developer",
    company: "Independent",
    rating: 5,
    metric: "$300/mo saved"
  },
  {
    quote: "The AI content studio is incredible. We create marketing materials 5x faster and the quality is consistently excellent. Our clients love the collaboration features.",
    author: "Priya Patel",
    role: "Marketing Agency Owner",
    company: "Growth Labs",
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

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "KAZI",
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
            }
          })
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KAZI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="h-[500px] w-[800px] bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-8 bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Globe className="w-3 h-3 mr-1" />
              Built in Africa • Trusted Globally
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Run Your Entire Business
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                From One Platform
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Stop juggling 6+ tools. KAZI combines AI-powered creation, video collaboration, secure payments, and project management into one seamless workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <badge.icon className="w-4 h-4 text-green-600" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 text-center">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Tired of Context Switching Between 6+ Apps?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every tool switch costs you 23 minutes of focus. KAZI eliminates the chaos by bringing everything into one unified workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-600 transition-all">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Save 15+ Hours Weekly</CardTitle>
                <CardDescription>
                  Eliminate tool switching and context loss. Keep everything in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-600 transition-all">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Get Paid Faster</CardTitle>
                <CardDescription>
                  Automated invoicing and escrow payments mean you get paid on time, every time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-600 transition-all">
              <CardHeader>
                <DollarSign className="w-12 h-12 text-pink-600 mb-4" />
                <CardTitle>Cut Costs by $500/mo</CardTitle>
                <CardDescription>
                  Replace multiple subscriptions with one powerful platform that does it all.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-purple-50 text-purple-700">
              Complete Toolkit
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade features that grow with you—from solopreneur to agency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all border-2 hover:border-blue-600">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button variant="ghost" className="w-full group-hover:bg-gray-100">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700">
              Customer Stories
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Loved by Freelancers & Agencies Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how KAZI transforms workflows and accelerates growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:border-blue-600 transition-all">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Badge variant="secondary" className="w-fit bg-green-50 text-green-700 mb-4">
                    {testimonial.metric}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 25,000+ freelancers and agencies who've streamlined their work with KAZI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-white/80 mt-6 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
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
                <Link href="/features" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
                <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link href="/demo-features" className="block text-gray-400 hover:text-white transition-colors">Demo</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="/blog" className="block text-gray-400 hover:text-white transition-colors">Blog</Link>
                <Link href="/docs" className="block text-gray-400 hover:text-white transition-colors">Docs</Link>
                <Link href="/tutorials" className="block text-gray-400 hover:text-white transition-colors">Tutorials</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
                <Link href="/signup" className="block text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                <Link href="/login" className="block text-gray-400 hover:text-white transition-colors">Login</Link>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-800 mb-8" />

          <div className="text-center text-gray-400">
            <p>© 2025 KAZI. Built in South Africa 🇿🇦 • Serving 40+ Countries Worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
