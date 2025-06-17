'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Quote
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

          {/* CTA Buttons */}
          <div data-testid="hero-cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/signup">
              <Button data-testid="hero-cta-primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/demo">
              <Button 
                data-testid="hero-cta-demo" 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-300 hover:border-indigo-300 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm bg-white/80"
              >
                <Play className="mr-2 w-5 h-5" />
                Try Demo
              </Button>
            </Link>
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
              <Link key={index} href="/features">
                <Card data-testid={`feature-card-${index}`} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 cursor-pointer">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 data-testid={`feature-title-${index}`} className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p data-testid={`feature-description-${index}`} className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// How it works section with step-by-step breakdown
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Work",
      description: "Drag and drop files, folders, or entire projects. Our AI automatically organizes everything.",
      icon: Upload,
      features: ["Bulk upload", "Auto-organization", "Version control", "Smart previews"]
    },
    {
      number: "02", 
      title: "Collaborate & Get Feedback",
      description: "Share with clients, collect feedback, and iterate. Real-time comments and approvals.",
      icon: MessageSquare,
      features: ["Real-time feedback", "Visual annotations", "Approval workflows", "Version tracking"]
    },
    {
      number: "03",
      title: "Deliver & Get Paid",
      description: "Finalize deliverables and get paid instantly. Automated invoicing and secure payments.",
      icon: DollarSign,
      features: ["Auto invoicing", "Instant payments", "Client portal", "Payment tracking"]
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
            From upload to payment in three simple steps. We've streamlined every part of the creative workflow.
          </p>
        </div>

        <div className="space-y-20">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            const isEven = index % 2 === 0
            
            return (
              <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-bold text-indigo-600/20">{step.number}</span>
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">{step.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <IconComponent className="w-20 h-20 mx-auto mb-4 text-indigo-600" />
                      <p className="text-indigo-600 font-medium">Interactive Demo</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Social proof section with stats and testimonials
function SocialProofSection() {
  const stats = [
    { number: "50K+", label: "Active Creators", growth: "+23% this month" },
    { number: "2M+", label: "Files Shared", growth: "Secure & organized" },
    { number: "$10M+", label: "Paid to Creators", growth: "24hr processing" },
    { number: "99.9%", label: "Uptime", growth: "Enterprise SLA" }
  ]

  const testimonials = [
    {
      quote: "FreeflowZee transformed how I work with clients. The feedback system alone saved me 10 hours per project.",
      author: "Sarah Chen",
      role: "UI/UX Designer",
      company: "Freelance",
      avatar: "/avatars/sarah-chen.jpg",
      rating: 5
    },
    {
      quote: "Getting paid used to take weeks. Now it's instant. This platform is a game-changer for freelancers.",
      author: "Marcus Rodriguez",
      role: "Video Producer",
      company: "Motion Studio",
      avatar: "/avatars/marcus.jpg",
      rating: 5
    },
    {
      quote: "The collaboration features are incredible. Clients love how easy it is to review and approve work.",
      author: "Emily Johnson",
      role: "Graphic Designer",
      company: "Creative Co.",
      avatar: "/avatars/emily.jpg",
      rating: 5
    }
  ]

  return (
    <section data-testid="social-proof-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-indigo-600 mb-2">{stat.number}</div>
              <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.growth}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Loved by creators worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of creative professionals who've transformed their workflow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-indigo-600/20 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-4 flex items-center justify-center text-white font-semibold">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
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

// Pricing section with clear value propositions
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for trying out the platform",
      features: [
        "Up to 3 projects",
        "Basic file sharing",
        "Email support",
        "5GB storage"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "Everything freelancers need to scale",
      features: [
        "Unlimited projects",
        "Advanced collaboration",
        "Priority support",
        "100GB storage",
        "Custom branding",
        "Analytics dashboard"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Agency",
      price: "$99",
      period: "per month",
      description: "For teams and growing agencies",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Advanced analytics",
        "White-label solution",
        "1TB storage",
        "Priority support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <section id="pricing" data-testid="pricing-section" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include our core features with no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-indigo-500 shadow-xl scale-105' : 'border-gray-200'} transition-all duration-300 hover:shadow-lg`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== "forever" && <span className="text-gray-600 ml-2">{plan.period}</span>}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                <Button 
                  className={`w-full mt-8 ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">All plans include 14-day free trial • No credit card required</p>
          <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Need a custom plan? Contact us →
          </Link>
        </div>
      </div>
    </section>
  )
}

// Final CTA section with strong conversion focus
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to transform your 
          <span className="block text-yellow-300">creative workflow?</span>
        </h2>
        
        <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
          Join 50,000+ creative professionals who trust FreeflowZee to manage their projects and get paid faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-12 py-6 text-lg font-semibold rounded-xl shadow-2xl">
              Start Free Trial
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
          
          <Link href="/demo">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-xl px-12 py-6 text-lg font-semibold rounded-xl"
            >
              <Play className="mr-3 w-5 h-5" />
              Watch Demo
            </Button>
          </Link>
        </div>

        <p className="text-indigo-200 mt-8 text-sm">
          Free 14-day trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  )
}

// Main landing page component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
      <SiteFooter />
    </div>
  )
} 