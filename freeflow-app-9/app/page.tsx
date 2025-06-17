"use client"

import { useState } from 'react'
import { generateStructuredData } from '@/lib/seo-optimizer'
import { InteractiveContactSystem } from '@/components/interactive-contact-system'
import { DemoModal } from '@/components/demo-modal'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Building, 
  Zap,
  Shield,
  Globe,
  MessageCircle,
  TrendingUp,
  Award,
  Clock,
  Target,
  Rocket,
  BookOpen,
  Upload,
  Palette,
  Share2,
  CreditCard,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

// Context7 Pattern: Interactive Features Data
const FEATURES_DATA = [
  {
    icon: Users,
    title: 'Client Collaboration',
    description: 'Real-time feedback, comments, and approval workflows that keep projects moving forward.',
    benefits: ['Real-time commenting', 'Approval workflows', 'Client portals'],
    demo: '/demo/collaboration',
    interactive: true
  },
  {
    icon: Zap,
    title: 'Payment Processing',
    description: 'Automated invoicing, secure payments, and escrow protection for your peace of mind.',
    benefits: ['Automated invoicing', 'Escrow protection', 'Global payments'],
    demo: '/demo/payments',
    interactive: true
  },
  {
    icon: Shield,
    title: 'Project Management',
    description: 'Keep projects organized with timelines, milestones, and team collaboration tools.',
    benefits: ['Timeline tracking', 'Milestone management', 'Team coordination'],
    demo: '/demo/projects',
    interactive: true
  },
  {
    icon: Globe,
    title: 'File Sharing',
    description: 'Secure cloud storage with version control and real-time collaboration features.',
    benefits: ['Version control', 'Secure sharing', 'Real-time sync'],
    demo: '/demo/files',
    interactive: true
  }
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    company: 'Design Studios Inc.',
    content: 'FreeflowZee transformed how I work with clients. The collaboration features are game-changing.',
    rating: 5,
    image: '/avatars/sarah-chen.jpg'
  },
  {
    name: 'Marcus Rivera',
    role: 'Creative Director',
    company: 'Rivera Creative',
    content: 'Best investment for my agency. Client communication is now seamless and professional.',
    rating: 5,
    image: '/avatars/marcus.jpg'
  },
  {
    name: 'Emily Watson',
    role: 'Freelance Developer',
    company: 'Watson Tech',
    content: 'The payment system alone saved me hours of administrative work every week.',
    rating: 5,
    image: '/avatars/emily.jpg'
  }
]

// Context7 Pattern: Stats with real-time updates
const PLATFORM_STATS = [
  { label: 'Active Users', value: '10,000+', icon: Users, growth: '+23%' },
  { label: 'Projects Completed', value: '50,000+', icon: CheckCircle, growth: '+45%' },
  { label: 'Countries Served', value: '120+', icon: Globe, growth: '+12%' },
  { label: 'Client Satisfaction', value: '98%', icon: Star, growth: '+2%' }
]

// Context7 Pattern: Structured data for SEO (handled client-side)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "FreeflowZee",
  "description": "Professional freelance management platform",
  "url": "https://freeflowzee.com",
  "applicationCategory": "BusinessApplication"
}

