'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  Quote,
  CreditCard,
  Image as ImageIcon,
  MessageCircle,
  Check,
  Crown,
  Target,
  Brain,
  Layers,
  Lock,
  Workflow
} from 'lucide-react'

// Enhanced Hero section with modern messaging and SEO optimization
function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-violet-400/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full filter blur-[100px] animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* SEO Optimized Badge */}
          <Badge data-testid="hero-badge" variant="secondary" className="mb-8 bg-white/80 backdrop-blur-sm border border-white/20 px-6 py-2 text-sm font-medium">
            <Crown className="w-4 h-4 mr-2 text-amber-500" />
            #1 Platform for Creative Professionals
          </Badge>

          {/* SEO-Optimized Main heading */}
          <h1 data-testid="hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-extralight tracking-tight">
            <span className="block text-gray-900 mb-2">Create, Share &</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-light">
              Get Paid
            </span>
          </h1>

          {/* Enhanced SEO-focused subheading */}
          <p data-testid="hero-subtitle" className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            The complete freelance management platform that helps creative professionals showcase work, collaborate with clients, and get paid faster — all with enterprise-grade security and AI-powered insights.
          </p>

          {/* Enhanced CTA Buttons */}
          <div data-testid="hero-cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/login?redirect=/dashboard">
              <Button data-testid="creator-login-button" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg touch-target">
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/demo">
              <Button 
                data-testid="watch-demo-button" 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg border-gray-300 touch-target"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </Link>
            
            <Link href="/payment">
              <Button data-testid="view-projects-button" variant="outline" size="lg" className="px-8 py-4 text-lg border-indigo-300 text-indigo-600 hover:bg-indigo-50 touch-target">
                <Eye className="mr-2 w-5 h-5" />
                View Projects
              </Button>
            </Link>
          </div>

          {/* Not Sure Section */}
          <div className="mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50">
            <p className="text-gray-600 mb-4">Not Sure? Try First</p>
            <p className="text-sm text-gray-500">See how it works with our interactive demo</p>
          </div>
          
          {/* Enhanced trust indicators */}
          <div data-testid="hero-trust-indicators" className="pt-12">
            <p className="text-sm text-gray-500 mb-6">Trusted by 50,000+ creative professionals worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">Award Winning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Enhanced Features section with better copy and Context7 patterns
