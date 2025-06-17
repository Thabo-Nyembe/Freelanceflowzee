'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Shield, Calendar, Receipt, Target, Image, User, MessageSquare,
  LayoutDashboard, Rocket, Play, ExternalLink, ChevronRight,
  Sparkles, Video, Heart, Star, Clock, FileText, Users,
  TrendingUp, Award, DollarSign, Zap
} from 'lucide-react'

interface FeatureRoute {
  id: string
  name: string
  description: string
  href: string
  icon: any
  status: 'complete'
  completionLevel: number
  category: 'core' | 'advanced' | 'collaboration' | 'business'
  features: string[]
  demoPath?: string
}

const ENHANCED_FEATURES: FeatureRoute[] = [
  {
    id: 'escrow',
    name: 'Escrow System',
    description: 'Complete escrow management with client deposit tracking and secure payments',
    href: '/dashboard/escrow',
    icon: Shield,
    status: 'complete',
    completionLevel: 100,
    category: 'business',
    features: [
      'Client deposit tracking',
      'Milestone-based payments', 
      'Secure fund holding',
      'Password-protected release',
      'Client & freelancer dashboards'
    ],
    demoPath: '/demo/escrow'
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'Advanced calendar with multiple views and professional booking system',
    href: '/dashboard/bookings',
    icon: Calendar,
    status: 'complete',
    completionLevel: 100,
    category: 'core',
    features: [
      'Month/Week/Day views',
      'Client meetings & deadlines',
      'Revenue tracking for appointments',
      'Priority management',
      'Professional booking system'
    ],
    demoPath: '/demo/calendar'
  },
  {
    id: 'invoicing',
    name: 'Invoice Generation',
    description: 'Professional invoicing with templates and comprehensive payment tracking',
    href: '/dashboard/financial',
    icon: Receipt,
    status: 'complete',
    completionLevel: 100,
    category: 'business',
    features: [
      'Professional templates',
      'Client management system',
      'Tax calculations & currency support',
      'Status tracking (Draft/Sent/Paid/Overdue)',
      'PDF export & printing'
    ]
  },
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    description: 'Comprehensive project management with deliverables and team collaboration',
    href: '/dashboard/project-tracker',
    icon: Target,
    status: 'complete',
    completionLevel: 100,
    category: 'core',
    features: [
      'Progress bars with completion tracking',
      'Milestone & payment integration',
      'Team collaboration tools',
      'Client communication platform',
      'Deliverable management'
    ]
  },
  {
    id: 'gallery',
    name: 'Gallery System',
    description: 'Professional portfolio gallery like Pixieset with client access controls',
    href: '/dashboard/gallery',
    icon: Image,
    status: 'complete',
    completionLevel: 100,
    category: 'advanced',
    features: [
      'Pixieset-style client galleries',
      'Secure access controls',
      'Professional image/video layouts',
      'Download management system',
      'Client access permissions'
    ]
  },
  {
    id: 'cv-portfolio',
    name: 'CV/Portfolio Profile',
    description: 'Professional freelancer showcase with portfolio and performance analytics',
    href: '/dashboard/cv-portfolio',
    icon: User,
    status: 'complete',
    completionLevel: 100,
    category: 'advanced',
    features: [
      'Professional freelancer showcase',
      'Portfolio gallery with work samples',
      'Skills & experience timeline',
      'Performance statistics dashboard',
      'Client reviews & testimonials'
    ]
  },
  {
    id: 'collaboration',
    name: 'Client Collaboration',
    description: 'Advanced collaboration with video annotations, image comments, and workflows',
    href: '/dashboard/collaboration',
    icon: MessageSquare,
    status: 'complete',
    completionLevel: 100,
    category: 'collaboration',
    features: [
      'Video annotation with time-codes ✨',
      'Image commenting with positions ✨',
      'Like/favorite system for preferences ✨',
      'Multi-step approval workflows',
      'Real-time feedback exchange'
    ],
    demoPath: '/demo/enhanced-collaboration'
  }
]

