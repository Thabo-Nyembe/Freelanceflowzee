import { Metadata } from "next";
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap, 
  Upload, 
  Video, 
  Users,
  TrendingUp,
  Target,
  CreditCard,
  Brain,
  Palette,
  Share2,
  Shield,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    title: 'AI Create Studio',
    description: 'Multi-model AI platform with GPT-4o, Claude, DALL-E, and Google AI for instant content generation across 6+ creative fields.',
    icon: Brain,
    href: '/dashboard/ai-create',
    benefits: [
      'Access to 4 premium AI models (GPT-4o, Claude, DALL-E, Google AI)',
      'Generate images, copy, code, and multimedia content instantly',
      'Industry-specific templates for design, photography, music & video',
      'Cost-optimized AI usage with intelligent model switching'
    ]
  },
  {
    title: 'Universal Pinpoint Feedback',
    description: 'Revolutionary multi-media commenting system with AI analysis, voice notes, and pixel-perfect annotations.',
    icon: Target,
    href: '/dashboard/collaboration',
    benefits: [
      'Comment on images, videos, PDFs, code files with precise positioning',
      'AI-powered feedback categorization and priority assessment',
      'Voice recording with waveform visualization and transcription',
      'Real-time collaboration with @mentions and emoji reactions'
    ]
  },
  {
    title: 'Professional Video Studio',
    description: 'Complete video editing suite with AI transcription, chapters, screen recording, and client collaboration.',
    icon: Video,
    href: '/dashboard/video-studio',
    benefits: [
      'Timeline-based editing with effects, transitions, and filters',
      'AI-powered auto-transcription and smart chapter generation',
      'Screen recording with webcam overlay and annotation tools',
      'Timestamp-based commenting and approval workflows'
    ]
  },
  {
    title: 'Multi-Cloud Storage System',
    description: 'Enterprise-grade file management with 70% cost savings through intelligent Supabase + Wasabi routing.',
    icon: Upload,
    href: '/dashboard/files-hub',
    benefits: [
      'Hybrid cloud storage (Supabase + Wasabi S3) with smart routing',
      '70% cost optimization with automated file tier management',
      'Professional file sharing with WeTransfer-like experience',
      'Version control, permissions, and comprehensive analytics'
    ]
  },
  {
    title: 'Escrow Payment System',
    description: 'Secure milestone-based payment protection with automated invoicing and multi-currency support.',
    icon: Shield,
    href: '/dashboard/escrow',
    benefits: [
      'Milestone-based escrow with automatic release triggers',
      'Stripe integration with global payment processing',
      'Professional invoice generation with tax calculations',
      'Real-time payment tracking and comprehensive analytics'
    ]
  },
  {
    title: 'Creator Community Hub',
    description: 'Thriving marketplace with 2,800+ active creators, social features, and collaboration opportunities.',
    icon: Users,
    href: '/dashboard/community',
    benefits: [
      'Access to 2,800+ verified creative professionals worldwide',
      'Instagram-like social wall with posts, videos, and audio',
      'Creator marketplace with portfolios and skill matching',
      'Real-time messaging and project collaboration tools'
    ]
  },
  {
    title: 'AI Daily Planning',
    description: 'Intelligent task management with productivity optimization, time estimates, and automated scheduling.',
    icon: Zap,
    href: '/dashboard/my-day',
    benefits: [
      'AI-powered daily schedule optimization and task prioritization',
      'Smart time estimates with productivity pattern analysis',
      'Automated client meeting scheduling across time zones',
      'Progress tracking with insights and efficiency recommendations'
    ]
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Live multi-user editing with cursors, selections, presence indicators, and instant synchronization.',
    icon: Users,
    href: '/dashboard/collaboration',
    benefits: [
      'Live cursor tracking and user presence indicators',
      'Real-time document editing with conflict resolution',
      'Instant messaging with file sharing and screen sharing',
      'Multi-step approval workflows with automated notifications'
    ]
  },
  {
    title: 'Advanced Analytics Suite',
    description: 'Comprehensive business intelligence with revenue tracking, performance metrics, and cost optimization.',
    icon: TrendingUp,
    href: '/dashboard/analytics',
    benefits: [
      'Real-time revenue and project performance dashboards',
      'Cost optimization insights with storage and AI usage analytics',
      'Client satisfaction metrics and project success predictions',
      'Custom reporting with automated weekly/monthly summaries'
    ]
  }
]

const stats = [
  { value: '304+', label: 'React Components', growth: 'Production Ready' },
  { value: '46+', label: 'API Endpoints', growth: 'Enterprise Grade' },
  { value: '365+', label: 'Test Files', growth: 'A+++ Quality' },
  { value: '2,800+', label: 'Active Creators', growth: '+127% Growth' }
]

export const metadata: Metadata = {
  title: "KAZI - AI-Powered Creative Platform",
  description: "Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.",
  keywords: "AI, creative platform, file sharing, project management, escrow payments, freelance",
  authors: [{ name: "KAZI Team" }],
  creator: "KAZI"
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/kazi-brand/logo.svg" 
                  alt="KAZI" 
                  className="h-8 w-auto"
                />
                <span className="text-2xl font-bold text-purple-600">KAZI</span>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-gray-700 hover:text-purple-600">Home</Link>
                <Link href="/features" className="text-gray-700 hover:text-purple-600">Features</Link>
                <Link href="/pricing" className="text-gray-700 hover:text-purple-600">Pricing</Link>
                <Link href="/contact" className="text-gray-700 hover:text-purple-600">Contact</Link>
              </nav>
            </div>
            <Button 
              asChild 
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <img 
              src="/kazi-brand/logo-transparent.png" 
              alt="KAZI Logo" 
              className="h-20 w-auto mx-auto mb-4"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Enterprise Freelance Management Platform
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            AI-Powered • Real-Time Collaboration • Secure Payments
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The complete platform for creative professionals featuring multi-model AI studio, 
            universal pinpoint feedback system, real-time collaboration, multi-cloud storage 
            with 70% cost savings, and secure escrow payments - all in one revolutionary platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 text-lg"
            >
              <Link href="/signup">Try Interactive Demo →</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 text-lg"
            >
              <Link href="/ai-demo">▶ Watch Demo</Link>
            </Button>
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              <Link href="/dashboard/projects-hub">View Projects</Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>AI-Powered Asset Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Escrow Payment Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>WeTransfer-Style File Sharing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600 mb-1">{stat.label}</div>
              <div className="text-green-600 text-sm font-medium">{stat.growth}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Complete Enterprise Feature Suite
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          From multi-model AI studio to universal feedback systems, real-time collaboration 
          to secure escrow payments - KAZI provides 304+ components and 46+ APIs for 
          comprehensive creative business management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                >
                  <Link href={feature.href}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Creative Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creatives who've already discovered the power of AI-enhanced workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 text-lg"
            >
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 text-lg"
            >
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/kazi-brand/logo-light.png" 
                  alt="KAZI" 
                  className="h-8 w-auto"
                />
                <span className="text-2xl font-bold">KAZI</span>
              </div>
              <p className="text-gray-400">
                The AI-powered creative platform for modern professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ai-demo" className="hover:text-white">AI Create Studio</Link></li>
                <li><Link href="/video-studio" className="hover:text-white">Video Studio</Link></li>
                <li><Link href="/community" className="hover:text-white">Community</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/tutorials" className="hover:text-white">Tutorials</Link></li>
                <li><Link href="/api-docs" className="hover:text-white">API</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KAZI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
