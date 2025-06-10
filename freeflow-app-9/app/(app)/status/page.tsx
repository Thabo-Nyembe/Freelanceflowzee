'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Shield, Calendar, Receipt, Target, Image, User, MessageSquare,
  LayoutDashboard, Rocket, Play, ExternalLink, ChevronRight,
  Sparkles, Clock, Users, FileText, TrendingUp, Award,
  Zap, Heart, Star, DollarSign, ArrowLeft, CheckCircle, 
  XCircle, AlertTriangle, Loader
} from 'lucide-react'

interface RouteStatus {
  path: string
  name: string
  status: 'working' | 'error' | 'untested' | 'loading'
  description: string
  category: string
  icon?: any
}

const MAIN_ROUTES: RouteStatus[] = [
  { path: '/', name: 'Landing Page', status: 'untested', description: 'Main landing page with feature overview', category: 'Marketing', icon: Sparkles },
  { path: '/dashboard', name: 'Dashboard', status: 'untested', description: 'Main dashboard with all features', category: 'App', icon: LayoutDashboard },
  { path: '/features', name: 'Features Page', status: 'untested', description: 'Complete feature showcase', category: 'Marketing', icon: Star },
  { path: '/demo', name: 'Demo Page', status: 'untested', description: 'Interactive demo and feature tour', category: 'Marketing', icon: Play },
  { path: '/book-appointment', name: 'Book Appointment', status: 'untested', description: 'Meeting booking system', category: 'Marketing', icon: Calendar },
  { path: '/payment', name: 'Payment/Client Access', status: 'untested', description: 'Client payment and access portal', category: 'Marketing', icon: DollarSign },
  { path: '/projects/new', name: 'New Project', status: 'untested', description: 'Create new project form', category: 'App', icon: Rocket }
]

const DASHBOARD_FEATURES: RouteStatus[] = [
  { path: '/dashboard/escrow', name: 'Escrow System', status: 'untested', description: 'Complete escrow management with milestone payments', category: 'Core', icon: Shield },
  { path: '/dashboard/bookings', name: 'Calendar & Scheduling', status: 'untested', description: 'Advanced calendar with multiple views', category: 'Business', icon: Calendar },
  { path: '/dashboard/financial', name: 'Invoice Generation', status: 'untested', description: 'Professional invoicing with tax calculations', category: 'Business', icon: Receipt },
  { path: '/dashboard/project-tracker', name: 'Project Tracker', status: 'untested', description: 'Progress tracking with team collaboration', category: 'Core', icon: Target },
  { path: '/dashboard/gallery', name: 'Gallery System', status: 'untested', description: 'Professional client galleries like Pixieset', category: 'Advanced', icon: Image },
  { path: '/dashboard/cv-portfolio', name: 'CV/Portfolio', status: 'untested', description: 'Professional freelancer showcase', category: 'Advanced', icon: User },
  { path: '/dashboard/collaboration', name: 'Client Collaboration', status: 'untested', description: 'Video annotations and image comments', category: 'Collaboration', icon: MessageSquare },
  { path: '/dashboard/my-day', name: 'My Day', status: 'untested', description: 'Daily overview and tasks', category: 'Core', icon: Clock },
  { path: '/dashboard/team', name: 'Team', status: 'untested', description: 'Team management and collaboration', category: 'Core', icon: Users },
  { path: '/dashboard/files', name: 'Files', status: 'untested', description: 'File management and sharing', category: 'Core', icon: FileText },
  { path: '/dashboard/analytics', name: 'Analytics', status: 'untested', description: 'Performance analytics and insights', category: 'Advanced', icon: TrendingUp },
  { path: '/dashboard/ai-assistant', name: 'AI Assistant', status: 'untested', description: 'AI-powered assistance', category: 'Advanced', icon: Sparkles },
  { path: '/dashboard/notifications', name: 'Notifications', status: 'untested', description: 'Real-time notifications', category: 'Core', icon: Award },
  { path: '/dashboard/profile', name: 'Profile', status: 'untested', description: 'User profile management', category: 'Core', icon: User },
  { path: '/dashboard/community', name: 'Community', status: 'untested', description: 'Community features', category: 'Advanced', icon: Users }
]

