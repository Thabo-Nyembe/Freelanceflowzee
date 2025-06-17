'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { DemoModal } from '@/components/demo-modal'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { VerificationReminder } from '@/components/verification-reminder'
import { 
  ArrowRight, 
  Upload, 
  Users, 
  Shield, 
  Star,
  CheckCircle,
  Play,
  Download,
  Globe,
  Zap,
  Heart,
  Mail,
  MessageSquare,
  FileText,
  DollarSign,
  Award,
  TrendingUp,
  Clock,
  Eye,
  BarChart3,
  PaletteIcon as Palette,
  Camera,
  Video,
  Monitor,
  Smartphone,
  Sparkles,
  ChevronRight,
  Quote,
  CreditCard,
  ImageIcon,
  MessageCircle,
  Check,
  UserPlus,
  CreditCard as PaymentIcon,
  Settings,
  Target,
  Lightbulb,
  Headphones,
  ExternalLink
} from 'lucide-react'

// Hero section with animated gradient background
function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Badge */}
          <Badge data-testid="hero-badge" variant="secondary" className="mb-8 bg-white/80 backdrop-blur-sm border border-white/20 px-6 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            New: AI-Powered Project Analytics
          </Badge>

          {/* Main heading */}
          <h1 data-testid="hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Create, Share & 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Get Paid</span>
          </h1>

          {/* Subheading */}
          <p data-testid="hero-subtitle" className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            The all-in-one platform for creatives and freelancers. Upload your work, collaborate with clients, 
            and get paid faster than ever before.
          </p>

          {/* Main CTA Buttons - Updated with Creator/Client distinction */}
          <div data-testid="hero-cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/login?redirect=/dashboard">
              <Button data-testid="creator-login-button" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Creator Login
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Button 
              data-testid="watch-demo-button" 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-300 hover:border-indigo-300 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm bg-white/80"
              onClick={() => setIsDemoOpen(true)}
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
            
            <Link href="/payment">
              <Button data-testid="view-projects-button" variant="outline" size="lg" className="px-8 py-4 text-lg border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl">
                View Projects
              </Button>
            </Link>
          </div>

          {/* User Type Helper Section */}
          <div className="mb-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50">
            <p className="text-gray-600 mb-2 font-medium">Not Sure? Try First</p>
            <p className="text-sm text-gray-500">See how FreeflowZee works</p>
          </div>

          {/* Social proof */}
          <div data-testid="hero-social-proof" className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-sm font-medium">50,000+ creators trust us</span>
            </div>
            <div className="flex items-center">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
      />
    </section>
  )
}

