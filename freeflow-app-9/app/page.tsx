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

export default function HomePage() {
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
                Bank-Level Security
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-purple-500" />
                Global Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {PLATFORM_STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 theme-gradient-primary rounded-full">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
                <div className="text-green-600 text-xs font-medium">{stat.growth}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm bg-purple-100 text-purple-700">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="theme-gradient-text"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From project management to payments, we've got every aspect of your freelance business covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES_DATA.map((feature, index) => (
              <Card key={index} className="theme-card group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 theme-gradient-primary rounded-full group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors"
                    asChild
                  >
                    <Link href={feature.demo}>
                      Try Demo
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your <span className="theme-gradient-text">Path</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a creator or a client, we have the perfect solution for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Creator Path */}
            <Card className="theme-card text-center p-8">
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Creators</h3>
                <p className="text-gray-600 mb-6">
                  Freelancers, agencies, and creative professionals who want to streamline their workflow and get paid faster.
                </p>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Project management & time tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Client collaboration tools
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Automated invoicing & payments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Portfolio showcase
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  asChild
                >
                  <Link href="/login?redirect=/dashboard">
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Client Path */}
            <Card className="theme-card text-center p-8">
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Clients</h3>
                <p className="text-gray-600 mb-6">
                  Businesses and individuals who want to collaborate effectively with creative professionals.
                </p>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Real-time project visibility
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Easy feedback & approval system
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Secure payment processing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                    Professional project delivery
                  </li>
                </ul>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  asChild
                >
                  <Link href="/projects">
                    View Projects
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Not sure which path is right for you?</p>
            <Button 
              variant="outline" 
              onClick={() => setIsDemoOpen(true)}
              className="theme-button-secondary"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Explore Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm bg-purple-100 text-purple-700">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by <span className="theme-gradient-text">Creators</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who have transformed their freelance business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="theme-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-purple-600">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <br />
            Freelance Business?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using FreeflowZee to streamline their workflow and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/login?redirect=/dashboard">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold"
              onClick={() => setIsDemoOpen(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
      
      {/* Demo Modal */}
      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
      />
      
      {/* Interactive Contact System */}
      <InteractiveContactSystem />
    </div>
  )
} 