function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Project Intelligence",
      description: "Smart automation that learns your workflow, suggests optimal pricing, and predicts project timelines with 95% accuracy.",
      highlight: "95% accuracy",
      category: "Intelligence"
    },
    {
      icon: MessageCircle,
      title: "Real-time Collaboration Hub",
      description: "Advanced commenting, approval workflows, and version control that eliminates revision chaos and keeps projects on track.",
      highlight: "Zero email chains",
      category: "Collaboration"
    },
    {
      icon: Shield,
      title: "Enterprise Security & Compliance",
      description: "Bank-level encryption, SOC 2 compliance, and granular permission controls protect your valuable creative assets.",
      highlight: "SOC 2 certified",
      category: "Security"
    },
    {
      icon: Zap,
      title: "Lightning-Fast Payments",
      description: "Automated invoicing, instant payment processing, and escrow protection ensure you get paid within 24 hours.",
      highlight: "24hr payouts",
      category: "Payments"
    },
    {
      icon: Target,
      title: "Client Experience Platform",
      description: "Branded client portals, interactive galleries, and seamless handoff experiences that wow clients and win repeat business.",
      highlight: "3x more referrals",
      category: "Client Experience"
    },
    {
      icon: BarChart3,
      title: "Business Growth Analytics",
      description: "Deep insights into profitability, client satisfaction, and market positioning to scale your creative business strategically.",
      highlight: "Data-driven growth",
      category: "Analytics"
    }
  ]

  return (
    <section id="features" data-testid="features-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 data-testid="features-title" className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> scale your creative business</span>
          </h2>
          <p data-testid="features-subtitle" className="text-xl text-gray-600 max-w-3xl mx-auto">
            From AI-powered project management to enterprise-grade security, FreeflowZee provides the complete toolkit for modern creative professionals.
          </p>
        </div>

        <div data-testid="features-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} data-testid={`feature-${index}`} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-600">
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </CardDescription>
                  <div className="flex items-center text-sm font-medium text-indigo-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {feature.highlight}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Enhanced How It Works Section matching the screenshots
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Work",
      description: "Drag and drop files, folders, or entire projects. Our AI automatically organizes, tags, and creates smart previews for instant access.",
      icon: Upload,
      features: ["Bulk upload", "Auto-organization", "Smart previews", "Version control"],
      cta: "Get Started"
    },
    {
      number: "02", 
      title: "Collaborate & Get Feedback",
      description: "Share with clients through branded portals, collect real-time feedback with visual annotations, and streamline approval workflows.",
      icon: MessageSquare,
      features: ["Visual feedback", "Approval workflows", "Real-time sync", "Client portals"],
      cta: "See Demo"
    },
    {
      number: "03",
      title: "Deliver & Get Paid",
      description: "Send final deliverables through secure channels, automatically generate invoices, and receive payments with our escrow protection.",
      icon: Award,
      features: ["Secure delivery", "Auto invoicing", "Escrow protection", "24hr payouts"],
      cta: "Start Earning"
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
            Three simple steps to transform your creative workflow and accelerate your business growth
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
                  
                  {/* Feature list */}
                  <div className="grid grid-cols-2 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button data-testid={`step-cta-${index}`} variant="outline" className="mt-4 touch-target">
                    {step.cta}
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <Link href="/demo">
                    <div 
                      data-testid={`step-demo-${index}`} 
                      className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 aspect-video flex items-center justify-center cursor-pointer hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <IconComponent className="w-20 h-20 mx-auto mb-4 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                        <p className="text-indigo-600 font-medium group-hover:text-indigo-700">Demo Preview</p>
                        <p className="text-indigo-500 text-sm mt-2 opacity-75">Click to explore</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Enhanced CTA */}
        <div className="text-center mt-16">
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 touch-target">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Enhanced Social proof section with updated stats
function SocialProofSection() {
  const testimonials = [
    {
      quote: "FreeflowZee's AI insights helped me increase my project profitability by 40% in just 3 months. The platform pays for itself.",
      author: "Sarah Chen",
      role: "UI/UX Designer",
      company: "Design Studio Co.",
      avatar: "/avatars/sarah-chen.jpg",
      rating: 5,
      metrics: "40% profit increase"
    },
    {
      quote: "The escrow system and instant payments transformed my cash flow. I now get paid within 24 hours instead of waiting 30-60 days.",
      author: "Marcus Johnson",
      role: "Freelance Developer", 
      company: "CodeCraft LLC",
      avatar: "/avatars/marcus.jpg",
      rating: 5,
      metrics: "24hr payments"
    },
    {
      quote: "Client collaboration has never been this smooth. The visual feedback tools eliminated endless email threads and revision confusion.",
      author: "Elena Rodriguez",
      role: "Brand Designer",
      company: "Creative Minds",
      avatar: "/avatars/elena.jpg", 
      rating: 5,
      metrics: "Zero email chaos"
    }
  ]

  const stats = [
    { number: "50K+", label: "Active Creators", growth: "+23% this month" },
    { number: "2M+", label: "Files Shared", growth: "Secure & organized" },
    { number: "$10M+", label: "Paid to Creators", growth: "24hr processing" },
    { number: "99.9%", label: "Uptime", growth: "Enterprise SLA" }
  ]

  return (
    <section id="testimonials" data-testid="social-proof-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Stats */}
        <div data-testid="statistics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} data-testid={`statistic-${index}`} className="text-center group">
              <div data-testid={`stat-number-${index}`} className="text-4xl lg:text-5xl font-bold text-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
              <div data-testid={`stat-label-${index}`} className="text-gray-900 font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.growth}</div>
            </div>
          ))}
        </div>

        {/* Enhanced Testimonials */}
        <div className="text-center mb-16">
          <h2 data-testid="testimonials-title" className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Loved by creators worldwide
          </h2>
          <p data-testid="testimonials-subtitle" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of creative professionals who've transformed their workflow and accelerated their business growth
          </p>
        </div>

        <div data-testid="testimonials-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} data-testid={`testimonial-${index}`} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-4 flex items-center justify-center text-white font-semibold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div data-testid={`testimonial-author-${index}`} className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div data-testid={`testimonial-role-${index}`} className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-600 text-xs">
                    {testimonial.metrics}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Enhanced CTA */}
        <div className="text-center mt-16">
          <Link href="/testimonials">
            <Button size="lg" variant="outline" className="px-8 py-4 mr-4 touch-target">
              Read More Stories
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 touch-target">
              Join Our Community
              <Users className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Enhanced Pricing section with better value proposition
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
        "Unlimited projects & clients",
        "Advanced collaboration tools",
        "AI-powered insights",
        "Priority support",
        "100GB storage",
        "Escrow protection",
        "Custom branding"
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
        "SSO integration",
        "Dedicated support"
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
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                <Button 
                  className={`w-full mt-8 ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} touch-target`}
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

// Enhanced CTA section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to accelerate your 
          <span className="block text-yellow-300">creative business?</span>
        </h2>
        
        <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
          Join 50,000+ creative professionals who trust FreeflowZee to manage their most important projects and accelerate their business growth.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-12 py-6 text-lg font-semibold rounded-xl shadow-2xl touch-target">
              Start Free Trial
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
          
          <Link href="/demo">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-xl px-12 py-6 text-lg font-semibold rounded-xl touch-target"
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

// Main landing page component with SEO optimization
export default function LandingPage() {
  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>FreeflowZee - Complete Freelance Management Platform for Creative Professionals</title>
        <meta name="description" content="The #1 platform for creative professionals to showcase work, collaborate with clients, and get paid faster. AI-powered insights, enterprise security, and 24hr payments." />
        <meta name="keywords" content="freelance management, creative platform, project collaboration, payment processing, portfolio showcase, client management" />
        <meta property="og:title" content="FreeflowZee - Complete Freelance Management Platform" />
        <meta property="og:description" content="Transform your creative workflow with AI-powered project management, real-time collaboration, and instant payments." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://freeflowzee.com" />
      </head>
      
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
    </>
  )
} 