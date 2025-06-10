'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  ChevronLeft,
  Quote,
  LayoutDashboard,
  Calendar,
  Rocket,
  Target,
  User,
  Crown,
  Gem
} from 'lucide-react'

// Luxury Hero section with sophisticated gradients and premium spacing
function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Luxury gradient background with sophisticated colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
        {/* Premium floating elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-200/15 to-indigo-200/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Glass texture overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
        <div className={`transform transition-all duration-1500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          
          {/* Premium badge */}
          <div className="mb-12">
            <Badge data-testid="hero-badge" className="bg-white/60 backdrop-blur-xl border border-white/40 px-8 py-3 text-sm font-medium text-slate-700 shadow-lg rounded-full">
              <Crown className="w-4 h-4 mr-2 text-amber-500" />
              Premium Creative Platform
            </Badge>
          </div>

          {/* Elegant main heading */}
          <h1 data-testid="hero-title" className="text-6xl sm:text-7xl lg:text-8xl font-light text-slate-800 mb-12 leading-[0.95] tracking-tight">
            Create.
            <br />
            <span className="font-extralight bg-gradient-to-r from-rose-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">Collaborate.</span>
            <br />
            Prosper.
          </h1>

          {/* Refined subheading */}
          <p data-testid="hero-subtitle" className="text-xl sm:text-2xl text-slate-600 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            The sophisticated platform where creativity meets commerce. 
            Seamlessly manage projects, delight clients, and scale your creative business.
          </p>

          {/* Premium CTA section */}
          <div data-testid="hero-cta-buttons" className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link href="/login?redirect=/dashboard">
              <Button 
                data-testid="creator-login-button" 
                size="lg" 
                className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-12 py-6 text-lg font-light rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 border border-white/20"
              >
                Start Creating
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/demo">
              <Button 
                data-testid="watch-demo-button" 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-200 hover:border-slate-300 bg-white/70 backdrop-blur-xl px-12 py-6 text-lg font-light rounded-2xl text-slate-700 hover:bg-white/80 transition-all duration-300"
              >
                <Play className="mr-3 w-5 h-5" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Elegant client access */}
          <div className="mb-16">
            <p className="text-sm text-slate-500 mb-6 font-light">Existing client?</p>
            <Link href="/payment">
              <Button 
                data-testid="client-access-button" 
                variant="ghost" 
                className="text-slate-600 hover:text-slate-800 px-8 py-3 text-base font-light rounded-xl hover:bg-white/50 backdrop-blur-sm transition-all duration-300"
              >
                <Eye className="mr-2 w-4 h-4" />
                Access Your Projects
              </Button>
            </Link>
          </div>

          {/* Minimalist social proof */}
          <div data-testid="hero-social-proof" className="flex flex-col sm:flex-row items-center justify-center gap-12 text-slate-500">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full border-2 border-white shadow-lg"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-violet-300 to-purple-300 rounded-full border-2 border-white shadow-lg"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              <span className="text-sm font-light">Trusted by 50,000+ creatives</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-300 text-amber-300" />
                ))}
              </div>
              <span className="text-sm font-light">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Sophisticated features section with luxury cards
function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Secure Escrow",
      description: "Premium payment protection with intelligent milestone tracking",
      color: "from-emerald-100 to-teal-100"
    },
    {
      icon: Users,
      title: "Client Collaboration",
      description: "Elegant real-time feedback and approval workflows",
      color: "from-blue-100 to-indigo-100"
    },
    {
      icon: BarChart3,
      title: "Project Analytics",
      description: "Beautiful insights and performance tracking",
      color: "from-violet-100 to-purple-100"
    },
    {
      icon: Crown,
      title: "Premium Gallery",
      description: "Stunning portfolio showcase with professional presentation",
      color: "from-amber-100 to-orange-100"
    },
    {
      icon: DollarSign,
      title: "Smart Invoicing",
      description: "Automated billing with sophisticated tax calculations",
      color: "from-rose-100 to-pink-100"
    },
    {
      icon: Sparkles,
      title: "AI Assistant",
      description: "Intelligent project optimization and content generation",
      color: "from-cyan-100 to-blue-100"
    }
  ]

  return (
    <section className="py-32 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-slate-800 mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-rose-400 to-violet-400 bg-clip-text text-transparent font-extralight">
              create brilliantly
            </span>
          </h2>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
            Thoughtfully designed tools that adapt to your creative workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <CardContent className="p-0">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-light text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Luxury how it works section
function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Upload & Organize",
      description: "Seamlessly upload your creative work to our secure, professional platform",
      icon: Upload
    },
    {
      step: "02", 
      title: "Collaborate & Refine",
      description: "Engage with clients through elegant feedback tools and real-time collaboration",
      icon: MessageSquare
    },
    {
      step: "03",
      title: "Deliver & Prosper",
      description: "Complete projects with confidence using our secure escrow and payment system",
      icon: Crown
    }
  ]

  return (
    <section className="py-32 bg-gradient-to-b from-slate-50/50 to-white">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-light text-slate-800 mb-6">
            Crafted for
            <span className="block bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent font-extralight">
              creative excellence
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-slate-700" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-400 to-violet-400 rounded-xl flex items-center justify-center text-white text-xs font-light">
                  {step.step}
                </div>
              </div>
              <h3 className="text-2xl font-light text-slate-800 mb-4">{step.title}</h3>
              <p className="text-slate-600 font-light leading-relaxed max-w-sm mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Minimal pricing section
function PricingSection() {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-slate-50/30">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <h2 className="text-5xl font-light text-slate-800 mb-6">
          Simple,
          <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-extralight">
            transparent pricing
          </span>
        </h2>
        
        <p className="text-xl text-slate-600 font-light mb-16">
          One platform, endless possibilities. No hidden fees, no surprises.
        </p>

        <Card className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-12 shadow-2xl max-w-md mx-auto">
          <CardContent className="p-0 text-center">
            <div className="mb-8">
              <div className="text-5xl font-light text-slate-800 mb-2">$29</div>
              <div className="text-slate-600 font-light">per month</div>
            </div>
            
            <div className="space-y-4 mb-8 text-left">
              {[
                "Unlimited projects & clients",
                "Advanced collaboration tools", 
                "Secure escrow & payments",
                "AI-powered analytics",
                "Premium support"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 font-light">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white py-4 rounded-2xl font-light text-lg shadow-xl">
              Start Free Trial
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

// Elegant CTA section
function CTASection() {
  return (
    <section className="py-32 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/10 to-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
        <h2 className="text-5xl font-light text-white mb-6">
          Ready to elevate
          <span className="block bg-gradient-to-r from-rose-400 to-violet-400 bg-clip-text text-transparent font-extralight">
            your creative business?
          </span>
        </h2>
        
        <p className="text-xl text-slate-300 font-light mb-12 max-w-2xl mx-auto">
          Join thousands of creatives who trust FreeflowZee to manage their most important projects.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/login?redirect=/dashboard">
            <Button size="lg" className="bg-white text-slate-800 hover:bg-slate-50 px-12 py-6 text-lg font-light rounded-2xl shadow-2xl">
              Get Started Free
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
          
          <Link href="/demo">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-xl px-12 py-6 text-lg font-light rounded-2xl"
            >
              <Play className="mr-3 w-5 h-5" />
              Watch Demo
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
    <div className="min-h-screen bg-white">
      <SiteHeader variant="transparent" />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <SiteFooter />
    </div>
  )
} 