const QUICK_ACTIONS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main dashboard overview',
    variant: 'default' as const
  },
  {
    name: 'New Project',
    href: '/projects/new',
    icon: Rocket,
    description: 'Start a new project',
    variant: 'default' as const
  },
  {
    name: 'Book Meeting',
    href: '/book-appointment',
    icon: Calendar,
    description: 'Schedule client appointment',
    variant: 'outline' as const
  },
  {
    name: 'Watch Demo',
    href: '/demo',
    icon: Play,
    description: 'See platform demo',
    variant: 'secondary' as const
  }
]

export function EnhancedNavigationSystem() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureRoute | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const router = useRouter()

  const handleFeatureClick = (feature: FeatureRoute) => {
    setSelectedFeature(feature)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    setSelectedFeature(null)
  }

  const filteredFeatures = activeCategory === 'all' 
    ? ENHANCED_FEATURES 
    : ENHANCED_FEATURES.filter(f => f.category === activeCategory)

  const categories = [
    { id: 'all', name: 'All Features', count: ENHANCED_FEATURES.length },
    { id: 'core', name: 'Core Tools', count: ENHANCED_FEATURES.filter(f => f.category === 'core').length },
    { id: 'business', name: 'Business', count: ENHANCED_FEATURES.filter(f => f.category === 'business').length },
    { id: 'advanced', name: 'Advanced', count: ENHANCED_FEATURES.filter(f => f.category === 'advanced').length },
    { id: 'collaboration', name: 'Collaboration', count: ENHANCED_FEATURES.filter(f => f.category === 'collaboration').length }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Enhanced Feature Navigation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All features are 90-100% complete and ready to use. Click any feature to explore its full capabilities.
          </p>
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl inline-block">
            <div className="flex items-center gap-2 text-green-800">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">7 Major Features Complete</span>
              <Badge className="bg-green-600 text-white">98% Production Ready</Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.name} href={action.href}>
                <Button 
                  variant={action.variant}
                  className="w-full h-20 flex flex-col items-center text-center group hover:scale-105 transition-all duration-200"
                >
                  <action.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">{action.name}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Categories */}
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">✅ Complete Features</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="text-xs"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <Card 
                key={feature.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-emerald-50"
                onClick={() => handleFeatureClick(feature)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-green-600 text-white text-xs">
                      {feature.completionLevel}% Complete
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
                      <div key={idx} className="flex items-center text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0" />
                        {feat}
                      </div>
                    ))}
                    {feature.features.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{feature.features.length - 3} more features
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs">
                      Open Feature
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                    {feature.demoPath && (
                      <Button size="sm" variant="outline" className="text-xs">
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Detail Modal */}
        {selectedFeature && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <selectedFeature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedFeature.name}</h2>
                      <Badge className="mt-1 bg-green-600 text-white">
                        {selectedFeature.completionLevel}% Complete ✅
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedFeature(null)}>✕</Button>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{selectedFeature.description}</p>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">✨ Features Available:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedFeature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => handleNavigate(selectedFeature.href)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <selectedFeature.icon className="w-4 h-4 mr-2" />
                    Open {selectedFeature.name}
                  </Button>
                  {selectedFeature.demoPath && (
                    <Button 
                      onClick={() => handleNavigate(selectedFeature.demoPath!)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      View Demo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Direct Links Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🔗 Direct Navigation Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENHANCED_FEATURES.map((feature) => (
              <Link key={feature.id} href={feature.href}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-4 h-auto hover:bg-indigo-50 group"
                >
                  <feature.icon className="w-5 h-5 mr-3 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left flex-1">
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-xs text-gray-500">{feature.href}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Dashboard Links */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Dashboard Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'My Day', href: '/dashboard/my-day', icon: Clock },
              { name: 'Team', href: '/dashboard/team', icon: Users },
              { name: 'Files', href: '/dashboard/files', icon: FileText },
              { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
              { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Sparkles },
              { name: 'Notifications', href: '/dashboard/notifications', icon: Award }
            ].map((item) => (
              <Link key={item.name} href={item.href}>
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-1 hover:bg-indigo-50">
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 