export default function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  return (
    <div className="min-h-screen theme-gradient-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData('Organization'))
        }}
      />
      
      <SiteHeader />
      
      {/* Hero Section with Enhanced Interactivity */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Trusted by 10,000+ freelancers worldwide
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="p-3 theme-gradient-primary rounded-full">
                  <Rocket className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
              </div>
              <span className="theme-gradient-text">
                Create, Share & Get Paid
              </span>
              <br />
              <span className="text-gray-800">Like a Pro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
              The ultimate freelance management platform for creators, agencies, and clients. 
              Streamline projects, collaborate seamlessly, and get paid faster.
            </p>
            
            {/* Interactive CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="theme-button-primary px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/login?redirect=/dashboard">
                  Creator Login
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="theme-button-secondary px-8 py-4 text-lg font-semibold group"
                onClick={() => setIsDemoOpen(true)}
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
              
              <Button 
                size="lg"
                className="theme-button-primary px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/projects">
                  View Projects
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                Enterprise-Grade Security
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                Setup in Minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How FreeflowZee Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How FreeflowZee Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to transform your freelance workflow and start getting paid faster
            </p>
          </div>

          <div className="relative">
            {/* Workflow Connection Line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-5xl h-1 bg-gradient-to-r from-purple-200 via-blue-200 via-green-200 to-yellow-200 rounded-full" />
            </div>

            <div className="space-y-16">
              {/* Step 1: Upload */}
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1">
                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-50 to-white">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                          <span className="text-purple-600 font-bold text-lg">1</span>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Upload className="w-8 h-8 text-purple-700" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">Upload Your Work</h4>
                      <p className="text-lg text-gray-600 mb-6">
                        Upload your creative projects, documents, and files to your secure workspace.
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Drag & drop file uploads
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Support for all file types
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Automatic file organization
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Version control system
                        </li>
                      </ul>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>2 minutes</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700"
                          asChild
                        >
                          <Link href="/demo">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Try Interactive Demo
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8 text-center">
                    <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-purple-700 font-medium">Interactive Upload Demo</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Customize */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                <div className="flex-1">
                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-50 to-white">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                          <span className="text-blue-600 font-bold text-lg">2</span>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Palette className="w-8 h-8 text-blue-700" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">Customize Your Presentation</h4>
                      <p className="text-lg text-gray-600 mb-6">
                        Brand your project pages with custom colors, logos, and layouts.
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Custom branding options
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Professional templates
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Mobile-responsive design
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          White-label solutions
                        </li>
                      </ul>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>5 minutes</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          asChild
                        >
                          <Link href="/demo">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Try Interactive Demo
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 text-center">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Palette className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-blue-700 font-medium">Interactive Customization Demo</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Share */}
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1">
                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-50 to-white">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                          <span className="text-green-600 font-bold text-lg">3</span>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Share2 className="w-8 h-8 text-green-700" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">Share with Clients</h4>
                      <p className="text-lg text-gray-600 mb-6">
                        Send secure, password-protected links to clients for review and approval.
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Secure sharing links
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Password protection
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Access controls
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Real-time notifications
                        </li>
                      </ul>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>1 minute</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          asChild
                        >
                          <Link href="/demo">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Try Interactive Demo
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8 text-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-green-700 font-medium">Interactive Sharing Demo</p>
                  </div>
                </div>
              </div>

              {/* Step 4: Get Paid */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                <div className="flex-1">
                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-yellow-50 to-white">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
                          <span className="text-yellow-600 font-bold text-lg">4</span>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <CreditCard className="w-8 h-8 text-yellow-700" />
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">Get Paid Instantly</h4>
                      <p className="text-lg text-gray-600 mb-6">
                        Clients can approve and pay for projects directly through your branded pages.
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Integrated payment processing
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Multiple payment methods
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Automated invoicing
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                          Instant notifications
                        </li>
                      </ul>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Instant</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={() => setIsDemoOpen(true)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Payment Demo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-8 text-center">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-yellow-700 font-medium">Interactive Payment Demo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-16">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-10 py-4"
                onClick={() => setIsDemoOpen(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Experience the Complete Workflow
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                No credit card required • Full interactive demo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section with Enhanced Interactivity */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path to Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a freelancer, agency, or client, FreeflowZee adapts to your unique workflow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Creator Path */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-purple-50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-500 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">For Creators</h3>
                    <p className="text-purple-600 font-medium">Freelancers & Agencies</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Professional project management',
                    'Client collaboration tools',
                    'Automated invoicing & payments',
                    'Time tracking & reporting',
                    'Portfolio showcase',
                    'Team collaboration'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    asChild
                  >
                    <Link href="/login?redirect=/dashboard">
                      Creator Login
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-200 hover:border-purple-400"
                    onClick={() => setIsDemoOpen(true)}
                  >
                    Try Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Client Path */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-purple-100">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-500 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">For Clients</h3>
                    <p className="text-purple-600 font-medium">Businesses & Organizations</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Real-time project visibility',
                    'Easy feedback & approval',
                    'Secure file collaboration',
                    'Payment protection & escrow',
                    'Progress tracking',
                    'Quality assurance'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    asChild
                  >
                    <Link href="/projects">
                      View Projects
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-200 hover:border-purple-400"
                    asChild
                  >
                    <Link href="/contact">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features That Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage projects, collaborate with clients, and grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES_DATA.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mb-4 group-hover:bg-purple-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2 mb-4">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {feature.interactive && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      asChild
                    >
                      <Link href={feature.demo}>
                        Try Interactive Demo
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of successful freelancers and agencies
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {PLATFORM_STATS.map((stat, index) => (
              <Card key={index} className="text-center p-6 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <stat.icon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 mb-2">{stat.label}</div>
                  <div className="flex items-center justify-center text-sm">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-green-600 font-medium">{stat.growth}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. Transparent pricing with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="relative hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <p className="text-gray-600 mb-4">Perfect for getting started</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">$0</span>
                    <span className="text-xl text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                
                <Button className="w-full mb-6 bg-purple-600 hover:bg-purple-700 text-white" asChild>
                  <Link href="/signup">
                    Start Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 3 active projects</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic client collaboration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">File sharing up to 1GB</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Standard templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Professional Plan - Popular */}
            <Card className="relative hover:shadow-2xl transition-all duration-300 ring-2 ring-purple-500 shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600 mb-4">For growing freelancers</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">$19</span>
                    <span className="text-xl text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                
                <Button className="w-full mb-6 bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/signup?plan=professional">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited projects</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced client portals</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">File sharing up to 100GB</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Payment processing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-4">For agencies and teams</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-gray-900">$49</span>
                    <span className="text-xl text-gray-500 ml-2">/month</span>
                  </div>
                </div>
                
                <Button className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700" asChild>
                  <Link href="/contact?plan=enterprise">
                    Contact Sales
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Everything in Professional</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited team members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">White-label solution</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced security</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">SLA guarantee</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">API access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Trust Badges */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                30-day money back guarantee
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-green-500" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from real professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
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

      {/* Strategic Call-to-Action Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-900 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of professionals who've already upgraded their freelance business
            </p>
          </div>
          
          {/* Three Strategic CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sales CTA */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-white">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Journey</h3>
                <p className="text-gray-600 mb-6">
                  Join 10,000+ professionals who've transformed their workflow with FreeflowZee's powerful platform.
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  No credit card required • 14-day free trial
                </p>
              </CardContent>
            </Card>

            {/* Information CTA */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-indigo-50 hover:from-indigo-50 hover:to-white">
              <CardContent className="p-8 text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">See It In Action</h3>
                <p className="text-gray-600 mb-6">
                  Experience the power of seamless project management with our interactive demo and live examples.
                </p>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg group-hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/demo">
                    Watch Live Demo
                    <Play className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  5-minute interactive walkthrough
                </p>
              </CardContent>
            </Card>

            {/* Brand Awareness CTA */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white">
              <CardContent className="p-8 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-200 transition-colors">
                  <Star className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Learn & Grow</h3>
                <p className="text-gray-600 mb-6">
                  Access our comprehensive resource library, tutorials, and join our thriving community of creators.
                </p>
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="w-full text-gray-700 hover:bg-gray-100 border-2 border-gray-300 hover:border-gray-400 shadow-lg group-hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/resources">
                    Explore Resources
                    <BookOpen className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Free guides • Tutorials • Community
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Ready to take your freelance business to the next level?
            </p>
            <Button 
              size="lg" 
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/contact">
                Talk to Our Team
                <MessageCircle className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
      
      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  )
} 