'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DemoModal } from '@/components/demo-modal'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
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
            
            <Button 
              data-testid="hero-cta-demo" 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-300 hover:border-indigo-300 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm bg-white/80"
              onClick={() => setIsDemoOpen(true)}
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
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

// How it works section inspired by Dropbox's clean design
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
                  <Link href="/signup">
                    <Button data-testid={`step-cta-${index}`} variant="outline" className="mt-4">
                      Get Started
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex-1">
                  <div 
                    data-testid={`step-demo-${index}`} 
                    className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 aspect-video flex items-center justify-center cursor-pointer hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 group"
                    onClick={() => setIsDemoOpen(true)}
                  >
                    <div className="text-center">
                      <IconComponent className="w-20 h-20 mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-indigo-600 font-medium group-hover:text-indigo-700">Demo Preview</p>
                      <p className="text-indigo-500 text-sm mt-2 opacity-75">Click to watch</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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

// Social proof section
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
    <section id="testimonials" data-testid="social-proof-section" className="py-24 bg-white">
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
            <Card key={index} data-testid={`testimonial-${index}`} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
      description: "Perfect for trying out FreeflowZee",
      features: [
        "5GB storage",
        "3 active projects",
        "Basic collaboration tools",
        "Email support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Professional", 
      price: "$19",
      description: "For serious creatives and freelancers",
      features: [
        "100GB storage",
        "Unlimited projects",
        "Advanced collaboration",
        "Payment processing",
        "Priority support",
        "Custom branding"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Agency",
      price: "$49",
      description: "For teams and agencies",
      features: [
        "500GB storage", 
        "Team management",
        "White-label solutions",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <section id="pricing" data-testid="pricing-section" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 data-testid="pricing-title" className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p data-testid="pricing-subtitle" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div data-testid="pricing-plans" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} data-testid={`pricing-card-${plan.name.toLowerCase()}`} className={`relative border-2 ${plan.popular ? 'border-indigo-500 shadow-2xl scale-105' : 'border-gray-200'} hover:shadow-xl transition-all duration-300`}>
              {plan.popular && (
                <Badge data-testid="pricing-popular-badge" className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-1">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 data-testid={`pricing-plan-name-${plan.name.toLowerCase()}`} className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span data-testid={`pricing-plan-price-${plan.name.toLowerCase()}`} className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== "Free" && <span className="text-gray-600">/month</span>}
                  </div>
                  <p data-testid={`pricing-plan-description-${plan.name.toLowerCase()}`} className="text-gray-600">{plan.description}</p>
                </div>

                <ul data-testid={`pricing-features-${plan.name.toLowerCase()}`} className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.name === 'Agency' ? '/contact' : '/signup'}>
                  <Button 
                    data-testid={`pricing-cta-${plan.name.toLowerCase()}`}
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white border-2 border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p data-testid="pricing-trial-info" className="text-gray-600">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}

// CTA section
function CTASection() {
  return (
    <section data-testid="cta-section" className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 data-testid="cta-title" className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to transform your workflow?
        </h2>
        <p data-testid="cta-subtitle" className="text-xl text-indigo-100 mb-10 leading-relaxed">
          Join 50,000+ creators who've already made the switch to faster, smarter project management.
        </p>
        
        <div data-testid="cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button data-testid="cta-primary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button data-testid="cta-sales" size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 text-lg font-semibold rounded-xl">
              Talk to Sales
            </Button>
          </Link>
        </div>

        <p data-testid="cta-disclaimer" className="text-indigo-200 mt-6 text-sm">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  )
}

// Legacy Navigation component - replaced with SiteHeader
// Keeping for reference but no longer used

// Main landing page component
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader variant="transparent" />
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