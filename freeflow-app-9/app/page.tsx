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
    description: 'Revolutionary AI-powered asset generation for all creative fields with premium model access.',
    icon: Zap,
    href: '/ai-demo',
    benefits: [
      'Generate assets for 6+ creative fields instantly',
      'Access to premium AI models (GPT-4o, Claude, DALL-E)',
      'Free trials of expensive premium models',
      'Photography, Design, Music, Video & more'
    ]
  },
  {
    title: 'Files & Escrow System',
    description: 'Professional file sharing with WeTransfer-like experience plus secure payment protection.',
    icon: Upload,
    href: '/video-studio',
    benefits: [
      'WeTransfer-style professional file sharing',
      'Secure escrow payment protection',
      'Real-time upload/download progress',
      'SEO-optimized sharing pages with social integration'
    ]
  },
  {
    title: 'Video Studio Pro',
    description: 'Complete video editing suite with AI-powered features and professional templates.',
    icon: Video,
    href: '/video-studio',
    benefits: [
      'Professional video editing tools',
      'AI-powered video enhancement',
      'Template library and effects',
      'Direct client collaboration on videos'
    ]
  },
  {
    title: 'Community Hub',
    description: 'Connect, collaborate, and grow with a thriving community of creative professionals.',
    icon: Users,
    href: '/community',
    benefits: [
      'Network with 10,000+ creatives worldwide',
      'Share projects and get feedback',
      'Collaborative project opportunities',
      'Professional networking and referrals'
    ]
  },
  {
    title: 'Smart Project Tracker',
    description: 'AI-enhanced project management with milestone tracking and automated client updates.',
    icon: Target,
    href: '/dashboard/projects-hub',
    benefits: [
      'Visual progress tracking with analytics',
      'Automated client milestone notifications',
      'AI-powered project insights',
      'Integrated payment milestone triggers'
    ]
  },
  {
    title: 'Global Payment System',
    description: 'Instant payments, automated invoicing, and multi-currency support with escrow protection.',
    icon: CreditCard,
    href: '/dashboard/financial-hub',
    benefits: [
      'Instant global payment processing',
      'Automated invoice generation',
      'Multi-currency and tax handling',
      'Secure escrow for project protection'
    ]
  }
]

const stats = [
  { value: '100K+', label: 'AI Assets Generated', growth: '+156%' },
  { value: '2M+', label: 'Files Shared Securely', growth: '+89%' },
  { value: '25,000+', label: 'Creative Professionals', growth: '+67%' },
  { value: '$5M+', label: 'Escrow Transactions', growth: '+234%' }
]

export const metadata: Metadata = {
  title: "FreeflowZee - AI-Powered Creative Platform",
  description: "Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.",
  keywords: "AI, creative platform, file sharing, project management, escrow payments, freelance",
  authors: [{ name: "FreeflowZee Team" }],
  creator: "FreeflowZee"
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent mb-6">
            AI-Powered Creative Platform
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            For Modern Professionals
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Generate creative assets with AI, share files like WeTransfer, manage projects 
            with escrow payments, and build your creative business - all in one 
            revolutionary platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 text-lg"
            >
              <Link href="/signup">Creator Login</Link>
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
              <div className="text-4xl font-bold text-purple-600 mb-2">{stat.value}</div>
              <div className="text-gray-600 mb-1">{stat.label}</div>
              <div className="text-sm text-green-600 font-medium">{stat.growth}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Badge */}
      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-purple-100 to-violet-100 rounded-full px-6 py-2 mb-8">
            <span className="text-purple-700 font-medium">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools designed to streamline your workflow and enhance client 
            relationships.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  asChild 
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                >
                  <Link href={feature.href}>Try Interactive Demo →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
