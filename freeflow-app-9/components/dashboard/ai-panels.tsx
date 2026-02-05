'use client'

/**
 * AI Panels Component
 *
 * Renders AI Intelligence and AI Activity panels as slide-in sidebars
 * Globally accessible from dashboard header
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain, Activity } from 'lucide-react'
import { useAIPanels } from '@/lib/ai-panels-context'
import { Button } from '@/components/ui/button'
import { AIInsightsPanel } from '@/components/ui/competitive-upgrades'
import { ActivityFeed } from '@/components/ui/competitive-upgrades-extended'
import type { ActivityItem } from '@/components/ui/competitive-upgrades-extended'

interface AIPanelsProps {
  userId?: string
}

// Mock data for AI Intelligence
const mockInsights = [
  {
    id: '1',
    type: 'opportunity' as const,
    title: 'Revenue Opportunity Detected',
    description: 'Based on client engagement patterns, 3 clients are ready for upsell conversations',
    priority: 'high' as const,
    impact: 'high' as const,
    confidence: 0.87,
    data: {
      clients: ['Acme Corp', 'TechStart Inc', 'Global Solutions'],
      estimated_revenue: '$45,000',
      recommendation: 'Schedule follow-up meetings this week'
    }
  },
  {
    id: '2',
    type: 'insight' as const,
    title: 'Project Velocity Increasing',
    description: 'Team productivity is up 23% compared to last month',
    priority: 'medium' as const,
    impact: 'medium' as const,
    confidence: 0.92,
    data: {
      metric: 'Tasks completed per day',
      previous: '8.3',
      current: '10.2',
      trend: 'positive'
    }
  },
  {
    id: '3',
    type: 'warning' as const,
    title: 'Resource Constraint Alert',
    description: 'Team capacity will be exceeded in 2 weeks at current project intake rate',
    priority: 'high' as const,
    impact: 'high' as const,
    confidence: 0.79,
    data: {
      current_capacity: '85%',
      projected_capacity: '112%',
      recommendation: 'Consider hiring or redistributing workload'
    }
  }
]

// Mock data for Activity Feed
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'create',
    title: 'created a new project',
    action: 'created',
    description: 'Website Redesign project has been initiated',
    user: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah Johnson'
    },
    target: {
      type: 'project',
      name: 'Website Redesign',
      url: '/dashboard/projects/1'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false
  },
  {
    id: '2',
    type: 'update',
    title: 'updated task status',
    action: 'updated',
    description: 'Design mockups moved to In Progress',
    user: {
      id: '2',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=John Doe'
    },
    target: {
      type: 'task',
      name: 'Design mockups',
      url: '/dashboard/tasks/1'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false
  },
  {
    id: '3',
    type: 'comment',
    title: 'commented on task',
    action: 'commented',
    description: 'Looks great! Just a few minor tweaks needed',
    user: {
      id: '3',
      name: 'Alice Smith',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alice Smith'
    },
    target: {
      type: 'task',
      name: 'Review designs',
      url: '/dashboard/tasks/2'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: true
  },
  {
    id: '4',
    type: 'milestone',
    title: 'achieved milestone',
    action: 'achieved',
    description: 'Q1 Revenue Target reached!',
    user: {
      id: '4',
      name: 'System',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=System'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    isRead: true,
    isPinned: true
  },
  {
    id: '5',
    type: 'assignment',
    title: 'assigned you to',
    action: 'assigned',
    description: 'You have been assigned to Mobile App Development',
    user: {
      id: '5',
      name: 'Bob Manager',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Bob Manager'
    },
    target: {
      type: 'project',
      name: 'Mobile App Development',
      url: '/dashboard/projects/2'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    isRead: false
  }
]

export function AIPanels({ userId }: AIPanelsProps) {
  const {
    isIntelligencePanelOpen,
    toggleIntelligencePanel,
    isActivityPanelOpen,
    toggleActivityPanel,
  } = useAIPanels()

  const handleIntelligenceQuery = (query: string) => {
    console.log('AI Intelligence Query:', query)
    // TODO: Implement AI query logic
  }

  const handleInsightAction = (insightId: string, action: string) => {
    console.log('Insight Action:', insightId, action)
    // TODO: Implement insight action logic
  }

  const handleMarkRead = (activityId: string) => {
    console.log('Mark Read:', activityId)
    // TODO: Implement mark read logic
  }

  const handleMarkAllRead = () => {
    console.log('Mark All Read')
    // TODO: Implement mark all read logic
  }

  const handlePin = (activityId: string) => {
    console.log('Pin Activity:', activityId)
    // TODO: Implement pin logic
  }

  const handleArchive = (activityId: string) => {
    console.log('Archive Activity:', activityId)
    // TODO: Implement archive logic
  }

  return (
    <>
      {/* AI Intelligence Panel */}
      <AnimatePresence>
        {isIntelligencePanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={toggleIntelligencePanel}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full md:w-[500px] z-50 bg-background border-l border-border shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">AI Intelligence</h2>
                      <p className="text-sm text-muted-foreground">
                        Natural language business insights
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleIntelligencePanel}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <AIInsightsPanel
                    insights={mockInsights}
                    onQuery={handleIntelligenceQuery}
                    onInsightAction={handleInsightAction}
                    className="border-0 shadow-none"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Activity Panel */}
      <AnimatePresence>
        {isActivityPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={toggleActivityPanel}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full md:w-[500px] z-50 bg-background border-l border-border shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">AI Activity</h2>
                      <p className="text-sm text-muted-foreground">
                        Real-time team activity feed
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleActivityPanel}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  <ActivityFeed
                    activities={mockActivities}
                    onMarkRead={handleMarkRead}
                    onMarkAllRead={handleMarkAllRead}
                    onPin={handlePin}
                    onArchive={handleArchive}
                    title="Activity Feed"
                    className="border-0 shadow-none h-full"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
