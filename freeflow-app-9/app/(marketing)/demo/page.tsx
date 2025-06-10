'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import {
  Shield, Calendar, Receipt, Target, Image, User, MessageSquare,
  LayoutDashboard, Rocket, Play, ExternalLink, ChevronRight,
  Sparkles, Clock, Users, FileText, TrendingUp, Award,
  Zap, Heart, Star, DollarSign, ArrowLeft
} from 'lucide-react'

const DEMO_FEATURES = [
  {
    id: 'escrow',
    name: 'Escrow System',
    description: 'Complete escrow management with client deposit tracking, milestone payments, and secure fund release',
    href: '/dashboard/escrow',
    icon: Shield,
    status: '100% Complete',
    color: 'from-green-500 to-emerald-600',
    features: [
      'Client deposit tracking with real-time updates',
      'Milestone-based payments with progress tracking', 
      'Secure fund holding with password protection',
      'Automated release triggers on completion',
      'Comprehensive dashboard for transparency'
    ]
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'Advanced calendar system with multiple views, event management, and revenue tracking',
    href: '/dashboard/bookings',
    icon: Calendar,
    status: '100% Complete',
    color: 'from-blue-500 to-indigo-600',
    features: [
      'Month/Week/Day views with seamless navigation',
      'Client meetings and deadline management',
      'Revenue tracking for billable appointments',
      'Priority management with visual indicators',
      'Professional booking system integration'
    ]
  },
  {
    id: 'invoicing',
    name: 'Invoice Generation',
    description: 'Professional invoicing system with templates, tax calculations, and payment tracking',
    href: '/dashboard/financial',
    icon: Receipt,
    status: '100% Complete',
    color: 'from-purple-500 to-violet-600',
    features: [
      'Professional templates with customization',
      'Comprehensive client management system',
      'Automatic tax calculations and currency support',
      'Status tracking (Draft/Sent/Paid/Overdue)',
      'PDF export and printing capabilities'
    ]
  },
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    description: 'Comprehensive project management with deliverables, progress tracking, and team collaboration',
    href: '/dashboard/project-tracker',
    icon: Target,
    status: '100% Complete',
    color: 'from-orange-500 to-red-600',
    features: [
      'Visual progress bars with completion tracking',
      'Milestone integration with payment systems',
      'Advanced team collaboration tools',
      'Integrated client communication platform',
      'Comprehensive deliverable management'
    ]
  },
  {
    id: 'gallery',
    name: 'Gallery System',
    description: 'Professional portfolio gallery like Pixieset with client access controls and secure sharing',
    href: '/dashboard/gallery',
    icon: Image,
    status: '100% Complete',
    color: 'from-pink-500 to-rose-600',
    features: [
      'Pixieset-style professional client galleries',
      'Advanced secure access controls',
      'Professional image and video layouts',
      'Comprehensive download management',
      'Granular client access permissions'
    ]
  },
  {
    id: 'cv-portfolio',
    name: 'CV/Portfolio Profile',
    description: 'Professional freelancer showcase with portfolio gallery and performance analytics',
    href: '/dashboard/cv-portfolio',
    icon: User,
    status: '100% Complete',
    color: 'from-teal-500 to-cyan-600',
    features: [
      'Professional freelancer showcase platform',
      'Interactive portfolio gallery with work samples',
      'Skills and experience timeline visualization',
      'Comprehensive performance statistics dashboard',
      'Client reviews and testimonials system'
    ]
  },
  {
    id: 'collaboration',
    name: 'Client Collaboration',
    description: 'Advanced collaboration with video annotations, image comments, and approval workflows',
    href: '/dashboard/collaboration',
    icon: MessageSquare,
    status: '100% Complete',
    color: 'from-indigo-500 to-purple-600',
    features: [
      'Video annotation with precise time-codes ✨',
      'Image commenting with position-specific feedback ✨',
      'Like/favorite system for client preferences ✨',
      'Multi-step approval workflows with notifications',
      'Real-time feedback exchange and notifications'
    ]
  }
]

const DASHBOARD_AREAS = [
  { name: 'My Day', href: '/dashboard/my-day', icon: Clock, description: 'Daily overview and tasks' },
  { name: 'Team', href: '/dashboard/team', icon: Users, description: 'Team management and collaboration' },
  { name: 'Files', href: '/dashboard/files', icon: FileText, description: 'File management and sharing' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, description: 'Performance analytics and insights' },
  { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Sparkles, description: 'AI-powered assistance' },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Award, description: 'Real-time notifications' },
  { name: 'Profile', href: '/dashboard/profile', icon: User, description: 'User profile management' },
  { name: 'Community', href: '/dashboard/community', icon: Users, description: 'Community features' }
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SiteHeader variant="minimal" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            🎬 FreeflowZee Platform Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore all our completed features - every button and link is fully functional and ready to use
          </p>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-6 py-3">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">All Features 100% Complete</span>
            <Badge className="bg-green-600 text-white">Production Ready</Badge>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/dashboard">
              <Button className="w-full h-20 flex flex-col items-center gap-2 hover:scale-105 transition-all">
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-sm font-medium">Full Dashboard</span>
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:scale-105 transition-all">
                <Sparkles className="w-6 h-6" />
                <span className="text-sm font-medium">All Features</span>
              </Button>
            </Link>
            <Link href="/projects/new">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:scale-105 transition-all">
                <Rocket className="w-6 h-6" />
                <span className="text-sm font-medium">Start Project</span>
              </Button>
            </Link>
            <Link href="/book-appointment">
              <Button variant="secondary" className="w-full h-20 flex flex-col items-center gap-2 hover:scale-105 transition-all">
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-medium">Book Meeting</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Demos */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Feature Demonstrations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {DEMO_FEATURES.map((feature) => (
              <Card 
                key={feature.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-slate-100"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-green-600 text-white text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                    {feature.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    {feature.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-start text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500">
                      +{feature.features.length - 3} more features available
                    </div>
                  </div>
                  <Link href={feature.href}>
                    <Button className="w-full">
                      Try {feature.name}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dashboard Areas */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Dashboard Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {DASHBOARD_AREAS.map((area) => (
              <Link key={area.name} href={area.href}>
                <Button 
                  variant="outline" 
                  className="w-full h-20 flex flex-col items-center justify-center gap-1 hover:bg-indigo-50 text-xs group"
                >
                  <area.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{area.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎉 Platform Status</h2>
            <p className="text-xl mb-6">Every feature shown here is fully functional and ready for production use!</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">7</div>
                <div className="text-sm">Major Features</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm">Production Ready</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm">Features Working</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm">Broken Links</div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3">
                  Launch Full Platform
                  <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <SiteFooter />
    </div>
  )
} 