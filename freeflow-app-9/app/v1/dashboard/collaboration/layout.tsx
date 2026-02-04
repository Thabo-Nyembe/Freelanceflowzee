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
  Users,
  MessageSquare,
  LayoutGrid,
  Video,
  MessageCircle,
  FileText,
  Palette,
  BarChart3,
  Calendar,
  Upload,
  Plus,
  Bell,
  Settings
} from 'lucide-react'

// A+++ UTILITIES
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { KAZI_COLLABORATION_DATA } from '@/lib/collaboration-utils'

const logger = createSimpleLogger('CollaborationLayout')

interface CollaborationLayoutProps {
  children: ReactNode
}

const tabs = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/dashboard/collaboration' },
  { id: 'teams', label: 'Teams', icon: Users, path: '/dashboard/collaboration/teams' },
  { id: 'workspace', label: 'Workspace', icon: LayoutGrid, path: '/dashboard/collaboration/workspace' },
  { id: 'meetings', label: 'Meetings', icon: Video, path: '/dashboard/collaboration/meetings' },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle, path: '/dashboard/collaboration/feedback' },
  { id: 'media', label: 'Media', icon: FileText, path: '/dashboard/collaboration/media' },
  { id: 'canvas', label: 'Canvas', icon: Palette, path: '/dashboard/collaboration/canvas' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard/collaboration/analytics' }
]

export default function CollaborationLayout({ children }: CollaborationLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { announce } = useAnnouncer()

  const [quickActionsOpen, setQuickActionsOpen] = useState(false)

  // ============================================================================
  // HANDLER 1: NEW MESSAGE
  // ============================================================================

  const handleNewMessage = async () => {
    try {
      logger.info('New message initiated', {
        user: 'current-user',
        timestamp: new Date().toISOString()
      })

      toast.success('Message Composer Opened', {
        description: 'Start typing your message to the team'
      })

      announce('Message composer opened', 'polite')

      // Navigate to chat if not already there
      if (pathname !== '/dashboard/collaboration') {
        router.push('/dashboard/collaboration')
      }
    } catch (error) {
      logger.error('Failed to open message composer', { error })
      toast.error('Failed to Open Message', {
        description: 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 2: SCHEDULE MEETING
  // ============================================================================

  const handleScheduleMeeting = async () => {
    try {
      logger.info('Schedule meeting initiated', {
        user: 'current-user',
        timestamp: new Date().toISOString()
      })

      toast.success('Meeting Scheduler Opened', {
        description: 'Select date, time, and attendees for your meeting'
      })

      announce('Meeting scheduler opened', 'polite')

      // Navigate to meetings
      router.push('/dashboard/collaboration/meetings')
    } catch (error) {
      logger.error('Failed to open meeting scheduler', { error })
      toast.error('Failed to Open Scheduler', {
        description: 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 3: UPLOAD FILE
  // ============================================================================

  const handleUploadFile = async () => {
    try {
      logger.info('File upload initiated', {
        user: 'current-user',
        timestamp: new Date().toISOString()
      })

      toast.success('File Upload Ready', {
        description: 'Drag and drop files or click to browse'
      })

      announce('File upload dialog opened', 'polite')

      // Navigate to media
      router.push('/dashboard/collaboration/media')
    } catch (error) {
      logger.error('Failed to open file upload', { error })
      toast.error('Failed to Open Upload', {
        description: 'Please try again'
      })
    }
  }

  // ============================================================================
  // HANDLER 4: NOTIFICATIONS
  // ============================================================================

  const handleNotifications = async () => {
    try {
      logger.info('Notifications opened', {
        user: 'current-user',
        unreadCount: 8
      })

      toast.success('Notifications Center', {
        description: 'You have 8 unread notifications'
      })

      announce('Notifications center opened', 'polite')
    } catch (error) {
      logger.error('Failed to open notifications', { error })
      toast.error('Failed to Open Notifications', {
        description: 'Please try again'
      })
    }
  }

  // ============================================================================
  // TAB NAVIGATION HANDLER
  // ============================================================================

  const handleTabClick = (path: string, label: string) => {
    logger.info('Tab navigation', { path, label })
    announce(`Navigating to ${label}`, 'polite')
    router.push(path)
  }

  // Calculate stats
  const activeMembers = KAZI_COLLABORATION_DATA.analytics.teamActivity.activeMembers
  const messagesToday = KAZI_COLLABORATION_DATA.analytics.teamActivity.messagesThisWeek / 7
  const upcomingMeetings = KAZI_COLLABORATION_DATA.meetings.filter(
    (m) => m.status === 'scheduled'
  ).length
  const filesShared = KAZI_COLLABORATION_DATA.mediaFiles.filter((f) => f.isShared).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* ============================================================================
            HEADER SECTION
            ============================================================================ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Team Collaboration
              </TextShimmer>
              <p className="text-gray-600 mt-2 text-lg">
                Connect, communicate, and create together with your team
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleNotifications} data-testid="notifications-btn">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-2">8</Badge>
            </Button>
            <Button
              variant="outline"
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              data-testid="settings-btn"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* ============================================================================
            STATS CARDS
            ============================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <LiquidGlassCard variant="gradient" hoverEffect={true} className="relative overflow-hidden">
              <div className="p-6 text-center relative z-10">
                <div className="inline-flex p-3 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <NumberFlow
                  value={activeMembers}
                  className="text-2xl font-bold text-green-600 block"
                />
                <p className="text-gray-600">Active Members</p>
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
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <NumberFlow
                  value={Math.round(messagesToday)}
                  className="text-2xl font-bold text-blue-600 block"
                />
                <p className="text-gray-600">Messages Today</p>
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
                <div className="inline-flex p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <Video className="h-8 w-8 text-purple-600" />
                </div>
                <NumberFlow
                  value={upcomingMeetings}
                  className="text-2xl font-bold text-purple-600 block"
                />
                <p className="text-gray-600">Upcoming Meetings</p>
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
                <div className="inline-flex p-3 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-xl backdrop-blur-sm mb-4">
                  <FileText className="h-8 w-8 text-amber-600" />
                </div>
                <NumberFlow
                  value={filesShared}
                  className="text-2xl font-bold text-amber-600 block"
                />
                <p className="text-gray-600">Files Shared</p>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </div>

        {/* ============================================================================
            QUICK ACTIONS BAR
            ============================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Quick Actions</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleNewMessage}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                data-testid="quick-new-message-btn"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                New Message
              </Button>
              <Button
                onClick={handleScheduleMeeting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                data-testid="quick-schedule-meeting-btn"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button
                onClick={handleUploadFile}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                data-testid="quick-upload-file-btn"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ============================================================================
            TAB NAVIGATION
            ============================================================================ */}
        <div className="overflow-x-auto">
          <div className="inline-flex w-max min-w-full bg-white/60 backdrop-blur-xl border border-white/30 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              // Exact match for base path, startsWith for sub-routes
              const isActive =
                pathname === tab.path ||
                (tab.path !== '/dashboard/collaboration' && pathname.startsWith(tab.path))

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path, tab.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-md font-semibold'
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
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
    </div>
  )
}