const STATUS_COLORS = {
  working: 'bg-green-500',
  error: 'bg-red-500',
  untested: 'bg-gray-400',
  loading: 'bg-blue-500'
}

const STATUS_ICONS = {
  working: CheckCircle,
  error: XCircle,
  untested: AlertTriangle,
  loading: Loader
}

export default function StatusPage() {
  const [routes, setRoutes] = useState([...MAIN_ROUTES, ...DASHBOARD_FEATURES])
  const [testing, setTesting] = useState(false)
  const [filter, setFilter] = useState('all')

  const testRoute = async (route: RouteStatus) => {
    setRoutes(prev => prev.map(r => 
      r.path === route.path ? { ...r, status: 'loading' } : r
    ))

    try {
      const response = await fetch(route.path, { method: 'HEAD' })
      const status = response.ok ? 'working' : 'error'
      
      setRoutes(prev => prev.map(r => 
        r.path === route.path ? { ...r, status } : r
      ))
    } catch (error) {
      setRoutes(prev => prev.map(r => 
        r.path === route.path ? { ...r, status: 'error' } : r
      ))
    }
  }

  const testAllRoutes = async () => {
    setTesting(true)
    
    for (const route of routes) {
      await testRoute(route)
      await new Promise(resolve => setTimeout(resolve, 500)) // Delay between tests
    }
    
    setTesting(false)
  }

  const filteredRoutes = routes.filter(route => {
    if (filter === 'all') return true
    if (filter === 'working') return route.status === 'working'
    if (filter === 'error') return route.status === 'error'
    if (filter === 'untested') return route.status === 'untested'
    return route.category === filter
  })

  const getStats = () => {
    const working = routes.filter(r => r.status === 'working').length
    const error = routes.filter(r => r.status === 'error').length
    const untested = routes.filter(r => r.status === 'untested').length
    const total = routes.length
    
    return { working, error, untested, total }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            🔍 FreeflowZee Platform Status
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive status check for all routes and features - test navigation and identify any issues
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Routes</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <LayoutDashboard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Working</p>
                  <p className="text-2xl font-bold text-green-600">{stats.working}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{stats.error}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Untested</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.untested}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={testAllRoutes} 
                disabled={testing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test All Routes
                  </>
                )}
              </Button>
              
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">All Routes ({routes.length})</option>
                <option value="working">Working ({stats.working})</option>
                <option value="error">Errors ({stats.error})</option>
                <option value="untested">Untested ({stats.untested})</option>
                <option value="Marketing">Marketing</option>
                <option value="App">App</option>
                <option value="Core">Core Features</option>
                <option value="Business">Business</option>
                <option value="Advanced">Advanced</option>
                <option value="Collaboration">Collaboration</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              {stats.working > 0 && (
                <span className="text-green-600 font-medium">
                  {Math.round((stats.working / stats.total) * 100)}% Working
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRoutes.map((route) => {
            const StatusIcon = STATUS_ICONS[route.status]
            const RouteIcon = route.icon || ExternalLink
            
            return (
              <Card key={route.path} className="bg-white hover:shadow-lg transition-all duration-300 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <RouteIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {route.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[route.status]}`} />
                      <StatusIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4">{route.description}</p>
                  <div className="flex gap-2">
                    <Link href={route.path}>
                      <Button size="sm" className="flex-1">
                        Visit Page
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => testRoute(route)}
                      disabled={route.status === 'loading'}
                    >
                      {route.status === 'loading' ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {route.path}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">🚀 Quick Actions</h2>
            <p className="text-indigo-100">Jump directly to key platform areas</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/features">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20">
                <Star className="w-4 h-4 mr-2" />
                Features
              </Button>
            </Link>
            <Link href="/demo">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20">
                <Play className="w-4 h-4 mr-2" />
                Demo
              </Button>
            </Link>
            <Link href="/enhanced-navigation">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Enhanced Nav
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 