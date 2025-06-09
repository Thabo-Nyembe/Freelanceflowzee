'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
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
  Quote
} from 'lucide-react'

// Hero section with animated gradient background
function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

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

          {/* Three Main CTA Buttons */}
          <div data-testid="hero-cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/login?redirect=/dashboard">
              <Button data-testid="creator-login-button" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Creator Login
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/demo">
              <Button 
                data-testid="watch-demo-button" 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-300 hover:border-indigo-300 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm bg-white/80"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </Link>

            <Link href="/payment">
              <Button data-testid="client-access-button" size="lg" variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Client Access
                <Eye className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* User Types Description */}
          <div className="mb-16 text-center">
            <p className="text-sm text-gray-500 mb-4">Not sure which one you are?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <strong className="text-indigo-600">Creators:</strong> Freelancers, designers, agencies managing projects
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <strong className="text-purple-600">Clients:</strong> Businesses looking to view and download project files
              </div>
            </div>
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
    </section>
  )
}

// User Types Section
function UserTypesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Two Types of 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Users</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FreeflowZee serves both creators who build projects and clients who access them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Creators Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Creators</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Freelancers, designers, and agencies who create and manage client projects.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-3" />
                  Dashboard with 9 comprehensive tabs
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-3" />
                  Project management tools
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-3" />
                  Client collaboration features
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-3" />
                  Payment processing & invoicing
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-3" />
                  Analytics and reporting
                </li>
              </ul>
              <Link href="/login?redirect=/dashboard">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg">
                  Creator Login
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Clients Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Clients</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Businesses and individuals who want to view and download project deliverables.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                  Access projects with secure login
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                  Preview content before purchasing
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                  Secure payment processing
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                  Download premium content
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                  Direct creator communication
                </li>
              </ul>
              <Link href="/payment">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg">
                  View Projects
                  <Eye className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

// Features section inspired by WeTransfer's simplicity
function FeaturesSection() {
  const features = [
    {
      icon: Upload,
      title: "Upload Anything",
      description: "Share files up to 10GB with lightning-fast uploads. Support for all major file types.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "Client Collaboration",
      description: "Real-time feedback, comments, and approvals. Keep everyone in sync.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: DollarSign,
      title: "Get Paid Fast",
      description: "Automated invoicing and payment processing. Get paid in days, not months.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance. Your work is always protected.",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track engagement, monitor performance, and optimize your workflow.",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed. Upload, share, and collaborate without waiting.",
      color: "from-indigo-500 to-purple-600"
    }
  ]

  return (
    <section id="features" data-testid="features-section" className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
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
              <Card key={index} data-testid={`feature-card-${index}`} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 data-testid={`feature-title-${index}`} className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p data-testid={`feature-description-${index}`} className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// How It Works section with step-by-step process
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up as a creator or access as a client. Choose your path based on your needs.",
      icon: Users,
      color: "from-indigo-500 to-blue-600"
    },
    {
      number: "02", 
      title: "Upload & Organize",
      description: "Creators upload projects and organize them. Clients get secure access links.",
      icon: Upload,
      color: "from-purple-500 to-pink-600"
    },
    {
      number: "03",
      title: "Collaborate & Preview",
      description: "Real-time collaboration tools. Clients can preview content before purchasing.",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-600"
    },
    {
      number: "04",
      title: "Get Paid & Download",
      description: "Secure payments processed instantly. Immediate access to premium content.",
      icon: Download,
      color: "from-yellow-500 to-orange-600"
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> It Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, streamlined process for both creators and clients. Get started in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={index} className="relative text-center group">
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 z-0"></div>
                )}
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${step.color} mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="text-sm font-bold text-gray-400 mb-2">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Social Proof section with testimonials
function SocialProofSection() {
  const testimonials = [
    {
      quote: "FreeflowZee has revolutionized how I work with clients. The payment system is seamless and the collaboration tools are amazing.",
      author: "Sarah Chen",
      role: "Freelance Designer",
      avatar: "SC"
    },
    {
      quote: "As a client, I love how easy it is to preview work and make payments. The whole process is smooth and professional.",
      author: "Michael Torres",
      role: "Marketing Director",
      avatar: "MT"  
    },
    {
      quote: "The analytics dashboard gives me insights I never had before. I can see exactly how my projects are performing.",
      author: "Emma Johnson",
      role: "Creative Agency Owner",
      avatar: "EJ"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Trusted by 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Thousands</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our users are saying about their experience with FreeflowZee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <Quote className="w-10 h-10 text-indigo-300 mb-4" />
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing section
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Up to 3 projects",
        "1GB storage",
        "Basic analytics",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional", 
      price: "$29",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Unlimited projects",
        "100GB storage", 
        "Advanced analytics",
        "Priority support",
        "Custom branding"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "API access",
        "24/7 phone support",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Simple 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative group transition-all duration-300 border-0 ${plan.popular ? 'ring-2 ring-indigo-600 shadow-2xl scale-105' : 'hover:shadow-xl'} bg-gradient-to-br from-white to-gray-50`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-indigo-600 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full font-semibold py-3 rounded-lg ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Final CTA section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
          Join thousands of creators and clients who trust FreeflowZee for their project management and collaboration needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl">
              Start Creating Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader variant="transparent" />
      <HeroSection />
      <UserTypesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
      <SiteFooter />
    </div>
  )
} 