'use client'

import { useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  UserCheck,
  FolderOpen,
  MessageSquare,
  FileText,
  Star,
  DollarSign,
  Bell,
  Image,
  Calendar,
  Receipt,
  Shield,
  Brain,
  BarChart3,
  Settings,
  CheckCircle,
  Briefcase,
  TrendingUp,
  Users,
  Target,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// A+++ UTILITIES
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { KAZI_CLIENT_DATA } from '@/lib/client-zone-utils'

// NEW CLIENT VALUE COMPONENTS
import { ClientOnboardingTour } from '@/components/onboarding/client-onboarding-tour'

const logger = createFeatureLogger('ClientZoneLayout')

interface ClientZoneLayoutProps {
  children: ReactNode
}

const tabs = [
  { id: 'projects', label: 'My Projects', icon: FolderOpen, path: '/dashboard/client-zone' },
  { id: 'gallery', label: 'Gallery', icon: Image, path: '/dashboard/client-zone/gallery' },
  { id: 'calendar', label: 'Schedule', icon: Calendar, path: '/dashboard/client-zone/calendar' },
  { id: 'invoices', label: 'Invoices', icon: Receipt, path: '/dashboard/client-zone/invoices' },
  { id: 'payments', label: 'Payments', icon: Shield, path: '/dashboard/client-zone/payments' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/client-zone/messages' },
  { id: 'files', label: 'Files', icon: FileText, path: '/dashboard/client-zone/files' },
  { id: 'ai-collaborate', label: 'AI Collaborate', icon: Brain, path: '/dashboard/client-zone/ai-collaborate' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard/client-zone/analytics' },
  { id: 'value-dashboard', label: 'ROI & Value', icon: Target, path: '/dashboard/client-zone/value-dashboard' },
  { id: 'referrals', label: 'Rewards', icon: Zap, path: '/dashboard/client-zone/referrals' },
  { id: 'feedback', label: 'Feedback', icon: Star, path: '/dashboard/client-zone/feedback' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/client-zone/settings' }
]

export default function ClientZoneLayout({ children }: ClientZoneLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { announce } = useAnnouncer()

  // DUAL PERSPECTIVE - USER MANUAL SPEC
  // Role detection: freelancer, client, or both (for agencies)
  const [userRole, setUserRole] = useState<'freelancer' | 'client' | 'both'>('client')
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  // ============================================================================
  // HANDLER 1: NOTIFICATIONS
  // ============================================================================

  const handleNotifications = () => {
    logger.info('Notifications opened', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      activeProjects: KAZI_CLIENT_DATA.clientInfo.activeProjects
    })

  }

  // ============================================================================
  // HANDLER 2: CONTACT TEAM
  // ============================================================================

  const handleContactTeam = () => {
    logger.info('Team contact initiated', {
      client: KAZI_CLIENT_DATA.clientInfo.name,
      contactPerson: KAZI_CLIENT_DATA.clientInfo.contactPerson,
      activeProjects: KAZI_CLIENT_DATA.clientInfo.activeProjects
    })

  }

  // ============================================================================
  // TAB NAVIGATION HANDLER
  // ============================================================================

  const handleTabClick = (path: string, label: string) => {
    logger.info('Tab navigation', { path, label })
    announce(`Navigating to ${label}`, 'polite')
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* ============================================================================
            HEADER SECTION (Lines 950-1048 from original)
            ============================================================================ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <UserCheck className="h-8 w-8" />
            </div>
            <div>
              <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                {userRole === 'freelancer' ? 'Client Management' : 'My Projects'}
              </TextShimmer>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                {userRole === 'freelancer'
                  ? `Manage your clients and track all project deliverables`
                  : `Welcome back, ${KAZI_CLIENT_DATA.clientInfo.contactPerson}! Here's your project overview.`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* ROLE SWITCHER - USER MANUAL SPEC */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="border-2 border-purple-300"
              >
                <Settings className="h-4 w-4 mr-2" />
                View as: {userRole === 'freelancer' ? 'Freelancer' : 'Client'}
              </Button>
              {showRoleSwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50"
                >
                  <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">Switch Perspective</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setUserRole('client')
                        setShowRoleSwitcher(false)
                        logger.info('Role switched to client')
                        announce('Switched to client perspective')
                        toast.success('Viewing as Client', {
                          description: 'See your projects, approvals, and downloads'
                        })
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        userRole === 'client'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Client View</p>
                          <p className="text-xs opacity-75">Track progress & approve work</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setUserRole('freelancer')
                        setShowRoleSwitcher(false)
                        logger.info('Role switched to freelancer')
                        announce('Switched to freelancer perspective')
                        toast.success('Viewing as Freelancer', {
                          description: 'Manage clients, deliverables, and payments'
                        })
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        userRole === 'freelancer'
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Freelancer View</p>
                          <p className="text-xs opacity-75">Manage clients & deliverables</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            <Button variant="outline" onClick={handleNotifications} data-testid="notifications-btn">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleContactTeam} data-testid="contact-team-btn">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Team
            </Button>
          </div>
        </div>

        {/* ============================================================================
            STATS CARDS (Lines 1050-1131 from original)
            ============================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <LiquidGlassCard variant="gradient" hoverEffect={true} className="relative overflow-hidden">
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
                <NumberFlow value={KAZI_CLIENT_DATA.clientInfo.activeProjects} className="text-2xl font-bold text-blue-600 block" />
                <p className="text-gray-600 dark:text-gray-300">Active Projects</p>
              </div>
            </LiquidGlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LiquidGlassCard variant="tinted" hoverEffect={true} className="relative overflow-hidden">
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <NumberFlow value={KAZI_CLIENT_DATA.clientInfo.completedProjects} className="text-2xl font-bold text-emerald-600 block" />
                <p className="text-gray-600 dark:text-gray-300">Completed</p>
              </div>
            </LiquidGlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LiquidGlassCard variant="gradient" hoverEffect={true} className="relative overflow-hidden">
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <NumberFlow value={KAZI_CLIENT_DATA.clientInfo.totalInvestment} format="currency" className="text-2xl font-bold text-purple-600 block" />
                <p className="text-gray-600 dark:text-gray-300">Total Investment</p>
              </div>
            </LiquidGlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LiquidGlassCard variant="tinted" hoverEffect={true} className="relative overflow-hidden">
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <Star className="h-8 w-8 text-amber-600" />
                </div>
                <NumberFlow value={parseFloat(KAZI_CLIENT_DATA.clientInfo.satisfaction)} decimals={1} className="text-2xl font-bold text-amber-600 block" />
                <p className="text-gray-600 dark:text-gray-300">Satisfaction Rating</p>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </div>

        {/* ============================================================================
            FREELANCER DASHBOARD SECTION (Lines 1134-1298 from original)
            ============================================================================ */}
        {userRole === 'freelancer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-slate-800 dark:from-transparent/50 dark:via-indigo-950/50 dark:to-blue-950/50 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Freelancer Dashboard
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage your clients, track deliverables, and monitor payment status
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Freelancer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Clients</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      <NumberFlow value={8} />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 active this month</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Deliverables</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      <NumberFlow value={12} />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">4 pending approval</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Revenue</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      <NumberFlow value={24500} format="currency" />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">$12,300 pending</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Growth</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">+23%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</p>
                  </div>
                </div>

                {/* Client List & Communications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Active Clients */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Active Clients
                    </h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Acme Corp', projects: 2, status: 'In Progress', color: 'blue' },
                        { name: 'Tech Startup Inc', projects: 1, status: 'Review', color: 'yellow' },
                        { name: 'Design Agency', projects: 1, status: 'Active', color: 'green' }
                      ].map((client, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                  {client.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{client.projects} project(s)</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`bg-${client.color}-100 text-${client.color}-700 border-${client.color}-300`}>
                              {client.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      View All Clients
                    </Button>
                  </div>

                  {/* Pending Approvals */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Pending Approvals
                    </h3>
                    <div className="space-y-2">
                      {[
                        { project: 'Website Redesign', client: 'Acme Corp', type: 'Milestone 3', amount: 2500 },
                        { project: 'Mobile App', client: 'Tech Startup', type: 'Final Delivery', amount: 5000 },
                        { project: 'Brand Identity', client: 'Design Agency', type: 'Logo Design', amount: 1200 }
                      ].map((approval, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{approval.project}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{approval.client}</p>
                            </div>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">${approval.amount.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{approval.type}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Awaiting approval</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      View All Deliverables
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-800">
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-xs">Upload Deliverable</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-800">
                      <MessageSquare className="w-5 h-5 mb-1" />
                      <span className="text-xs">Message Client</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-800">
                      <Receipt className="w-5 h-5 mb-1" />
                      <span className="text-xs">Create Invoice</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-auto py-3 bg-white dark:bg-gray-800">
                      <BarChart3 className="w-5 h-5 mb-1" />
                      <span className="text-xs">View Reports</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ============================================================================
            TAB NAVIGATION (Lines 1302-1357 from original - converted to Next.js routing)
            ============================================================================ */}
        <div className="overflow-x-auto">
          <div className="inline-flex w-max min-w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = pathname === tab.path

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path, tab.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ============================================================================
            PAGE CONTENT
            ============================================================================ */}
        {children}
      </div>

      {/* ============================================================================
          CLIENT ONBOARDING TOUR (Bottom of original)
          ============================================================================ */}
      <ClientOnboardingTour
        userRole="client"
        clientId={KAZI_CLIENT_DATA.clientInfo.email}
        onComplete={(tourId) => {
          logger.info('Onboarding tour completed', { tourId })
          toast.success('Tour completed! 🎉', {
            description: 'You earned XP and unlocked new features'
          })
        }}
      />
    </div>
  )
}