// User Types Section to distinguish between creators and clients
function UserTypesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Choose Your 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Experience</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a creator showcasing your work or a client reviewing projects, 
            FreeflowZee has the perfect solution for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* For Creators */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Creators & Freelancers</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Showcase your portfolio, manage client projects, collaborate in real-time, 
                and get paid faster than ever before.
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                  Upload and organize unlimited projects
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                  Real-time client collaboration tools
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                  Automated invoicing and payments
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                  Professional client presentations
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                  Comprehensive analytics dashboard
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3">
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* For Clients */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Clients & Businesses</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Review work, provide feedback, approve deliverables, and make secure payments 
                all in one professional platform.
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                  Secure project access and previews
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                  Real-time commenting and feedback
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                  Secure payment processing
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                  Download deliverables instantly
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                  Professional client experience
                </li>
              </ul>
              <Link href="/payment">
                <Button variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 py-3">
                  Access Projects
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still unsure which option is right for you?</p>
          <Link href="/demo">
            <Button variant="outline" className="px-6 py-2">
              Explore Our Demo
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Features section with working buttons and proper styling
function FeaturesSection() {
  const features = [
    {
      icon: Upload,
      title: "Smart Upload System",
      description: "Drag and drop any file type. Our AI organizes everything automatically with smart previews and version control.",
      highlight: "AI-Powered"
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live editing, visual feedback, and instant notifications for team projects.",
      highlight: "Live Editing"
    },
    {
      icon: DollarSign,
      title: "Instant Payments",
      description: "Get paid faster with automated invoicing, secure payment processing, and real-time transaction tracking.",
      highlight: "24hr Payouts"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and advanced permission controls protect your creative assets.",
      highlight: "SOC 2 Certified"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track project performance, client engagement, and revenue with comprehensive insights and reporting.",
      highlight: "Deep Insights"
    },
    {
      icon: Zap,
      title: "Lightning Performance",
      description: "Optimized for speed with CDN delivery, smart caching, and instant file access from anywhere in the world.",
      highlight: "Global CDN"
    }
  ]

  return (
    <section id="features" data-testid="features-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 data-testid="features-title" className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> succeed</span>
          </h2>
          <p data-testid="features-subtitle" className="text-xl text-gray-600 max-w-3xl mx-auto">
            From upload to payment, we've built every tool you need to run your creative business efficiently.
          </p>
        </div>

        <div data-testid="features-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} data-testid={`feature-${index}`} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <Badge data-testid={`feature-highlight-${index}`} variant="secondary" className="mb-4 bg-indigo-100 text-indigo-700">
                    {feature.highlight}
                  </Badge>
                  <h3 data-testid={`feature-title-${index}`} className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p data-testid={`feature-description-${index}`} className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* Features CTA */}
        <div className="text-center mt-16">
          <Link href="/features">
            <Button size="lg" variant="outline" className="px-8 py-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50">
              Explore All Features
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Interactive Features Section with working tabs
function InteractiveFeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Interactive Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Experience the full power of FreeflowZee with our interactive gallery, client feedback system, and comprehensive finance hub.</p>
        </div>
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="gallery" className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Gallery Showcase</TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />Client Feedback</TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Finance Hub</TabsTrigger>
          </TabsList>
          <TabsContent value="gallery">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Project Gallery & Showcase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg p-8 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
                  <h3 className="text-xl font-semibold mb-2">Interactive Gallery Demo</h3>
                  <p className="text-gray-600 mb-4">Showcase your work with beautiful galleries, custom layouts, and client-friendly viewing options.</p>
                  <Link href="/dashboard/gallery">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Try Gallery Demo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="feedback">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Real-time Client Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-8 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">Live Feedback System</h3>
                  <p className="text-gray-600 mb-4">Get instant feedback with visual annotations, threaded comments, and approval workflows.</p>
                  <Link href="/dashboard/collaboration">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Try Feedback Demo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="finance">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Financial Management Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-8 text-center">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                  <h3 className="text-xl font-semibold mb-2">Complete Finance Suite</h3>
                  <p className="text-gray-600 mb-4">Manage invoices, track payments, and monitor your financial health with detailed analytics.</p>
                  <Link href="/dashboard/financial-hub">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      Try Finance Demo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

// How it works section with working demo buttons
function HowItWorksSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  
  const steps = [
    {
      number: "01",
      title: "Upload Your Work",
      description: "Drag and drop files, folders, or entire projects. We handle the rest.",
      icon: Upload,
      image: "/demo-upload.jpg"
    },
    {
      number: "02", 
      title: "Collaborate & Get Feedback",
      description: "Share with clients, get real-time feedback, and make revisions together.",
      icon: MessageSquare,
      image: "/demo-feedback.jpg"
    },
    {
      number: "03",
      title: "Deliver & Get Paid",
      description: "Send final deliverables and receive payment automatically.",
      icon: Award,
      image: "/demo-payment.jpg"
    }
  ]

  return (
    <section id="how-it-works" data-testid="how-it-works-section" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 data-testid="how-it-works-title" className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How it works
          </h2>
          <p data-testid="how-it-works-subtitle" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to transform your creative workflow
          </p>
        </div>

        <div data-testid="workflow-steps-container" className="space-y-20">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            const isEven = index % 2 === 0
            
            return (
              <div key={index} data-testid={`workflow-step-${index}`} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span data-testid={`step-number-${index}`} className="text-6xl font-bold text-indigo-600/20">{step.number}</span>
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 data-testid={`step-title-${index}`} className="text-3xl font-bold text-gray-900">{step.title}</h3>
                  <p data-testid={`step-description-${index}`} className="text-xl text-gray-600 leading-relaxed">{step.description}</p>
                  {index === 0 ? (
                    <Link href="/dashboard/files-hub">
                      <Button 
                        data-testid={`step-cta-${index}`} 
                        variant="outline" 
                        className="mt-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        Try Upload Demo
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  ) : index === 1 ? (
                    <Link href="/dashboard/collaboration">
                      <Button 
                        data-testid={`step-cta-${index}`} 
                        variant="outline" 
                        className="mt-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        Try Collaboration Demo
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard/escrow">
                      <Button 
                        data-testid={`step-cta-${index}`} 
                        variant="outline" 
                        className="mt-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        Try Payment Demo
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
                
                <div className="flex-1">
                  <Link href={index === 0 ? "/dashboard/files-hub" : index === 1 ? "/dashboard/collaboration" : "/dashboard/escrow"}>
                    <div 
                      data-testid={`step-demo-${index}`} 
                      className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 aspect-video flex items-center justify-center cursor-pointer hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <IconComponent className="w-20 h-20 mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                        <p className="text-indigo-600 font-medium group-hover:text-indigo-700">Interactive Demo</p>
                        <p className="text-indigo-500 text-sm mt-2 opacity-75">Click to try</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* How It Works CTA */}
        <div className="text-center mt-16">
          <Link href="/how-it-works">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4">
              See Complete Process
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Demo Modal */}
      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
      />
    </section>
  )
}

// Social proof section with proper colors
function SocialProofSection() {
  const testimonials = [
    {
      quote: "FreeflowZee transformed how I work with clients. Projects that used to take weeks now take days.",
      author: "Sarah Chen",
      role: "UI/UX Designer",
      company: "Design Studio Co.",
      avatar: "/avatars/sarah.jpg",
      rating: 5
    },
    {
      quote: "The payment system is a game-changer. I get paid faster and can focus on what I love - creating.",
      author: "Marcus Johnson",
      role: "Freelance Developer", 
      company: "CodeCraft LLC",
      avatar: "/avatars/marcus.jpg",
      rating: 5
    },
    {
      quote: "Client collaboration has never been this smooth. Everyone knows exactly what's needed.",
      author: "Elena Rodriguez",
      role: "Brand Designer",
      company: "Creative Minds",
      avatar: "/avatars/elena.jpg", 
      rating: 5
    }
  ]

  const stats = [
    { number: "50K+", label: "Active Creators" },
    { number: "2M+", label: "Files Shared" },
    { number: "$10M+", label: "Paid to Creators" },
    { number: "99.9%", label: "Uptime" }
  ]

  return (
    <section id="testimonials" data-testid="social-proof-section" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div data-testid="statistics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} data-testid={`statistic-${index}`} className="text-center">
              <div data-testid={`stat-number-${index}`} className="text-4xl lg:text-5xl font-bold text-indigo-600 mb-2">{stat.number}</div>
              <div data-testid={`stat-label-${index}`} className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 data-testid="testimonials-title" className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Loved by creators worldwide
          </h2>
          <p data-testid="testimonials-subtitle" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of creatives who've transformed their workflow
          </p>
        </div>

        <div data-testid="testimonials-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} data-testid={`testimonial-${index}`} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-indigo-600/20 mb-4" />
                <p data-testid={`testimonial-quote-${index}`} className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-4"></div>
                  <div>
                    <div data-testid={`testimonial-author-${index}`} className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div data-testid={`testimonial-role-${index}`} className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Testimonials CTA */}
        <div className="text-center mt-16">
          <Link href="/community">
            <Button size="lg" variant="outline" className="px-8 py-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50">
              Join Our Community
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Pricing section with proper styling
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out FreeflowZee",
      features: [
        "Up to 3 projects",
        "1GB storage",
        "Basic client sharing",
        "Email support",
        "Standard templates"
      ],
      cta: "Get Started Free",
      highlight: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "month",
      description: "Best for freelancers and small agencies",
      features: [
        "Unlimited projects",
        "100GB storage",
        "Advanced collaboration",
        "Priority support", 
        "Custom branding",
        "Payment processing",
        "Analytics dashboard"
      ],
      cta: "Start Free Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For teams and large organizations",
      features: [
        "Everything in Professional",
        "1TB storage",
        "Team management",
        "API access",
        "Advanced security",
        "Dedicated support",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ]

  return (
    <section id="pricing" data-testid="pricing-section" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 data-testid="pricing-title" className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p data-testid="pricing-subtitle" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Start free, upgrade anytime.
          </p>
        </div>

        <div data-testid="pricing-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              data-testid={`pricing-plan-${index}`} 
              className={`relative border-2 ${plan.highlight ? 'border-indigo-500 shadow-xl scale-105' : 'border-gray-200'} hover:shadow-lg transition-all duration-300`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white px-6 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle data-testid={`plan-name-${index}`} className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span data-testid={`plan-price-${index}`} className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span data-testid={`plan-period-${index}`} className="text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription data-testid={`plan-description-${index}`} className="text-lg mt-4">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} data-testid={`plan-feature-${index}-${featureIndex}`} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  data-testid={`plan-cta-${index}`}
                  className={`w-full ${plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Pricing FAQ */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Questions about pricing?</p>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50">
              View Detailed Pricing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Newsletter Subscription Section
function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    try {
      // Simulate API call - replace with actual newsletter API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      setEmail('')
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stay Updated with FreeflowZee
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Get the latest updates, tips, and exclusive features delivered to your inbox. 
            Join thousands of creators already in the loop.
          </p>

          {isSubscribed ? (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to the Community!</h3>
              <p className="text-green-100">Check your email for a welcome message and exclusive tips.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-white text-indigo-900 hover:bg-gray-100 px-6 py-3 font-semibold whitespace-nowrap"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
              <p className="text-sm text-purple-200 mt-4">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </form>
          )}

          {/* Social Proof */}
          <div className="mt-8 flex items-center justify-center space-x-8 text-purple-200">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span className="text-sm">12,000+ Subscribers</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span className="text-sm">Weekly Updates</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span className="text-sm">Exclusive Content</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// CTA section with proper button colors
function CTASection() {
  return (
    <section data-testid="cta-section" className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 data-testid="cta-title" className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to transform your creative workflow?
        </h2>
        <p data-testid="cta-subtitle" className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
          Join thousands of creators who've streamlined their process and increased their income with FreeflowZee.
        </p>
        <div data-testid="cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button data-testid="cta-signup-button" size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button data-testid="cta-demo-button" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4">
              Watch Demo
              <Eye className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Main landing page component
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Suspense fallback={null}>
        <VerificationReminder />
      </Suspense>
      <HeroSection />
      <UserTypesSection />
      <FeaturesSection />
      <InteractiveFeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <NewsletterSection />
      <CTASection />
      <SiteFooter />
    </div>
  )
} 