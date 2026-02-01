'use client'

/**
 * Activity Log Viewer
 * Real-time display of all logged activities and toast notifications
 * Shows the power of structured logging
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Activity,
  AlertCircle,
  XCircle,
  Info,
  Search,
  X,
  ChevronDown,
  Code,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

// Activity log entry type
interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  feature: string
  message: string
  context?: Record<string, any>
  icon?: string
}

// Mock activity log data (in production, this would come from logger)
const generateMockActivities = (): LogEntry[] => {
  const now = new Date()
  return [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 1000),
      level: 'info',
      feature: 'CodeBlock',
      message: 'Code copied to clipboard',
      context: { language: 'typescript', contentLength: 245 }
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 5000),
      level: 'info',
      feature: 'ContactSystem',
      message: 'Contact info copied',
      context: { item: 'General Inquiries', textLength: 28 }
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 12000),
      level: 'error',
      feature: 'RouteGuard',
      message: 'Auth check failed',
      context: { pathname: '/dashboard/admin', requireAuth: true }
    },
    {
      id: '4',
      timestamp: new Date(now.getTime() - 18000),
      level: 'info',
      feature: 'API-VideoIntelligence',
      message: 'Video processing completed',
      context: { videoId: 'vid_123', duration: '2.3s', scenes: 5 }
    },
    {
      id: '5',
      timestamp: new Date(now.getTime() - 25000),
      level: 'warn',
      feature: 'CostOptimization',
      message: 'Cost threshold exceeded',
      context: { resource: 'Function Executions', current: 1200, threshold: 1000 }
    },
    {
      id: '6',
      timestamp: new Date(now.getTime() - 32000),
      level: 'info',
      feature: 'API-VoiceSynthesis',
      message: 'Voice synthesis completed',
      context: { voice: 'alloy', speed: 1.0, format: 'mp3' }
    },
    {
      id: '7',
      timestamp: new Date(now.getTime() - 45000),
      level: 'error',
      feature: 'ErrorBoundarySystem',
      message: 'ErrorBoundary caught an error',
      context: {
        errorId: 'err-1234567890-abc123',
        level: 'component',
        name: 'DataTable'
      }
    },
    {
      id: '8',
      timestamp: new Date(now.getTime() - 52000),
      level: 'info',
      feature: 'Middleware',
      message: 'Edge metrics reported',
      context: { responseTime: 145, coldStart: false }
    }
  ]
}

const LEVEL_COLORS = {
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  warn: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  debug: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
}

const LEVEL_ICONS = {
  info: Info,
  warn: AlertCircle,
  error: XCircle,
  debug: Code
}

export function ActivityLogViewer() {
  const [activities, setActivities] = useState<LogEntry[]>(generateMockActivities())
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all')
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showContext, setShowContext] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)] as "info" | "warn" | "error",
        feature: ['CodeBlock', 'API-VideoIntelligence', 'ContactSystem'][Math.floor(Math.random() * 3)],
        message: 'New activity logged',
        context: { automated: true, timestamp: new Date().toISOString() }
      }
      setActivities(prev => [newActivity, ...prev].slice(0, 50))
    }, 10000) // New activity every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredActivities = activities
    .filter(activity => filter === 'all' || activity.level === filter)
    .filter(activity =>
      search === '' ||
      activity.message.toLowerCase().includes(search.toLowerCase()) ||
      activity.feature.toLowerCase().includes(search.toLowerCase())
    )

  const unreadCount = activities.filter(a => a.level === 'error').length

  return (
    <>
      {/* Floating Activity Bell Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        size="icon"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Activity Log Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] z-40 bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Activity Log</h2>
                      <p className="text-sm text-muted-foreground">
                        Real-time system activities
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowContext(!showContext)}
                  >
                    {showContext ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-4 gap-2 p-4 bg-muted/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{activities.filter(a => a.level === 'info').length}</div>
                  <div className="text-xs text-muted-foreground">Info</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{activities.filter(a => a.level === 'warn').length}</div>
                  <div className="text-xs text-muted-foreground">Warn</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{activities.filter(a => a.level === 'error').length}</div>
                  <div className="text-xs text-muted-foreground">Error</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{activities.filter(a => a.level === 'debug').length}</div>
                  <div className="text-xs text-muted-foreground">Debug</div>
                </div>
              </div>

              {/* Activities List */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredActivities.map((activity, index) => {
                      const LevelIcon = LEVEL_ICONS[activity.level]
                      const isExpanded = expandedId === activity.id

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
                              LEVEL_COLORS[activity.level]
                            } border`}
                            onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${LEVEL_COLORS[activity.level]}`}>
                                <LevelIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {activity.feature}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {activity.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm font-medium mb-2">{activity.message}</p>

                                {/* Context Data */}
                                {showContext && activity.context && (
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-3 pt-3 border-t border-border/50"
                                      >
                                        <div className="text-xs font-mono bg-black/20 rounded p-3 space-y-1">
                                          {Object.entries(activity.context).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                              <span className="text-muted-foreground">{key}:</span>
                                              <span className="font-semibold">
                                                {typeof value === 'object'
                                                  ? JSON.stringify(value)
                                                  : String(value)}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                )}

                                {!isExpanded && activity.context && showContext && (
                                  <div className="flex gap-1 flex-wrap mt-2">
                                    {Object.entries(activity.context).slice(0, 3).map(([key, value]) => (
                                      <Badge key={key} variant="secondary" className="text-xs">
                                        {key}: {String(value).substring(0, 20)}
                                      </Badge>
                                    ))}
                                    {Object.keys(activity.context).length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{Object.keys(activity.context).length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {filteredActivities.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No activities found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Showing {filteredActivities.length} of {activities.length} activities</span>
                  <Button variant="ghost" size="sm" onClick={() => setActivities([])}>
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
